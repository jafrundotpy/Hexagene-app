import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 15000);

    return () => clearInterval(interval);
  }, []);

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

  const stats = [
    {
      title: "Total Requests",
      value: metrics.total_requests,
      icon: "📡",
      color: "#3b82f6",
    },
    {
      title: "Avg Compute Time",
      value: metrics.avg_compute_time,
      icon: "⚡",
      color: "#8b5cf6",
    },
    {
      title: "Success Rate",
      value: metrics.success_rate,
      icon: "✅",
      color: "#10b981",
    },
    {
      title: "Errors Today",
      value: metrics.errors_today,
      icon: "🚨",
      color: "#ef4444",
    },
  ];

  const observability = [
    {
      label: "Blood Requests",
      value: metrics.blood_requests,
      icon: "🩸",
    },
    {
      label: "Medication Requests",
      value: metrics.med_requests,
      icon: "💊",
    },
    {
      label: "Variant Requests",
      value: metrics.variant_requests,
      icon: "🧬",
    },
    {
      label: "Avg Variant Count",
      value: metrics.avg_variant_count,
      icon: "📊",
    },
  ];

  return (
    <div
      style={{
        padding: "32px",
        color: "white",
        background:
          "linear-gradient(180deg, #0b1120 0%, #111827 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "34px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Usage Metrics
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          Live operational analytics for your HexaGene API
        </p>
      </div>

      {loading ? (
        <div
          style={{
            color: "#94a3b8",
            fontSize: "16px",
          }}
        >
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {stats.map((item, index) => (
              <div
                key={index}
                style={{
                  background:
                    "rgba(17,24,39,0.9)",
                  border: `1px solid ${item.color}33`,
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.25)",
                  transition: "0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                    }}
                  >
                    {item.title}
                  </span>

                  <span
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    {item.icon}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    fontSize: "30px",
                    fontWeight: "700",
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Lower Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr",
              gap: "20px",
            }}
          >
            {/* Observability */}
            <div
              style={{
                background:
                  "rgba(17,24,39,0.92)",
                border:
                  "1px solid #1f2937",
                borderRadius: "18px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "20px",
                }}
              >
                Backend Observability
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: "16px",
                }}
              >
                {observability.map(
                  (item, i) => (
                    <div
                      key={i}
                      style={{
                        background:
                          "#0f172a",
                        padding: "18px",
                        borderRadius:
                          "14px",
                        border:
                          "1px solid #1e293b",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "20px",
                          marginBottom:
                            "10px",
                        }}
                      >
                        {item.icon}
                      </div>

                      <div
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "13px",
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          marginTop:
                            "8px",
                          fontSize:
                            "26px",
                          fontWeight:
                            "700",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Health Panel */}
            <div
              style={{
                background:
                  "rgba(17,24,39,0.92)",
                border:
                  "1px solid #1f2937",
                borderRadius: "18px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "20px",
                }}
              >
                System Health
              </h2>

              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginBottom:
                      "8px",
                  }}
                >
                  Success Ratio
                </p>

                <div
                  style={{
                    height: "10px",
                    background:
                      "#1e293b",
                    borderRadius:
                      "999px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      width:
                        metrics.success_rate,
                      height:
                        "100%",
                      background:
                        "#10b981",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "25px",
                  lineHeight: "2",
                  color: "#e5e7eb",
                }}
              >
                <div>
                  🟢 API Status:
                  Online
                </div>

                <div>
                  🔐 Auth Layer:
                  Secure
                </div>

                <div>
                  📈 Live Refresh:
                  15 sec
                </div>

                <div>
                  🚀 Engine:
                  HexaGene S21
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}