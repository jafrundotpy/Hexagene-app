import json
import os
from fastapi.testclient import TestClient
from main import app, fetch_latest_wearable, wearable_to_patient_input
from unittest.mock import MagicMock, patch

client = TestClient(app)

# Mock data for testing
MOCK_WEARABLE_ROW = {
    "user_id": "test-user-123",
    "daily_steps": 10000,
    "resting_heart_rate": 65,
    "avg_sleep_hours": 8,
    "hrv": 60,
    "stress_score": 25,
    "spo2": 99,
    "calories_burned": 500,
    "active_minutes": 45,
    "age": 30,
    "sex": "male"
}

def test_wearable_to_patient_input_mapping():
    """Verify that wearable fields map correctly to blood markers."""
    patient_data = wearable_to_patient_input(MOCK_WEARABLE_ROW)
    blood = patient_data["blood"]
    
    assert blood["hdl"] == 10000.0  # daily_steps
    assert blood["crp"] == 65.0    # resting_heart_rate
    assert blood["albumin"] == 8.0  # avg_sleep_hours
    assert blood["egfr"] == 60.0    # hrv
    assert blood["nlr"] == 25.0     # stress_score
    assert blood["hemoglobin"] == 99.0 # spo2
    assert blood["triglycerides"] == 500.0 # calories_burned
    assert blood["hba1c"] == 45.0  # active_minutes
    assert patient_data["age"] == 30
    assert patient_data["sex"] == "male"
    print("✅ Mapping test passed!")

@patch("main.fetch_latest_wearable")
def test_score_from_wearable_endpoint(mock_fetch):
    """Verify the end-to-end endpoint orchestration."""
    mock_fetch.return_value = MOCK_WEARABLE_ROW
    
    # Payload with overrides
    payload = {
        "user_id": "test-user-123",
        "daily_steps": 12000, # Override
        "age": 35 # Override
    }
    
    # We need to bypass API key check or provide one
    api_key = os.getenv("HEXAGENE_API_KEY", "test-key")
    headers = {"X-API-KEY": api_key}
    
    with patch.dict(os.environ, {"HEXAGENE_API_KEY": api_key}):
        response = client.post("/v2/score-from-wearable", json=payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check if wearable_data is appended and has overrides applied
    wearable_data = data.get("wearable_data")
    assert wearable_data is not None
    assert wearable_data["daily_steps"] == 12000
    assert wearable_data["age"] == 35
    assert wearable_data["resting_heart_rate"] == 65 # From mock DB
    
    # Check if clinical report is present
    assert "clinical" in data
    assert "position" in data
    
    print("✅ Endpoint orchestration test passed!")

if __name__ == "__main__":
    test_wearable_to_patient_input_mapping()
    try:
        test_score_from_wearable_endpoint()
    except Exception as e:
        print(f"❌ Endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
