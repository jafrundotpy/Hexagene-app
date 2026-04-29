// ✅ Production API Configuration
// Central place to manage backend URL — never hardcode localhost in components

const API_URL = import.meta.env.VITE_API_BASE || "https://hexagene-app.onrender.com";

export default API_URL;
