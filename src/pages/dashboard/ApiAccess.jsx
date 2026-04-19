import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Key, Copy, RefreshCw, Eye, EyeOff, Shield,
  CheckCircle, AlertTriangle, Code, Globe, Lock
} from "lucide-react";

const generateApiKey = () => {
  const prefix = "hxg";
  const segments = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}_live_${segments()}${segments()}${segments()}`;
};

const maskKey = (key) => {
  if (!key) return "";
  return key.substring(0, 12) + "••••••••••••••••••••••••" + key.slice(-6);
};

const ApiAccess = () => {
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("userEmail") || "";
  const storageKey = `hxg_apikey_${email}`;

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(storageKey) || "");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(!!localStorage.getItem(storageKey));
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleGenerate = () => {
    const newKey = generateApiKey();
    setApiKey(newKey);
    localStorage.setItem(storageKey, newKey);
    setGenerated(true);
    setShowKey(true);
    setConfirming(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (confirming) {
      localStorage.removeItem(storageKey);
      setApiKey("");
      setGenerated(false);
      setShowKey(false);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>Settings</h1>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Manage your API keys and integrations</p>
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

          {/* Plan badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderRadius: "12px", background: "rgba(79,195,247,0.06)", border: "1px solid rgba(79,195,247,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={18} color="#4fc3f7" />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>HexaGene Developer Plan</span>
            </div>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: "700", letterSpacing: "0.5px" }}>ACTIVE</span>
          </div>

          {/* API Key Card */}
          <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>Secret API Key</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "12px", marginTop: "2px" }}>Used to authenticate requests from your application</p>
              </div>
              {generated && (
                <span style={{ fontSize: "11px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "3px 10px", borderRadius: "20px", fontWeight: "700" }}>
                  ⚠ Store this securely
                </span>
              )}
            </div>

            <div style={{ padding: "1.5rem" }}>
              {generated ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "monospace", fontSize: "13px", color: "#4fc3f7" }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {showKey ? apiKey : maskKey(apiKey)}
                    </span>
                    <button onClick={() => setShowKey(!showKey)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "2px" }}>
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#64748b", padding: "2px" }}>
                      {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={handleGenerate} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      <RefreshCw size={14} /> Regenerate Key
                    </button>
                    <button onClick={handleRevoke} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", background: confirming ? "rgba(239,68,68,0.2)" : "transparent", border: `1px solid ${confirming ? "#ef4444" : "rgba(239,68,68,0.3)"}`, color: confirming ? "#ef4444" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      <AlertTriangle size={14} /> {confirming ? "Click again to confirm revoke" : "Revoke Key"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "1.5rem" }}>No API key generated yet. Generate one to start integrating.</p>
                  <button onClick={handleGenerate} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}>
                    <Key size={16} /> Generate API Key
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
            {[
              { label: "Requests Today", value: "—", sub: "Resets at midnight UTC" },
              { label: "Monthly Limit", value: "10,000", sub: "Developer plan" },
              { label: "Avg Latency", value: "~12ms", sub: "Last 24 hours" },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: "1.25rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600" }}>{stat.label}</p>
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
              https://hexagene-app.onrender.com
            </div>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Code size={16} color="#4fc3f7" />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Authentication Header</span>
            </div>
            <pre style={{ fontFamily: "monospace", fontSize: "12px", padding: "16px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)", margin: 0, overflowX: "auto" }}>
{`// Add this header to every API request
Authorization: Bearer YOUR_API_KEY

// Example with fetch
const response = await fetch("https://hexagene-app.onrender.com/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer hxg_live_XXXXXXXXXXXX"
  },
  body: JSON.stringify({ patient_data: { ... } })
});`}
            </pre>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Code size={16} color="#4fc3f7" />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Available Endpoints</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { method: "POST", path: "/api/analyze", desc: "Run clinical analysis on patient biomarkers" },
                { method: "GET", path: "/api/status", desc: "Check engine status and latency" },
                { method: "POST", path: "/api/validate", desc: "Validate input biomarker data format" },
              ].map((ep) => (
                <div key={ep.path} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "6px", background: ep.method === "POST" ? "rgba(79,195,247,0.15)" : "rgba(34,197,94,0.15)", color: ep.method === "POST" ? "#4fc3f7" : "#22c55e", fontFamily: "monospace", minWidth: "44px", textAlign: "center" }}>
                    {ep.method}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#e2e8f0", minWidth: "160px" }}>{ep.path}</span>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[
            { icon: <Lock size={18} color="#4fc3f7" />, title: "Never expose your API key", desc: "Do not hardcode your API key in frontend JavaScript, mobile apps, or public repositories. Always call the HexaGene API from your backend server." },
            { icon: <Shield size={18} color="#22c55e" />, title: "Use environment variables", desc: "Store your key in server-side environment variables (e.g. process.env.HEXAGENE_API_KEY). Never commit .env files to Git." },
            { icon: <RefreshCw size={18} color="#f59e0b" />, title: "Rotate keys regularly", desc: "Regenerate your API key every 90 days or immediately if you suspect it has been compromised. Old keys are instantly invalidated on regeneration." },
            { icon: <AlertTriangle size={18} color="#ef4444" />, title: "Revoke immediately if compromised", desc: "If your key is ever exposed publicly, click Revoke Key immediately from the Overview tab. Contact support if you need an emergency key reset." },
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