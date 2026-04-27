import React from 'react';
import { Network, Cpu, Activity, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background */}
      <div className="bg-particles">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      {/* Navbar */}
      <nav className="nav-header">
        <Logo onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />

        <div className="nav-links">
          <button
            onClick={() => navigate('/login')}
            className="nav-link"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="btn-outline"
            style={{ padding: '8px 16px' }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section animate-fade-in">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          HexaGene S21 Engine Online v2.0.0
        </div>

        <h1 className="hero-title text-gradient">
          Biology is Structural Physics
        </h1>

        <h2 className="hero-subtitle">
          Deterministic clinical intelligence powered by measurable biology.
        </h2>

        <p className="hero-description">
          HexaGene converts structured biomarkers into multi-axis risk scoring,
          resilience analysis, and production-ready healthcare APIs.
        </p>

        <div className="hero-cta">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary"
          >
            Get API Access
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            Run Demo
          </button>

          <a
            href="https://zenodo.org/records/18141545"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            View Dataset
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">
            Platform Capabilities
          </h2>

          <p className="section-subtitle">
            Production-grade scoring infrastructure for modern healthcare systems.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Cpu size={24} />
            </div>

            <h3>HexaGene S21 Engine</h3>

            <p>
              Deterministic scoring engine built without machine-learning
              guesswork.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Activity size={24} />
            </div>

            <h3>6-Axis Risk Analysis</h3>

            <p>
              Structural, inflammatory, metabolic, redox, kinetic, and balance
              scoring in one response.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Shield size={24} />
            </div>

            <h3>Secure API Access</h3>

            <p>
              Authenticated API keys with monthly quota control and rate
              limiting.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Network size={24} />
            </div>

            <h3>Realtime Deployment</h3>

            <p>
              Fast REST API designed for SaaS apps, clinics, labs, and
              integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section id="demo" className="demo-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">
            Built for Clinical-Grade Deployment
          </h2>

          <p className="section-subtitle">
            Real backend infrastructure with live scoring, quotas, and secure
            access control.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: '20px',
            marginTop: '40px'
          }}
        >
          <div className="glass-panel" style={{ padding: '24px' }}>
            <p style={{ color: '#94a3b8' }}>Version</p>
            <h3>v2.0.0</h3>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <p style={{ color: '#94a3b8' }}>Engine</p>
            <h3>HexaGene S21</h3>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <p style={{ color: '#94a3b8' }}>Authentication</p>
            <h3>API Key Auth</h3>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <p style={{ color: '#94a3b8' }}>Performance</p>
            <h3>Realtime Scoring</h3>
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary"
          >
            Generate API Key
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">
            Frequently Asked Questions
          </h2>

          <p className="section-subtitle">
            Product and infrastructure overview
          </p>
        </div>

        <div className="faq-grid">
          <div className="faq-item glass-panel">
            <h4>What is HexaGene?</h4>
            <p>
              HexaGene is a deterministic biological scoring platform that
              transforms structured health markers into actionable multi-axis
              risk intelligence.
            </p>
          </div>

          <div className="faq-item glass-panel">
            <h4>How is it different from AI models?</h4>
            <p>
              HexaGene uses direct scoring logic and measurable inputs rather
              than black-box predictions trained on historical data.
            </p>
          </div>

          <div className="faq-item glass-panel">
            <h4>What does the API return?</h4>
            <p>
              Risk score, classification, axis breakdown, confidence signals,
              compute time, and timestamped outputs.
            </p>
          </div>

          <div className="faq-item glass-panel">
            <h4>Is access secured?</h4>
            <p>
              Yes. API keys are hashed, authenticated, rate-limited, and can
              include monthly usage quotas.
            </p>
          </div>

          <div className="faq-item glass-panel">
            <h4>Who can use HexaGene?</h4>
            <p>
              Clinics, SaaS founders, healthcare startups, wellness platforms,
              and enterprise integrators.
            </p>
          </div>

          <div className="faq-item glass-panel">
            <h4>Is it production ready?</h4>
            <p>
              Yes. Live backend deployment includes analytics, usage metrics,
              quota enforcement, and scalable API architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} HexaGene. Deterministic Biological
          Intelligence.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;