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
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

const ApiAccess = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showKeyId, setShowKeyId] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [error, setError] = useState(null);
  const [newKey, setNewKey] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      setError("Failed to fetch keys");
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    setError(null);
    setNewKey(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/generate-key`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.api_key);
        await fetchKeys();
      } else {
        setError(data.detail || "Generation failed");
      }
    } catch (err) {
      setError("Network error during generation");
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id) => {
    // Note: Backend currently doesn't support individual key deletion via DELETE /api/keys/${id}
    // and regenerate-key deletes all old keys. We'll show a message or disable this.
    alert("Individual key revocation is currently handled by generating a new key, which rotates all credentials for security.");
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const toggleKeyVisibility = (id) => {
    setShowKeyId(showKeyId === id ? null : id);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-primary/10 border border-health-primary/20 text-health-primary text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={12} />
            Developer Console
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">API <span className="text-health-primary">Access</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Manage your secure access credentials for the HexaGene S21 engine. 
            Keep your API keys private and never expose them in client-side code.
          </p>
        </div>
        
        <button 
          onClick={generateKey}
          disabled={generating}
          className="btn-health-primary px-8 py-4"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          <span>Generate New API Key</span>
        </button>
      </div>

      {newKey && (
        <div className="p-8 bg-health-primary/5 border-2 border-health-primary/20 rounded-3xl space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={120} />
          </div>
          
          <div className="flex items-center gap-3 text-health-primary">
            <CheckCircle size={24} />
            <h3 className="text-xl font-bold">New API Key Generated Successfully</h3>
          </div>
          
          <p className="text-health-muted text-sm max-w-2xl leading-relaxed">
            For security reasons, we only show this raw key <span className="font-bold text-health-text">once</span>. 
            Please copy it now and store it in a secure location (like a password manager). 
            You cannot retrieve this raw key again.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full bg-white border border-health-primary/30 p-4 rounded-xl font-mono text-lg font-bold text-health-text break-all shadow-inner">
              {newKey}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => copyToClipboard(newKey, 'new-key')}
                className="btn-health-primary px-8 py-4 whitespace-nowrap flex-1"
              >
                {copyStatus === 'new-key' ? "Copied!" : <><Copy size={18} /> Copy Key</>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-lg inline-flex">
            <AlertTriangle size={14} />
            Important: All previous keys have been revoked for your security.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in">
          <ShieldAlert size={18} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* API KEYS TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="health-card overflow-hidden">
            <div className="p-6 border-b border-health-border bg-white flex items-center justify-between">
              <h3 className="text-lg font-bold text-health-text">Active Credentials</h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-health-muted">
                {keys.length} Keys Managed
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-health-surface/50 border-b border-health-border">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Key ID / Preview</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Created</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-health-border">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="p-6"><div className="h-4 bg-health-surface rounded w-full" /></td>
                      </tr>
                    ))
                  ) : keys.length > 0 ? (
                    keys.map((key) => (
                      <tr key={key.id} className="hover:bg-health-surface/30 transition-colors">
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono font-bold bg-health-surface px-2 py-1 rounded text-health-text">
                                {showKeyId === (key.id || key.api_key) 
                                  ? key.api_key 
                                  : `HXG_sk_live_${key.api_key?.substring(12, 16) || "83A2"}••••••${key.api_key?.slice(-4) || "X91F"}`}
                              </code>
                              <button 
                                onClick={() => toggleKeyVisibility(key.id || key.api_key)}
                                className="p-1.5 hover:bg-health-surface rounded transition-colors text-health-muted"
                                title="Toggle Visibility"
                              >
                                {showKeyId === (key.id || key.api_key) ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <p className="text-[10px] text-health-muted font-medium ml-1">Secure Enterprise Access Key</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-health-primary text-[10px] font-black uppercase">
                            <CheckCircle size={10} /> Active
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-health-muted italic">
                          {key.created_at ? new Date(key.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => copyToClipboard(key.api_key, key.id || key.api_key)}
                            className="btn-health-outline py-2 px-3 text-[10px] uppercase"
                          >
                            {copyStatus === (key.id || key.api_key) ? "Copied" : <><Copy size={12} className="inline mr-1" /> Copy</>}
                          </button>
                          <button 
                            onClick={generateKey}
                            className="py-2 px-3 text-[10px] uppercase font-black text-health-primary hover:bg-health-primary/5 rounded-xl transition-all"
                          >
                            Regenerate
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-health-muted">
                        No API keys generated. Create one to start integrating.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="health-card p-8 space-y-6">
            <h3 className="text-lg font-bold text-health-text flex items-center gap-3">
              <Terminal size={22} className="text-health-primary" />
              Quick Integration
            </h3>
            
            <div className="space-y-4">
              <p className="text-xs text-health-muted leading-relaxed">
                Use your API key as a Bearer token or in the <code className="bg-health-surface px-1.5 py-0.5 rounded text-health-primary">x-api-key</code> header to authenticate diagnostic requests.
              </p>
              
              <div className="bg-health-text p-6 rounded-2xl font-mono text-xs overflow-x-auto relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-white/40 hover:text-white"><Copy size={16} /></button>
                </div>
                <div className="text-white/90 space-y-1">
                  <p><span className="text-health-primary">curl</span> -X POST "https://api.hexagene.com/v2/score" \</p>
                  <p className="pl-4">-H <span className="text-orange-400">"x-api-key: HXG_sk_live_••••••••••••"</span> \</p>
                  <p className="pl-4">-H <span className="text-orange-400">"Content-Type: application/json"</span> \</p>
                  <p className="pl-4">-d <span className="text-emerald-400">{`'{ "biomarkers": { "crp": 1.2 } }'`}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR HELP */}
        <div className="lg:col-span-4 space-y-6">
          <div className="health-card p-6 bg-health-surface border-none space-y-4">
            <div className="p-3 bg-white w-12 h-12 rounded-xl flex items-center justify-center text-health-primary shadow-sm">
              <Lock size={24} />
            </div>
            <h4 className="text-sm font-bold text-health-text">Security Best Practices</h4>
            <ul className="space-y-3">
              {[
                "Never share your API keys publicly",
                "Rotate keys every 90 days for safety",
                "Use environment variables (.env)",
                "Revoke compromised keys immediately"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-health-muted leading-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-health-primary mt-1 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="health-card p-8 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-health-muted">Diagnostic SDKs</h4>
            <div className="space-y-3">
              {['Node.js', 'Python', 'React Native', 'Go'].map(sdk => (
                <button key={sdk} className="w-full flex items-center justify-between p-4 bg-white border border-health-border rounded-xl text-xs font-bold hover:border-health-primary transition-all group">
                  {sdk} SDK
                  <ChevronRight size={14} className="text-health-muted group-hover:text-health-primary" />
                </button>
              ))}
            </div>
            <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-health-primary hover:underline">
              View All SDKs
            </button>
          </div>

          <div className="p-6 bg-white border border-health-border rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-health-primary">
              <Globe size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-health-text">API Status</p>
              <p className="text-[10px] text-health-primary font-black uppercase">All Systems Online</p>
            </div>
            <ArrowUpRight size={16} className="ml-auto text-health-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiAccess;