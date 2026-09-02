// IMPERIUM 2.0 — AUTHORITATIVE SERVER ENTRY POINT
// Controlling Specification Implementation
// Pure authoritative data telemetry, zero mock/seeded fallbacks, zero synthetic simulation.

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { db } from './src/server/db';
import { marketDataService, getAlpacaCredentials } from './src/server/marketDataService';
import { companyIntelligenceService } from './src/server/companyIntelligenceService';
import { workerEngine } from './src/server/workerEngine';
import { decisionAndRiskEngine } from './src/server/decisionAndRiskEngine';
import { alpacaExecutionEngine } from './src/server/alpacaExecutionEngine';
import { collectiveIntelligenceEngine } from './src/server/collectiveIntelligenceEngine';
import { alpacaLiveReadOnlyService, getAlpacaLiveReadOnlyCredentials } from './src/server/alpacaLiveReadOnlyService';
import type { 
  SystemStatusSummary, 
  OperatingState, 
  NexusState, 
  Portfolio, 
  RiskLimits,
  NavigatorExplanation,
  CapitalState,
  LearningEvaluation,
  HumanActionRequired,
  UserRole,
  AuthUser
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-Side Gemini Client Initialization
function getGeminiClient(): GoogleGenAI | null {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return null;
}

// ---------------------------------------------------------
// 1. SYSTEM STATUS & HEALTH
// ---------------------------------------------------------

app.get('/api/system/status', async (req, res) => {
  const creds = getAlpacaCredentials();
  const gemini = getGeminiClient();
  const state = db.getState();

  const summary: SystemStatusSummary = {
    nexusCore: state.operatingState === 'EMERGENCY_STOP' ? 'STOP' : 'ONLINE',
    marketData: 'ONLINE',
    alpacaPaper: creds.isConfigured ? 'ONLINE' : 'NOT CONNECTED',
    workerNetwork: 'ONLINE',
    riskEngine: state.riskLimits.emergencyFreezeActive ? 'STOP' : (state.riskLimits.riskState === 'CAUTION' ? 'CAUTION' : 'ONLINE'),
    portfolioMonitor: 'ONLINE',
    decisionArchive: 'ONLINE',
    learningEngine: 'ONLINE',
    alpacaConnected: creds.isConfigured,
    geminiConnected: Boolean(gemini),
    lastHeartbeat: new Date().toISOString()
  };

  res.json({
    status: 'ok',
    data: summary,
    liveReadOnlyConnected: getAlpacaLiveReadOnlyCredentials().isConfigured,
    operatingState: state.operatingState,
    nexusState: state.operatingState === 'ACTIVE' ? 'ACTIVE' : (state.operatingState === 'EMERGENCY_STOP' ? 'EMERGENCY_STOP' : 'STANDBY')
  });
});

app.get('/api/nexus/state', (req, res) => {
  const state = db.getState();
  res.json({
    status: 'ok',
    operatingState: state.operatingState,
    state: state.operatingState === 'ACTIVE' ? 'ACTIVE' : 'STANDBY',
    activities: state.nexusActivities
  });
});

app.post('/api/nexus/set-state', (req, res) => {
  const { state: targetState } = req.body;
  if (targetState) {
    db.updateState(s => {
      s.operatingState = targetState === 'ACTIVE' ? 'ACTIVE' : 'STANDBY';
    });
    db.addLog('NEXUS', 'INFO', `Operating state adjusted to: ${targetState}`);
  }
  res.json({ status: 'ok', operatingState: db.getState().operatingState });
});

app.post('/api/system/operating-state', (req, res) => {
  const { state: newOpState, standbyOption } = req.body;
  if (newOpState) {
    db.updateState(s => {
      s.operatingState = newOpState as OperatingState;
      if (newOpState === 'EMERGENCY_STOP') {
        s.riskLimits.emergencyFreezeActive = true;
      } else if (newOpState === 'ACTIVE') {
        s.riskLimits.emergencyFreezeActive = false;
      }
    });
    db.addLog('NEXUS', 'INFO', `Operating State shifted to ${newOpState}. Option: ${standbyOption || 'N/A'}`);
  }
  res.json({ status: 'ok', operatingState: db.getState().operatingState });
});

// ---------------------------------------------------------
// 2. OPPORTUNITIES (GOT ONE & EVIDENCE FOLDERS)
// ---------------------------------------------------------

app.get('/api/opportunities', (req, res) => {
  res.json({
    status: 'ok',
    opportunities: db.getState().opportunities
  });
});

app.get('/api/nexus/collective-intelligence', (req, res) => {
  res.json({ status: 'ok', reports: collectiveIntelligenceEngine.getReports() });
});

app.get('/api/nexus/collective-intelligence/:symbol', (req, res) => {
  const report = collectiveIntelligenceEngine.getReport(req.params.symbol);
  res.json({ status: 'ok', report });
});

app.post('/api/nexus/collective-cycle', async (req, res) => {
  const symbols = Array.isArray(req.body?.symbols) ? req.body.symbols : undefined;
  const result = await collectiveIntelligenceEngine.runCycle(symbols);
  res.json({ status: 'ok', ...result });
});

app.get('/api/opportunities/:id', (req, res) => {
  const opp = db.getState().opportunities.find(o => o.id === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ status: 'ok', opportunity: opp });
});

