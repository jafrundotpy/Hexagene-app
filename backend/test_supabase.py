import asyncio
import os
import uuid
import httpx
from dotenv import load_dotenv

# Re-implementing the client logic loosely here for a quick test
load_dotenv()
URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

async def test_insert():
    print(f"Testing Supabase at {URL}...")
    headers = {
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    test_user = {
        "id": str(uuid.uuid4()),
        "name": "Debug Test",
        "email": f"debug_{uuid.uuid4().hex[:6]}@test.com",
        "password": "hashed_password_here"
    }
    
    url = f"{URL.rstrip('/')}/rest/v1/users"
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(url, headers=headers, json=test_user)
            print(f"Status Code: {res.status_code}")
            print(f"Response: {res.text}")
            if res.status_code == 201:
                print("SUCCESS: Insert worked!")
            else:
                print("FAILED: See response above.")
        except Exception as e:
            print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_insert())
