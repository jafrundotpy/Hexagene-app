from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os, json, re, httpx
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set")

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

def hash_password(p): return pwd_context.hash(p)
def verify_password(p, h): return pwd_context.verify(p, h)

def create_token(data):
    d = data.copy()
    d.update({"exp": datetime.utcnow() + timedelta(hours=2)})
    return jwt.encode(d, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def root(): return {"message": "Backend running", "gemini": bool(GEMINI_API_KEY)}

@app.post("/auth/signup")
def signup(user: UserSignup):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.email] = {"name": user.name, "password": hash_password(user.password)}
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Wrong password")
    return {"access_token": create_token({"sub": user.email}), "token_type": "bearer"}

@app.get("/dashboard")
def dashboard(user=Depends(verify_token)):
    return {"message": f"Welcome {user['sub']}", "status": "Access granted"}

@app.post("/register")
def register(user: UserSignup): return signup(user)

@app.post("/login")
def login_alias(user: UserLogin): return login(user)

@app.post("/extract-screenshot")
async def extract_screenshot(payload: dict):
    image_data = payload.get("image_data", "")
    media_type = payload.get("media_type", "image/jpeg")
    if not image_data:
        raise HTTPException(status_code=400, detail="No image provided")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [
                        {"inline_data": {"mime_type": media_type, "data": image_data}},
                        {"text": "Extract health metrics from this screenshot. Return ONLY JSON with these keys: age, sex, activityLevel, albumin, crp, hba1c, egfr, rdw, uricAcid, restingHR, dailySteps, activeMinutes, vo2max, hrv, recoveryScore, sleepDuration, sleepScore, sleepDebt. Use empty string if not found. Numbers as strings without units. dailySteps remove commas. sleepDuration in decimal hours. Only restingHR if labeled resting."}
                    ]}],
                    "generationConfig": {"temperature": 0, "maxOutputTokens": 500}
                }
            )
        result = r.json()
        if "error" in result:
            raise HTTPException(status_code=500, detail=f"Gemini error: {result['error']['message']}")
        text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        match = re.search(r'\{.*?\}', text, re.DOTALL)
        if not match:
            raise HTTPException(status_code=422, detail="No JSON in response")
        extracted = json.loads(match.group(0))
        filled = {k: v for k, v in extracted.items() if v not in ("", None)}
        return {"success": True, "data": extracted, "filled_count": len(filled), "filled_fields": list(filled.keys())}
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))