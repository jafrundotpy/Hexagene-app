"""
Discover the real columns in wearable_metrics and seed data for mary.
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))
from supabase_client import supabase

USER_ID = "e516963f-ce02-432c-82c4-1b18392c58f7"  # mary@gmail.com

# 1. Fetch any existing row to discover columns
print("Fetching schema by reading all rows (limit 1, any user)...")
sample = supabase.table("wearable_metrics").select("*").limit(1).execute()
if sample.data:
    print("Existing columns:", list(sample.data[0].keys()))
else:
    print("Table is empty — will attempt minimal insert to discover required columns")

# 2. Try inserting with only the safest minimal fields
row = {
    "user_id": USER_ID,
    "daily_steps": 9400,
    "resting_heart_rate": 61,
    "avg_sleep_hours": 7.5,
    "hrv": 63,
    "active_minutes": 52,
    "stress_score": 24,
    "spo2": 98,
    "calories_burned": 450,
}

print(f"\nInserting wearable row for user_id: {USER_ID}")
try:
    res = supabase.table("wearable_metrics").insert(row).execute()
    if res.data:
        print("SUCCESS! Inserted row:", res.data[0])
    else:
        print("No data returned:", res)
except Exception as e:
    print(f"Insert failed: {e}")
    print("\nTrying with even fewer fields...")
    minimal = {"user_id": USER_ID, "daily_steps": 9400}
    try:
        res2 = supabase.table("wearable_metrics").insert(minimal).execute()
        print("Minimal insert result:", res2)
    except Exception as e2:
        print(f"Minimal insert also failed: {e2}")
