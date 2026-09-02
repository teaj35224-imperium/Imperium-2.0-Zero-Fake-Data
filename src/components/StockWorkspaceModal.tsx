import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Send, 
  CheckCircle2, 
  Briefcase, 
  Cpu, 
  Radio, 
  Layers, 
  Search, 
  Maximize2, 
  Zap,
  Info,
  DollarSign
} from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { 
  MarketQuote, 
  MarketCandle, 
  ChartTimeframe, 
  StockWorkspaceData, 
  StockChartMarker,
  WorkerDeskType 
} from '../types';

export const StockWorkspaceModal: React.FC = () => {
  const { 
    selectedTicker, 
    setSelectedTicker, 
    setActiveModal, 
    quotes, 
    positions, 
    riskLimits, 
    createPaperOrder, 
    closePosition,
    isAlpacaPaperConnected,
    portfolio
  } = useImperium();

  const activeSymbol = (selectedTicker || 'NVDA').toUpperCase();
  const [workspaceData, setWorkspaceData] = useState<StockWorkspaceData | null>(null);
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1D');
  const [chartMode, setChartMode] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [hoveredCandle, setHoveredCandle] = useState<MarketCandle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Paper Trade Order Form State
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderStep, setOrderStep] = useState<'INPUT' | 'REVIEW' | 'SUCCESS'>('INPUT');
  const [orderFeedback, setOrderFeedback] = useState<{ msg: string; success: boolean } | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Fetch Stock Workspace Data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/stocks/${activeSymbol}/workspace`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.workspace) {
          setWorkspaceData(data.workspace);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeSymbol, positions]);

  // Fetch Multi-Timeframe Candles
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/markets/candles/${activeSymbol}?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data.candles)) {
          setCandles(data.candles);
        }
      })
      .catch(console.error);

    return () => { isMounted = false; };
  }, [activeSymbol, timeframe]);

  const currentQuote: MarketQuote = workspaceData?.quote || quotes.find(q => q.ticker === activeSymbol) || {
    ticker: activeSymbol,
    company: activeSymbol,
    price: 0,
    change: 0,
    changePercent: 0,
    bid: 0,
    ask: 0,
    spread: 0,
    volume: 0,
    relativeVolume: 0,
    high: 0,
    low: 0,
    open: 0,
    previousClose: 0,
    timestamp: '',
    dataStatus: 'DATA NOT FOUND',
    provider: 'UNAVAILABLE'
  };

  const ownedPosition = positions.find(p => p.ticker === activeSymbol);

  // Chart calculation metrics
  const minPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 0;
  const priceRange = Math.max(0.01, maxPrice - minPrice);
  const maxVolume = candles.length > 0 ? Math.max(...candles.map(c => c.volume)) : 0;

  const estimatedOrderCost = (currentQuote.price * orderQty);
  const isOverPerTradeCap = estimatedOrderCost > riskLimits.perTradeCap;

  const handleExecuteTrade = async () => {
    setIsSubmittingOrder(true);
    setOrderFeedback(null);

    const result = await createPaperOrder({
      ticker: activeSymbol,
      qty: Number(orderQty),
      side: orderSide,
      type: 'market',
      workerSource: 'Stock Workspace',
      strategy: workspaceData?.nexusThesis?.summary || 'Stock Workspace Allocation',
      setup: `${orderSide.toUpperCase()} ${orderQty} ${activeSymbol} @ ~$${currentQuote.price.toFixed(2)}`
    });

    setIsSubmittingOrder(false);
    if (result.success) {
      setOrderStep('SUCCESS');
      setOrderFeedback({ msg: result.message, success: true });
    } else {
      setOrderFeedback({ msg: result.reason || result.message, success: false });
    }
  };

  const handleClosePosition = async () => {
    if (!ownedPosition) return;
    setIsSubmittingOrder(true);
    const ok = await closePosition(ownedPosition.id);
    setIsSubmittingOrder(false);
    if (ok) {
      setOrderFeedback({ msg: `Position $${activeSymbol} liquidated successfully.`, success: true });
    }
  };

  const allSymbols = Array.from(new Set([
    ...quotes.map(q => q.ticker),
    ...positions.map(p => p.ticker),
    'NVDA', 'PLTR', 'CRWD', 'KULR', 'IONQ', 'MSFT', 'SOUN'
  ]));

  const filteredSymbols = allSymbols.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto py-3 space-y-3">
        {/* Top Header & Navigation */}
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

            <button
              type="button"
              onClick={() => setActiveModal('PORTFOLIO')}
              className="px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5] text-xs font-mono transition-colors"
            >
              PORTFOLIO
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSearching(!isSearching)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-xs font-mono text-[#C5A059] hover:border-[#C5A059]/40"
              >
                <Search className="w-3.5 h-3.5" />
                <span>CHANGE TICKER</span>
              </button>

              {isSearching && (
                <div className="absolute right-0 top-full mt-1.5 w-64 p-2 rounded-xs bg-[#141416] border border-[#C5A059] shadow-2xl z-50">
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    placeholder="ENTER TICKER..."
                    className="w-full px-2 py-1.5 mb-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] focus:outline-none focus:border-[#C5A059]"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredSymbols.map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          setSelectedTicker(sym);
                          setIsSearching(false);
                          setSearchTerm('');
                        }}
                        className="w-full px-2 py-1 text-left text-xs font-mono rounded-xs hover:bg-[#C5A059]/20 text-[#E5E5E5] flex items-center justify-between"
                      >
                        <span className="font-bold">${sym}</span>
                        <span className="text-[10px] text-[#7A7A7A]">SELECT</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
              STOCK WORKSPACE
            </span>
          </div>
        </div>

        {/* Stock Primary Header Card */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-mono font-bold text-[#E5E5E5] tracking-tight">
                  ${currentQuote.ticker}
                </h1>
                <span className="text-sm font-mono text-[#9A9A9A] font-medium">
                  {currentQuote.company}
                </span>
                {ownedPosition && (
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#C5A059] text-black">
                    OWNED • {ownedPosition.quantity} SHS
                  </span>
                )}
              </div>

              {/* Bid / Ask / Spread / Volume Sub-Header */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#7A7A7A] mt-1.5">
                <span>BID: <strong className="text-[#E5E5E5]">${currentQuote.bid.toFixed(2)}</strong></span>
                <span>ASK: <strong className="text-[#E5E5E5]">${currentQuote.ask.toFixed(2)}</strong></span>
                <span>SPREAD: <strong className={currentQuote.spread <= 0.05 ? 'text-[#4CAF50]' : 'text-orange-400'}>${currentQuote.spread.toFixed(3)}</strong></span>
                <span>VOL: <strong className="text-[#E5E5E5]">{(currentQuote.volume / 1000000).toFixed(2)}M</strong></span>
                <span>REL VOL: <strong className="text-[#C5A059]">{currentQuote.relativeVolume}x</strong></span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E5E5E5]">
                ${currentQuote.price.toFixed(2)}
              </div>
              <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                currentQuote.change >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'
              }`}>
                {currentQuote.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.change >= 0 ? '+' : ''}{currentQuote.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="text-[9px] font-mono text-[#555] mt-1 flex items-center justify-end gap-1.5">
                <Radio className={`w-2.5 h-2.5 ${isAlpacaPaperConnected ? 'text-[#4CAF50]' : 'text-[#7A7A7A]'}`} />
                <span>{workspaceData?.quote?.provider === 'ALPACA' ? 'ALPACA IEX LIVE' : workspaceData?.quote?.provider === 'YAHOO_FINANCE_SEC' ? 'PUBLIC MARKET DATA' : 'DATA NOT FOUND'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Stock Chart Section */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-3">
          {/* Chart Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1F1F21]">
            <div className="flex items-center gap-1">
              {(['1D', '5D', '1M', '3M', '1Y'] as ChartTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-[#C5A059] text-black font-bold'
                      : 'bg-[#0D0D0E] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xs bg-[#0D0D0E] border border-[#1F1F21] p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setChartMode('CANDLE')}
                  className={`px-2 py-0.5 rounded-xs transition-colors ${
                    chartMode === 'CANDLE' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#7A7A7A]'
                  }`}
                >
                  CANDLES
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('LINE')}
                  className={`px-2 py-0.5 rounded-xs transition-colors ${
                    chartMode === 'LINE' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#7A7A7A]'
                  }`}
                >
                  LINE AREA
                </button>
              </div>

              {hoveredCandle && (
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono bg-[#0D0D0E] px-2 py-1 rounded-xs border border-[#1F1F21] text-[#9A9A9A]">
                  <span>T: <strong className="text-[#E5E5E5]">{hoveredCandle.time}</strong></span>
                  <span>O: <strong className="text-[#E5E5E5]">${hoveredCandle.open.toFixed(2)}</strong></span>
                  <span>H: <strong className="text-[#4CAF50]">${hoveredCandle.high.toFixed(2)}</strong></span>
                  <span>L: <strong className="text-[#FF5252]">${hoveredCandle.low.toFixed(2)}</strong></span>
                  <span>C: <strong className="text-[#E5E5E5]">${hoveredCandle.close.toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Chart Canvas / SVG Render */}
          <div className="relative h-56 sm:h-64 w-full bg-[#0D0D0E] rounded-xs border border-[#1F1F21] p-2 flex flex-col justify-between overflow-hidden">
            {/* Price Scale Gridlines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[9px] font-mono text-[#333]">
              <div className="border-b border-[#1A1A1D] flex justify-between">
                <span>HIGH: ${maxPrice.toFixed(2)}</span>
                <span>RESISTANCE BOUNDARY</span>
              </div>
              <div className="border-b border-[#1A1A1D] flex justify-between">
                <span>MID: ${((maxPrice + minPrice) / 2).toFixed(2)}</span>
                <span>EQUILIBRIUM</span>
              </div>
              <div className="border-b border-[#1A1A1D] flex justify-between">
                <span>LOW: ${minPrice.toFixed(2)}</span>
                <span>SUPPORT BASELINE</span>
              </div>
            </div>

            {/* Overlaid Marker Lines (Entry, Stop Loss, Profit Target) */}
            {ownedPosition && (
              <>
                {/* Entry Marker Line */}
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-[#C5A059] z-10 pointer-events-none flex items-center justify-end pr-2"
                  style={{
                    bottom: `${Math.max(5, Math.min(95, ((ownedPosition.avgEntryPrice - minPrice) / priceRange) * 100))}%`
                  }}
                >
                  <span className="bg-[#C5A059] text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
                    ENTRY: ${ownedPosition.avgEntryPrice.toFixed(2)}
                  </span>
                </div>

                {/* Stop Loss Line */}
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-[#FF5252] z-10 pointer-events-none flex items-center justify-end pr-2"
                  style={{
                    bottom: `${Math.max(5, Math.min(95, ((ownedPosition.stopLossPrice - minPrice) / priceRange) * 100))}%`
                  }}
                >
                  <span className="bg-[#FF5252] text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
                    STOP: ${ownedPosition.stopLossPrice.toFixed(2)}
                  </span>
                </div>

                {/* Profit Target Line */}
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-[#4CAF50] z-10 pointer-events-none flex items-center justify-end pr-2"
                  style={{
                    bottom: `${Math.max(5, Math.min(95, ((ownedPosition.targetPrice - minPrice) / priceRange) * 100))}%`
                  }}
                >
                  <span className="bg-[#4CAF50] text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
                    TARGET: ${ownedPosition.targetPrice.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* Render Bars / Candlesticks */}
            {chartMode === 'CANDLE' ? (
              <div className="relative h-44 flex items-end justify-between gap-1 z-0">
                {candles.map((c, i) => {
                  const isGreen = c.close >= c.open;
                  const candleHeight = Math.max(4, (Math.abs(c.close - c.open) / priceRange) * 100);
                  const bottomPercent = ((Math.min(c.open, c.close) - minPrice) / priceRange) * 100;
                  const wickTop = ((c.high - minPrice) / priceRange) * 100;
                  const wickBottom = ((c.low - minPrice) / priceRange) * 100;

                  return (
                    <div 
                      key={i} 
                      onMouseEnter={() => setHoveredCandle(c)}
                      onMouseLeave={() => setHoveredCandle(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-crosshair min-w-[4px]"
                    >
                      {/* High-Low Wick */}
                      <div 
                        className={`w-[1px] absolute ${isGreen ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'}`}
                        style={{
                          bottom: `${Math.max(0, Math.min(100, wickBottom))}%`,
                          height: `${Math.max(2, Math.min(100, wickTop - wickBottom))}%`
                        }}
                      />

                      {/* Candle Body */}
                      <div 
                        className={`w-full max-w-[8px] rounded-2xs absolute ${
                          isGreen ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'
                        } group-hover:brightness-125`}
                        style={{
                          bottom: `${Math.max(0, Math.min(95, bottomPercent))}%`,
                          height: `${Math.max(3, Math.min(95, candleHeight))}%`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Line Area SVG Mode */
              <div className="relative h-44 w-full z-0">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C5A059" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {candles.length > 1 && (
                    <>
                      {/* Area polygon */}
                      <polygon
                        points={`0,100 ${candles.map((c, i) => `${(i / (candles.length - 1)) * 100},${100 - (((c.close - minPrice) / priceRange) * 100)}`).join(' ')} 100,100`}
                        fill="url(#areaGradient)"
                      />
                      {/* Line stroke */}
                      <polyline
                        fill="none"
                        stroke="#C5A059"
                        strokeWidth="1.8"
                        points={candles.map((c, i) => `${(i / (candles.length - 1)) * 100},${100 - (((c.close - minPrice) / priceRange) * 100)}`).join(' ')}
                      />
                    </>
                  )}
                </svg>
              </div>
            )}

            {/* Volume Histogram Sub-Panel */}
            <div className="h-10 border-t border-[#1F1F21] pt-1 flex items-end justify-between gap-1 z-0">
              {candles.map((c, i) => {
                const volHeight = Math.max(10, (c.volume / maxVolume) * 100);
                const isGreen = c.close >= c.open;
                return (
                  <div
                    key={`vol-${i}`}
                    className={`flex-1 min-w-[2px] rounded-t-2xs ${isGreen ? 'bg-[#4CAF50]/40' : 'bg-[#FF5252]/40'}`}
                    style={{ height: `${volHeight}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Left: Live Intelligence & Nexus Thesis | Right: Position Status & Risk-Gated Order Desk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Left Column: Live Activity & Nexus Supervisory Intelligence */}
          <div className="space-y-3">
            {/* Live Intelligence Activity Panel */}
            <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Live Intelligence & Activity Panel
                </span>
                <span className="text-[9px] font-mono text-[#555]">
                  REAL-TIME NEXUS AUDIT
                </span>
              </div>

              <div className="space-y-1.5">
                {(workspaceData?.liveActivities || [
                  {
                    id: 'act-1',
                    timestamp: 'Just now',
                    source: 'Nexus Chief-of-Staff',
                    actionText: 'SUPERVISING THESIS INTEGRITY',
                    detail: `Auditing volume profile and bid-ask spread stability for $${activeSymbol}.`,
                    status: 'IN_PROGRESS'
                  },
                  {
                    id: 'act-2',
                    timestamp: '1m ago',
                    source: 'Momentum Desk',
                    actionText: 'COMPARING RELATIVE VOLUME',
                    detail: `Relative volume confirmed at ${currentQuote.relativeVolume}x vs 30-day moving average.`,
                    status: 'VERIFIED'
                  }
                ]).map((act: any) => (
                  <div key={act.id} className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] flex items-start justify-between gap-2 text-[10px] font-mono">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#C5A059] font-medium">{act.source}</span>
                        <span className="text-[#555]">•</span>
                        <span className="text-[#E5E5E5] font-bold">{act.actionText}</span>
                      </div>
                      <p className="text-[#9A9A9A] text-[9px] mt-0.5">{act.detail}</p>
                    </div>
                    <span className="text-[9px] text-[#7A7A7A] shrink-0">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nexus Thesis & Specialist Findings */}
            <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#E5E5E5] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#C5A059]" />
                  Nexus Supervisory Thesis & Findings
                </span>
                <span className="text-[9px] font-mono text-[#4CAF50] bg-[#4CAF50]/10 px-1.5 py-0.5 rounded-xs border border-[#4CAF50]/30">
                  CONVICTION: {workspaceData?.nexusThesis?.conviction || 'DATA NOT FOUND'} {workspaceData?.nexusThesis?.confidence != null ? `(${workspaceData.nexusThesis.confidence}%)` : ''}
                </span>
              </div>

              <div className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono space-y-2">
                <p className="text-[#D1D1D1] text-[11px] leading-relaxed">
                  {workspaceData?.nexusThesis?.summary || 'NEXUS ANALYSIS NOT FOUND'}
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1F1F21] text-[9px]">
                  <div>
                    <span className="text-[#7A7A7A] block">ENTRY RANGE</span>
                    <span className="text-[#C5A059] font-bold">{workspaceData?.nexusThesis?.entryRange || 'DATA NOT FOUND'}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block">PROFIT TARGET</span>
                    <span className="text-[#4CAF50] font-bold">{workspaceData?.nexusThesis?.exitTarget || 'DATA NOT FOUND'}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7A7A] block">STOP BOUNDARY</span>
                    <span className="text-[#FF5252] font-bold">{workspaceData?.nexusThesis?.stopBoundary || 'DATA NOT FOUND'}</span>
                  </div>
                </div>
              </div>

              {/* Specialist Worker Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-[#7A7A7A] block uppercase">
                  Worker Desk Findings
                </span>
                {(workspaceData?.workerFindings || []).map((wf: any) => (
                  <div key={wf.workerId} className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] flex items-center justify-between text-[10px] font-mono">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#E5E5E5] font-bold">{wf.workerName}</span>
                        <span className="text-[8px] text-[#C5A059] px-1 py-0.2 rounded-2xs bg-[#C5A059]/10">{wf.specialty}</span>
                      </div>
                      <span className="text-[#9A9A9A] text-[9px] block mt-0.5">{wf.signal}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs ${
                      wf.status === 'BULLISH' ? 'text-[#4CAF50] bg-[#4CAF50]/10' : 'text-[#7A7A7A] bg-[#141416]'
                    }`}>
                      {wf.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Position Status, Risk Verification & Risk-Gated Order Desk */}
          <div className="space-y-3">
            
            {/* Position Details if Owned */}
            {ownedPosition ? (
              <div className="p-3.5 rounded-sm bg-[#141416] border border-[#C5A059]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Holding Status & Sentinel Health
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30">
                    HEALTH: {ownedPosition.health?.status || 'HEALTHY'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                    <span className="text-[#7A7A7A] text-[9px] block">QUANTITY</span>
                    <span className="text-[#E5E5E5] font-bold">{ownedPosition.quantity} Shares</span>
                  </div>
                  <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                    <span className="text-[#7A7A7A] text-[9px] block">COST BASIS</span>
                    <span className="text-[#E5E5E5] font-bold">${(ownedPosition.avgEntryPrice * ownedPosition.quantity).toFixed(2)}</span>
                  </div>
                  <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                    <span className="text-[#7A7A7A] text-[9px] block">MARKET VALUE</span>
                    <span className="text-[#E5E5E5] font-bold">${(ownedPosition.currentPrice * ownedPosition.quantity).toFixed(2)}</span>
                  </div>
                  <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
                    <span className="text-[#7A7A7A] text-[9px] block">UNREALIZED P&L</span>
                    <span className={`font-bold ${ownedPosition.unrealizedPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                      {ownedPosition.unrealizedPnL >= 0 ? '+' : ''}${ownedPosition.unrealizedPnL.toFixed(2)} ({ownedPosition.unrealizedPnLPercent >= 0 ? '+' : ''}{ownedPosition.unrealizedPnLPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClosePosition}
                  disabled={isSubmittingOrder}
                  className="w-full py-2 rounded-xs bg-[#FF5252]/20 border border-[#FF5252]/40 text-[#FF5252] font-mono text-xs font-bold hover:bg-[#FF5252]/30 active:scale-[0.99] transition-all"
                >
                  {isSubmittingOrder ? 'CLOSING POSITION...' : `CLOSE POSITION (${ownedPosition.quantity} SHARES)`}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-sm bg-[#141416] border border-[#1F1F21] flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C5A059]" />
                  <span>Not currently held in portfolio.</span>
                </div>
                <span className="text-[10px] text-[#C5A059] font-bold">1-TOUCH ALLOCATION READY</span>
              </div>
            )}

            {/* Risk Gate Suitability Check */}
            <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#E5E5E5] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4CAF50]" />
                  Risk Engine Gate Check
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs ${
                  riskLimits.riskState === 'SAFE' ? 'text-[#4CAF50] bg-[#4CAF50]/10 border border-[#4CAF50]/30' : 'text-orange-400 bg-orange-950/40'
                }`}>
                  RISK: {riskLimits.riskState}
                </span>
              </div>

              <div className="space-y-1 text-[10px] font-mono text-[#9A9A9A]">
                <div className="flex items-center justify-between">
                  <span>Per-Trade Allocation Limit:</span>
                  <span className="text-[#E5E5E5] font-bold">${riskLimits.perTradeCap.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spread Tolerance Check:</span>
                  <span className={currentQuote.spread <= riskLimits.maxSpreadAllowed ? 'text-[#4CAF50]' : 'text-[#FF5252]'}>
                    ${currentQuote.spread.toFixed(3)} / ${riskLimits.maxSpreadAllowed.toFixed(3)} max
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Portfolio Capacity:</span>
                  <span className="text-[#E5E5E5]">{positions.length} / {riskLimits.maxConcurrentPositions} slots</span>
                </div>
              </div>
            </div>

            {/* Risk-Gated Paper Order Desk */}
            <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Paper Order Interaction
                </h3>
                <span className="text-[10px] font-mono text-[#7A7A7A]">
                  TWO-STEP RISK REVIEW
                </span>
              </div>

              {orderStep === 'INPUT' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-[#7A7A7A] block mb-1">ORDER SIDE</label>
                      <div className="grid grid-cols-2 gap-1 bg-[#0D0D0E] p-0.5 rounded-xs border border-[#1F1F21]">
                        <button
                          type="button"
                          onClick={() => setOrderSide('buy')}
                          className={`py-1 rounded-2xs font-bold text-center transition-colors ${
                            orderSide === 'buy' ? 'bg-[#4CAF50] text-black' : 'text-[#7A7A7A]'
                          }`}
                        >
                          BUY
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderSide('sell')}
                          className={`py-1 rounded-2xs font-bold text-center transition-colors ${
                            orderSide === 'sell' ? 'bg-[#FF5252] text-black' : 'text-[#7A7A7A]'
                          }`}
                        >
                          SELL
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7A7A7A] block mb-1">SHARES</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Estimated Cost calculation & Risk Cap Warning */}
                  <div className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-[#7A7A7A] block">ESTIMATED NOTIONAL</span>
                      <span className="text-[#E5E5E5] font-bold">${estimatedOrderCost.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-[#7A7A7A] block">CAP CHECK</span>
                      <span className={isOverPerTradeCap ? 'text-[#FF5252] font-bold' : 'text-[#4CAF50] font-bold'}>
                        {isOverPerTradeCap ? `EXCEEDS $${riskLimits.perTradeCap}` : `UNDER $${riskLimits.perTradeCap}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrderStep('REVIEW')}
                    disabled={riskLimits.emergencyFreezeActive}
                    className="w-full py-2.5 rounded-xs bg-[#C5A059] text-black font-mono text-xs uppercase font-bold hover:bg-[#d4b067] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>REVIEW PAPER ORDER DETAILS</span>
                  </button>
                </div>
              )}

              {orderStep === 'REVIEW' && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#C5A059] space-y-1.5">
                    <span className="text-[10px] text-[#C5A059] block font-bold">CONFIRM PAPER ALLOCATION:</span>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A7A]">ACTION:</span>
                      <span className="text-[#E5E5E5] font-bold">{orderSide.toUpperCase()} {orderQty} SHARES</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A7A]">SYMBOL:</span>
                      <span className="text-[#E5E5E5] font-bold">${activeSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A7A]">EST. PRICE:</span>
                      <span className="text-[#E5E5E5] font-bold">${currentQuote.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#1F1F21]">
                      <span className="text-[#7A7A7A]">TOTAL VALUE:</span>
                      <span className="text-[#C5A059] font-bold">${estimatedOrderCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderStep('INPUT')}
                      className="py-2 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] font-mono text-xs font-bold hover:text-white"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteTrade}
                      disabled={isSubmittingOrder}
                      className="py-2 rounded-xs bg-[#C5A059] text-black font-mono text-xs font-bold hover:bg-[#d4b067] flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingOrder ? 'ROUTING...' : 'CONFIRM FILL'}</span>
                    </button>
                  </div>
                </div>
              )}

              {orderStep === 'SUCCESS' && (
                <div className="p-3 rounded-xs bg-[#4CAF50]/10 border border-[#4CAF50]/40 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-[#4CAF50] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PAPER ORDER TRANSMITTED</span>
                  </div>
                  <p className="text-[#D1D1D1] text-[10px]">
                    {orderFeedback?.msg || `Filled ${orderQty} shares of $${activeSymbol} in Alpaca Paper.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStep('INPUT');
                      setOrderFeedback(null);
                    }}
                    className="w-full py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#E5E5E5] text-[10px]"
                  >
                    PLACE ANOTHER ORDER
                  </button>
                </div>
              )}

              {orderFeedback && orderStep !== 'SUCCESS' && (
                <div className={`p-2 rounded-xs border text-xs font-mono ${
                  orderFeedback.success 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  {orderFeedback.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
