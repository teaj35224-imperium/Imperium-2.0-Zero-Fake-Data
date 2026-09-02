import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Target, 
  StopCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

interface LiveOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConceptExplanation?: (conceptKey: string) => void;
}

export const LiveOperationsModal: React.FC<LiveOperationsModalProps> = ({
  isOpen,
  onClose,
  onOpenConceptExplanation
}) => {
  const { positions, closePosition, openStockWorkspace, logs } = useImperium();
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('5m');
  const [isClosingId, setIsClosingId] = useState<string | null>(null);
  const [closeResultMsg, setCloseResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (positions.length > 0 && !selectedPositionId) {
      setSelectedPositionId(positions[0].id);
    }
  }, [positions, selectedPositionId]);

  if (!isOpen) return null;

  const activePosition = positions.find(p => p.id === selectedPositionId) || positions[0];

  const handleClose = async (posId: string) => {
    setIsClosingId(posId);
    try {
      const success = await closePosition(posId);
      if (success) {
        setCloseResultMsg('Paper position closed. Capital returned to cash balance.');
        setTimeout(() => setCloseResultMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClosingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div id="live-operations-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0a09] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black px-4 py-1.5 flex items-center justify-between text-xs font-black tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>LIVE OPERATIONS FLOOR & TRADE SUPERVISOR</span>
            </div>
            <span className="font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded">FEED: REAL-TIME IEX</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">Live Operations Floor</h2>
                <p className="text-xs text-amber-300/80">Continuous Trade Supervisor & Risk Boundary Execution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenConceptExplanation && (
                <button
                  id="live-ops-explain-btn"
                  onClick={() => onOpenConceptExplanation('STOP_LOSS')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explain Risk Boundaries</span>
                </button>
              )}
              <button
                id="close-live-ops-btn"
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {closeResultMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between"
              >
                <span>{closeResultMsg}</span>
              </motion.div>
            )}

            {/* Position Selector Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {positions.map((pos) => {
                const isSelected = activePosition?.id === pos.id;
                const isProfit = pos.unrealizedPnL >= 0;
                return (
                  <button
                    key={pos.id}
                    id={`pos-tab-${pos.ticker.toLowerCase()}`}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/60 to-neutral-900 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="font-mono">{pos.ticker}</span>
                    <span className={`font-mono text-[10px] ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                    </span>
                    {pos.holdingHealth?.overallStatus === 'ACTION REQUIRED' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Position Trade Supervisor Dashboard */}
            {activePosition ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Interactive Multi-Timeframe Chart & Metrics */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Chart Container */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-mono">{activePosition.ticker}</span>
                        <span className="text-xs text-neutral-400">{activePosition.company}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300">
                          {activePosition.quantity} shares
                        </span>
                      </div>
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                        {(['1m', '5m', '15m', '1h', '1D'] as const).map((tf) => (
                          <button
                            key={tf}
                            id={`ops-tf-${tf}`}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              activeTimeframe === tf ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulated SVG Interactive Price Canvas with Stop & Target Lines */}
                    <div className="h-52 w-full bg-black/60 rounded-lg p-3 relative border border-white/5 overflow-hidden flex flex-col justify-between">
                      {/* Top Target Marker */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 border-b border-emerald-500/30 pb-1">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>PROFIT TARGET: ${activePosition.targetPrice.toFixed(2)}</span>
                        </span>
                        <span>+ {(((activePosition.targetPrice - activePosition.avgEntryPrice) / activePosition.avgEntryPrice) * 100).toFixed(1)}% Upside</span>
                      </div>

                      {/* Middle Chart Wave */}
                      <div className="my-auto h-24 w-full relative flex items-center">
                        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                          {/* Price Path */}
                          <path
                            d="M 0 65 Q 60 75 120 50 T 240 40 T 320 30 L 400 25"
                            fill="none"
                            stroke={activePosition.unrealizedPnL >= 0 ? '#10b981' : '#f43f5e'}
                            strokeWidth="2.5"
                          />
                          {/* Entry Line */}
                          <line x1="0" y1="55" x2="400" y2="55" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                        </svg>
                      </div>

                      {/* Bottom Hard Stop Marker */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 border-t border-rose-500/30 pt-1">
                        <span className="flex items-center gap-1">
                          <StopCircle className="w-3 h-3" />
                          <span>HARD STOP LOSS: ${activePosition.stopLossPrice.toFixed(2)}</span>
                        </span>
                        <span>- {(((activePosition.avgEntryPrice - activePosition.stopLossPrice) / activePosition.avgEntryPrice) * 100).toFixed(1)}% Max Downside</span>
                      </div>
                    </div>

                    {/* Live Boundary Tickers */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[9px] text-neutral-400 uppercase">Entry Price</span>
                        <div className="text-white font-bold">${activePosition.avgEntryPrice.toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[9px] text-neutral-400 uppercase">Current Price</span>
                        <div className="text-amber-300 font-bold">${activePosition.currentPrice.toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[9px] text-neutral-400 uppercase">Distance to Target</span>
                        <div className="text-emerald-400 font-bold">
                          +${(activePosition.targetPrice - activePosition.currentPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* "WHAT THIS MEANS" Plain-English Card */}
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4" />
                      <span>What This Means (Plain English)</span>
                    </div>
                    <p className="text-xs text-neutral-200 leading-relaxed">
                      You own <strong>{activePosition.quantity} paper shares</strong> of {activePosition.company}. 
                      The Trade Supervisor has an automated hard stop at <strong>${activePosition.stopLossPrice.toFixed(2)}</strong>. 
                      If the stock drops to that price, it will sell automatically to cap your maximum loss. 
                      If it rises to <strong>${activePosition.targetPrice.toFixed(2)}</strong>, it will automatically lock in profits.
                    </p>
                  </div>
                </div>

                {/* Right Col: Supervisor Status & Actions */}
                <div className="space-y-4">
                  {/* Supervisor Engine Card */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-3">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Supervisor Engine</span>
                    
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 font-mono">Current Action State</span>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{activePosition.nexusStatus}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 font-mono">Origin Desk</span>
                      <div className="text-xs font-bold text-white">{activePosition.workerSource}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 font-mono">Core Thesis</span>
                      <div className="text-xs text-neutral-300">{activePosition.thesis}</div>
                    </div>

                    {/* Safe Close Position Button */}
                    <div className="pt-2">
                      <button
                        id={`close-active-pos-${activePosition.ticker.toLowerCase()}`}
                        disabled={isClosingId === activePosition.id}
                        onClick={() => handleClose(activePosition.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>{isClosingId === activePosition.id ? 'CLOSING POSITION...' : 'CLOSE PAPER POSITION NOW'}</span>
                      </button>
                      <p className="text-[10px] text-neutral-400 text-center mt-1">
                        Sells shares at current market price & sweeps capital to cash
                      </p>
                    </div>
                  </div>

                  {/* Holding Health Details */}
                  {activePosition.holdingHealth && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Holding Health Sentinel</span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300">Thesis Status</span>
                        <span className="font-bold text-emerald-400">{activePosition.holdingHealth.thesisStatus}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300">Risk Score</span>
                        <span className="font-bold font-mono text-amber-300">{activePosition.holdingHealth.riskScore} / 100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-neutral-400">No open paper positions at this moment. Capital is 100% safe in cash reserves.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Trade Supervisor Tick Rate: 1.0s</span>
            <button
              id="close-live-ops-footer-btn"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider transition-colors"
            >
              CLOSE LIVE OPS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
