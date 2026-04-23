import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Load .env — resolved relative to THIS file, works regardless of cwd
# ---------------------------------------------------------------------------
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str | None = os.getenv("SUPABASE_KEY")

# Startup diagnostics (safe — never prints full key)
logger.info("SUPABASE_URL loaded: %s", bool(SUPABASE_URL))
logger.info("SUPABASE_KEY loaded: %s", bool(SUPABASE_KEY))
if SUPABASE_KEY:
    logger.info("KEY prefix: %s", SUPABASE_KEY[:12])
    # Warn if anon key was accidentally used
    if '"role":"anon"' in SUPABASE_KEY or "anon" in SUPABASE_KEY[:60]:
        logger.warning("⚠️  SUPABASE_KEY looks like an ANON key — use the service_role key instead!")
    else:
        logger.info("✅ SUPABASE_KEY appears to be service_role key.")

# ---------------------------------------------------------------------------
# Initialize client — raises immediately on misconfiguration
# ---------------------------------------------------------------------------
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        f"Missing Supabase credentials. "
        f"SUPABASE_URL={'set' if SUPABASE_URL else 'MISSING'}, "
        f"SUPABASE_KEY={'set' if SUPABASE_KEY else 'MISSING'}. "
        f"Checked .env at: {_env_path}"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info("✅ Supabase client initialized successfully.")
