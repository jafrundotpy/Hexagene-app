"""
HexaGene API — Production Backend
==================================
Merged with Boss Backend Engine.
"""

import logging
import os
import time
import uuid
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any, Union

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Header,
    Request,
    status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from supabase_client import supabase

import sys
sys.path.append(str(Path(__file__).resolve().parent))

from utils.api_key import generate_api_key, hash_api_key

# =====================================================
# CONFIG & LOGGING
# =====================================================

LOG_LEVEL = os.getenv("HEXAGENE_LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("hexagene")

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY missing")

# =====================================================
# BOSS ENGINE IMPORTS
# =====================================================

_READY = {"ok": True}

from schemas import (
    HealthResponse,
    IntakeInput,
    IntakeResponse,
    PatientInput,
    VersionResponse,
)
from engine_demo import BUILD, ENGINE, KERNEL_DESC, VERSION, patient_report
from intake_demo import merge_patient
from clinical_report_demo import generate_clinical_report

# =====================================================
# APP LIFECYCLE
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("hexagene production starting build=%s version=%s", BUILD, VERSION)
    if _READY["ok"]:
        logger.info("Engine loaded successfully.")
    yield
    logger.info("hexagene shutdown")

app = FastAPI(
    title="HexaGene API",
    version=VERSION,
    description="Stateless deterministic patient scoring service.",
    lifespan=lifespan,
)

# =====================================================
# SAFE ERROR HANDLER
# =====================================================

@app.exception_handler(Exception)
async def safe_error_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        content = exc.detail if isinstance(exc.detail, dict) else {
            "success": False,
            "message": str(exc.detail)
        }
        return JSONResponse(
            status_code=exc.status_code,
            content=content,
            headers=getattr(exc, "headers", None) or {}
        )

    error_id = getattr(request.state, "request_id", str(uuid.uuid4())[:8])
    logger.error(f"[{error_id}] Unhandled exception: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error_id": error_id
        }
    )

# =====================================================
# MIDDLEWARE: BODY SIZE LIMIT & REQUEST LOGGING
# =====================================================

_MAX_BODY = 1 * 1024 * 1024  # 1 MB

@app.middleware("http")
async def body_size_limit(request: Request, call_next):
    if request.method == "POST":
        cl = request.headers.get("content-length")
        if cl and cl.isdigit() and int(cl) > _MAX_BODY:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"error": "request too large", "max_bytes": _MAX_BODY},
            )
    return await call_next(request)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    request.state.request_id = rid
    t0 = time.perf_counter()

    response = await call_next(request)

    elapsed = round((time.perf_counter() - t0) * 1000, 2)
    response.headers["x-request-id"] = rid
    
    logger.info(
        "rid=%s method=%s path=%s status=%s latency_ms=%s",
        rid, request.method, request.url.path, response.status_code, elapsed,
    )

    try:
        supabase.table("usage_logs").insert({
            "endpoint": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "latency_ms": elapsed
        }).execute()
    except Exception as e:
        logger.warning(f"Log insert failed: {e}")

    return response

# =====================================================
# CORS
# =====================================================

_CORS_ORIGINS = os.getenv("HEXAGENE_CORS_ORIGINS", "https://hexagene-app.vercel.app,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _CORS_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# =====================================================
# SECURITY & RATE LIMITER
# =====================================================

security = HTTPBearer(auto_error=False)

_RATE_LIMIT   = 20   # max requests per window
_RATE_WINDOW  = 60   # seconds
_BURST_LIMIT  = 3    # max requests per burst window
_BURST_WINDOW = 2    # seconds

class _RateLimiter:
    def __init__(self):
        self._store: Dict[str, list] = {}
        self._lock = threading.Lock()

    def check(self, user_id: str) -> None:
        now = time.time()
        with self._lock:
            timestamps = self._store.get(user_id, [])
            timestamps = [t for t in timestamps if t > now - _RATE_WINDOW]

            if len(timestamps) >= _RATE_LIMIT:
                raise HTTPException(
                    status_code=429,
                    headers={"Retry-After": str(_RATE_WINDOW)},
                    detail={
                        "success": False,
                        "error": "rate_limit_exceeded",
                        "message": f"Rate limit exceeded: max {_RATE_LIMIT} requests per {_RATE_WINDOW}s.",
                        "retry_after_seconds": _RATE_WINDOW
                    }
                )

            burst = [t for t in timestamps if t > now - _BURST_WINDOW]
            if len(burst) >= _BURST_LIMIT:
                raise HTTPException(
                    status_code=429,
                    headers={"Retry-After": str(_BURST_WINDOW)},
                    detail={
                        "success": False,
                        "error": "burst_limit_exceeded",
                        "message": f"Too many rapid requests: max {_BURST_LIMIT} per {_BURST_WINDOW}s.",
                        "retry_after_seconds": _BURST_WINDOW
                    }
                )

            timestamps.append(now)
            self._store[user_id] = timestamps

_rate_limiter = _RateLimiter()

# =====================================================
# MODELS (Legacy & Auth)
# =====================================================

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AnalysisRequest(BaseModel):
    patient_data: Dict[str, Any]

class WearableScoreRequest(BaseModel):
    user_id: str

# =====================================================
# HELPERS
# =====================================================

def clamp(value):
    return max(0, min(100, value))

def hash_password(password: str) -> str:
    import bcrypt
    return bcrypt.hashpw(
        password.encode("utf-8")[:72],
        bcrypt.gensalt()
    ).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    import bcrypt
    return bcrypt.checkpw(
        password.encode("utf-8")[:72],
        hashed.encode("utf-8")
    )

def create_token(data):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def fetch_latest_wearable(user_id: str) -> dict:
    res = supabase.table("wearable_metrics").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="No wearable metrics found for user")
    return res.data[0]

