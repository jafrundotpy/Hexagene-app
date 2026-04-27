import React, { useEffect, useState } from "react";
import {
  Cpu,
  Shield,
  Activity,
  Zap,
  Database,
  Gauge,
  Orbit,
  Sparkles,
} from "lucide-react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

const ClinicalAnalysis = () => {
  const [loaded, setLoaded] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    setLoaded(true);

    const timer = setInterval(() => {
      setPulse((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 45);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Cpu size={20} />,
      title: "HexaGene S21 Core",
      desc: "Deterministic biological computation engine built for structured clinical risk modeling.",
    },
    {
      icon: <Activity size={20} />,
      title: "6-Axis Analysis",
      desc: "Structural, inflammatory, metabolic, redox, kinetic, and balance system stress scoring.",
    },
    {
      icon: <Shield size={20} />,
      title: "Clinical Confidence",
      desc: "Transparent scoring outputs with explainable logic instead of black-box predictions.",
    },
    {
      icon: <Database size={20} />,
      title: "API Ready",
      desc: "Deploy through secure REST architecture with key auth, quotas, logs, and metrics.",
    },
    {
      icon: <Gauge size={20} />,
      title: "Low Latency",
      desc: "Fast compute pipeline optimized for real-time SaaS and enterprise integrations.",
    },
    {
      icon: <Zap size={20} />,
      title: "Scalable Infrastructure",
      desc: "Designed for healthcare platforms, labs, wellness apps, and enterprise systems.",
    },
  ];

  const metrics = [
    { label: "Engine Version", value: "v2.0.0" },
    { label: "Model Core", value: "S21" },
    { label: "Avg Compute", value: "1.8ms" },
    { label: "API Ready", value: "100%" },
  ];

  const axes = [
    { name: "Structural", val: 92 },
    { name: "Inflammatory", val: 84 },
    { name: "Metabolic", val: 88 },
    { name: "Redox", val: 81 },
    { name: "Kinetic", val: 79 },
    { name: "Balance", val: 85 },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 max-w-[1600px] mx-auto text-white relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full"></div>

      <DashboardHeader />

      {/* HERO */}
      <section
        className={`mt-8 transition-all duration-1000 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="border border-white/10 rounded-3xl p-8 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            <Sparkles size={16} />
            Clinical Intelligence Layer
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold mt-5 leading-tight">
            HexaGene S21
            <span className="block text-cyan-400">Biological Engine</span>
          </h1>

          <p className="text-slate-300 mt-5 text-lg max-w-3xl leading-8">
            Premium deterministic biological intelligence system built to score
            structured health data, quantify risk, and power enterprise-grade
            clinical products.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {metrics.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="text-slate-400 text-sm">{item.label}</p>
                <h3 className="text-2xl font-bold mt-2">{item.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE CORE */}
      <section className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Pulse Engine */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Orbit className="text-cyan-400" size={20} />
            <h2 className="text-2xl font-bold">Live Engine Core</h2>
          </div>

          <div className="relative flex items-center justify-center h-[320px]">
            <div className="absolute w-56 h-56 border border-cyan-400/20 rounded-full animate-spin"></div>
            <div className="absolute w-72 h-72 border border-cyan-400/10 rounded-full animate-pulse"></div>

            <div className="w-36 h-36 rounded-full bg-cyan-400/10 border border-cyan-400 flex items-center justify-center text-center">
              <div>
                <p className="text-xs text-slate-400">ENGINE LOAD</p>
                <h3 className="text-3xl font-bold">{pulse}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Axis */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-cyan-400" size={20} />
            <h2 className="text-2xl font-bold">6 Axis Intelligence</h2>
          </div>

          <div className="space-y-5">
            {axes.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{item.name}</span>
                  <span>{item.val}%</span>
                </div>

                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-bold mb-8">What Users Get</h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-black/20 p-6 hover:border-cyan-400/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-4">
                  {item.icon}
                </div>

                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 leading-7 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border border-white/10 rounded-3xl bg-white/[0.03] p-6 flex flex-col lg:flex-row justify-between gap-4 text-sm text-slate-400">
        <div>© 2026 HexaGene • Premium Biological Intelligence Platform</div>
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          Engine Stable • Enterprise Ready
        </div>
      </footer>
    </div>
  );
};

export default ClinicalAnalysis;