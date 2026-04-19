import React from 'react';
import { ChevronRight } from 'lucide-react';

const PredictionCards = ({ predictions, timeRange, onTimeRangeChange }) => {
  const cards = [
    { id: 'liver', title: 'Liver Optimization', icon: '🧪' },
    { id: 'immune', title: 'Immune Resilience', icon: '🛡️' },
    { id: 'lowT', title: 'Hormonal / Low T', icon: '⚡' },
    { id: 'fibrosis', title: 'Incipient Fibrosis', icon: '📉' },
    { id: 'vascular', title: 'Vascular Stiffness', icon: '❤️' },
    { id: 'kidney', title: 'Kidney Function', icon: '🌊' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'text-hexa-success bg-hexa-success/10 border-hexa-success/20';
      case 'Watch': return 'text-hexa-warning bg-hexa-warning/10 border-hexa-warning/20';
      case 'Risk': return 'text-hexa-danger bg-hexa-danger/10 border-hexa-danger/20';
      default: return 'text-hexa-muted bg-white/5 border-white/10';
    }
  };

  const getTimeRangeStyle = (tag) => {
    return timeRange === tag 
      ? 'bg-hexa-primary text-hexa-deep font-bold border-hexa-primary' 
      : 'bg-white/5 text-hexa-muted hover:text-white border-white/10';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2 p-1.5 glass-card bg-white/[0.02] border-white/5 w-fit">
        {['1 Month', '1 Year', '10 Year'].map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-4 py-1.5 rounded-lg text-xs transition-all border ${getTimeRangeStyle(range)}`}
          >
            {range} Prediction
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const status = predictions[card.id] || 'OK';
          return (
            <div 
              key={card.id} 
              className="glass-card p-5 group hover:bg-white/[0.05] transition-all cursor-pointer border-white/5 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-hexa-primary" />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <h4 className="font-bold text-white text-sm">{card.title}</h4>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-hexa-muted uppercase font-bold tracking-widest">Current Status</span>
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase text-center w-fit ${getStatusColor(status)}`}>
                    {status}
                  </div>
                </div>
                
                <div className="h-10 w-24 bg-white/5 rounded-lg overflow-hidden relative">
                   {/* Simulated Graph */}
                   <div className="absolute bottom-0 left-0 w-full bg-hexa-primary/20" style={{ height: '40%' }}></div>
                   <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionCards;
