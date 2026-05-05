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
  Book
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.name || localStorage.getItem('userName') || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: "/dashboard/simulations", icon: <Binary size={20} />, label: "Simulations" },
    { to: "/dashboard/analysis", icon: <Activity size={20} />, label: "Clinical Analysis" },
    { to: "/dashboard/api", icon: <Key size={20} />, label: "API Access" },
    { to: "/dashboard/docs", icon: <Book size={20} />, label: "Integration Docs" },
    { to: "/dashboard/usage", icon: <LineChart size={20} />, label: "Usage" },
    { to: "/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-hexa-deep flex text-white overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-hexa-panel border-r border-white/5 
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <Logo size={28} />
              <span className="text-xl font-heading font-bold tracking-tight">Hexa<span className="text-hexa-primary">Gene</span></span>
            </div>
            <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-hexa-primary/10 text-hexa-primary border border-hexa-primary/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'}
                `}
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-hexa-danger hover:bg-hexa-danger/10 transition-all duration-200 w-full group"
              onClick={handleLogout}
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-hexa-deep/50 backdrop-blur-md sticky top-0 z-30">
          <button className="lg:hidden p-2 text-white/60 hover:text-white bg-white/5 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <button className="p-2.5 text-white/50 hover:text-hexa-primary hover:bg-hexa-primary/10 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-hexa-accent rounded-full border-2 border-hexa-deep" />
            </button>

            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Pro Member</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hexa-secondary to-hexa-primary flex items-center justify-center font-bold text-hexa-deep shadow-lg">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* BACKGROUND DECORATION */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-hexa-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-hexa-secondary/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
      </div>
    </div>
  );
};

export default DashboardLayout;