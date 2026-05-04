from supabase_client import supabase
res = supabase.table("users").select("id, email").eq("email", "mary@gmail.com").execute()
print(res.data)
