import React from 'react';
import { Upload, Activity, Zap, Shield, Heart } from 'lucide-react';

const InputPanel = ({ values, onChange, onUpload }) => {
  const SectionHeader = ({ icon: Icon, title, tier }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      <div className="p-1.5 rounded-lg bg-hexa-primary/10 text-hexa-primary">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      {tier && (
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-hexa-muted font-bold ml-auto border border-white/5">
          TIER {tier}
        </span>
      )}
    </div>
  );

  const InputField = ({ label, name, unit }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-hexa-muted uppercase tracking-tight ml-1">
        {label} {unit && <span className="text-white/20 ml-1">({unit})</span>}
      </label>
      <input
        type="text"
        value={values[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="input-hexa w-full h-10 text-base"
        placeholder="--"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Upload Section */}
      <div 
        onClick={onUpload}
        className="group cursor-pointer p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-hexa-primary/[0.03] hover:border-hexa-primary/30 transition-all duration-300 flex flex-col items-center text-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-hexa-muted group-hover:text-hexa-primary group-hover:bg-hexa-primary/10 transition-all">
          <Upload size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Upload Health Screenshot</p>
          <p className="text-xs text-hexa-muted mt-1">Apple Watch or Lab PDF support</p>
        </div>
      </div>

      <div className="glass-card p-6 bg-white/[0.03] border-white/5">
        <SectionHeader icon={Activity} title="Profile & Core Values" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Age" name="age" />
          <InputField label="Sex" name="sex" />
          <InputField label="Systolic BP" name="systolic" unit="mmHg" />
          <InputField label="Diastolic BP" name="diastolic" unit="mmHg" />
        </div>

        <SectionHeader icon={Zap} title="Metabolic Health" tier="1" />
        <div className="grid grid-cols-3 gap-3">
          <InputField label="HbA1c" name="hba1c" unit="%" />
          <InputField label="Glucose" name="glucose" unit="mg/dL" />
          <InputField label="Triglyc" name="triglycerides" unit="mg/dL" />
        </div>

        <SectionHeader icon={Shield} title="Inflammation & Lipids" tier="2" />
        <div className="grid grid-cols-3 gap-3">
          <InputField label="LDL" name="ldl" unit="mg/dL" />
          <InputField label="CRP" name="crp" unit="mg/L" />
          <InputField label="WBC" name="wbc" unit="k/uL" />
        </div>

        <SectionHeader icon={Shield} title="Advanced Biomarkers" tier="3" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Insulin" name="insulin" />
          <InputField label="GGT" name="ggt" />
          <InputField label="HDL" name="hdl" />
          <InputField label="Uric Acid" name="uricAcid" />
        </div>

        <SectionHeader icon={Heart} title="Wearables & Data" tier="5" />
        <div className="grid grid-cols-3 gap-3">
          <InputField label="HRV" name="hrv" unit="ms" />
          <InputField label="Sleep" name="sleep" unit="hrs" />
          <InputField label="Steps" name="steps" />
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
