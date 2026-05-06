import React from 'react';
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import API_URL from '../api/config';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-body selection:bg-health-primary/20">
      
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
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
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
            <button className="btn-health-outline px-10 py-4 text-base w-full sm:w-auto flex items-center justify-center gap-2">
              View Documentation
              <ExternalLink size={18} className="text-health-muted" />
            </button>
          </div>

          {/* DASHBOARD PREVIEW */}
          <div className="pt-16 max-w-5xl mx-auto">
            <div className="health-card p-2 bg-health-surface shadow-2xl">
              <div className="rounded-xl overflow-hidden bg-white border border-health-border aspect-video flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-health-primary/5 group-hover:bg-transparent transition-colors" />
                <div className="text-center space-y-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto text-health-primary">
                    <Activity size={32} />
                  </div>
                  <p className="text-xs font-bold text-health-muted uppercase tracking-[0.3em]">Platform Interface v2.4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-health-border bg-health-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Calculations/sec', val: '1.2M+' },
              { label: 'Clinical Accuracy', val: '100%' },
              { label: 'API Uptime', val: '99.99%' },
              { label: 'Active Deployments', val: '450+' },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <p className="text-2xl md:text-3xl font-black text-health-text">{stat.val}</p>
                <p className="text-[10px] font-bold text-health-muted uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-health-text">Built for <span className="text-health-primary">Clinical Excellence.</span></h2>
            <p className="text-health-muted max-w-xl mx-auto">Modern tools for modern healthcare. Precision diagnostics at scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Brain />, 
                title: 'S21 Physics Engine', 
                desc: 'Stateless deterministic scoring based on metabolic and structural physics models.' 
              },
              { 
                icon: <FlaskConical />, 
                title: 'Biomarker Mapping', 
                desc: 'Automated normalization of CRP, HbA1c, and other critical laboratory metrics.' 
              },
              { 
                icon: <Database />, 
                title: 'Wearable Sync', 
                desc: 'Seamlessly ingest data from Apple Health, Fitbit, and medical-grade IoT devices.' 
              }
            ].map((f, i) => (
              <div key={i} className="health-card p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-health-primary">
                  {React.cloneElement(f.icon, { size: 24 })}
                </div>
                <h3 className="text-xl font-bold text-health-text">{f.title}</h3>
                <p className="text-sm text-health-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-health-text text-white">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-heading font-black leading-tight">
            Ready to integrate the world's most <br />
            <span className="text-health-primary">advanced scoring engine?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/signup')}
              className="btn-health-primary px-10 py-4 w-full sm:w-auto"
            >
              Start Integration Now
            </button>
            <button className="px-10 py-4 font-bold border border-white/20 rounded-xl hover:bg-white/5 transition-all w-full sm:w-auto">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-health-border">
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