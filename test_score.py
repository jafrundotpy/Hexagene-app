import requests  
res = requests.post('https://hexagene-app.onrender.com/v2/score', headers={'x-api-key': 'hx_demo_clinic_2026'}, json={'patient_data': {'crp': 12, 'hba1c': 12, 'albumin': 100, 'egfr': 12, 'rdw': 13, 'uric_acid': 15}})  
print(res.status_code)  
print(res.text)  
