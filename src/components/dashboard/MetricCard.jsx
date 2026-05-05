import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, trend, trendValue, icon, color = 'primary', className = '' }) => {
  const isPositive = trend === 'up';
  
  const colorMap = {
    primary: 'text-hexa-primary border-hexa-primary/20 bg-hexa-primary/5',
    secondary: 'text-hexa-secondary border-hexa-secondary/20 bg-hexa-secondary/5',
    accent: 'text-hexa-accent border-hexa-accent/20 bg-hexa-accent/5',
    success: 'text-hexa-success border-hexa-success/20 bg-hexa-success/5',
    warning: 'text-hexa-warning border-hexa-warning/20 bg-hexa-warning/5',
    danger: 'text-hexa-danger border-hexa-danger/20 bg-hexa-danger/5',
  };

  const accentColor = colorMap[color] || colorMap.primary;

  return (
    <div className={`stat-card relative overflow-hidden group ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl border ${accentColor} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-hexa-success bg-hexa-success/10' : 'text-hexa-danger bg-hexa-danger/10'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-heading font-bold">{value}</h3>
          <span className="text-white/30 text-sm font-medium">{unit}</span>
        </div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 blur-[40px] opacity-20 rounded-full transition-opacity group-hover:opacity-40 duration-500 ${accentColor.split(' ')[2]}`} />
    </div>
  );
};

export default MetricCard;
