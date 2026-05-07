import React, { useState, useRef } from "react";
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
  ShieldAlert,
  Info,
  Loader2,
  Stethoscope,
  ClipboardCheck,
  Droplets,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import API_URL from "../../api/config";

const Simulations = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [results, setResults] = useState(null);
  const [bridgeIp, setBridgeIp] = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    age: "35", sex: "0", hba1c: "5.4", uricAcid: "5.2",
    restingHR: "62", dailySteps: "8500", 
    activeMinutes: "45", hrv: "55", calories: "2400", 
    sleepDuration: "7.5", oxygen: "98", stress: "28"
  });

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // PRESERVED: Wearable Sync Logic
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

  // NEW: Merlin Smart Ring Sync via Mobile Bridge
  const handleSyncMerlinRing = async () => {
    if (!bridgeIp) {
      setStatusMsg("⚠️ Please enter Merlin Bridge IP address");
      return;
    }

    try {
      setLoading(true);
      setStatusMsg("Connecting to Merlin Bridge...");
      
      const response = await fetch(`http://${bridgeIp}:8080/data`, {
        mode: 'cors'
      });

      if (!response.ok) throw new Error("Bridge connection failed");
      const data = await response.json();

      setForm(prev => ({
        ...prev,
        dailySteps: data.steps || prev.dailySteps,
        restingHR: data.heartRate || prev.restingHR,
        hrv: data.hrv || prev.hrv,
        oxygen: data.spo2 || prev.oxygen,
        sleepDuration: data.sleep || prev.sleepDuration,
        stress: data.stress || prev.stress,
        calories: data.calories || prev.calories,
        activeMinutes: data.activeMinutes || prev.activeMinutes
      }));

      setStatusMsg(`✓ Live Wearable Data Synced (Battery: ${data.battery}%)`);
    } catch (err) {
      setStatusMsg("❌ Merlin Sync failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // PRESERVED: OCR Feature
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
      setStatusMsg("Calculating Hexa Health Score...");
      
      // Format input for live-sync endpoint
      const payload = {
        age: parseInt(form.age),
        sex: parseInt(form.sex),
        daily_steps: parseFloat(form.dailySteps) || 0,
        resting_heart_rate: parseFloat(form.restingHR) || 0,
        avg_sleep_hours: parseFloat(form.sleepDuration) || 0,
        hrv: parseFloat(form.hrv) || 0,
        stress_score: parseFloat(form.stress) || 0,
        spo2: parseFloat(form.oxygen) || 0,
        calories_burned: parseFloat(form.calories) || 0,
        active_minutes: parseFloat(form.activeMinutes) || 0
      };

      const response = await fetch(`${API_URL}/api/wearable/live-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "merlin123merlin123"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Hexa engine error");
      const data = await response.json();
      setResults(data);
      setStatusMsg(null);
    } catch (err) {
      setStatusMsg("❌ Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAxisBar = (label, value) => {
    const percent = Math.round(value * 100);
    return (
      <div key={label} className="space-y-1">
        <div className="flex justify-between items-end">
          <span className="text-[9px] font-bold uppercase tracking-widest text-health-muted">{label}</span>
          <span className="text-[10px] font-black text-health-text">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-health-surface rounded-full overflow-hidden border border-health-border">
          <div 
            className={`h-full transition-all duration-1000 ${percent > 70 ? 'bg-red-500' : percent > 40 ? 'bg-orange-500' : 'bg-health-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
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
            Adjust your biometric markers to simulate clinical outcomes based on the Hexa S21 engine.
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
            <span>Run Hexa Score</span>
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

      {/* MERLIN RING SYNC BRIDGE */}
      <div className="health-card p-6 bg-health-primary/5 border-health-primary/20 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-health-primary flex items-center justify-center text-white shadow-lg">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="font-bold text-health-text">Merlin Smart Ring</h3>
            <p className="text-[10px] text-health-muted uppercase font-bold tracking-tighter">BLE Bridge Integration</p>
          </div>
        </div>
        
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter Bridge IP (e.g. 192.168.1.15)"
              className="input-health w-full pl-4 pr-32 py-3 bg-white"
              value={bridgeIp}
              onChange={(e) => setBridgeIp(e.target.value)}
            />
            <button 
              onClick={handleSyncMerlinRing}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-4 bg-health-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-health-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect Wearable Device"}
            </button>
          </div>
        </div>
        
        <div className="text-[10px] text-health-muted max-w-[200px] leading-tight">
          Connect your Merlin Ring to the mobile bridge app to sync real-time biometric data.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PRESERVED: UPLOAD SECTION */}
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
                <p className="text-lg font-bold text-health-text">Import Qring Data</p>
                <p className="text-health-muted text-sm mt-1">Drag and drop or click to upload your wearable health stats</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputGroup("Patient Basics", <User />, [
              { label: "Age", key: "age", placeholder: "35" },
              { label: "Sex (0=M, 1=F)", key: "sex", placeholder: "0" }
            ], "bg-blue-50 text-blue-600")}
            
            {inputGroup("Clinical Lab", <Heart />, [
              { label: "HbA1c (%)", key: "hba1c", placeholder: "5.4" },
              { label: "Uric Acid", key: "uricAcid", placeholder: "5.2" }
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
              <h3 className="text-xl font-bold text-health-text">Simulation Results</h3>
              <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${results ? 'bg-green-100 text-health-primary' : 'bg-gray-100 text-gray-400'}`}>
                {results ? 'Hexa Powered' : 'Awaiting Data'}
              </div>
            </div>

            {results ? (
              <div className="space-y-10 animate-fade-in">
                
                {/* 1. RISK SCORE */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="stroke-health-surface fill-none" strokeWidth="6" />
                      <circle 
                        cx="50" cy="50" r="45" 
                        className={`fill-none transition-all duration-1000 ${results.position.risk_score > 0.7 ? 'stroke-red-500' : results.position.risk_score > 0.4 ? 'stroke-orange-500' : 'stroke-health-primary'}`} 
                        strokeWidth="10" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * results.position.risk_score)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-health-text">{Math.round(results.position.risk_score * 100)}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-health-muted">Risk Score</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <p className={`text-lg font-black uppercase tracking-tight ${results.position.risk_score > 0.7 ? 'text-red-600' : results.position.risk_score > 0.4 ? 'text-orange-600' : 'text-health-primary'}`}>
                      {results.position.classification} Profile
                    </p>
                  </div>
                </div>

                {/* 2. AXES */}
                <div className="pt-8 border-t border-health-border space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                    <Zap size={14} className="text-health-primary" />
                    Biological Axis Distribution
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {renderAxisBar("Structural", results.position.axes.structural)}
                    {renderAxisBar("Inflammatory", results.position.axes.inflammatory)}
                    {renderAxisBar("Metabolic", results.position.axes.metabolic)}
                    {renderAxisBar("Redox", results.position.axes.redox)}
                    {renderAxisBar("Kinetic", results.position.axes.kinetic)}
                    {renderAxisBar("Balance", results.position.axes.balance)}
                  </div>
                </div>

                {/* 8. SUMMARY */}
                <div className="p-5 bg-health-surface rounded-2xl border border-health-border space-y-2">
                  <p className="text-[11px] font-black text-health-text">{results.clinical.summary.headline}</p>
                  <p className="text-[10px] text-health-muted leading-relaxed italic line-clamp-3">{results.clinical.summary.body}</p>
                </div>

                {/* 7. ACTION ITEMS */}
                <div className="space-y-3">
                  {results.clinical.action_items.slice(0, 2).map((action, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white border border-health-border rounded-xl">
                      <Info size={16} className="text-health-primary" />
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-health-text uppercase">{action.subject}</p>
                        <p className="text-[8px] text-health-muted truncate">{action.detail}</p>
                      </div>
                      <span className="text-[8px] font-bold text-health-primary bg-green-50 px-2 py-0.5 rounded">{action.priority}</span>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="py-24 flex flex-col items-center text-center space-y-4 opacity-30">
                <Dna size={64} className="text-health-primary" />
                <p className="max-w-[200px] text-sm font-bold text-health-text">Adjust markers and run analysis to generate score</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulations;