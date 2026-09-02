import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  DollarSign, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw,
  Sparkles,
  Wallet,
  Scale,
  Sliders,
  Clock,
  Eye,
  ListOrdered,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

interface MoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConceptExplanation?: (conceptKey: string) => void;
}

export const MoneyModal: React.FC<MoneyModalProps> = ({
  isOpen,
  onClose,
  onOpenConceptExplanation
}) => {
  const { 
    portfolio, 
    positions, 
    profitAllocation, 
    horizonSnapshots, 
    capitalWaitingQueue, 
    updateProfitAllocation,
    cashOutAllPositions,
    refreshCapitalQueue,
    openStockWorkspace, 
    refreshAll 
  } = useImperium();

  const [activeTab, setActiveTab] = useState<'MAP' | 'GROWTH' | 'HORIZONS' | 'PROFIT_ALLOCATION' | 'CAPITAL_QUEUE'>('MAP');
  const [growthTimeframe, setGrowthTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | 'ALL'>('1M');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileMsg, setReconcileMsg] = useState<string | null>(null);
  
  // Profit Allocation local state
  const [reinvestPct, setReinvestPct] = useState<number>(profitAllocation?.reinvestPercent ?? 75);
  const [reservePct, setReservePct] = useState<number>(profitAllocation?.reservePercent ?? 25);
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);
  const [isCashingOutAll, setIsCashingOutAll] = useState(false);

  useEffect(() => {
    if (profitAllocation) {
      setReinvestPct(profitAllocation.reinvestPercent);
      setReservePct(profitAllocation.reservePercent);
    }
  }, [profitAllocation]);

  if (!isOpen) return null;

  const totalInvested = positions.reduce((sum, p) => sum + (p.marketValue || p.quantity * p.currentPrice), 0);
  const totalCash = portfolio.cash;
  const totalEquity = portfolio.equity || (totalCash + totalInvested);
  const cashPercent = totalEquity > 0 ? (totalCash / totalEquity) * 100 : 0;
  const investedPercent = totalEquity > 0 ? (totalInvested / totalEquity) * 100 : 0;

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await fetch('/api/system/reconcile', { method: 'POST' });
      if (res.ok) {
        setReconcileMsg('Paper balances successfully reconciled with brokerage records.');
        await refreshAll();
        setTimeout(() => setReconcileMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleSaveAllocation = async () => {
    setIsSavingAllocation(true);
    await updateProfitAllocation(reinvestPct, reservePct);
    setIsSavingAllocation(false);
  };

  const handleCashOutAll = async () => {
    if (window.confirm('Confirm: Liquidate all active paper positions and return 100% capital to Cash reserves?')) {
      setIsCashingOutAll(true);
      await cashOutAllPositions();
      setIsCashingOutAll(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="money-command-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0c0b0a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        >
          {/* Top Persistent Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black px-4 py-1.5 flex items-center justify-between text-xs font-black tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>CAPITAL GROWTH ENGINE & PROOF LEDGER</span>
            </div>
            <span className="font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded">ALPACA PAPER SANDBOX</span>
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">Where Is All My Money?</h2>
                <p className="text-xs text-amber-300/80">Real-time Paper Capital Allocation, Multi-Horizon Proof & Profit Flow</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenConceptExplanation && (
                <button
                  id="money-explain-btn"
                  onClick={() => onOpenConceptExplanation('UNREALIZED_PROFIT')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explain This</span>
                </button>
              )}
              <button
                id="close-money-modal-btn"
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-1.5 overflow-x-auto">
            {[
              { id: 'MAP', label: 'MONEY MAP', icon: PieIcon },
              { id: 'HORIZONS', label: 'PERFORMANCE PROOF', icon: Clock },
              { id: 'PROFIT_ALLOCATION', label: 'PROFIT ALLOCATION', icon: Sliders },
              { id: 'CAPITAL_QUEUE', label: 'WAITING QUEUE', icon: ListOrdered },
              
              { id: 'GROWTH', label: 'EQUITY CURVE', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`money-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {reconcileMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between"
              >
                <span>{reconcileMsg}</span>
              </motion.div>
            )}

            {/* TAB 1: MONEY MAP */}
            {activeTab === 'MAP' && (
              <div className="space-y-4">
                {/* Total Capital Summary Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-neutral-900 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">Total Paper Capital</span>
                      <div className="text-2xl font-mono font-black text-white">
                        ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-neutral-400">Buying Power</span>
                      <div className="text-lg font-mono font-bold text-amber-300">
                        ${portfolio.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Allocation Bar */}
                  <div className="mt-3">
                    <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${cashPercent}%` }} className="bg-amber-500" title={`Cash: ${cashPercent.toFixed(1)}%`} />
                      <div style={{ width: `${investedPercent}%` }} className="bg-emerald-500" title={`Invested: ${investedPercent.toFixed(1)}%`} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                      <span>Cash Reserves: {cashPercent.toFixed(1)}% (${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                      <span>Active Holdings: {investedPercent.toFixed(1)}% (${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                    </div>
                  </div>
                </div>

                {/* Money Map Item Cards */}
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">USD</div>
                      <div>
                        <div className="text-xs font-bold text-white">Unallocated Cash Reserves</div>
                        <div className="text-[10px] text-neutral-400">Preserved as risk-free liquidity for high-conviction opportunities</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-amber-300">${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-neutral-400">{cashPercent.toFixed(1)}% of capital</div>
                    </div>
                  </div>

                  {/* Active Positions */}
                  {positions.map((pos) => {
                    const isProfit = pos.unrealizedPnL >= 0;
                    return (
                      <div
                        key={pos.id}
                        onClick={() => openStockWorkspace(pos.ticker)}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-neutral-800 text-white font-bold font-mono text-xs">
                            {pos.ticker}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{pos.company}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                                {pos.quantity} shares @ ${pos.avgEntryPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>Desk: {pos.workerSource}</span>
                              <span>•</span>
                              <span>Strategy: {pos.strategy}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-white">${pos.marketValue.toFixed(2)}</div>
                          <div className={`text-[10px] font-mono font-bold flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({pos.unrealizedPnLPercent.toFixed(2)}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {positions.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isCashingOutAll}
                      onClick={handleCashOutAll}
                      className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-black font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      <span>{isCashingOutAll ? 'LIQUIDATING ALL POSITIONS...' : 'CASH OUT ALL ACTIVE POSITIONS'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MULTI-HORIZON PERFORMANCE PROOF */}
            {activeTab === 'HORIZONS' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Multi-Horizon Performance Proof
                    </h3>
                    <p className="text-[10px] text-neutral-400">Separates Owner Injections/Withdrawals from True Net Trading Profit</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-black/40 px-2 py-1 rounded">
                    Audit Certified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(horizonSnapshots || []).map((h) => {
                    const isProfit = (h.netTradingPnL ?? 0) >= 0;
                    return (
                      <div key={h.id || h.timeframe} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-amber-300">{h.timeframeLabel || h.timeframe}</span>
                          <span className={`font-mono text-xs font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${(h.netTradingPnL ?? 0).toFixed(2)} ({h.winRate?.toFixed(1)}% Win Rate)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 border-t border-white/5">
                          <div className="p-2 rounded bg-black/40">
                            <span className="text-neutral-500 block">START EQUITY</span>
                            <span className="text-neutral-200 font-bold">{typeof h.startingAccountValue === 'number' ? `$${h.startingAccountValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'DATA NOT FOUND'}</span>
                          </div>
                          <div className="p-2 rounded bg-black/40">
                            <span className="text-neutral-500 block">NET DEPOSITS</span>
                            <span className="text-neutral-200 font-bold">${((h.deposits ?? 0) - (h.withdrawals ?? 0)).toFixed(2)}</span>
                          </div>
                          <div className="p-2 rounded bg-black/40">
                            <span className="text-neutral-500 block">CLOSED TRADES</span>
                            <span className="text-emerald-400 font-bold">{h.tradesCount ?? 0} trades</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PROFIT ALLOCATION ENGINE */}
            {activeTab === 'PROFIT_ALLOCATION' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Profit Allocation Engine
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Configure how realized trading profits are partitioned between your active compounding growth pool and locked capital reserves.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/50 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-emerald-400 font-bold">REINVEST IN COMPOUNDING POOL: {reinvestPct}%</span>
                      <span className="text-amber-400 font-bold">PROTECTED RESERVE: {reservePct}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={reinvestPct}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setReinvestPct(val);
                        setReservePct(100 - val);
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>0% Reinvest (100% Reserve)</span>
                      <span>50 / 50</span>
                      <span>100% Reinvest (Aggressive)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20">
                      <span className="text-neutral-400 block text-[10px]">TOTAL REALIZED PROFIT</span>
                      <span className="text-emerald-400 text-base font-bold">
                        {typeof profitAllocation?.totalRealizedProfit === 'number' ? `$${profitAllocation.totalRealizedProfit.toFixed(2)}` : 'DATA NOT FOUND'}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-1">Available for worker autonomous paper allocations</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20">
                      <span className="text-neutral-400 block text-[10px]">LOCKED PROFIT RESERVES</span>
                      <span className="text-amber-300 text-base font-bold">
                        {typeof profitAllocation?.profitReserved === 'number' ? `$${profitAllocation.profitReserved.toFixed(2)}` : 'DATA NOT FOUND'}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-1">Protected from risk, preserved as capital cushion</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingAllocation}
                    onClick={handleSaveAllocation}
                    className="w-full p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold tracking-wider transition-all cursor-pointer shadow-lg"
                  >
                    {isSavingAllocation ? 'APPLYING CONFIGURATION...' : 'SAVE PROFIT ALLOCATION RULES'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: CAPITAL WAITING QUEUE */}
            {activeTab === 'CAPITAL_QUEUE' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Capital Waiting Queue
                    </h3>
                    <p className="text-[10px] text-neutral-400">High-conviction setups waiting for cash clearance</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshCapitalQueue()}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-amber-300 cursor-pointer"
                  >
                    Refresh Queue
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(capitalWaitingQueue || []).length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-neutral-400 border border-white/10 rounded-xl bg-black/30">
                      No setups currently waiting in queue. Capital is sufficient for all active worker requests.
                    </div>
                  ) : (
                    (capitalWaitingQueue || []).map((item, idx) => (
                      <div key={item.id || idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">${item.ticker}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Priority #{item.priorityRank || (idx + 1)}
                            </span>
                            <span className="text-[10px] text-neutral-400">via {item.workerName}</span>
                          </div>
                          <span className="text-amber-400 font-bold">${(item.currentPrice ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">{item.strategy}</div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-white/5">
                          <span>Required Capital: {item.estimatedCapitalNeeded != null ? `$${item.estimatedCapitalNeeded.toFixed(2)}` : 'DATA NOT FOUND'}</span>
                          <span className="text-emerald-400 font-medium">Confidence: {item.confidence}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: EQUITY GROWTH GRAPH */}
            {activeTab === 'GROWTH' && (
              <div className="p-6 text-center border border-white/10 rounded-xl"><div className="font-mono text-amber-300 font-bold">DATA NOT FOUND</div><p className="text-xs text-neutral-400 mt-2">Authoritative historical Alpaca equity data is not connected to this view yet. No synthetic equity curve will be drawn.</p></div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-mono">Paper Capital Engine Active • 0 Real-Money Risk</span>
            <button
              id="close-money-modal-bottom-btn"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider transition-colors cursor-pointer"
            >
              CLOSE CAPITAL CENTER
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