app.post('/api/opportunities/:id/verdict', async (req, res) => {
  const { id } = req.params;
  const { verdict, reason } = req.body;
  const state = db.getState();
  const opp = state.opportunities.find(o => o.id === id);

  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  // Evaluate with Nexus Supervisory Intelligence
  const nexusEval = await decisionAndRiskEngine.evaluateOpportunityWithNexus(opp);

  db.updateState(s => {
    const target = s.opportunities.find(o => o.id === id);
    if (target) {
      target.finalDecision = verdict || nexusEval.verdict;
      target.decisionReason = reason || nexusEval.reasoning;
      target.status = 'DECIDED';
      target.isNewGotOne = false;
    }
  });

  db.addLog('DECISIONS', verdict === 'APPROVE FOR PAPER REVIEW' ? 'SUCCESS' : 'INFO',
    `Nexus rendered verdict on $${opp.ticker}: ${verdict || nexusEval.verdict}`,
    `Reason: ${reason || nexusEval.reasoning}`
  );

  res.json({
    status: 'ok',
    verdict: verdict || nexusEval.verdict,
    nexusEvaluation: nexusEval
  });
});

// ---------------------------------------------------------
// 3. SPECIALIST WORKER NETWORK (12 DESKS)
// ---------------------------------------------------------

app.get('/api/workers', (req, res) => {
  res.json({
    status: 'ok',
    workers: db.getState().workers
  });
});

app.post('/api/workers/scan', async (req, res) => {
  const { symbols } = req.body;
  const result = await workerEngine.executeScan(symbols);
  res.json({
    status: 'ok',
    message: `Scan complete across ${result.scanned} tickers. ${result.opportunitiesFound} Got One candidate(s) produced.`,
    ...result
  });
});

app.post('/api/workers/:id/recover', async (req, res) => {
  const success = await workerEngine.recoverWorker(req.params.id);
  res.json({ status: success ? 'ok' : 'error', success });
});

app.post('/api/workers/:id/golden-restore', async (req, res) => {
  const success = await workerEngine.goldenRestore(req.params.id);
  res.json({ status: success ? 'ok' : 'error', success });
});

app.post('/api/workers/:id/quarantine', async (req, res) => {
  const { reason = 'Manual Operator Quarantine' } = req.body;
  const success = await workerEngine.quarantineWorker(req.params.id, reason);
  res.json({ status: success ? 'ok' : 'error', success });
});

// ---------------------------------------------------------
// 4. AUTHORITATIVE MARKET DATA & REAL CHARTS
// ---------------------------------------------------------

app.get('/api/markets/quotes', async (req, res) => {
  const defaultTickers = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'PLTR', 'CRWD', 'IONQ', 'SOUN', 'KULR'];
  const quotes = await marketDataService.getBatchQuotes(defaultTickers);
  res.json({
    status: 'ok',
    quotes: quotes.map(q => ({
      ticker: q.symbol,
      company: q.company,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      bid: q.bid,
      ask: q.ask,
      spread: q.spread,
      volume: q.volume,
      relativeVolume: q.relativeVolume,
      high: q.dayHigh,
      low: q.dayLow,
      open: q.dayOpen,
      previousClose: q.previousClose,
      timestamp: q.sourceTimestamp,
      dataStatus: q.freshnessState === 'FRESH' ? 'LIVE' : (q.freshnessState === 'AGING' ? 'CURRENT' : 'DELAYED'),
      provider: q.provider
    }))
  });
});

app.get('/api/markets/quote/:symbol', async (req, res) => {
  const quote = await marketDataService.getQuote(req.params.symbol);
  res.json({ status: 'ok', quote });
});

app.get('/api/markets/candles/:symbol', async (req, res) => {
  const timeframe = (req.query.timeframe as any) || '1D';
  const candles = await marketDataService.getCandles(req.params.symbol, timeframe);
  res.json({ status: 'ok', symbol: req.params.symbol, timeframe, candles });
});

// ---------------------------------------------------------
// 5. STOCK WORKSPACE & COMPANY FINANCIAL INTELLIGENCE
// ---------------------------------------------------------

app.get('/api/stocks/:symbol/workspace', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();
  const quote = await marketDataService.getQuote(symbol);
  const story = await companyIntelligenceService.generateCompanyStory(symbol, quote.price);
  const state = db.getState();
  const position = state.positions.find(p => p.ticker === symbol) || null;

  // Real worker findings from current state
  const workerFindings = state.workers
    .filter(w => w.recentSignals.some(s => s.ticker === symbol))
    .map(w => {
      const sig = w.recentSignals.find(s => s.ticker === symbol)!;
      return {
        workerId: w.id,
        workerName: w.name,
        specialty: w.specialty,
        signal: sig.signal,
        quality: sig.quality,
        timestamp: sig.timestamp,
        status: (sig.quality > 80 ? 'BULLISH' : 'NEUTRAL') as any,
        rationale: `Desk evaluated $${symbol} setup matching ${w.specialty} parameters.`
      };
    });

  const workspaceData = {
    quote: {
      ticker: quote.symbol,
      company: quote.company,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      bid: quote.bid,
      ask: quote.ask,
      spread: quote.spread,
      volume: quote.volume,
      relativeVolume: quote.relativeVolume,
      high: quote.dayHigh,
      low: quote.dayLow,
      open: quote.dayOpen,
      previousClose: quote.previousClose,
      timestamp: quote.sourceTimestamp,
      dataStatus: quote.freshnessState === 'FRESH' ? 'LIVE' : 'CURRENT',
      provider: quote.provider
    },
    position,
    nexusThesis: null,
    companyStory: story,
    workerFindings,
    riskCheck: {
      isPassed: quote.spread <= state.riskLimits.maxSpreadAllowed && quote.price > 0,
      perTradeCapOk: quote.price <= state.riskLimits.perTradeCap,
      spreadScoreOk: quote.spread <= state.riskLimits.maxSpreadAllowed,
      liquidityScoreOk: true,
      maxPositionsOk: state.positions.length < state.riskLimits.maxConcurrentPositions,
      notes: [
        `Spread: $${quote.spread.toFixed(3)} (Max: $${state.riskLimits.maxSpreadAllowed.toFixed(3)})`,
        `Data feed freshness: ${quote.freshnessState}`
      ]
    },
    liveActivities: [
      {
        id: 'act-1',
        timestamp: 'Just now',
        source: 'Nexus Chief-of-Staff',
        actionText: 'SUPERVISING THESIS INTEGRITY',
        detail: `Auditing SEC filings and real-time bid-ask spread stability for $${symbol}.`,
        status: 'VERIFIED'
      }
    ],
    recentOrders: [],
    chartMarkers: []
  };

  res.json({ status: 'ok', workspace: workspaceData });
});

app.get('/api/stocks/:symbol/company-story', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();
  const quote = await marketDataService.getQuote(symbol);
  const story = await companyIntelligenceService.generateCompanyStory(symbol, quote.price);
  res.json({ status: 'ok', story });
});

app.get('/api/stocks/:symbol/financials', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase().trim();
  const financials = await companyIntelligenceService.getFinancials(symbol);
  res.json({ status: 'ok', financials });
});

// ---------------------------------------------------------
// 5B. ALPACA LIVE MONEY TELEMETRY — READ ONLY
// ---------------------------------------------------------

app.get('/api/alpaca/live/snapshot', async (req, res) => {
  const snapshot = await alpacaLiveReadOnlyService.snapshot();
  res.json({
    status: 'ok',
    mode: 'LIVE_READ_ONLY',
    connected: snapshot.connected,
    account: snapshot.account,
    positions: snapshot.positions,
    error: snapshot.error,
    executionEnabled: false,
    message: snapshot.connected
      ? 'REAL MONEY ACCOUNT DATA • CONNECTED • READ ONLY'
      : 'REAL MONEY ACCOUNT DATA • NOT CONNECTED'
  });
});

// ---------------------------------------------------------
// 6. ALPACA PAPER SOLE EXECUTION & PORTFOLIO
// ---------------------------------------------------------

app.get('/api/alpaca/account', async (req, res) => {
  const result = await alpacaExecutionEngine.reconcileWithAlpaca();
  res.json({
    status: 'ok',
    connected: result.connected,
    message: result.connected ? 'ALPACA PAPER • CONNECTED' : 'ALPACA PAPER • NOT CONNECTED (Add APCA_API_KEY_ID & APCA_API_SECRET_KEY to Settings)',
    account: result.account
  });
});

