import React, { useEffect, useState } from "react";
import {
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Server,
  Clock,
  Database,
  BarChart3,
  RefreshCw,
  Cpu,
  Info,
  Layers,
  ChevronRight,
  Loader2,
  Shield
} from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import API_URL from "../../api/config";

export default function Usage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_requests: 0,
    avg_compute_time: "0 ms",
    success_rate: "0%",
    errors_today: 0,
    blood_requests: 0,
    med_requests: 0,
    variant_requests: 0,
    avg_variant_count: 0,
  });

  const [healthData, setHealthData] = useState({ status: "offline" });
  const [versionData, setVersionData] = useState({ version: "...", engine: "Loading...", ready: false });

  useEffect(() => {
    fetchMetrics();
    fetchSystemStatus();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchSystemStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const [healthRes, versionRes] = await Promise.all([
        fetch(`${API_URL}/v2/health`).catch(() => null),
        fetch(`${API_URL}/v2/version`).catch(() => null)
      ]);

      if (healthRes && healthRes.ok) {
        const hData = await healthRes.json();
        setHealthData(hData);
      } else {
        setHealthData({ status: "offline" });
      }

      if (versionRes && versionRes.ok) {
        const vData = await versionRes.json();
        setVersionData(vData);
      }
    } catch (error) {
      console.error("Failed to load system status:", error);
      setHealthData({ status: "offline" });
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/usage-metrics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to load usage metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hexa-primary/10 border border-hexa-primary/20 text-hexa-primary text-[10px] font-bold uppercase tracking-widest">
            <BarChart3 size={12} />
            Operations & Analytics
          </div>
          <h1 className="text-4xl font-heading font-bold">Usage <span className="text-gradient">Metrics</span></h1>
          <p className="text-white/50 max-w-2xl">
            Real-time operational visibility into the HexaGene engine, infrastructure health, and processing throughput.
          </p>
        </div>
        
        <div className="flex items-center gap-3 glass-card px-4 py-2 bg-white/[0.02]">
          <RefreshCw size={14} className={`text-white/40 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Auto-refresh: 15s</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={48} className="text-hexa-primary animate-spin" />
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Metrics</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          
          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total API Calls"
              value={metrics.total_requests.toLocaleString()}
              unit="Requests"
              color="primary"
              icon={<Activity size={24} />}
            />
            <MetricCard 
              title="Avg Compute Time"
              value={metrics.avg_compute_time.replace(' ms', '')}
              unit="ms"
              color="accent"
              icon={<Zap size={24} />}
            />
            <MetricCard 
              title="Global Success Rate"
              value={metrics.success_rate.replace('%', '')}
              unit="%"
              color="success"
              icon={<CheckCircle size={24} />}
            />
            <MetricCard 
              title="Error Incident Count"
              value={metrics.errors_today}
              unit="Today"
              color={metrics.errors_today > 0 ? "danger" : "secondary"}
              icon={<AlertCircle size={24} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* OBSERVABILITY PANEL */}
            <div className="lg:col-span-8 space-y-8">
              <div className="glass-card p-8 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-hexa-secondary/10 rounded-lg text-hexa-secondary">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold">Inbound Traffic Distribution</h3>
                      <p className="text-xs text-white/40">Request volume breakdown by clinical data type</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Biomarker Panels', value: metrics.blood_requests, icon: '🩸', sub: 'Comprehensive blood panels' },
                    { label: 'Medication Sync', value: metrics.med_requests, icon: '💊', sub: 'Pharmacogenetic filtering' },
                    { label: 'Genetic Variants', value: metrics.variant_requests, icon: '🧬', sub: 'Raw S21 genomic mapping' },
                    { label: 'Avg Variant Load', value: metrics.avg_variant_count, icon: '📊', sub: 'Data points per request' },
                  ].map((item) => (
                    <div key={item.label} className="group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-tighter">{item.sub}</p>
                          </div>
                        </div>
                        <span className="text-xl font-black text-white/80 group-hover:text-hexa-primary transition-colors">{item.value}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-hexa-primary rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-hexa-accent/10 rounded-lg text-hexa-accent">
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold">Data Sovereignty</h3>
                    <p className="text-xs text-white/40">Infrastructure and region status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-[10px]">US</div>
                      <span className="text-sm">Primary Cluster (us-east-1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-hexa-success" />
                      <span className="text-xs font-bold text-hexa-success uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-[10px]">EU</div>
                      <span className="text-sm">Secondary Cluster (eu-west-1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Standby</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM HEALTH SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-hexa-card to-white/[0.02]">
                <h3 className="font-heading font-bold mb-6 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-hexa-success" />
                  System Integrity
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-white/40">Availability Ratio</span>
                      <span className="text-hexa-success">{metrics.success_rate}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-hexa-success rounded-full" style={{ width: metrics.success_rate }} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <Server size={14} className="text-white/40" />
                        <span className="text-white/60">API Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${healthData?.status === "ok" ? "bg-hexa-success animate-pulse" : "bg-hexa-danger"}`} />
                        <span className={`font-bold text-[10px] uppercase tracking-widest ${healthData?.status === "ok" ? "text-hexa-success" : "text-hexa-danger"}`}>
                          {healthData?.status === "ok" ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <Cpu size={14} className="text-white/40" />
                        <span className="text-white/60">Engine</span>
                      </div>
                      <span className="text-xs font-mono text-hexa-primary">{versionData?.engine || "HexaGene S21"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <Info size={14} className="text-white/40" />
                        <span className="text-white/60">Version</span>
                      </div>
                      <span className="text-xs font-mono text-white/40">{versionData?.version || "1.0.4-stable"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <Clock size={14} className="text-white/40" />
                        <span className="text-white/60">Sync Frequency</span>
                      </div>
                      <span className="text-xs font-bold text-white/40">15 SEC</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 btn-outline flex items-center justify-between py-3 px-4">
                  <span className="text-xs font-bold uppercase tracking-widest">Full Status Page</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="p-6 bg-hexa-secondary/5 border border-hexa-secondary/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-3 text-hexa-secondary">
                  <Shield size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">Compliance</h4>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-tight">
                  All requests are processed in HIPAA-compliant isolated environments. No patient-identifiable information (PII) is persisted within the scoring engine logs.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
        <div className="flex items-center gap-4">
          <span>Infrastructure Status: Normal</span>
          <span className="w-1 h-1 bg-hexa-success rounded-full" />
          <span>S21 Grid Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors">API Uptime</button>
          <button className="hover:text-white transition-colors">Incident History</button>
        </div>
      </footer>
    </div>
  );
}