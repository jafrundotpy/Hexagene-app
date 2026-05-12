import React, { useState } from 'react';
import { 
  Network, 
  Cpu, 
  Activity, 
  Shield, 
  ChevronRight, 
  Zap, 
  Globe, 
  Lock, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  Brain,
  FlaskConical,
  Database,
  ExternalLink,
  Plus,
  Microscope,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    area: 'Pharmaceutical R&D',
    problem: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-health-primary/20 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-health-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size={32} />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-health-muted hover:text-health-primary transition-colors">Features</a>
            <a href="#platform" className="text-sm font-bold text-health-muted hover:text-health-primary transition-colors">Platform</a>
            <a href="#faq" className="text-sm font-bold text-health-muted hover:text-health-primary transition-colors">Technical FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-health-text hover:text-health-primary transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="btn-health-primary py-2.5 px-6 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-green-50/50 blur-[100px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-health-primary text-[10px] font-black uppercase tracking-widest">
            <Plus size={12} />
            Medical-Grade Biometric Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-black text-health-text leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Biology is <span className="text-gradient">Measurable Physics.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-health-muted max-w-2xl mx-auto leading-relaxed">
            Deterministic clinical intelligence powered by HexaGene S21 physics theory. 
            Convert biomarkers into multi-axis risk scoring with production-ready APIs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/signup')}
              className="btn-health-primary px-10 py-4 text-base w-full sm:w-auto"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <a href="#deployment" className="btn-health-outline px-10 py-4 text-base w-full sm:w-auto flex items-center justify-center gap-2">
              Get In Touch
              <ExternalLink size={18} className="text-health-muted" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 01: HARDWARE VALIDATION */}
      <section id="validation" className="py-24 bg-[#0a0c10] text-white overflow-hidden relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* LEFT CONTENT */}
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] text-health-primary/60 uppercase">
                  <div className="w-8 h-px bg-health-primary/40" />
                  01 Hardware Validation
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-black leading-tight">
                  One architecture. Four unrelated domains. Quantum hardware.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                  The HexaGene architecture has been executed on IBM's <span className="text-white italic">ibm_fez</span> 156-qubit Heron r2 processor 
                  across more than two hundred production jobs, spanning four unrelated application domains. Only the 
                  domain inputs and the bond topology change between domains; the circuit, the gauge diagnostic, 
                  and the energy extraction are identical.
                </p>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 gap-y-12 border-t border-white/5 pt-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Backend</p>
                  <p className="text-2xl font-bold text-white">ibm_fez</p>
                  <p className="text-[10px] font-bold text-health-primary/60 uppercase">156-qubit Heron r2</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Production Jobs</p>
                  <p className="text-2xl font-bold text-white">238+</p>
                  <p className="text-[10px] font-bold text-health-primary/60 uppercase">April 2-3, 2026</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reproducibility</p>
                  <p className="text-2xl font-bold text-white">ρ = 0.9954</p>
                  <p className="text-[10px] font-bold text-health-primary/60 uppercase">two-run, 37 kernel bonds</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Partnership</p>
                  <p className="text-2xl font-bold text-white">IBM Quantum</p>
                  <p className="text-[10px] font-bold text-health-primary/60 uppercase">Network member</p>
                </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-2xl italic text-gray-300 text-sm leading-relaxed max-w-lg">
                "Gauge-symmetry error detection in a parameter-free lattice quantum simulation architecture on NISQ hardware"
                <div className="mt-4 flex items-center justify-between not-italic">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">S. H. Bachani · Merlin Digital · April 2026</span>
                  <a href="#" className="text-health-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                    Read the manuscript <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: CARDS */}
            <div className="lg:w-1/2 space-y-6">
              {[
                {
                  title: "Pharmacogenomic interactions",
                  metrics: "108Q · 18 CELLS",
                  desc: "Three clinically documented drug–drug interactions detected from first-principles physics with zero training data: CYP2C×DPYD (ΔE = -4.19), CYP2C×SCN5A (ΔE = -1.33 to -2.09), SCN5A×MTHFR (ΔE = -1.01). Healthy genome shows 71% antagonistic compensation."
                },
                {
                  title: "Catalyst substrate selectivity",
                  metrics: "108Q · 18 CELLS",
                  desc: "FeMoco-class iron-sulfur-molybdenum cluster computed at N2/H2O selectivity = +36.75 (threshold 1.0). Magnetite (Fe3O4) reaches 80.3% of biological selectivity at $0.05/kg material cost. All-iron variant achieves perfect 18/18 gauge."
                },
                {
                  title: "Cardiac disease stratification",
                  metrics: "108Q · 18 CELLS",
                  desc: "Long QT syndrome configuration shows 48x more pathway disruption than healthy baseline (ΔE = -96 vs. +2). Pharmacogenomic emergency (ANK2×CYP2D6, ΔE = -2.13) detected in disease patient — drug metabolism compounding cardiac risk."
                },
                {
                  title: "Protein-surface formulation",
                  metrics: "156Q · 26 CELLS",
                  desc: "Adalimumab Fab fragment with two excipients (trehalose, polysorbate 80). Three-body epistasis term ΔEepi = -79.30 (synergistic competition). Per-domain decomposition localises the interaction to the CH1 hinge aggregation hotspot."
                }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-health-primary/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold group-hover:text-health-primary transition-colors">{item.title}</h3>
                    <span className="text-[10px] font-mono font-bold text-health-primary/60 tracking-widest">{item.metrics}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: DETERMINISTIC FEATURE SET */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-2/5 space-y-6">
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] text-health-primary uppercase">
                <div className="w-8 h-px bg-health-primary/40" />
                03 Seven Biophysical Features
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black leading-tight text-health-text">
                The deterministic feature set.
              </h2>
              <p className="text-health-muted text-lg leading-relaxed">
                Every score returned by HexaGene is a function of these seven deterministic features. 
                None of them are learned. None of them are tuned. Each emerges from the structural physics of the sequence.
              </p>
            </div>

            <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-px bg-health-border border border-health-border rounded-3xl overflow-hidden shadow-2xl">
              {[
                { title: 'Nucleotide transition severity', desc: 'Transversions cost more energy than transitions', val: 'T = 9.51' },
                { title: 'GC-content perturbation', desc: 'Local rigidity changes from base-composition shifts', val: 'T = 7.70' },
                { title: 'Harmonic balance', desc: 'Symmetry of the central 4-base nuclear core', val: 'T = 7.36' },
                { title: 'Local sequence stiffness', desc: 'Mechanical resistance to conformational change', val: 'Validated' },
                { title: 'Codon-position impact', desc: 'Wobble vs. critical-position effects', val: 'Validated' },
                { title: 'Compositional complexity', desc: 'Information density of local context', val: 'Validated' },
                { title: 'Neighbour-codon transitions', desc: 'Elemental conflicts between adjacent codons', val: 'T = 2.33' },
                { title: 'Each feature is deterministic', desc: 'No model fitting. No training corpus. Same input → same output, always.', val: '', highlight: true }
              ].map((f, i) => (
                <div key={i} className={`p-10 ${f.highlight ? 'bg-health-primary/5' : 'bg-white'} space-y-4`}>
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-base font-bold text-health-text leading-tight">{f.title}</h4>
                    {f.val && <span className="text-[10px] font-mono font-bold text-health-primary/60 uppercase">{f.val}</span>}
                  </div>
                  <p className="text-xs text-health-muted leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: COMMERCIAL DEPLOYMENT / GET IN TOUCH */}
      <section id="deployment" className="py-24 bg-[#0a0c10] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            
            {/* LEFT CONTENT */}
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-health-primary/10 border border-health-primary/20 text-health-primary text-[10px] font-black uppercase tracking-widest">
                  <Lock size={12} />
                  Production-Ready
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black leading-tight">
                  Commercially deployable.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  HexaGene is in active commercial deployment. Engagement modes include API access, 
                  embedded integrations into client pipelines, custom validation studies, and patent licensing. 
                  Each engagement begins with a scoping conversation to match capability to use case.
                </p>
              </div>

              {/* INDUSTRIES GRID */}
              <div className="space-y-8">
                {[
                  {
                    title: "Pharmaceutical R&D",
                    desc: "Drug–drug interactions ab initio · silent-variant risk · target prioritisation · lead-series triage. Demonstrated on ibm_fez for three known interaction pairs zero-shot."
                  },
                  {
                    title: "Genomic diagnostics",
                    desc: "Variant interpretation · VUS rescue · ACMG-orthogonal evidence layer for clinical reporting. Validated across 198,494 ClinVar variants with zero tuned parameters."
                  },
                  {
                    title: "Biomanufacturing & formulation",
                    desc: "Expression-yield prediction · aggregation flagging · multi-excipient epistasis. Validated on IPNS (15 organisms, ρ = -0.92) and adalimumab Fab fragment with trehalose / polysorbate 80 (ΔEepi = -79.30)."
                  },
                  {
                    title: "Precision health & longevity",
                    desc: "Metabolic-risk inference from routine biomarkers · structural-decay tracking · early-warning panels. AUC = 0.897 on N = 29,400 NHANES participants."
                  },
                  {
                    title: "Licensing",
                    desc: "Patent licensing across the portfolio (PPA-1 through PPA-10 + non-provisional filings) for organisations integrating proprietary methods directly into in-house pipelines. Get in touch."
                  }
                ].map((ind, i) => (
                  <div key={i} className="space-y-2 border-l-2 border-health-primary/20 pl-6 py-2">
                    <h4 className="text-lg font-bold text-white">{ind.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{ind.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="lg:w-1/2">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8 relative">
                <div className="space-y-2 text-center lg:text-left">
                  <h3 className="text-2xl font-black">Tell us about your application.</h3>
                  <p className="text-gray-400 text-sm font-medium">We respond within two business days.</p>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Your name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-health-primary outline-none transition-all" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-health-primary outline-none transition-all" 
                        placeholder="john@organisation.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Organisation (optional)</label>
                    <input 
                      type="text" 
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-health-primary outline-none transition-all" 
                      placeholder="e.g. Merck, Mayo Clinic, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Area of interest</label>
                    <select 
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-health-primary outline-none transition-all appearance-none"
                    >
                      <option className="bg-[#0a0c10]">Pharmaceutical R&D</option>
                      <option className="bg-[#0a0c10]">Genomic diagnostics</option>
                      <option className="bg-[#0a0c10]">Biomanufacturing & formulation</option>
                      <option className="bg-[#0a0c10]">Precision health & longevity</option>
                      <option className="bg-[#0a0c10]">Licensing</option>
                      <option className="bg-[#0a0c10]">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">What problem are you trying to solve?</label>
                    <textarea 
                      name="problem"
                      value={formData.problem}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-health-primary outline-none transition-all resize-none" 
                      placeholder="Describe your use case..."
                    />
                  </div>

                  <button className="w-full btn-health-primary py-4 flex items-center justify-center gap-3 shadow-xl shadow-health-primary/20">
                    Send message
                    <ArrowRight size={18} />
                  </button>

                  <p className="text-[9px] text-gray-500 text-center font-medium">
                    Submissions are routed via Web3Forms. We do not share or resell contact information.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-health-border bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo size={28} />
          <div className="text-[10px] font-bold text-health-muted uppercase tracking-[0.2em]">
            © 2026 HexaGene Systems. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold text-health-muted hover:text-health-primary uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-health-muted hover:text-health-primary uppercase tracking-widest">Terms</a>
            <a href="#" className="text-[10px] font-bold text-health-muted hover:text-health-primary uppercase tracking-widest">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;