import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bluetooth, BluetoothSearching, BluetoothConnected, Zap, Heart,
  Droplets, Activity, Battery, Thermometer,
  Upload, CheckCircle, AlertCircle, Loader2, ArrowRight, Terminal
} from "lucide-react";
import { X3BleEngine } from "../../utils/qringBle";

// ─── Phase Machine ────────────────────────────────────────────────────────────
const PHASE = {
  IDLE: "idle",
  CONNECTING: "connecting",
  LIVE: "live", // Realtime streaming mode
  SYNCING: "syncing",
  DONE: "done",
  ERROR: "error",
};

const INGEST_URL = "https://hexagene-app.onrender.com/v2/ingest-wearable";
const INGEST_TOKEN = "hexagene-ingest-2026";

// ─── Metric Card Component ──────────────────────────────────────────────────
function LiveMetricCard({ icon: Icon, label, value, unit, color = "text-health-primary" }) {
  const hasValue = value !== null && value !== undefined && value !== 0;
  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
      hasValue ? "bg-white border-health-primary/20 shadow-xl shadow-health-primary/5 scale-100" : "bg-health-surface/40 border-health-border opacity-60 scale-95"
    }`}>
      <div className={`mb-3 p-2 rounded-xl ${hasValue ? "bg-health-surface" : ""} ${hasValue ? color : "text-health-muted"}`}>
        <Icon size={24} />
      </div>
      <span className={`text-3xl font-black ${hasValue ? "text-health-text" : "text-health-muted"}`}>
        {value ?? "--"}
      </span>
      <span className="text-[10px] font-black text-health-muted uppercase tracking-[0.2em] mt-1">{unit}</span>
      <span className="text-[9px] font-bold text-health-muted mt-1 opacity-70">{label}</span>
    </div>
  );
}

// ─── Main Connect Page ────────────────────────────────────────────────────────
export default function BleConnect() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [deviceName, setDeviceName] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Ready to pair QRing/X3 wearable.");
  const [battery, setBattery] = useState(null);
  const [metrics, setMetrics] = useState({
    heartRate: null,
    spo2: null,
    temperature: null,
    steps: null,
    lastUpdate: null
  });
  const [rawPackets, setRawPackets] = useState([]);
  const engineRef = useRef(null);

  // Get user email for backend sync
  const getUserEmail = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.sub || null;
    } catch { return null; }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      engineRef.current?.disconnect();
    };
  }, []);

  // ─── Connection Flow (Phase 2) ──────────────────────────────────────────────
  const handleConnect = async () => {
    try {
      setPhase(PHASE.CONNECTING);
      const engine = new X3BleEngine();
      engineRef.current = engine;

      // Register Callbacks
      engine.onStatus = (msg) => setStatusMsg(msg);
      
      engine.onConnection = (connected, name) => {
        if (connected) {
          setDeviceName(name);
          setPhase(PHASE.LIVE);
        } else {
          setPhase(PHASE.IDLE);
          setDeviceName(null);
        }
      };

      engine.onData = (data) => {
        if (data.battery) {
          setBattery(data.battery);
        } else {
          setMetrics(prev => ({
            ...prev,
            ...data,
            lastUpdate: new Date().toLocaleTimeString()
          }));
        }
      };

      // Phase 6: Raw HEX debug log
      engine.onRawHex = (hex) => {
        setRawPackets(prev => [hex, ...prev].slice(0, 5));
      };

      await engine.connect();
    } catch (err) {
      console.error(err);
      setPhase(PHASE.ERROR);
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  // ─── Sync Flow (Phase 7) ────────────────────────────────────────────────────
  const handleSync = async () => {
    const email = getUserEmail();
    if (!email) {
      alert("Please log in to sync biomarkers.");
      return;
    }

    setPhase(PHASE.SYNCING);
    setStatusMsg("Syncing biomarkers with Clinical Engine...");

    const payload = {
      email,
      ingest_token: INGEST_TOKEN,
      source: "qring_x3_official",
      resting_heart_rate: metrics.heartRate,
      spo2: metrics.spo2,
      daily_steps: metrics.steps,
      temperature: metrics.temperature,
      battery: battery?.level
    };

    try {
      const res = await fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Sync failed");
      
      setPhase(PHASE.DONE);
      setStatusMsg("✓ Clinical sync successful!");
    } catch (err) {
      setPhase(PHASE.LIVE);
      setStatusMsg(`Sync failed: ${err.message}`);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-health-bg pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-12 space-y-10">
        
        {/* Phase 5: Header with connection status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-health-surface border border-health-border text-[10px] font-black uppercase tracking-[0.25em] text-health-primary">
              <span className={`w-2 h-2 rounded-full ${phase === PHASE.LIVE ? 'bg-green-500 animate-pulse' : 'bg-health-muted'}`} />
              {phase === PHASE.LIVE ? 'Live Stream Active' : 'X3 Protocol v1.1'}
            </div>
            {deviceName && (
              <div className="flex items-center gap-3 text-xs font-black text-health-muted">
                <Battery size={14} className={battery?.level < 20 ? 'text-red-500' : 'text-health-primary'} />
                {battery?.level ?? '--'}%
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-heading font-black text-health-text leading-tight">
            Connect <span className="text-health-primary">QRing/X3</span>
          </h1>
          <p className="text-health-muted text-base max-w-md leading-relaxed">
            Direct Web Bluetooth integration using official X3 protocols for clinical-grade biomarkers.
          </p>
        </div>

        {/* Phase 2: Action Center */}
        <div className="health-card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              phase === PHASE.LIVE ? 'bg-green-50' : 'bg-health-surface'
            }`}>
              {phase === PHASE.CONNECTING ? <Loader2 className="animate-spin text-health-primary" /> : <Bluetooth className={phase === PHASE.LIVE ? 'text-green-500' : 'text-health-muted'} />}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black text-health-muted uppercase tracking-wider">Engine Status</p>
              <p className="text-sm font-bold text-health-text">{statusMsg}</p>
            </div>
            {phase === PHASE.IDLE || phase === PHASE.ERROR ? (
              <button onClick={handleConnect} className="btn-health-primary py-3 px-8 text-sm">Scan Ring</button>
            ) : null}
          </div>

          {/* Phase 5: Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <LiveMetricCard icon={Heart} label="Heart Rate" value={metrics.heartRate} unit="bpm" color="text-red-500" />
            <LiveMetricCard icon={Droplets} label="Oxygen" value={metrics.spo2} unit="%" color="text-blue-500" />
            <LiveMetricCard icon={Thermometer} label="Body Temp" value={metrics.temperature} unit="°C" color="text-orange-500" />
            <LiveMetricCard icon={Zap} label="Activity" value={metrics.steps} unit="steps" color="text-health-primary" />
          </div>

          {metrics.lastUpdate && (
            <p className="text-center text-[10px] font-bold text-health-muted uppercase tracking-widest">
              Last Packet Received: {metrics.lastUpdate}
            </p>
          )}
        </div>

        {/* Phase 7: Clinical Sync Section */}
        {phase === PHASE.LIVE && (
          <div className="animate-fade-in space-y-4">
            <button 
              onClick={handleSync}
              disabled={!metrics.heartRate}
              className="w-full btn-health-primary py-5 text-lg flex items-center justify-center gap-4 group shadow-xl shadow-health-primary/20"
            >
              <Upload size={20} className="group-hover:translate-y-[-2px] transition-transform" />
              Run Clinical Sync
            </button>
            <p className="text-center text-xs text-health-muted">
              Sync will forward live biomarkers to AI engine for clinical scoring.
            </p>
          </div>
        )}

        {/* Phase 6: Raw HEX Packet Debug Panel */}
        <div className="health-card bg-slate-900 border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
              <Terminal size={14} />
              Raw HEX Debugger
            </div>
            <div className="text-[9px] font-bold text-health-primary bg-health-primary/10 px-2 py-0.5 rounded">
              X3_PROTOCOL_V1.1
            </div>
          </div>
          <div className="space-y-2 font-mono text-[10px] leading-relaxed">
            {rawPackets.length > 0 ? rawPackets.map((pkt, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-slate-600">[{rawPackets.length - i}]</span>
                <span className={i === 0 ? "text-green-400" : "text-slate-400"}>{pkt}</span>
              </div>
            )) : (
              <div className="text-slate-600 italic">Waiting for BLE packets...</div>
            )}
          </div>
        </div>

        {/* Success / Done Phase */}
        {phase === PHASE.DONE && (
          <div className="health-card p-10 flex flex-col items-center text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-100 shadow-inner">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-health-text">Sync Successful</h3>
              <p className="text-sm text-health-muted max-w-xs mx-auto">
                Your real-time biomarkers have been analyzed and integrated into the clinical engine.
              </p>
            </div>
            <button 
              onClick={() => window.open('https://hexagene-app.vercel.app/dashboard/simulations', '_blank')}
              className="btn-health-primary px-10 py-4 flex items-center gap-3"
            >
              View Analysis
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
