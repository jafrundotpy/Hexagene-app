import React, { useState } from "react";
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
  ClipboardList
} from "lucide-react";
import API_URL from "../../api/config";
import MetricCard from "../../components/dashboard/MetricCard";
import RadarChart from "../../components/dashboard/RadarChart";

const ClinicalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [markers, setMarkers] = useState({
    albumin: "4.2",
    crp: "1.5",
    hba1c: "5.4",
    egfr: "95",
    rdw: "12.8",
    uric_acid: "5.2"
  });

  const handleInputChange = (e) => {
    setMarkers({ ...markers, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {}
      }

      const response = await fetch(`${API_URL}/v2/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "merlin123merlin123"
        },
        body: JSON.stringify({
          user_id: userId,
          patient_data: {
            albumin: parseFloat(markers.albumin),
            crp: parseFloat(markers.crp),
            hba1c: parseFloat(markers.hba1c),
            egfr: parseFloat(markers.egfr),
            rdw: parseFloat(markers.rdw),
            uric_acid: parseFloat(markers.uric_acid)
          }
        })
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      
      const pos = data.position || data;
      const mappedAxes = [
        { axis: 'Structural', value: (pos.axes.structural || 0) * 100 },
        { axis: 'Inflammatory', value: (pos.axes.inflammatory || 0) * 100 },
        { axis: 'Metabolic', value: (pos.axes.metabolic || 0) * 100 },
        { axis: 'Redox', value: (pos.axes.redox || 0) * 100 },
        { axis: 'Kinetic', value: (pos.axes.kinetic || 0) * 100 },
        { axis: 'Balance', value: (pos.axes.balance || 0) * 100 },
      ];

      setResults({
        ...data,
        riskScore: Math.round((pos.risk_score || 0) * 100),
        radarData: mappedAxes
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
            <Microscope size={12} />
            Diagnostic Engine
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">Clinical <span className="text-health-primary">Analysis</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Professional-grade laboratory biomarker processing. Input clinical metrics to generate 
            deterministic health scores based on S21 physics.
          </p>
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-health-primary px-10 py-4"
        >
          {loading ? <RefreshCw size={20} className="animate-spin" /> : <FlaskConical size={20} />}
          <span>Start Clinical Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* INPUTS PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="health-card p-8 border-t-4 border-t-blue-500">
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <ClipboardList className="text-blue-500" size={22} />
              Laboratory Markers
            </h3>
            
            <div className="space-y-5">
              {[
                { label: "Albumin (g/dL)", name: "albumin", icon: <Droplets size={16} /> },
                { label: "CRP (mg/L)", name: "crp", icon: <Heart size={16} /> },
                { label: "HbA1c (%)", name: "hba1c", icon: <Activity size={16} /> },
                { label: "eGFR", name: "egfr", icon: <Dna size={16} /> },
                { label: "RDW (%)", name: "rdw", icon: <Activity size={16} /> },
                { label: "Uric Acid (mg/dL)", name: "uric_acid", icon: <Droplets size={16} /> },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted">{field.label}</label>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/30">
                      {field.icon}
                    </div>
                    <input 
                      type="text" 
                      name={field.name}
                      value={markers[field.name]}
                      onChange={handleInputChange}
                      className="input-health w-full pl-12"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0" />
              <p className="text-[10px] leading-relaxed text-blue-700">
                Ensure all metrics are from within the last 30 days for maximum diagnostic precision.
              </p>
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-8">
          {results ? (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Risk Score" 
                  value={results.riskScore} 
                  unit="points"
                  icon={<Activity />}
                  color={results.riskScore > 70 ? "orange" : "green"}
                  trend="neutral"
                  trendValue="Calculated"
                />
                <MetricCard 
                  title="Analysis State" 
                  value={results.classification || "Stable"} 
                  icon={<CheckCircle />}
                  color="blue"
                />
                <MetricCard 
                  title="Engine Tier" 
                  value={results.tier || "S21-Ω"} 
                  icon={<Zap />}
                  color="purple"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="health-card p-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted mb-8">Axis Distribution</h4>
                  <div className="h-[350px]">
                    <RadarChart data={results.radarData} />
                  </div>
                </div>

                <div className="health-card p-8 bg-health-surface/50 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted">Clinical Summary</h4>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-health-text">Diagnostic Assessment</p>
                      <p className="text-xs text-health-muted leading-relaxed">
                        The current biomarker profile indicates a {results.classification?.toLowerCase() || 'stable'} biological state. 
                        Inflammatory markers (CRP) and glycemic control (HbA1c) are the primary drivers of this score.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-health-text">Key Findings</p>
                      <ul className="space-y-3">
                        {[
                          { label: 'Metabolic Stability', status: results.riskScore < 50 ? 'Optimal' : 'Needs Review' },
                          { label: 'Redox Recovery', status: 'In Progress' },
                          { label: 'Calculated Tier', status: results.tier || 'Standard' }
                        ].map((item, i) => (
                          <li key={i} className="flex items-center justify-between p-3 bg-white border border-health-border rounded-xl">
                            <span className="text-xs font-medium text-health-text">{item.label}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'Optimal' ? 'text-health-primary' : 'text-health-secondary'}`}>
                              {item.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="w-full btn-health-outline py-3 text-xs flex items-center justify-center gap-2 mt-4">
                      Download Clinical PDF
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="health-card h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
              <div className="w-20 h-20 rounded-full bg-health-surface flex items-center justify-center text-health-muted mb-6">
                <Microscope size={40} className="opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-health-text mb-2">No Analysis Results</h3>
              <p className="text-health-muted max-w-sm">
                Enter laboratory markers in the left panel and click start analysis to generate clinical scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalAnalysis;