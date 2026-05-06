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
  ClipboardList,
  User,
  ShieldAlert,
  Zap,
  Info,
  FileText,
  Upload
} from "lucide-react";
import API_URL from "../../api/config";
import MetricCard from "../../components/dashboard/MetricCard";

const DRUG_LIST = [
  "Metformin", "Atorvastatin", "Simvastatin", "Rosuvastatin", 
  "Sertraline", "Fluoxetine", "Paroxetine", "Omeprazole", 
  "Esomeprazole", "Warfarin", "Clopidogrel", "Lisinopril", 
  "Amlodipine", "Metoprolol", "Ibuprofen", "Tramadol", 
  "Codeine", "Levothyroxine"
];

const ClinicalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [form, setForm] = useState({
    age: "45",
    sex: "0", // 0=Male, 1=Female
    labs: {
      albumin: "4.2",
      crp: "1.5",
      hba1c: "5.4",
      egfr: "95",
      rdw: "12.8",
      uric_acid: "5.2"
    },
    medications: [],
    raw_23andme: ""
  });

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

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = "merlin123merlin123"; // Project API key
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      };

      // STEP 1: Intake
      const intakePayload = {
        demographics: {
          age: parseInt(form.age),
          sex: parseInt(form.sex)
        },
        labs: form.labs,
        medications: form.medications,
        raw_23andme: form.raw_23andme
      };

      const intakeRes = await fetch(`${API_URL}/v2/intake`, {
        method: "POST",
        headers,
        body: JSON.stringify(intakePayload)
      });
      if (!intakeRes.ok) throw new Error("Intake failed");
      const intakeData = await intakeRes.json();

      // STEP 2: Score
      const scoreRes = await fetch(`${API_URL}/v2/score`, {
        method: "POST",
        headers,
        body: JSON.stringify(intakeData.patient)
      });
      if (!scoreRes.ok) throw new Error("Scoring failed");
      const scoreData = await scoreRes.json();

      // STEP 3: Report (Enrichment)
      const reportRes = await fetch(`${API_URL}/v2/report`, {
        method: "POST",
        headers,
        body: JSON.stringify(scoreData)
      });
      if (!reportRes.ok) throw new Error("Report generation failed");
      const finalReport = await reportRes.json();

      setResults(finalReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
          className="btn-health-primary px-10 py-5 shadow-xl shadow-health-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {loading ? <RefreshCw size={20} className="animate-spin" /> : <FlaskConical size={20} />}
          <span className="font-bold tracking-tight">Run Boss Analysis</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-fade-in">
          <ShieldAlert size={20} />
          {error}
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
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  className="input-health w-full"
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

          {/* LABS */}
          <div className="health-card p-8 border-t-4 border-t-green-500">
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <ClipboardList className="text-green-500" size={22} />
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-health-muted ml-1">{field.label}</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted/30">
                      {field.icon}
                    </div>
                    <input 
                      type="text" 
                      name={field.name}
                      value={form.labs[field.name]}
                      onChange={handleLabChange}
                      className="input-health w-full pl-12"
                    />
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
            <h3 className="text-lg font-bold text-health-text mb-6 flex items-center gap-3">
              <Dna className="text-purple-500" size={22} />
              Genomics (23andMe)
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

        </div>

        {/* RESULTS PANEL */}
        <div className="xl:col-span-8">
          {results ? (
            <div className="space-y-10 animate-fade-in">
              
              {/* 1. POSITION SCORE & CLASSIFICATION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Boss Risk Score" 
                  value={Math.round(results.position.risk_score * 100)} 
                  unit="%"
                  icon={<Activity />}
                  color={results.position.classification === 'HIGH' ? "red" : results.position.classification === 'MODERATE' ? "orange" : "green"}
                />
                <MetricCard 
                  title="Classification" 
                  value={results.position.classification} 
                  icon={<ShieldAlert />}
                  color="blue"
                />
                <MetricCard 
                  title="Engine Version" 
                  value={results.version} 
                  icon={<Microscope />}
                  color="purple"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* 2. POSITION AXES (Horizontal Bar Chart) */}
                <div className="health-card p-8 space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                    <Zap size={14} className="text-health-primary" />
                    Biological Axes
                  </h4>
                  <div className="space-y-6">
                    {renderAxisBar("Structural", results.position.axes.structural)}
                    {renderAxisBar("Inflammatory", results.position.axes.inflammatory)}
                    {renderAxisBar("Metabolic", results.position.axes.metabolic)}
                    {renderAxisBar("Redox", results.position.axes.redox)}
                    {renderAxisBar("Kinetic", results.position.axes.kinetic)}
                    {renderAxisBar("Balance", results.position.axes.balance)}
                  </div>
                </div>

                {/* 5. COVERAGE */}
                <div className="health-card p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                      <CheckCircle size={14} className="text-blue-500" />
                      Data Coverage
                    </h4>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" className="stroke-health-surface fill-none" strokeWidth="4" />
                          <circle 
                            cx="50" cy="50" r="45" 
                            className="stroke-blue-500 fill-none transition-all duration-1000" 
                            strokeWidth="8" 
                            strokeDasharray="283" 
                            strokeDashoffset={283 - (283 * results.clinical.coverage.completeness)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xl font-black text-health-text">{Math.round(results.clinical.coverage.completeness * 100)}%</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-black text-health-text uppercase tracking-tight">{results.clinical.coverage.level}</p>
                        <p className="text-[10px] text-health-muted leading-relaxed">
                          {results.clinical.coverage.notes[0] || "All clinical projections active."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 8. SUMMARY */}
                  <div className="mt-10 p-6 bg-health-surface rounded-2xl border border-health-border space-y-3">
                    <p className="text-sm font-black text-health-text">{results.clinical.summary.headline}</p>
                    <p className="text-[10px] text-health-muted leading-relaxed">{results.clinical.summary.body}</p>
                  </div>
                </div>
              </div>

              {/* 3. TERRAIN VARIANTS */}
              {results.terrain && results.terrain.variants && results.terrain.variants.length > 0 && (
                <div className="health-card overflow-hidden">
                  <div className="p-8 border-b border-health-border flex items-center justify-between bg-health-surface/30">
                    <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                      <Dna size={14} className="text-purple-500" />
                      Genetic Terrain Projections
                    </h4>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold">{results.terrain.n_scored} Variants Scored</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-health-surface/50">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Gene</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Mutation</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Risk</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-health-muted text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-health-border">
                        {results.terrain.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-health-surface/30 transition-colors">
                            <td className="px-8 py-4 text-xs font-bold text-health-text">{v.gene}</td>
                            <td className="px-8 py-4 text-xs text-health-muted font-mono">{v.aa_ref}→{v.aa_mut}</td>
                            <td className="px-8 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                v.risk === 'HIGH' ? 'bg-red-100 text-red-600' : v.risk === 'MODERATE' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {v.risk}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-xs font-black text-health-text text-right">{Math.round(v.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. FORCES (Flags & Interactions) */}
              {(results.forces?.flags?.length > 0 || results.forces?.interactions?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="health-card p-8 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                      <ShieldAlert size={14} className="text-red-500" />
                      Critical Force Flags
                    </h4>
                    <div className="space-y-4">
                      {results.forces.flags.length > 0 ? results.forces.flags.map((f, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-4">
                          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-red-700 uppercase tracking-tight">{f.type.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-red-600 leading-relaxed">{f.note}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex gap-4">
                          <CheckCircle size={20} className="text-green-500" />
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">No critical flags detected.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="health-card p-8 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                      <RefreshCw size={14} className="text-orange-500" />
                      Drug Interactions
                    </h4>
                    <div className="space-y-4">
                      {results.forces.interactions.map((inter, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-health-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-health-text uppercase tracking-tight">{inter.drug1} + {inter.drug2}</span>
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">{inter.type}</span>
                          </div>
                          <p className="text-[10px] text-health-muted italic">"{inter.note}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6 & 7. INTEGRATION & ACTION ITEMS */}
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
                <div className="health-card p-8 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-health-muted flex items-center gap-2">
                    <FileText size={14} className="text-health-primary" />
                    Prioritised Action Items
                  </h4>
                  <div className="space-y-3">
                    {results.clinical.action_items.map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-health-border rounded-2xl hover:border-health-primary transition-colors cursor-default">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-health-text uppercase">{action.subject}</p>
                          <p className="text-[9px] text-health-muted">{action.detail}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                          action.priority === 'high' ? 'bg-red-500 text-white' : action.priority === 'moderate' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="health-card h-full min-h-[700px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 bg-health-surface/20">
              <div className="w-24 h-24 rounded-full bg-health-surface flex items-center justify-center text-health-muted mb-8 animate-pulse">
                <Microscope size={48} className="opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-health-text mb-3">No Clinical Results Produced</h3>
              <p className="text-health-muted max-w-sm leading-relaxed text-sm">
                Complete the laboratory, medication, and genetic profiles in the left panel and click 
                <span className="text-health-primary font-bold"> Run Boss Analysis</span> to generate clinical scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalAnalysis