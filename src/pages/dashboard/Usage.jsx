import React from "react";

export default function Usage() {
  const stats = [
    { title: "Total Requests", value: "7,421" },
    { title: "Avg Compute Time", value: "1.8 ms" },
    { title: "Success Rate", value: "99.8%" },
    { title: "Errors Today", value: "3" },
  ];

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "30px", marginBottom: "25px" }}>
        Usage Metrics
      </h1>

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
          <p>Requests with Blood Data: 6,102</p>
          <p>Requests with Medications: 2,451</p>
          <p>Requests with Variants: 988</p>
          <p>Average Variant Count: 12</p>
        </div>
      </div>
    </div>
  );
}