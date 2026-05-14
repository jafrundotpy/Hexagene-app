import React from 'react';
import { generateUserFriendlySummary } from '../../utils/userFriendlySummary';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Heart, 
  MessageSquare, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';

const UserFriendlySummary = ({ backendData }) => {
  const summary = generateUserFriendlySummary(backendData);

  if (!summary) return null;

  const getRiskColor = (classification) => {
    switch (classification) {
      case 'HIGH': return 'text-red-600';
      case 'MODERATE': return 'text-orange-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-slate-900';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />;
      case 'moderate': return <div className="w-2 h-2 rounded-full bg-orange-500" />;
      default: return <div className="w-2 h-2 rounded-full bg-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in mb-10">
      {/* Header */}
      <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-health-primary" size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Your Health Summary - At a Glance</h2>
        </div>
        <div className="px-4 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Patient Insights v1.0
        </div>
      </div>

      <div className="p-10 space-y-8">
        {/* Headline */}
        <div className={`p-6 rounded-3xl flex items-center gap-4 border ${
          backendData.position.classification === 'HIGH' ? 'bg-red-50 border-red-100' :
          backendData.position.classification === 'MODERATE' ? 'bg-orange-50 border-orange-100' :
          'bg-green-50 border-green-100'
        }`}>
          <h3 className={`text-2xl font-black tracking-tight ${getRiskColor(backendData.position.classification)}`}>
            {summary.headline}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* What This Means */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlertTriangle size={14} className="text-slate-400" />
              What This Means
            </h4>
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-3">
              {summary.what_this_means.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <p className="text-sm text-slate-600 font-medium">{item}</p>
                </div>
              ))}
              {summary.what_this_means.length === 0 && (
                <p className="text-sm text-slate-400 italic">No specific concerns identified.</p>
              )}
            </div>
          </div>

          {/* What You're Doing Well */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-health-primary" />
              What You're Doing Well
            </h4>
            <div className="bg-green-50/30 rounded-3xl p-6 border border-green-100 space-y-3">
              {summary.what_you_are_doing_well.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="text-health-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700 font-bold">{item}</p>
                </div>
              ))}
              {summary.what_you_are_doing_well.length === 0 && (
                <p className="text-sm text-slate-400 italic">Continue tracking to identify your strengths.</p>
              )}
            </div>
          </div>
        </div>

        {/* What You Can Do This Week */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Zap size={14} className="text-orange-500" />
            What You Can Do This Week
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.what_you_can_do.map((item, i) => (
              <div key={i} className="group bg-white border border-slate-100 rounded-3xl p-5 hover:border-health-primary transition-all flex items-start gap-4 shadow-sm hover:shadow-md">
                <div className="mt-1 flex-shrink-0">{getPriorityIcon(item.priority)}</div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 group-hover:text-health-primary transition-colors">{item.action}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Good News */}
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
              <Heart size={12} />
              Good News
            </h4>
            <p className="text-xs font-bold text-blue-900 leading-relaxed">{summary.good_news}</p>
          </div>

          {/* In Simple Words */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white lg:col-span-1 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-health-primary/10 blur-2xl -mr-8 -mt-8 group-hover:bg-health-primary/20 transition-all" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-health-primary mb-3 flex items-center gap-2 relative z-10">
              <MessageSquare size={12} />
              In Simple Words
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium relative z-10">{summary.simple_summary}</p>
          </div>

          {/* When to See a Doctor */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Stethoscope size={12} />
              When to See a Doctor
            </h4>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">{summary.doctor_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFriendlySummary;
