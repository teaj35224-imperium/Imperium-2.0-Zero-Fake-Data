// Authoritative Server-Side Market Data Service
// Single source of truth for all quote and historical candle telemetry.
// Eliminates all fake math.random price movements and synthetic fallbacks.

import type { MarketQuote, MarketCandle, ChartTimeframe } from '../types';

export interface AuthoritativeMarketData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  spread: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  volume: number;
  relativeVolume: number;
  provider: 'ALPACA' | 'YAHOO_FINANCE_SEC' | 'UNAVAILABLE';
  feed: 'IEX' | 'SIP' | 'CONSOLIDATED' | 'OFFLINE';
  sourceTimestamp: string;
  serverReceivedTimestamp: string;
  ageMs: number;
  freshnessState: 'FRESH' | 'AGING' | 'STALE' | 'UNAVAILABLE';
  errorReason?: string;
  bars?: MarketCandle[];
}

export function getAlpacaCredentials() {
  const key = process.env.APCA_API_KEY_ID || process.env.ALPACA_API_KEY_ID || '';
  const secret = process.env.APCA_API_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '';
  const paperBaseUrl = process.env.APCA_API_BASE_URL || 'https://paper-api.alpaca.markets';
  const dataBaseUrl = process.env.APCA_DATA_BASE_URL || 'https://data.alpaca.markets';

  // Safety Lock verification: Ensure base URL is strictly paper
  const isPaper = paperBaseUrl.includes('paper-api.alpaca.markets');
  if (key && !isPaper) {
    console.error('CRITICAL SAFETY LOCK: Non-paper endpoint detected! Alpaca execution locked.');
  }

  const isConfigured = Boolean(key && secret && isPaper);
  return {
    key,
    secret,
    paperBaseUrl,
    dataBaseUrl,
    isConfigured,
    isPaperSafe: isPaper
  };
}

// In-memory cache for fast sub-second querying (TTL: 3 seconds for quotes)
const quoteCache = new Map<string, { data: AuthoritativeMarketData; timestamp: number }>();
const barsCache = new Map<string, { candles: MarketCandle[]; timestamp: number }>();

export class MarketDataService {
  /**
   * Fetch live quote for a specific ticker
   */
  public async getQuote(symbol: string): Promise<AuthoritativeMarketData> {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!cleanSymbol) {
      return this.buildUnavailableQuote(symbol, 'Empty symbol provided');
    }

    const cached = quoteCache.get(cleanSymbol);
    const now = Date.now();
    if (cached && (now - cached.timestamp < 3000)) {
      return {
        ...cached.data,
        ageMs: now - cached.timestamp,
        freshnessState: (now - cached.timestamp < 10000) ? 'FRESH' : 'AGING'
      };
    }

    // Try Alpaca Data Feed first if credentials configured
    const creds = getAlpacaCredentials();
    if (creds.isConfigured) {
      try {
        const alpacaQuote = await this.fetchFromAlpaca(cleanSymbol, creds);
        if (alpacaQuote) {
          quoteCache.set(cleanSymbol, { data: alpacaQuote, timestamp: now });
          return alpacaQuote;
        }
      } catch (err: any) {
        console.warn(`[MarketData] Alpaca fetch error for ${cleanSymbol}:`, err.message);
      }
    }

    // Secondary Authoritative Feed: Public Yahoo Finance Real-time Chart/Quote Endpoint
    try {
      const publicQuote = await this.fetchFromPublicFeed(cleanSymbol);
      if (publicQuote) {
        quoteCache.set(cleanSymbol, { data: publicQuote, timestamp: now });
        return publicQuote;
      }
    } catch (err: any) {
      console.warn(`[MarketData] Public feed fetch error for ${cleanSymbol}:`, err.message);
    }

