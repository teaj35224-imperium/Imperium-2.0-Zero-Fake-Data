import React, { useState } from 'react';
import { ArrowLeft, Zap, Shield, CheckCircle2, XCircle, Clock, AlertTriangle, Scale, Eye, FileText } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { OpportunityVerdict } from '../types';

export const OpportunityDetailModal: React.FC = () => {
  const { opportunities, selectedOpportunity, setSelectedOpportunity, setActiveModal, submitVerdict } = useImperium();
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opp = selectedOpportunity || opportunities[0];

  if (!opp) {
    return (
      <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-4">
        <div className="p-4 rounded bg-neutral-900 text-center font-mono text-xs text-neutral-300">
          No opportunity selected.
          <button onClick={() => setActiveModal(null)} className="block mt-2 text-amber-400">Back</button>
        </div>
      </div>
    );
  }

  const handleVerdict = async (verdict: OpportunityVerdict) => {
    setIsSubmitting(true);
    const reason = decisionReason.trim() || `Nexus Supervisory Verdict: ${verdict}`;
    await submitVerdict(opp.id, verdict, reason);
    setIsSubmitting(false);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto py-3">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            id="opp-detail-back-btn"
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            OPPORTUNITY FOLDER #{opp.id.toUpperCase()}
          </span>
        </div>

        {/* Opportunity Header: Ticker, Price, Worker, Verdict Status */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-[#C5A059]">
                  ${opp.ticker}
                </h2>
                <span className="text-xs font-mono text-[#7A7A7A]">
                  {opp.company}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#9A9A9A] mt-0.5">
                SUBMITTED BY: <strong className="text-[#E5E5E5]">{opp.workerName}</strong> • {opp.timestamp}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-mono font-bold text-[#E5E5E5]">
                ${opp.currentPrice.toFixed(2)}
              </div>
              <div className="text-xs font-mono text-[#4CAF50] font-medium">
                +{opp.expectedUpside}% UPSIDE
              </div>
            </div>
          </div>

          {/* Current Verdict Badge */}
          <div className="mt-3 pt-2.5 border-t border-[#1F1F21] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7A7A7A]">NEXUS VERDICT:</span>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-xs ${
              opp.finalDecision === 'APPROVE FOR PAPER REVIEW'
                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/40'
                : opp.finalDecision === 'REJECT'
                ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/40'
                : 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/40'
            }`}>
              {opp.finalDecision}
            </span>
          </div>
        </div>

        {/* 1. Core Thesis & Setup */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Strategy & Setup</span>
          </h3>
          <div className="text-xs font-mono text-[#D1D1D1] leading-relaxed">
            <strong className="text-[#7A7A7A] block text-[10px] uppercase tracking-wider mb-0.5">TECHNICAL SETUP:</strong>
            {opp.setup}
          </div>
          <div className="text-xs font-mono text-[#9A9A9A] leading-relaxed pt-1.5 border-t border-[#1F1F21]">
            <strong className="text-[#7A7A7A] block text-[10px] uppercase tracking-wider mb-0.5">CATALYST / DRIVER:</strong>
            {opp.catalyst}
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">CONFIDENCE</span>
            <span className="text-[#C5A059] font-medium">{opp.confidence}%</span>
          </div>
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">DOWNSIDE</span>
            <span className="text-[#FF5252] font-medium">-{opp.expectedDownside}%</span>
          </div>
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">SPREAD</span>
            <span className="text-[#E5E5E5] font-medium">${opp.spread.toFixed(3)}</span>
          </div>
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">LIQUIDITY</span>
            <span className="text-[#4CAF50] font-medium">{opp.liquidityScore}/100</span>
          </div>
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">REL VOLUME</span>
            <span className="text-[#E5E5E5] font-medium">{opp.relativeVolume}x</span>
          </div>
          <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
            <span className="text-[#7A7A7A] block text-[9px]">POTENTIAL PROFIT</span>
            <span className="text-[#4CAF50] font-medium">+${opp.estimatedPotentialProfit.toFixed(2)}</span>
          </div>
        </div>

        {/* 3. Execution Concepts (Entry / Exit / Stop) */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2 text-xs font-mono">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Execution Concepts & Risk Parameters</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">ENTRY CONCEPT</span>
              <p className="text-[#D1D1D1] text-[10px] mt-0.5">{opp.entryConcept}</p>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#4CAF50] block text-[9px]">EXIT CONCEPT</span>
              <p className="text-[#D1D1D1] text-[10px] mt-0.5">{opp.exitConcept}</p>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#FF5252] block text-[9px]">STOP CONCEPT</span>
              <p className="text-[#D1D1D1] text-[10px] mt-0.5">{opp.stopConcept}</p>
            </div>
          </div>
        </div>

        {/* 4. Evidence Stack & Conflicting Evidence */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Chief-of-Staff Evidence Verification</span>
          </h3>

          <div className="space-y-1.5">
            {opp.evidence.map((ev, idx) => (
              <div key={idx} className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono">
                <div className="flex items-center justify-between text-[#7A7A7A] mb-0.5">
                  <span className="font-medium text-[#C5A059]">{ev.source} • {ev.type}</span>
                  <span>{ev.freshness} (Reliability: {ev.reliabilityScore}%)</span>
                </div>
                <p className="text-[#D1D1D1]">{ev.description}</p>
              </div>
            ))}
          </div>

          {opp.conflictingEvidence.length > 0 && (
            <div className="mt-2 p-2 rounded-sm bg-[#FF5252]/5 border border-[#FF5252]/30 text-[10px] font-mono text-[#FF5252]">
              <strong className="block mb-0.5 uppercase tracking-wider text-[9px]">CONFLICTING / RISK SIGNALS:</strong>
              {opp.conflictingEvidence.join(' ')}
            </div>
          )}

          {opp.assistantNotes && (
            <div className="mt-2 p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono text-[#9A9A9A]">
              <strong className="text-[#E5E5E5] block mb-0.5 uppercase tracking-wider text-[9px]">ASSISTANT CHIEF OF STAFF MEMO:</strong>
              {opp.assistantNotes}
            </div>
          )}
        </div>

        {/* 5. Nexus Analysis & Verdict Input */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Render Nexus Supervisory Verdict</span>
          </h3>

          <div className="mb-3">
            <label className="text-[10px] font-mono text-[#7A7A7A] block mb-1">
              DECISION REASONING / LESSON ANCHOR:
            </label>
            <input
              type="text"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="e.g. High asymmetric R:R with verified institutional volume breakout..."
              className="w-full p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] placeholder-[#555] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* 5 Verdict Buttons */}
          <div className="space-y-2 pt-1">
            <button
              id="verdict-btn-approve"
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVerdict('APPROVE FOR PAPER REVIEW')}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 touch-manipulation cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>APPROVE FAKE-MONEY TRADE (NO REAL MONEY WILL BE USED)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="verdict-btn-reject"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleVerdict('REJECT')}
                className="p-2.5 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/40 hover:bg-[#FF5252]/20 text-[#FF5252] font-mono font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT (ARCHIVE)</span>
              </button>

              <button
                id="verdict-btn-wait"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleVerdict('WAIT')}
                className="p-2.5 rounded-lg bg-[#0D0D0E] border border-[#1F1F21] hover:border-[#2F2F31] text-[#9A9A9A] font-mono text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>WAIT / RE-SCAN</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVerdict('NEEDS MORE EVIDENCE')}
              className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[#C5A059] font-mono text-[10px] hover:border-[#C5A059]/40 active:scale-95 transition-all"
            >
              NEEDS MORE EVIDENCE
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVerdict('ACTION REQUIRED')}
              className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[#FF5252] font-mono text-[10px] hover:border-[#FF5252]/40 active:scale-95 transition-all"
            >
              ESCALATE TO HUMAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
