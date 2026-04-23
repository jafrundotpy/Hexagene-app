from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os, json, re, uuid, secrets, base64 as b64lib
try:
    import httpx
except Exception as e:
    httpx = None
    print(f"Warning: Failed to import httpx: {e}")
import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase_client import supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env from the backend folder (same as supabase_client.py)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")
app = FastAPI(title="HexaGene API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup_event():
    logger.info("Starting HexaGene API...")
    logger.info("Supabase client is ready.")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set")

security = HTTPBearer(auto_error=False)

# --- MODELS ---
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AnalysisRequest(BaseModel):
    patient_data: dict

# --- HELPERS ---
def hash_password(p: str) -> str:
    encoded = p.encode("utf-8")[:72]
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")

def verify_password(p: str, h: str) -> bool:
    encoded = p.encode("utf-8")[:72]
    return bcrypt.checkpw(encoded, h.encode("utf-8"))

def create_token(data):
    d = data.copy()
    d.update({"exp": datetime.now(timezone.utc) + timedelta(hours=24)})
    return jwt.encode(d, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key missing")
    
    if supabase is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Use official supabase client syntax
        res = supabase.table("api_keys").select("*").execute()
        keys = res.data
        valid_key = next((k for k in keys if k["api_key"] == x_api_key), None)
        if not valid_key:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return valid_key
    except Exception as e:
        logger.error(f"Database error in verify_api_key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def extract_metrics_from_text(text):
    text = text.lower()
    result = {
        "age":"","sex":"","activityLevel":"","albumin":"","crp":"","hba1c":"",
        "egfr":"","rdw":"","uricAcid":"","restingHR":"","dailySteps":"",
        "activeMinutes":"","vo2max":"","hrv":"","recoveryScore":"",
        "sleepDuration":"","sleepScore":"","sleepDebt":""
    }
    steps = re.search(r'([\d,]+)\s*steps', text); 
    if steps: result["dailySteps"] = steps.group(1).replace(",","")
    sleep_score = re.search(r'sleep\s*score.*?(\d+)\s*points?|(\d+)\s*points?\s*.*?sleep', text)
    if sleep_score: result["sleepScore"] = sleep_score.group(1) or sleep_score.group(2)
    hrv = re.search(r'(?:hrv|heart rate variability).*?(\d+)\s*ms|(\d+)\s*ms.*?(?:hrv|heart rate variability)', text)
    if hrv: result["hrv"] = hrv.group(1) or hrv.group(2)
    resting = re.search(r'resting\s*(?:heart rate|hr).*?(\d+)\s*bpm', text)
    if resting: result["restingHR"] = resting.group(1)
    return result

# --- ENDPOINTS ---

@app.post("/auth/signup")
async def signup(user: UserSignup):
    try:
        # Check if user already exists (filtered query — no full table scan)
        existing = supabase.table("users").select("id").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        new_user = {
            "id": str(uuid.uuid4()),
            "name": user.name,
            "email": user.email,
            "password": hash_password(user.password),
        }
        result = supabase.table("users").insert(new_user).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Insert returned no data — check RLS and table schema")
        return {"message": "User created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def login(user: UserLogin):
    try:
        res = supabase.table("users").select("id, name, email, password").eq("email", user.email).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        db_user = res.data[0]

        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token({"sub": db_user["email"], "id": db_user["id"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"name": db_user["name"], "email": db_user["email"]}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-key")
async def generate_key(user=Depends(get_current_user)):
    try:
        new_key = f"hx_{secrets.token_urlsafe(32)}"
        supabase.table("api_keys").insert({"user_id": user["id"], "api_key": new_key}).execute()
        return {"api_key": new_key}
    except Exception as e:
        logger.error(f"Generate key error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/keys")
async def get_keys(user=Depends(get_current_user)):
    try:
        res = supabase.table("api_keys").select("*").execute()
        all_keys = res.data
        return [k for k in all_keys if k["user_id"] == user["id"]]
    except Exception as e:
        logger.error(f"Get keys error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/keys/{key_id}")
async def revoke_key(key_id: str, user=Depends(get_current_user)):
    try:
        supabase.table("api_keys").delete().eq("id", key_id).execute()
        return {"message": "Key revoked"}
    except Exception as e:
        logger.error(f"Revoke key error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze(request: AnalysisRequest, key_data=Depends(verify_api_key)):
    try:
        supabase.table("usage_logs").insert({"user_id": key_data["user_id"], "endpoint": "/api/analyze"}).execute()
        return {
            "success": True,
            "result": {"risk_score": 0.2, "status": "Optimized"},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Analyze error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-screenshot")
async def extract_screenshot(payload: dict):
    image_data = payload.get("image_data", "")
    if not image_data: raise HTTPException(status_code=400, detail="No image")
    try:
        img_bytes = b64lib.b64decode(image_data)
        try:
            from PIL import Image
            import io, pytesseract
            img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(img)
        except:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post("https://api.ocr.space/parse/image", data={
                    "apikey": "helloworld",
                    "base64Image": f"data:image/jpeg;base64,{image_data}",
                    "language": "eng"
                })
                text = r.json()["ParsedResults"][0]["ParsedText"]
        extracted = extract_metrics_from_text(text)
        return {"success": True, "data": extracted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root(): return {"status": "HexaGene API Running", "python_version": "3.14.x"}

if __name__ == "__main__":
    import uvicorn
    try:
        logger.info("Starting server via main.py...")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        logger.critical(f"Server failed to start: {e}")