import React from 'react';
import { Briefcase, AlertTriangle, ShieldCheck, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { Position } from '../types';

export const PositionsSection: React.FC = () => {
  const { positions, setSelectedPosition, setActiveModal, portfolio } = useImperium();

  const handleOpenPosition = (pos: Position) => {
    setSelectedPosition(pos);
    setActiveModal('POSITION_DETAIL');
  };

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Briefcase className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                Open Positions & Risk Envelopes
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Active holdings monitored continuously by Portfolio Sentinel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-xs ${
              portfolio.unrealizedPnLTotal >= 0 
                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
            }`}>
              P&L: {portfolio.unrealizedPnLTotal >= 0 ? '+' : ''}${portfolio.unrealizedPnLTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Position Cards */}
        <div className="space-y-2.5">
          {positions.length === 0 ? (
            <div className="p-4 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-center text-xs font-mono text-[#7A7A7A]">
              NO ACTIVE PAPER POSITIONS • REVIEW GOT ONE QUEUE TO ALLOCATE
            </div>
          ) : (
            positions.map((pos) => {
              const isProfit = pos.unrealizedPnL >= 0;
              const isAlert = pos.nexusStatus === 'ACTION_REQUIRED' || pos.holdingHealth.overallStatus === 'ACTION REQUIRED';

              return (
                <div
                  key={pos.id}
                  id={`pos-card-${pos.ticker.toLowerCase()}`}
                  onClick={() => handleOpenPosition(pos)}
                  className={`p-3.5 rounded-sm border transition-all cursor-pointer active:scale-[0.99] touch-manipulation ${
                    isAlert
                      ? 'bg-[#FF5252]/5 border-[#FF5252]/40 hover:border-[#FF5252]'
                      : 'bg-[#0D0D0E] border-[#1F1F21] hover:border-[#2F2F31]'
                  }`}
                >
                  {/* Top Line: Ticker, Shares, Price, P&L */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-[#E5E5E5]">
                            ${pos.ticker}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#141416] text-[#9A9A9A] border border-[#1F1F21]">
                            {pos.quantity} SHARES
                          </span>
                          {isAlert && (
                            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-xs bg-[#FF5252] text-[#0D0D0E]">
                              ACTION REQ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#7A7A7A] mt-0.5">
                          Avg: ${pos.avgEntryPrice.toFixed(2)} • Current: ${pos.currentPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {isProfit ? (
                          <TrendingUp className="w-3.5 h-3.5 text-[#4CAF50]" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF5252]" />
                        )}
                        <span className={`text-sm font-mono font-medium ${isProfit ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                          {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono ${isProfit ? 'text-[#4CAF50]/80' : 'text-[#FF5252]/80'}`}>
                        {isProfit ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Thesis & Health Snippet */}
                  <div className="mt-2 text-[10px] text-[#9A9A9A] truncate">
                    <span className="text-[#7A7A7A] uppercase tracking-wider font-mono">Thesis:</span> {pos.thesis}
                  </div>

                  {/* Envelope Sub-Bar: Stop, Target, Risk, Status */}
                  <div className="grid grid-cols-4 gap-1.5 py-1.5 mt-2.5 text-[9px] font-mono border-t border-[#1F1F21]">
                    <div>
                      <span className="text-[#7A7A7A] block">HARD STOP</span>
                      <span className="text-[#FF5252]">${pos.stopLossPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A] block">TARGET</span>
                      <span className="text-[#4CAF50]">${pos.targetPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A] block">HEALTH</span>
                      <span className={`font-medium ${
                        pos.holdingHealth.overallStatus === 'HEALTHY' ? 'text-[#4CAF50]' : 'text-[#FF5252]'
                      }`}>
                        {pos.holdingHealth.overallStatus}
                      </span>
                    </div>
                    <div className="text-right flex items-center justify-end">
                      <span className="text-[#C5A059] flex items-center gap-0.5 text-[9px] uppercase tracking-wider">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
