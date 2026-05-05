import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon, trend, trendValue, color = "green", loading }) => {
  const colors = {
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-400 bg-gray-50",
  };

  return (
    <div className="health-card health-card-hover p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color] || colors.green}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${trendColors[trend]}`}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-bold text-health-muted uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-health-text">{value}</h3>
          {unit && <span className="text-sm font-medium text-health-muted">{unit}</span>}
        </div>
      </div>
      
      {loading && (
        <div className="mt-4 h-1.5 w-full bg-health-surface rounded-full overflow-hidden">
          <div className="h-full bg-health-primary animate-pulse w-1/3" />
        </div>
      )}
    </div>
  );
};

export default MetricCard;
