import React from 'react';
import { Briefcase, Cpu, Sliders, TrendingUp, Users, ShieldAlert, DollarSign, Activity, FileText } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const PrimaryTouchBar: React.FC = () => {
  const { setActiveModal, portfolio, riskLimits, workers, opportunities } = useImperium();
  const pendingCount = opportunities.filter(o => o.status === 'PENDING_NEXUS').length;
  const activeWorkersCount = workers.filter(w => w.health.status === 'ACTIVE').length;
  const totalWorkersCount = workers.length;

  return (
    <div className="relative z-10 w-full px-4 mb-3 max-w-4xl mx-auto space-y-2">
      {/* Top Row: The 3 Big Primary Touch Controls */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* 1. PORTFOLIO / MONEY */}
        <button
          id="touch-btn-portfolio"
          type="button"
          onClick={() => setActiveModal('MONEY' as any)}
          className="group relative flex flex-col items-start justify-between p-3.5 rounded-xl bg-[#141416] border border-amber-500/30 hover:border-amber-500 active:bg-[#1A1A1D] active:scale-[0.98] transition-all touch-manipulation text-left overflow-hidden shadow-lg shadow-black/40"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-400 flex items-center gap-1.5 font-bold">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Where's My Money
            </span>
            <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-sm ${portfolio.dayChange >= 0 ? 'text-[#4CAF50] bg-[#4CAF50]/10' : 'text-[#FF5252] bg-[#FF5252]/10'}`}>
              {portfolio.dayChange >= 0 ? '+' : ''}{portfolio.dayChangePercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full mt-2.5">
            <div className="font-serif text-lg sm:text-xl text-[#E5E5E5] tracking-tight truncate font-bold">
              ${portfolio.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#7A7A7A] truncate mt-0.5">
              ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })} Cash Reserves
            </div>
          </div>
        </button>

        {/* 2. NEXUS CORE & GOT ONE */}
        <button
          id="touch-btn-nexus"
          type="button"
          onClick={() => setActiveModal('NEXUS')}
          className="group relative flex flex-col items-start justify-between p-3.5 rounded-xl bg-gradient-to-b from-[#181510] to-[#141416] border border-[#C5A059]/50 hover:border-[#C5A059] active:bg-[#1A1A1D] active:scale-[0.98] transition-all touch-manipulation text-left overflow-hidden shadow-lg shadow-amber-500/5"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#C5A059]" />
              Nexus Core
            </span>
            {pendingCount > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#C5A059] text-[#0D0D0E] font-black animate-pulse">
                {pendingCount} GOT 1
              </span>
            )}
          </div>

          <div className="w-full mt-2.5">
            <div className="font-serif italic text-lg sm:text-xl text-[#E5E5E5] tracking-tight truncate font-bold">
              Chief-of-Staff
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#7A7A7A] truncate mt-0.5">
              13 Specialist Workers
            </div>
          </div>
        </button>

        {/* 3. LIVE OPERATIONS FLOOR */}
        <button
          id="touch-btn-live-ops"
          type="button"
          onClick={() => setActiveModal('LIVE_OPERATIONS' as any)}
          className="group relative flex flex-col items-start justify-between p-3.5 rounded-xl bg-[#141416] border border-[#1F1F21] hover:border-amber-500/40 active:bg-[#1A1A1D] active:scale-[0.98] transition-all touch-manipulation text-left overflow-hidden shadow-lg shadow-black/40"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Live Ops Floor
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
              LIVE
            </span>
          </div>

          <div className="w-full mt-2.5">
            <div className="font-serif text-lg sm:text-xl text-[#E5E5E5] tracking-tight truncate font-bold">
              Trade Supervisor
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#7A7A7A] truncate mt-0.5">
              {portfolio.positions.length} Active Positions
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Direct Access Bar: MARKETS | WORKERS | DAILY BRIEF | RISK */}
      <div className="grid grid-cols-4 gap-2">
        <button
          id="touch-quick-markets"
          type="button"
          onClick={() => setActiveModal('MARKETS')}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#141416] border border-[#1F1F21] hover:border-[#C5A059]/40 text-[10px] uppercase tracking-[0.12em] font-medium text-[#D1D1D1] hover:text-[#E5E5E5] active:scale-[0.97] transition-all touch-manipulation truncate"
        >
          <TrendingUp className="w-3 h-3 text-[#C5A059] shrink-0" />
          <span className="truncate">Markets</span>
        </button>

        <button
          id="touch-quick-workers"
          type="button"
          onClick={() => setActiveModal('WORKERS')}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#141416] border border-[#1F1F21] hover:border-[#C5A059]/40 text-[10px] uppercase tracking-[0.12em] font-medium text-[#D1D1D1] hover:text-[#E5E5E5] active:scale-[0.97] transition-all touch-manipulation truncate"
        >
          <Users className="w-3 h-3 text-[#C5A059] shrink-0" />
          <span className="truncate">Workers ({activeWorkersCount}/{totalWorkersCount})</span>
        </button>

        <button
          id="touch-quick-brief"
          type="button"
          onClick={() => setActiveModal('DAILY_BRIEF' as any)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#141416] border border-[#1F1F21] hover:border-[#C5A059]/40 text-[10px] uppercase tracking-[0.12em] font-medium text-[#D1D1D1] hover:text-[#E5E5E5] active:scale-[0.97] transition-all touch-manipulation truncate"
        >
          <FileText className="w-3 h-3 text-[#C5A059] shrink-0" />
          <span className="truncate">Daily Brief</span>
        </button>

        <button
          id="touch-quick-risk"
          type="button"
          onClick={() => setActiveModal('RISK')}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#141416] border border-[#1F1F21] hover:border-[#C5A059]/40 text-[10px] uppercase tracking-[0.12em] font-medium text-[#D1D1D1] hover:text-[#E5E5E5] active:scale-[0.97] transition-all touch-manipulation truncate"
        >
          <ShieldAlert className={`w-3 h-3 shrink-0 ${riskLimits.riskState === 'SAFE' ? 'text-[#4CAF50]' : 'text-orange-400'}`} />
          <span className="truncate">Risk: {riskLimits.riskState}</span>
        </button>
      </div>
    </div>
  );
};

