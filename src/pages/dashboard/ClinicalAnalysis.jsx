import React, { useEffect, useState } from "react";
import "./ClinicalAnalysis.css";
import API_URL from "../../api/config";

const formatName = (message, email) => {
  let targetString = email || message || "";
  
  const emailMatch = targetString.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch && emailMatch[1]) {
    const namePart = emailMatch[1].split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  }
  
  const fallback = targetString.replace("Welcome ", "").replace(" 🎉", "").split("@")[0];
  if (fallback && fallback.trim().length > 0) {
    return fallback.charAt(0).toUpperCase() + fallback.slice(1).toLowerCase();
  }
  
  return "User";
};

const ClinicalAnalysis = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="analysis-container" style={{ padding: "20px", color: "white" }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-container" style={{ padding: "20px", color: "#ff4d4f" }}>
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const userEmail = localStorage.getItem("userEmail") || "";
  const displayName = formatName(data?.message, userEmail);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="analysis-container" style={{ padding: "20px", color: "white" }}>
      <div className="dashboard-header" style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="user-avatar-circle" style={{ 
          width: "56px", 
          height: "56px", 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
          border: "2px solid rgba(255, 255, 255, 0.1)"
        }}>
          {initial}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", letterSpacing: "-0.02em" }}>Welcome {displayName} 👋</h1>
          <p style={{ margin: "0.25rem 0 0 0", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)" }}></span>
            Status: {data?.status || "Access granted"}
          </p>
        </div>
      </div>
      
      {data ? (
        <div className="glass-panel" style={{ 
          marginTop: "20px", 
          padding: "24px", 
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)"
        }}>
          <h3 style={{ marginTop: 0, color: "#fff", fontSize: "1.25rem" }}>System Overview</h3>
          <p style={{ color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
            All systems are active. Your analytical environment is properly configured and authenticated via JWT.
          </p>
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default ClinicalAnalysis;