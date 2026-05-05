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
  ArrowRight
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
    <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-bottom border-white/5">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-hexa-primary" />
          <span className="text-white/40 uppercase tracking-widest font-bold">{lang}</span>
        </div>
        <button onClick={() => copyText(code, label)} className="text-white/40 hover:text-hexa-primary transition-colors flex items-center gap-2">
          {copied === label ? "Copied" : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <div className="p-6 overflow-x-auto text-hexa-primary leading-relaxed whitespace-pre">
        {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hexa-secondary/10 border border-hexa-secondary/20 text-hexa-secondary text-[10px] font-bold uppercase tracking-widest">
            <Book size={12} />
            Technical Documentation
          </div>
          <h1 className="text-4xl font-heading font-bold">API <span className="text-gradient">Integration</span></h1>
          <p className="text-white/50 max-w-2xl">
            Detailed specifications for connecting your platform to the HexaGene S21 engine.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="btn-outline flex items-center gap-2 py-3 px-5">
            <Globe size={18} />
            <span>Developer Portal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN DOCS */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* BASE URL & AUTH */}
          <section className="space-y-6">
            <h3 className="text-xl font-heading font-bold flex items-center gap-3">
              <Terminal size={24} className="text-hexa-primary" />
              Connectivity & Authentication
            </h3>
            
            <div className="glass-card p-8 border-white/5 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Production Endpoint</label>
                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5">
                  <code className="text-hexa-primary font-mono flex-1 break-all">{API_URL}</code>
                  <button onClick={() => copyText(API_URL, "url")} className="p-2 hover:text-white transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Header Requirements</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-hexa-primary">x-api-key</p>
                    <p className="text-[10px] text-white/40 leading-relaxed italic">Your secure developer key for server-to-server auth.</p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-hexa-primary">Content-Type</p>
                    <p className="text-[10px] text-white/40 leading-relaxed italic">application/json</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SCORING ENDPOINT */}
          <section className="space-y-6">
            <h3 className="text-xl font-heading font-bold flex items-center gap-3">
              <Cpu size={24} className="text-hexa-secondary" />
              S21 Scoring Engine
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-hexa-secondary/10 border-l-4 border-hexa-secondary rounded-r-xl">
                <div className="flex items-center gap-3">
                  <span className="bg-hexa-secondary text-black text-[10px] font-black px-2 py-0.5 rounded">POST</span>
                  <code className="text-sm font-bold text-hexa-secondary">/v2/score</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Request Payload</h4>
                <CodeBlock 
                  lang="json"
                  label="req"
                  code={requestExample}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Response Structure</h4>
                <CodeBlock 
                  lang="json"
                  label="res"
                  code={responseExample}
                />
              </div>
            </div>
          </section>

          {/* ERROR HANDLING */}
          <section className="space-y-6">
            <h3 className="text-xl font-heading font-bold flex items-center gap-3">
              <ShieldCheck size={24} className="text-hexa-danger" />
              Response Handling
            </h3>
            
            <div className="glass-card p-0 border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Classification</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { code: '200', type: 'OK', desc: 'Successful analysis completed.' },
                    { code: '401', type: 'Unauthorized', desc: 'Invalid or missing x-api-key.' },
                    { code: '429', type: 'Rate Limit', desc: 'Quota exceeded for current tier.' },
                    { code: '500', type: 'Engine Error', desc: 'Internal physics engine calculation failure.' },
                  ].map((row) => (
                    <tr key={row.code} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-mono text-xs text-hexa-primary">{row.code}</td>
                      <td className="p-4 text-xs font-bold">{row.type}</td>
                      <td className="p-4 text-xs text-white/40">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="glass-card p-8 border-hexa-primary/20 bg-hexa-primary/5">
            <h4 className="text-sm font-bold mb-6 flex items-center gap-2 text-hexa-primary">
              <Zap size={18} />
              Platform Update
            </h4>
            <p className="text-xs text-white/50 leading-relaxed mb-6">
              Version 2 of the HexaGene API is now the default. Version 1 will be deprecated on July 2026.
            </p>
            <button className="w-full btn-premium py-3 text-[10px] uppercase tracking-widest">
              Migration Guide
            </button>
          </div>

          <div className="glass-card p-8 border-white/5 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Resources</h4>
            <div className="space-y-4">
              {[
                { icon: <Globe size={16} />, label: 'Postman Collection' },
                { icon: <Lock size={16} />, label: 'Security Policy' },
                { icon: <Layers size={16} />, label: 'SDK Libraries' },
                { icon: <LifeBuoy size={16} />, label: 'Technical Support' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs hover:bg-white/[0.05] transition-all">
                  <span className="text-hexa-primary">{item.icon}</span>
                  <span className="font-bold">{item.label}</span>
                  <ArrowRight size={14} className="ml-auto opacity-20" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 text-white/40 mb-3">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed italic">
              "Need custom endpoint configuration for your laboratory? Reach out to our integration team at <span className="text-hexa-primary">support@hexagene.ai</span>"
            </p>
          </div>
        </div>

      </div>

      <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
        <div className="flex items-center gap-4">
          <span>Documentation v1.4.2</span>
          <span className="w-1 h-1 bg-white/10 rounded-full" />
          <span>Last Updated: Today</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors">Privacy</button>
          <button className="hover:text-white transition-colors">Terms of Service</button>
        </div>
      </footer>
    </div>
  );
}