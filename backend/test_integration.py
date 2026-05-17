import json
import uuid
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app, verify_api_key

import os
os.environ["HEXAGENE_API_KEY"] = "merlin123merlin123"
HEADERS = {"x-api-key": "merlin123merlin123"}

# Mock Supabase so we don't hit the DB during tests
patcher = patch('main.supabase', MagicMock())
patcher.start()

client = TestClient(app)

def run_tests():
    print("=== RUNNING FULL BACKEND TESTS ===")
    
    # 1. Health
    r = client.get("/v2/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("[PASS] /v2/health")

    # 2. Version
    r = client.get("/v2/version")
    assert r.status_code == 200, f"Version failed: {r.text}"
    print("[PASS] /v2/version")

    # 3. Intake
    intake_payload = {
        "demographics": {"age": 45, "sex": "M"},
        "labs": {"glucose": "100 mg/dL"}
    }
    r = client.post("/v2/intake", json=intake_payload, headers=HEADERS)
    assert r.status_code == 200, f"Intake failed: {r.text}"
    intake_res = r.json()
    assert "patient" in intake_res, "Patient missing in intake response"
    print("[PASS] /v2/intake")

    # 4. Score (Boss Schema - PatientInput)
    patient_payload = intake_res["patient"]
    r = client.post("/v2/score", json=patient_payload, headers=HEADERS)
    assert r.status_code == 200, f"Score (Boss Schema) failed: {r.text}"
    score_res = r.json()
    assert "position" in score_res, "Missing position in score response"
    print("[PASS] /v2/score (Boss PatientInput schema)")

    # 5. Score (Legacy Frontend Compatibility - AnalysisRequest)
    legacy_payload = {
        "patient_data": patient_payload
    }
    r = client.post("/v2/score", json=legacy_payload, headers=HEADERS)
    assert r.status_code == 200, f"Score (Legacy Schema) failed: {r.text}"
    print("[PASS] /v2/score (Legacy AnalysisRequest schema / Frontend Compatible)")

    # 6. Legacy Analyze Route (Frontend Compatible)
    r = client.post("/api/analyze", json=legacy_payload, headers=HEADERS)
    assert r.status_code == 200, f"Legacy /api/analyze failed: {r.text}"
    print("[PASS] /api/analyze (Legacy Route Frontend Compatible)")

    # 7. Report Enrichment
    r = client.post("/v2/report", json=score_res, headers=HEADERS)
    assert r.status_code == 200, f"Report failed: {r.text}"
    report_res = r.json()
    assert "clinical" in report_res, "Clinical block missing in report response"
    print("[PASS] /v2/report")

    # 8. Wearable Score
    wearable_payload = {"user_id": "demo-user"}
    
    # We must mock fetch_latest_wearable since we disabled actual supabase calls
    with patch("main.fetch_latest_wearable", return_value={"age": 30, "sex": 1, "daily_steps": 5000}):
        r = client.post("/v2/score-from-wearable", json=wearable_payload, headers=HEADERS)
        assert r.status_code == 200, f"Wearable Score failed: {r.text}"
        print("[PASS] /v2/score-from-wearable")

    # 9. Vitals Stream Scoring
    print("Testing /v2/score with Wearable Vitals block...")
    vitals_patient_payload = dict(patient_payload)
    vitals_patient_payload["vitals"] = {
        "window_days": 21,
        "streams": {
            "hrv": [48.0, 45.0, 42.0, 40.0],
            "sleep_efficiency": [91.0, 88.0, 82.0, 79.0],
            "cgm_mean_glucose": [110.0, 118.0, 126.0]
        }
    }
    r = client.post("/v2/score", json=vitals_patient_payload, headers=HEADERS)
    assert r.status_code == 200, f"Score with vitals failed: {r.text}"
    vitals_res = r.json()
    assert "vitals" in vitals_res, "Vitals block missing in score response"
    vitals_block = vitals_res["vitals"]
    assert vitals_block is not None, "Vitals block should not be None"
    assert "axis_contributions" in vitals_block, "Missing axis_contributions in vitals block"
    assert "trajectory" in vitals_block, "Missing trajectory in vitals block"
    assert "stability" in vitals_block, "Missing stability in vitals block"
    assert "loop_attribution" in vitals_block, "Missing loop_attribution in vitals block"
    assert "recommendations" in vitals_block, "Missing recommendations in vitals block"
    print("[PASS] /v2/score with Wearable Vitals block")

    print("\n[SUCCESS] All Boss backend integration tests passed successfully!")
    print("Schema compatibility verified. Frontend payloads will not break.")

if __name__ == "__main__":
    run_tests()
