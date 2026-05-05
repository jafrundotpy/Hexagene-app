import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Microscope,
  ShieldCheck,
  Download,
  Share2,
  FileText,
  Stethoscope,
  Target,
  FlaskConical,
  TrendingUp,
  Brain,
  RefreshCw,
  Info,
  Flame
} from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import RadarChart from "../../components/dashboard/RadarChart";
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

    const patient_data = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() !== "") {
        patient_data[key] = parseFloat(value);
      }
    });

    if (Object.keys(patient_data).length === 0) {
      setError("Please enter at least one biomarker to begin analysis.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/v2/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "merlin123merlin123"
        },
        body: JSON.stringify({ patient_data }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      const mappedAxes = [
        { axis: 'Structural', value: (data.position.axes.structural || 0) * 100 },
        { axis: 'Inflammatory', value: (data.position.axes.inflammatory || 0) * 100 },
        { axis: 'Metabolic', value: (data.position.axes.metabolic || 0) * 100 },
        { axis: 'Redox', value: (data.position.axes.redox || 0) * 100 },
        { axis: 'Kinetic', value: (data.position.axes.kinetic || 0) * 100 },
        { axis: 'Balance', value: (data.position.axes.balance || 0) * 100 },
      ];

      setResult({ ...data, radarData: mappedAxes });
      
      setTimeout(() => {
        const resultSection = document.getElementById('analysis-results');
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hexa-secondary/10 border border-hexa-secondary/20 text-hexa-secondary text-[10px] font-bold uppercase tracking-widest animate-pulse-slow">
            <Microscope size={12} />
            Clinical Diagnostic Interface
          </div>
          <h1 className="text-4xl font-heading font-bold">Biomarker <span className="text-gradient">Analysis</span></h1>
          <p className="text-white/50 max-w-2xl">
            Input laboratory biomarkers to generate a comprehensive S21 clinical profile. 
            The engine calculates multidimensional risk across six biological axes.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button className="btn-outline flex items-center gap-2 py-3 px-5">
            <Download size={18} />
            <span>Export Template</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border bg-hexa-danger/10 border-hexa-danger/20 text-hexa-danger text-sm flex items-center gap-3 animate-shake">
          <AlertCircle size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT SECTION */}
        <div className="lg:col-span-12">
          <div className="glass-card p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-hexa-secondary/5 blur-[100px] -z-10" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-hexa-secondary/10 rounded-xl text-hexa-secondary">
                <FlaskConical size={24} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">Laboratory Data Input</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">S21 CORE PANEL</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { id: "crp", label: "C-Reactive Protein (CRP)", placeholder: "mg/L", icon: <Flame size={16} /> },
                { id: "hba1c", label: "HbA1c (Glycated Hemoglobin)", placeholder: "%", icon: <Target size={16} /> },
                { id: "albumin", label: "Serum Albumin", placeholder: "g/dL", icon: <ShieldCheck size={16} /> },
                { id: "egfr", label: "eGFR (Kidney Function)", placeholder: "mL/min/1.73m²", icon: <Activity size={16} /> },
                { id: "rdw", label: "RDW (Red Cell Distribution)", placeholder: "%", icon: <TrendingUp size={16} /> },
                { id: "uric_acid", label: "Uric Acid", placeholder: "mg/dL", icon: <FlaskConical size={16} /> },
              ].map((field) => (
                <div key={field.id} className="space-y-2 group">
                  <div className="flex items-center gap-2 ml-1">
                    <span className="text-hexa-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">{field.icon}</span>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">{field.label}</label>
                  </div>
                  <input
                    type="number"
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="input-hexa w-full bg-white/[0.02] border-white/10 focus:border-hexa-secondary/40 h-14 text-lg"
                  />
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 text-white/40 text-xs italic">
                <Info size={14} />
                <span>Entering more biomarkers increases analysis precision.</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-premium !bg-gradient-to-r from-hexa-secondary to-hexa-primary min-w-[200px] h-14 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Run S21 Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div id="analysis-results" className="lg:col-span-12 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Overall Risk Score"
                value={result.position.risk_score.toFixed(1)}
                unit="%"
                color={result.position.risk_score > 60 ? "danger" : result.position.risk_score > 30 ? "warning" : "success"}
                icon={<Activity size={24} />}
              />
              <MetricCard 
                title="Classification"
                value={result.position.classification}
                unit="State"
                color="secondary"
                icon={<Brain size={24} />}
              />
              <MetricCard 
                title="Compute Latency"
                value={result.compute_time_ms}
                unit="ms"
                color="accent"
                icon={<Clock size={24} />}
              />
              <MetricCard 
                title="Engine Build"
                value="v1.0.4"
                unit="S21-Ω"
                color="primary"
                icon={<Zap size={24} />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 border-white/5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-heading font-bold flex items-center gap-3">
                    <Target size={24} className="text-hexa-primary" />
                    Biological Axis Alignment
                  </h3>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <Share2 size={18} className="text-white/40" />
                  </button>
                </div>
                <div className="flex-1 min-h-[400px]">
                  <RadarChart data={result.radarData} color="#22d3ee" />
                </div>
              </div>

              <div className="glass-card p-8 border-white/5 h-full">
                <h3 className="text-xl font-heading font-bold flex items-center gap-3 mb-8">
                  <FileText size={24} className="text-hexa-secondary" />
                  Clinical Findings
                </h3>
                
                <div className="space-y-6">
                  {Object.entries(result.position.axes).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span className="text-white/50">{key}</span>
                        <span className={value > 0.7 ? "text-hexa-danger" : value > 0.4 ? "text-hexa-warning" : "text-hexa-success"}>
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${value > 0.7 ? "bg-hexa-danger" : value > 0.4 ? "bg-hexa-warning" : "bg-hexa-success"}`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-hexa-secondary/5 border border-hexa-secondary/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3 text-hexa-secondary">
                    <Stethoscope size={20} />
                    <h4 className="font-bold text-sm">Engine Insight</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    "The patient's current S21 trajectory indicates a persistent inflammatory state coupled with moderate metabolic stress. Recommend immediate axis stabilization via nutritional intervention and redox optimization."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
        <div className="flex items-center gap-4">
          <span>HexaGene Medical-Grade AI</span>
          <span className="w-1 h-1 bg-white/10 rounded-full" />
          <span>S21 Physics Theory Certified</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors">Privacy Policy</button>
          <button className="hover:text-white transition-colors">Clinical Disclosure</button>
        </div>
      </footer>
    </div>
  );
};

export default ClinicalAnalysis;