import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import API_URL from "../../api/config";

const ClinicalAnalysis = () => {
  const [formData, setFormData] = useState({
    crp: "",
    hba1c: "",
    albumin: "",
    egfr: "",
    rdw: "",
    uric_acid: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    // Validate: at least one marker entered
    const patient_data = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() !== "") {
        patient_data[key] = parseFloat(value);
      }
    });

    if (Object.keys(patient_data).length === 0) {
      setError("Please enter at least one biomarker.");
      return;
    }

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY || "PASTE_REAL_API_KEY_HERE";
      
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      };

      const response = await fetch(`${API_URL}/v2/score`, {
        method: "POST",
        headers,
        body: JSON.stringify({ patient_data }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let extractedMsg = "API Request Failed.";
        
        // 1. Check specific status codes as requested
        if (response.status === 401) extractedMsg = "Invalid API key.";
        else if (response.status === 429) extractedMsg = "Too many requests. Please wait.";
        else if (response.status === 400) extractedMsg = "Invalid patient data.";
        else if (response.status >= 500) extractedMsg = "Server error. Try again.";
        // 2. Extract safely from JSON data if available
        else if (data?.detail?.message) extractedMsg = data.detail.message;
        else if (data?.detail) {
          extractedMsg = typeof data.detail === "string" 
            ? data.detail 
            : Array.isArray(data.detail) 
              ? data.detail.map((e) => e.msg || "Invalid field").join(", ")
              : JSON.stringify(data.detail);
        } else if (data?.message) {
          extractedMsg = data.message;
        }

        throw new Error(extractedMsg);
      }

      setResult(data);
      // scroll to results
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (err) {
      // Safe fallback for any caught error (like axios shape or network failure)
      let finalError = "Failed to reach server.";
      
      if (err?.response?.data?.detail?.message) finalError = err.response.data.detail.message;
      else if (err?.response?.data?.detail) {
        finalError = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      }
      else if (err?.response?.data?.message) finalError = err.response.data.message;
      else if (err?.message) finalError = err.message;
      
      // Ensure we NEVER set an object to state
      setError(typeof finalError === "object" ? JSON.stringify(finalError) : finalError);
    } finally {
      setLoading(false);
    }
  };

  const handleWearableAnalyze = async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY || "PASTE_REAL_API_KEY_HERE";
      
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }
      
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      };

      const response = await fetch(`${API_URL}/v2/score-from-wearable`, {
        method: "POST",
        headers,
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let extractedMsg = "API Request Failed.";
        if (response.status === 401) extractedMsg = "Invalid API key.";
        else if (response.status === 429) extractedMsg = "Too many requests. Please wait.";
        else if (response.status === 404) extractedMsg = "No wearable data found for this user.";
        else if (response.status >= 500) extractedMsg = "Server error. Try again.";
        else if (data?.detail?.message) extractedMsg = data.detail.message;
        else if (data?.detail) {
          extractedMsg = typeof data.detail === "string" 
            ? data.detail 
            : Array.isArray(data.detail) 
              ? data.detail.map((e) => e.msg || "Invalid field").join(", ")
              : JSON.stringify(data.detail);
        } else if (data?.message) {
          extractedMsg = data.message;
        }
        throw new Error(extractedMsg);
      }

      setResult(data);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (err) {
      let finalError = "Failed to reach server.";
      if (err?.response?.data?.detail?.message) finalError = err.response.data.detail.message;
      else if (err?.response?.data?.detail) {
        finalError = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      }
      else if (err?.response?.data?.message) finalError = err.response.data.message;
      else if (err?.message) finalError = err.message;
      setError(typeof finalError === "object" ? JSON.stringify(finalError) : finalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 max-w-[1600px] mx-auto text-white relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full"></div>

      <DashboardHeader />

      {/* HEADER */}
      <section className="mt-8">
        <div className="border border-white/10 rounded-3xl p-8 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            <Sparkles size={16} />
            Clinical Analysis
          </div>
          <h1 className="text-5xl font-bold mt-4 leading-tight">
            Biomarker <span className="text-cyan-400">Analysis Engine</span>
          </h1>
          <p className="text-slate-300 mt-4 text-lg max-w-3xl leading-8">
            Run live HexaGene biomarker scoring using patient lab markers.
          </p>
        </div>
      </section>

      {/* ERROR STATE */}
      {error && (
        <div className="mt-6 border border-red-500/50 bg-red-500/10 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* INPUT FORM CARD */}
      <section className="mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Activity className="text-cyan-400" size={24} />
            Patient Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: "crp", label: "CRP", placeholder: "CRP" },
              { id: "hba1c", label: "HbA1c", placeholder: "HbA1c" },
              { id: "albumin", label: "Albumin", placeholder: "Albumin" },
              { id: "egfr", label: "eGFR", placeholder: "eGFR" },
              { id: "rdw", label: "RDW", placeholder: "RDW" },
              { id: "uric_acid", label: "Uric Acid", placeholder: "Uric Acid" },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleWearableAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Wearable Data
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Patient &rarr;
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      {result && (
        <section className="mt-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid lg:grid-cols-5 gap-6 mb-8">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 flex flex-col justify-between">
              <span className="text-slate-400 text-sm font-medium">Risk Score</span>
              <div className="text-4xl font-bold mt-2 text-cyan-400">
                {result.position.risk_score.toFixed(2)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 flex flex-col justify-between">
              <span className="text-slate-400 text-sm font-medium">Classification</span>
              <div className="text-3xl font-bold mt-2 text-white">
                {result.position.classification}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 flex flex-col justify-between">
              <span className="text-slate-400 text-sm font-medium">Completeness</span>
              <div className="text-3xl font-bold mt-2 text-purple-400">
                {(result.position.completeness * 100).toFixed(0)}%
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 flex flex-col justify-between">
              <span className="text-slate-400 text-sm font-medium">Data Tier</span>
              <div className="text-3xl font-bold mt-2 text-purple-400">
                Tier {result.position.tier}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 flex flex-col justify-between">
              <span className="text-slate-400 text-sm font-medium">Compute Time</span>
              <div className="text-3xl font-bold mt-2 text-white flex items-center gap-2">
                <Clock size={24} className="text-cyan-400" />
                {result.compute_time_ms}ms
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="text-cyan-400" size={24} />
                6-Axis Biomarker Position
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(result.position.axes).map(([key, value]) => (
                  <div key={key} className="bg-black/20 border border-white/10 p-5 rounded-xl">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="capitalize text-slate-300">{key}</span>
                      <span className="font-semibold text-cyan-400">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Activity className="text-purple-400" size={24} />
                Radar Visualization
              </h2>
              <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={
                    Object.entries(result.position.axes).map(([key, value]) => ({
                      subject: key.charAt(0).toUpperCase() + key.slice(1),
                      A: value * 100,
                      fullMark: 100,
                    }))
                  }>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                    <Radar name="Axes" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mt-10 border border-white/10 rounded-3xl bg-white/[0.03] p-6 flex flex-col lg:flex-row justify-between gap-4 text-sm text-slate-400">
        <div>© 2026 HexaGene • Live Clinical Interface</div>
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          {loading ? "Running HexaGene Engine..." : "Engine Ready"}
        </div>
      </footer>
    </div>
  );
};

export default ClinicalAnalysis;