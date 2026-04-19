import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { id: "input", icon: "📱", label: "Data Input" },
  { id: "s21", icon: "🧬", label: "S21 Analysis" },
  { id: "readiness", icon: "⚡", label: "Daily Readiness" },
  { id: "lifestyle", icon: "🎯", label: "Lifestyle Plan" },
  { id: "activities", icon: "🏃", label: "Today's Activities" },
  { id: "future", icon: "🔮", label: "Future Optimization" },
];

const defaultForm = {
  age: "", sex: "", activityLevel: "",
  albumin: "", crp: "", hba1c: "",
  egfr: "", rdw: "", uricAcid: "",
  restingHR: "", dailySteps: "", activeMinutes: "",
  vo2max: "", hrv: "", recoveryScore: "",
  sleepDuration: "", sleepScore: "", sleepDebt: "",
};

const generateRandomForm = () => ({
  age: Math.floor(Math.random() * 50 + 20).toString(),
  sex: Math.random() > 0.5 ? "M" : "F",
  activityLevel: Math.floor(Math.random() * 5 + 1).toString(),
  albumin: (Math.random() * 1.5 + 3.0).toFixed(1),
  crp: (Math.random() * 4.9 + 0.1).toFixed(1),
  hba1c: (Math.random() * 3.5 + 4.5).toFixed(1),
  egfr: Math.floor(Math.random() * 80 + 30).toString(),
  rdw: (Math.random() * 5 + 10).toFixed(1),
  uricAcid: (Math.random() * 5 + 3).toFixed(1),
  restingHR: Math.floor(Math.random() * 40 + 50).toString(),
  dailySteps: Math.floor(Math.random() * 12000 + 2000).toString(),
  activeMinutes: Math.floor(Math.random() * 60 + 10).toString(),
  vo2max: Math.floor(Math.random() * 30 + 25).toString(),
  hrv: Math.floor(Math.random() * 80 + 20).toString(),
  recoveryScore: Math.floor(Math.random() * 60 + 30).toString(),
  sleepDuration: (Math.random() * 4 + 5).toFixed(1),
  sleepScore: Math.floor(Math.random() * 50 + 40).toString(),
  sleepDebt: (Math.random() * 2).toFixed(1),
});

const calcRisk = (form) => {
  let score = 50;
  if (parseFloat(form.crp) > 3) score += 10;
  if (parseFloat(form.hba1c) > 6.5) score += 12;
  if (parseFloat(form.egfr) < 60) score += 10;
  if (parseInt(form.restingHR) > 80) score += 6;
  if (parseInt(form.dailySteps) < 5000) score += 8;
  if (parseFloat(form.sleepDuration) < 6) score += 8;
  if (parseInt(form.hrv) < 30) score += 6;
  if (parseInt(form.recoveryScore) < 50) score += 5;
  if (parseFloat(form.albumin) < 3.5) score += 8;
  score = Math.min(Math.max(score - 40, 5), 95);
  return score;
};

const getRiskLabel = (score) => {
  if (score < 30) return { label: "LOW RISK", color: "#22c55e" };
  if (score < 60) return { label: "MODERATE RISK", color: "#f59e0b" };
  return { label: "HIGH RISK", color: "#ef4444" };
};

const InputField = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ""}
      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
    />
  </div>
);

