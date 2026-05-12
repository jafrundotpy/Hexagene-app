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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mockBiomarkers = [
    { id: 1, term: "HbA1c Analysis", type: "biomarker", desc: "Core metabolic marker" },
    { id: 2, term: "Glucose Monitoring", type: "biomarker", desc: "Real-time sync" },
    { id: 3, term: "CRP (Inflammation)", type: "biomarker", desc: "Systemic stress" },
    { id: 4, term: "Lipid Profile", type: "biomarker", desc: "Cardiovascular risk" },
    { id: 5, term: "Oxidative Stress", type: "analysis", desc: "Hexa S21 Engine" },
    { id: 6, term: "Metabolic Risk", type: "analysis", desc: "Clinical stratification" },
    { id: 7, term: "QRing Sync", type: "device", desc: "Wearable integration" },
    { id: 8, term: "ExaScore Results", type: "diagnostic", desc: "Patient records" },
    { id: 9, term: "Cardiovascular Axis", type: "axis", desc: "Biological distribution" },
    { id: 10, term: "Patient: John Doe", type: "patient", desc: "ID: HXG-8821" },
    { id: 11, term: "Patient: Sarah Chen", type: "patient", desc: "ID: HXG-4432" },
  ];

  const searchResults = searchQuery.length > 1 
    ? mockBiomarkers.filter(b => b.term.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsSearching(true);
      // Mock loading feel
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  const notifications = [
    { id: 1, text: "Congratulations for registering hexagene welcome to our ecosystem", type: "welcome" },
    { id: 2, text: "check your hexa score and start your healthy life", type: "action" }
  ];

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

          <div className="hidden md:flex items-center gap-3 bg-health-surface px-4 py-2 rounded-xl border border-health-border w-96 relative">
            <Search size={18} className="text-health-muted" />
            <input 
              type="text" 
              placeholder="Search biomarkers, patients..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            
            {/* SEARCH RESULTS DROPDOWN */}
            {searchQuery.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-health-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="p-3 bg-health-surface/50 border-b border-health-border flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-health-muted">Search Results</span>
                  {isSearching && <RefreshCw size={12} className="animate-spin text-health-primary" />}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.length > 0 ? searchResults.map((res) => (
                    <div 
                      key={res.id} 
                      className="p-4 hover:bg-health-primary/5 cursor-pointer border-b border-health-border last:border-0 group transition-all"
                      onClick={() => {
                        setSearchQuery("");
                        navigate(res.type === 'patient' ? '/dashboard/analysis' : '/dashboard/simulations');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-health-text group-hover:text-health-primary transition-colors">{res.term}</p>
                          <p className="text-[10px] text-health-muted">{res.desc}</p>
                        </div>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-health-surface text-health-muted border border-health-border group-hover:border-health-primary/20 group-hover:text-health-primary transition-all">
                          {res.type}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-health-muted">No clinical matches found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 text-health-muted hover:bg-health-surface rounded-xl transition-all relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-health-secondary rounded-full border-2 border-white" />
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-health-border rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-health-border bg-health-surface/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-health-text">Notifications</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-health-border last:border-0 hover:bg-health-surface transition-colors">
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'welcome' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <p className="text-xs text-health-text leading-relaxed">{n.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="h-8 w-px bg-health-border mx-2" />
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-health-text leading-none group-hover:text-health-primary transition-colors">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-health-primary font-bold uppercase tracking-wider">Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-health-surface border border-health-border flex items-center justify-center text-health-muted group-hover:border-health-primary/50 group-hover:text-health-primary transition-all overflow-hidden relative">
                {user?.email?.[0].toUpperCase() || 'U'}
                <div className="absolute inset-0 bg-health-primary/0 group-hover:bg-health-primary/5 transition-colors" />
              </div>
            </div>

            {/* PROFILE DROPDOWN MENU */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white/80 backdrop-blur-xl border border-health-border rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                <div className="p-5 border-b border-health-border bg-health-surface/30">
                  <p className="text-xs font-black text-health-text truncate">{user?.email}</p>
                  <p className="text-[10px] text-health-muted font-bold">Enterprise Physician Account</p>
                </div>
                <div className="p-2">
                  {[
                    { label: "Profile", icon: <User size={14} /> },
                    { label: "Account Settings", icon: <Settings size={14} />, path: '/dashboard/settings' },
                    { label: "API Access", icon: <Key size={14} />, path: '/dashboard/api' },
                    { label: "Device Integrations", icon: <Activity size={14} />, path: '/dashboard/simulations' },
                    { label: "Security", icon: <Shield size={14} /> },
                    { label: "Clinical Reports", icon: <Book size={14} /> },
                    { label: "Support", icon: <Bell size={14} /> },
                  ].map((item, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-health-muted hover:text-health-primary hover:bg-health-primary/5 rounded-xl transition-all"
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (item.path) navigate(item.path);
                      }}
                    >
                      <span className="text-health-muted/50">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-health-border my-2 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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