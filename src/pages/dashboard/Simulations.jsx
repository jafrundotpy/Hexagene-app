import React, { useState, useRef, useEffect } from "react";
import { 
  Activity, 
  Database, 
  Upload, 
  Zap, 
  Heart, 
  Moon, 
  Flame, 
  Navigation,
  RefreshCw,
  Dna,
  User,
  ShieldAlert,
  Info,
  ChevronRight,
  Plus,
  Loader2
} from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import RadarChart from "../../components/dashboard/RadarChart";
import API_URL from "../../api/config";

const Simulations = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisRun, setAnalysisRun] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    age: "", sex: "", albumin: "", crp: "", hba1c: "",
    egfr: "", rdw: "", uricAcid: "", restingHR: "", dailySteps: "", 
    activeMinutes: "", hrv: "", calories: "", sleepDuration: "", 
    oxygen: "", stress: ""
  });

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSyncWearable = async () => {
    try {
      setLoading(true);
      setStatusMsg("Syncing with Supabase...");
      
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {}
      }

      const response = await fetch(`${API_URL}/v2/wearable-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "merlin123merlin123" 
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) throw new Error("Failed to fetch wearable data");
      const data = await response.json();

      setForm(prev => ({
        ...prev,
        dailySteps: data.daily_steps || prev.dailySteps,
        restingHR: data.resting_heart_rate || prev.restingHR,
        sleepDuration: data.avg_sleep_hours || prev.sleepDuration,
        hrv: data.hrv || prev.hrv,
        activeMinutes: data.active_minutes || prev.activeMinutes,
        stress: data.stress_score || prev.stress,
        oxygen: data.spo2 || prev.oxygen,
        calories: data.calories_burned || prev.calories,
        age: data.age || prev.age,
        sex: data.sex || prev.sex,
      }));

      setStatusMsg("✓ Wearable data synced successfully");
    } catch (err) {
      setStatusMsg("❌ Sync failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setStatusMsg("Processing health screenshot...");
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`${API_URL}/api/ocr-wearable`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("OCR service error");
      const data = await response.json();
      
      setForm(prev => ({
        ...prev,
        ...data,
        dailySteps: data.daily_steps || prev.dailySteps,
        restingHR: data.resting_heart_rate || prev.restingHR,
        sleepDuration: data.avg_sleep_hours || prev.sleepDuration,
        hrv: data.hrv || prev.hrv,
      }));
      
      setStatusMsg("✓ Screenshot analyzed successfully");
    } catch (err) {
      setStatusMsg("❌ OCR failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!form.age || !form.sex) {
      setStatusMsg("⚠️ Age and Sex are required for analysis");
      return;
    }

    try {
      setLoading(true);
      setStatusMsg("Running S21 scoring engine...");
      
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {}
      }

      const payload = {
        user_id: userId,
        age: parseInt(form.age),
        sex: form.sex,
        daily_steps: parseFloat(form.dailySteps) || 0,
        resting_heart_rate: parseFloat(form.restingHR) || 0,
        avg_sleep_hours: parseFloat(form.sleepDuration) || 0,
        hrv: parseFloat(form.hrv) || 0,
        stress_score: parseFloat(form.stress) || 0,
        spo2: parseFloat(form.oxygen) || 0,
        calories_burned: parseFloat(form.calories) || 0,
        active_minutes: parseFloat(form.activeMinutes) || 0,
      };

      const response = await fetch(`${API_URL}/v2/score-from-wearable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "merlin123merlin123"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Scoring engine error");
      const data = await response.json();

      const pos = data.position || data;
      if (pos?.axes) {
        const mappedAxes = [
          { axis: 'Structural', value: (pos.axes.structural || 0) * 100 },
          { axis: 'Inflammatory', value: (pos.axes.inflammatory || 0) * 100 },
          { axis: 'Metabolic', value: (pos.axes.metabolic || 0) * 100 },
          { axis: 'Redox', value: (pos.axes.redox || 0) * 100 },
          { axis: 'Kinetic', value: (pos.axes.kinetic || 0) * 100 },
          { axis: 'Balance', value: (pos.axes.balance || 0) * 100 },
        ];
        setAnalysisData({ ...data, radarData: mappedAxes });
        setRiskScore(pos.risk_score !== undefined ? Math.round(pos.risk_score * 100) : 50);
        setAnalysisRun(true);
        setStatusMsg(null);
      }
    } catch (err) {
      setStatusMsg("❌ Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputGroup = (title, icon, fields) => (
    <div className="glass-card p-6 border-white/5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/5 rounded-lg text-hexa-primary">{icon}</div>
        <h3 className="font-heading font-bold text-sm tracking-wide uppercase opacity-60">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">{f.label}</label>
            <input 
              type="text" 
              placeholder={f.placeholder}
              className="input-hexa w-full !bg-white/[0.03] border-white/5 focus:border-hexa-primary/40"
              value={form[f.key]}
              onChange={(e) => updateField(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hexa-primary/10 border border-hexa-primary/20 text-hexa-primary text-[10px] font-bold uppercase tracking-widest animate-pulse-slow">
            <Zap size={12} />
            Simulation Mode Active
          </div>
          <h1 className="text-4xl font-heading font-bold">Biometric <span className="text-gradient">Simulation</span></h1>
          <p className="text-white/50 max-w-2xl">
            Fine-tune your biomarkers to see how they impact your overall risk score and biological axes. 
            Connect your wearable for live data or upload a screenshot.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSyncWearable}
            disabled={loading}
            className="btn-outline flex items-center gap-2 py-3 px-5"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Sync Wearable</span>
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={loading}
            className="btn-premium flex items-center gap-2 py-3 px-8"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Dna size={18} />}
            <span>Run Complete Analysis</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
          statusMsg.includes('❌') ? 'bg-hexa-danger/10 border-hexa-danger/20 text-hexa-danger' : 
          statusMsg.includes('⚠️') ? 'bg-hexa-warning/10 border-hexa-warning/20 text-hexa-warning' :
          'bg-hexa-success/10 border-hexa-success/20 text-hexa-success'
        }`}>
          <Info size={18} />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* UPLOAD SECTION */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            className={`
              glass-card p-10 border-dashed border-2 cursor-pointer transition-all duration-300
              ${dragOver ? 'border-hexa-primary bg-hexa-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
            `}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-hexa-primary/10 flex items-center justify-center text-hexa-primary group-hover:scale-110 transition-transform">
                {uploading ? <RefreshCw size={32} className="animate-spin" /> : <Upload size={32} />}
              </div>
              <div>
                <p className="text-lg font-bold">Upload Health Screenshot</p>
                <p className="text-white/40 text-sm mt-1">Drag and drop or click to upload your QRing dashboard</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputGroup("Demographics", <User size={18} />, [
              { label: "Age", key: "age", placeholder: "35" },
              { label: "Sex", key: "sex", placeholder: "M/F" }
            ])}
            
            {inputGroup("Clinical Markers", <Heart size={18} />, [
              { label: "CRP (mg/L)", key: "crp", placeholder: "1.2" },
              { label: "HbA1c (%)", key: "hba1c", placeholder: "5.4" }
            ])}

            {inputGroup("Performance", <Zap size={18} />, [
              { label: "HRV (ms)", key: "hrv", placeholder: "55" },
              { label: "Resting HR", key: "restingHR", placeholder: "62" }
            ])}

            {inputGroup("Recovery", <Moon size={18} />, [
              { label: "Sleep (hrs)", key: "sleepDuration", placeholder: "7.5" },
              { label: "Stress", key: "stress", placeholder: "28" }
            ])}

            {inputGroup("Activity", <Flame size={18} />, [
              { label: "Steps", key: "dailySteps", placeholder: "8500" },
              { label: "Calories", key: "calories", placeholder: "2400" }
            ])}

            {inputGroup("Vitality", <Activity size={18} />, [
              { label: "Oxygen (%)", key: "oxygen", placeholder: "98" },
              { label: "Active Min", key: "activeMinutes", placeholder: "45" }
            ])}
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          
          <div className="glass-card p-8 border-hexa-primary/20 bg-gradient-to-br from-hexa-card to-hexa-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hexa-primary/10 blur-3xl -z-10" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-heading font-bold">Analysis Results</h3>
              <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${analysisRun ? 'bg-hexa-success/20 text-hexa-success' : 'bg-white/10 text-white/40'}`}>
                {analysisRun ? 'Live' : 'Pending'}
              </div>
            </div>

            {analysisRun ? (
              <div className="space-y-10 animate-fade-in">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" 
                        className={`fill-none transition-all duration-1000 ${riskScore > 70 ? 'stroke-hexa-danger' : riskScore > 40 ? 'stroke-hexa-warning' : 'stroke-hexa-success'}`} 
                        strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * riskScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-heading font-black tracking-tighter">{riskScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Risk Score</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <p className={`text-lg font-bold ${riskScore > 70 ? 'text-hexa-danger' : riskScore > 40 ? 'text-hexa-warning' : 'text-hexa-success'}`}>
                      {riskScore > 70 ? 'High Risk Profile' : riskScore > 40 ? 'Moderate Risk Profile' : 'Low Risk Profile'}
                    </p>
                    <p className="text-sm text-white/40">S21 Engine Tier: {analysisData?.tier || 'Ω₂₁'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-hexa-primary" />
                    Biological Axis Alignment
                  </h4>
                  <div className="h-[300px]">
                    <RadarChart data={analysisData.radarData} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Completeness</p>
                    <p className="text-lg font-bold text-hexa-primary">{Math.round((analysisData?.completeness || 0) * 100)}%</p>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Classification</p>
                    <p className="text-lg font-bold text-hexa-accent truncate">{analysisData?.classification || 'Stable'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center space-y-4 opacity-30">
                <Dna size={64} className="animate-float" />
                <p className="max-w-[200px] text-sm">Enter your biomarkers and click analysis to see results</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 border-hexa-secondary/20 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Plus size={18} className="text-hexa-secondary" />
              Optimization Plan
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Based on the current S21 state, the engine recommends prioritizing metabolic stabilization and redox recovery.
            </p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              <span>View Detailed Report</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Simulations;