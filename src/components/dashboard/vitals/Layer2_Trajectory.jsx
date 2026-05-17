import React from 'react';
import StateWalkChart from './StateWalkChart';
import { getLoopName } from '../../../utils/vitalsHelpers';

const STABILITY_STYLE = {
  basin: { bg: '#e4ebe2', border: '#c4d6c1', text: '#3d6644', badge: 'Stable basin', desc: 'Measured from your data — sitting firmly in its current state.' },
  slope: { bg: '#f0e6d4', border: '#c2b89f', text: '#7a4f20', badge: 'Steady slope', desc: 'Measured from your data — drifting in one direction, not oscillating.' },
  ridge: { bg: '#fde8e8', border: '#f0b8b8', text: '#7f2020', badge: 'Ridge — active', desc: 'Measured from your data — crossing state boundaries frequently.' },
};

const Layer2_Trajectory = ({ vitals }) => {
  const { trajectory, stability, loop_attribution, window_days, validated = true } = vitals;
  if (!trajectory?.points?.length) return null;

  const cls = stability?.classification ?? 'slope';
  const style = STABILITY_STYLE[cls] ?? STABILITY_STYLE.slope;
  const topLoop = loop_attribution?.[0];
  const loopName = topLoop ? getLoopName(topLoop.loop) : 'your primary system';
  const daysMoving = Math.round((window_days ?? 21) * 0.6);

  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-serif text-2xl text-vitals-text mb-1">Your trajectory</h3>
        <p className="text-slate-500 text-sm">{window_days} days · measured, not a forecast</p>
      </div>

      {/* State walk chart */}
      <div className="border border-slate-100 rounded-2xl p-4 mb-6" style={{ background: '#f9f8f6' }}>
        <StateWalkChart
          points={trajectory.points}
          windowDays={window_days}
          crossings={trajectory.state_crossings}
        />
      </div>

      {/* Stability badge */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-start gap-4"
        style={{ background: style.bg, border: `1px solid ${style.border}` }}
      >
        <span className="font-bold text-lg mt-0.5 capitalize shrink-0" style={{ color: style.text }}>
          {cls}
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: style.text }}>
            {style.badge}
          </p>
          <p className="text-sm leading-snug" style={{ color: style.text }}>
            {style.desc} You've been moving one way for {daysMoving} days.
          </p>
        </div>
      </div>

      {/* Forward card — only when validated */}
      {validated && (
        <div className="rounded-2xl p-6 mb-6 text-[#f0ebe0]" style={{ background: '#1a1a2e' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-vitals-drift animate-pulse-subtle" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              What this means going forward
            </h4>
          </div>
          <p className="font-serif text-lg leading-relaxed mb-4 text-white">
            Drifts like this don't usually self-correct on their own — but they respond well to input.
            The lever typically shows up in <span style={{ color: '#b07433' }}>{loopName}</span> within 7–10 days.
          </p>
          <p className="text-xs text-slate-500 border-t border-slate-800 pt-4">
            Grounded in HRS — a 15-year outcome study, 8 disease pathways, 45,234 people.
            This is expectation, not alarm.
          </p>
        </div>
      )}

      {/* Loop attribution list */}
      <div className="space-y-3 pt-2">
        {(loop_attribution ?? []).map((loop, i) => (
          <div
            key={loop.loop}
            className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: i === 0 ? '#9a4b32' : loop.mean_drift > 0.3 ? '#b07433' : '#8ba18d' }}
              />
              <span className="text-vitals-text font-medium text-sm">{getLoopName(loop.loop)}</span>
            </div>
            <span className="text-slate-400 text-sm font-medium tabular-nums">
              drift +{loop.mean_drift.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layer2_Trajectory;
