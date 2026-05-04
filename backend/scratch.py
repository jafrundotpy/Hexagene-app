import os, sys, hashlib, datetime, uuid  
from supabase_client import supabase  
from utils.api_key import hash_api_key  
raw_key = 'hx_demo_clinic_2026'  
hashed_key = hash_api_key(raw_key)  
res = supabase.table('users').select('id').limit(1).execute()  
user_id = res.data[0]['id'] if res.data else str(uuid.uuid4())  
print(f'User ID: {user_id}')  
supabase.table('api_keys').upsert({'user_id': user_id, 'api_key': hashed_key, 'is_active': True, 'usage_count': 0, 'monthly_limit': 10000, 'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()}).execute()  
print('API Key inserted/upserted successfully')  