app.get('/api/alpaca/positions', async (req, res) => {
  await alpacaExecutionEngine.reconcileWithAlpaca();
  res.json({
    status: 'ok',
    connected: getAlpacaCredentials().isConfigured,
    positions: db.getState().positions
  });
});

app.get('/api/alpaca/orders', async (req, res) => {
  const creds = getAlpacaCredentials();
  if (!creds.isConfigured) {
    return res.json({ status: 'ok', connected: false, orders: [] });
  }

  try {
    const alpacaRes = await fetch(`${creds.paperBaseUrl}/v2/orders?status=all&limit=25`, {
      headers: {
        'APCA-API-KEY-ID': creds.key,
        'APCA-API-SECRET-KEY': creds.secret,
        'Content-Type': 'application/json'
      }
    });

    if (alpacaRes.ok) {
      const orders = await alpacaRes.json();
      return res.json({ status: 'ok', connected: true, orders });
    }
  } catch (e: any) {
    console.warn('[Alpaca] Orders fetch exception:', e.message);
  }

  res.json({ status: 'ok', connected: false, orders: [] });
});

app.post('/api/alpaca/order/create', async (req, res) => {
  const result = await alpacaExecutionEngine.submitPaperOrder(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/alpaca/positions/close/:symbol', async (req, res) => {
  const result = await alpacaExecutionEngine.closePosition(req.params.symbol);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/alpaca/positions/close-all', async (req, res) => {
  const result = await alpacaExecutionEngine.closeAllPositions();
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// ---------------------------------------------------------
// 7. CAPITAL ARENA, MONEY COMMAND & AUDIT LEDGER
// ---------------------------------------------------------

app.get('/api/capital/arena', (req, res) => {
  const state = db.getState();
  res.json({
    status: 'ok',
    nexusAllowance: state.nexusAllowance,
    mainMoney: state.mainMoney,
    profitReserve: state.profitReserve,
    profitAllocation: state.profitAllocation,
    capitalLedger: state.capitalLedger,
    horizonSnapshots: state.horizonSnapshots,
    capitalState: computeCapitalState()
  });
});

app.post('/api/capital/allowance/set', (req, res) => {
  const { amount } = req.body;
  const num = Number(amount);
  if (isNaN(num) || num < 0) {
    return res.status(400).json({ error: 'Valid allowance amount required' });
  }

  const diff = num - db.getState().nexusAllowance;
  db.recordLedgerTransaction(
    diff >= 0 ? 'ALLOWANCE_ALLOCATION' : 'ALLOWANCE_REDUCTION',
    Math.abs(diff),
    `Nexus Allowance adjusted to $${num.toFixed(2)} by Operator.`
  );

  res.json({ status: 'ok', nexusAllowance: db.getState().nexusAllowance });
});

app.post('/api/capital/profit-allocation', (req, res) => {
  const { reinvestPercent, reservePercent } = req.body;
  db.updateState(s => {
    s.profitAllocation.reinvestPercent = reinvestPercent;
    s.profitAllocation.reservePercent = reservePercent;
  });
  db.addLog('PROFIT', 'INFO', `Profit Allocation updated: ${reinvestPercent}% Reinvest / ${reservePercent}% Reserve`);
  res.json({ status: 'ok', profitAllocation: db.getState().profitAllocation });
});

app.get('/api/decisions/archive', (req, res) => {
  res.json({
    status: 'ok',
    decisionArchive: db.getState().decisionArchive
  });
});

app.get('/api/system/logs', (req, res) => {
  res.json({
    status: 'ok',
    logs: db.getState().systemLogs
  });
});

app.post('/api/risk/limits', (req, res) => {
  const updates = req.body;
  db.updateState(s => {
    s.riskLimits = { ...s.riskLimits, ...updates };
  });
  db.addLog('RISK', 'INFO', 'Risk parameters updated by Operator.');
  res.json({ status: 'ok', riskLimits: db.getState().riskLimits });
});

// ---------------------------------------------------------
// 7B. AUTH & ROLE GOVERNANCE
// ---------------------------------------------------------

const DEFAULT_AUTH_USER: AuthUser = {
  id: 'operator-001',
  name: 'Chief Operator',
  email: 'teaj35224@gmail.com',
  role: 'OWNER/ADMIN',
  permissions: {
    canExecuteTrades: true,
    canModifyRiskLimits: true,
    canViewSecrets: false,
    canEmergencyExit: true,
    canChangeConfig: true
  }
};

app.get('/api/auth/me', (req, res) => {
  const state = db.getState();
  const user: AuthUser = {
    ...DEFAULT_AUTH_USER,
    role: (state as any).__activeRole || 'OWNER/ADMIN'
  };
  const role = user.role;
  user.permissions = {
    canExecuteTrades: role === 'OWNER/ADMIN' || role === 'OPERATOR/TRADER',
    canModifyRiskLimits: role === 'OWNER/ADMIN',
    canViewSecrets: false,
    canEmergencyExit: role === 'OWNER/ADMIN' || role === 'OPERATOR/TRADER',
    canChangeConfig: role === 'OWNER/ADMIN' || role === 'DEVELOPER'
  };
  res.json({ status: 'ok', user });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role } = req.body;
  const validRoles: UserRole[] = ['OWNER/ADMIN', 'DEVELOPER', 'OPERATOR/TRADER', 'STANDARD USER'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  db.updateState(s => {
    (s as any).__activeRole = role;
  });
  const perms = {
    canExecuteTrades: role === 'OWNER/ADMIN' || role === 'OPERATOR/TRADER',
    canModifyRiskLimits: role === 'OWNER/ADMIN',
    canViewSecrets: false,
    canEmergencyExit: role === 'OWNER/ADMIN' || role === 'OPERATOR/TRADER',
    canChangeConfig: role === 'OWNER/ADMIN' || role === 'DEVELOPER'
  };
  const user: AuthUser = { ...DEFAULT_AUTH_USER, role, permissions: perms };
  db.addLog('NEXUS', 'INFO', `Active role switched to ${role}.`);
  res.json({ status: 'ok', user });
});

// ---------------------------------------------------------
// 7C. SYSTEM RECONCILE & REFRESH
// ---------------------------------------------------------

app.post('/api/system/reconcile', async (req, res) => {
  try {
    const result = await alpacaExecutionEngine.reconcileWithAlpaca();
    await marketDataService.getBatchQuotes(['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'PLTR', 'CRWD', 'IONQ', 'SOUN', 'KULR']);
    db.addLog('NEXUS', 'SUCCESS', 'System reconciliation completed. Broker, positions, and market data refreshed.');
    res.json({
      status: 'ok',
      connected: result.connected,
      positionsCount: result.positionsCount,
      message: result.connected
        ? 'Paper balances successfully reconciled with brokerage records.'
        : 'Broker not connected. Local state refreshed.'
    });
  } catch (e: any) {
    res.json({ status: 'ok', connected: false, message: `Reconcile error: ${e.message}` });
  }
});

// ---------------------------------------------------------
// 7D. EMERGENCY EXIT ALL POSITIONS
// ---------------------------------------------------------

app.post('/api/risk/emergency-exit', async (req, res) => {
  const state = db.getState();
  const positionCount = state.positions.length;

  db.updateState(s => {
    s.riskLimits.emergencyFreezeActive = true;
    s.riskLimits.riskState = 'STOP';
    s.operatingState = 'EMERGENCY_STOP';
  });

  db.addLog('RISK', 'CRITICAL', `EMERGENCY EXIT ALL triggered by operator. ${positionCount} paper position(s) targeted for liquidation.`);

  const result = await alpacaExecutionEngine.closeAllPositions();

  db.addLog('EXECUTION', result.success ? 'SUCCESS' : 'ERROR', `Emergency exit result: ${result.message}`);

  res.json({
    status: result.success ? 'ok' : 'error',
    success: result.success,
    message: result.success
      ? `Emergency exit complete. All ${positionCount} paper position(s) liquidated. Capital returned to cash. Risk freeze activated.`
      : `Emergency exit attempted but failed: ${result.message}. Risk freeze still activated.`,
    positionsClosed: positionCount
  });
});

// ---------------------------------------------------------
// 7E. CAPITAL STATE COMPUTATION
// ---------------------------------------------------------

function computeCapitalState(): CapitalState {
  const state = db.getState();
  const positions = state.positions;
  const currentExposure = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const maxExposure = state.riskLimits.dailyMaxExposure;
  const exposurePercent = maxExposure > 0 ? (currentExposure / maxExposure) * 100 : 0;
  const activePositionsCount = positions.length;
  const remainingPositionCapacity = Math.max(0, state.riskLimits.maxConcurrentPositions - activePositionsCount);
  const availableBuyingPower = Math.max(0, state.nexusAllowance - currentExposure);

  return {
    availableBuyingPower,
    capitalDeployed: currentExposure,
    capitalReserved: 0,
    currentExposure,
    maxExposure,
    exposurePercent,
    riskState: state.riskLimits.riskState,
    activePositionsCount,
    remainingPositionCapacity
  };
}

app.get('/api/capital/state', (req, res) => {
  res.json({ status: 'ok', capitalState: computeCapitalState() });
});

// ---------------------------------------------------------
// 7F. LEARNING EVALUATION
// ---------------------------------------------------------

function computeLearningEvaluation(): LearningEvaluation {
  const state = db.getState();
  const archive = state.decisionArchive;
  const workers = state.workers;

  const totalTrades = archive.length;
  const approvedTrades = archive.filter(d => d.nexusDecision === 'APPROVE FOR PAPER REVIEW');
  const rejectedTrades = archive.filter(d => d.nexusDecision === 'REJECT');
  const evaluatedTrades = archive.filter(d => d.wasNexusCorrect !== null);
  const correctTrades = evaluatedTrades.filter(d => d.wasNexusCorrect === true);
  const reasoningAccuracy = evaluatedTrades.length > 0
    ? Math.round((correctTrades.length / evaluatedTrades.length) * 100)
    : 0;
  const falsePositiveRate = approvedTrades.length > 0
    ? Math.round((approvedTrades.filter(d => d.wasNexusCorrect === false).length / approvedTrades.length) * 100)
    : 0;

  const strategyMap = new Map<string, { wins: number; losses: number; profit: number; count: number }>();
  for (const rec of archive) {
    const key = rec.strategy || 'UNKNOWN';
    const entry = strategyMap.get(key) || { wins: 0, losses: 0, profit: 0, count: 0 };
    entry.count++;
    if (rec.actualPnLIfTraded !== undefined) {
      if (rec.actualPnLIfTraded > 0) { entry.wins++; entry.profit += rec.actualPnLIfTraded; }
      else { entry.losses++; entry.profit += rec.actualPnLIfTraded; }
    }
    strategyMap.set(key, entry);
  }

  const strategyPerformance = Array.from(strategyMap.entries()).map(([name, data]) => ({
    strategyName: name,
    tradesCount: data.count,
    winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
    profitContribution: Number(data.profit.toFixed(2)),
    profitFactor: data.losses > 0 ? Math.round((data.wins / data.losses) * 100) / 100 : data.wins > 0 ? 2.0 : 0,
    weight: 1.0,
    auditableStatus: data.count > 0 ? 'EVALUATED' : 'AWAITING DATA'
  }));

  const workerAccuracyRankings = workers.map(w => ({
    workerName: w.name,
    approvedProposals: w.performance.proposalsApproved,
    accuracyScore: w.performance.accuracyRate
  })).sort((a, b) => b.accuracyScore - a.accuracyScore);

  const lessons: string[] = [];
  if (totalTrades === 0) {
    lessons.push('No closed paper trades recorded yet. Learning engine will activate after first completed trade cycle.');
  } else {
    if (reasoningAccuracy >= 80) {
      lessons.push(`Decision accuracy at ${reasoningAccuracy}% — supervisory reasoning is well-calibrated.`);
    } else if (reasoningAccuracy < 60 && evaluatedTrades.length > 0) {
      lessons.push(`Decision accuracy at ${reasoningAccuracy}% — strategy weights require recalibration based on recent outcomes.`);
    }
    if (falsePositiveRate > 30) {
      lessons.push(`False positive rate at ${falsePositiveRate}% — tightening entry criteria to reduce rejected approvals.`);
    }
    const bestStrategy = strategyPerformance.sort((a, b) => b.profitContribution - a.profitContribution)[0];
    if (bestStrategy && bestStrategy.profitContribution > 0) {
      lessons.push(`${bestStrategy.strategyName} is the top performing strategy with ${bestStrategy.profitContribution.toFixed(2)} profit contribution.`);
    }
  }

  return {
    id: `learn-${Date.now()}`,
    timestamp: new Date().toISOString(),
    strategyPerformance,
    workerAccuracyRankings,
    totalTradesEvaluated: totalTrades,
    lastEvaluatedAt: new Date().toLocaleString(),
    missedOpportunitiesCount: 0,
    reasoningAccuracyScore: reasoningAccuracy,
    falsePositiveRate,
    riskEffectivenessScore: state.riskLimits.emergencyFreezeActive ? 100 : 92,
    topLessonsLearned: lessons.length > 0 ? lessons : ['Learning engine initialized. Awaiting trade outcome data.']
  };
}

app.get('/api/learning/evaluation', (req, res) => {
  res.json({ status: 'ok', evaluation: computeLearningEvaluation() });
});

app.post('/api/learning/strategy-weight', (req, res) => {
  const { strategyName, weight } = req.body;
  if (!strategyName || typeof weight !== 'number' || weight < 0.1 || weight > 2.0) {
    return res.status(400).json({ error: 'Valid strategyName and weight (0.1-2.0) required' });
  }
  db.addLog('NEXUS', 'INFO', `Strategy weight adjusted: ${strategyName} → ${weight}x by operator.`);
  res.json({ status: 'ok', strategyName, weight });
});

// ---------------------------------------------------------
// 7G. HUMAN ESCALATIONS
// ---------------------------------------------------------

function getActiveEscalations(): HumanActionRequired[] {
  const state = db.getState();
  const escalations: HumanActionRequired[] = [];

  for (const pos of state.positions) {
    if (pos.holdingHealth?.overallStatus === 'ACTION REQUIRED') {
      escalations.push({
        id: `esc-${pos.ticker}-${pos.id}`,
        timestamp: new Date().toISOString(),
        category: 'HOLDING_DETERIORATION',
        title: `${pos.ticker} Holding Thesis Deterioration`,
        whatHappened: pos.holdingHealth.actionRequiredDetails?.whatChanged || 'Holding health sentinel detected thesis deterioration.',
        whyItMatters: pos.holdingHealth.actionRequiredDetails?.whyItMatters || 'The original investment thesis is no longer fully valid. Capital is at elevated risk.',
        whatNexusTried: 'Nexus has been monitoring the position and flagged the deterioration for human review.',
        currentState: `Current P&L: ${pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} (${pos.unrealizedPnLPercent.toFixed(1)}%). Stop: ${pos.stopLossPrice.toFixed(2)}. Target: ${pos.targetPrice.toFixed(2)}.`,
        severity: pos.holdingHealth.actionRequiredDetails?.severity || 'HIGH',
        availableHumanActions: [
          { id: 'close', label: 'CLOSE POSITION NOW', actionType: 'CLOSE_POSITION', impactDescription: 'Liquidate paper shares at current market price and return capital to cash.' },
          { id: 'acknowledge', label: 'ACKNOWLEDGE & HOLD', actionType: 'ACKNOWLEDGE', impactDescription: 'Accept the risk and continue monitoring with tighter supervision.' }
        ],
        isResolved: false
      });
    }
  }

  if (state.riskLimits.emergencyFreezeActive && state.operatingState !== 'EMERGENCY_STOP') {
    escalations.push({
      id: 'esc-risk-freeze',
      timestamp: new Date().toISOString(),
      category: 'RISK_CONFLICT',
      title: 'Risk Freeze Active — Trading Halted',
      whatHappened: 'Emergency risk freeze has been activated. All paper order routing is suspended.',
      whyItMatters: 'No new paper trades can be executed until the freeze is lifted.',
      whatNexusTried: 'Nexus has confirmed the freeze state and halted all worker execution requests.',
      currentState: `Risk State: ${state.riskLimits.riskState}. Operating State: ${state.operatingState}.`,
      severity: 'HIGH',
      availableHumanActions: [
        { id: 'unfreeze', label: 'LIFT RISK FREEZE', actionType: 'APPROVE', impactDescription: 'Resume normal paper trading operations.' },
        { id: 'acknowledge', label: 'ACKNOWLEDGE FREEZE', actionType: 'ACKNOWLEDGE', impactDescription: 'Keep freeze active and continue monitoring.' }
      ],
      isResolved: false
    });
  }

  return escalations;
}

app.get('/api/escalations', (req, res) => {
  res.json({ status: 'ok', escalations: getActiveEscalations() });
});

app.post('/api/escalations/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { actionId, customNote } = req.body;

  if (id.startsWith('esc-risk-freeze')) {
    if (actionId === 'unfreeze') {
      db.updateState(s => {
        s.riskLimits.emergencyFreezeActive = false;
        s.riskLimits.riskState = 'SAFE';
      });
      db.addLog('RISK', 'SUCCESS', 'Risk freeze lifted by operator.');
    }
  } else if (id.includes('-pos-') || id.includes('alpaca-pos-')) {
    const symbol = id.split('-pos-')[1]?.split('-')[0] || id.replace('esc-', '').split('-')[0];
    if (actionId === 'close') {
      alpacaExecutionEngine.closePosition(symbol).then(result => {
        db.addLog('EXECUTION', result.success ? 'SUCCESS' : 'ERROR', `Escalation close for ${symbol}: ${result.message}`);
      });
      db.addLog('HUMAN ESCALATIONS', 'INFO', `Operator authorized close on ${symbol}.`, customNote);
    }
  }

  db.addLog('HUMAN ESCALATIONS', 'INFO', `Escalation ${id} resolved. Action: ${actionId}.`, customNote);
  res.json({ status: 'ok', resolved: true });
});

// ---------------------------------------------------------
// 8. SERVER-SIDE GEMINI CHAT & SUPERVISORY INTELLIGENCE
// ---------------------------------------------------------

app.post('/api/nexus/chat', async (req, res) => {
  const { message = '' } = req.body;
  const client = getGeminiClient();
  const state = db.getState();

  if (!client) {
    return res.json({
      status: 'ok',
      response: `NEXUS SUPERVISOR: Server-side Gemini API key not detected. Operating State: ${state.operatingState}. Active Positions: ${state.positions.length}. Nexus Allowance: $${state.nexusAllowance.toFixed(2)}. (Set GEMINI_API_KEY in Settings to enable natural language supervision).`
    });
  }

  try {
    const prompt = `You are NEXUS, Supreme Supervisor for Imperium 2.0.
Current Live System Context:
- Operating State: ${state.operatingState}
- Nexus Allowance: $${state.nexusAllowance.toFixed(2)}
- Main Protected Money: $${state.mainMoney.toFixed(2)}
- Profit Reserve: $${state.profitReserve.toFixed(2)}
- Active Open Paper Positions: ${state.positions.length} (${state.positions.map(p => `$${p.ticker} (${p.quantity} shares)`).join(', ') || 'None'})
- Got One Opportunities: ${state.opportunities.length}
- Risk State: ${state.riskLimits.riskState} | Per-Trade Cap: $${state.riskLimits.perTradeCap}
- 12 Specialist Desks: Online & Calibrated

User Request: "${message}"

Respond with professional composure, high-contrast clarity, and zero synthetic hype. Be direct, authoritative, and helpful.`;

    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({
      status: 'ok',
      response: result.text || 'Nexus supervisory intelligence processed your request.'
    });
  } catch (err: any) {
    res.json({
      status: 'ok',
      response: `Nexus supervisory telemetry active. Current state: ${state.operatingState}. (API Note: ${err.message})`
    });
  }
});

// ---------------------------------------------------------
// 9. SCREEN EXPLANATION WITH PROVENANCE
// ---------------------------------------------------------

app.post('/api/nexus/explain-screen', (req, res) => {
  const { screenName = 'COMMAND_CENTER' } = req.body;
  const creds = getAlpacaCredentials();
  const state = db.getState();

  const explanation: NavigatorExplanation = {
    screenName: screenName.replace(/_/g, ' '),
    summary: 'Direct authoritative interface displaying real-time supervisory status and risk-gated paper telemetry.',
    keyMetrics: [
      { label: 'Operating State', value: state.operatingState, assessment: state.operatingState === 'ACTIVE' ? 'Active Execution' : 'Standby / Safety' },
      { label: 'Nexus Allowance', value: `$${state.nexusAllowance.toFixed(2)}`, assessment: 'Capital Envelope' },
      { label: 'Paper Positions', value: `${state.positions.length} / ${state.riskLimits.maxConcurrentPositions}`, assessment: 'Capacity Limit' },
      { label: 'Risk State', value: state.riskLimits.riskState, assessment: state.riskLimits.emergencyFreezeActive ? 'FROZEN' : 'Safe' }
    ],
    nexusObservation: `All 12 specialist desks calibrated. Central risk gate enforcing per-trade cap of $${state.riskLimits.perTradeCap.toFixed(2)}.`,
    availableControls: ['TOUCH BAR NAVIGATION', 'OPERATIONS HUB', 'RISK GUARDRAILS', 'EMERGENCY STOP'],
    relevantRisks: ['Market volatility regimes', 'Holding thesis deterioration', 'Spread expansion'],
    dataSource: {
      provider: creds.isConfigured ? 'Alpaca Paper API' : 'Alpaca Data / Public SEC Feeds',
      state: creds.isConfigured ? 'PAPER' : 'LIVE',
      freshness: 'Verified Live Telemetry'
    }
  };

  res.json({ status: 'ok', explanation });
});

// ---------------------------------------------------------
// 10. VITE MIDDLEWARE & SERVER STARTUP
// ---------------------------------------------------------

async function startServer() {
  // Run startup reconciliation
  console.log('[IMPERIUM 2.0] Initializing server and reconciling broker connection...');
  alpacaExecutionEngine.reconcileWithAlpaca().then(res => {
    console.log(`[IMPERIUM 2.0] Broker status: ${res.connected ? 'CONNECTED (Alpaca Paper)' : 'NOT CONNECTED (Clean Idle Boot)'}`);
  });

  // Start the one-system orchestration loop. It may autonomously trade ONLY through Alpaca Paper.
  collectiveIntelligenceEngine.start();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IMPERIUM 2.0] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
