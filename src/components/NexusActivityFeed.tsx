import React from 'react';
import { Activity, Shield, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const NexusActivityFeed: React.FC = () => {
  const { nexusActivities, setActiveModal } = useImperium();

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
              Nexus Activity Stream
            </span>
          </div>
          <button
            onClick={() => setActiveModal('LOGS')}
            className="text-[9px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#E5E5E5] flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Expand All</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Live Activity Items */}
        <div className="space-y-1.5">
          {nexusActivities.slice(0, 4).map((act) => (
            <div
              key={act.id}
              className="flex items-start justify-between p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] hover:border-[#2F2F31] transition-colors"
            >
              <div className="flex items-start gap-2 min-w-0 pr-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${act.status === 'IN_PROGRESS' ? 'bg-[#C5A059] animate-ping' : 'bg-[#4CAF50]'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-medium text-[#C5A059] truncate">
                    {act.actionText}
                  </span>
                  <span className="text-[10px] text-[#9A9A9A] leading-tight">
                    {act.detail}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#555] shrink-0 mt-0.5">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
