"""
UI Test Cases — Exact inputs + expected backend results.
Run: python -X utf8 ui_test_cases.py
"""
import requests, json

HEADERS = {"x-api-key": "merlin123merlin123"}
BASE    = "http://127.0.0.1:8000"

TEST_CASES = [
    {
        "name": "TEST CASE 1 — HEALTHY / LOW RISK",
        "ui_inputs": {
            "Demographics": {"Age": 32, "Sex": "Male"},
            "Labs": {"albumin": 4.5, "hba1c": 5.1, "glucose": 82, "crp": 0.8, "hdl": 65,
                     "hemoglobin": 14.8, "egfr": 95, "triglycerides": 110, "nlr": 1.8,
                     "rdw": 12.5, "uric_acid": 4.2},
            "Vitals": {
                "window_days": 21,
                "hrv":              [62, 65, 68, 70, 72, 74],  # rising = recovering
                "resting_hr":       [58, 57, 56, 55, 54],       # falling = healthy
                "sleep_efficiency": [88, 89, 90, 91, 92],       # rising = good
                "cgm_mean_glucose": [92, 90, 88, 86, 85],       # falling = stable
                "steps":            [8000, 8500, 9000, 9500, 10000],  # rising = active
            },
        },
        "api_payload": {
            "age": 32, "sex": 1,
            "blood": {"albumin": 4.5, "hba1c": 5.1, "glucose": 82, "crp": 0.8, "hdl": 65,
                      "hemoglobin": 14.8, "egfr": 95, "triglycerides": 110, "nlr": 1.8,
                      "rdw": 12.5, "uric_acid": 4.2},
            "vitals": {
                "window_days": 21,
                "streams": {
                    "hrv":              [62, 65, 68, 70, 72, 74],
                    "resting_heart_rate": [58, 57, 56, 55, 54],
                    "sleep_efficiency": [88, 89, 90, 91, 92],
                    "cgm_mean_glucose": [92, 90, 88, 86, 85],
                    "steps":            [8000, 8500, 9000, 9500, 10000],
                }
            }
        }
    },
    {
        "name": "TEST CASE 2 — MODERATE / PARTIAL STRESS",
        "ui_inputs": {
            "Demographics": {"Age": 45, "Sex": "Male"},
            "Labs": {"albumin": 4.2, "hba1c": 5.8, "glucose": 90, "crp": 2.4, "hdl": 52},
            "Vitals": {
                "window_days": 21,
                "hrv":              [52, 50, 48, 45, 42, 40],
                "resting_hr":       [60, 61, 63, 65, 67],
                "sleep_efficiency": [91, 89, 85, 82, 80],
                "cgm_mean_glucose": [98, 102, 108, 115, 121],
                "steps":            [9000, 8500, 7600, 6400, 5200],
            },
        },
        "api_payload": {
            "age": 45, "sex": 0,
            "blood": {"albumin": 4.2, "hba1c": 5.8, "glucose": 90, "crp": 2.4, "hdl": 52},
            "vitals": {
                "window_days": 21,
                "streams": {
                    "hrv":              [52, 50, 48, 45, 42, 40],
                    "resting_hr":       [60, 61, 63, 65, 67],
                    "sleep_efficiency": [91, 89, 85, 82, 80],
                    "cgm_mean_glucose": [98, 102, 108, 115, 121],
                    "steps":            [9000, 8500, 7600, 6400, 5200],
                }
            }
        }
    },
    {
        "name": "TEST CASE 3 — HIGH RISK / FULL PANEL",
        "ui_inputs": {
            "Demographics": {"Age": 62, "Sex": "Female"},
            "Labs": {"albumin": 3.4, "hba1c": 7.2, "glucose": 145, "crp": 8.5, "hdl": 31,
                     "hemoglobin": 11.2, "egfr": 55, "triglycerides": 280, "nlr": 4.8,
                     "rdw": 16.2, "uric_acid": 8.1},
            "Medications": ["Metformin", "Atorvastatin", "Lisinopril"],
            "Variants": ["SCN5A:R1193Q", "CYP2D6:P34S"],
            "Vitals": {
                "window_days": 21,
                "hrv":              [38, 35, 33, 30, 28, 25],  # severely declining
                "resting_hr":       [78, 80, 83, 86, 89],       # fast rising
                "sleep_efficiency": [72, 70, 67, 64, 61],       # strongly declining
                "cgm_mean_glucose": [138, 144, 151, 158, 165],  # strong rise
                "steps":            [3500, 3000, 2500, 2000, 1500],  # very low
            },
        },
        "api_payload": {
            "age": 62, "sex": 0,
            "blood": {"albumin": 3.4, "hba1c": 7.2, "glucose": 145, "crp": 8.5, "hdl": 31,
                      "hemoglobin": 11.2, "egfr": 55, "triglycerides": 280, "nlr": 4.8,
                      "rdw": 16.2, "uric_acid": 8.1},
            "medications": ["Metformin", "Atorvastatin", "Lisinopril"],
            "variants": ["SCN5A:R1193Q", "CYP2D6:P34S"],
            "vitals": {
                "window_days": 21,
                "streams": {
                    "hrv":              [38, 35, 33, 30, 28, 25],
                    "resting_heart_rate": [78, 80, 83, 86, 89],
                    "sleep_efficiency": [72, 70, 67, 64, 61],
                    "cgm_mean_glucose": [138, 144, 151, 158, 165],
                    "steps":            [3500, 3000, 2500, 2000, 1500],
                }
            }
        }
    },
    {
        "name": "TEST CASE 4 — VITALS ONLY (No Labs)",
        "ui_inputs": {
            "Demographics": {"Age": 38, "Sex": "Male"},
            "Labs": {},
            "Vitals": {
                "window_days": 14,
                "hrv":              [55, 53, 50, 47, 45, 42, 40],
                "resting_hr":       [65, 66, 68, 70, 72, 74],
                "sleep_efficiency": [85, 83, 80, 78, 75],
                "cgm_mean_glucose": [105, 110, 116, 122, 128],
            },
        },
        "api_payload": {
            "age": 38, "sex": 1,
            "blood": {},
            "vitals": {
                "window_days": 14,
                "streams": {
                    "hrv":              [55, 53, 50, 47, 45, 42, 40],
                    "resting_heart_rate": [65, 66, 68, 70, 72, 74],
                    "sleep_efficiency": [85, 83, 80, 78, 75],
                    "cgm_mean_glucose": [105, 110, 116, 122, 128],
                }
            }
        }
    },
]

