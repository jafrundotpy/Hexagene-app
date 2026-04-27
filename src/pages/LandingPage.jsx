import React from 'react';
import { Network, Cpu, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background container */}
      <div className="bg-particles">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="nav-header">
        <Logo onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <div className="nav-links">
          <button onClick={() => navigate('/login')} className="nav-link">Login</button>
          <button onClick={() => navigate('/signup')} className="btn-outline" style={{ padding: '8px 16px' }}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section animate-fade-in">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          Hexagene S21 Engine Online v2.0.0
        </div>
        <h1 className="hero-title text-gradient">
          Biology is Structural Physics
        </h1>
        <h2 className="hero-subtitle">
          <span className="subtitle-highlight">Understand biological systems through deterministic modeling.</span>
        </h2>
        <p className="hero-description">
          A physics-based engine that calculates stress, resilience, and failure risk from structured biological data.
        </p>
        <div className="hero-cta">
          <button onClick={() => navigate('/signup')} className="btn-primary">Try HexaGene</button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline">Run Clinical Demo</button>
          <a href="https://zenodo.org/records/18141545" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>View Dataset</a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">Core Value Engine</h2>
          <p className="section-subtitle">Pioneering a deterministic approach to computational biology.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Cpu size={24} />
            </div>
            <h3>Deterministic Engine</h3>
            <p>No machine learning guesswork. Purely physics-based modeling.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Activity size={24} />
            </div>
            <h3>Biological System Analysis</h3>
            <p>Analyze stress, resilience, and system interactions.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Activity size={24} />
            </div>
            <h3>Predictive Risk Engine</h3>
            <p>Identify failure risks across multiple systems.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Network size={24} />
            </div>
            <h3>Scalable API Platform</h3>
            <p>Integrate into workflows using API.</p>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">Explore the Engine</h2>
          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Launch Demo</button>
          </div>
        </div>
        <div className="demo-dashboard-wrapper">
          <div className="demo-dashboard">
            <div className="demo-topbar">
              <div className="demo-dot red"></div>
              <div className="demo-dot yellow"></div>
              <div className="demo-dot green"></div>
              <span style={{ color: '#888', fontSize: '11px', marginLeft: '12px', fontFamily: 'monospace' }}>hexagene.app — Clinical Analysis</span>
            </div>
            <div className="demo-body">
              <div className="demo-sidebar">
                <div className="demo-nav-item active" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', fontSize: '11px', color: '#4fc3f7' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4fc3f7', display: 'inline-block' }}></span> Clinical Analysis
                </div>
                <div className="demo-nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', fontSize: '11px', color: '#555' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }}></span> Simulations
                </div>
                <div className="demo-nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', fontSize: '11px', color: '#555' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }}></span> API Access
                </div>
                <div className="demo-nav-item" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', fontSize: '11px', color: '#555' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }}></span> Settings
                </div>
              </div>
              <div className="demo-content">
                <div className="demo-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: '8px' }}>
                  <span style={{ color: '#4fc3f7', fontSize: '11px', fontWeight: 'bold' }}>Patient HG-482910</span>
                  <span style={{ color: '#22c55e', fontSize: '10px' }}>● SYSTEM STABLE</span>
                </div>
                <div className="demo-content-grid">
                  <div className="demo-grid-item" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ color: '#4fc3f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Liver Risk</span>
                    <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>OK</span>
                    <span style={{ color: '#555', fontSize: '9px' }}>GGT: 28 | TG: 140</span>
                  </div>
                  <div className="demo-grid-item" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ color: '#4fc3f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Vascular</span>
                    <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>WATCH</span>
                    <span style={{ color: '#555', fontSize: '9px' }}>SBP: 134 | DBP: 86</span>
                  </div>
                  <div className="demo-grid-item" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ color: '#4fc3f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Immune</span>
                    <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>OK</span>
                    <span style={{ color: '#555', fontSize: '9px' }}>CRP: 0.8 | WBC: 6.2</span>
                  </div>
                  <div className="demo-grid-item" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ color: '#4fc3f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Fibrosis</span>
                    <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>RISK</span>
                    <span style={{ color: '#555', fontSize: '9px' }}>HbA1c: 7.1 | Glu: 118</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">Frequently Asked Questions</h2>
          <p className="section-subtitle">Understanding HexaGene</p>
        </div>
        <div className="faq-grid">
          <div className="faq-item glass-panel">
            <h4>What makes HexaGene different from AI/ML tools?</h4>
            <p>HexaGene is a deterministic physics engine, not a machine learning model. It calculates structural stress, friction, and decay from first principles — not patterns from historical data. It works on rare variants and novel sequences AI tools have never seen.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>What are the four structural constants?</h4>
            <p><strong>k</strong> (Structural Resilience), <strong>μ</strong> (Metabolic Friction), <strong>λ</strong> (Structural Decay), <strong>SRI</strong> (Structural Risk Index). These describe how biological structures respond to stress — analogous to material constants in engineering.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>Can HexaGene analyse rare or novel variants?</h4>
            <p>Yes. HexaGene calculates physical stress on any DNA structure from scratch — including ultra-rare variants (AF &lt; 0.0001) and completely novel synthetic sequences with no population history.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>What is the ClinVar validation result?</h4>
            <p>38,000 genetic variants from NCBI ClinVar were tested. The engine was blind to clinical labels and successfully separated benign from pathogenic variants with mathematical certainty — no training data used.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>What problems does HexaGene solve?</h4>
            <p>40%+ of genetic findings are VUS. HexaGene addresses the $15B genetic testing market held back by uncertainty, and targets the 90% of drug candidates that fail trials due to missed structural instability.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>Is HexaGene validated on real data?</h4>
            <p>Every module is validated on published datasets — no simulations, no synthetic benchmarks. Benchmarked against REVEL, HexaGene maintains discrimination where conservation-based tools fail.</p>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} HexaGene. Biological Structural Physics Intelligence.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
