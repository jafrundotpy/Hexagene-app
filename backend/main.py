from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
import json
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")
print(f"[STARTUP] ANTHROPIC_API_KEY loaded: {'YES' if ANTHROPIC_API_KEY else 'NO'}")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set in .env")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer(auto_error=False)
users_db = {}

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=2)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing or invalid authentication header")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.post("/auth/signup")
def signup(user: UserSignup):
    try:
        if user.email in users_db:
            raise HTTPException(status_code=400, detail="User already exists")
        users_db[user.email] = {
            "name": user.name,
            "password": hash_password(user.password)
        }
        return {"message": "User created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Something went wrong")

@app.post("/auth/login")
def login(user: UserLogin):
    try:
        db_user = users_db.get(user.email)
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Wrong password")
        token = create_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Something went wrong")

@app.get("/dashboard")
def dashboard(user=Depends(verify_token)):
    return {
        "message": f"Welcome {user['sub']}",
        "status": "Access granted"
    }

@app.post("/register")
def register(user: UserSignup):
    return signup(user)

@app.post("/login")
def login_alias(user: UserLogin):
    return login(user)

@app.post("/extract-screenshot")
async def extract_screenshot(payload: dict):
    image_data = payload.get("image_data", "")
    media_type = payload.get("media_type", "image/jpeg")

    if not image_data:
        raise HTTPException(status_code=400, detail="No image data provided")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set on server. Add it in Render environment variables.")

    prompt = """You are looking at a health or fitness app screenshot. Your job is to find every number visible and map it to the correct field.

Look for these specific things:
- Steps count (any number followed by "steps")
- Sleep score (any score out of 100 related to sleep quality)
- Sleep duration (hours of sleep, convert to decimal e.g. 7h 24m = 7.4)
- Heart rate variability HRV in ms
- Resting heart rate (labeled as resting, not current or latest)
- Recovery score or readiness score as percentage
- Active minutes or exercise minutes
- VO2 Max value
- Sleep debt in hours
- Age if shown
- Sex M or F if shown
- Activity level 1 to 5 if shown
- Albumin, CRP, HbA1c, eGFR, RDW, Uric Acid if shown in lab results

For this Apple Health screenshot specifically:
- Sleep Score widget showing points = sleepScore field
- Steps widget = dailySteps field
- Heart Rate Variability Average ms = hrv field
- Resting Heart Rate = restingHR (only if labeled resting)
- Latest heart rate is NOT resting heart rate, ignore it for restingHR

Return ONLY this exact JSON and nothing else:
{"age":"","sex":"","activityLevel":"","albumin":"","crp":"","hba1c":"","egfr":"","rdw":"","uricAcid":"","restingHR":"","dailySteps":"","activeMinutes":"","vo2max":"","hrv":"","recoveryScore":"","sleepDuration":"","sleepScore":"","sleepDebt":""}

Fill in the values you can see. Leave empty string for anything not visible. Numbers only as strings. No units."""

    try:
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": media_type,
                                    "data": image_data
                                }
                            },
                            {
                                "text": """Look carefully at every number and label in this health app screenshot. Extract whatever health metrics are visible.

Map what you find to these fields:
- sleepScore: any sleep score number shown (e.g. 77 points = "77")
- sleepDuration: if sleep hours shown convert to decimal hours (e.g. 7h 30m = "7.5"), if only score shown leave empty
- dailySteps: any steps count (e.g. 1,850 steps = "1850")
- restingHR: resting heart rate in BPM if labeled as resting, else leave empty
- hrv: heart rate variability in ms (e.g. 53 ms = "53")
- recoveryScore: any recovery or readiness percentage
- activeMinutes: active minutes if shown
- vo2max: VO2 max if shown
- age: ""
- sex: ""
- activityLevel: ""
- albumin: ""
- crp: ""
- hba1c: ""
- egfr: ""
- rdw: ""
- uricAcid: ""
- sleepDebt: ""

Return ONLY this exact JSON and nothing else, no markdown, no explanation:
{\"age\":\"\",\"sex\":\"\",\"activityLevel\":\"\",\"albumin\":\"\",\"crp\":\"\",\"hba1c\":\"\",\"egfr\":\"\",\"rdw\":\"\",\"uricAcid\":\"\",\"restingHR\":\"\",\"dailySteps\":\"\",\"activeMinutes\":\"\",\"vo2max\":\"\",\"hrv\":\"\",\"recoveryScore\":\"\",\"sleepDuration\":\"\",\"sleepScore\":\"\",\"sleepDebt\":\"\"}"""
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0,
                        "maxOutputTokens": 500
                    }
                }
            )

        result = response.json()
        print("Gemini raw response:", result)

        if "error" in result:
            error_msg = result["error"].get("message", "Unknown Anthropic error")
            raise HTTPException(status_code=500, detail=f"Anthropic API error: {error_msg}")

        text = result.get("content", [{}])[0].get("text", "").strip()
        print("Extracted text:", text)

        json_match = re.search(r'\{[^{}]+\}', text, re.DOTALL)
        if not json_match:
            raise HTTPException(status_code=422, detail=f"Could not find JSON in response: {text[:200]}")

        extracted = json.loads(json_match.group(0))
        filled = {k: v for k, v in extracted.items() if v not in ("", None)}
        print("Filled fields:", filled)

        return {
            "success": True,
            "data": extracted,
            "filled_count": len(filled),
            "filled_fields": list(filled.keys())
        }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out. Try again.")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"JSON parse failed: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))