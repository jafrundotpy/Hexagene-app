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
  Loader2,
  Stethoscope,
  ClipboardCheck
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
      setStatusMsg("Syncing with health database...");
      
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
      setStatusMsg("Processing biometric screenshot...");
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
      setStatusMsg("⚠️ Age and Sex are required for clinical analysis");
      return;
    }

    try {
      setLoading(true);
      setStatusMsg("Calculating health score...");
      
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

      if (!response.ok) throw new Error("Analysis engine error");
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

  const inputGroup = (title, icon, fields, colorClass) => (
    <div className="health-card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <h3 className="font-bold text-sm text-health-text">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted ml-1">{f.label}</label>
            <input 
              type="text" 
              placeholder={f.placeholder}
              className="input-health w-full py-2 px-3 !bg-health-bg/50 focus:!bg-white"
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-health-primary text-[10px] font-bold uppercase tracking-widest">
            <Stethoscope size={12} />
            Diagnostic Simulation
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">Health <span className="text-health-primary">Simulation</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Adjust your biometric markers to simulate clinical outcomes and overall health scoring.
            Connect sensors for live data or upload medical reports.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSyncWearable}
            disabled={loading}
            className="btn-health-outline flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Sync Live Data</span>
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={loading}
            className="btn-health-primary flex items-center gap-2 px-8"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
            <span>Run Analysis</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
          statusMsg.includes('❌') ? 'bg-red-50 border-red-100 text-red-600' : 
          statusMsg.includes('⚠️') ? 'bg-orange-50 border-orange-100 text-orange-600' :
          'bg-green-50 border-green-100 text-health-primary'
        }`}>
          <Info size={18} />
          <span className="font-bold">{statusMsg}</span>
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
              health-card p-10 border-dashed border-2 cursor-pointer transition-all duration-300
              ${dragOver ? 'border-health-primary bg-green-50' : 'border-health-border hover:border-health-primary hover:bg-green-50/30'}
            `}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-health-bg flex items-center justify-center text-health-muted group-hover:scale-110 transition-transform">
                {uploading ? <RefreshCw size={32} className="animate-spin" /> : <Upload size={32} />}
              </div>
              <div>
                <p className="text-lg font-bold text-health-text">Import Medical Report</p>
                <p className="text-health-muted text-sm mt-1">Drag and drop or click to upload your diagnostic screenshot</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputGroup("Patient Basics", <User />, [
              { label: "Age", key: "age", placeholder: "35" },
              { label: "Sex", key: "sex", placeholder: "M/F" }
            ], "bg-blue-50 text-blue-600")}
            
            {inputGroup("Clinical Lab", <Heart />, [
              { label: "CRP (mg/L)", key: "crp", placeholder: "1.2" },
              { label: "HbA1c (%)", key: "hba1c", placeholder: "5.4" }
            ], "bg-red-50 text-red-600")}

            {inputGroup("Readiness", <Zap />, [
              { label: "HRV (ms)", key: "hrv", placeholder: "55" },
              { label: "Resting HR", key: "restingHR", placeholder: "62" }
            ], "bg-orange-50 text-orange-600")}

            {inputGroup("Recovery", <Moon />, [
              { label: "Sleep (hrs)", key: "sleepDuration", placeholder: "7.5" },
              { label: "Stress Score", key: "stress", placeholder: "28" }
            ], "bg-indigo-50 text-indigo-600")}

            {inputGroup("Activity", <Flame />, [
              { label: "Daily Steps", key: "dailySteps", placeholder: "8500" },
              { label: "Calorie Burn", key: "calories", placeholder: "2400" }
            ], "bg-green-50 text-health-primary")}

            {inputGroup("Vitals", <Activity />, [
              { label: "Oxygen SpO2", key: "oxygen", placeholder: "98" },
              { label: "Active Min", key: "activeMinutes", placeholder: "45" }
            ], "bg-cyan-50 text-cyan-600")}
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          
          <div className="health-card p-8 bg-white overflow-hidden relative border-t-4 border-t-health-primary">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-health-text">Analysis Results</h3>
              <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${analysisRun ? 'bg-green-100 text-health-primary' : 'bg-gray-100 text-gray-400'}`}>
                {analysisRun ? 'Finalized' : 'Draft'}
              </div>
            </div>

            {analysisRun ? (
              <div className="space-y-10 animate-fade-in">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="stroke-health-surface fill-none" strokeWidth="6" />
                      <circle 
                        cx="50" cy="50" r="45" 
                        className={`fill-none transition-all duration-1000 ${riskScore > 70 ? 'stroke-red-500' : riskScore > 40 ? 'stroke-orange-500' : 'stroke-health-primary'}`} 
                        strokeWidth="10" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * riskScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black tracking-tighter text-health-text">{riskScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-health-muted mt-1">Health Score</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <p className={`text-lg font-bold ${riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-orange-600' : 'text-health-primary'}`}>
                      {riskScore > 70 ? 'High Risk Profile' : riskScore > 40 ? 'Moderate Risk Profile' : 'Optimal Health Status'}
                    </p>
                    <p className="text-sm text-health-muted">Diagnostic Classification: {analysisData?.classification || 'Stable'}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-health-border">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted mb-8 flex items-center gap-2">
                    <Activity size={14} className="text-health-primary" />
                    Biological Axis Distribution
                  </h4>
                  <div className="h-[300px]">
                    <RadarChart data={analysisData.radarData} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-health-surface rounded-2xl border border-health-border space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-health-muted">Data Confidence</p>
                    <p className="text-lg font-black text-health-primary">{Math.round((analysisData?.completeness || 0) * 100)}%</p>
                  </div>
                  <div className="p-4 bg-health-surface rounded-2xl border border-health-border space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-health-muted">Tier Status</p>
                    <p className="text-lg font-black text-health-text truncate">{analysisData?.tier || 'Ω₂₁'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center text-center space-y-4 opacity-30">
                <Dna size={64} className="text-health-primary" />
                <p className="max-w-[200px] text-sm font-bold text-health-text">Adjust biomarkers and run analysis to generate score</p>
              </div>
            )}
          </div>

          <div className="health-card p-6 bg-health-surface/50 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 text-health-text">
              <Plus size={18} className="text-health-secondary" />
              Optimization Plan
            </h4>
            <p className="text-xs text-health-muted leading-relaxed">
              Based on the simulated state, the engine recommends prioritizing <span className="text-health-primary font-bold">metabolic stabilization</span> and improved <span className="text-health-secondary font-bold">sleep hygiene</span>.
            </p>
            <button className="w-full py-3 bg-white border border-health-border hover:bg-gray-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
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