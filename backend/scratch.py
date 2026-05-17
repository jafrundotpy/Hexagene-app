import json
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

payload = {
  "age": 29,
  "sex": 1,
  "blood": {
    "crp": 2.4,
    "hba1c": 5.8,
    "hdl": 52
  },
  "vitals": {
    "window_days": 21,
    "streams": {
      "hrv": [52,50,48,45,42,40],
      "resting_hr": [60,61,63,65,67],
      "sleep_efficiency": [91,89,85,82,80],
      "cgm_mean_glucose": [98,102,108,115,121],
      "steps": [9000,8500,7600,6400,5200]
    }
  }
}

r = client.post("/v2/score", json=payload, headers={"x-api-key": "merlin123merlin123"})
print("STATUS CODE:", r.status_code)
print("RESPONSE KEYS:", list(r.json().keys()))
if "vitals" in r.json():
    print("VITALS BLOCK:", r.json()["vitals"])
else:
    print("VITALS MISSING!")
