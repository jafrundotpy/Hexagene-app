import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Binary,
  Key,
  LineChart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronRight,
  Book,
  Search
} from 'lucide-react';

import ErrorBanner from '../components/UI/ErrorBanner';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Simulations', path: '/dashboard/simulations', icon: <Activity size={20} /> },
    { name: 'Clinical Analysis', path: '/dashboard/analysis', icon: <Binary size={20} /> },
    { name: 'API Access', path: '/dashboard/api', icon: <Key size={20} /> },
    { name: 'Usage', path: '/dashboard/usage', icon: <LineChart size={20} /> },
    { name: 'Integration Docs', path: '/dashboard/docs', icon: <Book size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-health-bg flex">
      <ErrorBanner message={globalError} onClose={() => setGlobalError(null)} />
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-health-border sticky top-0 h-screen">
        <div className="p-8">
          <Logo size={36} />
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                sidebar-link
                ${isActive 
                  ? 'bg-green-50 text-health-primary' 
                  : 'text-health-muted hover:bg-gray-50 hover:text-health-text'}
              `}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.path === window.location.pathname && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-health-primary" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-health-surface rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-health-border flex items-center justify-center font-bold text-health-primary">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-health-text truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-health-muted truncate">Pro Plan</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-health-border flex items-center justify-between px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-health-text"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-3 bg-health-surface px-4 py-2 rounded-xl border border-health-border w-96">
            <Search size={18} className="text-health-muted" />
            <input 
              type="text" 
              placeholder="Search biomarkers, patients..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-health-muted hover:bg-health-surface rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-health-secondary rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-health-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-health-text leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-health-primary font-bold uppercase tracking-wider">Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-health-surface border border-health-border flex items-center justify-center text-health-muted">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-fade-in">
            <div className="p-8 flex justify-between items-center">
              <Logo size={32} />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="px-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    sidebar-link
                    ${isActive 
                      ? 'bg-green-50 text-health-primary' 
                      : 'text-health-muted hover:bg-gray-50'}
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;