/**
 * User-Friendly Clinical Summary Generator for HexaGene
 * Transforms raw backend biometrics into actionable, plain-English insights.
 */

const BACKEND_TERM_MAP = {
  "Metabolic axis elevated": "Your metabolism needs attention",
  "Inflammatory markers elevated": "Your body has more inflammation than ideal",
  "HRV below optimal": "Your stress recovery could be better",
  "Consider lifestyle modifications": "Try these small changes this week",
  "Pharmacogenomic overlap detected": "Your genetics affect how you process this medication",
  "CYP2D6 variant": "Your body processes some medications differently",
  "serotonin_syndrome_risk": "Risk of medication interaction - review with doctor",
  "Completeness low": "Add more lab tests for better accuracy"
};

const MISSING_MARKER_MAP = {
  hdl: "Add HDL cholesterol for better heart health picture",
  ldl: "Add LDL cholesterol to assess heart risk",
  triglycerides: "Add triglycerides for metabolic health",
  crp: "Add CRP to measure inflammation",
  hba1c: "Add HbA1c for blood sugar trends",
  egfr: "Add eGFR for kidney health",
  albumin: "Add albumin for nutritional status"
};

export const generateUserFriendlySummary = (data) => {
  if (!data || !data.position) return null;

  const { position, clinical, terrain, forces } = data;
  const classification = position.classification;
  const riskScore = position.risk_score;
  const axes = position.axes;

  let summary = {
    headline: "",
    risk_message: `Your risk score is ${riskScore.toFixed(2)} (${classification}). This means your health markers need attention.`,
    what_this_means: [],
    what_you_are_doing_well: [],
    what_you_can_do: [],
    good_news: "No genetic emergencies detected. Your system is stable.",
    simple_summary: "",
    doctor_note: ""
  };

  // 1. Template Selection
  if (classification === "HIGH") {
    summary.headline = "⚠️ Your health needs attention - but you can improve it";
    summary.doctor_note = "Schedule a check-up within 1-2 months to discuss these results.";
    
    if (axes.metabolic > 0.65) summary.what_this_means.push(`Your metabolism is higher than ideal (${Math.round(axes.metabolic * 100)}%)`);
    if (axes.inflammatory > 0.65) summary.what_this_means.push(`Your inflammation levels are elevated (${Math.round(axes.inflammatory * 100)}%)`);
    if (axes.kinetic > 0.65) summary.what_this_means.push(`Your energy metrics need attention (${Math.round(axes.kinetic * 100)}%)`);
    
    summary.simple_summary = `Your health score is HIGH because your metabolism and inflammation are above ideal ranges. The good news: these can improve with lifestyle changes. Start with daily walks and reducing sugar.`;
  } 
  else if (classification === "MODERATE") {
    summary.headline = "✅ You're on the right track - here's how to improve";
    summary.risk_message = `Your health is in the moderate range - not bad, but can be better.`;
    summary.doctor_note = "Discuss at your next routine visit (3-6 months).";
    
    const focusAxes = Object.entries(axes).filter(([_, v]) => v > 0.55).map(([k]) => k);
    if (focusAxes.length > 0) summary.what_this_means.push(`Specific areas to focus: ${focusAxes.join(', ')}`);
    
    summary.simple_summary = `You are doing well, but there are opportunities to optimize your metabolism and stress balance. Small changes to your routine will move you into the low-risk category.`;
  } 
  else {
    summary.headline = "🎉 EXCELLENT! You're in great health";
    summary.risk_message = `All your health markers are in ideal ranges. Your risk score is very low (${riskScore.toFixed(3)}).`;
    summary.doctor_note = "Routine annual wellness visit is sufficient.";
    
    summary.what_this_means.push("You are maintaining an optimal balance across all biological axes.");
    summary.simple_summary = `You're a great example of healthy living! Everything looks optimal. Keep up your current routine.`;
  }

  // 2. What you're doing well (Healthy ranges)
  if (axes.balance < 0.45) summary.what_you_are_doing_well.push("✓ Your stress balance is healthy");
  if (axes.redox < 0.45) summary.what_you_are_doing_well.push("✓ Your cellular recovery is optimal");
  if (data.wearable?.spo2 > 95) summary.what_you_are_doing_well.push("✓ Your blood oxygen is normal");
  
  // 3. Action Items Translator
  if (clinical && clinical.action_items) {
    summary.what_you_can_do = clinical.action_items.map(item => ({
      priority: item.priority,
      action: BACKEND_TERM_MAP[item.subject] || item.subject,
      reason: item.detail
    }));
  }

  // 4. Missing Markers
  if (position.missing_markers && position.missing_markers.length > 0) {
    const missingHelp = position.missing_markers.map(m => MISSING_MARKER_MAP[m] || `Add ${m} for better accuracy`);
    summary.what_you_can_do.push({
      priority: "low",
      action: "Complete your lab profile",
      reason: missingHelp.slice(0, 2).join(". ")
    });
  }

  // 5. Good News Logic
  if (terrain && terrain.n_scored > 0) {
    const highRiskVariants = terrain.variants.filter(v => v.risk === 'HIGH');
    if (highRiskVariants.length === 0) {
      summary.good_news = "No high-risk genetic variants detected. Your genetic baseline is solid.";
    }
  }

  return summary;
};
