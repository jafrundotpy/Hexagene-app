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

  // ⭐ NEW RAW KEY (show once)
  const [generatedKey, setGeneratedKey] = useState("");

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/keys`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setKeys(Array.isArray(data) ? data : data.keys || []);
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

  // ⭐ FIXED GENERATE KEY
  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");
    setGeneratedKey("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/generate-key`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (res.ok && data.api_key) {
        // SHOW RAW KEY (hx_)
        setGeneratedKey(data.api_key);

        // refresh after delay so user can see raw key first
        setTimeout(() => {
          fetchKeys();
        }, 10000)
        await fetchKeys();
      } else {
        setGenerateError(data.detail || "Failed to generate key");
      }
    } catch (err) {
      setGenerateError(err.message);
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

        await fetch(`${API_URL}/api/keys/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setConfirmDeleteId(null);
        setGeneratedKey("");
        fetchKeys();
      } catch (err) {
        console.error(err);
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
    borderBottom:
      activeTab === tab
        ? "2px solid #4fc3f7"
        : "2px solid transparent"
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", color: "#e2e8f0" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Key size={20} color="#fff" />
          </div>

          <div>
            <h1 style={{ margin: 0 }}>API Settings</h1>
            <p style={{ margin: 0, color: "#64748b" }}>
              Manage your secure access credentials
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "2rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        {["overview", "documentation", "security"].map((tab) => (
          <button
            key={tab}
            style={tabStyle(tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* PLAN */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background: "rgba(79,195,247,0.06)",
              border: "1px solid rgba(79,195,247,0.12)"
            }}
          >
            <Shield size={16} color="#4fc3f7" /> Developer Tier
          </div>

          {/* CARD */}
          <div
            style={{
              borderRadius: "14px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            {/* TOP */}
            <div
              style={{
                padding: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: "700" }}>API Keys</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>
                  Credentials for authenticating server-side requests
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)",
                  color: "#fff",
                  fontWeight: "700",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center"
                }}
              >
                {generating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Generate New Key
              </button>
            </div>

            {/* ERROR */}
            {generateError && (
              <div style={{ padding: "12px", color: "#ef4444" }}>
                {generateError}
              </div>
            )}

            {/* ⭐ SHOW RAW KEY ONCE */}
            {generatedKey && (
              <div
                style={{
                  margin: "1rem",
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.15)"
                }}
              >
                <p
                  style={{
                    marginTop: 0,
                    fontSize: "13px",
                    color: "#22c55e",
                    fontWeight: "700"
                  }}
                >
                  Your New API Key
                </p>

                <div
                  style={{
                    fontFamily: "monospace",
                    color: "#4fc3f7",
                    wordBreak: "break-all",
                    marginBottom: "12px"
                  }}
                >
                  {generatedKey}
                </div>

                <button
                  onClick={() => handleCopy(generatedKey)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: "700"
                  }}
                >
                  {copied ? "Copied!" : "Copy Key"}
                </button>

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#94a3b8"
                  }}
                >
                  Save this now. It won’t be shown again.
                </p>
              </div>
            )}

            {/* EXISTING HASHED KEYS */}
            <div style={{ padding: "1rem" }}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : keys.length > 0 ? (
                keys.map((k) => (
                  <div
                    key={k.id}
                    style={{
                      marginBottom: "12px",
                      padding: "1rem",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.2)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          color: "#4fc3f7"
                        }}
                      >
                        {showKeyId === k.id
                          ? k.api_key
                          : maskKey(k.api_key)}
                      </span>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() =>
                            setShowKeyId(
                              showKeyId === k.id ? null : k.id
                            )
                          }
                        >
                          {showKeyId === k.id ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>

                        <button onClick={() => handleCopy(k.api_key)}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <small style={{ color: "#64748b" }}>
                        Created:{" "}
                        {new Date(k.created_at).toLocaleDateString()}
                      </small>

                      <button
                        onClick={() => handleRevoke(k.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color:
                            confirmDeleteId === k.id
                              ? "#ef4444"
                              : "#64748b",
                          cursor: "pointer"
                        }}
                      >
                        {confirmDeleteId === k.id
                          ? "Confirm revoke"
                          : "Revoke"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b" }}>No active keys.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTATION */}
      {activeTab === "documentation" && (
        <div>
          <p>Base URL: {API_URL}</p>
          <p>x-api-key: YOUR_API_KEY</p>
        </div>
      )}

      {/* SECURITY */}
      {activeTab === "security" && (
        <div>
          <p>Never expose your API key in frontend apps.</p>
          <p>Rotate keys regularly.</p>
          <p>Revoke leaked keys immediately.</p>
        </div>
      )}
    </div>
  );
};

export default ApiAccess;