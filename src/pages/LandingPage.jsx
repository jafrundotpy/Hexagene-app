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
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import API_URL from '../api/config';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hexa-deep selection:bg-hexa-primary/30">
      
      {/* GLOW BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-hexa-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-hexa-secondary/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-hexa-deep/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo onClick={() => navigate('/')} className="cursor-pointer" />
          
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Features</button>
            <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Platform</button>
            <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors px-4 py-2">Login</button>
            <button onClick={() => navigate('/signup')} className="btn-premium px-6 py-2.5 text-xs">Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-hexa-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">HexaGene S21 Engine v2.0.4 Online</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9]">
            Biology is <span className="text-gradient">Structural Physics</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Deterministic clinical intelligence powered by measurable biology. Convert biomarkers into multi-axis risk scoring with production-ready APIs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button onClick={() => navigate('/signup')} className="btn-premium px-10 py-5 text-sm group">
              <span className="flex items-center gap-3">
                Get API Access
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-outline px-10 py-5 text-sm">
              Launch Demo
            </button>
          </div>

          <div className="pt-20">
            <div className="glass-card p-2 border-white/10 max-w-5xl mx-auto relative group">
              <div className="absolute inset-0 bg-hexa-primary/10 blur-[100px] -z-10 group-hover:bg-hexa-primary/20 transition-colors duration-1000" />
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000" 
                alt="Dashboard Preview" 
                className="rounded-xl border border-white/5 grayscale brightness-50 contrast-125 opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-card p-6 border-hexa-primary/30 flex items-center gap-4 animate-float">
                  <div className="p-3 bg-hexa-primary/20 rounded-xl text-hexa-primary">
                    <Zap size={32} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hexa-primary">Real-time Analysis</p>
                    <p className="text-xl font-black">S21 Engine Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-black">Platform <span className="text-gradient">Capabilities</span></h2>
            <p className="text-white/40 max-w-xl mx-auto">Production-grade scoring infrastructure for modern healthcare systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Cpu size={24} />, title: 'Deterministic Engine', desc: 'Direct physics-based logic without machine-learning guesswork.' },
              { icon: <BarChart3 size={24} />, title: '6-Axis Analysis', desc: 'Structural, Metabolic, and Inflammatory risk in one response.' },
              { icon: <Lock size={24} />, title: 'Secure API Keys', desc: 'SHA-256 hashed credentials with granular quota control.' },
              { icon: <Globe size={24} />, title: 'Real-time Deployment', desc: 'Fast REST API designed for labs, clinics, and SaaS platforms.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 border-white/5 hover:border-hexa-primary/30 group transition-all duration-500">
                <div className="p-4 bg-white/5 rounded-2xl w-fit mb-6 text-white/40 group-hover:text-hexa-primary group-hover:bg-hexa-primary/10 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Compute Time', value: '12ms' },
            { label: 'Uptime SLA', value: '99.99%' },
            { label: 'Daily Requests', value: '2.4M+' },
            { label: 'Engine Accuracy', value: '100%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-3xl md:text-5xl font-black tracking-tighter text-gradient">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section id="demo" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-black leading-[1.1]">Built for <span className="text-gradient">Clinical-Grade</span> Deployment</h2>
            <p className="text-white/50 leading-relaxed text-lg">
              HexaGene isn't just a dashboard. It's a complete infrastructure for biological intelligence, offering secure access, live analytics, and deterministic scoring at scale.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck className="text-hexa-success" />, text: 'HIPAA compliant data processing pipeline' },
                { icon: <Zap className="text-hexa-primary" />, text: 'Low-latency scoring engine (S21-Ω)' },
                { icon: <Database className="text-hexa-secondary" />, text: 'Immutable audit logs and usage tracking' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-bold text-white/80">
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/signup')} className="btn-premium px-8 py-4 text-sm">Explore Integration Docs</button>
          </div>

          <div className="relative">
            <div className="glass-card p-6 border-white/10 space-y-6 animate-float">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-hexa-primary/10 rounded-lg text-hexa-primary">
                    <Activity size={18} />
                  </div>
                  <span className="font-bold text-sm">System Health</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-hexa-success flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-hexa-success" />
                  Operational
                </span>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Engine Latency', value: '8ms', color: 'primary' },
                  { label: 'Success Rate', value: '99.98%', color: 'success' },
                  { label: 'Queue Depth', value: '0.00%', color: 'accent' },
                ].map((row, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-hexa-${row.color} rounded-full w-[85%]`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-hexa-primary">
                $ curl -H "x-api-key: hx_..." {API_URL}/v2/health<br/>
                {"{ status: 'ok', engine: 'S21-Omega' }"}
              </div>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-hexa-secondary/20 blur-[60px] rounded-full -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-hexa-primary/20 blur-[60px] rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-heading font-black text-gradient">Frequently Asked Questions</h2>
            <p className="text-white/40">Everything you need to know about the HexaGene platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: 'What is HexaGene?', a: 'A deterministic scoring platform that transforms health markers into multi-axis risk intelligence.' },
              { q: 'Is it production ready?', a: 'Yes. Live backend includes analytics, usage metrics, quota enforcement, and scalable architecture.' },
              { q: 'How is it different from AI?', a: 'We use direct physics-based logic and measurable inputs rather than black-box statistical predictions.' },
              { q: 'What does the API return?', a: 'Risk score, classification, axis breakdown, confidence signals, and compute time.' },
            ].map((faq, i) => (
              <div key={i} className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors">
                <h4 className="font-bold text-hexa-secondary mb-2">{faq.q}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Logo />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 leading-loose">
              &copy; {new Date().getFullYear()} HexaGene<br/>
              Deterministic Biological Intelligence
            </p>
          </div>
          
          <div className="flex gap-10">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20">Resources</h5>
              <ul className="space-y-2">
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">Documentation</button></li>
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">API Status</button></li>
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">Open Source</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20">Legal</h5>
              <ul className="space-y-2">
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">Privacy Policy</button></li>
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">Terms of Use</button></li>
                <li><button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-hexa-primary transition-colors">Disclosure</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;