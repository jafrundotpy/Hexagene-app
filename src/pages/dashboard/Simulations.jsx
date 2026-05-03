import React, { useState, useRef, useEffect } from "react";

const API_BASE = "https://hexagene-app.onrender.com";

const TABS = [
  { id: "input", icon: "📱", label: "Data Input" },
  { id: "s21", icon: "🧬", label: "S21 Analysis" },
  { id: "readiness", icon: "⚡", label: "Daily Readiness" },
  { id: "lifestyle", icon: "🎯", label: "Lifestyle Plan" },
  { id: "activities", icon: "🏃", label: "Today's Activities" },
  { id: "future", icon: "🔮", label: "Future Optimization" },
];

const defaultForm = {
  age:"",sex:"",activityLevel:"",albumin:"",crp:"",hba1c:"",
  egfr:"",rdw:"",uricAcid:"",restingHR:"",dailySteps:"",activeMinutes:"",
  vo2max:"",hrv:"",recoveryScore:"",sleepDuration:"",sleepScore:"",sleepDebt:""
};

const generateRandomForm = () => ({
  age: Math.floor(Math.random()*50+20).toString(),
  sex: Math.random()>0.5?"M":"F",
  activityLevel: Math.floor(Math.random()*5+1).toString(),
  albumin: (Math.random()*1.5+3.0).toFixed(1),
  crp: (Math.random()*4.9+0.1).toFixed(1),
  hba1c: (Math.random()*3.5+4.5).toFixed(1),
  egfr: Math.floor(Math.random()*80+30).toString(),
  rdw: (Math.random()*5+10).toFixed(1),
  uricAcid: (Math.random()*5+3).toFixed(1),
  restingHR: Math.floor(Math.random()*40+50).toString(),
  dailySteps: Math.floor(Math.random()*12000+2000).toString(),
  activeMinutes: Math.floor(Math.random()*60+10).toString(),
  vo2max: Math.floor(Math.random()*30+25).toString(),
  hrv: Math.floor(Math.random()*80+20).toString(),
  recoveryScore: Math.floor(Math.random()*60+30).toString(),
  sleepDuration: (Math.random()*4+5).toFixed(1),
  sleepScore: Math.floor(Math.random()*50+40).toString(),
  sleepDebt: (Math.random()*2).toFixed(1),
});

const calcRisk = (f) => {
  let s=50;
  if(parseFloat(f.crp)>3)s+=10;
  if(parseFloat(f.hba1c)>6.5)s+=12;
  if(parseInt(f.egfr)<60)s+=10;
  if(parseInt(f.restingHR)>80)s+=6;
  if(parseInt(f.dailySteps)<5000)s+=8;
  if(parseFloat(f.sleepDuration)<6)s+=8;
  if(parseInt(f.hrv)<30)s+=6;
  if(parseInt(f.recoveryScore)<50)s+=5;
  if(parseFloat(f.albumin)<3.5)s+=8;
  return Math.min(Math.max(s-40,5),95);
};

const calcS21 = (f) => ({
  structural: Math.min(100,Math.max(10,100-parseFloat(f.crp||1)*8-parseFloat(f.hba1c||5)*3)),
  inflammatory: Math.min(100,Math.max(10,parseFloat(f.crp||1)*20+parseFloat(f.hba1c||5)*5)),
  metabolic: Math.min(100,Math.max(10,100-parseFloat(f.hba1c||5)*8-parseFloat(f.uricAcid||4)*3)),
  redox: Math.min(100,Math.max(10,parseInt(f.egfr||60)/1.2-parseFloat(f.rdw||13)*1.5)),
  kinetic: Math.min(100,Math.max(10,parseInt(f.dailySteps||5000)/150+parseInt(f.activeMinutes||30)*0.5)),
  balance: Math.min(100,Math.max(10,parseInt(f.hrv||40)+parseInt(f.recoveryScore||50)-parseInt(f.restingHR||65))),
});

const calcReadiness = (f) => ({
  energy: Math.min(100,Math.max(10,parseInt(f.sleepScore||60)*0.5+parseInt(f.hrv||40)*0.3+parseInt(f.recoveryScore||50)*0.2)),
  work: Math.min(100,Math.max(10,parseInt(f.sleepScore||60)*0.4+parseInt(f.hrv||40)*0.4+parseInt(f.recoveryScore||50)*0.2)),
  exercise: Math.min(100,Math.max(10,parseInt(f.recoveryScore||50)*0.5+parseInt(f.hrv||40)*0.3+parseInt(f.activeMinutes||30)*0.5)),
});

const getRiskLabel = (s) => {
  if(s<30) return {label:"LOW RISK",color:"#22c55e"};
  if(s<60) return {label:"MODERATE RISK",color:"#f59e0b"};
  return {label:"HIGH RISK",color:"#ef4444"};
};

const getReadinessLabel = (s) => {
  if(s>=80) return {label:"EXCELLENT",color:"#22c55e"};
  if(s>=60) return {label:"GOOD",color:"#4fc3f7"};
  if(s>=40) return {label:"MODERATE",color:"#f59e0b"};
  return {label:"LOW",color:"#ef4444"};
};

const S = {
  card: {borderRadius:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(79,195,247,0.15)",padding:"1.25rem"},
  label: {fontSize:"10px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.8px",fontWeight:"700",marginBottom:"4px",display:"block"},
  input: {width:"100%",padding:"10px 12px",borderRadius:"8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#e2e8f0",fontSize:"13px",outline:"none",boxSizing:"border-box"},
  secTitle: {display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",marginTop:"20px"},
  secLabel: {fontSize:"12px",fontWeight:"800",color:"#4fc3f7",textTransform:"uppercase",letterSpacing:"1px"},
};

const ProgressBar = ({value,color="#4fc3f7"}) => (
  <div style={{height:"6px",borderRadius:"3px",background:"rgba(255,255,255,0.06)",marginTop:"6px",overflow:"hidden"}}>
    <div style={{width:`${Math.round(value)}%`,height:"100%",background:color,borderRadius:"3px",transition:"width 1s ease"}}/>
  </div>
);

const CircleRisk = ({score}) => {
  const {label,color}=getRiskLabel(score);
  const r=70,cx=90,cy=90,circ=2*Math.PI*r,dash=(score/100)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
      <svg width="180" height="180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ/4} strokeLinecap="round"/>
        <text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize="28" fontWeight="800">{Math.round(score)}%</text>
        <text x={cx} y={cy+18} textAnchor="middle" fill="#64748b" fontSize="11">RISK SCORE</text>
      </svg>
      <div style={{fontSize:"16px",fontWeight:"800",color,letterSpacing:"2px"}}>{label}</div>
    </div>
  );
};

const InputField = ({label,value,onChange,placeholder}) => (
  <div style={{marginBottom:"12px"}}>
    <label style={S.label}>{label}</label>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""} style={S.input}/>
  </div>
);

