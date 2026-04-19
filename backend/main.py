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
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

print(f"[STARTUP] GEMINI_API_KEY loaded: {'YES' if GEMINI_API_KEY else 'NO'}")

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
    return {"message": "Backend is running", "gemini_ready": bool(GEMINI_API_KEY)}

@app.post("/auth/signup")
def signup(user: UserSignup):
    try:
        if user.email in users_db:
            raise HTTPException(status_code=400, detail="User already exists")
        users_db[user.email] = {"name": user.name, "password": hash_password(user.password)}
        return {"message": "User created successfully"}
    except HTTPException:
        raise
    except Exception:
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
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")

@app.get("/dashboard")
def dashboard(user=Depends(verify_token)):
    return {"message": f"Welcome {user['sub']}", "status": "Access granted"}

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

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server")

    prompt = "Look at this health app screenshot and extract all visible health metrics. Return ONLY a JSON object with these exact keys, no markdown, no explanation: {\"age\":\"\",\"sex\":\"\",\"activityLevel\":\"\",\"albumin\":\"\",\"crp\":\"\",\"hba1c\":\"\",\"egfr\":\"\",\"rdw\":\"\",\"uricAcid\":\"\",\"restingHR\":\"\",\"dailySteps\":\"\",\"activeMinutes\":\"\",\"vo2max\":\"\",\"hrv\":\"\",\"recoveryScore\":\"\",\"sleepDuration\":\"\",\"sleepScore\":\"\",\"sleepDebt\":\"\"}. Rules: sleepScore=any sleep score number. dailySteps=steps count remove commas. hrv=HRV in ms number only. restingHR=resting heart rate only if labeled resting. sleepDuration=hours as decimal. recoveryScore=recovery or readiness percent. Leave empty string if not visible."

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"inline_data": {"mime_type": media_type, "data": image_data}}, {"text": prompt}]}],
                    "generationConfig": {"temperature": 0, "maxOutputTokens": 500}
                }
            )

        result = response.json()
        print("Gemini response:", result)

        if "error" in result:
            raise HTTPException(status_code=500, detail=f"Gemini error: {result['error'].get('message','Unknown')}")

        text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
        print("Text:", text)

        json_match = re.search(r'\{[^{}]+\}', text, re.DOTALL)
        if not json_match:
            raise HTTPException(status_code=422, detail=f"No JSON found: {text[:200]}")

        extracted = json.loads(json_match.group(0))
        filled = {k: v for k, v in extracted.items() if v not in ("", None)}

        return {"success": True, "data": extracted, "filled_count": len(filled), "filled_fields": list(filled.keys())}

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timed out. Try again.")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"JSON error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
