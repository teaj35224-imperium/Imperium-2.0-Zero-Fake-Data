import React from 'react';
import { Zap, Archive, BookOpen, Users, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const NexusOperationsBar: React.FC = () => {
  const { setActiveModal, opportunities, humanEscalations } = useImperium();
  const pendingGotOnes = opportunities.filter(o => o.status === 'PENDING_NEXUS').length;
  const activeEscalations = humanEscalations.filter(e => !e.isResolved).length;

  const ops = [
    {
      id: 'op-activity',
      label: 'CURRENT ACTIVITY',
      icon: Clock,
      modal: 'LOGS' as const,
      badge: null,
      color: 'border-[#1F1F21] text-[#E5E5E5] hover:border-[#C5A059]/40'
    },
    {
      id: 'op-got-one',
      label: 'GOT ONE',
      icon: Zap,
      modal: 'GOT_ONE_DETAIL' as const,
      badge: pendingGotOnes > 0 ? `${pendingGotOnes} NEW` : null,
      badgeStyle: 'bg-[#C5A059] text-[#0D0D0E] font-bold',
      color: 'border-[#C5A059]/40 text-[#C5A059] bg-[#C5A059]/5'
    },
    {
      id: 'op-action-req',
      label: 'ACTION REQUIRED',
      icon: AlertTriangle,
      modal: 'ACTION_REQUIRED' as const,
      badge: activeEscalations > 0 ? `${activeEscalations} ALERT` : null,
      badgeStyle: 'bg-[#FF5252] text-[#0D0D0E] font-bold',
      color: activeEscalations > 0 ? 'border-[#FF5252]/50 text-[#FF5252] bg-[#FF5252]/10' : 'border-[#1F1F21] text-[#7A7A7A]'
    },
    {
      id: 'op-learning',
      label: 'LEARNING',
      icon: BookOpen,
      modal: 'LEARNING' as const,
      badge: '96.4%',
      badgeStyle: 'bg-[#141416] text-[#4CAF50] border border-[#4CAF50]/30',
      color: 'border-[#1F1F21] text-[#D1D1D1] hover:border-[#2F2F31]'
    },
    {
      id: 'op-workers',
      label: 'WORKER REPORTS',
      icon: Users,
      modal: 'WORKERS' as const,
      badge: '8 ONLINE',
      badgeStyle: 'bg-[#1F1F21] text-[#C5A059]',
      color: 'border-[#1F1F21] text-[#D1D1D1] hover:border-[#2F2F31]'
    },
    {
      id: 'op-archive',
      label: 'DECISION ARCHIVE',
      icon: Archive,
      modal: 'DECISION_DETAIL' as const,
      badge: 'APP+REJ',
      badgeStyle: 'bg-[#1F1F21] text-[#9A9A9A]',
      color: 'border-[#1F1F21] text-[#D1D1D1] hover:border-[#2F2F31]'
    }
  ];

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Nexus Operations
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#555]">
            Touch to Open Interface
          </span>
        </div>

        {/* Scrollable / Grid of Nested Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ops.map(op => {
            const Icon = op.icon;
            return (
              <button
                key={op.id}
                id={`nexus-op-${op.id}`}
                type="button"
                onClick={() => setActiveModal(op.modal)}
                className={`relative flex items-center justify-between p-2.5 rounded-sm bg-[#0D0D0E] border ${op.color} hover:bg-[#141416] active:scale-[0.97] transition-all text-left touch-manipulation`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" />
                  <span className="text-[10px] font-mono tracking-wider font-medium truncate">
                    {op.label}
                  </span>
                </div>

                {op.badge && (
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-xs ml-1 shrink-0 ${op.badgeStyle}`}>
                    {op.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
