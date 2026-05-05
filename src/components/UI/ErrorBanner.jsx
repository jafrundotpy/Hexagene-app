import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6 animate-fade-in">
      <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-red-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black uppercase tracking-widest opacity-80">System Alert</p>
            <p className="text-sm font-bold leading-tight">{message}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
