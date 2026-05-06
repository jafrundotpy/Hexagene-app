import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = 32, showText = true, className = "", onClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      onClick={handleLogoClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="relative">
        <div 
          className="rounded-[20%] overflow-hidden shadow-sm"
          style={{ 
            width: size, 
            height: size,
            background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)' 
          }}
        />
      </div>
      
      {showText && (
        <span 
          className="text-2xl font-bold tracking-tight"
          style={{ 
            fontFamily: '"Times New Roman", Times, serif',
            color: '#15803d' // Green matching the UI
          }}
        >
          HexaGene
        </span>
      )}
    </div>
  );
};

export default Logo;
