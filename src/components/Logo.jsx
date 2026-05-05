import React from 'react';

const Logo = ({ size = 32, showText = true, className = "", onClick }) => {
  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative group">
        <div 
          className="absolute inset-0 bg-hexa-primary blur-md opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ width: size, height: size }}
        />
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
          <path 
            d="M10 10L22 22M22 10L10 22" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeOpacity="0.8"
          />
          <circle cx="16" cy="16" r="4" fill="white" />
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className="text-xl font-heading font-black tracking-tighter text-white">
          Hexa<span className="text-hexa-primary">Gene</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
