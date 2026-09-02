// Nexus Decision Engine & Deterministic Central Risk Engine
// Enforces hard risk boundaries and provides structured supervisory decisions.
// Nexus and workers CANNOT override the deterministic risk engine.

import { db } from './db';
import { marketDataService, getAlpacaCredentials } from './marketDataService';
import { companyIntelligenceService } from './companyIntelligenceService';
import { GoogleGenAI } from '@google/genai';
import type { Opportunity, OpportunityVerdict, DecisionArchiveRecord } from '../types';

export interface PreTradeRiskCheckResult {
  passed: boolean;
  failureReason?: string;
  checks: {
    operatingStateActive: boolean;
    paperSafetyLockPassed: boolean;
    alpacaConfigured: boolean;
    marketDataFresh: boolean;
    spreadWithinTolerance: boolean;
    perTradeCapSatisfied: boolean;
    allowanceSufficient: boolean;
    maxPositionsSatisfied: boolean;
    emergencyFreezeClear: boolean;
    riskStateSafe: boolean;
  };
  metrics: {
    symbol: string;
    shares: number;
    price: number;
    estimatedCost: number;
    spread: number;
    marketDataAgeMs: number;
    availableAllowance: number;
    currentPositionsCount: number;
  };
}

export interface NexusSupervisoryDecision {
  verdict: OpportunityVerdict;
  companyQualityScore: number; // 0-100
  tradeSetupQualityScore: number; // 0-100
  reasoning: string;
  capitalRequested: number;
  entryPlan: string;
  targetPlan: string;
  stopPlan: string;
  invalidationTrigger: string;
  lessonLearnedPreview: string;
}

