import React, { useState } from 'react';
import { ArrowLeft, Users, RefreshCw, ShieldAlert, ShieldCheck, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const WorkerDetailModal: React.FC = () => {
  const { workers, selectedWorker, setActiveModal, recoverWorker, quarantineWorker } = useImperium();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryStepDisplay, setRecoveryStepDisplay] = useState<string | null>(null);

  const worker = selectedWorker || workers[0];

  if (!worker) {
    return (
      <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-4">
        <div className="p-4 rounded bg-neutral-900 text-center font-mono text-xs text-neutral-300">
          No worker selected.
          <button onClick={() => setActiveModal(null)} className="block mt-2 text-amber-400">Back</button>
        </div>
      </div>
    );
  }

  const handleRunRecovery = async () => {
    setIsProcessing(true);
    const steps = [
      'DETECT: Scanning worker state & heap...',
      'DIAGNOSE: Error analysis & telemetry audit...',
      'PRESERVE STATE: Archiving last-known good snapshot...',
      'SELF-REPAIR: Flushing stale socket buffers...',
      'VERIFY: Testing worker response...',
      'RESTART: Synchronizing with Nexus supervisor...'
    ];

    for (const step of steps) {
      setRecoveryStepDisplay(step);
      await new Promise(r => setTimeout(r, 200));
    }

    await recoverWorker(worker.id);
    setRecoveryStepDisplay('RECOVERY COMPLETE • STATUS: ACTIVE');
    setIsProcessing(false);
  };

  const handleToggleQuarantine = async () => {
    if (worker.health.status === 'QUARANTINED') {
      await recoverWorker(worker.id);
    } else {
      await quarantineWorker(worker.id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal('WORKERS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ALL WORKERS</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            DESK #{worker.id.toUpperCase()}
          </span>
        </div>

        {/* Worker Header Card */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#E5E5E5] uppercase">
                {worker.name}
              </h2>
              <div className="text-xs font-mono text-[#C5A059] font-medium mt-0.5 uppercase">
                {worker.specialty}
              </div>
            </div>

            <span className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-xs uppercase ${
              worker.health.status === 'ACTIVE' 
                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
            }`}>
              {worker.health.status}
            </span>
          </div>

          <div className="mt-3 p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#D1D1D1]">
            <strong className="text-[#7A7A7A] block text-[9px] uppercase tracking-wider mb-0.5">ASSIGNMENT:</strong>
            {worker.assignment}
          </div>
        </div>

        {/* Live Telemetry Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">LATENCY</span>
            <span className="text-[#E5E5E5] font-medium">{worker.health.latencyMs} ms</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">HEARTBEAT</span>
            <span className="text-[#C5A059] font-medium">{worker.health.heartbeat}</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">DATA FRESHNESS</span>
            <span className="text-[#4CAF50] font-medium">{worker.health.dataFreshness}</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">STRATEGY DRIFT</span>
            <span className="text-[#E5E5E5] font-medium">{worker.health.strategyDriftScore}/100</span>
          </div>
        </div>

        {/* Historical Accuracy & Performance */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Performance & Win Rate Audit
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">PROPOSALS SENT</span>
              <span className="text-[#E5E5E5] font-medium">{worker.performance.proposalsSent}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">APPROVED</span>
              <span className="text-[#4CAF50] font-medium">{worker.performance.proposalsApproved}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">WIN RATE</span>
              <span className="text-[#4CAF50] font-medium">{worker.performance.winRate}%</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">PROFIT FACTOR</span>
              <span className="text-[#C5A059] font-medium">{worker.performance.profitFactor}x</span>
            </div>
          </div>
        </div>

        {/* Nexus Supervisory Evaluation Memo */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-1 text-xs font-mono">
          <strong className="text-[#C5A059] block text-[10px] uppercase tracking-wider mb-0.5">NEXUS SUPERVISORY ASSESSMENT:</strong>
          <p className="text-[#D1D1D1] leading-relaxed">{worker.nexusEvaluation}</p>
        </div>

        {/* Recent Signals */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-4 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Recent Generated Signals
          </h3>
          <div className="space-y-1">
            {worker.recentSignals.map((sig, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#C5A059] font-medium">${sig.ticker}</span>
                  <span className="text-[#D1D1D1] truncate max-w-[200px] sm:max-w-none">{sig.signal}</span>
                </div>
                <span className="text-[#555]">{sig.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fault Tolerance & Recovery Controls */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center justify-between">
            <span>Fault-Tolerance & Supervisory Recovery</span>
            <span className="text-[9px] text-[#555] font-mono">BOUNDED RETRIES</span>
          </h3>

          {recoveryStepDisplay && (
            <div className="p-2.5 rounded-xs bg-[#C5A059]/10 border border-[#C5A059]/30 text-[10px] font-mono text-[#C5A059]">
              {recoveryStepDisplay}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRunRecovery}
              className="p-2.5 rounded-sm bg-[#C5A059] hover:bg-[#b08e4d] text-[#0D0D0E] font-mono font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow touch-manipulation cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>RUN RECOVERY SEQUENCE</span>
            </button>

            <button
              type="button"
              onClick={handleToggleQuarantine}
              className={`p-2.5 rounded-sm border font-mono font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all touch-manipulation cursor-pointer ${
                worker.health.status === 'QUARANTINED'
                  ? 'bg-[#4CAF50]/10 border-[#4CAF50]/40 text-[#4CAF50]'
                  : 'bg-[#0D0D0E] border-[#1F1F21] text-[#9A9A9A] hover:text-[#FF5252]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{worker.health.status === 'QUARANTINED' ? 'LIFT QUARANTINE' : 'QUARANTINE WORKER'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
