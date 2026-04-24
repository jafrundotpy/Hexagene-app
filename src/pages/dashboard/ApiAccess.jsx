import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../api/config";
import {
  Key, Copy, RefreshCw, Eye, EyeOff, Shield,
  CheckCircle, AlertTriangle, Code, Globe, Lock, Loader2
} from "lucide-react";

const maskKey = (key) => {
  if (!key) return "";
  return key.substring(0, 12) + "••••••••••••••••••••••••" + key.slice(-6);
};

const ApiAccess = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [showKeyId, setShowKeyId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Handle new {success, keys:[]} format
        setKeys(Array.isArray(data) ? data : (data.keys || []));
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setGenerateError("Not authenticated. Please log in again.");
        return;
      }
      const res = await fetch(`${API_URL}/api/generate-key`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok && data.api_key) {
        localStorage.setItem("api_key", data.api_key);
        console.log("New API key saved:", data.api_key.substring(0, 12) + "...");
        await fetchKeys();
      } else {
        const msg = data.detail?.message || data.detail || "Failed to generate key";
        setGenerateError(msg);
        console.error("Generate key error:", data);
      }
    } catch (err) {
      setGenerateError("Network error: " + err.message);
      console.error("Failed to generate key", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id) => {
    if (confirmDeleteId === id) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/keys/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          await fetchKeys();
          setConfirmDeleteId(null);
        }
      } catch (err) {
        console.error("Failed to revoke key", err);
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
    }
  };

  const tabStyle = (tab) => ({
    padding: "8px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    background: activeTab === tab ? "rgba(79,195,247,0.15)" : "transparent",
    color: activeTab === tab ? "#4fc3f7" : "#64748b",
    borderBottom: activeTab === tab ? "2px solid #4fc3f7" : "2px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Key size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>API Settings</h1>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Manage your secure access credentials</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "2rem" }}>
        {["overview", "documentation", "security"].map((tab) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderRadius: "12px", background: "rgba(79,195,247,0.06)", border: "1px solid rgba(79,195,247,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={18} color="#4fc3f7" />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Developer Tier</span>
            </div>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: "700" }}>ACTIVE</span>
          </div>

          <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>API Keys</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "12px", marginTop: "2px" }}>Credentials for authenticating server-side requests</p>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px", background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)", border: "none", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Generate New Key
              </button>
            </div>
            {generateError && (
              <div style={{ padding: "10px 1.5rem", background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={14} />
                {generateError}
              </div>
            )}

            <div style={{ padding: "1.5rem" }}>
              {loading ? (
                <div style={{ padding: "2rem", textAlign: "center" }}><Loader2 className="animate-spin mx-auto text-hexa-primary" /></div>
              ) : keys.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {keys.map((k) => (
                    <div key={k.id} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "monospace", fontSize: "13px", color: "#4fc3f7" }}>
                        <span style={{ flex: 1 }}>{showKeyId === k.id ? k.api_key : maskKey(k.api_key)}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                            {showKeyId === k.id ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => handleCopy(k.api_key)} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#64748b" }}>
                            {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "#475569" }}>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => handleRevoke(k.id)}
                          style={{ fontSize: "11px", background: "none", border: "none", color: confirmDeleteId === k.id ? "#ef4444" : "#64748b", cursor: "pointer", fontWeight: "600" }}
                        >
                          {confirmDeleteId === k.id ? "Click to confirm revoke" : "Revoke"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>No active API keys found.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
            {[
              { label: "Active Keys", value: keys.length, sub: "Usage per user" },
              { label: "Monthly Cap", value: "10,000", sub: "Standard limit" },
              { label: "Uptime", value: "99.9%", sub: "Live status" },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "600" }}>{stat.label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: "1.4rem", fontWeight: "700", color: "#4fc3f7" }}>{stat.value}</p>
                <p style={{ margin: 0, color: "#475569", fontSize: "11px" }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENTATION TAB */}
      {activeTab === "documentation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Globe size={16} color="#4fc3f7" />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Base URL</span>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "13px", padding: "12px 16px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.15)" }}>
              {API_URL}
            </div>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Code size={16} color="#4fc3f7" />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Authentication Header</span>
            </div>
            <pre style={{ fontFamily: "monospace", fontSize: "12px", padding: "16px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)", margin: 0, overflowX: "auto" }}>
{`// Add this header to every API request
x-api-key: YOUR_API_KEY

// Example with fetch
const response = await fetch("${API_URL}/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "hx_XXXXXXXXXXXX"
  },
  body: JSON.stringify({ patient_data: { ... } })
});`}
            </pre>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[
            { icon: <Lock size={18} color="#4fc3f7" />, title: "Never expose your API key", desc: "Do not hardcode keys in frontend code. Always use server-side proxies." },
            { icon: <Shield size={18} color="#22c55e" />, title: "Secure Storage", desc: "Use environment variables to store your keys safely." },
            { icon: <RefreshCw size={18} color="#f59e0b" />, title: "Rotate Regularly", desc: "We recommend rotating your keys every 90 days." },
            { icon: <AlertTriangle size={18} color="#ef4444" />, title: "Revoke if Exposed", desc: "If a key is leaked, revoke it immediately through this dashboard." },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: "1rem", padding: "1.25rem 1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ marginTop: "2px", flexShrink: 0 }}>{item.icon}</div>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", marginBottom: "6px" }}>{item.title}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiAccess;