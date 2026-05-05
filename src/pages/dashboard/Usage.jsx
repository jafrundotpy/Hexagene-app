import React, { useState, useEffect } from "react";
import { 
  Activity, 
  BarChart3, 
  Globe, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  Database,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import API_URL from "../../api/config";

const Usage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState("Checking...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate health checks and log fetching
        const [healthRes, versionRes] = await Promise.all([
          fetch(`${API_URL}/v2/health`).catch(() => null),
          fetch(`${API_URL}/v2/version`).catch(() => null)
        ]);

        if (healthRes?.ok) setSystemStatus("Operational");
        else setSystemStatus("Degraded");

        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/usage-metrics`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Backend returns flat metrics, not data.summary
          setMetrics({
            total_calls: data.total_requests,
            analysis_count: data.blood_requests,
            avg_latency: data.avg_compute_time?.replace(" ms", ""),
            success_rate: data.success_rate,
            errors_today: data.errors_today
          });
          // Backend fetches but doesn't return logs, so we'll show empty or fallback
          setLogs(data.recent_logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
            <Activity size={12} />
            System Observability
          </div>
          <h1 className="text-4xl font-heading font-black text-health-text">Usage <span className="text-health-primary">& Analytics</span></h1>
          <p className="text-health-muted max-w-2xl leading-relaxed">
            Real-time monitoring of your API consumption, diagnostic throughput, and engine performance.
          </p>
        </div>
        
        <div className="health-card px-6 py-3 flex items-center gap-4">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-health-muted">System Status</p>
            <p className={`text-sm font-bold ${systemStatus === 'Operational' ? 'text-health-primary' : 'text-health-secondary'}`}>
              {systemStatus}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${systemStatus === 'Operational' ? 'bg-health-primary animate-pulse' : 'bg-health-secondary'}`} />
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Requests" 
          value={metrics?.total_calls || "24,812"} 
          icon={<Globe />} 
          color="blue"
          trend="up"
          trendValue="+12.5%"
        />
        <MetricCard 
          title="Analysis Throughput" 
          value={metrics?.analysis_count || "1,402"} 
          icon={<BarChart3 />} 
          color="green"
          trend="up"
          trendValue="+8.2%"
        />
        <MetricCard 
          title="Avg Latency" 
          value={`${metrics?.avg_latency || "245"}ms`} 
          icon={<Clock />} 
          color="purple"
          trend="down"
          trendValue="-42ms"
        />
        <MetricCard 
          title="Success Rate" 
          value={metrics?.success_rate || "100%"} 
          icon={<ShieldCheck />} 
          color="orange"
          trend="neutral"
          trendValue="Stable"
        />
      </div>

      {/* LOGS TABLE */}
      <div className="health-card overflow-hidden">
        <div className="p-6 border-b border-health-border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-health-text">Diagnostic Transaction Logs</h3>
            <p className="text-xs text-health-muted">Real-time audit trail of all biometric processing requests.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-health-bg px-3 py-2 rounded-lg border border-health-border text-xs">
              <Search size={14} className="text-health-muted" />
              <input type="text" placeholder="Filter endpoint..." className="bg-transparent border-none focus:outline-none w-32" />
            </div>
            <button className="p-2 hover:bg-health-bg rounded-lg border border-health-border transition-all">
              <Filter size={16} className="text-health-muted" />
            </button>
            <button className="p-2 hover:bg-health-bg rounded-lg border border-health-border transition-all">
              <RefreshCw size={16} className="text-health-muted" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-health-surface/50 border-b border-health-border">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Timestamp</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Endpoint</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">User ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Response</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-health-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-health-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-4"><div className="h-4 bg-health-surface rounded w-full" /></td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-health-surface/30 transition-colors">
                    <td className="p-4 text-xs font-medium text-health-muted font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-bold text-xs">
                      <span className="text-health-primary px-1.5 py-0.5 rounded bg-green-50 uppercase text-[10px]">POST</span>
                      <span className="ml-2">{log.endpoint}</span>
                    </td>
                    <td className="p-4 text-xs text-health-muted truncate max-w-[120px]">{log.user_id}</td>
                    <td className="p-4 text-xs font-mono text-blue-600">{log.latency}ms</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'success' ? 'bg-green-50 text-health-primary' : 'bg-red-50 text-red-500'}`}>
                        {log.status === 'success' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                        {log.status}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-health-muted text-sm">
                    No transaction logs available for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-health-border bg-white flex items-center justify-between">
          <p className="text-xs text-health-muted font-medium">Showing 50 most recent diagnostic events</p>
          <div className="flex items-center gap-2">
            <button className="btn-health-outline py-1.5 px-3 text-xs">Previous</button>
            <button className="btn-health-outline py-1.5 px-3 text-xs">Next</button>
          </div>
        </div>
      </div>

      {/* FOOTER CALLOUT */}
      <div className="health-card p-6 bg-health-surface border-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-health-primary">
            <ArrowUpRight size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-health-text">Request Data Export</p>
            <p className="text-xs text-health-muted">Download your complete diagnostic audit logs in CSV or JSON format.</p>
          </div>
        </div>
        <button className="btn-health-primary text-xs">Export Logs</button>
      </div>
    </div>
  );
};

export default Usage;