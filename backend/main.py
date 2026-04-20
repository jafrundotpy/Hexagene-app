from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os, json, re, httpx, base64 as b64lib
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

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

def extract_metrics_from_text(text):
    text = text.lower()
    result = {
        "age":"","sex":"","activityLevel":"","albumin":"","crp":"","hba1c":"",
        "egfr":"","rdw":"","uricAcid":"","restingHR":"","dailySteps":"",
        "activeMinutes":"","vo2max":"","hrv":"","recoveryScore":"",
        "sleepDuration":"","sleepScore":"","sleepDebt":""
    }

    steps = re.search(r'([\d,]+)\s*steps', text)
    if steps:
        result["dailySteps"] = steps.group(1).replace(",","")

    sleep_score = re.search(r'sleep\s*score.*?(\d+)\s*points?|(\d+)\s*points?\s*.*?sleep', text)
    if sleep_score:
        result["sleepScore"] = sleep_score.group(1) or sleep_score.group(2)

    sleep_score2 = re.search(r'sleep.*?(\d{2,3})\s*(?:pts|points|score)', text)
    if not result["sleepScore"] and sleep_score2:
        result["sleepScore"] = sleep_score2.group(1)

    hrv = re.search(r'(?:hrv|heart rate variability).*?(\d+)\s*ms|(\d+)\s*ms.*?(?:hrv|heart rate variability)', text)
    if hrv:
        result["hrv"] = hrv.group(1) or hrv.group(2)

    hrv2 = re.search(r'average\s*(\d+)\s*ms', text)
    if not result["hrv"] and hrv2:
        result["hrv"] = hrv2.group(1)

    resting = re.search(r'resting\s*(?:heart rate|hr).*?(\d+)\s*bpm|(\d+)\s*bpm.*?resting', text)
    if resting:
        result["restingHR"] = resting.group(1) or resting.group(2)

    recovery = re.search(r'recovery.*?(\d+)\s*%|(\d+)\s*%.*?recovery|readiness.*?(\d+)|(\d+).*?readiness', text)
    if recovery:
        result["recoveryScore"] = next(x for x in recovery.groups() if x)

    active = re.search(r'(\d+)\s*active\s*min|active\s*minutes.*?(\d+)', text)
    if active:
        result["activeMinutes"] = active.group(1) or active.group(2)

    vo2 = re.search(r'vo2\s*max.*?([\d.]+)|([\d.]+).*?vo2\s*max', text)
    if vo2:
        result["vo2max"] = vo2.group(1) or vo2.group(2)

    sleep_hrs = re.search(r'(\d+)h\s*(\d+)m|(\d+)\s*hours?\s*(\d+)\s*min', text)
    if sleep_hrs:
        h = int(sleep_hrs.group(1) or sleep_hrs.group(3))
        m = int(sleep_hrs.group(2) or sleep_hrs.group(4))
        result["sleepDuration"] = str(round(h + m/60, 1))

    sleep_hrs2 = re.search(r'(\d+\.?\d*)\s*hours?\s*(?:of\s*)?sleep|sleep.*?(\d+\.?\d*)\s*hours?', text)
    if not result["sleepDuration"] and sleep_hrs2:
        result["sleepDuration"] = sleep_hrs2.group(1) or sleep_hrs2.group(2)

    hba1c = re.search(r'hba1c.*?([\d.]+)\s*%|([\d.]+)\s*%.*?hba1c', text)
    if hba1c:
        result["hba1c"] = hba1c.group(1) or hba1c.group(2)

    crp = re.search(r'crp.*?([\d.]+)\s*mg|([\d.]+)\s*mg.*?crp', text)
    if crp:
        result["crp"] = crp.group(1) or crp.group(2)

    egfr = re.search(r'egfr.*?(\d+)|(\d+).*?egfr', text)
    if egfr:
        result["egfr"] = egfr.group(1) or egfr.group(2)

    return result

@app.get("/")
def root(): return {"message": "Backend running"}

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
    try:
        img_bytes = b64lib.b64decode(image_data)
        try:
            import pytesseract
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(img)
            print("OCR text:", text)
        except Exception as ocr_err:
            print("OCR failed, trying free API:", ocr_err)
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(
                    "https://api.ocr.space/parse/image",
                    data={
                        "apikey": "helloworld",
                        "base64Image": f"data:{media_type};base64,{image_data}",
                        "language": "eng",
                        "isOverlayRequired": "false"
                    }
                )
            ocr_result = r.json()
            print("OCR.space result:", ocr_result)
            text = ""
            if ocr_result.get("ParsedResults"):
                text = ocr_result["ParsedResults"][0].get("ParsedText", "")
            if not text:
                raise HTTPException(status_code=422, detail="Could not read text from image. Try a clearer screenshot.")

        extracted = extract_metrics_from_text(text)
        filled = {k: v for k, v in extracted.items() if v not in ("", None)}
        print("Extracted:", filled)
        return {"success": True, "data": extracted, "filled_count": len(filled), "filled_fields": list(filled.keys())}
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))