import React, { useCallback, useRef } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import Layer0_Glance from './Layer0_Glance';
import Layer1_Explained from './Layer1_Explained';
import Layer2_Trajectory from './Layer2_Trajectory';
import Layer3_Closing from './Layer3_Closing';

/* ── Empty State ──────────────────────────────────────────── */
const VitalsEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border"
      style={{ background: '#f0e6d4', borderColor: '#c2b89f' }}
    >
      <Activity size={30} style={{ color: '#b07433', opacity: 0.6 }} />
    </div>
    <h4 className="font-serif text-xl mb-3" style={{ color: '#222' }}>
      No Wearable Data Yet
    </h4>
    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
      Add 7+ days of wearable data (HRV, CGM, Steps, SpO2) in the left panel
      and run the analysis to see your physiological trajectory.
    </p>
    <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
      {['HRV (ms)', 'CGM Glucose', 'SpO2 (%)', 'Sleep hours', 'Steps', 'Resting HR'].map(s => (
        <span
          key={s}
          className="rounded-xl px-3 py-1.5 font-medium border"
          style={{ background: '#f7f4ee', borderColor: '#c2b89f' }}
        >
          {s}
        </span>
      ))}
    </div>
  </div>
);

/* ── Main Orchestrator ────────────────────────────────────── */
const VitalsDashboard = ({ vitals }) => {
  const layer1Ref = useRef(null);

  const scrollToLayer1 = useCallback(() => {
    layer1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  console.log("[DEBUG] VitalsDashboard - vitals block received:", vitals);

  if (!vitals) {
    console.log("[DEBUG] VitalsDashboard - vitals block is missing, rendering empty state.");
    return <VitalsEmptyState />;
  }

  const hasTrajectory  = (vitals.trajectory?.points?.length ?? 0) > 1;
  const hasRecommendations = (vitals.recommendations?.length ?? 0) > 0;

  console.log("[DEBUG] VitalsDashboard - render conditions:", { hasTrajectory, hasRecommendations });

  return (
    /*
     * Responsive wearable canvas:
     *   mobile  → full-width vertical scroll
     *   tablet  → max-wearable (480px) centered
     *   desktop → centered wearable canvas with generous surrounding whitespace
     */
    <div
      className="w-full flex flex-col items-center gap-6"
      id="vitals-section"
      aria-label="Vitals physiological intelligence surface"
    >
      {/* Demo mode banner */}
      {vitals.mode === 'demo' && (
        <div
          className="w-full max-w-wearable flex items-start gap-3 px-4 py-3 rounded-2xl border"
          style={{ background: '#fffbeb', borderColor: '#fde68a' }}
        >
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
            <strong>Demo mode</strong> — structure is production-faithful; numeric values are
            deterministic placeholders from the engine, not validated clinical scores.
          </p>
        </div>
      )}

      {/* ── Layer 0: The Glance — always first ── */}
      <div className="w-full max-w-wearable animate-slide-up">
        <Layer0_Glance vitals={vitals} onExpand={scrollToLayer1} />
      </div>

      {/* ── Layer 1: Today Explained ── */}
      <div
        ref={layer1Ref}
        className="w-full max-w-wearable animate-slide-up"
        style={{ animationDelay: '80ms' }}
      >
        <Layer1_Explained vitals={vitals} />
      </div>

      {/* ── Layer 2: The Trajectory ── */}
      {hasTrajectory && (
        <div
          className="w-full max-w-wearable animate-slide-up"
          style={{ animationDelay: '160ms' }}
        >
          <Layer2_Trajectory vitals={vitals} />
        </div>
      )}

      {/* ── Layer 3: Loop Closing ── */}
      {hasRecommendations && (
        <div
          className="w-full max-w-wearable animate-slide-up"
          style={{ animationDelay: '240ms' }}
        >
          <Layer3_Closing vitals={vitals} />
        </div>
      )}

      {/* Footer note from backend */}
      {vitals.note && (
        <p
          className="text-[10px] text-slate-400 italic text-center max-w-sm leading-relaxed px-4 pb-4"
        >
          {vitals.note}
        </p>
      )}
    </div>
  );
};

export default VitalsDashboard;
