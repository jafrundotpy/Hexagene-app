import React from 'react';

const Logo = ({ size = 32, showText = true, className = "", onClick }) => {
  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="10" fill="#22C55E" />
          <path 
            d="M16 8V24M8 16H24" 
            stroke="white" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
      
      {showText && (
        <span className="text-xl font-heading font-bold tracking-tight text-health-text">
          Exa<span className="text-health-primary">gin</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