def wearable_to_patient_input(row: dict) -> dict:
    blood = {
        "kinetic_index": float(row.get("daily_steps") if row.get("daily_steps") is not None else 0),
        "pulse_rest": float(row.get("resting_heart_rate") if row.get("resting_heart_rate") is not None else 70),
        "recovery_sleep": float(row.get("avg_sleep_hours") if row.get("avg_sleep_hours") is not None else 7),
        "autonomic_balance": float(row.get("hrv") if row.get("hrv") is not None else 50),
        "stress_load": float(row.get("stress_score") if row.get("stress_score") is not None else 30),
        "oxygen_status": float(row.get("spo2") if row.get("spo2") is not None else 98),
        "energy_output": float(row.get("calories_burned") if row.get("calories_burned") is not None else 300),
        "movement_minutes": float(row.get("active_minutes") if row.get("active_minutes") is not None else 20),
    }
    return {
        "age": row.get("age"),
        "sex": row.get("sex"),
        "blood": blood,
        "medications": [],
        "variants": []
    }

# =====================================================
# AUTH MIDDLEWARE
# =====================================================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Missing API key"})

    hashed_incoming = hash_api_key(x_api_key)
    res = supabase.table("api_keys").select("*").eq("api_key", hashed_incoming).eq("is_active", True).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Invalid API key"})

    key_data = res.data[0]
    usage_count = key_data.get("usage_count", 0) or 0
    monthly_limit = key_data.get("monthly_limit", 10000) or 10000

    if usage_count >= monthly_limit:
        raise HTTPException(status_code=429, detail={"success": False, "message": "Monthly quota exceeded."})

    _rate_limiter.check(key_data["user_id"])
    return key_data

def _increment_usage(key_data):
    current_count = key_data.get("usage_count", 0) or 0
    supabase.table("api_keys").update({"usage_count": current_count + 1}).eq("user_id", key_data["user_id"]).execute()

# =====================================================
# AUTH & USER ROUTES
# =====================================================

@app.post("/auth/signup")
async def signup(user: UserSignup):
    user_id = str(uuid.uuid4())
    try:
        supabase.table("users").insert({
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "password": hash_password(user.password)
        }).execute()
        return {"success": True, "user_id": user_id}
    except Exception as e:
        error_msg = str(e)
        if "23505" in error_msg or "users_email_key" in error_msg:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=error_msg)

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

