from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_api_key():
    return "hx_" + secrets.token_urlsafe(32)

def hash_api_key(api_key: str):
    return pwd_context.hash(api_key)

def verify_api_key(raw_key: str, hashed_key: str):
    return pwd_context.verify(raw_key, hashed_key)