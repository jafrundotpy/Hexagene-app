import React, { useState, useRef, useEffect } from "react";
import { 
  Activity, 
  Upload, 
  Zap, 
  Heart, 
  Moon, 
  Flame, 
  RefreshCw,
  Dna,
  User,
  Info,
  Loader2,
  Stethoscope,
  ClipboardCheck,
  Bluetooth,
  Download,
  Unplug,
  AlertTriangle,
  Layers,
  ArrowRight,
  Target,
  Droplets,
  Microscope,
  CheckCircle,
  Activity as Pulse
} from "lucide-react";
import API_URL from "../../api/config";

const SimulationsPremium = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [form, setForm] = useState({
    age: "35", sex: "0", restingHR: "62", dailySteps: "8500", 
    activeMinutes: "45", hrv: "55", calories: "2400", 
    sleepDuration: "7.5", oxygen: "98", stress: "28"
  });

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/v2/score-from-wearable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "merlin123merlin123" },
        body: JSON.stringify({
          user_id: "demo",
          age: parseInt(form.age),
          sex: parseInt(form.sex),
          daily_steps: parseFloat(form.dailySteps),
          resting_heart_rate: parseFloat(form.restingHR),
          avg_sleep_hours: parseFloat(form.sleepDuration),
          hrv: parseFloat(form.hrv),
          stress_score: parseFloat(form.stress),
          spo2: parseFloat(form.oxygen),
          calories_burned: parseFloat(form.calories),
          active_minutes: parseFloat(form.activeMinutes)
        })
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatus = (val) => {
    if (val > 0.65) return { label: "Watch", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", icon: <Zap size={14} className="text-orange-500" /> };
    return { label: "OK", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: <CheckCircle size={14} className="text-green-600" /> };
  };

  const mapOracleResults = () => {
    if (!results) return null;
    const a = results.position.axes;
    return [
      { name: "Liver", val: a.metabolic, icon: <Heart className="text-red-400" /> },
      { name: "Immune", val: a.inflammatory, icon: <Microscope className="text-green-400" /> },
      { name: "Low T", val: a.balance, icon: <Zap className="text-orange-400" /> },
      { name: "Fibrosis", val: a.redox, icon: <Droplets className="text-blue-400" /> },
      { name: "Vascular", val: a.structural, icon: <Heart className="text-red-500" /> },
      { name: "Kidney", val: (a.metabolic + a.balance) / 2, icon: <Droplets className="text-emerald-400" /> },
    ];
  };

  const mapRiskScores = () => {
    if (!results) return null;
    const a = results.position.axes;
    return [
      { name: "Friction", val: (a.inflammatory * 0.7 + a.redox * 0.3).toFixed(2) },
      { name: "Harmony", val: (a.balance).toFixed(2) },
      { name: "Resilience", val: (a.kinetic * 2.5).toFixed(2) },
      { name: "Shear Stress", val: (a.structural * 3.0).toFixed(2) }
    ];
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8 space-y-8">
      
      {/* ORACLE HEADER */}
      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center space-y-6">
        <h1 className="text-4xl font-black text-indigo-600 flex items-center justify-center gap-2">
          HexaGene Simulation Oracle <span className="text-slate-400 text-2xl font-bold">v7.9</span>
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-6">
          <span>Wearable Stream</span>
          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <span>Real-time Manifest</span>
          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <span>S21 Manifold</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <User size={14} />
              Biometric Simulation
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Resting HR", key: "restingHR" },
                { label: "Daily Steps", key: "dailySteps" },
                { label: "HRV (ms)", key: "hrv" },
                { label: "Sleep (hrs)", key: "sleepDuration" },
                { label: "Oxygen (%)", key: "oxygen" },
                { label: "Stress", key: "stress" }
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-blue-500" 
                    value={form[f.key]} 
                    onChange={(e) => updateField(f.key, e.target.value)} 
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={handleRunAnalysis}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:brightness-110 active:scale-95 transition-all"
            >
              {loading ? <RefreshCw className="animate-spin mx-auto" /> : "Run Oracle Simulation"}
            </button>
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} />
                Oracle System Prediction
              </h3>
              
              {results ? (
                <div className="grid grid-cols-3 gap-6 animate-fade-in">
                  {mapOracleResults().map(sys => {
                    const status = getSystemStatus(sys.val);
                    return (
                      <div key={sys.name} className={`rounded-2xl p-6 border-2 flex flex-col items-center justify-center text-center space-y-3 ${status.bg} ${status.border}`}>
                         {sys.icon}
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sys.name}</div>
                         <div className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                            {status.label}
                         </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 opacity-20">
                  <Pulse size={48} className="mx-auto text-slate-400 animate-pulse" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connect Simulation Feed</p>
                </div>
              )}
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope size={14} />
                Derived Risk Metrics
              </h3>
              <div className="space-y-2">
                {results ? mapRiskScores().map(score => (
                  <div key={score.name} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 px-4">
                     <span className="text-sm font-bold text-slate-400">{score.name}</span>
                     <span className="text-xl font-black text-green-600">{score.val}</span>
                  </div>
                )) : (
                  [1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationsPremium;
