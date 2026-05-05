import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api/config";
import Logo from "../components/Logo";
import { Mail, Lock, User as UserIcon, ArrowRight, Terminal, Globe, Cpu, AlertCircle, CheckCircle } from "lucide-react";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isActive, setIsActive] = useState(mode === "signup");

  useEffect(() => {
    setIsActive(mode === "signup");
    setError("");
  }, [mode]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    const [loadingMessage, setLoadingMessage] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
  
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
  
      if (isActive && !name.trim()) {
        setError("Please enter your full name.");
        return;
      }
  
      setLoading(true);
      setLoadingMessage(isActive ? "Creating account..." : "Logging in...");
  
      const performRequest = async (retries = 2) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
  
          const endpoint = !isActive ? "/auth/login" : "/auth/signup";
          const payload = !isActive ? { email, password } : { name, email, password };
  
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
  
          clearTimeout(timeout);
          const data = await response.json();
  
          // Check for "Server starting up" error (common on Render free tier)
          if (response.status === 503 || (data.message && data.message.toLowerCase().includes("starting up"))) {
            if (retries > 0) {
              setLoadingMessage(`Server is waking up... retrying (${3 - retries}/2)`);
              await new Promise(r => setTimeout(r, 3000));
              return performRequest(retries - 1);
            }
          }
  
          if (!isActive) {
            if (response.status === 401) {
              setError("Invalid email or password.");
              return;
            }
            if (!response.ok) {
              setError(data.message || data.detail || "Login failed. Please try again.");
              return;
            }
  
            const token = data.access_token || data.token;
            localStorage.setItem("token", token);
            login({ name: data.user?.name || email.split("@")[0], email }, token);
            
            setLoadingMessage("Authentication successful! Redirecting...");
            setTimeout(() => navigate("/dashboard/simulations", { replace: true }), 500);
          } else {
            if (response.status === 400) {
              setError(data.detail || "This email is already registered.");
              return;
            }
            if (!response.ok) {
              throw new Error(data.detail || "Something went wrong.");
            }
            setLoadingMessage("Account created! Redirecting to login...");
            setTimeout(() => {
              setIsActive(false);
              setLoading(false);
            }, 1500);
          }
  
        } catch (err) {
          if (err.name === 'AbortError') {
            setError("Request timed out. The server might be slow to start.");
          } else {
            setError("Connection problem. Please check your internet or try again.");
          }
        } finally {
          if (!isActive || error) {
            // Only stop loading if we're not redirecting or if there's an error
            setLoading(false);
          }
        }
      };
  
      await performRequest();
    };

  return (
    <div className="min-h-screen bg-white flex font-body">
      
      {/* LEFT SIDE: CLINICAL BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-health-surface items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-2/3 h-2/3 bg-green-100/50 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-lg space-y-10">
          <Logo size={48} />
          
          <div className="space-y-6">
            <h2 className="text-4xl font-heading font-black text-health-text leading-tight">
              Trustworthy <span className="text-health-primary">Clinical Intelligence</span> at Scale.
            </h2>
            <p className="text-lg text-health-muted leading-relaxed">
              HexaGene provides medical-grade biometric analysis powered by stateless physics engines.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              "ISO 27001 Certified Infrastructure",
              "HIPAA-Compliant Data Encryption",
              "99.4% Scoring Accuracy"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-bold text-health-text bg-white p-4 rounded-2xl border border-health-border shadow-sm">
                <CheckCircle size={20} className="text-health-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-10 animate-fade-in">
          <div className="lg:hidden mb-12">
            <Logo size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-black text-health-text">
              {isActive ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-health-muted">
              {isActive ? "Start your medical diagnostic journey." : "Access your secure diagnostic dashboard."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isActive && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-health-muted ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/40" size={20} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="input-health w-full pl-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-health-muted ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/40" size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="input-health w-full pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-health-muted">Password</label>
                {!isActive && (
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-health-primary hover:underline">Forgot password?</Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/40" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-health w-full pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-health-primary w-full py-4 text-base mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-bold">{loadingMessage}</span>
                </>
              ) : (
                <>
                  <span>{isActive ? "Register Now" : "Sign In to HexaGene"}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-health-muted text-sm font-medium">
            {isActive ? "Already have an account?" : "Don't have an account yet?"} 
            <button 
              onClick={() => setIsActive(!isActive)}
              className="ml-2 font-bold text-health-primary hover:underline"
            >
              {isActive ? "Sign In" : "Register Free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;