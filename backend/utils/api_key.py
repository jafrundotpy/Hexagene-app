import secrets
import hashlib
import hmac


def generate_api_key() -> str:
    """Generate a new raw API key. Returns 'hx_' prefix + 32 bytes of URL-safe random data."""
    return "hx_" + secrets.token_urlsafe(32)


def hash_api_key(raw_key: str) -> str:
    """Hash the raw API key using SHA256. Store only this in the database."""
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def verify_api_key(raw_key: str, hashed_key: str) -> bool:
    """
    Constant-time comparison of the incoming raw key against the stored SHA256 hash.
    Uses hmac.compare_digest to prevent timing attacks.
    """
    expected_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    return hmac.compare_digest(expected_hash, hashed_key)