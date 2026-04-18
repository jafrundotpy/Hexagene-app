import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  Activity, 
  Binary, 
  Key, 
  LineChart, 
  Settings, 
  LogOut
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 🔥 IMPORTANT
    navigate('/login');
  };

  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <Logo 
          className="sidebar-logo" 
          size={24} 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', padding: '2rem' }} 
        />

        <nav className="sidebar-nav">
          <NavLink to="/dashboard/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={20} />
            <span>Clinical Analysis</span>
          </NavLink>

          <NavLink to="/dashboard/simulations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Binary size={20} />
            <span>Simulations</span>
          </NavLink>

          <NavLink to="/dashboard/api" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Key size={20} />
            <span>API Access</span>
          </NavLink>

          <NavLink to="/dashboard/usage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LineChart size={20} />
            <span>Usage</span>
          </NavLink>

          <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item" 
            onClick={handleLogout} 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">

        <header className="topbar">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <span className="user-name">Admin User</span>
          </div>
        </header>

        {/* 🔥 THIS RENDERS CHILD PAGE */}
        <div className="page-content">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;