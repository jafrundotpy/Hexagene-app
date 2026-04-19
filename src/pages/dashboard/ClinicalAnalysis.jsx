import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ControlBar from "../../components/dashboard/ControlBar";
import InputPanel from "../../components/dashboard/InputPanel";
import PredictionCards from "../../components/dashboard/PredictionCards";
import ValidationPanel from "../../components/dashboard/ValidationPanel";

const ClinicalAnalysis = () => {
  // --- STATE ---
  const [isManualMode, setIsManualMode] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealId, setRevealId] = useState("HG-" + Math.floor(100000 + Math.random() * 900000));
  const [timeRange, setTimeRange] = useState("1 Year");
  
  const [filters, setFilters] = useState({
    ageGroup: "All",
    gender: "All",
    riskLevel: "All"
  });

  const [formValues, setFormValues] = useState({
    age: "", sex: "", systolic: "", diastolic: "",
    hba1c: "", glucose: "", triglycerides: "",
    ldl: "", crp: "", wbc: "",
    insulin: "", ggt: "", hdl: "", uricAcid: "",
    hrv: "", sleep: "", steps: ""
  });

  const [predictions, setPredictions] = useState({
    liver: "OK", immune: "OK", lowT: "OK",
    fibrosis: "OK", vascular: "OK", kidney: "OK"
  });

  const [validationData, setValidationData] = useState([]);

  // --- LOGIC ---
  const generateRandomValues = () => {
    const randoms = {
      age: Math.floor(Math.random() * (80 - 18) + 18).toString(),
      sex: Math.random() > 0.5 ? "Male" : "Female",
      systolic: Math.floor(Math.random() * (160 - 110) + 110).toString(),
      diastolic: Math.floor(Math.random() * (100 - 70) + 70).toString(),
      hba1c: (Math.random() * (7.5 - 4.5) + 4.5).toFixed(1),
      glucose: Math.floor(Math.random() * (120 - 80) + 80).toString(),
      triglycerides: Math.floor(Math.random() * (250 - 50) + 50).toString(),
      ldl: Math.floor(Math.random() * (180 - 80) + 80).toString(),
      crp: (Math.random() * (5.0 - 0.1) + 0.1).toFixed(1),
      wbc: (Math.random() * (11.0 - 4.0) + 4.0).toFixed(1),
      insulin: (Math.random() * (25 - 2) + 2).toFixed(1),
      ggt: Math.floor(Math.random() * (60 - 5) + 5).toString(),
      hdl: Math.floor(Math.random() * (80 - 30) + 30).toString(),
      uricAcid: (Math.random() * (8.0 - 3.0) + 3.0).toFixed(1),
      hrv: Math.floor(Math.random() * (100 - 20) + 20).toString(),
      sleep: (Math.random() * (9 - 4) + 4).toFixed(1),
      steps: Math.floor(Math.random() * (15000 - 2000) + 2000).toLocaleString()
    };
    setFormValues(randoms);
    calculatePredictions(randoms);
    setRevealId("HG-" + Math.floor(100000 + Math.random() * 900000));
    setIsRevealed(false);
  };

  const calculatePredictions = (vals) => {
    // Simple mock logic
    const newPreds = {
      liver: parseFloat(vals.ggt) > 50 || parseFloat(vals.triglycerides) > 200 ? "Risk" : (parseFloat(vals.ggt) > 35 ? "Watch" : "OK"),
      immune: parseFloat(vals.crp) > 3.0 ? "Risk" : (parseFloat(vals.crp) > 1.5 ? "Watch" : "OK"),
      lowT: vals.sex === "Male" && parseFloat(vals.age) > 40 ? "Watch" : "OK",
      fibrosis: parseFloat(vals.hba1c) > 6.5 ? "Risk" : (parseFloat(vals.hba1c) > 5.7 ? "Watch" : "OK"),
      vascular: parseFloat(vals.systolic) > 140 ? "Risk" : (parseFloat(vals.systolic) > 130 ? "Watch" : "OK"),
      kidney: parseFloat(vals.glucose) > 110 ? "Watch" : "OK"
    };
    setPredictions(newPreds);

    // Mock Validation Data
    setValidationData([
      { name: "Liver Fat Index", value: (Math.random() * 30).toFixed(1) + "%", status: newPreds.liver === "Risk" ? "Occult" : "Match" },
      { name: "NLR (Neutrophil/Lymphocyte)", value: (Math.random() * 4).toFixed(2), status: newPreds.immune === "OK" ? "Match" : "Watch" },
      { name: "Free Testosterone", value: (Math.random() * 20 + 5).toFixed(1) + " pg/mL", status: newPreds.lowT === "OK" ? "Match" : "Watch" },
      { name: "Arterial Stiffness", value: (Math.random() * 10 + 5).toFixed(1) + " m/s", status: newPreds.vascular === "OK" ? "Match" : "Occult" },
      { name: "Pulse Pressure", value: (parseInt(vals.systolic) - parseInt(vals.diastolic)) + " mmHg", status: "Match" },
      { name: "Urine Albumin", value: (Math.random() * 30).toFixed(1) + " mg/g", status: "Match" }
    ]);
  };

  const handleInputChange = (name, value) => {
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);
    if (isManualMode) {
       calculatePredictions(newValues);
    }
  };

  const toggleMode = () => {
    if (!isManualMode) {
      // Switch to manual - clear data
      setFormValues({
        age: "", sex: "", systolic: "", diastolic: "",
        hba1c: "", glucose: "", triglycerides: "",
        ldl: "", crp: "", wbc: "",
        insulin: "", ggt: "", hdl: "", uricAcid: "",
        hrv: "", sleep: "", steps: ""
      });
      setPredictions({ liver: "OK", immune: "OK", lowT: "OK", fibrosis: "OK", vascular: "OK", kidney: "OK" });
      setIsRevealed(false);
    } else {
      generateRandomValues();
    }
    setIsManualMode(!isManualMode);
  };

  useEffect(() => {
    generateRandomValues();
  }, []);

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 flex flex-col max-w-[1600px] mx-auto animate-fade-in relative z-10">
      {/* Background Glows */}
      <div className="bg-orb orb-1 top-0 left-0 w-[500px] h-[500px] bg-hexa-primary/20"></div>
      <div className="bg-orb orb-2 bottom-0 right-0 w-[600px] h-[600px] bg-hexa-secondary/20"></div>

      <DashboardHeader />

      <ControlBar 
        onLoadRandom={generateRandomValues}
        onReveal={() => setIsRevealed(true)}
        onToggleMode={toggleMode}
        isManualMode={isManualMode}
        filters={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        revealId={revealId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <aside className="lg:col-span-4 h-[calc(100vh-320px)] min-h-[600px]">
          <InputPanel 
            values={formValues} 
            onChange={handleInputChange} 
            onUpload={generateRandomValues} 
          />
        </aside>

        {/* Right Content */}
        <main className="lg:col-span-8 flex flex-col gap-8">
          <PredictionCards 
            predictions={predictions} 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          <ValidationPanel 
            isRevealed={isRevealed}
            validationData={validationData}
          />
        </main>
      </div>

      {/* Footer Meta */}
      <footer className="mt-auto pt-8 flex justify-between items-center text-[10px] text-hexa-muted font-bold uppercase tracking-widest">
         <div className="flex gap-6">
            <span>© 2026 HEXAGENE AI</span>
            <span>GDPR COMPLIANT</span>
            <span>AES-256 ENCRYPTED</span>
         </div>
         <div className="flex gap-4 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-hexa-success"></div>
            SYSTEM STABLE: 12ms LATENCY
         </div>
      </footer>
    </div>
  );
};

export default ClinicalAnalysis;