import React, { useState } from "react";
import { 
  Book, 
  Code, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Cpu,
  Info,
  Layers,
  Globe,
  Lock,
  LifeBuoy,
  FileCode,
  ArrowRight,
  Stethoscope,
  Plus
} from "lucide-react";
import API_URL from "../../api/config";

export default function IntegrationDocs() {
  const [copied, setCopied] = useState("");

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(
        typeof text === "string" ? text : JSON.stringify(text, null, 2)
      );
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const requestExample = {
    patient_data: {
      crp: 1.6,
      hba1c: 5.8,
      albumin: 4.2,
      egfr: 90,
      rdw: 13.0,
      uric_acid: 5.0
    }
  };

  const responseExample = {
    success: true,
    risk_score: 67.5,
    axes: {
      inflammatory: 0.68,
      metabolic: 0.42,
      structural: 0.84,
      kinetic: 0.90,
      redox: 0.35,
      balance: 0.48
    },
    classification: "Moderate"
  };

  const CodeBlock = ({ code, lang, label }) => (
    <div className="health-card overflow-hidden font-mono text-xs bg-health-text border-none shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-health-primary" />
          <span className="text-white/40 uppercase tracking-widest font-black">{lang}</span>
        </div>
        <button onClick={() => copyText(code, label)} className="text-white/40 hover:text-health-primary transition-colors flex items-center gap-2 text-[10px] font-black uppercase">
          {copied === label ? "Copied" : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <div className="p-6 overflow-x-auto text-emerald-400 leading-relaxed whitespace-pre">
        {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-health-primary text-[10px] font-bold uppercase tracking-widest">
            <Book size={12} />
            Technical Documentation
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">API <span className="text-health-primary">Integration</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Clinical specifications for connecting your infrastructure to the HexaGene S21 diagnostic engine.
          </p>
        </div>
        
        <button className="btn-health-outline flex items-center gap-2 py-3 px-5">
          <Globe size={18} />
          <span>Developer Portal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* MAIN DOCS */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* BASE URL & AUTH */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-health-text flex items-center gap-3">
              <Terminal size={24} className="text-health-primary" />
              Connectivity & Security
            </h3>
            
            <div className="health-card p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Production Gateway</label>
                <div className="flex items-center gap-3 p-4 bg-health-surface rounded-xl border border-health-border">
                  <code className="text-health-text font-mono text-sm flex-1 break-all">{API_URL}</code>
                  <button onClick={() => copyText(API_URL, "url")} className="p-2 hover:text-health-primary transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Authentication Protocols</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-health-border rounded-2xl space-y-2 shadow-sm">
                    <p className="text-xs font-black text-health-primary uppercase tracking-widest">x-api-key</p>
                    <p className="text-xs text-health-muted leading-relaxed italic">Your secure token for server-to-server clinical data exchange.</p>
                  </div>
                  <div className="p-5 bg-white border border-health-border rounded-2xl space-y-2 shadow-sm">
                    <p className="text-xs font-black text-health-primary uppercase tracking-widest">Content-Type</p>
                    <p className="text-xs text-health-muted leading-relaxed italic">application/json (UTF-8 encoding required)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SCORING ENDPOINT */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold text-health-text">
              <Cpu size={24} className="text-health-secondary" />
              <h3>Engine Endpoints</h3>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-health-surface border-l-4 border-health-secondary rounded-r-2xl">
                <div className="flex items-center gap-3">
                  <span className="bg-health-secondary text-white text-[10px] font-black px-2 py-1 rounded">POST</span>
                  <code className="text-sm font-black text-health-text">/v2/score</code>
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-health-muted">Diagnostic Analysis</span>
                </div>
              </div>
            </div>
          </section>

          {/* ERROR HANDLING */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-health-text flex items-center gap-3">
              <ShieldCheck size={24} className="text-health-primary" />
              Standardized Responses
            </h3>
            
            <div className="health-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-health-surface/50 border-b border-health-border">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Classification</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Diagnostic Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-health-border">
                  {[
                    { code: '200', type: 'OK', desc: 'Analysis completed with high-confidence scoring.' },
                    { code: '401', type: 'Auth Fail', desc: 'Credential verification rejected.' },
                    { code: '429', type: 'Limit', desc: 'Clinical throughput quota exceeded.' },
                    { code: '500', type: 'Engine Err', desc: 'S21 physics calculation interrupted.' },
                  ].map((row) => (
                    <tr key={row.code} className="hover:bg-health-surface/30 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-health-primary">{row.code}</td>
                      <td className="p-4 text-xs font-black uppercase text-health-text">{row.type}</td>
                      <td className="p-4 text-xs text-health-muted leading-relaxed">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="health-card p-8 border-none bg-health-primary text-white space-y-6 shadow-xl shadow-green-200">
            <h4 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
              <Zap size={18} />
              Version Update
            </h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              S21 Engine v2.4 is now globally available. Optimized for low-latency diagnostic processing.
            </p>
            <button className="w-full py-3 bg-white text-health-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
              Migration Guide
            </button>
          </div>

          <div className="health-card p-8 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-health-muted">Developer Resources</h4>
            <div className="space-y-4">
              {[
                { icon: <Globe size={16} />, label: 'Postman Collections' },
                { icon: <Lock size={16} />, label: 'Security Protocols' },
                { icon: <Layers size={16} />, label: 'Standard SDKs' },
                { icon: <LifeBuoy size={16} />, label: 'Integration Support' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 p-4 bg-health-surface border border-health-border rounded-2xl text-xs font-bold hover:border-health-primary transition-all group">
                  <span className="text-health-primary">{item.icon}</span>
                  <span className="text-health-text">{item.label}</span>
                  <ArrowRight size={14} className="ml-auto opacity-20 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-orange-600">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Medical Support</span>
            </div>
            <p className="text-xs text-orange-800 leading-relaxed italic font-medium">
              "For laboratory-specific endpoint configuration, contact our team at <span className="font-bold underline">support@hexagene.com</span>"
            </p>
          </div>
        </div>

      </div>

      <footer className="pt-10 border-t border-health-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-health-muted">
        <div className="flex items-center gap-4">
          <span>Specs v2.4.1</span>
          <div className="w-1.5 h-1.5 bg-health-primary rounded-full" />
          <span>Last Updated: Today</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-health-text transition-colors">Privacy</button>
          <button className="hover:text-health-text transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
}