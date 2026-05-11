import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Clock, Globe, Code, AlertCircle } from 'lucide-react';

const DebugPanel = ({ request, response, endpoint, latency, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 border-2 border-dashed border-health-primary/20 rounded-2xl overflow-hidden bg-health-surface/30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-health-primary/5 hover:bg-health-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-health-primary rounded-lg text-white">
            <Terminal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-health-text uppercase tracking-widest">Backend Validation Debugger</h3>
            <p className="text-[10px] text-health-muted font-bold">Monitor REAL API traffic and payloads</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENDPOINT & TIMING */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-health-muted">
                  <Globe size={12} /> Target Endpoint
                </label>
                <div className="p-3 bg-white rounded-xl border border-health-border font-mono text-[11px] text-health-primary truncate">
                  {endpoint || '---'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-health-muted">
                  <Clock size={12} /> Response Timing
                </label>
                <div className="p-3 bg-white rounded-xl border border-health-border font-mono text-[11px] text-health-text">
                  {latency ? `${latency} ms` : '---'}
                </div>
              </div>
            </div>

            {/* ERROR STATUS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-health-muted">
                <AlertCircle size={12} /> Validation Logs
              </label>
              <div className={`p-3 rounded-xl border font-mono text-[11px] h-[92px] overflow-y-auto ${
                error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
              }`}>
                {error ? `❌ ERROR: ${error}` : '✅ All schemas aligned with boss backend.'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REQUEST PAYLOAD */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-health-muted">
                <Code size={12} /> Request Payload (Sent)
              </label>
              <pre className="p-4 bg-gray-900 text-green-400 rounded-2xl text-[10px] h-64 overflow-auto custom-scrollbar font-mono leading-relaxed">
                {request ? JSON.stringify(request, null, 2) : '// Awaiting submission...'}
              </pre>
            </div>

            {/* RESPONSE DATA */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-health-muted">
                <Globe size={12} /> Backend Response (Received)
              </label>
              <pre className="p-4 bg-gray-900 text-blue-400 rounded-2xl text-[10px] h-64 overflow-auto custom-scrollbar font-mono leading-relaxed">
                {response ? JSON.stringify(response, null, 2) : '// Awaiting response...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
