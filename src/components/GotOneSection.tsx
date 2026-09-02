import React from 'react';
import { Zap, ChevronRight, CheckCircle2, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { Opportunity } from '../types';

export const GotOneSection: React.FC = () => {
  const { opportunities, setSelectedOpportunity, setActiveModal, submitVerdict } = useImperium();

  const handleOpenFolder = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setActiveModal('GOT_ONE_DETAIL');
  };

  const handleQuickVerdict = async (e: React.MouseEvent, opp: Opportunity, verdict: 'APPROVE FOR PAPER REVIEW' | 'REJECT') => {
    e.stopPropagation();
    await submitVerdict(opp.id, verdict, `Direct operator decision: ${verdict}`);
  };

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059]">
                Got One • Opportunity Queue
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Proposals verified by Chief-of-Staff for Nexus decision
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
            {opportunities.length} ACTIVE
          </span>
        </div>

        {/* Opportunity Card List */}
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const isPending = opp.status === 'PENDING_NEXUS';
            return (
              <div
                key={opp.id}
                id={`opp-card-${opp.ticker.toLowerCase()}`}
                onClick={() => handleOpenFolder(opp)}
                className={`relative p-3.5 rounded-sm border transition-all cursor-pointer active:scale-[0.99] touch-manipulation ${
                  isPending 
                    ? 'bg-[#141416] border-[#C5A059]/40 hover:border-[#C5A059]' 
                    : 'bg-[#0D0D0E] border-[#1F1F21] hover:border-[#2F2F31]'
                }`}
              >
                {/* Top Row: Symbol, Price, Confidence */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#E5E5E5]">
                          ${opp.ticker}
                        </span>
                        <span className="text-[11px] text-[#9A9A9A] truncate max-w-[140px] sm:max-w-[200px]">
                          {opp.company}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#C5A059]/80">
                        {opp.workerName} • {opp.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm font-medium text-[#E5E5E5]">
                      ${opp.currentPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono text-[#4CAF50] font-medium">
                      +{opp.expectedUpside}% Upside
                    </span>
                  </div>
                </div>

                {/* Strategy & Catalyst Snippet */}
                <div className="my-2.5 p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[11px] text-[#D1D1D1]">
                  <div className="text-[#E5E5E5] font-medium truncate mb-0.5">
                    <span className="text-[#C5A059] font-mono">SETUP:</span> {opp.setup}
                  </div>
                  <div className="text-[#9A9A9A] text-[10px] truncate">
                    <span className="text-[#7A7A7A] font-mono">CATALYST:</span> {opp.catalyst}
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-4 gap-1.5 py-1.5 text-[9px] font-mono border-t border-b border-[#1F1F21] my-2">
                  <div>
                    <span className="text-[#7A7A7A] block">CONFIDENCE</span>
                    <span className="text-[#C5A059] font-medium">{opp.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block">SPREAD</span>
                    <span className="text-[#D1D1D1]">${opp.spread.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block">R:R RATIO</span>
                    <span className="text-[#4CAF50] font-medium">
                      {(opp.expectedUpside / Math.max(0.1, opp.expectedDownside)).toFixed(1)}:1
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block">MAX PROFIT</span>
                    <span className="text-[#4CAF50]">+${opp.estimatedPotentialProfit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Bottom Row: Nexus Verdict Status & Touch Actions */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">Verdict:</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs ${
                      opp.finalDecision === 'APPROVE FOR PAPER REVIEW'
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30'
                        : opp.finalDecision === 'REJECT'
                        ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                        : 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/40'
                    }`}>
                      {opp.finalDecision}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleQuickVerdict(e, opp, 'REJECT')}
                          className="px-2.5 py-1 rounded-sm bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-[10px] font-mono hover:bg-[#FF5252]/20 active:scale-95 transition-all touch-manipulation flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleQuickVerdict(e, opp, 'APPROVE FOR PAPER REVIEW')}
                          className="px-2.5 py-1 rounded-sm bg-[#C5A059] text-[#0D0D0E] text-[10px] font-mono font-medium hover:bg-[#D4B26F] active:scale-95 transition-all touch-manipulation flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenFolder(opp)}
                        className="px-2.5 py-1 rounded-sm bg-[#141416] border border-[#1F1F21] text-[#C5A059] text-[10px] font-mono flex items-center gap-1 hover:border-[#C5A059]/40 active:scale-95 transition-all touch-manipulation"
                      >
                        <span>Folder</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
