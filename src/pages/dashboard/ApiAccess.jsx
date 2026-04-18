import React, { useEffect, useState } from "react";

const ApiAccess = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.detail);
        }

        setData(result);

      } catch (err) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {data ? (
        <>
          <p>{data.message}</p>
          <p>{data.status}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ApiAccess;