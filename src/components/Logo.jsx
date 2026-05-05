import React from 'react';

const Logo = ({ size = 32, showText = true, className = "", onClick }) => {
  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative">
        <div 
          className="rounded-[20%] overflow-hidden shadow-sm"
          style={{ 
            width: size, 
            height: size,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)' 
          }}
        />
      </div>
      
      {showText && (
        <span 
          className="text-2xl font-bold tracking-tight"
          style={{ 
            fontFamily: '"Times New Roman", Times, serif',
            color: '#1e40af' // Deep blue matching the logo text
          }}
        >
          HexaGene
        </span>
      )}
    </div>
  );
};

export default Logo;
