import sys
import json
import requests

def run_live_tests(base_url, api_key):
    print(f"=== RUNNING LIVE TESTS AGAINST: {base_url} ===")
    
    headers = {"x-api-key": api_key}

    # 1. Health
    r = requests.get(f"{base_url}/v2/health")
    print(f"1. /v2/health -> {r.status_code}")
    if r.status_code == 200:
        print(f"   {r.json()}")

    # 2. Version
    r = requests.get(f"{base_url}/v2/version")
    print(f"2. /v2/version -> {r.status_code}")
    if r.status_code == 200:
        print(f"   {r.json()}")

    # 3. Intake
    intake_payload = {
        "demographics": {"age": 45, "sex": "M"},
        "labs": {"glucose": "100 mg/dL"}
    }
    r = requests.post(f"{base_url}/v2/intake", json=intake_payload, headers=headers)
    print(f"3. /v2/intake -> {r.status_code}")
    if r.status_code != 200:
        print(f"   ERROR: {r.text}")
        return
    intake_res = r.json()

    # 4. Score
    patient_payload = intake_res.get("patient", {})
    r = requests.post(f"{base_url}/v2/score", json=patient_payload, headers=headers)
    print(f"4. /v2/score -> {r.status_code}")
    if r.status_code != 200:
        print(f"   ERROR: {r.text}")
        return
    score_res = r.json()

    # 5. Report
    r = requests.post(f"{base_url}/v2/report", json=score_res, headers=headers)
    print(f"5. /v2/report -> {r.status_code}")
    if r.status_code != 200:
        print(f"   ERROR: {r.text}")
        return

    print("\n✅ All live tests passed! The engine is live and responding perfectly.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_live.py <LIVE_RENDER_URL> <API_KEY>")
        print("Example: python test_live.py https://hexagene-api.onrender.com sk_live_12345")
        sys.exit(1)
        
    url = sys.argv[1].rstrip("/")
    key = sys.argv[2]
    run_live_tests(url, key)
