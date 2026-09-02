import React from 'react';
import { useImperium } from '../context/ImperiumContext';
import type { SystemStatusState } from '../types';

export const SystemStatusGrid: React.FC = () => {
  const { systemStatus, setActiveModal } = useImperium();

  const getStatusColor = (state: SystemStatusState) => {
    switch (state) {
      case 'ONLINE':
        return { dot: 'bg-[#4CAF50]', text: 'text-[#4CAF50]', border: 'border-[#1F1F21]' };
      case 'ACTIVE':
        return { dot: 'bg-[#C5A059]', text: 'text-[#C5A059]', border: 'border-[#1F1F21]' };
      case 'STANDBY':
        return { dot: 'bg-[#7A7A7A]', text: 'text-[#7A7A7A]', border: 'border-[#1F1F21]' };
      case 'CAUTION':
        return { dot: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'RECOVERY':
        return { dot: 'bg-[#C5A059] animate-ping', text: 'text-[#C5A059]', border: 'border-[#C5A059]/30' };
      case 'NOT CONNECTED':
        return { dot: 'bg-[#555]', text: 'text-[#555]', border: 'border-[#1F1F21]' };
      case 'ERROR':
      default:
        return { dot: 'bg-[#FF5252]', text: 'text-[#FF5252]', border: 'border-[#FF5252]/30' };
    }
  };

  const statusItems = [
    { label: 'NEXUS CORE', state: systemStatus.nexusCore, modal: 'NEXUS' as const },
    { label: 'MARKET DATA', state: systemStatus.marketData, modal: 'MARKETS' as const },
    { label: 'ALPACA PAPER', state: systemStatus.alpacaPaper, modal: 'SETTINGS' as const },
    { label: 'WORKER NETWORK', state: systemStatus.workerNetwork, modal: 'WORKERS' as const },
    { label: 'RISK ENGINE', state: systemStatus.riskEngine, modal: 'RISK' as const },
    { label: 'PORTFOLIO MONITOR', state: systemStatus.portfolioMonitor, modal: 'PORTFOLIO' as const },
    { label: 'DECISION ARCHIVE', state: systemStatus.decisionArchive, modal: 'DECISION_DETAIL' as const },
    { label: 'LEARNING ENGINE', state: systemStatus.learningEngine, modal: 'LEARNING' as const },
  ];

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            System Telemetry & Status
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#555]">
            Real-Time Supervision
          </span>
        </div>

        {/* 2x4 Grid of System States */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {statusItems.map((item, idx) => {
            const colors = getStatusColor(item.state);
            return (
              <button
                key={idx}
                id={`status-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => item.modal && setActiveModal(item.modal)}
                className={`flex items-center justify-between p-2 rounded-sm bg-[#0D0D0E] border ${colors.border} hover:border-[#2F2F31] active:scale-[0.98] transition-all text-left touch-manipulation`}
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-[#D1D1D1] truncate mr-1">
                  {item.label}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span className={`text-[8px] sm:text-[9px] font-mono font-medium ${colors.text}`}>
                    {item.state}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
