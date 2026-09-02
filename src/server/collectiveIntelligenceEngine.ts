// NEXUS Collective Intelligence Engine
// Connects live market telemetry -> specialist workers -> shared evidence -> Nexus synthesis
// -> autonomous ALPACA PAPER execution -> continuous paper position supervision.
// IMPORTANT: This engine never routes unattended live-money securities orders.

import { db } from './db';
import { workerEngine } from './workerEngine';
import { decisionAndRiskEngine } from './decisionAndRiskEngine';
import { alpacaExecutionEngine } from './alpacaExecutionEngine';
import { marketDataService, getAlpacaCredentials } from './marketDataService';
import type { Opportunity } from '../types';

export interface CollectiveTickerReport {
  ticker: string;
  generatedAt: string;
  supportingWorkers: string[];
  strategies: string[];
  proposalCount: number;
  consensusConfidence: number;
  expectedUpside: number;
  expectedDownside: number;
  riskReward: number;
  evidenceCount: number;
  conflicts: string[];
  nexusVerdict: string;
  nexusReasoning: string;
  autonomousPaperAction: 'PAPER_ORDER_SUBMITTED' | 'WATCHING' | 'REJECTED' | 'BLOCKED_BY_RISK' | 'NO_ACTION';
  actionReason: string;
}

class CollectiveIntelligenceEngine {
  private scanTimer: NodeJS.Timeout | null = null;
  private positionTimer: NodeJS.Timeout | null = null;
  private cycleRunning = false;
  private reports = new Map<string, CollectiveTickerReport>();

  public start(): void {
    if (!this.scanTimer) {
      // First cycle shortly after boot, then every 45 seconds while ACTIVE.
      setTimeout(() => this.runCycle().catch(() => undefined), 2500);
      this.scanTimer = setInterval(() => this.runCycle().catch(() => undefined), 45_000);
    }
    if (!this.positionTimer) {
      // Paper position sentinel is intentionally faster than the discovery cycle.
      this.positionTimer = setInterval(() => this.managePaperPositions().catch(() => undefined), 6_000);
    }
    db.addLog('NEXUS', 'INFO', 'Collective Intelligence Engine online: workers now feed one shared Nexus synthesis loop.');
  }

  public stop(): void {
    if (this.scanTimer) clearInterval(this.scanTimer);
    if (this.positionTimer) clearInterval(this.positionTimer);
    this.scanTimer = null;
    this.positionTimer = null;
  }