const SecTitle = ({icon,label}) => (
  <div style={S.secTitle}><span>{icon}</span><span style={S.secLabel}>{label}</span></div>
);

const Footer = () => (
  <div style={{textAlign:"center",padding:"2rem 0 1rem",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:"2rem"}}>
    <p style={{margin:0,fontSize:"12px",color:"#475569"}}>
      Powered by <span style={{color:"#4fc3f7",fontWeight:"700"}}>S21 Physics Theory</span> | Created by <span style={{color:"#4fc3f7",fontWeight:"700"}}>S.H. Bachani, Merlin Digital UAE</span>
    </p>
    <p style={{margin:"4px 0 0",fontSize:"11px",color:"#334155"}}>🚀 Complete Lifestyle Intelligence: Your Personal Health Coach</p>
  </div>
);

const AnimatedCounter = ({target,duration=2000,suffix=""}) => {
  const [val,setVal] = useState(0);
  useEffect(()=>{
    let start=0;
    const step=target/((duration/1000)*60);
    const timer=setInterval(()=>{
      start+=step;
      if(start>=target){setVal(target);clearInterval(timer);}
      else setVal(Math.round(start));
    },1000/60);
    return ()=>clearInterval(timer);
  },[target]);
  return <span>{val}{suffix}</span>;
};

