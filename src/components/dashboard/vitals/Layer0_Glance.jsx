import React, { useMemo } from 'react';
import SixAxisRing from './SixAxisRing';
import { getLoopName } from '../../../utils/vitalsHelpers';
import { ChevronDown } from 'lucide-react';

/* Derive a plain-language glance sentence from backend data — no invention */
const buildGlanceSentence = (trajectory, topLoop, window_days, loopName) => {
  const dir = trajectory?.net_drift_direction ?? '';
  const days = window_days ?? 21;

  if (dir.includes('stress')) {
    return (
      <>
        Your <span style={{ color: '#b07433' }}>{loopName}</span>{' '}
        has been drifting for about{' '}
        <span style={{ color: '#b07433' }}>{days} days</span>.
      </>
    );
  }
  if (dir.includes('recover')) {
    return (
      <>
        Your <span style={{ color: '#5f7d63' }}>{loopName}</span>{' '}
        is recovering — trending back toward range over{' '}
        <span style={{ color: '#5f7d63' }}>{days} days</span>.
      </>
    );
  }
  return (
    <>
      Your <span style={{ color: '#6b7280' }}>{loopName}</span>{' '}
      is holding steady across{' '}
      <span style={{ color: '#6b7280' }}>{days} days</span>.
    </>
  );
};

const Layer0_Glance = ({ vitals, onExpand }) => {
  const { trajectory, loop_attribution, window_days, axis_contributions, recommendations } = vitals;

  const heading = trajectory?.net_drift_direction?.includes('stress') ? 'drifting'
    : trajectory?.net_drift_direction?.includes('recover') ? 'recovering' : 'holding';

  const topLoop = loop_attribution?.[0] ?? {};
  const loopName = getLoopName(topLoop.loop ?? 'unknown');

  // High-priority recommendation as "today's lever"
  const lever = useMemo(() =>
    recommendations?.find(r => r.priority === 'high') ?? recommendations?.[0] ?? null,
    [recommendations]);

  const glanceSentence = buildGlanceSentence(trajectory, topLoop, window_days, loopName);

  const subText = heading === 'drifting'
    ? "It's the system moving most. Your sleep and stress-recovery may be slipping too — but this is the lever."
    : heading === 'recovering'
    ? "The signal is bending back. Stay on the intervention and let the data confirm it."
    : "Systems are balanced. Keep current inputs consistent to maintain this position.";

  return (
    <div
      className="wearable-card p-8 md:p-10 text-center relative overflow-hidden cursor-pointer group"
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onExpand?.()}
      aria-label="Expand vitals detail"
    >
      {/* Subtle parchment gradient bg */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #f0e6d4 0%, transparent 70%)' }}
      />

      {/* 6-Axis Ring */}
      <div className="flex justify-center mb-8 animate-breath relative z-10">
        <SixAxisRing
          axes={axis_contributions}
          heading={heading}
          windowDays={window_days}
        />
      </div>

      {/* Heading chip */}
      <div className="flex justify-center mb-6 relative z-10">
        <span className={heading === 'drifting' ? 'vitals-chip-drift' : heading === 'recovering' ? 'vitals-chip-steady' : 'vitals-chip-steady'}>
          {heading === 'drifting' ? '↘' : heading === 'recovering' ? '↗' : '→'}
          &nbsp;{heading} · {window_days} days
        </span>
      </div>

      {/* Glance statement — serif, emotional */}
      <h2 className="font-serif text-[26px] md:text-[30px] leading-tight text-vitals-text mb-4 relative z-10 max-w-xs mx-auto">
        {glanceSentence}
      </h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-[280px] mx-auto relative z-10">
        {subText}
      </p>

      {/* Today's Lever — from backend recommendations[0] */}
      {lever && (
        <div
          className="rounded-[18px] p-6 text-left relative z-10 shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
          style={{ background: '#f7f4ee', border: '1px solid #c2b89f' }}
        >
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#b07433' }}>
            Today's lever
          </h4>
          <p className="font-medium text-[15px] leading-snug mb-3" style={{ color: '#222' }}>
            {lever.observed ?? 'Focus on the intervention for this system today.'}
          </p>
          {lever.driven_by?.length > 0 && (
            <p className="text-xs text-slate-500 pt-3 border-t" style={{ borderColor: '#e0d6c8' }}>
              Driven by: {lever.driven_by.map(s => s.replace(/_/g, ' ')).join(', ')}.
            </p>
          )}
        </div>
      )}

      {/* Expand affordance */}
      <div className="mt-8 flex justify-center text-slate-400 group-hover:text-vitals-drift transition-colors animate-bounce relative z-10">
        <ChevronDown size={20} aria-hidden="true" />
      </div>
    </div>
  );
};

export default Layer0_Glance;
