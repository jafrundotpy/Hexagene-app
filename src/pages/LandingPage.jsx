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
          Engine Online ver 2.4.1
        </div>
        <h1 className="hero-title text-gradient">
          Biology is Structural Physics
        </h1>
        <h2 className="hero-subtitle">
          Understand biological systems through deterministic modeling.
        </h2>
        <p className="hero-description">
          A physics-based engine that calculates stress, resilience, and failure risk from structured biological data.
        </p>
        <div className="hero-cta">
          <button onClick={() => navigate('/signup')} className="btn-primary">Try HexaGene</button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline">Run Clinical Demo</button>
          <button className="btn-outline">View Dataset</button>
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

      {/* Demo Preview Section */}
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
            </div>
            <div className="demo-body">
              <div className="demo-sidebar">
                <div className="demo-nav-item active"></div>
                <div className="demo-nav-item"></div>
                <div className="demo-nav-item"></div>
                <div className="demo-nav-item" style={{ marginTop: 'auto' }}></div>
              </div>
              <div className="demo-content">
                <div className="demo-content-header"></div>
                <div className="demo-content-grid">
                  <div className="demo-grid-item"></div>
                  <div className="demo-grid-item"></div>
                </div>
              </div>
            </div>
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
