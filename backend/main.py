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
            raise HTTPException(status_code=500, detail="Anthropic API key not configured")

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
                                "text": """You are a health data extraction expert. Extract ALL health metrics visible in this wearable app screenshot.
Return ONLY a valid JSON object with these exact keys (use empty string if not visible):
age, sex, activityLevel, albumin, crp, hba1c, egfr, rdw, uricAcid, restingHR, dailySteps, activeMinutes, vo2max, hrv, recoveryScore, sleepDuration, sleepScore, sleepDebt.
Rules:
- sex: use M or F only
- All numeric values as strings
- activityLevel: estimate 1-5 from activity data if not explicit
- restingHR: look for resting heart rate or heart rate
- dailySteps: look for steps count
- hrv: look for HRV or heart rate variability
- sleepDuration: in hours as decimal
- recoveryScore: look for recovery or readiness score 0-100
Return ONLY the JSON. No explanation. No markdown."""
                            }
                        ]
                    }]
                }
            )

        result = response.json()
        text = result.get("content", [{}])[0].get("text", "{}")
        clean = text.strip().replace("```json", "").replace("```", "").strip()

        import json
        extracted = json.loads(clean)
        return {"success": True, "data": extracted}

    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Could not parse extracted data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Top-level aliases (for frontend compatibility)
@app.post("/register")
def register(user: UserSignup):
    return signup(user)

@app.post("/login")
def login_alias(user: UserLogin):
    return login(user)
