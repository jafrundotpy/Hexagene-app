import json
import os
import sys
from fastapi.testclient import TestClient

# Add current directory to path so we can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

# Dummy API key for testing (matches verify_api_key in main.py if HEXAGENE_API_KEY is set)
os.environ["HEXAGENE_API_KEY"] = "merlin123merlin123"
HEADERS = {"x-api-key": "merlin123merlin123"}

def test_smoke():
    print("--- STARTING BOSS BACKEND SMOKE TEST ---")

    # 1. Health check
    print("Testing /v2/health...")
    res = client.get("/v2/health")
    assert res.status_code == 200
    print("  [OK]")

    # 2. Version info
    print("Testing /v2/version...")
    res = client.get("/v2/version")
    assert res.status_code == 200
    data = res.json()
    assert "version" in data
    assert "engine" in data
    print(f"  [OK] Engine: {data['engine']} v{data['version']}")

    # 3. Intake
    print("Testing /v2/intake...")
    intake_data = {
        "demographics": {"age": 45, "sex": "M"},
        "labs": {"crp": "1.2 mg/L", "hba1c": "5.4%"}
    }
    res = client.post("/v2/intake", json=intake_data, headers=HEADERS)
    assert res.status_code == 200
    intake_res = res.json()
    assert "patient" in intake_res
    print("  [OK]")

    # 4. Scoring + Clinical Enrichment (The 8 Boss Outputs)
    print("Testing /v2/score (Clinical Enrichment)...")
    patient_data = intake_res["patient"]
    res = client.post("/v2/score", json=patient_data, headers=HEADERS)
    assert res.status_code == 200
    report = res.json()

    # Verify the 8 core outputs
    expected_outputs = ["position", "terrain", "forces", "clinical"]
    for output in expected_outputs:
        assert output in report, f"Missing output: {output}"
    
    clinical = report["clinical"]
    assert "coverage" in clinical
    assert "integration" in clinical
    assert "action_items" in clinical
    assert "summary" in clinical
    assert "headline" in clinical["summary"]
    assert "body" in clinical["summary"]

    print("  [OK] All 8 Boss outputs present.")
    print(f"  [OK] Risk Score: {report['position']['risk_score']}")
    print(f"  [OK] Headline: {clinical['summary']['headline']}")

    # 5. Determinism Check
    print("Testing Determinism...")
    res2 = client.post("/v2/score", json=patient_data, headers=HEADERS)
    report2 = res2.json()
    
    # Remove volatile fields
    report.pop("timestamp", None)
    report.pop("compute_time_ms", None)
    report2.pop("timestamp", None)
    report2.pop("compute_time_ms", None)
    
    assert report == report2, "FAIL: Non-deterministic output!"
    print("  [OK] Determinism verified.")

    print("\nDONE: BOSS BACKEND SMOKE TEST PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        test_smoke()
    except Exception as e:
        print(f"\nERROR: SMOKE TEST FAILED: {str(e)}")
        sys.exit(1)
