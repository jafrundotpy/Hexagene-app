import httpx
try:
    res = httpx.get("https://hexagene-app.onrender.com/", timeout=10)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")
except Exception as e:
    print(f"Error: {e}")
