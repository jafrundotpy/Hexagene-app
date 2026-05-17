export const LOOP_NAMES = {
  "glucose_insulin":  "Blood-Sugar Rhythm",
  "HPA":              "Stress-Recovery Balance",
  "circadian":        "Sleep-Timing Rhythm",
  "cardiovascular":   "Cardiovascular Pacing",
  "cardiorespiratory":"Cardiorespiratory Fitness",
  "RAAS":             "Fluid Balance",
  "oxygen_HIF":       "Oxygenation",
  "thermoregulation": "Body Temperature",
  "energy_balance":   "Energy Balance",
  "acid_base":        "Acid-Base Balance"
};

export const VITALS_COLORS = {
  steady:      '#5f7d63',
  drifting:    '#b07433',
  driftingRed: '#9a4b32',
  bgLight:     '#f7f4ee',
  bgChip:      '#f0e6d4',
  bgSteady:    '#e4ebe2',
  borderLight: '#c2b89f',
  darkBg:      '#1a1f2e',
  darkText:    '#f0ebe0',
  trackBg:     '#e2e8ec',
  fillBlue:    '#5a7385'
};

export const getLoopName = (loopId) =>
  LOOP_NAMES[loopId] || loopId.replace(/_/g, ' ');

/** Returns color class string based on drift magnitude */
export const getDriftColor = (drift) => {
  if (drift > 0.6) return VITALS_COLORS.driftingRed;
  if (drift > 0.3) return VITALS_COLORS.drifting;
  return VITALS_COLORS.steady;
};

/** Returns tailwind-style bg color based on axis contribution */
export const getAxisColor = (value) => {
  if (value > 0.5)  return '#ef4444'; // red
  if (value > 0.2)  return '#f59e0b'; // amber
  if (value > 0.0)  return '#5f7d63'; // green
  return '#94a3b8';                   // slate (neutral / negative)
};

export const BUCKET_MAPPING = {
  Recovery: ['HPA', 'thermoregulation'],
  Sleep:    ['circadian'],
  Metabolic:['glucose_insulin', 'energy_balance'],
  Pace:     ['cardiovascular', 'cardiorespiratory', 'oxygen_HIF', 'RAAS', 'acid_base']
};

export const findBucketForLoop = (loopId) => {
  for (const [bucket, loops] of Object.entries(BUCKET_MAPPING)) {
    if (loops.includes(loopId)) return bucket;
  }
  return 'Recovery';
};
