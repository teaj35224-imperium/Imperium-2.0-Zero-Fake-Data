import React from 'react';
import { Archive, CheckCircle2, XCircle, ChevronRight, History } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { DecisionArchiveRecord } from '../types';

export const DecisionArchiveSection: React.FC = () => {
  const { decisionArchive, setSelectedDecision, setActiveModal } = useImperium();

  const handleOpenDecision = (dec: DecisionArchiveRecord) => {
    setSelectedDecision(dec);
    setActiveModal('DECISION_DETAIL');
  };

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Archive className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                Decision Archive (Approved & Rejected)
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Persistent post-market auditing of all evaluated opportunities
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('DECISION_DETAIL')}
            className="text-[9px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#E5E5E5] flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>All ({decisionArchive.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Decisions List */}
        <div className="space-y-2">
          {decisionArchive.slice(0, 4).map((dec) => {
            const isApproved = dec.nexusDecision === 'APPROVE FOR PAPER REVIEW';
            const wasCorrect = dec.wasNexusCorrect;

            return (
              <div
                key={dec.id}
                id={`decision-card-${dec.id}`}
                onClick={() => handleOpenDecision(dec)}
                className="p-3 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] hover:border-[#2F2F31] cursor-pointer active:scale-[0.99] transition-all touch-manipulation"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#E5E5E5]">
                      ${dec.ticker}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs flex items-center gap-1 ${
                      isApproved 
                        ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                        : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                    }`}>
                      {isApproved ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      <span>{dec.nexusDecision}</span>
                    </span>
                  </div>

                  <span className="text-[9px] font-mono text-[#555]">
                    {dec.date} • {dec.time}
                  </span>
                </div>

                <div className="text-[10px] text-[#9A9A9A] mt-1.5 truncate">
                  <span className="text-[#7A7A7A] uppercase tracking-wider font-mono">REASON:</span> {dec.decisionReason}
                </div>

                {/* Outcome validation line */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1F1F21] text-[9px] font-mono">
                  <span className="text-[#7A7A7A]">
                    OUTCOME: <strong className="text-[#D1D1D1]">{dec.laterMarketOutcome.replace(/_/g, ' ')}</strong>
                  </span>
                  
                  <span className={`font-medium ${wasCorrect ? 'text-[#4CAF50]' : 'text-[#7A7A7A]'}`}>
                    {wasCorrect ? '✓ NEXUS WAS CORRECT' : 'EVALUATION PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
