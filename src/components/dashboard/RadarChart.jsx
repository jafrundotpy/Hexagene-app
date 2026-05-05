import React from 'react';
import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const RadarChart = ({ data, color = '#22C55E' }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="axis" 
            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={3}
            animationDuration={1000}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
