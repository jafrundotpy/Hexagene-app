import React from 'react';
import { RefreshCw, Eye, Edit3, Shield } from 'lucide-react';

const ControlBar = ({ 
  onLoadRandom, 
  onReveal, 
  onToggleMode, 
  isManualMode,
  filters,
  onFilterChange,
  revealId 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-card mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <button 
          onClick={onLoadRandom}
          className="btn-premium flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Load Random
        </button>

        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <select 
            value={filters.ageGroup}
            onChange={(e) => onFilterChange('ageGroup', e.target.value)}
            className="input-hexa bg-hexa-panel/50 border-white/5"
          >
            <option value="All">All Ages</option>
            <option value="Youth">Youth (12-30)</option>
            <option value="Adult">Adult (31-50)</option>
            <option value="Middle">Middle (51-65)</option>
            <option value="Senior">Senior (66-80)</option>
          </select>

          <select 
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="input-hexa bg-hexa-panel/50 border-white/5"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>

          <select 
            value={filters.riskLevel}
            onChange={(e) => onFilterChange('riskLevel', e.target.value)}
            className="input-hexa bg-hexa-panel/50 border-white/5"
          >
            <option value="All">All Risk</option>
            <option value="Healthy">Healthy</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-hexa-muted font-bold uppercase tracking-tighter">Session ID</span>
          <span className="text-sm font-mono text-hexa-primary font-bold">#{revealId}</span>
        </div>
        
        <div className="h-8 w-px bg-white/10"></div>

        <button 
          onClick={onToggleMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isManualMode 
              ? 'bg-hexa-secondary text-white shadow-[0_0_15px_rgba(41,121,255,0.4)]' 
              : 'text-hexa-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <Edit3 size={16} />
          {isManualMode ? 'Manual Mode' : 'Random Mode'}
        </button>

        <button 
          onClick={onReveal}
          className="px-6 py-2.5 rounded-lg bg-white text-hexa-deep font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl"
        >
          <Eye size={16} />
          Reveal Prediction
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