  public getReports(): CollectiveTickerReport[] {
    return Array.from(this.reports.values()).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  public getReport(symbol: string): CollectiveTickerReport | null {
    return this.reports.get(symbol.toUpperCase()) || null;
  }

  public async runCycle(symbols?: string[]): Promise<{ scanned: number; opportunitiesFound: number; reports: CollectiveTickerReport[] }> {
    const state = db.getState();
    if (this.cycleRunning || state.operatingState !== 'ACTIVE' || state.riskLimits.emergencyFreezeActive) {
      return { scanned: 0, opportunitiesFound: 0, reports: this.getReports() };
    }

    this.cycleRunning = true;
    try {
      db.addActivity('NEXUS COLLECTIVE CYCLE STARTED', 'MARKET_SCAN', 'Live market telemetry is being distributed across specialist desks and fused into shared ticker intelligence.', 'IN_PROGRESS');
      const scan = await workerEngine.executeScan(symbols);
      await this.synthesizePendingOpportunities();
      db.addActivity('NEXUS COLLECTIVE CYCLE COMPLETE', 'MARKET_SCAN', `Shared intelligence updated. ${scan.opportunitiesFound} worker proposals processed.`);
      return { ...scan, reports: this.getReports() };
    } finally {
      this.cycleRunning = false;
    }
  }

  private async synthesizePendingOpportunities(): Promise<void> {
    const pending = db.getState().opportunities.filter(o => o.status === 'PENDING_NEXUS' || o.status === 'ASSISTANT_VERIFYING');
    const groups = new Map<string, Opportunity[]>();
    for (const opp of pending) {
      const ticker = opp.ticker.toUpperCase();
      const list = groups.get(ticker) || [];
      list.push(opp);
      groups.set(ticker, list);
    }

    for (const [ticker, proposals] of groups.entries()) {
      await this.synthesizeTicker(ticker, proposals);
    }
  }

  private async synthesizeTicker(ticker: string, proposals: Opportunity[]): Promise<void> {
    if (proposals.length === 0) return;

    // Highest-confidence proposal becomes the representative; all other desks become shared evidence.
    const ranked = [...proposals].sort((a, b) => b.confidence - a.confidence);
    const representative = ranked[0];
    const supportingWorkers = [...new Set(proposals.map(p => p.workerName))];
    const strategies = [...new Set(proposals.map(p => p.strategy))];
    const allEvidence = proposals.flatMap(p => p.evidence || []);
    const allConflicts = [...new Set(proposals.flatMap(p => p.conflictingEvidence || []))];

    const weightTotal = proposals.reduce((sum, p) => sum + Math.max(1, p.liquidityScore), 0);
    const consensusConfidence = Math.round(
      proposals.reduce((sum, p) => sum + p.confidence * Math.max(1, p.liquidityScore), 0) / Math.max(1, weightTotal)
    );
    const expectedUpside = Number((proposals.reduce((s, p) => s + p.expectedUpside, 0) / proposals.length).toFixed(2));
    const expectedDownside = Number((proposals.reduce((s, p) => s + p.expectedDownside, 0) / proposals.length).toFixed(2));
    const riskReward = Number((expectedUpside / Math.max(0.1, expectedDownside)).toFixed(2));

    // Give Nexus the complete shared evidence stack, not one isolated worker's view.
    const fused: Opportunity = {
      ...representative,
      workerName: supportingWorkers.length > 1 ? `Nexus Collective (${supportingWorkers.length} desks)` : representative.workerName,
      strategy: strategies.join(' + '),
      confidence: consensusConfidence,
      expectedUpside,
      expectedDownside,
      estimatedPotentialProfit: Number((db.getState().riskLimits.perTradeCap * expectedUpside / 100).toFixed(2)),
      evidence: allEvidence,
      conflictingEvidence: allConflicts,
      assistantNotes: `COLLECTIVE MEMORY: ${supportingWorkers.join(', ')} contributed. ${allEvidence.length} evidence items fused. Consensus confidence ${consensusConfidence}%. R:R ${riskReward}:1.`
    };

    const nexus = await decisionAndRiskEngine.evaluateOpportunityWithNexus(fused);
    const isApprove = nexus.verdict === 'APPROVE FOR PAPER REVIEW';
    let action: CollectiveTickerReport['autonomousPaperAction'] = isApprove ? 'WATCHING' : 'REJECTED';
    let actionReason = nexus.reasoning;

    // Persist the shared synthesis into every contributing folder so the user sees one organism, not isolated desks.
    db.updateState(state => {
      for (const p of state.opportunities) {
        if (!proposals.some(src => src.id === p.id)) continue;
        p.status = 'DECIDED';
        p.finalDecision = nexus.verdict;
        p.decisionReason = nexus.reasoning;
        p.nexusEvaluation = `Collective confidence ${consensusConfidence}% • ${supportingWorkers.length} desk(s) • R:R ${riskReward}:1. ${nexus.reasoning}`;
        p.assistantNotes = fused.assistantNotes;
        p.isNewGotOne = true;
      }
    });

    if (isApprove) {
      const state = db.getState();
      const alreadyOpen = state.positions.some(p => p.ticker === ticker);
      const creds = getAlpacaCredentials();
      const confidenceGate = consensusConfidence >= 82;
      const rrGate = riskReward >= 1.5;

      if (alreadyOpen) {
        action = 'WATCHING';
        actionReason = 'Existing paper position is already open; Nexus is supervising instead of duplicating exposure.';
      } else if (!creds.isConfigured) {
        action = 'BLOCKED_BY_RISK';
        actionReason = 'Collective setup approved, but Alpaca Paper credentials are not connected.';
      } else if (!confidenceGate || !rrGate) {
        action = 'WATCHING';
        actionReason = `Nexus is watching only: autonomous paper gate requires confidence >=82% and R:R >=1.5. Current ${consensusConfidence}% / ${riskReward}:1.`;
      } else {
        const quote = await marketDataService.getQuote(ticker);
        const cap = state.riskLimits.perTradeCap;
        const qty = quote.price > 0 ? Math.floor(cap / quote.price) : 0;
        if (qty < 1) {
          action = 'BLOCKED_BY_RISK';
          actionReason = `Per-trade cap $${cap.toFixed(2)} cannot purchase one whole paper share at $${quote.price.toFixed(2)}.`;
        } else {
          const order = await alpacaExecutionEngine.submitPaperOrder({
            ticker,
            qty,
            side: 'buy',
            type: 'market',
            workerSource: fused.workerName,
            strategy: fused.strategy,
            setup: fused.setup
          });
          action = order.success ? 'PAPER_ORDER_SUBMITTED' : 'BLOCKED_BY_RISK';
          actionReason = order.message;
          if (order.success) {
            db.addActivity('NEXUS PAPER ENTRY SUBMITTED', 'TRADE_MANAGEMENT', `$${ticker}: collective thesis passed Nexus and deterministic risk gates. Paper order routed automatically.`);
          }
        }
      }
    }

    const report: CollectiveTickerReport = {
      ticker,
      generatedAt: new Date().toISOString(),
      supportingWorkers,
      strategies,
      proposalCount: proposals.length,
      consensusConfidence,
      expectedUpside,
      expectedDownside,
      riskReward,
      evidenceCount: allEvidence.length,
      conflicts: allConflicts,
      nexusVerdict: nexus.verdict,
      nexusReasoning: nexus.reasoning,
      autonomousPaperAction: action,
      actionReason
    };
    this.reports.set(ticker, report);
    db.addLog('DECISIONS', isApprove ? 'SUCCESS' : 'INFO', `Collective Nexus synthesis for $${ticker}: ${nexus.verdict}.`, `${supportingWorkers.join(', ')} | confidence ${consensusConfidence}% | R:R ${riskReward}:1 | ${action}`);
  }

  private async managePaperPositions(): Promise<void> {
    const state = db.getState();
    if (state.operatingState === 'EMERGENCY_STOP' || state.riskLimits.emergencyFreezeActive) return;

    const creds = getAlpacaCredentials();
    if (!creds.isConfigured) return;

    await alpacaExecutionEngine.reconcileWithAlpaca();
    const positions = [...db.getState().positions];
    for (const position of positions) {
      const quote = await marketDataService.getQuote(position.ticker);
      if (quote.price <= 0 || quote.freshnessState === 'UNAVAILABLE') continue;

      const targetHit = position.targetPrice > 0 && quote.price >= position.targetPrice;
      const stopHit = position.stopLossPrice > 0 && quote.price <= position.stopLossPrice;
      if (!targetHit && !stopHit) continue;

      const reason = targetHit
        ? `Paper profit target reached: $${quote.price.toFixed(2)} >= $${position.targetPrice.toFixed(2)}`
        : `Paper protective stop reached: $${quote.price.toFixed(2)} <= $${position.stopLossPrice.toFixed(2)}`;
      db.addActivity(targetHit ? 'PAPER TARGET HIT' : 'PAPER STOP HIT', 'TRADE_MANAGEMENT', `$${position.ticker}: ${reason}. Nexus routing paper exit.`, 'IN_PROGRESS');
      const closed = await alpacaExecutionEngine.closePosition(position.ticker);
      db.addLog('EXECUTION', closed.success ? 'SUCCESS' : 'ERROR', `$${position.ticker} autonomous paper exit: ${closed.message}`, reason);
    }
  }
}

export const collectiveIntelligenceEngine = new CollectiveIntelligenceEngine();
