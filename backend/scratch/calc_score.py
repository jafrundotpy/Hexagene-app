
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine_demo import patient_report


sample_data = {
    "age": 45,
    "sex": 0,
    "blood": {
        "albumin": 4.2,
        "hba1c": 5.4,
        "glucose": 90,
        "uric_acid": 5.2,
        "creatinine": 1.1,
        "egfr": 90,
        "crp": 1.2,
        "rdw": 13.0,
        "nlr": 2.1,
        "triglycerides": 150,
        "hdl": 50,
        "hemoglobin": 14,
        "wbc": 6.5,
        "platelets": 250,
        "alt": 25,
        "ast": 22,
        "tsh": 2.5,
        "ferritin": 120
    }
}

result = patient_report(sample_data)
print(result)