const TimelineBar = ({label,current,oneMonth,oneYear,tenYear,color}) => (
  <div style={{marginBottom:"1.25rem"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
      <span style={{fontSize:"12px",color:"#94a3b8",fontWeight:"600"}}>{label}</span>
      <div style={{display:"flex",gap:"12px"}}>
        <span style={{fontSize:"11px",color:"#64748b"}}>Now: <span style={{color:"#e2e8f0",fontWeight:"700"}}>{Math.round(current)}%</span></span>
        <span style={{fontSize:"11px",color:"#64748b"}}>1M: <span style={{color:"#4fc3f7",fontWeight:"700"}}>{Math.round(oneMonth)}%</span></span>
        <span style={{fontSize:"11px",color:"#64748b"}}>1Y: <span style={{color:"#a78bfa",fontWeight:"700"}}>{Math.round(oneYear)}%</span></span>
        <span style={{fontSize:"11px",color:"#64748b"}}>10Y: <span style={{color:color,fontWeight:"700"}}>{Math.round(tenYear)}%</span></span>
      </div>
    </div>
    <div style={{position:"relative",height:"8px",borderRadius:"4px",background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
      <div style={{position:"absolute",left:0,top:0,width:`${Math.round(current)}%`,height:"100%",background:"rgba(255,255,255,0.15)",borderRadius:"4px",transition:"width 1s ease"}}/>
      <div style={{position:"absolute",left:0,top:0,width:`${Math.round(oneMonth)}%`,height:"100%",background:"rgba(79,195,247,0.4)",borderRadius:"4px",transition:"width 1.2s ease"}}/>
      <div style={{position:"absolute",left:0,top:0,width:`${Math.round(oneYear)}%`,height:"100%",background:"rgba(167,139,250,0.5)",borderRadius:"4px",transition:"width 1.4s ease"}}/>
      <div style={{position:"absolute",left:0,top:0,width:`${Math.round(tenYear)}%`,height:"100%",background:color,borderRadius:"4px",transition:"width 1.6s ease",opacity:0.8}}/>
    </div>
    <div style={{display:"flex",gap:"16px",marginTop:"4px"}}>
      {[{c:"rgba(255,255,255,0.15)",l:"Current"},{c:"rgba(79,195,247,0.6)",l:"1 Month"},{c:"rgba(167,139,250,0.7)",l:"1 Year"},{c:color,l:"10 Years"}].map(({c,l})=>(
        <div key={l} style={{display:"flex",alignItems:"center",gap:"4px"}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:c}}/>
          <span style={{fontSize:"10px",color:"#475569"}}>{l}</span>
        </div>
      ))}
    </div>
  </div>
);

const PredictionCard = ({horizon,icon,riskDelta,topInsight,color,metrics,delay}) => {
  const [visible,setVisible] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),delay);return()=>clearTimeout(t);},[]);
  return (
    <div style={{...S.card,border:`1px solid ${color}30`,opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease",background:`linear-gradient(135deg, rgba(0,0,0,0.3), ${color}08)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
        <div>
          <div style={{fontSize:"28px",marginBottom:"4px"}}>{icon}</div>
          <p style={{margin:0,fontSize:"16px",fontWeight:"900",color}}>{horizon}</p>
          <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>Prediction Window</p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"32px",fontWeight:"900",color:riskDelta<0?"#22c55e":"#ef4444"}}>
            {riskDelta<0?"↓":"↑"}{Math.abs(riskDelta)}%
          </div>
          <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>Risk {riskDelta<0?"reduction":"increase"}</p>
        </div>
      </div>
      <div style={{borderLeft:`3px solid ${color}`,paddingLeft:"12px",marginBottom:"1rem"}}>
        <p style={{margin:0,fontSize:"12px",color:"#94a3b8",lineHeight:"1.6"}}>{topInsight}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
        {metrics.map(({label,value,trend})=>(
          <div key={label} style={{padding:"8px 10px",borderRadius:"8px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <p style={{margin:0,fontSize:"10px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</p>
            <p style={{margin:"2px 0 0",fontSize:"14px",fontWeight:"700",color:trend==="up"?"#22c55e":trend==="down"?"#ef4444":"#f59e0b"}}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const FutureOptimization = ({form}) => {
  const risk = calcRisk(form);
  const s21 = calcS21(form);
  const hasData = Object.values(form).some(v=>v!=="");

  const proj = {
    oneMonth: {
      risk: Math.max(5, risk - (risk>60?8:risk>40?5:3)),
      structural: Math.min(100, s21.structural + 5),
      metabolic: Math.min(100, s21.metabolic + 4),
      kinetic: Math.min(100, s21.kinetic + 8),
      hrv: Math.min(100, (parseInt(form.hrv||40)) + 5),
    },
    oneYear: {
      risk: Math.max(5, risk - (risk>60?22:risk>40?15:8)),
      structural: Math.min(100, s21.structural + 15),
      metabolic: Math.min(100, s21.metabolic + 18),
      kinetic: Math.min(100, s21.kinetic + 20),
      hrv: Math.min(100, (parseInt(form.hrv||40)) + 18),
    },
    tenYear: {
      risk: Math.max(5, risk - (risk>60?38:risk>40?28:15)),
      structural: Math.min(100, s21.structural + 28),
      metabolic: Math.min(100, s21.metabolic + 32),
      kinetic: Math.min(100, s21.kinetic + 35),
      hrv: Math.min(100, (parseInt(form.hrv||40)) + 30),
    },
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem"}}>
        <div>
          <h2 style={{margin:"0 0 4px",fontSize:"1.4rem",fontWeight:"900",background:"linear-gradient(135deg,#a78bfa,#4fc3f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Future Optimization Engine
          </h2>
          <p style={{margin:0,fontSize:"13px",color:"#64748b"}}>S21 Physics-based trajectory modeling across 3 time horizons</p>
        </div>
        <div style={{padding:"8px 16px",borderRadius:"20px",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",fontSize:"12px",color:"#a78bfa",fontWeight:"700"}}>
          {hasData?"LIVE PROJECTION":"DEMO MODE"}
        </div>
      </div>

      {!hasData && (
        <div style={{...S.card,textAlign:"center",padding:"1.5rem",marginBottom:"1.5rem",border:"1px solid rgba(245,158,11,0.2)",background:"rgba(245,158,11,0.04)"}}>
          <p style={{margin:0,fontSize:"13px",color:"#f59e0b"}}>⚠️ Go to Data Input tab and enter your biomarkers or load random data for personalized predictions</p>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"2rem"}}>
        <PredictionCard
          horizon="1 Month" icon="📅" color="#4fc3f7" delay={0}
          riskDelta={-(risk - proj.oneMonth.risk)}
          topInsight="Consistent sleep optimization and anti-inflammatory nutrition will show measurable biomarker improvement within 30 days."
          metrics={[
            {label:"Structural",value:`${Math.round(proj.oneMonth.structural)}%`,trend:"up"},
            {label:"Metabolic",value:`${Math.round(proj.oneMonth.metabolic)}%`,trend:"up"},
            {label:"Kinetic",value:`${Math.round(proj.oneMonth.kinetic)}%`,trend:"up"},
            {label:"HRV Target",value:`${Math.round(proj.oneMonth.hrv)} ms`,trend:"up"},
          ]}
        />
        <PredictionCard
          horizon="1 Year" icon="📆" color="#a78bfa" delay={200}
          riskDelta={-(risk - proj.oneYear.risk)}
          topInsight="Sustained lifestyle changes will significantly reduce inflammatory markers, improve metabolic function and structural resilience."
          metrics={[
            {label:"Structural",value:`${Math.round(proj.oneYear.structural)}%`,trend:"up"},
            {label:"Metabolic",value:`${Math.round(proj.oneYear.metabolic)}%`,trend:"up"},
            {label:"Kinetic",value:`${Math.round(proj.oneYear.kinetic)}%`,trend:"up"},
            {label:"HRV Target",value:`${Math.round(proj.oneYear.hrv)} ms`,trend:"up"},
          ]}
        />
        <PredictionCard
          horizon="10 Years" icon="🔮" color="#22c55e" delay={400}
          riskDelta={-(risk - proj.tenYear.risk)}
          topInsight="Long-term structural physics optimization leads to significant disease prevention and biological age reversal potential."
          metrics={[
            {label:"Structural",value:`${Math.round(proj.tenYear.structural)}%`,trend:"up"},
            {label:"Metabolic",value:`${Math.round(proj.tenYear.metabolic)}%`,trend:"up"},
            {label:"Kinetic",value:`${Math.round(proj.tenYear.kinetic)}%`,trend:"up"},
            {label:"HRV Target",value:`${Math.round(proj.tenYear.hrv)} ms`,trend:"up"},
          ]}
        />
      </div>

      <div style={{...S.card,marginBottom:"1.5rem"}}>
        <SecTitle icon="📊" label="Trajectory Timeline"/>
        <TimelineBar label="Overall Risk Score" current={risk} oneMonth={proj.oneMonth.risk} oneYear={proj.oneYear.risk} tenYear={proj.tenYear.risk} color="#ef4444"/>
        <TimelineBar label="Structural Health" current={s21.structural} oneMonth={proj.oneMonth.structural} oneYear={proj.oneYear.structural} tenYear={proj.tenYear.structural} color="#4fc3f7"/>
        <TimelineBar label="Metabolic Health" current={s21.metabolic} oneMonth={proj.oneMonth.metabolic} oneYear={proj.oneYear.metabolic} tenYear={proj.tenYear.metabolic} color="#f59e0b"/>
        <TimelineBar label="Kinetic Performance" current={s21.kinetic} oneMonth={proj.oneMonth.kinetic} oneYear={proj.oneYear.kinetic} tenYear={proj.tenYear.kinetic} color="#22c55e"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",marginBottom:"1.5rem"}}>
        {[
          {period:"30 Days",icon:"🎯",actions:["Optimize sleep to 7-8 hours nightly","Reduce processed food intake by 50%","Walk 8,000+ steps daily","Start HRV tracking routine"],color:"#4fc3f7"},
          {period:"12 Months",icon:"💪",actions:["Complete anti-inflammatory diet protocol","Strength training 3x per week","Annual biomarker blood panel","Achieve target HRV baseline"],color:"#a78bfa"},
          {period:"10 Years",icon:"🔮",actions:["Biological age optimization program","DNA methylation improvement","Metabolic syndrome prevention","Full S21 axis stabilization"],color:"#22c55e"},
        ].map(({period,icon,actions,color})=>(
          <div key={period} style={{...S.card,border:`1px solid ${color}25`}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"1rem"}}>
              <span style={{fontSize:"24px"}}>{icon}</span>
              <div>
                <p style={{margin:0,fontWeight:"800",fontSize:"14px",color}}>{period} Action Plan</p>
                <p style={{margin:0,fontSize:"11px",color:"#475569"}}>Priority interventions</p>
              </div>
            </div>
            {actions.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"8px",marginBottom:"8px"}}>
                <div style={{width:"18px",height:"18px",borderRadius:"50%",background:`${color}20`,border:`1px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"800",color,flexShrink:0,marginTop:"1px"}}>{i+1}</div>
                <p style={{margin:0,fontSize:"12px",color:"#94a3b8",lineHeight:"1.5"}}>{a}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{...S.card,background:"linear-gradient(135deg,rgba(167,139,250,0.08),rgba(79,195,247,0.08))",border:"1px solid rgba(167,139,250,0.2)",textAlign:"center",padding:"2rem"}}>
        <div style={{fontSize:"36px",marginBottom:"12px"}}>🧬</div>
        <h3 style={{margin:"0 0 8px",color:"#a78bfa",fontWeight:"800"}}>Unlock DNA Integration</h3>
        <p style={{margin:"0 0 1.5rem",fontSize:"13px",color:"#64748b",maxWidth:"500px",marginLeft:"auto",marginRight:"auto"}}>
          Connect your genetic data to unlock full S21 physics projection including epigenetic age modeling, variant risk scoring, and personalized longevity pathways.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:"12px"}}>
          <div style={{padding:"6px 16px",borderRadius:"20px",background:"rgba(167,139,250,0.1)",color:"#a78bfa",border:"1px solid rgba(167,139,250,0.3)",fontSize:"12px",fontWeight:"700"}}>Coming Soon</div>
          <div style={{padding:"6px 16px",borderRadius:"20px",background:"rgba(79,195,247,0.1)",color:"#4fc3f7",border:"1px solid rgba(79,195,247,0.3)",fontSize:"12px",fontWeight:"700"}}>S21 Physics Engine v2</div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

const Simulations = () => {
  const [activeTab,setActiveTab] = useState("input");
  const [form,setForm] = useState(defaultForm);
  const [riskScore,setRiskScore] = useState(null);
  const [analysisData,setAnalysisData] = useState(null);
  const [analysisRun,setAnalysisRun] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [uploadMsg,setUploadMsg] = useState("🚧 Screenshot OCR feature is under development. Please enter data manually.");
  const [dragOver,setDragOver] = useState(false);
  const fileRef = useRef();

  const updateField = (key) => (val) => setForm(f=>({...f,[key]:val}));

  const handleRunAnalysis = async () => {
    try {
      const apiKey = "merlin123merlin123"; // Fixed project API key
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      console.log("Fetching wearable data for:", userId);
      const response = await fetch(`${API_BASE}/v2/score-from-wearable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        if (response.status === 404) {
           throw new Error("No wearable data found. Please sync your device first.");
        }
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log("Wearable Analysis result:", data);

      // Boss engine v2 returns data inside 'position' block
      const pos = data.position || data;
      
      if (pos?.axes) {
        // Map decimal values (0-1) to percentages (0-100) for the UI
        const mappedAxes = {
          structural: (pos.axes.structural || 0) * 100,
          inflammatory: (pos.axes.inflammatory || 0) * 100,
          metabolic: (pos.axes.metabolic || 0) * 100,
          redox: (pos.axes.redox || 0) * 100,
          kinetic: (pos.axes.kinetic || 0) * 100,
          balance: (pos.axes.balance || 0) * 100,
        };

        const score = pos.risk_score ? Math.round(pos.risk_score * 100) : 50;
        setRiskScore(score);
        
        // Wrap for compatibility with the rest of Simulations.jsx
        setAnalysisData({ ...data, axes: mappedAxes, risk_score: score });
        setAnalysisRun(true);

        console.log("Extracted mapped axes:", mappedAxes);
      } else {
        throw new Error("Invalid response format from engine.");
      }

    } catch (err) {
      console.error("Analyze error:", err);
      alert("Wearable connection failed: " + err.message);
    }
  };

  const handleLoadRandom = () => {
    const r=generateRandomForm();
    setForm(r);
    setRiskScore(calcRisk(r));
    setAnalysisRun(true);
  };

  const handleSyncWearable = async () => {
    try {
      const apiKey = "merlin123merlin123";
      const token = localStorage.getItem("token");
      let userId = "demo-user";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.id) userId = payload.id;
        } catch (e) {}
      }

      setUploadMsg("Syncing wearable data...");
      setUploading(true);

      const response = await fetch(`${API_BASE}/v2/wearable-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}. Please try again.`);
      }

      const data = await response.json();
      
      // Auto-fill the form with wearable data
      setForm(prev => ({
        ...prev,
        age: data.age ? data.age.toString() : prev.age,
        sex: data.sex ? (data.sex === "male" ? "M" : "F") : prev.sex,
        dailySteps: data.daily_steps ? data.daily_steps.toString() : prev.dailySteps,
        restingHR: data.resting_heart_rate ? data.resting_heart_rate.toString() : prev.restingHR,
        sleepDuration: data.avg_sleep_hours ? data.avg_sleep_hours.toString() : prev.sleepDuration,
        hrv: data.hrv ? data.hrv.toString() : prev.hrv,
        activeMinutes: data.active_minutes ? data.active_minutes.toString() : prev.activeMinutes,
        
        // Visual mapping to blood markers to match the backend logic for demo purposes
        crp: data.resting_heart_rate ? data.resting_heart_rate.toString() : prev.crp,
        albumin: data.avg_sleep_hours ? data.avg_sleep_hours.toString() : prev.albumin,
        egfr: data.hrv ? data.hrv.toString() : prev.egfr,
        hba1c: data.active_minutes ? data.active_minutes.toString() : prev.hba1c,
        vo2max: data.vo2max ? data.vo2max.toString() : prev.vo2max,
        recoveryScore: data.recovery_score ? data.recovery_score.toString() : prev.recoveryScore,
        sleepScore: data.sleep_score ? data.sleep_score.toString() : prev.sleepScore,
        sleepDebt: data.sleep_debt ? data.sleep_debt.toString() : prev.sleepDebt,
      }));

      setUploadMsg(data._demo
        ? "⚡ No real device data — loaded demo wearable profile. Click Run Complete Analysis."
        : `✅ Real wearable data synced (${new Date().toLocaleTimeString()})! Click Run Complete Analysis.`);
    } catch (err) {
      setUploadMsg(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (file) => {
    // OCR feature is temporarily disabled
    setUploadMsg("🚧 Screenshot OCR feature is under development. Please enter data manually.");
  };

  const tabStyle = (id) => ({
    display:"flex",alignItems:"center",gap:"8px",padding:"10px 18px",borderRadius:"25px",border:"none",
    cursor:"pointer",fontSize:"12px",fontWeight:"700",whiteSpace:"nowrap",transition:"all 0.2s",
    background:activeTab===id?"linear-gradient(135deg,#4fc3f7,#0ea5e9)":"rgba(255,255,255,0.05)",
    color:activeTab===id?"#fff":"#64748b",
    boxShadow:activeTab===id?"0 4px 15px rgba(79,195,247,0.3)":"none",
  });

  const s21 = analysisData
  ? {
      structural: analysisData.axes?.structural ?? 0,
      inflammatory: analysisData.axes?.inflammatory ?? 0,
      metabolic: analysisData.axes?.metabolic ?? 0,
      redox: analysisData.axes?.redox ?? 0,
      kinetic: analysisData.axes?.kinetic ?? 0,
      balance: analysisData.axes?.balance ?? 0,
    }
  : calcS21(form);
  const readiness = calcReadiness(form);
  const risk = riskScore || calcRisk(form);

  const getLifestyleRecs = () => {
    const highCRP = parseFloat(form.crp||0)>3;
    const highHbA1c = parseFloat(form.hba1c||0)>6.5;
    const lowSteps = parseInt(form.dailySteps||0)<5000;
    const lowSleep = parseFloat(form.sleepDuration||0)<6;
    return {
      nutrition: highCRP
        ? "Anti-inflammatory Protocol: Mediterranean diet with omega-3 rich fish, leafy greens, berries, and turmeric. Limit processed foods and sugar."
        : highHbA1c
        ? "Glycemic Control: Low-glycemic index foods, reduce refined carbs, increase fiber intake. Consider intermittent fasting."
        : "Protein Optimization: Increase high-quality protein intake to 1.2-1.6g/kg body weight. Consider collagen supplementation.",
      exercise: lowSteps
        ? "Progressive Activity: Start with 20-30 min daily walks, gradually increase. Avoid prolonged sitting. Target 8,000+ steps."
        : "Moderate Training: Steady-state cardio, moderate strength training 60-75% 1RM, flexibility work. Good training day.",
      lifestyle: lowSleep
        ? "Sleep Priority: Establish consistent sleep schedule, avoid screens 1hr before bed, keep room cool and dark."
        : "Daily Rhythm Optimization: Consistent sleep/wake times, morning light exposure, evening blue light reduction, regular meal timing.",
    };
  };

  const getActivities = () => {
    const r = readiness.exercise;
    const isHigh = r >= 70;
    const isMed = r >= 45;
    return [
      {icon:"🌅",title:"Morning Power Routine",desc:isHigh?"Start with 10-15 min dynamic stretching, cold shower, and protein-rich breakfast.":"Start with 5-10 minutes of dynamic stretching, followed by cold shower and protein-rich breakfast.",timing:"7:00 AM - 7:30 AM",strain:isHigh?"MODERATE STRAIN":"LOW STRAIN",strainColor:isHigh?"#f59e0b":"#22c55e"},
      {icon:"🏃",title:isHigh?"High Intensity Exercise":isMed?"Moderate Exercise":"Light Movement",desc:isHigh?"45-60 min strength training or HIIT. Push to 75-85% max effort. Optimal performance window.":isMed?"30-45 minutes moderate cardio or light strength training. Listen to your body's signals.":"20-30 min gentle walk or yoga. Keep heart rate below 60% max. Focus on mobility.",timing:"Based on schedule",strain:isHigh?"HIGH STRAIN":isMed?"MODERATE STRAIN":"LOW STRAIN",strainColor:isHigh?"#ef4444":isMed?"#f59e0b":"#22c55e"},
      {icon:"📋",title:"Administrative Tasks",desc:"Handle routine tasks and communications. Avoid complex decision-making when possible.",timing:"Morning hours",strain:"LOW STRAIN",strainColor:"#22c55e"},
      {icon:"🌙",title:"Recovery Evening Routine",desc:"Wind down with reading, gentle stretching, or meditation. Prepare for optimal sleep quality.",timing:"8:00 PM - 10:00 PM",strain:"LOW STRAIN",strainColor:"#22c55e"},
    ];
  };

  const recs = getLifestyleRecs();
  const activities = getActivities();

  return (
    <div style={{minHeight:"100vh",color:"#e2e8f0",padding:"0"}}>
      <div style={{textAlign:"center",padding:"2rem 2rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <h1 style={{fontSize:"2rem",fontWeight:"900",background:"linear-gradient(135deg,#4fc3f7,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 4px"}}>HexaGene V13</h1>
        <p style={{color:"#64748b",fontSize:"13px",margin:"0 0 12px"}}>Complete Lifestyle Intelligence with S21 Physics</p>
        <span style={{fontSize:"11px",fontWeight:"800",padding:"6px 16px",borderRadius:"20px",background:"linear-gradient(135deg,#ec4899,#f97316)",color:"#fff",letterSpacing:"1px"}}>REVOLUTIONARY HEALTH COACH ✓</span>
      </div>

      <div style={{display:"flex",gap:"8px",padding:"1.25rem 2rem",overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,0.06)",scrollbarWidth:"none"}}>
        {TABS.map(tab=>(
          <button key={tab.id} style={tabStyle(tab.id)} onClick={()=>setActiveTab(tab.id)}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div style={{padding:"2rem"}}>

        {activeTab==="input" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:"2rem",alignItems:"start"}}>
            <div>
              <div style={{borderRadius:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(79,195,247,0.25)",padding:"1.25rem",marginBottom:"1.5rem"}}>
                <SecTitle icon="🧬" label="Multi-Modal Health Input"/>
                <div
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);handleFileUpload(e.dataTransfer.files[0]);}}
                  onClick={()=>fileRef.current.click()}
                  style={{border:`2px dashed ${dragOver?"#4fc3f7":"rgba(79,195,247,0.3)"}`,borderRadius:"12px",padding:"2rem",textAlign:"center",cursor:"pointer",background:dragOver?"rgba(79,195,247,0.05)":"transparent",transition:"all 0.2s"}}
                >
                  <div style={{fontSize:"36px",marginBottom:"12px"}}>📱</div>
                  <p style={{margin:"0 0 6px",fontWeight:"700",fontSize:"14px"}}>Upload Wearable App Screenshots</p>
                  <p style={{margin:0,color:"#64748b",fontSize:"12px"}}>Apple Health, Fitbit, Garmin, Samsung Health, Whoop, Oura, or any wearable data</p>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFileUpload(e.target.files[0])}/>
                </div>
                {uploadMsg&&(
                  <div style={{marginTop:"12px",padding:"10px 14px",borderRadius:"8px",background:uploading?"rgba(79,195,247,0.08)":"rgba(34,197,94,0.08)",border:`1px solid ${uploading?"rgba(79,195,247,0.2)":"rgba(34,197,94,0.2)"}`,fontSize:"13px",color:uploading?"#4fc3f7":"#22c55e"}}>
                    {uploadMsg}
                  </div>
                )}
              </div>
              <div style={S.card}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1.5rem"}}>
                  <div style={{gridColumn:"1/-1"}}><SecTitle icon="👤" label="Demographics"/></div>
                  <InputField label="Age" value={form.age} onChange={updateField("age")} placeholder="45"/>
                  <InputField label="Sex" value={form.sex} onChange={updateField("sex")} placeholder="M or F"/>
                  <InputField label="Activity Level (1-5)" value={form.activityLevel} onChange={updateField("activityLevel")} placeholder="3"/>
                  <div><SecTitle icon="🩸" label="Core Panel"/>
                    <InputField label="Albumin (g/dL)" value={form.albumin} onChange={updateField("albumin")} placeholder="4.2"/>
                    <InputField label="CRP (mg/L)" value={form.crp} onChange={updateField("crp")} placeholder="2.1"/>
                    <InputField label="HbA1c (%)" value={form.hba1c} onChange={updateField("hba1c")} placeholder="5.9"/>
                  </div>
                  <div><SecTitle icon="⚡" label="Function Panel"/>
                    <InputField label="eGFR (mL/min)" value={form.egfr} onChange={updateField("egfr")} placeholder="78"/>
                    <InputField label="RDW (%)" value={form.rdw} onChange={updateField("rdw")} placeholder="13.2"/>
                    <InputField label="Uric Acid (mg/dL)" value={form.uricAcid} onChange={updateField("uricAcid")} placeholder="5.3"/>
                  </div>
                  <div><SecTitle icon="⌚" label="Activity Metrics"/>
                    <InputField label="Resting HR (bpm)" value={form.restingHR} onChange={updateField("restingHR")} placeholder="57"/>
                    <InputField label="Daily Steps" value={form.dailySteps} onChange={updateField("dailySteps")} placeholder="6220"/>
                    <InputField label="Active Minutes" value={form.activeMinutes} onChange={updateField("activeMinutes")} placeholder="31"/>
                  </div>
                  <div><SecTitle icon="🏃" label="Performance Metrics"/>
                    <InputField label="VO2 Max" value={form.vo2max} onChange={updateField("vo2max")} placeholder="35"/>
                    <InputField label="HRV (ms)" value={form.hrv} onChange={updateField("hrv")} placeholder="48"/>
                    <InputField label="Recovery Score (%)" value={form.recoveryScore} onChange={updateField("recoveryScore")} placeholder="0-100"/>
                  </div>
                  <div style={{gridColumn:"1/-1"}}><SecTitle icon="😴" label="Sleep & Recovery"/></div>
                  <InputField label="Sleep Duration (hours)" value={form.sleepDuration} onChange={updateField("sleepDuration")} placeholder="7.4"/>
                  <InputField label="Sleep Score (%)" value={form.sleepScore} onChange={updateField("sleepScore")} placeholder="93"/>
                  <InputField label="Sleep Debt (hours)" value={form.sleepDebt} onChange={updateField("sleepDebt")} placeholder="0.5"/>
                </div>
                <div style={{display:"flex",gap:"12px",marginTop:"1.5rem"}}>
                  <button onClick={handleLoadRandom} style={{flex:1,padding:"12px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#94a3b8",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>🎲 Load Random</button>
                  <button onClick={handleSyncWearable} style={{flex:1.5,padding:"12px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#a855f7,#6366f1)",color:"#fff",cursor:"pointer",fontSize:"13px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                    {uploading ? (
                      <><div style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/> Syncing...</>
                    ) : "⌚ Sync Wearable Data"}
                  </button>
                  <button onClick={handleRunAnalysis} style={{flex:2,padding:"12px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#4fc3f7,#0ea5e9)",color:"#fff",cursor:"pointer",fontSize:"13px",fontWeight:"800"}}>🧬 RUN COMPLETE ANALYSIS</button>
                </div>
                <style dangerouslySetInnerHTML={{__html: "@keyframes spin { to { transform: rotate(360deg); } }"}} />
              </div>
            </div>
            <div style={{position:"sticky",top:"20px"}}>
              <div style={{...S.card,textAlign:"center"}}>
                {analysisRun&&riskScore!==null?(
                  <>
                    <CircleRisk score={riskScore}/>
                    <div style={{marginTop:"1.5rem",padding:"12px 16px",borderRadius:"10px",background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.06)",fontSize:"12px",color:"#64748b",fontFamily:"monospace"}}>
                      S21 State: σ=7 | Status: {analysisData?.classification || "STABLE"} {analysisData?.tier || "Ω₂₁"}
                    </div>
                    {analysisData?.wearable_data && (
                      <div style={{marginTop:"0.75rem",fontSize:"10px",color:"#475569",textTransform:"uppercase",letterSpacing:"0.5px"}}>
                        Last Sync: {new Date(analysisData.wearable_data.created_at).toLocaleString()} via {analysisData.wearable_data.source || "device"}
                      </div>
                    )}
                    <div style={{marginTop:"1.5rem",textAlign:"left"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                        <span style={S.label}>Engine Completeness</span>
                        <span style={{fontSize:"11px",fontWeight:"700",color:"#4fc3f7"}}>{Math.round((analysisData?.completeness || 0) * 100)}%</span>
                      </div>
                      <ProgressBar value={(analysisData?.completeness || 0) * 100} color="#4fc3f7" />
                    </div>
                    <div style={{marginTop:"1.5rem",textAlign:"left"}}>
                      <SecTitle icon="⚡" label="Quick Insights"/>
                      {[
                        riskScore>=60&&"• ⚠ Elevated health risk — review recommendations",
                        parseFloat(form.crp)>3&&"• 🔴 High CRP indicates inflammation",
                        parseFloat(form.hba1c)>6.5&&"• 🔴 HbA1c above diabetic threshold",
                        parseInt(form.dailySteps)<5000&&"• 🟡 Low daily steps — increase activity",
                        parseFloat(form.sleepDuration)<6&&"• 🟡 Insufficient sleep detected",
                        parseInt(form.hrv)<30&&"• 🔴 Low HRV — recovery concern",
                        riskScore<30&&"• ✅ All markers within healthy range",
                      ].filter(Boolean).map((msg,i)=>(
                        <p key={i} style={{margin:"6px 0",fontSize:"12px",color:"#94a3b8",lineHeight:"1.5"}}>{msg}</p>
                      ))}
                    </div>
                  </>
                ):(
                  <div style={{padding:"3rem 1rem",color:"#475569"}}>
                    <div style={{fontSize:"48px",marginBottom:"16px"}}>🧬</div>
                    <p style={{fontSize:"14px",margin:0}}>Fill inputs or upload a screenshot then click Run Complete Analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab==="s21" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
            <div style={S.card}>
              <SecTitle icon="🧬" label="S21 Physics Analysis"/>
              {[
                {key:"structural",label:"Structural",color:"#4fc3f7"},
                {key:"inflammatory",label:"Inflammatory",color:"#ef4444"},
                {key:"metabolic",label:"Metabolic",color:"#f59e0b"},
                {key:"redox",label:"Redox",color:"#a78bfa"},
                {key:"kinetic",label:"Kinetic",color:"#22c55e"},
                {key:"balance",label:"Balance",color:"#4fc3f7"},
              ].map(({key,label,color})=>(
                <div key={key} style={{...S.card,marginBottom:"10px",padding:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"13px",fontWeight:"600",color:"#e2e8f0"}}>{label}</span>
                    <span style={{fontSize:"12px",color,fontWeight:"700"}}>{Math.round(s21[key])}%</span>
                  </div>
                  <ProgressBar value={s21[key]} color={color}/>
                </div>
              ))}
              <div style={{...S.card,marginTop:"1rem",background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.2)"}}>
                <SecTitle icon="🚀" label="DNA Integration"/>
                <p style={{margin:0,fontSize:"13px",color:"#64748b"}}>Complete DNA analysis with S21 physics integration</p>
              </div>
            </div>
            <div style={S.card}>
              <SecTitle icon="💊" label="Clinical Insights"/>
              {[
                {title:"Structural Resilience (k)",value:(s21.structural/10).toFixed(2),desc:"System elasticity and recovery capacity",color:"#4fc3f7"},
                {title:"Metabolic Friction (μ)",value:(s21.inflammatory/10).toFixed(2),desc:"Inflammatory drag and viscosity index",color:"#ef4444"},
                {title:"Structural Decay (λ)",value:((100-s21.metabolic)/10).toFixed(2),desc:"Accumulated biological fatigue rate",color:"#f59e0b"},
                {title:"Structural Risk Index (SRI)",value:(risk/10).toFixed(2),desc:"Global composite structural tension",color:"#a78bfa"},
              ].map(({title,value,desc,color})=>(
                <div key={title} style={{...S.card,marginBottom:"10px",padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                    <span style={{fontSize:"13px",fontWeight:"700",color:"#e2e8f0",flex:1}}>{title}</span>
                    <span style={{fontSize:"20px",fontWeight:"900",color,marginLeft:"12px"}}>{value}</span>
                  </div>
                  <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>{desc}</p>
                </div>
              ))}
            </div>
            <Footer/>
          </div>
        )}

        {activeTab==="readiness" && (
          <div>
            <SecTitle icon="⚡" label="Today's Readiness Analysis"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[
                {icon:"⚡",score:Math.round(readiness.energy),label:"Energy Score"},
                {icon:"💼",score:Math.round(readiness.work),label:"Work Readiness"},
                {icon:"🏃",score:Math.round(readiness.exercise),label:"Exercise Readiness"},
              ].map(({icon,score,label})=>{
                const {label:rlabel,color}=getReadinessLabel(score);
                return (
                  <div key={label} style={{...S.card,textAlign:"center",padding:"2rem 1rem"}}>
                    <div style={{fontSize:"32px",marginBottom:"8px"}}>{icon}</div>
                    <div style={{fontSize:"48px",fontWeight:"900",color:"#e2e8f0",lineHeight:1}}>{score}</div>
                    <div style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px",margin:"8px 0"}}>{label}</div>
                    <div style={{display:"inline-block",padding:"4px 16px",borderRadius:"20px",background:"rgba(255,255,255,0.06)",fontSize:"11px",fontWeight:"800",color,letterSpacing:"1px"}}>{rlabel}</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div style={{...S.card,border:"1px solid rgba(79,195,247,0.2)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1rem"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(79,195,247,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>📊</div>
                  <div>
                    <p style={{margin:0,fontWeight:"700",fontSize:"14px",color:"#4fc3f7"}}>Today's Performance Outlook</p>
                    <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>Based on S21 axis analysis and recovery metrics</p>
                  </div>
                </div>
                {[
                  {label:"Energy Level",value:readiness.energy>=70?"Good — Above average capacity":readiness.energy>=50?"Moderate — Average capacity":"Low — Below average capacity"},
                  {label:"Cognitive Performance",value:readiness.work>=70?"Good — Above average capacity":readiness.work>=50?"Moderate — Focus on simple tasks":"Low — Rest and recovery recommended"},
                  {label:"Physical Capacity",value:readiness.exercise>=70?"High — Peak performance window":readiness.exercise>=50?"Moderate — Average performance":"Low — Light activity only"},
                  {label:"Recommended Training Load",value:readiness.exercise>=70?"High intensity (75-90% effort)":readiness.exercise>=50?"Light intensity (40-60% effort)":"Recovery only (20-40% effort)"},
                ].map(({label,value})=>(
                  <p key={label} style={{margin:"6px 0",fontSize:"13px",color:"#94a3b8",lineHeight:"1.6"}}>
                    <span style={{color:"#e2e8f0",fontWeight:"700"}}>{label}:</span> {value}
                  </p>
                ))}
              </div>
              <div style={{...S.card,border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1rem"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(245,158,11,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>⚠️</div>
                  <div>
                    <p style={{margin:0,fontWeight:"700",fontSize:"14px",color:"#f59e0b"}}>Strain Recommendations</p>
                    <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>Optimal activity intensity for today</p>
                  </div>
                </div>
                {[
                  {label:"Optimal Strain Level",value:readiness.exercise>=70?"High strain optimal (14-18)":readiness.exercise>=50?"Moderate strain optimal (10-14)":"Low strain optimal (6-10)"},
                  {label:"Recovery Priority",value:parseInt(form.hrv||0)<30||parseInt(form.recoveryScore||0)<50?"HIGH — Prioritize recovery today":"Maintain current recovery practices"},
                  {label:"Activity Timing",value:readiness.energy>=70?"Morning to midday peak window":"Mid-morning to early afternoon"},
                ].map(({label,value})=>(
                  <p key={label} style={{margin:"6px 0",fontSize:"13px",color:"#94a3b8",lineHeight:"1.6"}}>
                    <span style={{color:"#e2e8f0",fontWeight:"700"}}>{label}:</span> {value}
                  </p>
                ))}
              </div>
            </div>
            <Footer/>
          </div>
        )}

        {activeTab==="lifestyle" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem"}}>
              {[
                {icon:"🥗",title:"Personalized Nutrition",subtitle:"Based on your S21 metabolic & inflammatory axes",color:"#22c55e",content:[{label:"Anti-inflammatory Protocol",text:recs.nutrition}]},
                {icon:"💪",title:"Exercise Prescription",subtitle:"Optimized for your kinetic & structural axes",color:"#4fc3f7",content:[{label:"Moderate Training",text:recs.exercise}]},
                {icon:"🧘",title:"Lifestyle Optimization",subtitle:"Balance & recovery axis enhancement",color:"#f59e0b",content:[{label:"Daily Rhythm Optimization",text:recs.lifestyle}]},
              ].map(({icon,title,subtitle,color,content})=>(
                <div key={title} style={{...S.card,border:`1px solid ${color}30`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1rem"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`${color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>{icon}</div>
                    <div>
                      <p style={{margin:0,fontWeight:"700",fontSize:"14px",color}}>{title}</p>
                      <p style={{margin:0,fontSize:"11px",color:"#64748b"}}>{subtitle}</p>
                    </div>
                  </div>
                  {content.map(({label,text})=>(
                    <div key={label} style={{borderLeft:`3px solid ${color}`,paddingLeft:"12px",marginBottom:"10px"}}>
                      <p style={{margin:"0 0 4px",fontSize:"12px",fontWeight:"700",color}}>{label}:</p>
                      <p style={{margin:0,fontSize:"12px",color:"#94a3b8",lineHeight:"1.6"}}>{text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Footer/>
          </div>
        )}

        {activeTab==="activities" && (
          <div>
            <SecTitle icon="🎯" label="Today's Recommended Activities"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem"}}>
              {activities.map(({icon,title,desc,timing,strain,strainColor})=>(
                <div key={title} style={{...S.card,textAlign:"center",padding:"1.5rem 1rem"}}>
                  <div style={{fontSize:"40px",marginBottom:"12px"}}>{icon}</div>
                  <p style={{margin:"0 0 8px",fontWeight:"700",fontSize:"13px",color:"#4fc3f7"}}>{title}</p>
                  <p style={{margin:"0 0 12px",fontSize:"12px",color:"#94a3b8",lineHeight:"1.6"}}>{desc}</p>
                  <p style={{margin:"0 0 12px",fontSize:"11px",color:"#64748b"}}>
                    <span style={{color:"#e2e8f0",fontWeight:"700"}}>Timing:</span> {timing}
                  </p>
                  <div style={{display:"inline-block",padding:"4px 12px",borderRadius:"20px",background:`${strainColor}20`,fontSize:"10px",fontWeight:"800",color:strainColor,letterSpacing:"0.5px",border:`1px solid ${strainColor}40`}}>{strain}</div>
                </div>
              ))}
            </div>
            <Footer/>
          </div>
        )}

        {activeTab==="future" && <FutureOptimization form={form}/>}

      </div>
    </div>
  );
};

export default Simulations;