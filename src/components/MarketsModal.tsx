import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Radio, BarChart3, Star, Filter } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { MarketQuote, MarketCandle, WatchlistItem, WorkerDeskType } from '../types';

export const MarketsModal: React.FC = () => {
  const { quotes, watchlist, setActiveModal, isAlpacaPaperConnected, openStockWorkspace } = useImperium();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<string>('ALL');
  const [activeQuote, setActiveQuote] = useState<MarketQuote | null>(quotes[0] || null);
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);

  const desks: string[] = [
    'ALL',
    'PENNY DESK',
    'MOMENTUM / BREAKOUT',
    'SWING',
    'LONG-TERM / RETIREMENT'
  ];

  // Fetch candles when active quote changes
  useEffect(() => {
    if (!activeQuote) return;
    setIsLoadingCandles(true);
    fetch(`/api/markets/candles/${activeQuote.ticker}`)
      .then(res => res.json())
      .then(data => {
        if (data.candles) setCandles(data.candles);
      })
      .catch(console.error)
      .finally(() => setIsLoadingCandles(false));
  }, [activeQuote?.ticker]);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
            MARKET COMMAND AREA
          </span>
        </div>

        {/* Data Provider Connectivity Banner */}
        <div className={`p-2.5 rounded-xs border mb-3 flex items-center justify-between text-[10px] font-mono ${
          isAlpacaPaperConnected
            ? 'bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]'
            : 'bg-[#141416] border-[#1F1F21] text-[#7A7A7A]'
        }`}>
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isAlpacaPaperConnected ? 'text-[#4CAF50]' : 'text-[#7A7A7A]'}`} />
            <span>{isAlpacaPaperConnected ? 'ALPACA MARKET DATA: LIVE' : 'ALPACA MARKET DATA: NOT CONNECTED'}</span>
          </div>
          <span className="text-[#555]">NO FAKE VALUES</span>
        </div>

        {/* Symbol Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A7A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH TICKER OR COMPANY (e.g. NVDA, PLTR, CRWD, KULR)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] placeholder-[#7A7A7A] focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Desk Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {desks.map(desk => (
            <button
              key={desk}
              type="button"
              onClick={() => setSelectedDesk(desk)}
              className={`px-2.5 py-1 rounded-xs text-[9px] font-mono uppercase whitespace-nowrap transition-colors touch-manipulation cursor-pointer ${
                selectedDesk === desk
                  ? 'bg-[#C5A059] text-[#0D0D0E] font-medium'
                  : 'bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5]'
              }`}
            >
              {desk}
            </button>
          ))}
        </div>

        {/* Active Stock Intelligence Screen (if selected) */}
        {activeQuote && (
          <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-4 space-y-3">
            {/* Header: Ticker, Price, Spread */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-mono font-bold text-[#E5E5E5]">
                    ${activeQuote.ticker}
                  </h2>
                  <span className="text-xs font-mono text-[#9A9A9A]">
                    {activeQuote.company}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
                  BID: ${activeQuote.bid.toFixed(2)} • ASK: ${activeQuote.ask.toFixed(2)} • SPREAD: ${activeQuote.spread.toFixed(3)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-mono font-bold text-[#E5E5E5]">
                  ${activeQuote.price.toFixed(2)}
                </div>
                <div className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${
                  activeQuote.change >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'
                }`}>
                  {activeQuote.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{activeQuote.change >= 0 ? '+' : ''}{activeQuote.change.toFixed(2)} ({activeQuote.change >= 0 ? '+' : ''}{activeQuote.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            {/* Candlestick / Bar Chart Visualization */}
            <div className="p-3 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7A7A] mb-2">
                <span className="flex items-center gap-1 text-[#C5A059]">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>INTRADAY 15-MIN CANDLES</span>
                </span>
                <span className="text-[#555]">VOL: {(activeQuote.volume / 1000000).toFixed(1)}M</span>
              </div>

              {isLoadingCandles ? (
                <div className="h-32 flex items-center justify-center text-xs font-mono text-[#7A7A7A]">
                  Loading candle telemetry...
                </div>
              ) : (
                <div className="h-36 flex items-end justify-between gap-1 pt-4 pb-1 overflow-x-auto no-scrollbar">
                  {candles.map((c, i) => {
                    const isGreen = c.close >= c.open;
                    const minPrice = Math.min(...candles.map(x => x.low));
                    const maxPrice = Math.max(...candles.map(x => x.high));
                    const range = Math.max(0.01, maxPrice - minPrice);
                    
                    const heightPercent = Math.max(10, Math.min(95, ((c.close - minPrice) / range) * 100));

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center min-w-[10px] h-full justify-end group relative">
                        {/* High/Low Wick */}
                        <div className={`w-[1px] ${isGreen ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'} opacity-75`} style={{ height: '100%' }} />
                        {/* Candle Body */}
                        <div 
                          className={`w-full max-w-[8px] rounded-xs absolute bottom-0 ${
                            isGreen ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* OHLC Sub-matrix */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
                <span className="text-[#7A7A7A] block text-[8px]">OPEN</span>
                <span className="text-[#E5E5E5] font-medium">${activeQuote.open.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
                <span className="text-[#7A7A7A] block text-[8px]">HIGH</span>
                <span className="text-[#4CAF50] font-medium">${activeQuote.high.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
                <span className="text-[#7A7A7A] block text-[8px]">LOW</span>
                <span className="text-[#FF5252] font-medium">${activeQuote.low.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
                <span className="text-[#7A7A7A] block text-[8px]">PREV CLOSE</span>
                <span className="text-[#9A9A9A] font-medium">${activeQuote.previousClose.toFixed(2)}</span>
              </div>
            </div>

            {/* Direct Paper Order Execution Bar */}
            <div className="mt-3 pt-3 border-t border-[#1F1F21] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openStockWorkspace(activeQuote.ticker)}
                className="px-3 py-1.5 rounded-xs bg-[#141416] border border-[#C5A059]/40 text-[#C5A059] font-mono text-[10px] uppercase font-bold hover:bg-[#C5A059]/10 active:scale-95 transition-all"
              >
                OPEN ${activeQuote.ticker} WORKSPACE & CHART →
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal('PORTFOLIO');
                }}
                className="px-3 py-1.5 rounded-xs bg-[#C5A059] text-black font-mono text-[10px] uppercase font-bold hover:bg-[#d4b067] active:scale-95 transition-all"
              >
                OPEN PAPER ORDER DESK
              </button>
            </div>
          </div>
        )}


        {/* Market Quotes List */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A] block mb-1">
            All Monitored Symbols ({filteredQuotes.length})
          </span>

          {filteredQuotes.map((q) => (
            <div
              key={q.ticker}
              onClick={() => setActiveQuote(q)}
              className={`p-3 rounded-sm border transition-all cursor-pointer active:scale-[0.99] touch-manipulation flex items-center justify-between ${
                activeQuote?.ticker === q.ticker
                  ? 'bg-[#141416] border-[#C5A059]'
                  : 'bg-[#141416] border-[#1F1F21] hover:border-[#333]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-bold text-[#E5E5E5]">
                      ${q.ticker}
                    </span>
                    <span className="text-[10px] font-mono text-[#9A9A9A]">
                      {q.company}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#7A7A7A]">
                    Vol: {(q.volume / 1000000).toFixed(1)}M • RelVol: {q.relativeVolume}x
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm font-mono font-bold text-[#E5E5E5]">
                  ${q.price.toFixed(2)}
                </span>
                <span className={`text-[10px] font-mono font-medium ${q.change >= 0 ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}>
                  {q.change >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
