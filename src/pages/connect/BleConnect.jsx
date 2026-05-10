import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bluetooth, BluetoothSearching, BluetoothConnected, Zap, Heart,
  Droplets, Activity, Flame, Battery, Thermometer, Brain,
  Upload, CheckCircle, AlertCircle, Loader2, ArrowRight, RefreshCw
} from "lucide-react";
import {
  QRingBLE, parseRealtimeUpdate, parseHRVPackets,
  parseSpO2Packets, parseStepsPackets
} from "../../utils/qringBle";
import API_URL from "../../api/config";

// ─── State machine ────────────────────────────────────────────────────────────
const PHASE = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  MEASURING: "measuring",
  READING: "reading",
  READY: "ready",
  EXPORTING: "exporting",
  DONE: "done",
  ERROR: "error",
};

const INGEST_URL = "https://hexagene-app.onrender.com/v2/ingest-wearable";
const INGEST_TOKEN = "hexagene-ingest-2026";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUserEmail() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch { return null; }
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricPill({ icon: Icon, label, value, unit, active, color = "text-health-primary" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-500 ${active
        ? "bg-white border-health-primary/30 shadow-lg shadow-health-primary/10"
        : "bg-health-surface/50 border-health-border opacity-50"
      }`}>
      <div className={`mb-2 ${active ? color : "text-health-muted"}`}>
        <Icon size={22} />
      </div>
      <span className={`text-2xl font-black ${active ? "text-health-text" : "text-health-muted"}`}>
        {value ?? "--"}
      </span>
      <span className="text-[9px] font-bold text-health-muted uppercase tracking-widest mt-0.5">{unit}</span>
      <span className="text-[8px] text-health-muted mt-0.5">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BleConnect() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [deviceName, setDeviceName] = useState(null);
  const [battery, setBattery] = useState(null);
  const [metrics, setMetrics] = useState({
    heartRate: null, spo2: null, hrv: null, fatigue: null,
    steps: null, calories: null, distance: null, temperature: null,
  });
  const [statusMsg, setStatusMsg] = useState(null);
  const [measureTime, setMeasureTime] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const bleRef = useRef(null);
  const timerRef = useRef(null);

  const userEmail = getUserEmail();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bleRef.current?.disconnect();
      clearInterval(timerRef.current);
    };
  }, []);

  // ─── Connect flow ──────────────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setPhase(PHASE.ERROR);
      setStatusMsg("Web Bluetooth is not supported. Please use Chrome on Android.");
      return;
    }

    try {
      setPhase(PHASE.CONNECTING);
      setStatusMsg("Scanning for QRing X6...");

      const ble = new QRingBLE();
      bleRef.current = ble;

      ble.onConnectionChange = (connected, name) => {
        if (!connected) {
          setPhase(PHASE.IDLE);
          setStatusMsg("Ring disconnected.");
          clearInterval(timerRef.current);
        }
      };

      // Live metric updates from 0x09 streaming
      ble.onRealtimeData = (data) => {
        if (!data) return;
        setMetrics(prev => ({
          ...prev,
          heartRate: data.heartRate ?? prev.heartRate,
          spo2: data.spo2 ?? prev.spo2,
          steps: data.steps ?? prev.steps,
          calories: data.calories ?? prev.calories,
          distance: data.distance ?? prev.distance,
          temperature: data.temperature ?? prev.temperature,
        }));
      };

      const name = await ble.connect();
      setDeviceName(name || "QRing X6");
      setPhase(PHASE.CONNECTED);
      setStatusMsg("Connected! Initializing ring...");

      // Initialize: sync time + read battery
      await ble.setTime();
      const bat = await ble.readBattery();
      setBattery(bat);

      // Auto-start measurements
      await startMeasurements(ble);

    } catch (err) {
      setPhase(PHASE.ERROR);
      setStatusMsg(err.message?.includes("cancelled")
        ? "Scan cancelled. Tap Connect to try again."
        : `Connection failed: ${err.message}`);
    }
  }, []);

  // ─── Measurement flow ──────────────────────────────────────────────────────
  const startMeasurements = async (ble) => {
    setPhase(PHASE.MEASURING);
    setMeasureTime(0);
    setStatusMsg("Measuring your biomarkers... 60 seconds");

    // Start HR + SpO2 + HRV measurements simultaneously
    await Promise.all([
      ble.startHRMeasurement(60),
      ble.startSpO2Measurement(60),
      ble.startHRVMeasurement(60),
    ]);

    // Enable realtime streaming (HR/SpO2/Steps appear every second)
    await ble.startRealtimeMode();

    // Countdown timer
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed++;
      setMeasureTime(elapsed);
      if (elapsed >= 60) {
        clearInterval(timerRef.current);
        readHistoricalData(ble);
      }
    }, 1000);
  };

  // ─── Read history after measurement ───────────────────────────────────────
  const readHistoricalData = async (ble) => {
    setPhase(PHASE.READING);
    setStatusMsg("Reading HRV and health data...");

    try {
      await ble.stopRealtimeMode();

      const [hrvPackets, spo2Packets, stepsPackets] = await Promise.all([
        ble.getLatestHRV(),
        ble.getLatestSpO2(),
        ble.getTotalSteps(),
      ]);

      const hrv = parseHRVPackets(hrvPackets);
      const spo2 = parseSpO2Packets(spo2Packets);
      const steps = parseStepsPackets(stepsPackets);

      setMetrics(prev => ({
        ...prev,
        hrv: hrv?.hrv ?? prev.hrv,
        fatigue: hrv?.fatigue ?? prev.fatigue,
        spo2: spo2?.spo2 ?? prev.spo2,
        steps: steps?.steps ?? prev.steps,
        calories: steps?.calories ?? prev.calories,
      }));

      setPhase(PHASE.READY);
      setStatusMsg("All biomarkers collected. Ready to export.");
    } catch (err) {
      setPhase(PHASE.READY);
      setStatusMsg("Readings collected. Some metrics may be incomplete.");
    }
  };

  // ─── Export to HexaGene ───────────────────────────────────────────────────
  const handleExport = async () => {
    if (!userEmail) {
      setStatusMsg("Please log in to HexaGene first.");
      return;
    }
    setPhase(PHASE.EXPORTING);
    setStatusMsg("Uploading to HexaGene Cloud...");

    const payload = {
      email: userEmail,
      ingest_token: INGEST_TOKEN,
      source: "qring_web_bluetooth",
      resting_heart_rate: metrics.heartRate,
      spo2: metrics.spo2,
      hrv: metrics.hrv,
      stress_score: metrics.fatigue,
      daily_steps: metrics.steps,
      calories_burned: metrics.calories,
      avg_sleep_hours: null,
      active_minutes: null,
    };

    // Remove null fields
    Object.keys(payload).forEach(k => payload[k] === null && delete payload[k]);

    try {
      const res = await fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExportSuccess(true);
      setPhase(PHASE.DONE);
      setStatusMsg("✓ Biomarkers synced to HexaGene Cloud!");
    } catch (err) {
      setPhase(PHASE.READY);
      setStatusMsg(`Export failed: ${err.message}`);
    }
  };

  // ─── Open Dashboard ───────────────────────────────────────────────────────
  const openDashboard = () => {
    window.open("https://hexagene-app.vercel.app/dashboard/simulations", "_blank");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const measureProgress = Math.min((measureTime / 60) * 100, 100);

  return (
    <div className="min-h-screen bg-health-bg pb-20">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-health-primary text-[10px] font-bold uppercase tracking-widest">
            <BluetoothSearching size={12} />
            QRing Live Connect
          </div>
          <h1 className="text-3xl font-heading font-black text-health-text">
            Connect <span className="text-health-primary">QRing</span>
          </h1>
          <p className="text-health-muted text-sm">
            One tap — real BLE → live biomarkers → AI analysis. No app install needed.
          </p>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${statusMsg.includes("failed") || statusMsg.includes("Failed") || phase === PHASE.ERROR
              ? "bg-red-50 border-red-100 text-red-600"
              : "bg-green-50 border-green-100 text-health-primary"
            }`}>
            {phase === PHASE.ERROR ? <AlertCircle size={16} /> : <Zap size={16} />}
            <span className="font-bold">{statusMsg}</span>
          </div>
        )}

        {/* Connect Card */}
        {phase === PHASE.IDLE || phase === PHASE.ERROR ? (
          <div className="health-card p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-health-primary/10 flex items-center justify-center">
              <Bluetooth size={40} className="text-health-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-health-text">Wear your QRing</h3>
              <p className="text-health-muted text-sm mt-1">
                Make sure the ring is on your finger and Bluetooth is enabled on this device.
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="btn-health-primary flex items-center gap-3 px-10 py-4 text-base"
            >
              <BluetoothSearching size={20} />
              Connect QRing
            </button>

            <div className="pt-4 border-t border-health-border w-full text-left">
              <details className="group">
                <summary className="text-[11px] font-black uppercase tracking-widest text-health-muted cursor-pointer hover:text-health-primary flex items-center gap-2">
                  <AlertCircle size={12} />
                  Device not showing up?
                </summary>
                <div className="mt-3 space-y-3 animate-fade-in">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      <span className="font-bold">1. Disconnect from other phones:</span> If your ring is currently connected to its official app or your other phone, it will <span className="font-bold">not</span> appear here. Turn off Bluetooth on your other phone temporarily.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      <span className="font-bold">2. Android Chrome Required:</span> Web Bluetooth works best in Chrome on Android. It is not supported in Safari on iPhone or regular browser apps on many devices.
                    </p>
                  </div>
                </div>
              </details>
            </div>

            <p className="text-[10px] text-health-muted">
              Works on Android Chrome · Desktop Chrome · Edge
            </p>
          </div>
        ) : null}

        {/* Connecting spinner */}
        {phase === PHASE.CONNECTING && (
          <div className="health-card p-10 flex flex-col items-center text-center space-y-4">
            <Loader2 size={48} className="text-health-primary animate-spin" />
            <p className="font-bold text-health-text">Scanning for QRing...</p>
            <p className="text-sm text-health-muted">Select your ring from the browser popup.</p>
          </div>
        )}

        {/* Connected + Measuring + Ready + Done */}
        {[PHASE.CONNECTED, PHASE.MEASURING, PHASE.READING, PHASE.READY, PHASE.EXPORTING, PHASE.DONE].includes(phase) && (
          <div className="space-y-6">

            {/* Device Info Bar */}
            <div className="health-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-health-primary/10 flex items-center justify-center">
                  <BluetoothConnected size={18} className="text-health-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-health-text">{deviceName ?? "QRing X6"}</p>
                  <p className="text-[10px] text-health-primary font-bold">● Connected</p>
                </div>
              </div>
              {battery && (
                <div className="flex items-center gap-2 text-health-muted">
                  <Battery size={14} className={battery.level < 20 ? "text-red-500" : "text-health-primary"} />
                  <span className="text-xs font-bold">{battery.level}%</span>
                  {battery.charging && <span className="text-[9px] text-green-500">⚡</span>}
                </div>
              )}
            </div>

            {/* Measurement Progress */}
            {phase === PHASE.MEASURING && (
              <div className="health-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-health-text">Measuring Biomarkers</p>
                  <span className="text-sm font-bold text-health-primary">{measureTime}s / 60s</span>
                </div>
                <div className="h-2 w-full bg-health-surface rounded-full overflow-hidden border border-health-border">
                  <div
                    className="h-full bg-health-primary transition-all duration-1000"
                    style={{ width: `${measureProgress}%` }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["Heart Rate", "SpO2", "HRV / Stress"].map(m => (
                    <span key={m} className="px-2 py-0.5 bg-green-50 border border-green-100 rounded-full text-[9px] font-bold text-health-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-health-primary rounded-full animate-pulse inline-block" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {phase === PHASE.READING && (
              <div className="health-card p-6 flex items-center gap-4">
                <Loader2 size={24} className="text-health-primary animate-spin flex-shrink-0" />
                <div>
                  <p className="font-bold text-health-text text-sm">Reading HRV data...</p>
                  <p className="text-[10px] text-health-muted">Fetching historical biomarker records from ring</p>
                </div>
              </div>
            )}

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricPill icon={Heart} label="Heart Rate" value={metrics.heartRate} unit="bpm" active={!!metrics.heartRate} color="text-red-500" />
              <MetricPill icon={Droplets} label="SpO2" value={metrics.spo2} unit="%" active={!!metrics.spo2} color="text-blue-500" />
              <MetricPill icon={Brain} label="HRV" value={metrics.hrv} unit="ms" active={!!metrics.hrv} color="text-purple-500" />
              <MetricPill icon={Activity} label="Stress" value={metrics.fatigue} unit="/100" active={!!metrics.fatigue} color="text-orange-500" />
              <MetricPill icon={Zap} label="Steps" value={metrics.steps?.toLocaleString()} unit="steps" active={!!metrics.steps} color="text-health-primary" />
              <MetricPill icon={Flame} label="Calories" value={metrics.calories} unit="kcal" active={!!metrics.calories} color="text-amber-500" />
              {metrics.temperature && (
                <MetricPill icon={Thermometer} label="Temp" value={metrics.temperature} unit="°C" active={!!metrics.temperature} color="text-cyan-500" />
              )}
            </div>

            {/* Export Button */}
            {phase === PHASE.READY && (
              <button
                onClick={handleExport}
                className="w-full btn-health-primary flex items-center justify-center gap-3 py-5 text-base"
              >
                <Upload size={20} />
                Export to HexaGene
              </button>
            )}

            {phase === PHASE.EXPORTING && (
              <div className="w-full flex items-center justify-center gap-3 py-5 bg-health-primary text-white rounded-2xl font-bold">
                <Loader2 size={20} className="animate-spin" />
                Uploading to HexaGene Cloud...
              </div>
            )}

            {/* Success state */}
            {phase === PHASE.DONE && (
              <div className="health-card p-8 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={36} className="text-health-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-health-text">Sync Complete!</h3>
                  <p className="text-sm text-health-muted mt-1">
                    Your QRing biomarkers are now on the HexaGene dashboard.
                  </p>
                </div>
                <button
                  onClick={openDashboard}
                  className="btn-health-primary flex items-center gap-2 px-8 py-4"
                >
                  Open Dashboard
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { setPhase(PHASE.READY); setExportSuccess(false); setStatusMsg(null); }}
                  className="text-[11px] text-health-muted hover:text-health-primary flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Measure Again
                </button>
              </div>
            )}

          </div>
        )}

        {/* How it works */}
        {phase === PHASE.IDLE && (
          <div className="health-card p-6 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-health-muted">How it works</h4>
            {[
              ["1", "Bluetooth", "Tap Connect → select your QRing from the browser popup"],
              ["2", "Measure", "Ring measures HR, SpO2, HRV, Stress for 60 seconds"],
              ["3", "Export", "Tap Export → data uploads to HexaGene Cloud instantly"],
              ["4", "Analyze", "Dashboard auto-fills → Run AI analysis → see results"],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-health-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <p className="text-xs font-black text-health-text">{title}</p>
                  <p className="text-[11px] text-health-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
