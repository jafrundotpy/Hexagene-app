import React, { useMemo } from 'react';

const StateWalkChart = React.memo(({ points, windowDays, crossings }) => {
  const W = 320, H = 130, PAD = 12;
  const gW = W - PAD * 2;
  const gH = H - PAD * 2;

  const maxDay = useMemo(() => Math.max(1, points?.[points.length - 1]?.day || windowDays || 21), [points, windowDays]);
  const toX = (d) => {
    const dayVal = Number(d) || 0;
    return PAD + (dayVal / maxDay) * gW;
  };
  const toY = (s) => {
    const stateVal = Number(s) || 0;
    const clamped = Math.max(0, Math.min(63, stateVal));
    return PAD + (1 - clamped / 63) * gH;
  };

  // Healthy range band: states 0–25
  const bandTop = toY(25);
  const bandBot = toY(0);

  // Build smooth cubic-bezier path
  const smoothPath = useMemo(() => {
    if (!points || !Array.isArray(points) || points.length < 2) return '';
    let d = `M ${toX(points[0].day)} ${toY(points[0].state)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      if (!prev || !curr) continue;
      const cpX = (toX(prev.day) + toX(curr.day)) / 2;
      d += ` C ${cpX} ${toY(prev.state)}, ${cpX} ${toY(curr.state)}, ${toX(curr.day)} ${toY(curr.state)}`;
    }
    return d;
  }, [points]);

  // Area fill path (close to bottom)
  const areaPath = useMemo(() => {
    if (!smoothPath || !points || !Array.isArray(points) || !points.length) return '';
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (!firstPoint || !lastPoint) return '';
    return `${smoothPath} L ${toX(lastPoint.day)} ${H - PAD} L ${toX(firstPoint.day)} ${H - PAD} Z`;
  }, [smoothPath, points]);

  // Find first crossing above healthy range
  const firstCrossingDay = useMemo(() => {
    if (!crossings || crossings < 1 || !points || !Array.isArray(points)) return null;
    const cross = points.find(p => p && p.state !== undefined && p.state > 25);
    return cross?.day ?? null;
  }, [crossings, points]);

  if (!points || !Array.isArray(points) || points.length < 2) return null;

  const last = points[points.length - 1];
  if (!last) return null;

  return (
    <div className="relative font-sans" aria-label="Physiological state trajectory chart">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H + 20}`}
        style={{ overflow: 'visible' }}
        role="img"
        aria-label={`State walk over ${windowDays} days`}
      >
        <defs>
          <linearGradient id="walk-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b07433" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#b07433" stopOpacity="0" />
          </linearGradient>
          {/* Glow for today dot */}
          <filter id="today-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Healthy range band */}
        <rect x={PAD} y={bandTop} width={gW} height={bandBot - bandTop}
          fill="#e4ebe2" opacity="0.6" rx="3" />
        <text x={PAD + 5} y={bandTop + 11}
          fontSize="8" fill="#5f7d63" fontWeight="700" fontFamily="sans-serif">
          healthy range
        </text>

        {/* First crossing annotation */}
        {firstCrossingDay && (
          <>
            <line
              x1={toX(firstCrossingDay)} y1={PAD}
              x2={toX(firstCrossingDay)} y2={H - PAD}
              stroke="#b07433" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
            />
            <text
              x={toX(firstCrossingDay) + 4} y={PAD + 10}
              fontSize="7.5" fill="#b07433" fontWeight="700" fontFamily="sans-serif">
              left range, day {Math.round(firstCrossingDay)}
            </text>
          </>
        )}

        {/* Area fill */}
        <path d={areaPath} fill="url(#walk-area)" />

        {/* Walk line */}
        <path
          d={smoothPath}
          fill="none"
          stroke="#b07433"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Intermediate dots */}
        {points.slice(0, -1).map((p, i) => (
          <circle key={i} cx={toX(p.day)} cy={toY(p.state)}
            r="2.5" fill="#fff" stroke="#b07433" strokeWidth="1.4" />
        ))}

        {/* Today dot with glow */}
        <circle
          cx={toX(last.day)} cy={toY(last.state)}
          r="5" fill="#b07433"
          filter="url(#today-glow)"
        />
        <text x={toX(last.day) - 14} y={toY(last.state) - 9}
          fontSize="8" fill="#b07433" fontWeight="700" fontFamily="sans-serif">
          today
        </text>

        {/* Timeline labels */}
        <text x={PAD} y={H + 16}
          fontSize="9" fill="#9ca3af" fontFamily="sans-serif">
          {windowDays} days ago
        </text>
        <text x={W - PAD} y={H + 16}
          fontSize="9" fill="#9ca3af" fontFamily="sans-serif" textAnchor="end">
          today
        </text>
      </svg>
    </div>
  );
});

StateWalkChart.displayName = 'StateWalkChart';
export default StateWalkChart;
