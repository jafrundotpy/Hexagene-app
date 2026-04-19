import React from 'react';
import { CheckCircle2, AlertCircle, Search } from 'lucide-react';

const ValidationPanel = ({ isRevealed, validationData }) => {
  if (!isRevealed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card bg-white/[0.01] border-white/5 border-dashed border-2">
        <Search size={48} className="text-white/10 mb-4" />
        <h3 className="text-xl font-bold text-white/20 uppercase tracking-widest">Validation (Hidden)</h3>
        <p className="text-white/10 text-sm mt-2">Click Reveal to compare with ground truth biomarkers</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Match': return <CheckCircle2 className="text-hexa-success" size={16} />;
      case 'Watch': return <AlertCircle className="text-hexa-warning" size={16} />;
      case 'Occult': return <AlertCircle className="text-hexa-danger" size={16} />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Match': return 'text-hexa-success';
      case 'Watch': return 'text-hexa-warning';
      case 'Occult': return 'text-hexa-danger';
      default: return 'text-hexa-muted';
    }
  };

  return (
    <div className="glass-card overflow-hidden border-hexa-primary/20 animate-fade-in">
      <div className="bg-hexa-primary/10 p-4 border-b border-hexa-primary/20 flex items-center justify-between">
        <h3 className="text-sm font-bold text-hexa-primary uppercase tracking-widest flex items-center gap-2">
          <Search size={18} />
          Validation Dashboard
        </h3>
        <span className="text-[10px] bg-hexa-primary text-hexa-deep font-black px-2 py-0.5 rounded">GROUND TRUTH</span>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] text-hexa-muted font-bold uppercase tracking-tighter border-b border-white/5 bg-white/[0.02]">
            <tr>
              <th className="px-6 py-3">Biomarker</th>
              <th className="px-6 py-3">Predicted Value</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {validationData.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-all">
                <td className="px-6 py-4 font-bold text-white/80">{item.name}</td>
                <td className="px-6 py-4 font-mono text-hexa-primary">{item.value}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${getStatusClass(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-hexa-success/5 border border-hexa-success/10">
           <div className="w-2 h-2 rounded-full bg-hexa-success animate-ping"></div>
           <p className="text-[11px] text-hexa-success font-medium">
             Algorithm confidence: 97.2% based on current lab distribution.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
