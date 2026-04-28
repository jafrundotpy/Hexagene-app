# HexaGene Backend Documentation

> Production backend for the HexaGene clinical intelligence platform.
> Hosted on Render. Built with FastAPI + Python + Supabase.

---

## 1. Overview

HexaGene is a multi-axis genomic and metabolic risk scoring API. It accepts structured patient biomarker data and returns a computed risk position across six biological axes.

---

## 2. Technology Stack

| Component        | Technology                     |
|-----------------|-------------------------------|
| Runtime         | Python 3.11+                  |
| Framework       | FastAPI                        |
| Database        | Supabase (PostgreSQL)          |
| Auth            | JWT + API Key (SHA-256 hashed) |
| Hosting         | Render (single worker)         |
| Env management  | python-dotenv                  |

---

## 3. Project Structure

```
backend/
├── main.py              # FastAPI app, routes, middleware, rate limiter
├── supabase_client.py   # Supabase client singleton
├── utils/
│   ├── api_key.py       # API key generation and hashing
│   └── ocr.py           # OCR utilities
├── .env                 # Environment variables (not committed)
└── requirements.txt     # Python dependencies
```

---

## 4. Environment Variables

| Variable        | Description                          | Required |
|----------------|--------------------------------------|----------|
| `SECRET_KEY`   | JWT signing secret                   | ✅        |
| `ALGORITHM`    | JWT algorithm (default: `HS256`)     | ✅        |
| `SUPABASE_URL` | Supabase project URL                 | ✅        |
| `SUPABASE_KEY` | Supabase service role key            | ✅        |

---

## 5. Authentication

### 5.1 JWT (User sessions)

- Issued at `/auth/login`
- 24-hour expiry
- Passed as `Authorization: Bearer <token>`

### 5.2 API Keys (Programmatic access)

- Generated at `/api/generate-key` (requires valid JWT)
- Stored as SHA-256 hash in Supabase `api_keys` table
- Passed via `x-api-key` header on all `/v2/` endpoints
- One active key per user; generating a new key revokes the old one

---

## 6. Endpoints

### 6.1 Auth

| Method | Path           | Description         | Auth     |
|--------|---------------|---------------------|----------|
| POST   | `/auth/signup` | Register new user   | None     |
| POST   | `/auth/login`  | Login, receive JWT  | None     |

### 6.2 API Key Management

| Method | Path                  | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | `/api/generate-key`   | Generate API key         | JWT  |
| GET    | `/api/keys`           | List active keys         | JWT  |

### 6.3 Scoring (v2)

| Method | Path         | Description              | Auth    |
|--------|-------------|--------------------------|---------|
| POST   | `/v2/score`  | Run risk scoring engine  | API Key |

### 6.4 Health & Metadata

| Method | Path           | Description         | Auth |
|--------|---------------|---------------------|------|
| GET    | `/api/health`  | Basic health check  | None |
| GET    | `/v2/health`   | V2 health check     | None |
| GET    | `/v2/version`  | Engine version info | None |
| GET    | `/`            | Root status         | None |

---

## 7. Infrastructure & Security

### 7.1 Hosting

- Deployed on **Render** (web service, single worker)
- Auto-deploys from `main` branch on GitHub push
- No Docker config required; uses Render's Python buildpack

### 7.2 Database

- **Supabase** (PostgreSQL) with Row Level Security (RLS) disabled for backend service role
- Tables: `users`, `api_keys`, `usage_logs`
- Usage count incremented per successful `/v2/score` call
- Monthly quota enforced at the application layer

### 7.3 Logging & Observability

- All requests logged to `usage_logs` via HTTP middleware
- Log fields: `endpoint`, `method`, `status_code`, `latency_ms`, `user_id`
- Unhandled exceptions logged with a short `error_id` for traceability
- Render native log streaming available via dashboard

---

### 7.4 Network & security

- TLS termination at the load balancer, not in the app.
- Auth: API key passed via `x-api-key` request header and validated by the FastAPI application layer.
- Rate limiting is enforced directly in the application layer before scoring execution.

**Current production limits:**

- 20 requests per 60 seconds per authenticated API key
- Burst protection: 3 requests per 2 seconds
- Exceeded limits return HTTP `429 Too Many Requests`

**Typical error response:**

```json
{
  "success": false,
  "message": "Rate limit exceeded. Retry later."
}
```

**Additional notes:**

- Limits are keyed per authenticated user/API key.
- Requests blocked by rate limiting do not execute scoring logic.
- Limits can be adjusted later by plan tier (Free / Pro / Enterprise).
- Gateway-level rate limiting may still be added as a second protection layer in future.
- Egress allowlist: the engine container should have no outbound network access in production.

---

## 8. Scoring Engine

### 8.1 Input

```json
{
  "patient_data": {
    "hba1c": 6.5,
    "crp": 2.0,
    "albumin": 4.0,
    "egfr": 90,
    "rdw": 13,
    "uric_acid": 5.0
  }
}
```

### 8.2 Output Axes

| Axis           | Derived from           |
|---------------|------------------------|
| `structural`  | Albumin                |
| `inflammatory`| CRP                    |
| `metabolic`   | HbA1c                  |
| `kinetic`     | eGFR                   |
| `redox`       | RDW                    |
| `balance`     | Uric acid              |

### 8.3 Risk Classification

| Score Range | Classification |
|------------|---------------|
| ≥ 70       | HIGH           |
| 50 – 69    | MODERATE       |
| < 50       | LOW            |

---

## 9. Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --port 8000
```

---

## 10. Deployment

Push to `main` branch → Render auto-deploys.

Ensure all environment variables are set in the Render service dashboard before deploying.