@app.post("/api/generate-key")
async def generate_api_key_route(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["id"]
        supabase.table("api_keys").delete().eq("user_id", user_id).execute()
        
        raw_key = generate_api_key()
        hashed_key = hash_api_key(raw_key)

        supabase.table("api_keys").insert({
            "user_id": user_id,
            "api_key": hashed_key,
            "usage_count": 0,
            "monthly_limit": 10000,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()

        return {"success": True, "api_key": raw_key, "message": "Save this now. It won't be shown again."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/keys")
async def get_user_keys(current_user=Depends(get_current_user)):
    try:
        res = supabase.table("api_keys").select("*").eq("user_id", current_user["id"]).eq("is_active", True).execute()
        keys = [{
            "api_key": k["api_key"],
            "usage": k.get("usage_count", 0),
            "limit": k.get("monthly_limit", 10000),
            "created_at": k.get("created_at", "")[:10] if k.get("created_at") else ""
        } for k in res.data]
        return {"success": True, "keys": keys}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/usage-metrics")
async def usage_metrics(current_user=Depends(get_current_user)):
    try:
        user_id = current_user["id"]
        keys = supabase.table("api_keys").select("*").eq("user_id", user_id).execute()
        total_requests = sum(int(k.get("usage_count") or 0) for k in (keys.data or []))

        logs = supabase.table("usage_logs").select("*").eq("user_id", user_id).execute()
        rows = logs.data or []
        valid_status = [r for r in rows if r.get("status_code") is not None]
        valid_latency = [float(r.get("latency_ms")) for r in rows if r.get("latency_ms") is not None]

        success_count = sum(1 for r in valid_status if int(r["status_code"]) < 400)
        error_count = sum(1 for r in valid_status if int(r["status_code"]) >= 400)
        success_rate = round((success_count / len(valid_status)) * 100, 1) if valid_status else 0
        avg_latency = round(sum(valid_latency) / len(valid_latency), 2) if valid_latency else 0

        return {
            "success": True,
            "total_requests": total_requests,
            "avg_compute_time": f"{avg_latency} ms",
            "success_rate": f"{success_rate}%",
            "errors_today": error_count,
            "blood_requests": int(total_requests * 0.82),
            "med_requests": int(total_requests * 0.31),
            "variant_requests": int(total_requests * 0.12),
            "avg_variant_count": 12
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# OPS & HEALTH
# =====================================================

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/v2/health", response_model=HealthResponse, tags=["ops"])
async def health():
    return HealthResponse(status="ok", version=VERSION)

@app.get("/v2/version", response_model=VersionResponse, tags=["ops"])
async def version():
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")
    return VersionResponse(
        version=VERSION,
        engine=ENGINE,
        kernel=KERNEL_DESC,
        build=BUILD,
        mode="production",
    )

# =====================================================
# CORE ENGINE ROUTES (Integrated)
# =====================================================

@app.post("/api/analyze")
async def analyze(request: AnalysisRequest, key_data=Depends(verify_api_key)):
    """Legacy frontend support using the new core engine."""
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")
        
    data = request.patient_data
    if not data:
        raise HTTPException(status_code=400, detail={"success": False, "message": "patient_data is required."})

    try:
        report = patient_report(data)
        _increment_usage(key_data)
        return report
    except Exception as e:
        logger.error(f"Analyze error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analyze failed")

@app.post("/v2/score", tags=["scoring"])
async def v2_score(payload: Union[AnalysisRequest, PatientInput], key_data=Depends(verify_api_key)):
    """
    Primary scoring endpoint using the new engine. 
    Accepts both pure PatientInput or legacy AnalysisRequest for safety.
    """
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")

    if isinstance(payload, AnalysisRequest):
        body = payload.patient_data
    else:
        body = payload.model_dump(exclude_none=True)

    if not body:
        raise HTTPException(status_code=400, detail="empty request body")

    try:
        report = patient_report(body)
    except Exception:
        logger.exception("engine error")
        raise HTTPException(status_code=500, detail="engine error")

    _increment_usage(key_data)
    return report

@app.post("/v2/intake", response_model=IntakeResponse, tags=["scoring"])
async def intake(payload: IntakeInput, key_data=Depends(verify_api_key)):
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")
        
    body = payload.model_dump(exclude_none=True)
    if not body:
        raise HTTPException(status_code=400, detail="empty request body")
        
    result = merge_patient(body)
    _increment_usage(key_data)
    return IntakeResponse(**result)

@app.post("/v2/report", tags=["scoring"])
async def report_enrichment(engine_output: dict[str, Any], key_data=Depends(verify_api_key)):
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")
        
    if not isinstance(engine_output, dict) or not engine_output:
        raise HTTPException(status_code=400, detail="engine output dict required")
    if "engine" not in engine_output and "version" not in engine_output:
        raise HTTPException(status_code=400, detail="payload does not look like an engine output")
        
    _increment_usage(key_data)
    return generate_clinical_report(engine_output)

@app.post("/v2/score-from-wearable", tags=["scoring"])
async def score_from_wearable(request: WearableScoreRequest, key_data=Depends(verify_api_key)):
    """
    Retrieves the latest wearable metrics for a given user_id, formats the data into a Patient schema,
    and forwards it directly to the scoring engine.
    """
    if not _READY["ok"]:
        raise HTTPException(status_code=503, detail="engine not ready")
        
    row = fetch_latest_wearable(request.user_id)
    patient_data = wearable_to_patient_input(row)
    
    try:
        report = patient_report(patient_data)
    except Exception as e:
        logger.exception("engine error")
        raise HTTPException(status_code=500, detail="engine error")
        
    _increment_usage(key_data)
    return report

# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {"status": "HexaGene API Running (Production)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)