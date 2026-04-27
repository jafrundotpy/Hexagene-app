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
    { title: "Total Requests", value: metrics.total_requests },
    { title: "Avg Compute Time", value: metrics.avg_compute_time },
    { title: "Success Rate", value: metrics.success_rate },
    { title: "Errors Today", value: metrics.errors_today },
  ];

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "30px", marginBottom: "25px" }}>
        Usage Metrics
      </h1>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading metrics...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            {stats.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#111827",
                  padding: "22px",
                  borderRadius: "14px",
                  border: "1px solid #1f2937",
                }}
              >
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                  {item.title}
                </p>

                <h2 style={{ marginTop: "10px", fontSize: "26px" }}>
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#111827",
              padding: "25px",
              borderRadius: "14px",
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>
              Backend Observability Metrics
            </h2>

            <div style={{ lineHeight: "2" }}>
              <p>
                Requests with Blood Data: {metrics.blood_requests}
              </p>

              <p>
                Requests with Medications: {metrics.med_requests}
              </p>

              <p>
                Requests with Variants: {metrics.variant_requests}
              </p>

              <p>
                Average Variant Count: {metrics.avg_variant_count}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}