import React, { useState, useCallback, useRef, useEffect } from "react";
import { 
  Activity, 
  FlaskConical, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Dna,
  RefreshCw,
  Heart,
  Droplets,
  Microscope,
  ClipboardList,
  User,
  ShieldAlert,
  Zap,
  Info,
  FileText,
  Upload,
  FileSearch,
  Loader2,
  ShieldCheck,
  Layers,
  ArrowRight,
  ChevronDown,
  Smartphone,
  Link,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Activity as ActivityIcon
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import API_URL from "../../api/config";
import MetricCard from "../../components/dashboard/MetricCard";
import UserFriendlySummary from "../../components/dashboard/UserFriendlySummary";
import VitalsDashboard from "../../components/dashboard/vitals/VitalsDashboard";

const DRUG_LIST = [
  "Metformin", "Atorvastatin", "Simvastatin", "Rosuvastatin", 
  "Sertraline", "Fluoxetine", "Paroxetine", "Omeprazole", 
  "Esomeprazole", "Warfarin", "Clopidogrel", "Lisinopril", 
  "Amlodipine", "Metoprolol", "Ibuprofen", "Tramadol", 
  "Codeine", "Levothyroxine"
];

const LAB_MARKERS = [
  { label: "Albumin (g/dL)", name: "albumin", icon: <Droplets size={16} />, group: "Core Metabolic" },
  { label: "HbA1c (%)", name: "hba1c", icon: <Activity size={16} />, group: "Core Metabolic" },
  { label: "Glucose (mg/dL)", name: "glucose", icon: <Activity size={16} />, group: "Core Metabolic" },
  { label: "Uric Acid (mg/dL)", name: "uric_acid", icon: <Droplets size={16} />, group: "Core Metabolic" },
  { label: "Creatinine (mg/dL)", name: "creatinine", icon: <Activity size={16} />, group: "Core Metabolic" },
  { label: "eGFR", name: "egfr", icon: <Dna size={16} />, group: "Core Metabolic" },
  
  { label: "CRP (mg/L)", name: "crp", icon: <Heart size={16} />, group: "Inflammatory" },
  { label: "RDW (%)", name: "rdw", icon: <Activity size={16} />, group: "Inflammatory" },
  { label: "NLR", name: "nlr", icon: <Activity size={16} />, group: "Inflammatory" },
  
  { label: "Triglycerides", name: "triglycerides", icon: <Droplets size={16} />, group: "Lipids" },
  { label: "HDL Cholesterol", name: "hdl", icon: <Heart size={16} />, group: "Lipids" },
  { label: "LDL Cholesterol", name: "ldl", icon: <Heart size={16} />, group: "Lipids" },
  
  { label: "Hemoglobin", name: "hemoglobin", icon: <Activity size={16} />, group: "Hematology" },
  { label: "WBC Count", name: "wbc", icon: <Activity size={16} />, group: "Hematology" },
  { label: "Platelets", name: "platelets", icon: <Activity size={16} />, group: "Hematology" },
  
  { label: "ALT (U/L)", name: "alt", icon: <Droplets size={16} />, group: "Organ Function" },
  { label: "AST (U/L)", name: "ast", icon: <Droplets size={16} />, group: "Organ Function" },
  { label: "TSH (mIU/L)", name: "tsh", icon: <Zap size={16} />, group: "Organ Function" },
  { label: "Ferritin (ng/mL)", name: "ferritin", icon: <Zap size={16} />, group: "Organ Function" },
];

const ClinicalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [results, setResults] = useState(null);
  const [debugData, setDebugData] = useState({
    request: null,
    response: null,
    endpoint: null,
    latency: null,
    error: null
  });

  const [form, setForm] = useState({
    age: "45",
    sex: "0",
    labs: {
      albumin: "", crp: "", hba1c: "", egfr: "", rdw: "", uric_acid: "",
      hemoglobin: "", triglycerides: "", hdl: "", ldl: "",
      creatinine: "", glucose: "", tsh: "", ferritin: "",
      wbc: "", platelets: "", alt: "", ast: "", nlr: ""
    },
    medications: [],
    raw_23andme: ""
  });

  const [wearableData, setWearableData] = useState({
    windowDays: 21,
    hrv: ['', '', '', '', '', '', ''],
    restingHr: ['', '', '', '', '', '', ''],
    cgmGlucose: ['', '', '', '', '', '', ''],
    steps: ['', '', '', '', '', '', ''],
    sleep: ['', '', '', '', '', '', ''],
    spo2: ['', '', '', '', '', '', '']
  });
  const [showWearable, setShowWearable] = useState(true);

  const updateWearableField = (field, index, value) => {
    setWearableData(prev => ({
      ...prev,
      [field]: prev[field].map((v, i) => i === index ? value : v)
    }));
  };

  const hasWearableData = () => {
    if (!wearableData) return false;
    const streams = [
      wearableData.hrv,
      wearableData.restingHr,
      wearableData.cgmGlucose,
      wearableData.steps,
      wearableData.sleep,
      wearableData.spo2
    ];
    return streams.some(stream => 
      Array.isArray(stream) && stream.some(v => v !== undefined && v !== null && String(v).trim() !== "")
    );
  };

  const resultsRef = useRef(null);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleLabChange = (e) => {
    setForm({
      ...form,
      labs: { ...form.labs, [e.target.name]: e.target.value }
    });
  };

  const handleMedsChange = (med) => {
    const newMeds = form.medications.includes(med)
      ? form.medications.filter(m => m !== med)
      : [...form.medications, med];
    setForm({ ...form, medications: newMeds });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setExtracting(true);
    setError(null);
    setSuccess(null);

    try {
      // Send PDF directly to backend — OpenRouter is called server-side
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/extract-labs`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      const extractedLabs = data.labs;

      setForm(prev => ({
        ...prev,
        labs: {
          ...prev.labs,
          ...Object.fromEntries(
            Object.entries(extractedLabs).map(([k, v]) => [k, v === null ? "" : String(v)])
          )
        }
      }));
      setSuccess(`Lab values extracted successfully!`);
    } catch (err) {
      console.error("Extraction Error:", err);
      setError(`Extraction Error: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const t0 = performance.now();
    let currentStep = "Intake";
    
    try {
      const apiKey = "merlin123merlin123";
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      };

      const intakePayload = {
        demographics: {
          age: parseInt(form.age),
          sex: parseInt(form.sex)
        },
        labs: Object.fromEntries(
          Object.entries(form.labs).filter(([_, v]) => v !== "").map(([k, v]) => [k, v])
        ),
        medications: form.medications,
        raw_23andme: form.raw_23andme
      };

      setDebugData({
        request: intakePayload,
        endpoint: `${API_URL}/v2/intake`,
        response: null,
        latency: null,
        error: null
      });

      // 1. Intake
      const intakeRes = await fetch(`${API_URL}/v2/intake`, {
        method: "POST",
        headers,
        body: JSON.stringify(intakePayload)
      });
      if (!intakeRes.ok) throw new Error("Intake failed");
      const intakeData = await intakeRes.json();

      // 2. Score
      currentStep = "Scoring";
      
      const scorePayload = {
        ...intakeData.patient
      };

      if (hasWearableData()) {
        const cleanStream = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr
            .map(v => (v === undefined || v === null || String(v).trim() === "") ? null : Number(v))
            .filter(v => v !== null && !isNaN(v));
        };

        const streams = {};
        const hrvCleaned = cleanStream(wearableData.hrv);
        const restingHrCleaned = cleanStream(wearableData.restingHr);
        const cgmCleaned = cleanStream(wearableData.cgmGlucose);
        const stepsCleaned = cleanStream(wearableData.steps);
        const sleepCleaned = cleanStream(wearableData.sleep);
        const spo2Cleaned = cleanStream(wearableData.spo2);

        if (hrvCleaned.length > 0) streams.hrv = hrvCleaned;
        if (restingHrCleaned.length > 0) {
          streams.resting_hr = restingHrCleaned;
          streams.resting_heart_rate = restingHrCleaned;
        }
        if (cgmCleaned.length > 0) streams.cgm_mean_glucose = cgmCleaned;
        if (stepsCleaned.length > 0) {
          streams.steps = stepsCleaned;
          streams.daily_steps = stepsCleaned;
        }
        if (sleepCleaned.length > 0) {
          streams.sleep_efficiency = sleepCleaned;
          streams.sleep_hours = sleepCleaned;
          streams.sleep = sleepCleaned;
        }
        if (spo2Cleaned.length > 0) streams.spo2 = spo2Cleaned;

        if (Object.keys(streams).length > 0) {
          scorePayload.vitals = {
            window_days: parseInt(wearableData.windowDays) || 21,
            streams: streams
          };
        }
      }

      const scoreRes = await fetch(`${API_URL}/v2/score`, {
        method: "POST",
        headers,
        body: JSON.stringify(scorePayload)
      });
      if (!scoreRes.ok) throw new Error("Scoring failed");
      const scoreData = await scoreRes.json();

      // /v2/score already returns the fully-enriched report:
      // position + terrain + forces + vitals + clinical — no extra /v2/report call needed.
      const finalReport = scoreData;

      const t1 = performance.now();
      setResults(finalReport);
      // Auto-switch to Vitals tab when the backend returned vitals data
      if (finalReport.vitals) {
        setActiveResultTab('vitals');
      }
      setDebugData(prev => ({
        ...prev,
        request: scorePayload,
        response: finalReport,
        endpoint: `${API_URL}/v2/score`,
        latency: Math.round(t1 - t0)
      }));
    } catch (err) {
      setError(`${currentStep} Error: ${err.message}`);
      setDebugData(prev => ({ ...prev, error: `${currentStep}: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const [expandedVariant, setExpandedVariant] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('position');

  const renderAxisBar = (label, value) => {
    const percent = Math.round(value * 100);
    return (
      <div key={label} className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-health-muted">{label}</span>
          <span className="text-xs font-black text-health-text">{percent}%</span>
        </div>
        <div className="h-2 w-full bg-health-surface rounded-full overflow-hidden border border-health-border">
          <div 
            className={`h-full transition-all duration-1000 ${percent > 70 ? 'bg-red-500' : percent > 40 ? 'bg-orange-500' : 'bg-health-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
            <Microscope size={12} />
            Diagnostic Engine Integration
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">Clinical <span className="text-health-primary">Analysis</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Professional-grade laboratory biomarker processing. Input clinical metrics to generate 
            deterministic health scores based on S21 physics.
          </p>
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={loading || extracting}
          className="btn-health-primary px-10 py-5 shadow-xl shadow-health-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {loading ? <RefreshCw size={20} className="animate-spin" /> : <FlaskConical size={20} />}
          <span className="font-bold tracking-tight">Run Hexa Analysis</span>
        </button>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-fade-in ${
          error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
        }`}>
          {error ? <ShieldAlert size={20} /> : <CheckCircle size={20} />}
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* INPUTS PANEL */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* BASICS */}
          <div className="health-card p-8 border-t-4 border-t-blue-500">
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <User className="text-blue-500" size={22} />
              Demographics
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted ml-1">Age</label>
                <input 
                  type="number" 
                  value={form.age}
                  placeholder="45"
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  className="input-health w-full opacity-70 focus:opacity-100 transition-opacity"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted ml-1">Sex</label>
                <select 
                  value={form.sex}
                  onChange={(e) => setForm({...form, sex: e.target.value})}
                  className="input-health w-full"
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* PDF UPLOAD BOX */}
          <div className="health-card p-8 border-t-4 border-t-purple-600 bg-purple-50/30">
            <h3 className="text-lg font-bold text-health-text mb-4 flex items-center gap-3">
              <FileSearch className="text-purple-600" size={22} />
              Auto-Extract Labs
            </h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-purple-500 bg-purple-100' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                {extracting ? (
                  <>
                    <Loader2 size={32} className="text-purple-600 animate-spin" />
                    <p className="text-sm font-bold text-purple-700 animate-pulse">Extracting lab values...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-health-text">📄 Upload Lab Report (PDF)</p>
                      <p className="text-[10px] text-health-muted uppercase tracking-widest font-black">[Choose PDF] Max 5MB</p>
                      <p className="text-[9px] text-purple-500/70 font-medium">Supported: PDF files only</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* LABS */}
          <div className="health-card p-8 border-t-4 border-t-green-500">
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <ClipboardList className="text-green-500" size={22} />
              Laboratory Markers
            </h3>
            <div className="space-y-8">
              {["Core Metabolic", "Inflammatory", "Lipids", "Hematology", "Organ Function"].map((group) => (
                <div key={group} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-health-muted border-b border-health-border pb-2">{group}</h4>
                  <div className="space-y-5">
                    {LAB_MARKERS.filter(m => m.group === group).map((field) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted ml-1">{field.label}</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/30">
                            {field.icon}
                          </div>
                          <input 
                            type="text" 
                            name={field.name}
                            placeholder={
                              field.name === "hba1c" ? "5.4%" :
                              field.name === "glucose" ? "90 mg/dL" :
                              field.name === "hdl" ? "50 mg/dL" :
                              field.name === "triglycerides" ? "150 mg/dL" :
                              field.name === "crp" ? "1.2" :
                              field.name === "hemoglobin" ? "14.5" :
                              field.name === "albumin" ? "4.2" :
                              field.name === "egfr" ? "90" :
                              field.name === "rdw" ? "13.0" :
                              field.name === "uric_acid" ? "5.0" :
                              field.name === "creatinine" ? "1.1" :
                              field.name === "tsh" ? "2.5" :
                              field.name === "ferritin" ? "120" :
                              field.name === "alt" ? "25" :
                              field.name === "ast" ? "22" :
                              field.name === "wbc" ? "6.5" :
                              field.name === "platelets" ? "250" :
                              field.name === "nlr" ? "2.1" :
                              "---"
                            }
                            value={form.labs[field.name]}
                            onChange={handleLabChange}
                            className="input-health w-full pl-12 opacity-60 focus:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MEDICATIONS */}
          <div className="health-card p-8 border-t-4 border-t-orange-500">
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <Zap className="text-orange-500" size={22} />
              Medications
            </h3>
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {DRUG_LIST.map(drug => (
                <button
                  key={drug}
                  onClick={() => handleMedsChange(drug)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border ${
                    form.medications.includes(drug)
                      ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-200'
                      : 'bg-white text-health-muted border-health-border hover:border-orange-200'
                  }`}
                >
                  {drug}
                </button>
              ))}
            </div>
          </div>

          {/* GENETICS */}
          <div className="health-card p-8 border-t-4 border-t-purple-500">
            <h3 className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Dna className="text-purple-500" size={22} />
                  <span className="font-bold">Genomics (23andMe)</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-[8px] font-black text-purple-600 uppercase tracking-tighter">
                  Coming Soon
                </div>
              </div>
            </h3>
            <textarea 
              placeholder="Paste raw 23andMe data here..."
              className="input-health w-full h-32 text-[10px] font-mono leading-relaxed"
              value={form.raw_23andme}
              onChange={(e) => setForm({...form, raw_23andme: e.target.value})}
            />
            <div className="mt-4 flex items-center justify-center p-6 border-2 border-dashed border-health-border rounded-2xl hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer group">
              <div className="text-center">
                <Upload size={24} className="mx-auto text-health-muted group-hover:text-purple-500 mb-2" />
                <span className="text-[10px] font-bold text-health-muted uppercase tracking-widest">Or Upload .txt File</span>
              </div>
            </div>
          </div>

          {/* WEARABLE DATA (VITALS) */}
          <div className="health-card p-8 border-t-4 border-t-blue-400">
            <h3 
              className="mb-4 cursor-pointer group flex items-center justify-between"
              onClick={() => setShowWearable(!showWearable)}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="text-blue-500" size={22} />
                <span className="font-bold group-hover:text-blue-600 transition-colors">Wearable Data (Vitals)</span>
              </div>
              <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                {showWearable ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </h3>

            {showWearable && (
              <div className="space-y-6 animate-fade-in pt-2">
                
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-black text-health-muted uppercase tracking-widest min-w-[80px]">
                    Time Window:
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="input-health w-20 text-center font-bold" 
                      value={wearableData.windowDays}
                      onChange={e => setWearableData(prev => ({...prev, windowDays: e.target.value}))}
                    />
                    <span className="text-[11px] text-slate-400">days (7-90 days recommended)</span>
                  </div>
                </div>

                <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Link size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Quick Connect (Optional)</span>
                  </div>
                  <button className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors mb-2">
                    Connect Bridge App
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">Status: ○ Disconnected</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 bg-white">
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Manual Entry (7-day window)</h4>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: "HRV (ms)", field: "hrv" },
                      { label: "Resting Heart Rate (bpm)", field: "restingHr" },
                      { label: "CGM Mean Glucose (mg/dL)", field: "cgmGlucose" },
                      { label: "Daily Steps", field: "steps" },
                      { label: "Sleep (hours)", field: "sleep" },
                      { label: "SpO2 (%)", field: "spo2" }
                    ].map((metric) => (
                      <div key={metric.field}>
                        <p className="text-[10px] font-black text-health-muted uppercase tracking-widest mb-2">{metric.label}</p>
                        <div className="grid grid-cols-7 gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].map(day => (
                            <div key={day} className="flex flex-col items-center">
                              <span className="text-[8px] text-slate-400 mb-1">D{day+1}</span>
                              <input 
                                type="number" 
                                className="input-health w-full text-center px-1 text-xs py-1.5"
                                value={wearableData[metric.field][day]}
                                onChange={e => updateWearableField(metric.field, day, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2 border border-amber-100">
                  <span className="text-amber-500">💡</span>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>Tip:</strong> For best results, provide at least 7 days of HRV and CGM data. The backend engine requires a minimum of one valid stream to generate the Vitals projection.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RESULTS PANEL */}
        <div ref={resultsRef} className="xl:col-span-8">
          {results ? (
            <div className="space-y-6 animate-fade-in">

              {/* ── EXECUTIVE SUMMARY ─────────────────────────────────── */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-health-primary/10 blur-[120px] -mr-32 -mt-32 group-hover:bg-health-primary/20 transition-all duration-1000" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-health-primary">
                      <ShieldCheck size={24} />
                      <h4 className="text-xs font-black uppercase tracking-[0.4em]">Executive Clinical Summary</h4>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight leading-tight max-w-3xl">{results.clinical.summary.headline}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-4xl font-medium">{results.clinical.summary.body}</p>
                  </div>
                </div>

                <div className="health-card p-6 bg-white/50 backdrop-blur-xl border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 px-10">
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 text-health-primary">
                        <Layers size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Level</p>
                        <p className="text-xs font-black text-slate-900 uppercase">{results.clinical.coverage.level}</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <div className="flex items-center gap-6">
                      {results.clinical.coverage.fired_projections.map(p => (
                        <div key={p} className="flex items-center gap-2 group">
                          <div className="w-5 h-5 rounded-full bg-health-primary/10 flex items-center justify-center text-health-primary group-hover:bg-health-primary group-hover:text-white transition-all">
                            <CheckCircle2 size={12} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-900 transition-colors">{p}</span>
                        </div>
                      ))}
                      {/* Vitals projection — shown when backend returned vitals block */}
                      {results.vitals && (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveResultTab('vitals')}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all" style={{ background: '#e4ebe2' }}>
                            <CheckCircle2 size={12} style={{ color: '#5f7d63' }} />
                          </div>
                          <span className="text-[10px] font-black uppercase transition-colors" style={{ color: '#5f7d63' }}>vitals</span>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5f7d63' }} />
                        </div>
                      )}
                      {results.clinical.coverage.missing_projections.map(p => (
                        <div key={p} className="flex items-center gap-2 opacity-40">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <XCircle size={12} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-health-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${results.clinical.coverage.completeness * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-900">{Math.round(results.clinical.coverage.completeness * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* ── RESULT TABS ─────────────────────────────────────────── */}
              <div className="border-b border-slate-100 flex overflow-x-auto gap-1 -mb-px">
                {[
                  { id: 'position', label: 'Position' },
                  { id: 'terrain',  label: 'Terrain'  },
                  { id: 'forces',   label: 'Forces'   },
                  { id: 'vitals',   label: 'Vitals'   },
                ].map(tab => (
                  <button
                    key={tab.id}
                    id={`result-tab-${tab.id}`}
                    onClick={() => setActiveResultTab(tab.id)}
                    role="tab"
                    aria-selected={activeResultTab === tab.id}
                    className={`result-tab${tab.id === 'vitals' ? ' result-tab-vitals' : ''}${activeResultTab === tab.id ? ' active' : ''} flex items-center gap-1.5`}
                  >
                    {tab.label}
                    {tab.id === 'vitals' && results.vitals && (
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                        style={{ background: '#5f7d63' }}
                        title="Wearable vitals projection available"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* ── POSITION TAB ────────────────────────────────────────── */}
              {activeResultTab === 'position' && (
              <div className="space-y-8 animate-fade-in">

              {/* 1. POSITION SCORE & CLASSIFICATION */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex items-center justify-between overflow-hidden relative">
                   <div className="z-10 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Composite Risk Profile</p>
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-7xl font-black text-slate-900 tracking-tighter">{results.position.risk_score.toFixed(3)}</h2>
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                          results.position.classification === 'HIGH' ? 'bg-red-500 text-white' : 
                          results.position.classification === 'MODERATE' ? 'bg-orange-500 text-white' : 
                          'bg-health-primary text-white'
                        }`}>
                          {results.position.classification} RISK
                        </div>
                      </div>
                      
                      {/* Risk Gauge */}
                      <div className="mt-8 space-y-2 max-w-xs">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Population Percentile</span>
                            <span>{Math.round(results.position.risk_score * 100)}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                results.position.risk_score > 0.7 ? 'bg-red-500' : 
                                results.position.risk_score > 0.4 ? 'bg-orange-500' : 'bg-health-primary'
                              }`} 
                              style={{ width: `${results.position.risk_score * 100}%` }}
                            />
                         </div>
                      </div>
                   </div>

                   {/* State Signature */}
                   <div className="flex flex-col items-center gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{results.position.stability} stability</p>
                        <p className="text-2xl font-black text-slate-900">S-{results.position.discrete_state}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {results.position.discrete_binary.split('').map((bit, i) => (
                          <div 
                            key={i} 
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${
                              bit === '1' ? 'bg-slate-900 shadow-sm' : 'bg-slate-200 shadow-inner'
                            }`} 
                          />
                        ))}
                      </div>
                   </div>
                </div>

                <div className="md:col-span-4 flex flex-col gap-6">
                   <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Confidence Tier</p>
                      <div className="space-y-1">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Tier {results.position.tier}</h3>
                        <p className="text-[10px] font-bold text-health-primary uppercase tracking-widest">{results.position.tier_auc}</p>
                      </div>
                   </div>
                   {results.position.missing_markers.length > 0 && (
                     <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-orange-600 mb-3">
                           <Zap size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Incomplete Data</span>
                        </div>
                        <p className="text-xs font-bold text-orange-900 leading-tight">
                          Add <span className="text-orange-600">{results.position.missing_markers.slice(0, 3).join(', ')}</span> {results.position.missing_markers.length > 3 ? 'and more' : ''} to improve confidence.
                        </p>
                     </div>
                   )}
                </div>
              </div>

              {/* USER-FRIENDLY CLINICAL SUMMARY */}
              <UserFriendlySummary backendData={results} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* 2. POSITION RADAR CHART */}
                <div className="health-card p-10 space-y-10 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-health-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="flex items-center justify-between relative z-10">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-health-muted flex items-center gap-3">
                      <Activity size={18} className="text-health-primary animate-pulse" />
                      Clinical Axis Telemetry
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">v2.0.0 Engine</span>
                  </div>
                  
                  <div className="h-[350px] w-full relative z-10 drop-shadow-2xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'STRU', A: results.position.axes.structural, conf: results.position.confidence.structural },
                        { subject: 'INFL', A: results.position.axes.inflammatory, conf: results.position.confidence.inflammatory },
                        { subject: 'METAB', A: results.position.axes.metabolic, conf: results.position.confidence.metabolic },
                        { subject: 'REDOX', A: results.position.axes.redox, conf: results.position.confidence.redox },
                        { subject: 'KIN', A: results.position.axes.kinetic, conf: results.position.confidence.kinetic },
                        { subject: 'BAL', A: results.position.axes.balance, conf: results.position.confidence.balance },
                      ]}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.1em' }} />
                        <PolarRadiusAxis domain={[0, 1]} axisLine={false} tick={false} />
                        <Radar
                          name="Axes"
                          dataKey="A"
                          stroke="#22C55E"
                          strokeWidth={3}
                          fill="url(#radarGradient)"
                          fillOpacity={0.7}
                        />
                        <defs>
                          <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                    {Object.entries(results.position.axes).map(([axis, val]) => (
                      <div key={axis} className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 text-center space-y-1 hover:bg-white transition-all hover:shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter truncate">{axis}</p>
                         <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[12px] font-black text-slate-900">{Math.round(val * 100)}%</span>
                            <div 
                              className={`w-2 h-2 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)] ${
                                results.position.confidence[axis] === 'high' ? 'bg-green-500' : 
                                results.position.confidence[axis] === 'med' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              title={`Confidence: ${results.position.confidence[axis]}`}
                            />
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 3. ORGAN SYSTEM HEALTH CARDS (MEDICAL INTELLIGENCE UPGRADE) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  { id: 'structural', title: 'VASCULAR HEALTH', icon: '🫁' },
                  { id: 'inflammatory', title: 'IMMUNE HEALTH', icon: '🛡️' },
                  { id: 'metabolic', title: 'METABOLIC HEALTH', icon: '🔥' },
                  { id: 'redox', title: 'KIDNEY HEALTH', icon: '🩺' },
                  { id: 'kinetic', title: 'CARDIAC HEALTH', icon: '💚' },
                  { id: 'balance', title: 'BALANCE HEALTH', icon: '⚖️' }
                ].map((system) => {
                  const val = results.position.axes[system.id];
                  const percent = Math.round(val * 100);
                  
                  // Visual Health State Logic (Darker, more visible colors)
                  let state = { label: 'HEALTHY', color: '#16a34a', glow: 'rgba(22, 163, 74, 0.2)', pulse: false };
                  if (percent > 85) state = { label: 'CRITICAL', color: '#dc2626', glow: 'rgba(220, 38, 38, 0.4)', pulse: true };
                  else if (percent > 70) state = { label: 'ATTENTION', color: '#ea580c', glow: 'rgba(234, 88, 12, 0.3)', pulse: true };
                  else if (percent > 50) state = { label: 'ELEVATED', color: '#d97706', glow: 'rgba(217, 119, 6, 0.25)', pulse: false };
                  else if (percent > 30) state = { label: 'STABLE', color: '#ca8a04', glow: 'rgba(202, 138, 4, 0.2)', pulse: false };

                  return (
                    <div 
                      key={system.id} 
                      className={`group relative bg-white rounded-[2rem] p-10 transition-all duration-700 hover:-translate-y-2 overflow-hidden border border-slate-100/50 ${
                        state.pulse ? 'animate-health-pulse' : ''
                      }`}
                      style={{ 
                        boxShadow: `0 10px 40px -10px ${state.glow}`
                      }}
                    >
                      {/* Intelligence Border Fill (Conic Gradient) */}
                      <div 
                        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                        style={{
                          background: `conic-gradient(from 0deg, ${state.color} ${percent}%, transparent ${percent}%)`,
                          maskImage: 'radial-gradient(circle, transparent 68%, black 70%)',
                          WebkitMaskImage: 'radial-gradient(circle, transparent 68%, black 70%)',
                        }}
                      />

                      <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                            {system.icon}
                          </div>
                          <div className="text-right">
                             <div 
                               className="text-[10px] font-black tracking-[0.3em] uppercase mb-1 transition-all duration-700"
                               style={{ color: state.color }}
                             >
                               {state.label}
                             </div>
                             <div className="flex items-center justify-end gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${state.pulse ? 'animate-ping' : ''}`} style={{ backgroundColor: state.color }} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Sync</span>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-black text-slate-900 tracking-[0.1em]">{system.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            {percent <= 30 ? 'Functioning within optimal clinical parameters.' : 
                             percent <= 50 ? 'Steady baseline with minor variance detected.' : 
                             percent <= 70 ? 'Increased load detected. Monitor trend lines.' : 
                             'System stress elevated. Requires clinical review.'}
                          </p>
                        </div>

                        {/* Subtle State Indicator (Secondary) */}
                        <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                           <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(dot => (
                                <div 
                                  key={dot} 
                                  className="w-1 h-3 rounded-full transition-all duration-500" 
                                  style={{ 
                                    backgroundColor: (percent / 20) >= dot ? state.color : '#f1f5f9',
                                    opacity: (percent / 20) >= dot ? 1 : 0.3
                                  }}
                                />
                              ))}
                           </div>
                           {/* Minimal Percentage - kept secondary as requested */}
                           <span className="text-[9px] font-black text-slate-300 tracking-widest">{percent}% VAL</span>
                        </div>
                      </div>

                      {/* Ambient Background Glow */}
                      <div 
                        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                        style={{ backgroundColor: state.color }}
                      />
                    </div>
                  );
                })}
              </div>

              </div>)}

              {/* ── TERRAIN TAB ─────────────────────────────────────────── */}
              {activeResultTab === 'terrain' && (
              <div className="space-y-8 animate-fade-in">

              {/* TERRAIN VARIANTS WITH TISSUE GROUPING */}
              {results.terrain && results.terrain.variants && results.terrain.variants.length > 0 ? (
                <div className="health-card overflow-hidden">
                  <div className="p-10 border-b border-health-border flex items-center justify-between bg-health-surface/30">
                    <div className="flex items-center gap-3">
                      <Layers size={22} className="text-purple-500" />
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-health-muted">Genetic Terrain Map</h4>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest">{results.terrain.n_scored} Scored</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-health-surface/50">
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Target</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Mutation</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Network</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Score</th>
                          <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-health-border">
                        {/* Grouping by tissue */}
                        {Array.from(new Set(results.terrain.variants.flatMap(v => v.tissues.length > 0 ? v.tissues : ['unspecified']))).map(tissue => (
                          <React.Fragment key={tissue}>
                            <tr className="bg-slate-50/50">
                              <td colSpan={5} className="px-10 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-4 border-purple-500">
                                 {tissue.replace(/_/g, ' ')}
                              </td>
                            </tr>
                            {results.terrain.variants.filter(v => 
                              (tissue === 'unspecified' && v.tissues.length === 0) || v.tissues.includes(tissue)
                            ).map((v, i) => {
                              const variantId = `${tissue}-${i}`;
                              const isExpanded = expandedVariant === variantId;
                              
                              return (
                                <React.Fragment key={variantId}>
                                  <tr 
                                    className="hover:bg-health-surface/30 transition-colors cursor-pointer"
                                    onClick={() => setExpandedVariant(isExpanded ? null : variantId)}
                                  >
                                    <td className="px-10 py-6">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-purple-50 text-purple-600">
                                           <Dna size={14} />
                                        </div>
                                        <p className="text-sm font-black text-health-text">{v.gene}</p>
                                      </div>
                                    </td>
                                    <td className="px-10 py-6 text-xs text-health-muted font-mono text-center">{v.aa_ref} → {v.aa_mut}</td>
                                    <td className="px-10 py-6 text-center">
                                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                        v.in_network ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        {v.in_network ? 'In-Network' : 'Out'}
                                      </span>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-black text-health-text text-right tabular-nums">
                                      {v.score.toLocaleString()}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                          v.risk === 'HIGH' ? 'bg-red-500 text-white' : v.risk === 'MODERATE' ? 'bg-orange-500 text-white' : 'bg-health-primary text-white'
                                        }`}>
                                          {v.risk}
                                        </span>
                                        {isExpanded ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
                                      </div>
                                    </td>
                                  </tr>
                                  {isExpanded && (
                                    <tr className="bg-slate-50/30">
                                      <td colSpan={5} className="px-16 py-10">
                                         <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Force (f3)</p>
                                              <p className="text-sm font-black text-slate-700">{v.f3?.toFixed(2) || '---'}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Delta V</p>
                                              <p className="text-sm font-black text-slate-700">{v.delta_V?.toFixed(2) || '---'}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Bond Energy</p>
                                              <p className="text-sm font-black text-slate-700">{v.bond_E?.toFixed(2) || '---'}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Ref Energy</p>
                                              <p className="text-sm font-black text-slate-700">{v.energy_ref?.toFixed(1) || '---'} kJ</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Mut Energy</p>
                                              <p className="text-sm font-black text-health-secondary">{v.energy_mut?.toFixed(1) || '---'} kJ</p>
                                            </div>
                                         </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="health-card p-12 text-center text-health-muted">No terrain data available.</div>
              )}
              </div>)}

              {/* ── FORCES TAB ──────────────────────────────────────────── */}
              {activeResultTab === 'forces' && (
              <div className="space-y-8 animate-fade-in">

              {/* FORCES — Flags & Interaction Network */}
              {(results.forces?.flags?.length > 0 || results.forces?.interactions?.length > 0) && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-4 health-card p-10 space-y-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-3">
                      <ShieldAlert size={18} className="text-red-500" />
                      Molecular Flags
                    </h4>
                    <div className="space-y-4">
                      {results.forces.flags.length > 0 ? results.forces.flags.map((f, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border flex items-start gap-5 transition-all hover:scale-[1.02] ${
                           f.severity === 'high' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-orange-50 border-orange-100 text-orange-900'
                        }`}>
                          <div className={`p-2.5 rounded-xl ${f.severity === 'high' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                             <AlertCircle size={18} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-50">{f.type.replace(/_/g, ' ')}</p>
                            <p className="text-xs font-bold leading-relaxed">{f.note}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 rounded-[2rem] bg-green-50 border border-green-100 flex items-center gap-4">
                          <CheckCircle2 size={24} className="text-health-primary" />
                          <p className="text-xs font-black uppercase tracking-widest text-health-primary">No critical force flags</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-8 health-card p-10 space-y-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-health-primary/5 blur-[100px] -mr-20 -mt-20" />
                    <div className="flex items-center justify-between relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-health-primary/60 flex items-center gap-3">
                        <RefreshCw size={18} className="text-health-primary" />
                        Interaction Network
                      </h4>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5">
                            <div className="w-3 h-0.5 bg-health-primary" />
                            <span className="text-[8px] font-black uppercase text-slate-500">Synergistic</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <div className="w-3 h-0.5 bg-slate-600 border-dashed border-t border-slate-400" />
                            <span className="text-[8px] font-black uppercase text-slate-500">Antagonistic</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      {results.forces.interactions.map((inter, i) => (
                        <div key={i} className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-all cursor-default">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                               <p className="text-[11px] font-black text-slate-200">{inter.drug1}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                               <ArrowRight size={12} className={inter.type === 'synergistic' ? 'text-health-primary' : 'text-slate-500'} />
                            </div>
                            <div className="flex-1 text-center py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                               <p className="text-[11px] font-black text-slate-200">{inter.drug2}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                             {inter.shared_targets.map(target => (
                               <span key={target} className="px-2 py-0.5 rounded bg-health-primary/10 text-health-primary text-[8px] font-black uppercase tracking-tighter">
                                 {target}
                               </span>
                             ))}
                          </div>
                          <p className="text-[9px] text-slate-400 italic text-center leading-relaxed">"{inter.note}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>)}

              {/* ── INTEGRATION & ACTIONS — shown on Position / Terrain / Forces tabs ── */}
              {activeResultTab !== 'vitals' && (
              <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* INTEGRATION */}
                <div className="health-card p-8 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                    <Activity size={14} className="text-blue-500" />
                    Cross-Axis Integration
                  </h4>
                  <div className="space-y-4">
                    {results.clinical.integration.length > 0 ? results.clinical.integration.map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <Info size={18} className="text-blue-500 flex-shrink-0" />
                        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                          <span className="font-black uppercase tracking-tighter mr-2">[{item.type.replace(/_/g, ' ')}]</span>
                          {item.note}
                        </p>
                      </div>
                    )) : (
                      <p className="text-[10px] text-health-muted italic">No significant cross-axis overlaps detected.</p>
                    )}
                  </div>
                </div>

                {/* ACTION ITEMS */}
                <div className="health-card p-10 space-y-8 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-health-muted flex items-center gap-3">
                      <FileText size={18} className="text-health-primary" />
                      Prioritised Clinical Action Items
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 bg-white px-3 py-1 rounded-full border border-slate-200">{results.clinical.action_items.length} Items</span>
                  </div>
                  <div className="space-y-4">
                    {results.clinical.action_items.sort((a, b) => {
                      const p = { high: 0, moderate: 1, low: 2 };
                      return p[a.priority] - p[b.priority];
                    }).map((action, i) => (
                      <div key={i} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-health-primary/30 transition-all cursor-default relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                          action.priority === 'high' ? 'bg-red-500' : action.priority === 'moderate' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                 action.priority === 'high' ? 'bg-red-50 text-red-600' : action.priority === 'moderate' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                               }`}>
                                 {action.priority} PRIORITY
                               </span>
                               {action.category && (
                                 <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                   {action.category}
                                 </span>
                               )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-health-primary transition-colors">{action.subject}</p>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.detail}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-health-primary/10 group-hover:text-health-primary transition-all">
                             <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>)}

              {/* ── VITALS TAB ──────────────────────────────────────────── */}
              {activeResultTab === 'vitals' && (
              <div className="py-4 animate-fade-in">
                <VitalsDashboard vitals={results.vitals} />
              </div>
              )}

            </div>
          ) : (
            <div className="health-card h-full min-h-[700px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 bg-health-surface/20">
              <div className="w-24 h-24 rounded-full bg-health-surface flex items-center justify-center text-health-muted mb-8 animate-pulse">
                <Microscope size={48} className="opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-health-text mb-3">No Clinical Results Produced</h3>
              <p className="text-health-muted max-w-sm leading-relaxed text-sm">
                Complete the laboratory, medication, and genetic profiles in the left panel and click 
                <span className="text-health-primary font-bold"> Run Hexa Analysis</span> to generate clinical scoring.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ClinicalAnalysis;