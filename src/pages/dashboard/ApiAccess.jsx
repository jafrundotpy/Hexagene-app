import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../api/config";
import {
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Shield,
  CheckCircle, 
  AlertTriangle, 
  Code, 
  Globe, 
  Lock, 
  Loader2,
  Terminal,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  Plus,
  Activity
} from "lucide-react";

const ApiAccess = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [showKeyId, setShowKeyId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("keys");
  const [generatedKey, setGeneratedKey] = useState("");

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(Array.isArray(data) ? data : data.keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");
    setGeneratedKey("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/generate-key`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok && data.api_key) {
        setGeneratedKey(data.api_key);
        fetchKeys();
      } else {
        setGenerateError(data.detail || "Failed to generate key");
      }
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id) => {
    if (confirmDeleteId === id) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/keys/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfirmDeleteId(null);
        setGeneratedKey("");
        fetchKeys();
      } catch (err) {
        console.error(err);
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
    }
  };

  const CodeBlock = ({ code, lang }) => (
    <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-bottom border-white/5">
        <span className="text-white/40 uppercase tracking-widest font-bold">{lang}</span>
        <button onClick={() => handleCopy(code)} className="text-white/40 hover:text-hexa-primary transition-colors">
          <Copy size={14} />
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-hexa-primary leading-relaxed whitespace-pre">
        {code}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hexa-accent/10 border border-hexa-accent/20 text-hexa-accent text-[10px] font-bold uppercase tracking-widest">
            <Shield size={12} />
            Developer Console
          </div>
          <h1 className="text-4xl font-heading font-bold">API <span className="text-gradient">Access</span></h1>
          <p className="text-white/50 max-w-2xl">
            Integrate HexaGene's S21 scoring engine directly into your clinical workflows and applications.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-hexa-success/20">
            <div className="w-2 h-2 rounded-full bg-hexa-success animate-pulse" />
            <span className="text-xs font-bold text-hexa-success uppercase tracking-widest">Production Ready</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COL: CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TABS */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
            {[
              { id: 'keys', label: 'API Keys', icon: <Key size={14} /> },
              { id: 'docs', label: 'Integration', icon: <Terminal size={14} /> },
              { id: 'usage', label: 'Usage & Limits', icon: <Activity size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
                  ${activeTab === tab.id ? 'bg-hexa-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'keys' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-0 border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-hexa-primary/10 rounded-lg text-hexa-primary">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold">Secret Keys</h3>
                      <p className="text-xs text-white/40">Manage keys used for authenticated server-side requests</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-premium flex items-center gap-2 py-2.5 px-4 text-xs"
                  >
                    {generating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                    Create New Key
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {generateError && (
                    <div className="p-3 bg-hexa-danger/10 border border-hexa-danger/20 rounded-xl text-hexa-danger text-xs flex items-center gap-2">
                      <AlertTriangle size={14} /> {generateError}
                    </div>
                  )}

                  {generatedKey && (
                    <div className="p-6 bg-hexa-success/5 border border-hexa-success/20 rounded-2xl space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-hexa-success font-bold text-xs">
                          <CheckCircle size={14} /> New key generated successfully
                        </div>
                        <button onClick={() => setGeneratedKey("")} className="text-white/20 hover:text-white">
                          <EyeOff size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5">
                        <code className="text-lg text-hexa-primary font-mono flex-1 break-all">{generatedKey}</code>
                        <button 
                          onClick={() => handleCopy(generatedKey)}
                          className="p-2 bg-hexa-primary/20 text-hexa-primary rounded-lg hover:bg-hexa-primary/30 transition-colors"
                        >
                          {copied ? "Copied!" : <Copy size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        <span className="text-hexa-warning font-bold">CRITICAL:</span> Save this key now. For security, we won't show it again. You can't recover it once you refresh this page.
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-white/20">
                      <Loader2 size={32} className="animate-spin" />
                    </div>
                  ) : keys.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {keys.map((k) => (
                        <div key={k.id} className="group p-4 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.05] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white/5 rounded-lg text-white/40 group-hover:text-hexa-primary transition-colors">
                              <Key size={16} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-white/80">Stored Hash (SHA-256)</span>
                                <div className="px-2 py-0.5 rounded bg-hexa-primary/10 text-hexa-primary text-[10px] font-bold uppercase tracking-tighter italic">Active</div>
                              </div>
                              <p className="text-[10px] text-white/30">Created on {new Date(k.created_at).toLocaleDateString()} • ID: {k.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRevoke(k.id)}
                            className={`
                              px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                              ${confirmDeleteId === k.id ? 'bg-hexa-danger text-white' : 'bg-white/5 text-white/30 hover:bg-hexa-danger/10 hover:text-hexa-danger'}
                            `}
                          >
                            {confirmDeleteId === k.id ? 'Confirm Revoke' : 'Revoke'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                      <Key size={48} className="mb-4 opacity-10" />
                      <p className="text-sm">No active API keys found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-6 border-hexa-accent/20 bg-hexa-accent/5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-hexa-accent/10 rounded-lg text-hexa-accent">
                    <Info size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">Key Security Standards</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      We use SHA-256 hashing to store your keys. We never store the raw key in our database, ensuring that even in a breach, your actual credentials remain secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-bold">Quick Start Guide</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Authenticate your requests by including your secret key in the <code className="text-hexa-primary">x-api-key</code> header.
                </p>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">cURL Example</h4>
                    <CodeBlock 
                      lang="shell"
                      code={`curl -X POST "${API_URL}/v2/score" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_data": {
      "crp": 1.2,
      "hba1c": 5.4,
      "albumin": 4.1
    }
  }'`}
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Node.js Example</h4>
                    <CodeBlock 
                      lang="javascript"
                      code={`const response = await fetch("${API_URL}/v2/score", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    patient_data: { crp: 1.2, hba1c: 5.4 }
  })
});

const data = await response.json();
console.log(data.position.risk_score);`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Globe size={24} className="text-white/40" />
                  </div>
                  <div>
                    <h4 className="font-bold">Full API Documentation</h4>
                    <p className="text-xs text-white/40">Explore interactive Swagger & Redoc specs</p>
                  </div>
                </div>
                <button className="p-3 bg-white/5 rounded-xl hover:bg-hexa-primary/20 hover:text-hexa-primary transition-all">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Requests (Today)', value: '142', limit: '50,000', color: 'primary' },
                  { label: 'Burst Rate', value: '3/sec', limit: '10/sec', color: 'accent' },
                  { label: 'Compute Time', value: '84ms', limit: 'Avg', color: 'success' },
                ].map((m) => (
                  <div key={m.label} className="glass-card p-6 border-white/5 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{m.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black">{m.value}</span>
                      <span className="text-[10px] text-white/20">/ {m.limit}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-hexa-${m.color} rounded-full`} style={{ width: '15%' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-8 border-white/5 space-y-6">
                <h4 className="font-heading font-bold">Rate Limiting Policy</h4>
                <div className="space-y-4">
                  {[
                    { title: 'Standard Requests', desc: 'Up to 20 requests per minute with a burst of 3 per 2 seconds.' },
                    { title: 'Concurrent Jobs', desc: 'Unlimited parallel scoring operations within rate boundaries.' },
                    { title: 'Quota Exceeded', desc: 'API returns HTTP 429 Too Many Requests when limits are breached.' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-hexa-primary mt-1.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: SIDEBAR */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="glass-card p-8 border-hexa-secondary/20 bg-gradient-to-br from-hexa-card to-hexa-secondary/5">
            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
              <Zap size={18} className="text-hexa-secondary" />
              Upgrade Tier
            </h4>
            <p className="text-xs text-white/50 leading-relaxed mb-8">
              Need higher rate limits or dedicated infrastructure? Explore our Enterprise solutions.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Unlimited Requests',
                'Dedicated S21 Engine',
                'HIPAA Compliance',
                '24/7 Support SLA'
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-[10px] font-bold text-white/70">
                  <ShieldCheck size={14} className="text-hexa-secondary" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full btn-premium !bg-gradient-to-r from-hexa-secondary to-hexa-primary py-4">
              Contact Sales
            </button>
          </div>

          <div className="glass-card p-6 border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Quick Links</h4>
            <div className="space-y-2">
              {[
                'GitHub Repository',
                'Stack Overflow Support',
                'System Status',
                'Discord Developer Hub'
              ].map((link) => (
                <button key={link} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-xs transition-colors text-left">
                  <span>{link}</span>
                  <ChevronRight size={14} className="opacity-40" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiAccess;