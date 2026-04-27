import React, { useState } from "react";

export default function IntegrationDocs() {
  const [copied, setCopied] = useState("");

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(
        typeof text === "string" ? text : JSON.stringify(text, null, 2)
      );
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const baseUrl = "https://hexagene-app.onrender.com";

  const requestExample = {
    patient_data: {
      crp: 1.6,
      hba1c: 5.8,
      albumin: 4.2,
      egfr: 90,
      rdw: 13.0,
      uric_acid: 5.0
    }
  };

  const responseExample = {
    success: true,
    risk_score: 67.5,
    axes: {
      inflammatory: 68,
      metabolic: 42,
      structural: 84,
      kinetic: 90,
      redox: 35,
      balance: 48
    },
    s21_state: "moderate",
    status: "Moderate"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Integration Details</h1>
          <p className="text-slate-400">
            Connect your platform to the HexaGene Health Intelligence API.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Base URL</h2>

          <div className="flex flex-col md:flex-row gap-3 justify-between bg-slate-950 rounded-xl p-4">
            <code className="text-green-400 break-all">{baseUrl}</code>

            <button
              onClick={() => copyText(baseUrl, "base")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500"
            >
              {copied === "base" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>

          <div className="bg-slate-950 rounded-xl p-4">
            <code className="text-green-400">x-api-key: YOUR_API_KEY</code>
          </div>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Main Endpoint</h2>

          <div className="bg-slate-950 rounded-xl p-4">
            <code className="text-green-400">POST /api/analyze</code>
          </div>
        </div>

        {/* Example Request */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Example Request</h2>

            <button
              onClick={() => copyText(requestExample, "request")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500"
            >
              {copied === "request" ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="bg-slate-950 rounded-xl p-4 text-sm overflow-x-auto text-green-400">
{JSON.stringify(requestExample, null, 2)}
          </pre>
        </div>

        {/* Example Response */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Example Response</h2>

          <pre className="bg-slate-950 rounded-xl p-4 text-sm overflow-x-auto text-green-400">
{JSON.stringify(responseExample, null, 2)}
          </pre>
        </div>

        {/* Error Codes */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Error Codes</h2>

          <div className="space-y-2 text-slate-300">
            <p>401 - Unauthorized</p>
            <p>403 - Forbidden</p>
            <p>429 - Too Many Requests</p>
            <p>500 - Internal Server Error</p>
          </div>
        </div>

        {/* Support */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Support</h2>

          <p className="text-slate-300">
            Need help integrating? Contact our support team for onboarding assistance.
          </p>
        </div>

      </div>
    </div>
  );
}