import React, { useMemo } from 'react';

// Memoized SVG arc helper
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const large = (endAngle - startAngle) <= 180 ? '0' : '1';
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
};

const getSegmentColor = (value) => {
  if (value > 0.65) return '#9a4b32'; // high drift – deep terracotta
  if (value > 0.40) return '#b07433'; // moderate drift – burnished gold
  if (value > 0.20) return '#c49a6c'; // low-moderate – warm tan
  return '#8ba18d';                    // steady – sage green
};

const AXES_KEYS = ['structural', 'inflammatory', 'metabolic', 'redox', 'kinetic', 'balance'];

const SixAxisRing = React.memo(({ axes, heading, windowDays }) => {
  const SIZE = 204;
  const STROKE = 18;
  const RADIUS = (SIZE - STROKE) / 2;
  const CENTER = SIZE / 2;
  const GAP_DEG = 5;
  const SEG_DEG = (360 - GAP_DEG * 6) / 6;

  const segments = useMemo(() => {
    return AXES_KEYS.map((key, i) => {
      const raw = Math.abs(axes?.[key] ?? 0);
      const val = Math.max(0, Math.min(1, raw));
      const start = i * (SEG_DEG + GAP_DEG);
      const trackEnd = start + SEG_DEG;
      const fillEnd = start + val * SEG_DEG;
      const color = getSegmentColor(val);
      return { key, val, start, trackEnd, fillEnd, color, isHigh: val > 0.5 };
    });
  }, [axes]);

  const maxDrift = useMemo(() =>
    Math.max(...AXES_KEYS.map(k => Math.abs(axes?.[k] ?? 0))), [axes]);

  const headingColor = heading === 'drifting' ? '#b07433'
    : heading === 'recovering' ? '#5f7d63' : '#6b7280';

  const headingArrow = heading === 'drifting' ? '↘'
    : heading === 'recovering' ? '↗' : '→';

  return (
    <div
      className={`relative flex items-center justify-center${maxDrift > 0.5 ? ' animate-ring-pulse' : ''}`}
      role="img"
      aria-label={`Six-axis physiological ring. Current state: ${heading ?? 'holding'}`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Soft glow filter for high-drift segments */}
          <filter id="seg-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {segments.map((seg) => (
          <g key={seg.key}>
            {/* Background track */}
            <path
              d={describeArc(CENTER, CENTER, RADIUS, seg.start, seg.trackEnd)}
              fill="none"
              stroke="#e8e4de"
              strokeWidth={STROKE}
              strokeLinecap="butt"
            />
            {/* Value fill */}
            {seg.val > 0.01 && (
              <path
                d={describeArc(CENTER, CENTER, RADIUS, seg.start, seg.fillEnd)}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                filter={seg.isHigh ? 'url(#seg-glow)' : undefined}
                style={{ transition: 'stroke 0.6s ease' }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center select-none pointer-events-none">
        <span className="text-[10px] text-slate-400 tracking-widest uppercase font-sans mb-0.5">heading</span>
        <span
          className="text-[22px] font-medium font-serif leading-tight"
          style={{ color: headingColor }}
        >
          {headingArrow} {heading ?? 'holding'}
        </span>
      </div>
    </div>
  );
});

SixAxisRing.displayName = 'SixAxisRing';
export default SixAxisRing;
