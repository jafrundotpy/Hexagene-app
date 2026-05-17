import React, { useMemo } from 'react';
import { getLoopName } from '../../../utils/vitalsHelpers';
import { Check } from 'lucide-react';

const Layer3_Closing = ({ vitals }) => {
  const { recommendations, loop_attribution, trajectory } = vitals;
  if (!recommendations?.length) return null;

  const lever = recommendations[0];
  const targetLoop = lever.target_loop ?? loop_attribution?.[0]?.loop;
  const loopName = getLoopName(targetLoop ?? 'unknown');

  // Determine resolution from real backend drift value
  const primaryDrift = loop_attribution?.[0]?.mean_drift ?? 1;
  const isResolved = primaryDrift < 0.2;

  // Progress: scale current drift vs a "started" drift baseline
  // We use mean_dwell_days to approximate days in intervention
  const daysIn = Math.round(trajectory?.mean_dwell_days ?? 0);
  const daysTarget = 10; // typical intervention window
  // Progress toward resolved: (1 - current_drift) expressed as completion %
  const progressPct = isResolved
    ? 100
    : Math.min(95, Math.round((1 - primaryDrift) * 100));

  const reentryText = lever.reentry_condition
    ?? `${loopName} axis returns to healthy range and holds steady for 3+ days.`;

  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
      {!isResolved ? (
        /* ── IN PROGRESS ─────────────────────────────── */
        <div className="animate-fade-in">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
            IN PROGRESS · DAY {daysIn} OF ~{daysTarget}
          </p>
          <h3 className="font-serif text-[26px] leading-tight text-vitals-text mb-3">
            Your <span style={{ color: '#b07433' }}>{loopName}</span> is starting to turn.
          </h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            The signal is bending back toward your healthy range — not there yet, but moving.
          </p>

          <div
            className="rounded-2xl p-6"
            style={{ background: '#f9f8f6', border: '1px solid #e8e3dc' }}
          >
            <h5 className="text-xs font-bold text-vitals-text mb-4">Progress to resolved</h5>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] text-slate-400 tracking-widest shrink-0">started</span>
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: '#e2e8ec' }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-1200 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: '#5a7385',
                    '--progress-width': `${progressPct}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 tracking-widest shrink-0">resolved</span>
            </div>
            <div className="text-center mb-5">
              <span className="text-[11px] font-bold" style={{ color: '#5a7385' }}>{progressPct}%</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed border-t pt-4" style={{ borderColor: '#e0d6c8' }}>
              <span className="font-bold text-vitals-text">Resolved when: </span>
              {reentryText}
            </p>
          </div>
        </div>
      ) : (
        /* ── RESOLVED ────────────────────────────────── */
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm"
            style={{ background: '#e4ebe2', border: '1px solid #c4d6c1', color: '#5f7d63' }}
          >
            <Check size={30} strokeWidth={2.5} />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#b07433' }}>
            RESOLVED · DAY {daysIn}
          </p>
          <h3 className="font-serif text-[26px] leading-tight text-vitals-text mb-3">
            It worked. Your {loopName} is back in range — and holding.
          </h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs">
            The drift is resolved. It's steady, not just spiking. This is what closing a loop looks like.
          </p>

          <div
            className="w-full rounded-2xl p-6 text-left"
            style={{ background: '#e4ebe2', border: '1px solid #c4d6c1' }}
          >
            <h5 className="text-xs font-bold text-vitals-text mb-4">Resolved</h5>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] text-slate-500 tracking-widest">started</span>
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: '#c9deca' }}
              >
                <div className="h-full w-full rounded-full" style={{ background: '#5f7d63' }} />
              </div>
              <span className="text-[10px] text-slate-500 tracking-widest">resolved</span>
            </div>

            <div className="flex items-center justify-between mt-5">
              <p className="text-[11px] font-medium" style={{ color: '#3d6644' }}>
                Held inside range for {Math.max(1, daysIn - daysTarget)} days.<br />
                Re-entry confirmed.
              </p>
              <div
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: '#c4d6c1', color: '#3d6644', border: '1px solid #a8c9a8' }}
              >
                <Check size={10} strokeWidth={3} />
                First closed loop
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layer3_Closing;