    return this.buildUnavailableQuote(cleanSymbol, 'Unable to retrieve live quote from Alpaca or public feeds');
  }

  /**
   * Fetch Multi-Timeframe OHLCV Candles for a ticker
   */
  public async getCandles(symbol: string, timeframe: ChartTimeframe = '1D'): Promise<MarketCandle[]> {
    const cleanSymbol = symbol.toUpperCase().trim();
    const cacheKey = `${cleanSymbol}_${timeframe}`;
    const cached = barsCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < 15000)) {
      return cached.candles;
    }

    const creds = getAlpacaCredentials();
    if (creds.isConfigured) {
      try {
        const alpacaCandles = await this.fetchCandlesFromAlpaca(cleanSymbol, timeframe, creds);
        if (alpacaCandles && alpacaCandles.length > 0) {
          barsCache.set(cacheKey, { candles: alpacaCandles, timestamp: now });
          return alpacaCandles;
        }
      } catch (err: any) {
        console.warn(`[MarketData] Alpaca candles fetch error for ${cleanSymbol}:`, err.message);
      }
    }

    try {
      const publicCandles = await this.fetchCandlesFromPublicFeed(cleanSymbol, timeframe);
      if (publicCandles && publicCandles.length > 0) {
        barsCache.set(cacheKey, { candles: publicCandles, timestamp: now });
        return publicCandles;
      }
    } catch (err: any) {
      console.warn(`[MarketData] Public feed candles fetch error for ${cleanSymbol}:`, err.message);
    }

    return [];
  }

  /**
   * Fetch multiple quotes in batch
   */
  public async getBatchQuotes(symbols: string[]): Promise<AuthoritativeMarketData[]> {
    const promises = symbols.map(s => this.getQuote(s));
    return Promise.all(promises);
  }

  private async fetchFromAlpaca(symbol: string, creds: ReturnType<typeof getAlpacaCredentials>): Promise<AuthoritativeMarketData | null> {
    const quoteUrl = `${creds.dataBaseUrl}/v2/stocks/${symbol}/quotes/latest?feed=iex`;
    const barUrl = `${creds.dataBaseUrl}/v2/stocks/${symbol}/bars/latest?feed=iex`;

    const headers = {
      'APCA-API-KEY-ID': creds.key,
      'APCA-API-SECRET-KEY': creds.secret,
      'Content-Type': 'application/json'
    };

    const [quoteRes, barRes] = await Promise.all([
      fetch(quoteUrl, { headers }),
      fetch(barUrl, { headers })
    ]);

    if (!quoteRes.ok && !barRes.ok) {
      return null;
    }

    const quoteJson: any = quoteRes.ok ? await quoteRes.json() : null;
    const barJson: any = barRes.ok ? await barRes.json() : null;

    const bar = barJson?.bar;
    const quote = quoteJson?.quote;

    const price = Number(bar?.c || quote?.ap || quote?.bp || 0);
    if (!price) return null;

    const bid = Number(quote?.bp || 0);
    const ask = Number(quote?.ap || 0);
    const spread = bid > 0 && ask > 0 ? Number((ask - bid).toFixed(3)) : 0;
    const dayOpen = Number(bar?.o || price);
    const dayHigh = Number(bar?.h || price);
    const dayLow = Number(bar?.l || price);
    const volume = Number(bar?.v || 0);
    const change = Number((price - dayOpen).toFixed(2));
    const changePercent = dayOpen > 0 ? Number(((change / dayOpen) * 100).toFixed(2)) : 0;

    const now = Date.now();
    const sourceTime = bar?.t || quote?.t || new Date().toISOString();
    const sourceMs = new Date(sourceTime).getTime();
    const ageMs = Math.max(0, now - sourceMs);

    return {
      symbol,
      company: symbol,
      price,
      change,
      changePercent,
      bid,
      ask,
      bidSize: Number(quote?.bs || 0),
      askSize: Number(quote?.as || 0),
      spread,
      dayOpen,
      dayHigh,
      dayLow,
      previousClose: 0,
      volume,
      relativeVolume: 0,
      provider: 'ALPACA',
      feed: 'IEX',
      sourceTimestamp: sourceTime,
      serverReceivedTimestamp: new Date().toISOString(),
      ageMs,
      freshnessState: ageMs < 10000 ? 'FRESH' : (ageMs < 60000 ? 'AGING' : 'STALE')
    };
  }

  private async fetchFromPublicFeed(symbol: string): Promise<AuthoritativeMarketData | null> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = Number(meta.regularMarketPrice || 0);
    if (!price) return null;

    const prevClose = Number(meta.chartPreviousClose || meta.previousClose || 0);
    const change = Number((price - prevClose).toFixed(2));
    const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
    const dayOpen = Number(meta.regularMarketOpen || 0);
    const dayHigh = Number(meta.regularMarketDayHigh || 0);
    const dayLow = Number(meta.regularMarketDayLow || 0);
    const volume = Number(meta.regularMarketVolume || 0);

    const bid = 0; // Yahoo chart endpoint does not provide authoritative bid
    const ask = 0; // Yahoo chart endpoint does not provide authoritative ask
    const spread = 0;

    if (!meta.regularMarketTime) return null;
    const sourceTime = new Date(meta.regularMarketTime * 1000).toISOString();
    const ageMs = Math.max(0, Date.now() - new Date(sourceTime).getTime());

    return {
      symbol,
      company: meta.shortName || meta.longName || symbol,
      price,
      change,
      changePercent,
      bid,
      ask,
      bidSize: 0,
      askSize: 0,
      spread,
      dayOpen,
      dayHigh,
      dayLow,
      previousClose: prevClose,
      volume,
      relativeVolume: 0,
      provider: 'YAHOO_FINANCE_SEC',
      feed: 'CONSOLIDATED',
      sourceTimestamp: sourceTime,
      serverReceivedTimestamp: new Date().toISOString(),
      ageMs,
      freshnessState: ageMs < 30000 ? 'FRESH' : (ageMs < 120000 ? 'AGING' : 'STALE')
    };
  }

  private async fetchCandlesFromAlpaca(symbol: string, timeframe: ChartTimeframe, creds: ReturnType<typeof getAlpacaCredentials>): Promise<MarketCandle[]> {
    let timeframeParam = '1Min';
    let limit = 100;
    if (timeframe === '5D') { timeframeParam = '15Min'; limit = 150; }
    else if (timeframe === '1M') { timeframeParam = '1Hour'; limit = 160; }
    else if (timeframe === '3M' || timeframe === '1Y') { timeframeParam = '1Day'; limit = 250; }

    const url = `${creds.dataBaseUrl}/v2/stocks/${symbol}/bars?timeframe=${timeframeParam}&limit=${limit}&feed=iex`;
    const res = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': creds.key,
        'APCA-API-SECRET-KEY': creds.secret,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return [];
    const json: any = await res.json();
    const bars = json.bars || [];

    return bars.map((b: any) => ({
      time: new Date(b.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: Number(b.o),
      high: Number(b.h),
      low: Number(b.l),
      close: Number(b.c),
      volume: Number(b.v)
    }));
  }

  private async fetchCandlesFromPublicFeed(symbol: string, timeframe: ChartTimeframe): Promise<MarketCandle[]> {
    let interval = '5m';
    let range = '1d';
    if (timeframe === '5D') { interval = '15m'; range = '5d'; }
    else if (timeframe === '1M') { interval = '1d'; range = '1mo'; }
    else if (timeframe === '3M') { interval = '1d'; range = '3mo'; }
    else if (timeframe === '1Y') { interval = '1wk'; range = '1y'; }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) return [];

    const data: any = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const opens = quotes.open || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    const closes = quotes.close || [];
    const volumes = quotes.volume || [];

    const candles: MarketCandle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const o = opens[i];
      const h = highs[i];
      const l = lows[i];
      const c = closes[i];
      const v = volumes[i];

      if (o !== null && h !== null && l !== null && c !== null) {
        candles.push({
          time: new Date(timestamps[i] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: Number(o.toFixed(2)),
          high: Number(h.toFixed(2)),
          low: Number(l.toFixed(2)),
          close: Number(c.toFixed(2)),
          volume: Number(v || 0)
        });
      }
    }

    return candles;
  }

  private buildUnavailableQuote(symbol: string, errorReason: string): AuthoritativeMarketData {
    return {
      symbol: symbol.toUpperCase(),
      company: symbol.toUpperCase(),
      price: 0,
      change: 0,
      changePercent: 0,
      bid: 0,
      ask: 0,
      bidSize: 0,
      askSize: 0,
      spread: 0,
      dayOpen: 0,
      dayHigh: 0,
      dayLow: 0,
      previousClose: 0,
      volume: 0,
      relativeVolume: 0,
      provider: 'UNAVAILABLE',
      feed: 'OFFLINE',
      sourceTimestamp: new Date().toISOString(),
      serverReceivedTimestamp: new Date().toISOString(),
      ageMs: 0,
      freshnessState: 'UNAVAILABLE',
      errorReason
    };
  }
}

export const marketDataService = new MarketDataService();
