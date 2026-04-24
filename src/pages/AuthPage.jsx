import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import API_URL from "../api/config";

const AuthPage = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (response.status === 401) {
        setError("No account found with this email. Please sign up first.");
        return;
      }

      if (response.status === 400) {
        setError(data.detail || "This email is already registered. Please log in.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      if (isLogin) {
        const token = data.access_token || data.token;
        localStorage.setItem("token", token);
        login({ name: data.user?.name || email.split("@")[0], email }, token);
        
        // Auto-generate API key if one isn't already saved
        const existingKey = localStorage.getItem("api_key");
        if (!existingKey) {
          try {
            const keyResponse = await fetch(`${API_URL}/api/generate-key`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            });
            const keyData = await keyResponse.json();
            if (keyData.api_key) {
              localStorage.setItem("api_key", keyData.api_key);
              console.log("API key generated and saved:", keyData.api_key.substring(0, 12) + "...");
            } else {
              console.error("Key generation returned:", keyData);
            }
          } catch (keyErr) {
            console.error("Failed to generate API key:", keyErr);
          }
        }

        navigate("/dashboard/analysis", { replace: true });
      } else {
        localStorage.setItem("pendingName", name);
        navigate("/login");
      }

    } catch (err) {
      if (err.name === "AbortError") {
        setError("Server is starting up, please wait a moment and try again.");
      } else {
        setError(err.message || "Failed to reach server. Please try again.");
      }
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
              {loading ? <span>Processing...</span> : isLogin ? "Sign In →" : "Get Started →"}
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