const SectionTitle = ({ icon, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", marginTop: "20px" }}>
    <span>{icon}</span>
    <span style={{ fontSize: "12px", fontWeight: "800", color: "#4fc3f7", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
  </div>
);

const CircleRisk = ({ score }) => {
  const { label, color } = getRiskLabel(score);
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <svg width="180" height="180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="28" fontWeight="800">{score}%</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#64748b" fontSize="11">RISK SCORE</text>
      </svg>
      <div style={{ fontSize: "16px", fontWeight: "800", color, letterSpacing: "2px" }}>{label}</div>
    </div>
  );
};

const PlaceholderTab = ({ icon, title, desc }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px", color: "#64748b" }}>
    <span style={{ fontSize: "48px" }}>{icon}</span>
    <h2 style={{ color: "#4fc3f7", margin: 0 }}>{title}</h2>
    <p style={{ margin: 0, fontSize: "14px" }}>{desc}</p>
    <span style={{ fontSize: "12px", padding: "6px 16px", borderRadius: "20px", background: "rgba(79,195,247,0.1)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.2)" }}>Coming Soon</span>
  </div>
);

const Simulations = () => {
  const [activeTab, setActiveTab] = useState("input");
  const [form, setForm] = useState(defaultForm);
  const [riskScore, setRiskScore] = useState(null);
  const [analysisRun, setAnalysisRun] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const updateField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRunAnalysis = () => {
    const score = calcRisk(form);
    setRiskScore(score);
    setAnalysisRun(true);
  };

  const handleLoadRandom = () => {
    const random = generateRandomForm();
    setForm(random);
    setRiskScore(calcRisk(random));
    setAnalysisRun(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadMsg("⚠️ Please upload a JPG, PNG, GIF or WEBP image.");
      return;
    }

    setUploading(true);
    setUploadMsg("📸 Reading your screenshot...");

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      const base64 = await toBase64(file);

      setUploadMsg("🧬 AI is reading your health data... (this may take 20-40 seconds if server just woke up)");

      const response = await fetch("https://hexagene-app.onrender.com/extract-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: base64,
          media_type: file.type
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Extraction failed");
      }

      const extracted = result.data || {};
      const filledFields = result.filled_fields || [];
      const filledCount = result.filled_count || 0;

      if (filledCount === 0) {
        setUploadMsg("⚠️ No health metrics detected. Make sure the screenshot shows numbers like steps, heart rate, sleep score or HRV.");
        setUploading(false);
        return;
      }

      setForm((prev) => {
        const updated = { ...prev };
        Object.entries(extracted).forEach(([key, val]) => {
          if (val !== "" && val !== null && val !== undefined) {
            updated[key] = String(val);
          }
        });
        return updated;
      });

      const fieldLabels = {
        sleepScore: "Sleep Score",
        sleepDuration: "Sleep Duration",
        dailySteps: "Daily Steps",
        restingHR: "Resting HR",
        hrv: "HRV",
        recoveryScore: "Recovery Score",
        activeMinutes: "Active Minutes",
        vo2max: "VO2 Max",
        sleepDebt: "Sleep Debt",
        age: "Age",
        sex: "Sex",
        activityLevel: "Activity Level",
      };

      const detected = filledFields
        .map((f) => fieldLabels[f] || f)
        .join(", ");

      setUploadMsg(`✅ Extracted ${filledCount} field${filledCount > 1 ? "s" : ""}: ${detected}. Fill remaining fields manually then click Run Analysis.`);
      setUploading(false);

    } catch (err) {
      if (err.message.includes("timed out") || err.message.includes("504")) {
        setUploadMsg("⏳ Server is waking up. Wait 30 seconds and try uploading again.");
      } else {
        setUploadMsg(`⚠️ ${err.message || "Upload failed. Try again."}`);
      }
      setUploading(false);
    }
  };

  const tabStyle = (id) => ({
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 18px", borderRadius: "25px", border: "none",
    cursor: "pointer", fontSize: "12px", fontWeight: "700",
    whiteSpace: "nowrap", transition: "all 0.2s",
    background: activeTab === id ? "linear-gradient(135deg,#4fc3f7,#0ea5e9)" : "rgba(255,255,255,0.05)",
    color: activeTab === id ? "#fff" : "#64748b",
    boxShadow: activeTab === id ? "0 4px 15px rgba(79,195,247,0.3)" : "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#e2e8f0", padding: "0" }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "2rem 2rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", background: "linear-gradient(135deg,#4fc3f7,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" }}>
          HexaGene V13
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 12px" }}>Complete Lifestyle Intelligence with S21 Physics</p>
        <span style={{ fontSize: "11px", fontWeight: "800", padding: "6px 16px", borderRadius: "20px", background: "linear-gradient(135deg,#ec4899,#f97316)", color: "#fff", letterSpacing: "1px" }}>
          REVOLUTIONARY HEALTH COACH ✓
        </span>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", padding: "1.25rem 2rem", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
          <button key={tab.id} style={tabStyle(tab.id)} onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "2rem" }}>

        {/* DATA INPUT TAB */}
        {activeTab === "input" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>

            {/* Left Panel */}
            <div>
              {/* Upload Card */}
              <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,195,247,0.2)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "20px" }}>🧬</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#4fc3f7", textTransform: "uppercase", letterSpacing: "1px" }}>Multi-Modal Health Input</span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current.click()}
                  style={{ border: `2px dashed ${dragOver ? "#4fc3f7" : "rgba(79,195,247,0.3)"}`, borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(79,195,247,0.05)" : "transparent", transition: "all 0.2s" }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📱</div>
                  <p style={{ margin: "0 0 6px", fontWeight: "700", fontSize: "14px" }}>Upload Wearable App Screenshots</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>Apple Health, Fitbit, Garmin, Samsung Health, Whoop, Oura, or any wearable data</p>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e.target.files[0])} />
                </div>

                {uploadMsg && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: uploading ? "rgba(79,195,247,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${uploading ? "rgba(79,195,247,0.2)" : "rgba(34,197,94,0.2)"}`, fontSize: "13px", color: uploading ? "#4fc3f7" : "#22c55e" }}>
                    {uploading && <span style={{ marginRight: "8px" }}>⏳</span>}{uploadMsg}
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <SectionTitle icon="👤" label="Demographics" />
                  </div>
                  <InputField label="Age" value={form.age} onChange={updateField("age")} placeholder="45" />
                  <InputField label="Sex" value={form.sex} onChange={updateField("sex")} placeholder="M or F" />
                  <InputField label="Activity Level (1-5)" value={form.activityLevel} onChange={updateField("activityLevel")} placeholder="3" />

                  <div>
                    <SectionTitle icon="🩸" label="Core Panel" />
                    <InputField label="Albumin (g/dL)" value={form.albumin} onChange={updateField("albumin")} placeholder="4.2" />
                    <InputField label="CRP (mg/L)" value={form.crp} onChange={updateField("crp")} placeholder="2.1" />
                    <InputField label="HbA1c (%)" value={form.hba1c} onChange={updateField("hba1c")} placeholder="5.9" />
                  </div>

                  <div>
                    <SectionTitle icon="⚡" label="Function Panel" />
                    <InputField label="eGFR (mL/min)" value={form.egfr} onChange={updateField("egfr")} placeholder="78" />
                    <InputField label="RDW (%)" value={form.rdw} onChange={updateField("rdw")} placeholder="13.2" />
                    <InputField label="Uric Acid (mg/dL)" value={form.uricAcid} onChange={updateField("uricAcid")} placeholder="5.3" />
                  </div>

                  <div>
                    <SectionTitle icon="⌚" label="Activity Metrics" />
                    <InputField label="Resting HR (bpm)" value={form.restingHR} onChange={updateField("restingHR")} placeholder="57" />
                    <InputField label="Daily Steps" value={form.dailySteps} onChange={updateField("dailySteps")} placeholder="6220" />
                    <InputField label="Active Minutes" value={form.activeMinutes} onChange={updateField("activeMinutes")} placeholder="31" />
                  </div>

                  <div>
                    <SectionTitle icon="🏃" label="Performance Metrics" />
                    <InputField label="VO2 Max" value={form.vo2max} onChange={updateField("vo2max")} placeholder="e.g. 35" />
                    <InputField label="HRV (ms)" value={form.hrv} onChange={updateField("hrv")} placeholder="48" />
                    <InputField label="Recovery Score (%)" value={form.recoveryScore} onChange={updateField("recoveryScore")} placeholder="0-100" />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <SectionTitle icon="😴" label="Sleep & Recovery" />
                  </div>
                  <InputField label="Sleep Duration (hours)" value={form.sleepDuration} onChange={updateField("sleepDuration")} placeholder="7.4" />
                  <InputField label="Sleep Score (%)" value={form.sleepScore} onChange={updateField("sleepScore")} placeholder="93" />
                  <InputField label="Sleep Debt (hours)" value={form.sleepDebt} onChange={updateField("sleepDebt")} placeholder="0.5" />

                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "1.5rem" }}>
                  <button onClick={handleLoadRandom} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                    🎲 Load Random
                  </button>
                  <button onClick={handleRunAnalysis} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#4fc3f7,#0ea5e9)", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "800", letterSpacing: "0.5px" }}>
                    🧬 RUN COMPLETE ANALYSIS
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel — Risk Display */}
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "2rem", textAlign: "center" }}>
                {analysisRun && riskScore !== null ? (
                  <>
                    <CircleRisk score={riskScore} />
                    <div style={{ marginTop: "1.5rem", padding: "12px 16px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                      S21 State: σ=7 | Status: STABLE Ω₂₁
                    </div>
                    <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "16px" }}>⚡</span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "1px" }}>Quick Insights</span>
                      </div>
                      {[
                        riskScore >= 60 && "• ⚠ Elevated health risk — review recommendations",
                        parseFloat(form.crp) > 3 && "• 🔴 High CRP indicates inflammation",
                        parseFloat(form.hba1c) > 6.5 && "• 🔴 HbA1c above diabetic threshold",
                        parseInt(form.dailySteps) < 5000 && "• 🟡 Low daily steps — increase activity",
                        parseFloat(form.sleepDuration) < 6 && "• 🟡 Insufficient sleep detected",
                        parseInt(form.hrv) < 30 && "• 🔴 Low HRV — recovery concern",
                        riskScore < 30 && "• ✅ All markers within healthy range",
                      ].filter(Boolean).map((msg, i) => (
                        <p key={i} style={{ margin: "6px 0", fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>{msg}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "3rem 1rem", color: "#475569" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧬</div>
                    <p style={{ fontSize: "14px", margin: 0 }}>Fill inputs or upload a screenshot then click Run Complete Analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "s21" && <PlaceholderTab icon="🧬" title="S21 Analysis" desc="Advanced structural physics analysis coming soon" />}
        {activeTab === "readiness" && <PlaceholderTab icon="⚡" title="Daily Readiness" desc="Your daily readiness score and recommendations" />}
        {activeTab === "lifestyle" && <PlaceholderTab icon="🎯" title="Lifestyle Plan" desc="Personalized lifestyle optimization plan" />}
        {activeTab === "activities" && <PlaceholderTab icon="🏃" title="Today's Activities" desc="Activity tracking and suggestions for today" />}
        {activeTab === "future" && <PlaceholderTab icon="🔮" title="Future Optimization" desc="Long-term health trajectory and optimization" />}

      </div>
    </div>
  );
};

export default Simulations;