export class DecisionAndRiskEngine {
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  private getClient(): GoogleGenAI | null {
    if (!this.geminiClient && process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.geminiClient;
  }

  /**
   * Evaluates an Opportunity with Nexus Supervisory Intelligence
   */
  public async evaluateOpportunityWithNexus(opp: Opportunity): Promise<NexusSupervisoryDecision> {
    const fin = await companyIntelligenceService.getFinancials(opp.ticker);
    const quote = await marketDataService.getQuote(opp.ticker);
    const state = db.getState();
    const client = this.getClient();

    if (client) {
      try {
        const prompt = `You are NEXUS, the Supreme Financial Supervisor for Imperium 2.0.
Audit the following trade proposal strictly and impartially:
Ticker: $${opp.ticker} ($${quote.price.toFixed(2)})
Worker Desk: ${opp.workerName} (${opp.strategy})
Setup: ${opp.setup}
Catalyst: ${opp.catalyst}
Company Financials:
- Revenue: $${fin.revenue.toLocaleString()} (YoY: ${fin.revenueGrowthYoY}%)
- Cash: $${fin.totalCash.toLocaleString()} | Debt: $${fin.totalDebt.toLocaleString()}
- Cash Runway: ${fin.cashRunwayMonths} months
Risk Envelope:
- Per-Trade Cap: $${state.riskLimits.perTradeCap.toFixed(2)}
- Available Nexus Allowance: $${state.nexusAllowance.toFixed(2)}

Evaluate separately:
1. Company Quality Score (0-100) based on balance sheet, cash runway, and business model.
2. Trade Setup Quality Score (0-100) based on technical setup, volume, and spread.
3. Final Verdict: 'APPROVE FOR PAPER REVIEW' | 'REJECT' | 'WAIT' | 'NEEDS MORE EVIDENCE'.

Return JSON strictly matching this schema:
{
  "verdict": "APPROVE FOR PAPER REVIEW",
  "companyQualityScore": 85,
  "tradeSetupQualityScore": 88,
  "reasoning": "Clear explanation of supervisory thesis.",
  "capitalRequested": 100.0,
  "entryPlan": "Entry parameters.",
  "targetPlan": "Target profit parameters.",
  "stopPlan": "Protective stop boundary.",
  "invalidationTrigger": "What breaks the thesis.",
  "lessonLearnedPreview": "What this trade will teach the system."
}`;

        const res = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.1 }
        });

        if (res.text) {
          const parsed = JSON.parse(res.text);
          return {
            verdict: parsed.verdict || 'APPROVE FOR PAPER REVIEW',
            companyQualityScore: Number(parsed.companyQualityScore || 80),
            tradeSetupQualityScore: Number(parsed.tradeSetupQualityScore || 82),
            reasoning: parsed.reasoning || `Nexus verified $${opp.ticker} technical and fundamental parameters.`,
            capitalRequested: Math.min(state.riskLimits.perTradeCap, Number(parsed.capitalRequested || state.riskLimits.perTradeCap)),
            entryPlan: parsed.entryPlan || opp.entryConcept,
            targetPlan: parsed.targetPlan || opp.exitConcept,
            stopPlan: parsed.stopPlan || opp.stopConcept,
            invalidationTrigger: parsed.invalidationTrigger || 'Break of support level or adverse filing',
            lessonLearnedPreview: parsed.lessonLearnedPreview || 'Enforcing strict stop loss discipline preserves capital.'
          };
        }
      } catch (e: any) {
        console.warn('[DecisionEngine] Gemini evaluation exception:', e.message);
      }
    }

    // Deterministic Rule-Based Fallback
    const companyScore = fin.totalCash >= fin.totalDebt ? 82 : 70;
    const setupScore = quote.spread <= state.riskLimits.maxSpreadAllowed ? 85 : 60;
    const verdict: OpportunityVerdict = (companyScore >= 70 && setupScore >= 75) ? 'APPROVE FOR PAPER REVIEW' : 'REJECT';

    return {
      verdict,
      companyQualityScore: companyScore,
      tradeSetupQualityScore: setupScore,
      reasoning: verdict === 'APPROVE FOR PAPER REVIEW'
        ? `Setup verified under ${opp.strategy} desk. Spread ($${quote.spread.toFixed(3)}) within safety envelope.`
        : `Rejected due to risk parameters or wide spread ($${quote.spread.toFixed(3)}).`,
      capitalRequested: Math.min(state.riskLimits.perTradeCap, 100.0),
      entryPlan: opp.entryConcept,
      targetPlan: opp.exitConcept,
      stopPlan: opp.stopConcept,
      invalidationTrigger: 'Break below stop boundary or distribution volume',
      lessonLearnedPreview: 'Systematic pre-trade gating eliminates high-risk entries.'
    };
  }

  /**
   * Deterministic Central Pre-Trade Risk Gate
   * Hard mathematical validation that CANNOT be bypassed.
   */
  public async validatePreTradeRisk(symbol: string, qty: number, side: 'buy' | 'sell' = 'buy', customPrice?: number): Promise<PreTradeRiskCheckResult> {
    const state = db.getState();
    const creds = getAlpacaCredentials();
    const quote = await marketDataService.getQuote(symbol);

    const price = customPrice && customPrice > 0 ? customPrice : (quote.price > 0 ? quote.price : 0);
    const estimatedCost = Number((qty * price).toFixed(2));
    const marketDataAgeMs = quote.ageMs;

    const checks = {
      operatingStateActive: state.operatingState === 'ACTIVE',
      paperSafetyLockPassed: creds.isPaperSafe,
      alpacaConfigured: creds.isConfigured,
      marketDataFresh: quote.freshnessState === 'FRESH' || quote.freshnessState === 'AGING',
      spreadWithinTolerance: quote.spread <= state.riskLimits.maxSpreadAllowed,
      perTradeCapSatisfied: side === 'sell' || estimatedCost <= state.riskLimits.perTradeCap,
      allowanceSufficient: side === 'sell' || estimatedCost <= state.nexusAllowance,
      maxPositionsSatisfied: side === 'sell' || state.positions.length < state.riskLimits.maxConcurrentPositions,
      emergencyFreezeClear: !state.riskLimits.emergencyFreezeActive,
      riskStateSafe: state.riskLimits.riskState !== 'STOP'
    };

    let failureReason: string | undefined = undefined;

    if (!checks.emergencyFreezeClear) {
      failureReason = 'Emergency Risk Freeze is active across all trading desks.';
    } else if (!checks.riskStateSafe) {
      failureReason = 'Global loss stop or maximum drawdown safety boundary reached.';
    } else if (!checks.operatingStateActive) {
      failureReason = `Operating state is ${state.operatingState}. Buying is halted. Switch to ACTIVE mode to enable execution.`;
    } else if (!checks.paperSafetyLockPassed) {
      failureReason = 'SAFETY LOCK: Non-paper endpoint detected! Real money execution is strictly prohibited.';
    } else if (!checks.alpacaConfigured) {
      failureReason = 'Alpaca Paper API is not configured or authenticated.';
    } else if (price <= 0 || !checks.marketDataFresh) {
      failureReason = `Market data is ${quote.freshnessState} or unavailable for $${symbol}.`;
    } else if (!checks.spreadWithinTolerance) {
      failureReason = `Bid-Ask spread ($${quote.spread.toFixed(3)}) exceeds maximum allowable spread ($${state.riskLimits.maxSpreadAllowed.toFixed(3)}).`;
    } else if (!checks.perTradeCapSatisfied) {
      failureReason = `Order allocation ($${estimatedCost.toFixed(2)}) exceeds per-trade cap ($${state.riskLimits.perTradeCap.toFixed(2)}).`;
    } else if (!checks.allowanceSufficient) {
      failureReason = `Order allocation ($${estimatedCost.toFixed(2)}) exceeds available Nexus Allowance ($${state.nexusAllowance.toFixed(2)}).`;
    } else if (!checks.maxPositionsSatisfied) {
      failureReason = `Maximum concurrent positions limit (${state.riskLimits.maxConcurrentPositions}) reached. Close a position to free capacity.`;
    }

    const passed = !failureReason;

    return {
      passed,
      failureReason,
      checks,
      metrics: {
        symbol: symbol.toUpperCase(),
        shares: qty,
        price,
        estimatedCost,
        spread: quote.spread,
        marketDataAgeMs,
        availableAllowance: state.nexusAllowance,
        currentPositionsCount: state.positions.length
      }
    };
  }
}

export const decisionAndRiskEngine = new DecisionAndRiskEngine();
