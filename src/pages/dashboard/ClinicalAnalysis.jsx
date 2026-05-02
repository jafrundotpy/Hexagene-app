import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Watch,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import API_URL from "../../api/config";

const ClinicalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [emptyState, setEmptyState] = useState(false);

  const handleWearableAnalyze = async () => {
    setError(null);
    setResult(null);
    setEmptyState(false);
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

      if (response.status === 404) {
        setEmptyState(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        let extractedMsg = "Unable to analyze wearable data right now.";
        if (response.status === 401) extractedMsg = "Invalid API key.";
        else if (response.status === 429) extractedMsg = "Too many requests. Please wait.";
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
      let finalError = "Unable to analyze wearable data right now.";
      if (err?.message) finalError = err.message;
      setError(typeof finalError === "object" ? JSON.stringify(finalError) : finalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 max-w-[1600px] mx-auto text-white relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full"></div>

      <DashboardHeader />

      {/* HEADER */}
      <section className="mt-8">
        <div className="border border-white/10 rounded-3xl p-8 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 text-purple-400 text-sm font-semibold tracking-widest uppercase">
                <Sparkles size={16} />
                Live Wearable Analysis
              </div>
              <h1 className="text-5xl font-bold mt-4 leading-tight">
                Boss Engine <span className="text-purple-400">Integration</span>
              </h1>
              <p className="text-slate-300 mt-4 text-lg max-w-3xl leading-8">
                Run live HexaGene S21 biomarker scoring using synchronized device metrics.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Watch className="text-purple-400" size={40} />
            </div>
          </div>
        </div>
      </section>

      {/* ERROR STATE */}
      {error && (
        <div className="mt-6 border border-red-500/50 bg-red-500/10 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {emptyState && (
        <div className="mt-6 border border-amber-500/50 bg-amber-500/10 text-amber-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
          <Watch size={48} className="mb-2 opacity-80" />
          <h3 className="text-xl font-bold">No Wearable Data</h3>
          <p className="opacity-90">No wearable metrics found. Please sync device data first.</p>
        </div>
      )}

      {/* MAIN CTA CARD */}
      <section className="mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Demo Mode Active
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Activity className="text-cyan-400" size={24} />
            Wearable Data Sync
          </h2>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <ShieldCheck className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Apple Health / Google Fit</h3>
                <p className="text-sm text-slate-400">Ready to pull latest metric payload</p>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleWearableAnalyze}
                disabled={loading}
                className="flex-1 md:flex-none bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    Analyze Wearable Data
                  </>
                )}
              </button>
              {result && (
                <button
                  onClick={handleWearableAnalyze}
                  disabled={loading}
                  className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center text-slate-300 hover:text-white"
                  title="Refresh Wearable Data"
                >
                  <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
              )}
            </div>
          </div>

          {/* DISABLED MANUAL INPUTS */}
          <div className="mt-8 pt-8 border-t border-white/10 opacity-40 pointer-events-none relative">
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <div className="px-6 py-3 bg-black/80 border border-white/10 rounded-2xl text-slate-300 font-semibold tracking-wider uppercase text-sm">
                Manual Blood Inputs Disabled in Wearable Demo
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: "crp", label: "CRP" },
                { id: "hba1c", label: "HbA1c" },
                { id: "albumin", label: "Albumin" },
                { id: "egfr", label: "eGFR" },
                { id: "rdw", label: "RDW" },
                { id: "uric_acid", label: "Uric Acid" },
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">{field.label}</label>
                  <input
                    disabled
                    placeholder="Auto-synced"
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      {result && (
        <section className="mt-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid lg:grid-cols-5 gap-6 mb-8">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Risk Score</span>
              <div className="text-4xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {result.position.risk_score.toFixed(2)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Classification</span>
              <div className="text-3xl font-black mt-2 text-white">
                {result.position.classification}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Completeness</span>
              <div className="text-3xl font-black mt-2 text-purple-400">
                {(result.position.completeness * 100).toFixed(0)}%
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Data Tier</span>
              <div className="text-3xl font-black mt-2 text-purple-400">
                Tier {result.position.tier}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Compute Time</span>
              <div className="text-3xl font-black mt-2 text-white flex items-center gap-2">
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
              <div className="grid grid-cols-1 gap-5">
                {Object.entries(result.position.axes).map(([key, value]) => {
                  const conf = result.position.confidence[key];
                  const confColor = conf === "high" ? "text-green-400" : conf === "med" ? "text-amber-400" : "text-red-400";
                  
                  return (
                    <div key={key} className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col gap-3 transition-colors hover:bg-black/40">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="capitalize text-slate-200 font-semibold text-lg">{key}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-current ${confColor} bg-current/10`}>
                            {conf} conf
                          </span>
                        </div>
                        <span className="font-black text-xl text-cyan-400">{(value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-black/50 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000 ease-out"
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Activity className="text-purple-400" size={24} />
                S21 Stable Manifold Radar
              </h2>
              <div className="flex-1 w-full min-h-[400px] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={
                    Object.entries(result.position.axes).map(([key, value]) => ({
                      subject: key.charAt(0).toUpperCase() + key.slice(1),
                      A: value * 100,
                      fullMark: 100,
                    }))
                  }>
                    <PolarGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <Radar 
                      name="Axes" 
                      dataKey="A" 
                      stroke="#c084fc" 
                      strokeWidth={3}
                      fill="url(#colorUv)" 
                      fillOpacity={0.6} 
                    />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mt-10 border border-white/10 rounded-3xl bg-white/[0.03] p-6 flex flex-col lg:flex-row justify-between gap-4 text-sm text-slate-400">
        <div>© 2026 HexaGene • Live Wearable Interface</div>
        <div className="flex items-center gap-2 text-purple-400">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          {loading ? "Syncing Device Data..." : "Engine Ready"}
        </div>
      </footer>
    </div>
  );
};

export default ClinicalAnalysis;