from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

app = FastAPI()

# ✅ CORS FIX (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 SECRET CONFIG
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set in .env")

# 🔒 Password hashing
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

# 🔐 Token security
security = HTTPBearer(auto_error=False)

# 🗄️ Fake DB (temporary)
users_db = {}

# ------------------ MODELS ------------------

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# ------------------ HELPERS ------------------

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

# ------------------ ROUTES ------------------

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

# 🔐 SIGNUP
@app.post("/auth/signup")
def signup(user: UserSignup):
    print(f"--> [DEBUG] /auth/signup endpoint hit! Email: {user.email}")
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
        print("Signup Error:", str(e))  # Debug
        raise HTTPException(status_code=400, detail="Something went wrong")

# 🔐 LOGIN
@app.post("/auth/login")
def login(user: UserLogin):
    print(f"--> [DEBUG] /auth/login endpoint hit! Email: {user.email}")
    try:
        db_user = users_db.get(user.email)

        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")

        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Wrong password")

        token = create_token({"sub": user.email})

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Login Error:", str(e))  # Debug
        raise HTTPException(status_code=400, detail="Something went wrong")

# 🔒 PROTECTED ROUTE
@app.get("/dashboard")
def dashboard(user=Depends(verify_token)):
    return {
        "message": f"Welcome {user['sub']} 🎉",
        "status": "Access granted"
    }

# 🧬 SCREENSHOT EXTRACTION
@app.post("/extract-screenshot")
async def extract_screenshot(payload: dict):
    try:
        image_data = payload.get("image_data", "")
        media_type = payload.get("media_type", "image/jpeg")

        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")

        if not ANTHROPIC_API_KEY:
            raise HTTPException(status_code=500, detail="Anthropic API key not configured on server")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-opus-4-5",
                    "max_tokens": 1000,
                    "messages": [{
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_data
                                }
                            },
                            {
                                "type": "text",
                                "text": """Look carefully at every number and label in this health app screenshot. Extract whatever health metrics are visible.

Map what you find to these fields:
- sleepScore: any sleep score number shown (e.g. 77 points = \"77\")
- sleepDuration: if sleep hours shown convert to decimal hours (e.g. 7h 30m = \"7.5\"), if only score shown leave empty
- dailySteps: any steps count (e.g. 1,850 steps = \"1850\")
- restingHR: resting heart rate in BPM if labeled as resting, else leave empty
- hrv: heart rate variability in ms (e.g. 53 ms = \"53\")
- recoveryScore: any recovery or readiness percentage
- activeMinutes: active minutes if shown
- vo2max: VO2 max if shown
- age: \"\"
- sex: \"\"
- activityLevel: \"\"
- albumin: \"\"
- crp: \"\"
- hba1c: \"\"
- egfr: \"\"
- rdw: \"\"
- uricAcid: \"\"
- sleepDebt: \"\"

Important rules:
- If heart rate shows \"Latest 122 BPM\" that is NOT resting HR, leave restingHR empty
- Only extract numbers that are clearly labeled
- Return ONLY a JSON object, nothing else, no markdown, no explanation

Example output format:
{"age":"","sex":"","activityLevel":"","albumin":"","crp":"","hba1c":"","egfr":"","rdw":"","uricAcid":"","restingHR":"","dailySteps":"1850","activeMinutes":"","vo2max":"","hrv":"53","recoveryScore":"","sleepDuration":"","sleepScore":"77","sleepDebt":""}"
                            }
                        ]
                    }]
                }
            )

        result = response.json()

        if "error" in result:
            raise HTTPException(status_code=500, detail=f"Claude API error: {result['error'].get('message','Unknown error')}")

        text = result.get("content", [{}])[0].get("text", "").strip()

        import json
        import re

        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if not json_match:
            raise HTTPException(status_code=422, detail="No JSON found in AI response")

        clean = json_match.group(0)
        extracted = json.loads(clean)

        filled = {k: v for k, v in extracted.items() if v != "" and v is not None}

        return {
            "success": True,
            "data": extracted,
            "filled_count": len(filled),
            "filled_fields": list(filled.keys())
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"JSON parse error: {str(e)}")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI extraction timed out. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Top-level aliases (for frontend compatibility)
@app.post("/register")
def register(user: UserSignup):
    return signup(user)

@app.post("/login")
def login_alias(user: UserLogin):
    return login(user)
