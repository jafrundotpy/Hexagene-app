import React from 'react';

const DashboardHeader = () => {
  const stats = [
    { label: 'Subjects', value: '14,204' },
    { label: 'Systems', value: '12' },
    { label: 'Engine Accuracy', value: '98.4%' },
    { label: 'Session Accuracy', value: '99.1%' },
  ];

  return (
    <header className="flex flex-col gap-6 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gradient-blue italic">
            HexaGene Clinical Oracle <span className="text-hexa-muted not-italic font-medium text-xl">v7.9</span>
          </h1>
          <p className="text-hexa-muted text-sm mt-1 uppercase tracking-widest font-medium">
            Biological & Physical Deterministic Modeling
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-hexa-success/10 border border-hexa-success/20 text-hexa-success text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hexa-success animate-pulse"></span>
            LIVE ENGINE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="text-hexa-muted text-[10px] uppercase font-bold tracking-wider mb-1">
              {stat.label}
            </span>
            <span className="text-2xl font-heading font-bold text-white tracking-tight">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
};

export default DashboardHeader;
