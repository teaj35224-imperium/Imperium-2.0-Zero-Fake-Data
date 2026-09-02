import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, XCircle, Clock, FileText, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const PositionDetailModal: React.FC = () => {
  const { selectedPosition, setActiveModal, abortPosition, closePosition, openStockWorkspace } = useImperium();
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cashOutPhase, setCashOutPhase] = useState<string | null>(null);

  if (!selectedPosition) {
    return (
      <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-4">
        <div className="p-4 rounded bg-neutral-900 text-center font-mono text-xs text-neutral-300">
          No position selected.
          <button onClick={() => setActiveModal(null)} className="block mt-2 text-amber-400">Back</button>
        </div>
      </div>
    );
  }

  const pos = selectedPosition;
  const health = pos.holdingHealth;
  const isProfit = pos.unrealizedPnL >= 0;
  const isBad = health.overallStatus === 'ACTION REQUIRED' || pos.nexusStatus === 'ACTION_REQUIRED';
  const reasoning = pos.plainEnglishReasoning;
  const timeline = pos.timeline || [];

  const handleLiveCashOut = async () => {
    setIsCashingOut(true);
    setCashOutPhase('SUBMITTING_EXIT_ORDER');
    
    // Smooth visual confirmation sequence
    setTimeout(async () => {
      setCashOutPhase('BROKERAGE_ACCEPTED');
      await abortPosition(pos.id);
      setCashOutPhase('POSITION_CLOSED');
      setTimeout(() => {
        setIsCashingOut(false);
        setActiveModal(null);
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-28 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
              AUDITED POSITION • #{pos.ticker}
            </span>
          </div>
        </div>

        {/* Position Summary Card */}
        <div className={`p-4 rounded-sm border shadow-xl mb-3 ${
          isBad 
            ? 'bg-[#FF5252]/5 border-[#FF5252]/60' 
            : 'bg-[#141416] border-[#C5A059]/40'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-[#E5E5E5]">
                  ${pos.ticker}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-xs bg-[#0D0D0E] text-[#9A9A9A] border border-[#1F1F21]">
                  {pos.quantity} SHARES
                </span>
                {pos.isRunner && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> RUNNER
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                {pos.company} • Entry: ${pos.avgEntryPrice.toFixed(2)} • Opened {pos.openedAt} via {pos.workerSource}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-mono font-bold text-[#E5E5E5]">
                ${pos.currentPrice.toFixed(2)}
              </div>
              <div className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${isProfit ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({isProfit ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Required Banner if Bad */}
        {isBad && health.actionRequiredDetails && (
          <div className="p-4 rounded-sm bg-[#FF5252]/10 border border-[#FF5252]/60 shadow-lg mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5252]" />
              <h3 className="text-xs sm:text-sm font-mono font-medium text-[#FF5252] uppercase">
                THIS IS BAD — IMMEDIATE ACTION REQUIRED
              </h3>
            </div>

            <div className="text-xs font-mono text-[#E5E5E5] leading-relaxed">
              <strong className="text-[#FF5252] block text-[10px] uppercase tracking-wider mb-0.5">WHAT CHANGED:</strong>
              {health.actionRequiredDetails.whatChanged}
            </div>

            <div className="text-xs font-mono text-[#D1D1D1] leading-relaxed">
              <strong className="text-[#C5A059] block text-[10px] uppercase tracking-wider mb-0.5">WHY IT MATTERS:</strong>
              {health.actionRequiredDetails.whyItMatters}
            </div>

            <div className="text-xs font-mono text-[#9A9A9A]">
              <strong className="text-[#7A7A7A] block text-[10px] uppercase tracking-wider mb-0.5">EVIDENCE:</strong>
              <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                {health.actionRequiredDetails.evidence.map((ev, idx) => (
                  <li key={idx} className="text-[#D1D1D1]">{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Plain-English Position Reasoning (8-Point Framework) */}
        {reasoning && (
          <div className="p-3.5 rounded-sm bg-[#141416] border border-[#C5A059]/30 mb-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059]">
                  Plain-English Reasoning
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#7A7A7A]">Nexus Autonomic Supervisor</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                <div className="text-[10px] text-[#C5A059] font-medium uppercase tracking-wider">Why I Bought</div>
                <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whyIBought}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#9A9A9A] font-medium uppercase tracking-wider">What I Am Watching</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatIAmWatching}</div>
                </div>

                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#9A9A9A] font-medium uppercase tracking-wider">What Has Changed</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatHasChanged}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#4CAF50] font-medium uppercase tracking-wider">What Would Make Me Take Profit</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatWouldMakeMeTakeProfit}</div>
                </div>

                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#FF5252] font-medium uppercase tracking-wider">What Would Make Me Sell</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatWouldMakeMeSell}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#9A9A9A] font-medium uppercase tracking-wider">What I Have Done</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatIHaveDone}</div>
                </div>

                <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                  <div className="text-[10px] text-[#9A9A9A] font-medium uppercase tracking-wider">What I Plan To Do Next</div>
                  <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.whatIPlanToDoNext}</div>
                </div>
              </div>

              <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                <div className="text-[10px] text-[#C5A059] font-medium uppercase tracking-wider">Current Risk Assessment</div>
                <div className="text-[#D1D1D1] mt-0.5 leading-relaxed">{reasoning.currentRisk}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lifecycle Timeline */}
        {timeline.length > 0 && (
          <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
            <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                Position Lifecycle Timeline
              </h3>
            </div>

            <div className="space-y-2 pt-1">
              {timeline.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-start gap-2.5 text-xs font-mono">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  </div>
                  <div className="flex-1 p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                    <div className="flex items-center justify-between text-[10px] text-[#7A7A7A]">
                      <span className="font-bold text-[#E5E5E5]">{evt.title}</span>
                      <span>{evt.time}</span>
                    </div>
                    <div className="text-[#9A9A9A] text-[11px] mt-0.5 leading-relaxed">{evt.details}</div>
                    {evt.price !== undefined && (
                      <div className="text-[10px] text-[#C5A059] mt-1">
                        Price: ${evt.price.toFixed(2)} {evt.shares ? `• ${evt.shares} share(s)` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holding Health Subsystem */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center justify-between">
            <span>Portfolio Sentinel • Health Audit</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-xs font-mono font-medium ${
              health.overallStatus === 'HEALTHY' ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/40'
            }`}>
              {health.overallStatus}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">FUNDAMENTALS</span>
              <span className="text-[#E5E5E5] font-medium">{health.fundamentalsStatus}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">EARNINGS / GUIDANCE</span>
              <span className="text-[#E5E5E5] font-medium">{health.earningsStatus}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">CATALYST INTEGRITY</span>
              <span className="text-[#E5E5E5] font-medium">{health.catalystIntegrity}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">PRICE STRUCTURE</span>
              <span className="text-[#E5E5E5] font-medium">{health.priceBehavior}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">VOLUME FLOW</span>
              <span className="text-[#E5E5E5] font-medium">{health.volumeBehavior}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">THESIS STATUS</span>
              <span className={`font-medium ${health.thesisStatus === 'VALID' ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                {health.thesisStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Envelope & Trailing Exits */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-4 text-xs font-mono">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] mb-2">
            Risk Gates & Automated Stop Rules
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">HARD STOP</span>
              <span className="text-[#FF5252] font-medium">${pos.stopLossPrice.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">TARGET 1</span>
              <span className="text-[#4CAF50] font-medium">${pos.targetPrice.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">TRAILING EXIT</span>
              <span className="text-[#C5A059] font-medium">{pos.trailingStopPercent ? `${pos.trailingStopPercent}%` : 'INACTIVE'}</span>
            </div>
          </div>
        </div>

        {/* Live Cash Out / Abort Status Feedback */}
        {isCashingOut && (
          <div className="p-3 rounded-sm bg-[#C5A059]/10 border border-[#C5A059] text-center font-mono text-xs text-[#C5A059] mb-3 animate-pulse">
            <div className="font-bold uppercase tracking-wider">
              {cashOutPhase === 'SUBMITTING_EXIT_ORDER' && '1/3 • Submitting Exit Market Order...'}
              {cashOutPhase === 'BROKERAGE_ACCEPTED' && '2/3 • Brokerage Accepted — Liquidating...'}
              {cashOutPhase === 'POSITION_CLOSED' && '3/3 • Position Liquidated. Capital Returned to Cash.'}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => openStockWorkspace(pos.ticker)}
            className="w-full p-3 rounded-sm bg-[#141416] border border-[#C5A059] text-[#C5A059] font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#C5A059]/10 active:scale-98 transition-all shadow-lg touch-manipulation cursor-pointer"
          >
            <span>OPEN ${pos.ticker} FULL STOCK WORKSPACE & CHART →</span>
          </button>

          <button
            type="button"
            disabled={isCashingOut}
            onClick={handleLiveCashOut}
            className="w-full p-3 rounded-sm bg-[#FF5252] hover:bg-[#ff3b3b] text-[#0D0D0E] font-mono font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg touch-manipulation cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>LIVE CASH OUT / ABORT THIS POSITION (${pos.marketValue.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

