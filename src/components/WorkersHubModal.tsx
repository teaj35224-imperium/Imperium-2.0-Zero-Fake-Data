import React from 'react';
import { ArrowLeft, Users, RefreshCw, ChevronRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const WorkersHubModal: React.FC = () => {
  const { workers, setSelectedWorker, setActiveModal, recoverWorker } = useImperium();

  const handleSelect = (w: any) => {
    setSelectedWorker(w);
    setActiveModal('WORKER_DETAIL');
  };

  const handleRecoverAll = async () => {
    for (const w of workers) {
      if (w.health.status !== 'ACTIVE') {
        await recoverWorker(w.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto py-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            ALL 8 SPECIALIST DESKS
          </span>
        </div>

        {/* Action Header */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-mono font-bold text-[#E5E5E5]">
              WORKER NETWORK
            </h2>
            <span className="text-xs font-mono text-[#7A7A7A]">
              Supervised research desks generating and scoring opportunities
            </span>
          </div>

          <button
            type="button"
            onClick={handleRecoverAll}
            className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] font-mono text-xs flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>PING / RECOVER ALL</span>
          </button>
        </div>

        {/* 8 Desks List */}
        <div className="space-y-2.5">
          {workers.map((w) => {
            const isAlert = w.health.status !== 'ACTIVE';
            return (
              <div
                key={w.id}
                onClick={() => handleSelect(w)}
                className={`p-3 rounded-xs border transition-all cursor-pointer active:scale-[0.99] touch-manipulation flex items-center justify-between ${
                  isAlert
                    ? 'bg-[#141416] border-[#FF5252]/40'
                    : 'bg-[#141416] border-[#1F1F21] hover:border-[#333]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#E5E5E5] uppercase">
                      {w.name}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-xs font-medium ${
                      w.health.status === 'ACTIVE' 
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                        : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                    }`}>
                      {w.health.status}
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-[#7A7A7A] mt-1 max-w-md">
                    {w.assignment}
                  </p>

                  <div className="flex items-center gap-3 text-[9px] font-mono text-[#555] mt-1.5">
                    <span>Beat: <strong className="text-[#9A9A9A]">{w.health.heartbeat}</strong></span>
                    <span>Latency: <strong className="text-[#9A9A9A]">{w.health.latencyMs}ms</strong></span>
                    <span>Win Rate: <strong className="text-[#4CAF50]">{w.performance.winRate}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#C5A059] text-xs font-mono">
                  <span>INSPECT</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
