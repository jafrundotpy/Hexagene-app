import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthPage.css";
import API_URL from "../api/config";

const AuthPage = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const payload = isLogin ? { email, password } : { name, email, password };
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.access_token || data.token);
        localStorage.setItem("userEmail", email);
        navigate("/dashboard/analysis", { replace: true });
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Failed to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-glass-card">
          <div className="auth-header">
            <h2 className="auth-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? "Enter your credentials to access your dashboard." 
                : "Join us to access premium analytics."}
            </p>
          </div>
          
          {error && (
            <div className="auth-error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span>Processing...</span>
              ) : (
                isLogin ? "Sign In →" : "Get Started →"
              )}
            </button>
          </form>
          
          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/signup" : "/login"} className="auth-glow-link">
              {isLogin ? "Sign Up" : "Log In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;