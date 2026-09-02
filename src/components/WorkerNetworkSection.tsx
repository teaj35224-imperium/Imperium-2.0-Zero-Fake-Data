import React from 'react';
import { Users, Activity, ShieldCheck, AlertTriangle, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { Worker } from '../types';

export const WorkerNetworkSection: React.FC = () => {
  const { workers, setSelectedWorker, setActiveModal, recoverWorker } = useImperium();

  const handleOpenWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setActiveModal('WORKER_DETAIL');
  };

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Users className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                Worker Network & Specialists
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                8 concurrent research desks supervised by Nexus Watchdog
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('WORKERS')}
            className="text-[9px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#E5E5E5] flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>View All (8)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {workers.map((w) => {
            const isQuarantined = w.health.status === 'QUARANTINED' || w.health.status === 'DEGRADED';
            return (
              <div
                key={w.id}
                id={`worker-card-${w.id}`}
                onClick={() => handleOpenWorker(w)}
                className={`p-3 rounded-sm border transition-all cursor-pointer active:scale-[0.99] touch-manipulation flex flex-col justify-between ${
                  isQuarantined
                    ? 'bg-[#FF5252]/5 border-[#FF5252]/40'
                    : 'bg-[#0D0D0E] border-[#1F1F21] hover:border-[#2F2F31]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-medium text-[#E5E5E5] uppercase truncate">
                        {w.name}
                      </span>
                      <span className="text-[9px] font-mono text-[#C5A059] uppercase">
                        {w.specialty}
                      </span>
                    </div>

                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-xs font-medium ${
                      w.health.status === 'ACTIVE' 
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                        : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                    }`}>
                      {w.health.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#9A9A9A] line-clamp-2 my-1.5 leading-snug">
                    {w.currentTask}
                  </p>
                </div>

                {/* Worker Telemetry Bar */}
                <div className="pt-2 mt-1 border-t border-[#1F1F21] flex items-center justify-between text-[9px] font-mono text-[#7A7A7A]">
                  <span>LATENCY: <strong className="text-[#D1D1D1]">{w.health.latencyMs}ms</strong></span>
                  <span>ACCURACY: <strong className="text-[#4CAF50]">{w.performance.accuracyRate}%</strong></span>
                  <span>BEAT: <strong className="text-[#C5A059]">{w.health.heartbeat}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
