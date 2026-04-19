import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ClinicalAnalysis from './pages/dashboard/ClinicalAnalysis';
import Simulations from './pages/dashboard/Simulations';
import ApiAccess from './pages/dashboard/ApiAccess';

// 🔐 PROTECTED ROUTE (TOKEN BASED)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // 🔥 If no token → go login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🔓 PUBLIC ROUTE (Prevent logged-in users from going back to login)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard/analysis" replace />;
  }

  return children;
};

// Placeholder Page
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: "20px", color: "white" }}>
    <h1>{title}</h1>
    <p>This module is under development.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>

        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />

        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthPage mode="login" />
            </PublicRoute>
          } 
        />

        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <AuthPage mode="signup" />
            </PublicRoute>
          } 
        />

        {/* 🔐 DASHBOARD ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* 🔥 Default route */}
          <Route index element={<Navigate to="/dashboard/analysis" replace />} />

          {/* Main Pages */}
          <Route path="analysis" element={<ClinicalAnalysis />} />
          <Route path="api" element={<ApiAccess />} />

          {/* Extra */}
          <Route path="simulations" element={<Simulations />} />
          <Route path="usage" element={<PlaceholderPage title="Usage Metrics" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        {/* ❌ CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;