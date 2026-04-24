"""
HexaGene API — Production Backend
==================================

POST /api/analyze
Headers: x-api-key: hx_xxxxx
Body:
{
  "patient_data": {
    "age": 38,
    "sex": "F",
    "crp": 1.6,
    "hba1c": 5.8,
    "albumin": 4.2,
    "egfr": 90,
    "rdw": 13.0,
    "uric_acid": 5.0
  }
}

Example cURL:
curl -X POST "https://hexagene-app.onrender.com/api/analyze" \
  -H "x-api-key: hx_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_data": {
      "age": 38,
      "sex": "F",
      "crp": 1.6,
      "hba1c": 5.8,
      "albumin": 4.2,
      "egfr": 90,
      "rdw": 13.0,
      "uric_acid": 5.0
    }
  }'
"""

from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os, uuid, secrets, time
from collections import defaultdict

import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase_client import supabase
import re
import tempfile
import shutil
import sys
sys.path.append(str(Path(__file__).resolve().parent))

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
# RATE LIMITER (in-memory)
# Max 100 req/min per API key
# -----------------------------
_rate_limit_store: dict = defaultdict(list)
RATE_LIMIT = 100
RATE_WINDOW = 60  # seconds

def check_rate_limit(api_key: str):
    now = time.time()
    window_start = now - RATE_WINDOW
    # Prune old timestamps
    _rate_limit_store[api_key] = [t for t in _rate_limit_store[api_key] if t > window_start]
    if len(_rate_limit_store[api_key]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={"success": False, "message": "Rate limit exceeded. Max 100 requests per minute."}
        )
    _rate_limit_store[api_key].append(now)

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
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "Missing API key"}
        )

    res = supabase.table("api_keys").select("*").eq("api_key", x_api_key).execute()

    if not res.data:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "Invalid API key"}
        )

    check_rate_limit(x_api_key)
    return res.data[0]  # contains user_id

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
    import traceback

    user_id = str(uuid.uuid4())
    key = "hx_" + uuid.uuid4().hex
    random_email = f"demo_{uuid.uuid4().hex[:8]}@hexagene.com"

    try:
        supabase.table("users").insert({
            "id": user_id,
            "email": random_email,
            "name": "API Key User",
            "password": "no_password"
        }).execute()

        supabase.table("api_keys").insert({
            "api_key": key,
            "user_id": user_id
        }).execute()

        return {"api_key": key}
    except Exception as e:
        print("GENERATE KEY ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# -----------------------------
# ANALYZE (ADVANCED ENGINE)
# -----------------------------
@app.post("/api/analyze")
async def analyze(request: AnalysisRequest, key_data=Depends(verify_api_key)):
    try:
        data = request.patient_data
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

    logger.info(f"Input data: {data}")

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
    rdw = safe_float(data.get("rdw"), 13.0)
    uric_acid = safe_float(data.get("uric_acid") or data.get("uricAcid"), 5.0)

    # -----------------------------
    # BASE SCORES
    # -----------------------------
    inflammatory = clamp(100 - (crp * 20))
    metabolic = clamp(100 - (hba1c * 10))
    structural = clamp(albumin * 20)
    kinetic = clamp(egfr)
    redox = clamp(100 - (rdw * 5))
    balance = clamp(100 - (uric_acid * 10))

    # -----------------------------
    # RELATIONSHIPS (CORE LOGIC)
    # -----------------------------
    metabolic -= (inflammatory * 0.1)
    kinetic -= (inflammatory * 0.1)
    redox -= (inflammatory * 0.15)
    balance -= (metabolic * 0.05)

    # Clamp again after interactions
    inflammatory = clamp(inflammatory)
    metabolic = clamp(metabolic)
    structural = clamp(structural)
    kinetic = clamp(kinetic)
    redox = clamp(redox)
    balance = clamp(balance)

    # -----------------------------
    # WEIGHT SYSTEM
    # -----------------------------
    weights = {
        "structural": 0.15,
        "inflammatory": 0.20,
        "metabolic": 0.20,
        "redox": 0.15,
        "kinetic": 0.15,
        "balance": 0.15
    }

    risk_score = (
        structural * weights["structural"] +
        inflammatory * weights["inflammatory"] +
        metabolic * weights["metabolic"] +
        redox * weights["redox"] +
        kinetic * weights["kinetic"] +
        balance * weights["balance"]
    )

    risk_score = round(clamp(risk_score), 2)

    status = (
        "Optimal" if risk_score > 80 else
        "Moderate" if risk_score > 60 else
        "At Risk"
    )

    s21_state = status.lower().replace(" ", "_")

    logger.info(f"Computed risk_score={risk_score}, status={status}")

    # -----------------------------
    # STANDARDIZED RESPONSE
    # -----------------------------
    return {
        "success": True,
        "risk_score": risk_score,
        "axes": {
            "inflammatory": round(inflammatory, 2),
            "metabolic": round(metabolic, 2),
            "redox": round(redox, 2),
            "kinetic": round(kinetic, 2),
            "balance": round(balance, 2),
            "structural": round(structural, 2),
        },
        "s21_state": s21_state,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

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