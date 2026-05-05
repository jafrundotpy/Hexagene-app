import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut, 
  Trash2, 
  CheckCircle,
  Smartphone,
  Globe,
  Palette,
  Cloud,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-surface border border-health-border text-health-muted text-[10px] font-bold uppercase tracking-widest">
          <Shield size={12} />
          Account Management
        </div>
        <h1 className="text-4xl font-heading font-black text-health-text">Settings <span className="text-health-primary">& Privacy</span></h1>
        <p className="text-health-muted max-w-2xl">Manage your clinical profile, security protocols, and subscription preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'profile', label: 'Clinical Profile', icon: <User size={18} /> },
            { id: 'security', label: 'Security & Access', icon: <Shield size={18} /> },
            { id: 'notifications', label: 'Alerts', icon: <Bell size={18} /> },
            { id: 'billing', label: 'Plan & Billing', icon: <CreditCard size={18} /> },
            { id: 'appearance', label: 'Interface', icon: <Palette size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all
                ${activeTab === tab.id 
                  ? 'bg-health-primary text-white shadow-lg shadow-green-100' 
                  : 'text-health-muted hover:text-health-text hover:bg-white'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-health-border">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-9">
          <div className="health-card p-10 animate-fade-in border-none shadow-xl shadow-gray-100">
            
            {activeTab === 'profile' && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-10 pb-10 border-b border-health-border">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-3xl bg-health-surface flex items-center justify-center text-4xl font-black text-health-primary border-4 border-white shadow-health">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-health-border rounded-xl text-health-muted hover:text-health-primary shadow-lg transition-all">
                      <Smartphone size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h3 className="text-2xl font-black text-health-text">{user?.email?.split('@')[0] || 'User Name'}</h3>
                    <p className="text-sm font-medium text-health-muted">{user?.email}</p>
                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-health-primary text-[10px] font-black uppercase tracking-widest border border-green-100">Professional</span>
                      <span className="px-3 py-1 rounded-full bg-health-surface text-health-muted text-[10px] font-black uppercase tracking-widest">S21 Engine V2</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.email?.split('@')[0]} 
                      className="input-health w-full bg-health-surface border-transparent focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        disabled
                        value={user?.email || ''} 
                        className="input-health w-full opacity-60 cursor-not-allowed bg-health-surface border-transparent"
                      />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-health-muted/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Primary Language</label>
                    <select className="input-health w-full appearance-none bg-health-surface border-transparent focus:bg-white">
                      <option>English (US)</option>
                      <option>German (DE)</option>
                      <option>French (FR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-health-muted ml-1">Clinical Timezone</label>
                    <select className="input-health w-full appearance-none bg-health-surface border-transparent focus:bg-white">
                      <option>UTC-08:00 (Pacific Time)</option>
                      <option>UTC+00:00 (GMT)</option>
                      <option>UTC+01:00 (CET)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 border-t border-health-border flex justify-end gap-4">
                  <button className="btn-health-outline px-10 py-3 text-xs uppercase tracking-widest">Reset</button>
                  <button 
                    onClick={handleSave}
                    className="btn-health-primary px-12 py-3 text-xs uppercase tracking-widest"
                  >
                    {saved ? <><CheckCircle size={16} /> Saved</> : 'Update Profile'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-health-text">Security Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-health-surface rounded-2xl flex items-center justify-between border border-health-border/50">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-xl text-health-primary shadow-sm">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-health-text uppercase tracking-widest">Two-Factor Authentication</p>
                          <p className="text-xs text-health-muted font-medium mt-1">Multi-layered account protection via SMS or Auth App.</p>
                        </div>
                      </div>
                      <button className="text-xs font-black text-health-primary hover:underline uppercase tracking-widest">Enable</button>
                    </div>

                    <div className="p-6 bg-health-surface rounded-2xl flex items-center justify-between border border-health-border/50">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-health-text uppercase tracking-widest">Device Management</p>
                          <p className="text-xs text-health-muted font-medium mt-1">You have 2 active diagnostic sessions across your devices.</p>
                        </div>
                      </div>
                      <button className="text-xs font-black text-health-muted hover:text-health-text uppercase tracking-widest">Manage</button>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-health-border space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-red-500">Danger Zone</h3>
                    <p className="text-xs text-health-muted font-medium leading-relaxed">
                      Permanently terminate your Exagin account and purge all associated biological markers and laboratory data from our systems. <strong>This action cannot be undone.</strong>
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all text-xs font-black uppercase tracking-widest">
                    <Trash2 size={18} />
                    Delete Clinical Data & Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-fade-in">
                <div className="p-6 bg-health-surface rounded-full text-health-muted/30">
                  <CreditCard size={64} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-health-text">Infrastructure in Beta</h3>
                  <p className="text-sm text-health-muted max-w-sm mx-auto font-medium leading-relaxed">
                    Subscription management is currently disabled for the Beta release. All professional clinical modules are available at no cost.
                  </p>
                </div>
                <button className="btn-health-outline text-[10px] font-black uppercase tracking-widest px-8">Notify me on Launch</button>
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'billing' && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-fade-in">
                <div className="p-6 bg-health-surface rounded-full text-health-muted/30">
                  <Palette size={64} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-health-text">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                  <p className="text-sm text-health-muted max-w-sm mx-auto font-medium">This configuration area is currently under clinical review.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
