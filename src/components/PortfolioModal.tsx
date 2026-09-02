import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  ChevronRight, 
  Send, 
  AlertTriangle, 
  Radio, 
  ArrowRight, 
  Lock, 
  Info, 
  ExternalLink, 
  BarChart2, 
  Layers, 
  History,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const PortfolioModal: React.FC = () => {
  const { 
    portfolio, 
    positions, 
    setSelectedPosition, 
    setActiveModal, 
    setSelectedTicker,
    openStockWorkspace,
    isAlpacaPaperConnected, 
    alpacaAccount,
    alpacaOrders,
    createPaperOrder, 
    closePosition,
    riskLimits,
    refreshAll
  } = useImperium();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POSITIONS' | 'MONEY_FLOW' | 'ORDERS' | 'WITHDRAWAL'>('OVERVIEW');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'FILLED' | 'OPEN' | 'CANCELLED'>('ALL');
  
  // Quick paper order state
  const [orderTicker, setOrderTicker] = useState('PLTR');
  const [orderQty, setOrderQty] = useState(1);
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderStep, setOrderStep] = useState<'INPUT' | 'REVIEW' | 'SUCCESS'>('INPUT');
  const [orderFeedback, setOrderFeedback] = useState<{ msg: string; success: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Position closing confirmation state
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

  const handleOpenWorkspace = (ticker: string) => {
    openStockWorkspace(ticker);
  };

  const handleExecutePaperOrder = async () => {
    if (!orderTicker || orderQty <= 0) return;

    setIsSubmitting(true);
    setOrderFeedback(null);

    const result = await createPaperOrder({
      ticker: orderTicker.trim().toUpperCase(),
      qty: Number(orderQty),
      side: orderSide,
      type: 'market',
      workerSource: 'Money Control Center',
      strategy: 'Supervised Paper Capital Allocation',
      setup: `${orderSide.toUpperCase()} ${orderQty} ${orderTicker.toUpperCase()}`
    });

    setIsSubmitting(false);
    if (result.success) {
      setOrderStep('SUCCESS');
      setOrderFeedback({ msg: result.message, success: true });
    } else {
      setOrderFeedback({ msg: result.reason || result.message, success: false });
    }
  };

  const handleClosePositionDirect = async (posId: string) => {
    setIsSubmitting(true);
    const ok = await closePosition(posId);
    setIsSubmitting(false);
    setClosingPositionId(null);
  };

  const totalCostBasis = positions.reduce((sum, p) => sum + (p.avgEntryPrice * p.quantity), 0);
  const totalMarketValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
  const totalUnrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);

  const filteredOrders = alpacaOrders.filter(ord => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'FILLED') return ord.status.toLowerCase() === 'filled';
    if (orderFilter === 'OPEN') return ['new', 'accepted', 'pending_new'].includes(ord.status.toLowerCase());
    if (orderFilter === 'CANCELLED') return ['canceled', 'rejected', 'expired'].includes(ord.status.toLowerCase());
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto py-3 space-y-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1F1F21]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>COCKPIT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('MARKETS')}
              className="px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5] text-xs font-mono transition-colors"
            >
              MARKETS
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border flex items-center gap-1.5 ${
              isAlpacaPaperConnected 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-[#141416] border-[#1F1F21] text-[#7A7A7A]'
            }`}>
              <Radio className="w-3 h-3" />
              {isAlpacaPaperConnected ? 'ALPACA PAPER CONNECTED' : 'ALPACA PAPER NOT CONNECTED'}
            </span>

            <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
              MONEY CONTROL CENTER
            </span>
          </div>
        </div>

        {/* Total Equity & Multi-Metric Account Header Card */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#7A7A7A] block uppercase">
                NET PAPER ACCOUNT EQUITY
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-[#E5E5E5]">
                ${portfolio.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-mono text-[#9A9A9A] mt-0.5">
                PORTFOLIO VALUE: <strong className="text-[#E5E5E5]">${(totalMarketValue + portfolio.cash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-[#7A7A7A] block uppercase">
                TODAY P&L (UNREALIZED + REALIZED)
              </span>
              <div className={`text-xl sm:text-2xl font-mono font-bold flex items-center justify-end gap-1 ${
                portfolio.dayChange >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'
              }`}>
                {portfolio.dayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{portfolio.dayChange >= 0 ? '+' : ''}${portfolio.dayChange.toFixed(2)} ({portfolio.dayChange >= 0 ? '+' : ''}{portfolio.dayChangePercent.toFixed(2)}%)</span>
              </div>
              <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                TOTAL GAIN/LOSS: <strong className={totalUnrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}>{totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* 4-Metric Secondary Sub-Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#1F1F21] text-[10px] font-mono">
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">CASH RESERVE</span>
              <span className="text-[#E5E5E5] font-bold text-xs">
                ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">BUYING POWER</span>
              <span className="text-[#E5E5E5] font-bold text-xs">
                ${portfolio.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">INVESTED MONEY (DEPLOYED)</span>
              <span className="text-[#C5A059] font-bold text-xs">
                ${portfolio.exposureTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({portfolio.exposurePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">REALIZED P&L (DAY)</span>
              <span className="text-[#4CAF50] font-bold text-xs">
                +${portfolio.realizedPnLDay.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#1F1F21]">
          {[
            { id: 'OVERVIEW', label: 'OVERVIEW & DESK' },
            { id: 'POSITIONS', label: `OPEN HOLDINGS (${positions.length})` },
            { id: 'MONEY_FLOW', label: 'MONEY FLOW PIPELINE' },
            { id: 'ORDERS', label: `ORDER HISTORY (${alpacaOrders.length})` },
            { id: 'WITHDRAWAL', label: 'CASH OUT / WITHDRAWAL' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xs text-[10px] font-mono uppercase whitespace-nowrap transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'bg-[#C5A059] text-[#0D0D0E] font-bold'
                  : 'bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: OVERVIEW & FAST ORDER DESK */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Risk-Gated Fast Paper Order Desk */}
            <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059]">
                  Paper Execution Desk (Risk-Gated)
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Cap: ${riskLimits.perTradeCap.toFixed(0)}
                </span>
              </div>

              {orderStep === 'INPUT' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">TICKER</label>
                      <input
                        type="text"
                        value={orderTicker}
                        onChange={(e) => setOrderTicker(e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-white focus:outline-none focus:border-amber-400"
                        placeholder="e.g. PLTR"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">SHARES</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">SIDE</label>
                      <select
                        value={orderSide}
                        onChange={(e) => setOrderSide(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-white focus:outline-none focus:border-amber-400 text-xs"
                      >
                        <option value="buy">BUY</option>
                        <option value="sell">SELL</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrderStep('REVIEW')}
                    disabled={riskLimits.emergencyFreezeActive}
                    className="w-full py-2 px-3 rounded-xs font-mono text-xs uppercase tracking-wider font-bold bg-[#C5A059] text-black hover:bg-[#d4b067] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>REVIEW PAPER ALLOCATION</span>
                  </button>
                </div>
              )}

              {orderStep === 'REVIEW' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#C5A059] space-y-1">
                    <span className="text-[10px] text-[#C5A059] font-bold block">CONFIRM PAPER TRADE:</span>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A7A]">ORDER:</span>
                      <span className="text-[#E5E5E5] font-bold">{orderSide.toUpperCase()} {orderQty} ${orderTicker}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A7A]">ROUTING:</span>
                      <span className="text-[#4CAF50]">Alpaca Paper (Pre-Trade Risk Validated)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderStep('INPUT')}
                      className="py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A]"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePaperOrder}
                      disabled={isSubmitting}
                      className="py-1.5 rounded-xs bg-[#C5A059] text-black font-bold flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmitting ? 'ROUTING...' : 'TRANSMIT'}</span>
                    </button>
                  </div>
                </div>
              )}

              {orderStep === 'SUCCESS' && (
                <div className="p-2.5 rounded-xs bg-[#4CAF50]/10 border border-[#4CAF50]/40 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#4CAF50] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ORDER COMPLETED</span>
                  </div>
                  <p className="text-[10px] text-[#D1D1D1]">{orderFeedback?.msg}</p>
                  <button
                    type="button"
                    onClick={() => { setOrderStep('INPUT'); setOrderFeedback(null); }}
                    className="w-full py-1 text-[10px] rounded-xs bg-[#141416] border border-[#1F1F21] text-[#E5E5E5]"
                  >
                    NEW ORDER
                  </button>
                </div>
              )}

              {orderFeedback && orderStep !== 'SUCCESS' && (
                <div className={`p-2 rounded-xs border text-xs font-mono ${
                  orderFeedback.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  {orderFeedback.msg}
                </div>
              )}
            </div>

            {/* Quick Holding Sentinel Summary */}
            <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                  Active Holdings Snapshot
                </h3>
                <span className="text-[10px] font-mono text-[#C5A059]">
                  {positions.length} Active Positions
                </span>
              </div>

              <div className="space-y-1.5">
                {positions.slice(0, 3).map(pos => (
                  <div
                    key={pos.id}
                    onClick={() => handleOpenWorkspace(pos.ticker)}
                    className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] hover:border-[#C5A059] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-[#E5E5E5]">${pos.ticker}</span>
                        <span className="text-[9px] font-mono text-[#9A9A9A]">({pos.quantity} shs)</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#7A7A7A]">
                        Entry: ${pos.avgEntryPrice.toFixed(2)} • Value: ${(pos.currentPrice * pos.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold block ${pos.unrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      </span>
                      <span className="text-[9px] font-mono text-[#C5A059] flex items-center justify-end gap-0.5">
                        <span>WORKSPACE</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {positions.length > 3 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('POSITIONS')}
                  className="w-full py-1.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono text-[#9A9A9A] hover:text-[#E5E5E5]"
                >
                  VIEW ALL {positions.length} HOLDINGS →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: FULL OPEN HOLDINGS */}
        {activeTab === 'POSITIONS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                All Active Paper Holdings ({positions.length})
              </span>
              <span className="text-[10px] font-mono text-[#9A9A9A]">
                Total Basis: ${totalCostBasis.toFixed(2)} • Total Value: ${totalMarketValue.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {positions.map(pos => (
                <div key={pos.id} className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-bold text-[#E5E5E5]">${pos.ticker}</span>
                        <span className="text-xs font-mono text-[#9A9A9A]">{pos.company}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30">
                          {pos.health?.status || 'HEALTHY'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                        {pos.quantity} Shares • Opened {pos.openedAt}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-mono font-bold block ${pos.unrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-mono ${pos.unrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                        {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[9px] font-mono">
                    <div>
                      <span className="text-[#7A7A7A] block">ENTRY / CURRENT</span>
                      <span className="text-[#E5E5E5] font-bold">${pos.avgEntryPrice.toFixed(2)} / ${pos.currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A] block">MARKET VALUE</span>
                      <span className="text-[#C5A059] font-bold">${(pos.currentPrice * pos.quantity).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A] block">STOP / TARGET</span>
                      <span className="text-[#E5E5E5]">${pos.stopLossPrice.toFixed(2)} / ${pos.targetPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenWorkspace(pos.ticker)}
                      className="flex-1 py-1.5 rounded-xs bg-[#141416] border border-[#C5A059]/40 text-[#C5A059] text-xs font-mono font-bold hover:bg-[#C5A059]/10"
                    >
                      OPEN STOCK WORKSPACE
                    </button>

                    <button
                      type="button"
                      onClick={() => setClosingPositionId(pos.id)}
                      className="py-1.5 px-3 rounded-xs bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-xs font-mono font-bold hover:bg-[#FF5252]/20"
                    >
                      CLOSE
                    </button>
                  </div>

                  {closingPositionId === pos.id && (
                    <div className="p-2.5 rounded-xs bg-[#FF5252]/10 border border-[#FF5252] text-xs font-mono space-y-1.5">
                      <span className="text-[#FF5252] font-bold block">CONFIRM LIQUIDATION:</span>
                      <p className="text-[10px] text-[#E5E5E5]">Liquidate {pos.quantity} shares of ${pos.ticker} at market price (~${pos.currentPrice.toFixed(2)})?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setClosingPositionId(null)}
                          className="flex-1 py-1 rounded-xs bg-[#141416] text-[#9A9A9A] text-[10px]"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClosePositionDirect(pos.id)}
                          className="flex-1 py-1 rounded-xs bg-[#FF5252] text-black font-bold text-[10px]"
                        >
                          CONFIRM CLOSE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: MONEY FLOW PIPELINE */}
        {activeTab === 'MONEY_FLOW' && (
          <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Capital & Money Flow Visualization
              </h3>
              <span className="text-[9px] font-mono text-[#555]">
                END-TO-END PAPER ACCOUNT LIFECYCLE
              </span>
            </div>

            <p className="text-xs font-mono text-[#9A9A9A] leading-relaxed">
              Trace how capital flows through the Imperium risk envelope — from cash reserves through order evaluation, active market holdings, unrealized valuation adjustments, and realized profit settlements.
            </p>

            {/* Flow Visual Cards Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {/* Step 1: Cash Reserve */}
              <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-1">
                <div className="text-[9px] font-mono text-[#7A7A7A] uppercase">1. CASH RESERVE</div>
                <div className="text-base font-mono font-bold text-[#E5E5E5]">${portfolio.cash.toFixed(2)}</div>
                <div className="text-[8px] font-mono text-[#4CAF50]">Ready for deployment</div>
              </div>

              {/* Step 2: Risk-Gated Orders */}
              <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-1">
                <div className="text-[9px] font-mono text-[#7A7A7A] uppercase">2. RISK GATED ORDER</div>
                <div className="text-base font-mono font-bold text-[#C5A059]">${riskLimits.perTradeCap.toFixed(0)} Max</div>
                <div className="text-[8px] font-mono text-[#9A9A9A]">Spread & Cap Checked</div>
              </div>

              {/* Step 3: Invested Capital */}
              <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-1">
                <div className="text-[9px] font-mono text-[#7A7A7A] uppercase">3. INVESTED MONEY</div>
                <div className="text-base font-mono font-bold text-[#C5A059]">${portfolio.exposureTotal.toFixed(2)}</div>
                <div className="text-[8px] font-mono text-[#9A9A9A]">{positions.length} Active Positions</div>
              </div>

              {/* Step 4: Market Valuation */}
              <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-1">
                <div className="text-[9px] font-mono text-[#7A7A7A] uppercase">4. MARKET VALUATION</div>
                <div className="text-base font-mono font-bold text-[#E5E5E5]">${totalMarketValue.toFixed(2)}</div>
                <div className={`text-[8px] font-mono ${totalUnrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                  {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)} Unrealized
                </div>
              </div>

              {/* Step 5: Realized P&L */}
              <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-1">
                <div className="text-[9px] font-mono text-[#7A7A7A] uppercase">5. REALIZED RESULT</div>
                <div className="text-base font-mono font-bold text-[#4CAF50]">+${portfolio.realizedPnLDay.toFixed(2)}</div>
                <div className="text-[8px] font-mono text-[#4CAF50]">Settled to Cash Balance</div>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-[#7A7A7A]">
                <span>CAPITAL DISTRIBUTION</span>
                <span>CASH: {((portfolio.cash / portfolio.equity) * 100).toFixed(1)}% • INVESTED: {portfolio.exposurePercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-[#0D0D0E] rounded-xs overflow-hidden flex border border-[#1F1F21]">
                <div className="bg-[#4CAF50]" style={{ width: `${Math.min(100, (portfolio.cash / portfolio.equity) * 100)}%` }} />
                <div className="bg-[#C5A059]" style={{ width: `${Math.min(100, portfolio.exposurePercent)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ORDER HISTORY & AUDIT LOG */}
        {activeTab === 'ORDERS' && (
          <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Alpaca Paper Order Ledger
              </h3>

              <div className="flex items-center gap-1">
                {(['ALL', 'FILLED', 'OPEN', 'CANCELLED'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setOrderFilter(f)}
                    className={`px-2 py-0.5 rounded-xs text-[9px] font-mono ${
                      orderFilter === f ? 'bg-[#C5A059] text-black font-bold' : 'bg-[#0D0D0E] text-[#7A7A7A]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(ord => (
                  <div key={ord.id} className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${ord.side === 'buy' ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                          {ord.side.toUpperCase()}
                        </span>
                        <span className="text-[#E5E5E5] font-bold">${ord.symbol}</span>
                        <span className="text-[#9A9A9A]">({ord.qty} Shares)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#141416] text-[#C5A059] border border-[#1F1F21]">
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#7A7A7A] block mt-0.5">
                        Client ID: {ord.client_order_id} • Type: {ord.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right text-[10px] text-[#7A7A7A]">
                      <span>{new Date(ord.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="block text-[8px] text-[#555]">{new Date(ord.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-mono text-[#7A7A7A]">
                  No orders found matching filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: CASH OUT / WITHDRAWAL AREA (STRICTLY DISABLED FOR PAPER MODE) */}
        {activeTab === 'WITHDRAWAL' && (
          <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#E5E5E5] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                Capital Withdrawal & Cash Out
              </h3>
              <span className="text-[9px] font-mono text-[#FF5252] bg-[#FF5252]/10 border border-[#FF5252]/30 px-2 py-0.5 rounded-xs font-bold">
                DISABLED IN PAPER MODE
              </span>
            </div>

            {/* Disabled Safety Banner */}
            <div className="p-3.5 rounded-xs bg-amber-950/20 border border-[#C5A059]/40 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>PAPER MODE — NO REAL FUNDS TO WITHDRAW</span>
              </div>
              <p className="text-[#D1D1D1] text-[11px] leading-relaxed">
                Imperium Command is currently operating in <strong>Alpaca Paper Trading Mode</strong>. All balances, cash reserves, equity curves, and P&L results represent simulated paper capital. Real bank wire transfers, ACH payouts, and fiat withdrawals are intentionally locked to ensure safe testing.
              </p>
            </div>

            {/* Mocked Disabled Form to show layout structure */}
            <div className="p-4 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-3 opacity-60 pointer-events-none">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-[#7A7A7A] block mb-1">AVAILABLE CASH</label>
                  <input
                    type="text"
                    disabled
                    value={`$${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    className="w-full px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#7A7A7A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#7A7A7A] block mb-1">WITHDRAWAL AMOUNT</label>
                  <input
                    type="text"
                    disabled
                    placeholder="$0.00"
                    className="w-full px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#7A7A7A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#7A7A7A] block mb-1">DESTINATION ACCOUNT</label>
                <input
                  type="text"
                  disabled
                  value="LOCKED — LIVE BROKERAGE NOT ACTIVE"
                  className="w-full px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#7A7A7A]"
                />
              </div>

              <button
                type="button"
                disabled
                className="w-full py-2 rounded-xs bg-[#1F1F21] text-[#555] font-mono text-xs font-bold cursor-not-allowed"
              >
                WITHDRAWAL LOCKED (PAPER MODE)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
