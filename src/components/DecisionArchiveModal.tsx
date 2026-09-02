import React, { useState } from 'react';
import { ArrowLeft, Archive, CheckCircle2, XCircle, Search, Filter, History, HelpCircle } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { DecisionArchiveRecord } from '../types';

export const DecisionArchiveModal: React.FC = () => {
  const { decisionArchive, selectedDecision, setSelectedDecision, setActiveModal } = useImperium();
  const [filterType, setFilterType] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRecord, setActiveRecord] = useState<DecisionArchiveRecord | null>(selectedDecision || decisionArchive[0] || null);

  const filtered = decisionArchive.filter(d => {
    if (filterType === 'APPROVED' && d.nexusDecision !== 'APPROVE FOR PAPER REVIEW') return false;
    if (filterType === 'REJECTED' && d.nexusDecision !== 'REJECT') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return d.ticker.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || d.strategy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto py-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            DECISION ARCHIVE (APPROVED & REJECTED)
          </span>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A7A]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticker, strategy, company..."
              className="w-full pl-9 pr-3 py-2 rounded-xs bg-[#141416] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] placeholder-[#7A7A7A] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'APPROVED', 'REJECTED'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-3 py-2 rounded-xs text-[10px] font-mono font-medium uppercase transition-colors touch-manipulation cursor-pointer ${
                  filterType === tab
                    ? 'bg-[#C5A059] text-[#0D0D0E]'
                    : 'bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Decision Deep-Audit Card */}
        {activeRecord && (
          <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-mono font-bold text-[#E5E5E5]">
                    ${activeRecord.ticker}
                  </h2>
                  <span className="text-xs font-mono text-[#9A9A9A]">
                    {activeRecord.company}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                  {activeRecord.date} {activeRecord.time} • Proposed by <strong className="text-[#D1D1D1]">{activeRecord.workerSource}</strong>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-medium px-2 py-1 rounded-xs flex items-center gap-1 ${
                activeRecord.nexusDecision === 'APPROVE FOR PAPER REVIEW'
                  ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30'
                  : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
              }`}>
                {activeRecord.nexusDecision === 'APPROVE FOR PAPER REVIEW' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{activeRecord.nexusDecision}</span>
              </span>
            </div>

            {/* Setup & Reason */}
            <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono space-y-1.5">
              <div>
                <strong className="text-[#C5A059] text-[10px] block uppercase tracking-wider mb-0.5">PROPOSED SETUP & CATALYST:</strong>
                <p className="text-[#D1D1D1]">{activeRecord.setup} • {activeRecord.catalyst}</p>
              </div>
              <div className="pt-1.5 border-t border-[#1F1F21]">
                <strong className="text-[#7A7A7A] text-[10px] block uppercase tracking-wider mb-0.5">NEXUS DECISION REASON:</strong>
                <p className="text-[#E5E5E5]">{activeRecord.decisionReason}</p>
              </div>
            </div>

            {/* Post-Market Outcome Validation */}
            <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#7A7A7A]">LATER MARKET OUTCOME:</span>
                <span className="font-medium text-[#E5E5E5] uppercase">{activeRecord.laterMarketOutcome.replace(/_/g, ' ')}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#1F1F21]">
                <span className="text-[#7A7A7A]">ACCURACY VERDICT:</span>
                <span className={`font-medium ${activeRecord.wasNexusCorrect ? 'text-[#4CAF50]' : 'text-[#7A7A7A]'}`}>
                  {activeRecord.wasNexusCorrect ? '✓ NEXUS SUPERVISOR WAS CORRECT' : 'EVALUATION PENDING'}
                </span>
              </div>

              <div className="pt-1.5 border-t border-[#1F1F21]">
                <strong className="text-[#C5A059] text-[10px] block uppercase tracking-wider mb-0.5">LESSON LEARNED & FUTURE IMPLICATIONS:</strong>
                <p className="text-[#D1D1D1] text-[11px] leading-relaxed mt-0.5">{activeRecord.lessonLearned}</p>
                <p className="text-[#7A7A7A] text-[10px] mt-1 italic">Implication: {activeRecord.futureStrategyImplication}</p>
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        <div className="space-y-2">
          {filtered.map(rec => (
            <div
              key={rec.id}
              onClick={() => setActiveRecord(rec)}
              className={`p-3 rounded-sm border cursor-pointer transition-all active:scale-[0.99] touch-manipulation flex items-center justify-between ${
                activeRecord?.id === rec.id
                  ? 'bg-[#141416] border-[#C5A059]'
                  : 'bg-[#141416] border-[#1F1F21] hover:border-[#333]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#E5E5E5]">${rec.ticker}</span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-xs font-medium ${
                    rec.nexusDecision === 'APPROVE FOR PAPER REVIEW' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#FF5252]/10 text-[#FF5252]'
                  }`}>
                    {rec.nexusDecision}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                  {rec.strategy} • {rec.date}
                </div>
              </div>

              <div className="text-right text-[10px] font-mono">
                <span className={`block font-medium ${rec.wasNexusCorrect ? 'text-[#4CAF50]' : 'text-[#7A7A7A]'}`}>
                  {rec.wasNexusCorrect ? 'Nexus Correct' : 'Audit Pending'}
                </span>
                <span className="text-[#555]">{rec.laterMarketOutcome.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
