"""
FINAL SUCCESS TEST: Mary Demo Verification
Simulates n8n ingest -> Backend score calculation.
"""
import httpx
import json

BASE_URL = "https://hexagene-app.onrender.com"
INGEST_TOKEN = "hexagene-ingest-2026"
MARY_EMAIL = "mary@gmail.com"

def test_mary_pipeline():
    print(f"--- STARTING MARY DEMO VERIFICATION ---")
    
    # 1. Simulate n8n Ingest
    ingest_payload = {
        "email": MARY_EMAIL,
        "ingest_token": INGEST_TOKEN,
        "daily_steps": 10500,
        "resting_heart_rate": 58,
        "avg_sleep_hours": 8.2,
        "hrv": 72,
        "active_minutes": 65,
        "stress_score": 15,
        "spo2": 99,
        "calories_burned": 550,
        "source": "apple_health_shortcut"
    }
    
    print(f"1. Testing n8n Ingest via /v2/ingest-wearable...")
    with httpx.Client(timeout=30.0) as client:
        res = client.post(f"{BASE_URL}/v2/ingest-wearable", json=ingest_payload)
        if res.status_code != 200:
            print(f"FAILED: Ingest failed with {res.status_code}")
            print(res.text)
            return
        
        data = res.json()
        user_uuid = data["user_id"]
        print(f"   SUCCESS: Data ingested for Mary (UUID: {user_uuid})")

    # 2. Simulate Dashboard Analysis Trigger
    # We use the internal project API key
    headers = {"x-api-key": "merlin123merlin123"}
    score_payload = {"user_id": user_uuid}
    
    print(f"2. Testing Score Calculation via /v2/score-from-wearable...")
    with httpx.Client(timeout=30.0) as client:
        res = client.post(f"{BASE_URL}/v2/score-from-wearable", json=score_payload, headers=headers)
        if res.status_code != 200:
            print(f"FAILED: Scoring failed with {res.status_code}")
            print(res.text)
            return
        
        result = res.json()
        print(f"   SUCCESS: Engine result received!")
        print(f"   - Health Score: {round(result.get('risk_score', 0) * 100)}%")
        print(f"   - Classification: {result.get('classification')}")
        print(f"   - Completeness: {round(result.get('completeness', 0) * 100)}%")
        
        # Verify sync info was returned
        if "wearable_data" in result:
            print(f"   - Sync Time: {result['wearable_data']['created_at']}")
            print(f"   - Sync Source: {result['wearable_data']['source']}")
        else:
            print("   WARNING: wearable_data missing from response")

    print(f"\n--- VERIFICATION COMPLETE: MARY IS READY FOR DEMO ---")

if __name__ == "__main__":
    test_mary_pipeline()
