import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import API_URL from "../api/config";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Internal state for toggling between Sign In and Sign Up views
  const [isActive, setIsActive] = useState(mode === "signup");

  // Keep internal state in sync if mode prop changes
  useEffect(() => {
    setIsActive(mode === "signup");
    setError(""); // Clear any errors when switching modes
  }, [mode]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // isSubmitLogin determines which form was submitted
  const handleSubmit = async (e, isSubmitLogin) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isSubmitLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const endpoint = isSubmitLogin ? "/auth/login" : "/auth/signup";
      const payload = isSubmitLogin ? { email, password } : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (isSubmitLogin) {
        // Login-specific status code handling
        if (response.status === 401) {
          setError("Invalid email or password.");
          return;
        }
        if (response.status === 404) {
          setError("Account not found. Please sign up.");
          return;
        }
        if (response.status === 429) {
          setError("Too many login attempts. Please wait and try again.");
          return;
        }
        if (response.status === 500 || response.status === 502 || response.status === 503) {
          setError("Server is starting up, please wait a moment and try again.");
          return;
        }
        if (!response.ok) {
          setError("Login failed. Please try again.");
          return;
        }
      } else {
        // Signup-specific status code handling
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
      }

      if (isSubmitLogin) {
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

        navigate("/dashboard/simulations", { replace: true });
      } else {
        localStorage.setItem("pendingName", name);
        // After signup, switch to login view
        navigate("/login");
      }

    } catch (err) {
      if (err.name === "AbortError") {
        setError("Server is starting up, please wait a moment and try again.");
      } else {
        setError("Connection problem. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLogin = () => {
    navigate("/login");
  };

  const handleToggleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="auth-page-wrapper">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        
        {/* SIGN UP FORM */}
        <div className="form-container sign-up">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
            <span>or use your email for registeration</span>
            {error && isActive && (
              <div className="auth-error-banner">{error}</div>
            )}
            <input 
              type="text" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
            <span>or use your email password</span>
            {error && !isActive && (
              <div className="auth-error-banner">{error}</div>
            )}
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <a href="#">Forget Your Password?</a>
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* TOGGLE PANEL */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button 
                className="hidden" 
                id="login" 
                type="button" 
                onClick={handleToggleLogin}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button 
                className="hidden" 
                id="register" 
                type="button" 
                onClick={handleToggleSignup}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;