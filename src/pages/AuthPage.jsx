import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api/config";
import Logo from "../components/Logo";
import { Mail, Lock, User as UserIcon, ArrowRight, Terminal, Globe, Cpu, AlertCircle } from "lucide-react";

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

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

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

      if (!isActive) {
        if (response.status === 401) {
          setError("Invalid email or password.");
          return;
        }
        if (!response.ok) {
          setError("Login failed. Please try again.");
          return;
        }

        const token = data.access_token || data.token;
        localStorage.setItem("token", token);
        login({ name: data.user?.name || email.split("@")[0], email }, token);
        
        navigate("/dashboard/simulations", { replace: true });
      } else {
        if (response.status === 400) {
          setError(data.detail || "This email is already registered.");
          return;
        }
        if (!response.ok) {
          throw new Error(data.detail || "Something went wrong.");
        }
        navigate("/login");
      }

    } catch (err) {
      setError("Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hexa-deep flex overflow-hidden font-body">
      
      {/* LEFT SIDE: DECORATIVE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-hexa-panel items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-hexa-primary/10 via-transparent to-hexa-secondary/10" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-hexa-primary/10 blur-[100px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-hexa-secondary/10 blur-[100px] rounded-full animate-pulse-slow" />
        
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8 animate-float">
            <Logo size={64} />
            <span className="text-4xl font-heading font-bold tracking-tight">Hexa<span className="text-hexa-primary">Gene</span></span>
          </div>
          <h2 className="text-3xl font-heading font-bold mb-6 text-white/90 leading-tight">
            Advanced Genomic & <br />
            <span className="text-hexa-primary">Metabolic Risk Intelligence</span>
          </h2>
          <p className="text-white/50 text-lg max-w-md mx-auto leading-relaxed">
            Stateless deterministic patient scoring based on S21 physics theory. Precision health at your fingertips.
          </p>
        </div>
        
        {/* ORB DECORATION */}
        <div className="absolute bottom-10 left-10 flex items-center gap-4 p-4 glass-card border-hexa-primary/20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-xl bg-hexa-primary/10 flex items-center justify-center text-hexa-primary">
            <AlertCircle size={24} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-hexa-primary">Live Status</p>
            <p className="text-sm font-medium">Engine Active: v{import.meta.env.VITE_APP_VERSION || "1.0.4"}</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-10 left-10 lg:hidden flex items-center gap-2">
          <Logo size={24} />
          <span className="text-xl font-heading font-bold">HexaGene</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
              {isActive ? "Join HexaGene" : "Welcome Back"}
            </h1>
            <p className="text-white/50">
              {isActive ? "Start your journey to biological optimization." : "Sign in to access your clinical intelligence dashboard."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center py-3 px-4 glass-card glass-card-hover border-white/10 rounded-xl transition-all">
                <Globe size={20} className="text-white/60" />
              </button>
              <button className="flex items-center justify-center py-3 px-4 glass-card glass-card-hover border-white/10 rounded-xl transition-all">
                <Terminal size={20} className="text-white/60" />
              </button>
              <button className="flex items-center justify-center py-3 px-4 glass-card glass-card-hover border-white/10 rounded-xl transition-all">
                <Cpu size={20} className="text-white/60" />
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-white/20 text-xs font-bold uppercase tracking-widest">or continue with email</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-hexa-danger/10 border border-hexa-danger/20 rounded-xl flex items-center gap-3 text-hexa-danger text-sm animate-shake">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {isActive && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-hexa-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="input-hexa w-full pl-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-hexa-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="input-hexa w-full pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
                {!isActive && (
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-hexa-primary hover:underline">Forgot password?</Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-hexa-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-hexa w-full pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full flex items-center justify-center gap-2 group mt-8 py-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-hexa-deep/30 border-t-hexa-deep rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isActive ? "Create Account" : "Sign In"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm">
            {isActive ? "Already have an account?" : "Don't have an account?"} 
            <button 
              onClick={() => setIsActive(!isActive)}
              className="ml-2 font-bold text-white hover:text-hexa-primary transition-colors"
            >
              {isActive ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;