from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os, uuid, secrets

import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase_client import supabase
import pytesseract
from PIL import Image
import io
import re

# -----------------------------
# CONFIG
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

app = FastAPI(title="HexaGene API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set")

security = HTTPBearer(auto_error=False)

# -----------------------------
# MODELS
# -----------------------------
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AnalysisRequest(BaseModel):
    patient_data: dict

# -----------------------------
# HELPERS
# -----------------------------
def clamp(value):
    return max(0, min(100, value))

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode("utf-8")[:72], h.encode("utf-8"))

def create_token(data):
    d = data.copy()
    d.update({"exp": datetime.now(timezone.utc) + timedelta(hours=24)})
    return jwt.encode(d, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_api_key(x_api_key: str = Header(None)):
    print("API KEY:", x_api_key)
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")

    res = supabase.table("api_keys").select("*").eq("api_key", x_api_key).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    return res.data[0]  # contains user_id (VALID UUID)

# -----------------------------
# AUTH
# -----------------------------
@app.post("/auth/signup")
async def signup(user: UserSignup):
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)

    try:
        supabase.table("users").insert({
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "password": hashed_pw
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"user_id": user_id}

@app.post("/auth/login")
async def login(user: UserLogin):
    res = supabase.table("users").select("*").eq("email", user.email).execute()
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

# -----------------------------
# API KEY
# -----------------------------
@app.post("/api/generate-key")
async def generate_key():
    import uuid
    import traceback

    # create valid UUID user
    user_id = str(uuid.uuid4())
    key = "hx_" + uuid.uuid4().hex
    random_email = f"demo_{uuid.uuid4().hex[:8]}@hexagene.com"

    try:
        # insert user
        supabase.table("users").insert({
            "id": user_id,
            "email": random_email,
            "name": "API Key User",
            "password": "no_password"
        }).execute()

        # insert API key linked to user
        supabase.table("api_keys").insert({
            "api_key": key,
            "user_id": user_id
        }).execute()

        return {"api_key": key}
    except Exception as e:
        print("GENERATE KEY ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

# -----------------------------
# ANALYZE (ADVANCED ENGINE)
# -----------------------------
@app.post("/api/analyze")
async def analyze(request: dict, key_data=Depends(verify_api_key)):
    try:
        return run_analysis_logic(key_data, data)

    except Exception as e:
        logger.error(f"Analyze error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def run_analysis_logic(key_data, data):
    # -----------------------------
    # LOGGING (SAFE)
    # -----------------------------
    try:
        supabase.table("usage_logs").insert({
            "user_id": key_data["user_id"],
            "endpoint": "/api/analyze"
        }).execute()
    except Exception as e:
        print("LOG ERROR:", e)

    def safe_float(val, default):
        try:
            if val is None or val == "":
                return default
            return float(val)
        except (ValueError, TypeError):
            return default

    try:
        hba1c_raw = data.get("hba1c")
        crp_raw = data.get("crp")
        
        if hba1c_raw is None or crp_raw is None or hba1c_raw == "" or crp_raw == "":
            hba1c = 5.9
            crp = 2.1
        else:
            hba1c = float(hba1c_raw)
            crp = float(crp_raw)
    except (ValueError, TypeError):
        hba1c = 5.9
        crp = 2.1

    albumin = safe_float(data.get("albumin"), 4.0)
    egfr = safe_float(data.get("egfr"), 90.0)
    triglycerides = safe_float(data.get("triglycerides"), 120.0)
    rdw = safe_float(data.get("rdw"), 13.0)
    uric_acid = safe_float(data.get("uric_acid"), 5.0)

    # -----------------------------
    # BASE SCORES
    # -----------------------------
    inflammation = clamp(100 - (crp * 20))
    metabolism = clamp(100 - (hba1c * 10))
    structural = clamp(albumin * 20)
    organ = clamp(egfr)
    cellular = clamp(100 - (rdw * 5))
    biochemical = clamp(100 - (uric_acid * 10))

    # -----------------------------
    # RELATIONSHIPS (CORE LOGIC)
    # -----------------------------
    metabolism -= (inflammation * 0.1)
    organ -= (inflammation * 0.1)
    cellular -= (inflammation * 0.15)

    biochemical -= (metabolism * 0.05)

    # Clamp again after interactions
    inflammation = clamp(inflammation)
    metabolism = clamp(metabolism)
    structural = clamp(structural)
    organ = clamp(organ)
    cellular = clamp(cellular)
    biochemical = clamp(biochemical)

    # -----------------------------
    # WEIGHT SYSTEM
    # -----------------------------
    weights = {
        "structural": 0.15,
        "inflammation": 0.20,
        "metabolism": 0.20,
        "cellular": 0.15,
        "organ": 0.15,
        "biochemical": 0.15
    }

    final_score = (
        structural * weights["structural"] +
        inflammation * weights["inflammation"] +
        metabolism * weights["metabolism"] +
        cellular * weights["cellular"] +
        organ * weights["organ"] +
        biochemical * weights["biochemical"]
    )

    final_score = round(clamp(final_score), 2)

    # -----------------------------
    # RESPONSE
    # -----------------------------
    result = {
        "health_score": final_score,
        "axes": {
            "structural_integrity": round(structural, 2),
            "inflammation": round(inflammation, 2),
            "metabolism": round(metabolism, 2),
            "cellular_stress": round(cellular, 2),
            "organ_function": round(organ, 2),
            "biochemical_balance": round(biochemical, 2)
        },
        "status": (
            "Optimal" if final_score > 80 else
            "Moderate" if final_score > 60 else
            "At Risk"
        )
    }

    return {
        "success": True,
        "result": result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# -----------------------------
# IMAGE OCR ANALYZE
# -----------------------------
@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...), x_api_key: str = Header(None)):
    key_data = await verify_api_key(x_api_key)
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Use Tesseract OCR
        text = pytesseract.image_to_string(image)
        
        # Regex patterns to find specific values
        patterns = {
            "sleepDuration": r"(?i)sleep.*?(\d+(?:\.\d+)?)",
            "dailySteps": r"(?i)steps.*?(\d{1,3}(?:,\d{3})*|\d+)",
            "restingHR": r"(?i)resting.*?hr.*?(\d+)",
            "hrv": r"(?i)hrv.*?(\d+)",
            "activeMinutes": r"(?i)active.*?(\d+)",
            "vo2max": r"(?i)vo2.*?(\d+)"
        }
        
        extracted_data = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, text)
            if match:
                val = match.group(1).replace(',', '')
                extracted_data[key] = val
                
        patient_data = {
            "sleepDuration": extracted_data.get("sleepDuration", "7.5"),
            "dailySteps": extracted_data.get("dailySteps", "6000"),
            "restingHR": extracted_data.get("restingHR", "60"),
            "hrv": extracted_data.get("hrv", "50"),
            "activeMinutes": extracted_data.get("activeMinutes", "30"),
            "vo2max": extracted_data.get("vo2max", "35"),
            "age": "30",
            "sex": "M",
            "albumin": "4.2",
            "crp": "1.5",
            "hba1c": "5.4",
            "egfr": "90",
            "rdw": "13.0",
            "uricAcid": "5.0",
            "recoveryScore": "75",
            "sleepScore": "80",
            "sleepDebt": "0"
        }
        
        # Merge extracted data over defaults
        for k, v in extracted_data.items():
            patient_data[k] = v

        response = run_analysis_logic(key_data, patient_data)
        response["extracted_data"] = extracted_data
        return response

    except Exception as e:
        logger.error(f"Image analyze error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def root():
    return {"status": "HexaGene API Running"}

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)