SEPARATOR = "=" * 60

for tc in TEST_CASES:
    print()
    print(SEPARATOR)
    print(tc["name"])
    print(SEPARATOR)

    # Print UI input guide
    ui = tc["ui_inputs"]
    demo = ui["Demographics"]
    print(f"\nEnter in UI:")
    print(f"  Age: {demo['Age']}   Sex: {demo['Sex']}")
    labs = ui.get("Labs", {})
    if labs:
        print(f"  Labs:")
        for k, v in labs.items():
            print(f"    {k}: {v}")
    else:
        print("  Labs: (leave all empty)")

    meds = ui.get("Medications", [])
    if meds:
        print(f"  Medications (check): {', '.join(meds)}")
    variants = ui.get("Variants", [])
    if variants:
        print(f"  Variants: {', '.join(variants)}")

    vit = ui["Vitals"]
    print(f"  Wearable window_days: {vit['window_days']}")
    for stream_name, vals in vit.items():
        if stream_name == "window_days":
            continue
        vals_str = " | ".join([f"D{i+1}: {v}" for i, v in enumerate(vals)])
        print(f"  {stream_name}: {vals_str}")

    # Hit the backend
    r = requests.post(f"{BASE}/v2/score", json=tc["api_payload"], headers=HEADERS)
    if r.status_code != 200:
        print(f"\n  [ERROR] HTTP {r.status_code}: {r.text[:200]}")
        continue
    d = r.json()
    pos = d.get("position", {})
    vit_block = d.get("vitals", {})
    clinical = d.get("clinical", {})
    forces = d.get("forces")
    terrain = d.get("terrain")

    print(f"\nEXPECTED RESULTS ON SCREEN:")
    print(f"\n  --- POSITION TAB ---")
    if pos:
        axes = pos.get("axes", {})
        print(f"  Risk Score:      {pos.get('risk_score')}  -> {round(pos.get('risk_score',0)*100)}%")
        print(f"  Classification:  {pos.get('classification')} RISK")
        print(f"  State:           S-{pos.get('discrete_state')}  ({pos.get('stability')} stability)")
        print(f"  Tier:            Tier {pos.get('tier')}  ({pos.get('tier_auc')})")
        print(f"  Axes:")
        for axis, val in axes.items():
            conf = pos.get("confidence", {}).get(axis, "?")
            print(f"    {axis:<15} {round(val*100)}%  [{conf} confidence]")
        print(f"  Missing markers: {pos.get('missing_markers', [])}")
    else:
        print("  Position: null (no blood markers)")

    print(f"\n  --- VITALS TAB ---")
    if vit_block:
        traj = vit_block.get("trajectory", {})
        print(f"  Drift Direction: {traj.get('net_drift_direction','?').upper()}")
        print(f"  Stability:       {vit_block.get('stability',{}).get('classification','?')}")
        print(f"  State Crossings: {traj.get('state_crossings','?')}")
        print(f"  Axis Contributions:")
        for axis, val in vit_block.get("axis_contributions", {}).items():
            print(f"    {axis:<15} {round(val*100)}%")
        loops = vit_block.get("loop_attribution", [])
        if loops:
            print(f"  Top Loop (Today lever): {loops[0]['loop']}  drift={loops[0]['mean_drift']}")
        recs = vit_block.get("recommendations", [])
        for rec in recs:
            print(f"  [{rec['priority'].upper()}] {rec['target_loop']} -> {rec['observed'][:60]}...")
            print(f"    Driven by: {rec['driven_by']}")
            print(f"    Resolved when: {rec['reentry_condition'][:70]}...")
    else:
        print("  Vitals: null (no wearable data sent)")

    if forces:
        drugs = [d["name"] for d in forces.get("drugs", [])]
        flags = [f["type"] for f in forces.get("flags", [])]
        print(f"\n  --- FORCES TAB ---")
        print(f"  Drugs scored:    {drugs}")
        print(f"  Flags:           {flags if flags else 'None'}")

    if terrain:
        print(f"\n  --- TERRAIN TAB ---")
        print(f"  Variants scored: {terrain.get('n_scored')}")
        high = sum(1 for v in terrain.get("variants", []) if v["risk"] == "HIGH")
        mod  = sum(1 for v in terrain.get("variants", []) if v["risk"] == "MODERATE")
        print(f"  HIGH risk variants: {high}")
        print(f"  MODERATE variants:  {mod}")

    cov = clinical.get("coverage", {})
    print(f"\n  --- COVERAGE BAR ---")
    print(f"  Level:           {cov.get('level')}")
    print(f"  Completeness:    {round(cov.get('completeness', 0)*100)}%")
    print(f"  Fired:           {cov.get('fired_projections', [])}")

print()
print(SEPARATOR)
print("ALL TEST CASES COMPLETE — compare each expected result to your UI")
print(SEPARATOR)
