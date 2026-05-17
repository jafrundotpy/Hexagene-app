import React, { useMemo } from 'react';
import { getLoopName, findBucketForLoop, VITALS_COLORS } from '../../../utils/vitalsHelpers';

const AXES_KEYS = ['structural', 'inflammatory', 'metabolic', 'redox', 'kinetic', 'balance'];
const AXIS_SHORT = { structural:'STRUCT', inflammatory:'INFLAM', metabolic:'METAB', redox:'REDOX', kinetic:'KINET', balance:'BALANC' };

const Layer1_Explained = ({ vitals }) => {
  const { axis_contributions, loop_attribution } = vitals;

  const { buckets, steadyLoops, driftingCount } = useMemo(() => {
    const b = {
      Recovery: { id: 'Recovery', label: 'R', loop: null, drift: 0, desc: 'Stress-recovery' },
      Sleep:    { id: 'Sleep',    label: 'S', loop: null, drift: 0, desc: 'Sleep-timing' },
      Metabolic:{ id: 'Metabolic',label: 'M', loop: null, drift: 0, desc: 'Metabolic' },
      Pace:     { id: 'Pace',     label: 'P', loop: null, drift: 0, desc: 'Cardiovascular' },
    };
    const steady = [];
    let driftCount = 0;

    (loop_attribution ?? []).forEach(attr => {
      const bid = findBucketForLoop(attr.loop);
      if (b[bid] && attr.mean_drift > b[bid].drift) {
        b[bid].loop = attr.loop;
        b[bid].drift = attr.mean_drift;
      }
      if (attr.mean_drift < 0.25) steady.push(getLoopName(attr.loop));
      if (attr.mean_drift >= 0.3) driftCount++;
    });

    return { buckets: b, steadyLoops: steady, driftingCount: driftCount };
  }, [loop_attribution]);

  const maxDrift = Math.max(...Object.values(buckets).map(b => b.drift), 0);

  return (
    <div
      className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm"
      id="vitals-layer1"
    >
      {/* Header */}
      <div className="mb-8">
        <h3 className="font-serif text-2xl text-vitals-text mb-1">Today, explained</h3>
        <p className="text-slate-500 text-sm">
          Six systems.{' '}
          {steadyLoops.length > 0 && (
            <span style={{ color: '#5f7d63' }} className="font-semibold">
              {steadyLoops.length} of them steady.
            </span>
          )}
        </p>
      </div>

      {/* Axis strip — 6 bars from axis_contributions */}
      <div className="flex items-end justify-between gap-1.5 mb-10" aria-label="Six-axis load overview">
        {AXES_KEYS.map((key, i) => {
          const val = Math.max(0, axis_contributions?.[key] ?? 0);
          const pct = Math.min(100, val * 100);
          const isDrifting = val > 0.35;
          return (
            <div key={key} className="flex flex-col items-center flex-1">
              <div className="w-full bg-vitals-parchment/50 h-[44px] rounded-md relative overflow-hidden mb-1.5 border border-slate-100">
                <div
                  className="absolute bottom-0 w-full transition-all duration-1000 ease-out"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isDrifting ? VITALS_COLORS.drifting : VITALS_COLORS.steady,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                {AXIS_SHORT[key]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Four Buckets */}
      <div className="space-y-2.5 mb-8">
        {Object.values(buckets).map(bucket => {
          const isDrift = bucket.drift >= 0.3;
          const isMost  = bucket.drift === maxDrift && isDrift;
          return (
            <div
              key={bucket.id}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200"
              style={{
                borderColor: isDrift ? '#e0d6c8' : '#d1e8d2',
                background: isDrift ? '#fdfaf6' : '#f8fbf8',
              }}
            >
              {/* Letter avatar */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-serif text-xl shrink-0"
                style={{
                  background: isDrift ? '#f0e6d4' : '#e4ebe2',
                  color: isDrift ? '#b07433' : '#5f7d63',
                }}
              >
                {bucket.label}
              </div>

              {/* Name + loop */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-vitals-text text-sm">{bucket.id}</h4>
                <p className="text-xs text-slate-500 truncate">
                  {bucket.loop ? getLoopName(bucket.loop) : `${bucket.desc} baseline`}
                  <span className="italic ml-1">
                    · {isMost ? 'drifting most' : isDrift ? 'slipping' : 'steady'}
                  </span>
                </p>
              </div>

              {/* Badge */}
              {isMost ? (
                <span className="vitals-badge-drift shrink-0">⚑ MOST</span>
              ) : isDrift ? (
                <span className="vitals-badge-drift shrink-0">DRIFT</span>
              ) : (
                <span className="vitals-badge-steady shrink-0">STEADY</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Steady reassurance — reduce anxiety */}
      {steadyLoops.length > 0 && (
        <div
          className="rounded-[14px] p-4 text-sm font-medium leading-relaxed"
          style={{ background: '#e4ebe2', color: '#3d6644' }}
        >
          <span style={{ color: '#5f7d63' }} className="font-bold">
            {steadyLoops.slice(0, 3).join(', ')}{steadyLoops.length > 3 ? ` and ${steadyLoops.length - 3} more` : ''}
          </span>{' '}
          {steadyLoops.length === 1 ? 'is' : 'are'} steady.{' '}
          This is {driftingCount > 0 ? `${driftingCount} system${driftingCount > 1 ? 's' : ''} moving` : 'stability across the board'} — not your whole body.
        </div>
      )}
    </div>
  );
};

export default Layer1_Explained;
