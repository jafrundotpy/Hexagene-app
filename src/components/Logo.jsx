import React from 'react';

const Logo = ({ size = 28, showText = true, className = "", onClick }) => {
  return (
    <div
      className={`logo-container ${className}`}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div 
        className="logo-mark" 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '25%', 
          background: 'linear-gradient(135deg, #00e5ff 0%, #2979ff 100%)',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)'
        }} 
      />
      {showText && (
        <span style={{ 
          fontFamily: "'Outfit', sans-serif", 
          fontWeight: 700, 
          fontSize: size * 0.9, 
          color: 'white',
          letterSpacing: '-0.02em'
        }}>
          HexaGene
        </span>
      )}
    </div>
  );
};

export default Logo;
