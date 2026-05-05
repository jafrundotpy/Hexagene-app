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
  Cloud
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
        <h1 className="text-4xl font-heading font-bold">Account <span className="text-gradient">Settings</span></h1>
        <p className="text-white/50">Manage your profile, security preferences, and API subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={18} /> },
            { id: 'security', label: 'Security', icon: <Shield size={18} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
            { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-hexa-primary text-white shadow-lg shadow-hexa-primary/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-hexa-danger hover:bg-hexa-danger/10 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-9">
          <div className="glass-card p-8 border-white/5 animate-fade-in">
            
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-hexa-primary to-hexa-secondary flex items-center justify-center text-4xl font-black">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-hexa-card border border-white/10 rounded-lg text-white/60 hover:text-hexa-primary transition-colors">
                      <Smartphone size={14} />
                    </button>
                  </div>
                  <div className="text-center md:text-left space-y-1">
                    <h3 className="text-xl font-bold">{user?.email?.split('@')[0] || 'User Name'}</h3>
                    <p className="text-sm text-white/40">{user?.email}</p>
                    <div className="flex gap-2 mt-3 justify-center md:justify-start">
                      <span className="px-2 py-0.5 rounded bg-hexa-primary/10 text-hexa-primary text-[10px] font-bold uppercase tracking-widest">Developer</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Pro Tier</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Display Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.email?.split('@')[0]} 
                      className="input-hexa w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        disabled
                        value={user?.email || ''} 
                        className="input-hexa w-full opacity-50 cursor-not-allowed"
                      />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Preferred Language</label>
                    <select className="input-hexa w-full appearance-none">
                      <option>English (US)</option>
                      <option>German</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Timezone</label>
                    <select className="input-hexa w-full appearance-none">
                      <option>UTC-08:00 (Pacific Time)</option>
                      <option>UTC+00:00 (GMT)</option>
                      <option>UTC+01:00 (CET)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button className="btn-outline px-6 py-2.5 text-xs">Reset</button>
                  <button 
                    onClick={handleSave}
                    className="btn-premium px-8 py-2.5 text-xs flex items-center gap-2"
                  >
                    {saved ? <><CheckCircle size={14} /> Saved</> : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Security Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-hexa-primary/10 rounded-lg text-hexa-primary">
                          <Lock size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Two-Factor Authentication</p>
                          <p className="text-[10px] text-white/40">Secure your account with 2FA via authenticator app.</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-hexa-primary hover:underline">Enable</button>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-hexa-accent/10 rounded-lg text-hexa-accent">
                          <Cloud size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Active Sessions</p>
                          <p className="text-[10px] text-white/40">You are currently logged in from 2 devices.</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-white/40 hover:text-white">Manage</button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-hexa-danger">Danger Zone</h3>
                    <p className="text-xs text-white/40">Permanently delete your account and all associated biological data.</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-hexa-danger/10 text-hexa-danger border border-hexa-danger/20 hover:bg-hexa-danger/20 transition-all text-xs font-bold">
                    <Trash2 size={16} />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full text-white/20">
                  <CreditCard size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Billing Infrastructure Offline</h3>
                  <p className="text-sm text-white/40 max-w-sm mx-auto">This module is currently disabled for the Beta release. All features are free during this period.</p>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'billing' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full text-white/20">
                  <Globe size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h3>
                  <p className="text-sm text-white/40">This configuration module is coming soon.</p>
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
