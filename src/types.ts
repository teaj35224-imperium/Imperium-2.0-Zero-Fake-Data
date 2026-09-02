// IMPERIUM COMMAND & NEXUS TYPES
// Comprehensive data models

export type SystemStatusState = 
  | 'ONLINE' 
  | 'ACTIVE' 
  | 'STANDBY' 
  | 'CAUTION' 
  | 'STOP'
  | 'RECOVERY' 
  | 'NOT CONNECTED' 
  | 'ERROR'
  | 'WAITING FOR DATA';

export type OperatingState = 
  | 'ACTIVE' 
  | 'CAPITAL_FULL' 
  | 'STANDBY' 
  | 'CASH_OUT_STANDBY' 
  | 'EMERGENCY_STOP' 
  | 'STOP_BUYING';

export type NexusState = 
  | 'STANDBY' 
  | 'ACTIVE' 
  | 'GOT ONE' 
  | 'ACTION REQUIRED' 
  | 'CAUTION' 
  | 'RECOVERY' 
  | 'VERIFYING'
  | 'CAPITAL_FULL'
  | 'EMERGENCY_STOP';

export type RiskPrimaryState = 'SAFE' | 'CAUTION' | 'STOP';

export type WorkerDeskType = 
  | 'PENNY DESK'
  | 'MOMENTUM'
  | 'BREAKOUT'
  | 'VOLUME'
  | 'CATALYST'
  | 'SWING'
  | 'LARGE CAP'
  | 'GENERAL MARKET'
  | 'LONG-TERM'
  | 'RETIREMENT'
  | 'PORTFOLIO HEALTH'
  | 'CAPITAL GROWTH'
  | 'NEXUS INDEPENDENT RESEARCH';

export type UserRole = 'OWNER/ADMIN' | 'DEVELOPER' | 'OPERATOR/TRADER' | 'STANDARD USER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  permissions: {
    canExecuteTrades: boolean;
    canModifyRiskLimits: boolean;
    canViewSecrets: boolean;
    canEmergencyExit: boolean;
    canChangeConfig: boolean;
  };
}

export type MarketFeedType = 'LIVE — IEX' | 'LIVE — SIP' | 'DELAYED' | 'RECONNECTING' | 'OFFLINE';

export interface MarketDataStatus {
  feed: MarketFeedType;
  freshness: string;
  ageSeconds: number;
  isStale: boolean;
  marketSession: 'PRE_MARKET' | 'REGULAR' | 'AFTER_HOURS' | 'CLOSED';
  marketClock: {
    isOpen: boolean;
    nextOpen: string;
    nextClose: string;
  };
}

export type PaperOrderStatus = 
  | 'REQUESTED' 
  | 'SUBMITTED' 
  | 'ACCEPTED' 
  | 'PARTIALLY_FILLED' 
  | 'FILLED' 
  | 'POSITION_OPEN' 
  | 'EXIT_REQUESTED' 
  | 'CLOSED' 
  | 'REJECTED' 
  | 'CANCELED';

export interface TradeSupervisorItem {
  positionId: string;
  ticker: string;
  company: string;
  fillPrice: number;
  quantity: number;
  currentPrice: number;
  targetPrice: number;
  stopPrice: number;
  currentPnL: number;
  currentPnLPercent: number;
  potentialTargetProfit: number;
  potentialStopLoss: number;
  targetProgressPercent: number;
  nexusStatus: string;
  tradeSupervisorStatus: 'MONITORING' | 'TRAILING_STOP' | 'TARGET_APPROACHING' | 'EXIT_SIGNALED' | 'CLOSED';
  lastMessage: string;
  feed: MarketFeedType;
  lastUpdate: string;
  orderStatus: PaperOrderStatus;
}

export type MoneyMapGrouping = 'STOCK' | 'WORKER' | 'STRATEGY' | 'SHORT_TERM' | 'LONG_TERM' | 'PENNY_DESK' | 'CASH';

export interface MoneyMapItem {
  id: string;
  label: string;
  ticker?: string;
  amount: number;
  percentage: number;
  shares?: number;
  entryPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
  target?: number;
  stop?: number;
  worker?: string;
  strategy?: string;
  nexusOpinion?: string;
  category: string;
  termType: 'SHORT_TERM' | 'SWING' | 'LONG_TERM' | 'CASH';
}

export interface DailyBrief {
  id: string;
  date: string;
  dateLabel: string;
  startingEquity: number;
  currentEquity: number;
  startingCash: number;
  currentCash: number;
  capitalDeployed: number;
  availableCash: number;
  tradesOpened: number;
  tradesClosed: number;
  wins: number;
  losses: number;
  realizedProfit: number;
  realizedLosses: number;
  netRealizedPnL: number;
  unrealizedPnL: number;
  totalDayChange: number;
  totalDayChangePercent: number;
  bestTrade: { ticker: string; pnl: number; pnlPercent: number } | null;
  worstTrade: { ticker: string; pnl: number; pnlPercent: number } | null;
  bestWorker: string;
  nexusLearningSummary: string;
  plainEnglishBrief: string;
}

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  category: 'AUTH' | 'PAPER_APPROVAL' | 'RISK_CHANGE' | 'EMERGENCY' | 'MODE_CHANGE' | 'RECONCILIATION';
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface FinancialConceptExplanation {
  term: string;
  title: string;
  simpleExplanation: string;
  whyItMatters: string;
  howNexusUsesIt: string;
  example: string;
}

export type OpportunityVerdict = 
  | 'APPROVE FOR PAPER REVIEW'
  | 'REJECT'
  | 'WAIT'
  | 'NEEDS MORE EVIDENCE'
  | 'ACTION REQUIRED';

export interface OpportunityEvidence {
  source: string;
  type: 'TECHNICAL' | 'FUNDAMENTAL' | 'CATALYST' | 'VOLUME' | 'ORDER_FLOW' | 'SENTIMENT';
  description: string;
  freshness: string;
  reliabilityScore: number; // 0-100
  isConflicting?: boolean;
}

export interface Opportunity {
  id: string;
  ticker: string;
  company: string;
  workerId: string;
  workerName: string;
  strategy: string;
  setup: string;
  catalyst: string;
  timestamp: string;
  confidence: number; // 0 - 100%
  currentPrice: number;
  expectedUpside: number; // percentage
  expectedDownside: number; // percentage
  estimatedPotentialProfit: number; // in USD based on per-trade cap
  liquidityScore: number; // 0-100
  spread: number; // in USD or cents
  volume: number;
  relativeVolume: number;
  entryConcept: string;
  exitConcept: string;
  stopConcept: string;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  evidence: OpportunityEvidence[];
  conflictingEvidence: string[];
  dataFreshness: string;
  assistantNotes?: string;
  nexusEvaluation?: string;
  riskVerdict?: string;
  finalDecision: OpportunityVerdict;
  decisionReason?: string;
  isNewGotOne?: boolean;
  status: 'PENDING_NEXUS' | 'ASSISTANT_VERIFYING' | 'DECIDED' | 'ARCHIVED';
}

export interface DecisionArchiveRecord {
  id: string;
  ticker: string;
  company: string;
  date: string;
  time: string;
  workerId: string;
  workerName: string;
  strategy: string;
  setup: string;
  catalyst: string;
  estimatedUpside: number;
  estimatedPotentialProfit: number;
  risk: string;
  confidence: number;
  entryContext: string;
  exitContext: string;
  stopContext: string;
  evidenceSummary: string;
  nexusDecision: OpportunityVerdict;
  decisionReason: string;
  laterMarketOutcome: 'PRICE_SURGED' | 'PRICE_DROPPED' | 'SIDEWAYS' | 'HIT_STOP' | 'HIT_TARGET' | 'PENDING_OUTCOME';
  actualOutcomeIfTraded?: number; // percentage change after decision
  actualPnLIfTraded?: number; // USD
  wasNexusCorrect: boolean | null;
  wasWorkerCorrect: boolean | null;
  lessonLearned: string;
  futureStrategyImplication: string;
  revisitedAt?: string;
}

export interface WorkerHealth {
  status: 'ONLINE' | 'ACTIVE' | 'STANDBY' | 'DEGRADED' | 'QUARANTINED' | 'RECOVERING' | 'OFFLINE';
  heartbeat: string;
  latencyMs: number;
  errorCount: number;
  lastSuccessfulUpdate: string;
  dataFreshness: string;
  strategyDriftScore: number; // 0 = no drift, 100 = severe drift
  consecutiveFailures: number;
  quarantineReason?: string;
  recoveryStep?: 'DETECT' | 'DIAGNOSE' | 'PRESERVE STATE' | 'SELF-REPAIR' | 'VERIFY' | 'RESTART' | 'QUARANTINE' | 'ESCALATE' | 'NONE';
}

export interface WorkerPerformance {
  proposalsSent: number;
  proposalsApproved: number;
  accuracyRate: number; // %
  winRate: number; // %
  avgGain: number; // %
  avgLoss: number; // %
  profitFactor: number;
}

export interface Worker {
  id: string;
  name: string;
  specialty: WorkerDeskType;
  assignment: string;
  currentTask: string;
  health: WorkerHealth;
  performance: WorkerPerformance;
  recentSignals: { timestamp: string; ticker: string; signal: string; quality: number }[];
  nexusEvaluation: string;
}

export interface HoldingHealth {
  ticker: string;
  overallStatus: 'HEALTHY' | 'STABLE' | 'DEGRADING' | 'ACTION REQUIRED';
  fundamentalsStatus: 'STRONG' | 'NEUTRAL' | 'DETERIORATING';
  earningsStatus: 'BEAT' | 'PENDING' | 'MISSED' | 'GUIDANCE_CUT';
  catalystIntegrity: 'INTACT' | 'WEAKENING' | 'BROKEN';
  priceBehavior: 'ON_TRACK' | 'CHOPPY' | 'BREAKDOWN';
  volumeBehavior: 'ACCUMULATION' | 'NORMAL' | 'DISTRIBUTION';
  originalThesis: string;
  thesisStatus: 'VALID' | 'AT_RISK' | 'INVALIDATED';
  riskScore: number; // 0-100
  lastReview: string;
  actionRequiredDetails?: {
    whatChanged: string;
    whyItMatters: string;
    evidence: string[];
    severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
    possibleResponses: string[];
  };
}

export interface PositionTimelineEvent {
  id: string;
  timestamp: string;
  time: string;
  type: 
    | 'DISCOVERED' 
    | 'VERIFIED' 
    | 'RISK_PASSED' 
    | 'APPROVED' 
    | 'ORDER_SUBMITTED' 
    | 'FILL_CONFIRMED' 
    | 'HOLDING_CHECK' 
    | 'THESIS_CHANGE' 
    | 'PARTIAL_PROFIT' 
    | 'RUNNER_TRAIL' 
    | 'EXIT_REQUESTED' 
    | 'CLOSED' 
    | 'OWNER_ABORT';
  title: string;
  details: string;
  price?: number;
  shares?: number;
  isOwnerInitiated?: boolean;
}

export interface PlainEnglishPositionReasoning {
  whyIBought: string;
  whatIAmWatching: string;
  whatHasChanged: string;
  whatWouldMakeMeTakeProfit: string;
  whatWouldMakeMeSell: string;
  whatIHaveDone: string;
  whatIPlanToDoNext: string;
  currentRisk: string;
}

export interface Position {
  id: string;
  ticker: string;
  company: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  openedAt: string;
  thesis: string;
  confidence: number;
  stopLossPrice: number;
  targetPrice: number;
  trailingStopPercent?: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH';
  nexusStatus: 'MONITORING' | 'PROFIT_TARGET_NEAR' | 'TRAILING_ACTIVE' | 'ACTION_REQUIRED' | 'EXIT_PENDING';
  workerSource: string;
  strategy: string;
  lastReview: string;
  holdingHealth: HoldingHealth;
  partialProfitsTaken?: number;
  isRunner?: boolean;
  plainEnglishReasoning?: PlainEnglishPositionReasoning;
  timeline?: PositionTimelineEvent[];
  abortStatus?: 'IDLE' | 'ABORT_REQUESTED' | 'EXIT_ORDER_SUBMITTED' | 'PARTIALLY_FILLED' | 'POSITION_CLOSED' | 'ABORT_FAILED';
  brokerOrderId?: string;
}

export interface ProfitAllocationSettings {
  reinvestPercent: number; // e.g. 75
  reservePercent: number; // e.g. 25
  totalRealizedProfit: number;
  profitReserved: number;
  withdrawableCash: number;
  actuallyWithdrawnProfit: number;
}

export type PerformanceHorizon = 'TODAY' | 'WEEK' | 'MONTH' | '3_MONTHS' | '6_MONTHS' | 'YEAR' | 'LIFETIME';

export interface HorizonSnapshot {
  id: string;
  timeframe: PerformanceHorizon;
  timeframeLabel: string;
  startingAccountValue: number;
  endingAccountValue: number;
  deposits: number;
  withdrawals: number;
  realizedProfit: number;
  realizedLoss: number;
  netTradingPnL: number;
  unrealizedPnL: number;
  winRate: number; // %
  lossRate: number; // %
  avgWin: number;
  avgLoss: number;
  drawdown: number; // %
  tradesCount: number;
  workerPerformanceSummary: string;
  strategyPerformanceSummary: string;
  capitalUtilization: number; // %
}

export interface ShadowObservation {
  id: string;
  ticker: string;
  timestamp: string;
  workerId: string;
  workerName: string;
  strategy: string;
  simulatedAction: 'WOULD_BUY' | 'WOULD_REJECT' | 'WOULD_SELL' | 'WOULD_AVOID';
  entryPrice: number;
  simulatedUpside: number;
  reason: string;
  hypotheticalReturnPercent?: number;
  evaluationNote: string;
}

export interface CapitalWaitingOpportunity {
  id: string;
  ticker: string;
  company: string;
  workerId: string;
  workerName: string;
  strategy: string;
  confidence: number;
  expectedUpside: number;
  currentPrice: number;
  estimatedCapitalNeeded: number;
  queuedAt: string;
  lastRefreshedAt: string;
  isStillValid: boolean;
  priorityRank: number;
  invalidationReason?: string;
}

export interface Portfolio {
  equity: number;
  cash: number;
  buyingPower: number;
  dayChange: number;
  dayChangePercent: number;
  realizedPnLDay: number;
  unrealizedPnLTotal: number;
  totalPositionsCount: number;
  positions: Position[];
  exposureTotal: number;
  exposurePercent: number;
}

export interface RiskLimits {
  perTradeCap: number; // $100 default
  globalLossStop: number; // $10,000 default
  dailyMaxExposure: number; // in USD
  weeklyMaxExposure: number; // in USD
  maxConcurrentPositions: number; // e.g. 5
  minLiquidityScore: number; // 0-100
  maxSpreadAllowed: number; // in USD or cents
  marketHoursOnly: boolean;
  catalystGatingEnabled: boolean;
  emergencyFreezeActive: boolean;
  riskState: RiskPrimaryState;
}

export interface CapitalState {
  availableBuyingPower: number;
  capitalDeployed: number;
  capitalReserved: number;
  currentExposure: number;
  maxExposure: number;
  exposurePercent: number;
  riskState: RiskPrimaryState;
  activePositionsCount: number;
  remainingPositionCapacity: number;
}

export interface HumanActionRequired {
  id: string;
  timestamp: string;
  category: 'SECURITY' | 'BROKERAGE' | 'MARKET_DATA' | 'RISK_CONFLICT' | 'HOLDING_DETERIORATION' | 'WORKER_FAILURE' | 'CRITICAL_APPROVAL';
  title: string;
  whatHappened: string;
  whyItMatters: string;
  whatNexusTried: string;
  currentState: string;
  severity: 'CAUTION' | 'HIGH' | 'CRITICAL';
  availableHumanActions: {
    id: string;
    label: string;
    actionType: 'APPROVE' | 'REJECT' | 'RESTART_WORKER' | 'CLOSE_POSITION' | 'FREEZE_RISK' | 'ACKNOWLEDGE' | 'CUSTOM';
    impactDescription: string;
  }[];
  isResolved: boolean;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface NexusActivityItem {
  id: string;
  timestamp: string;
  actionText: string; // e.g. "SCANNING MARKET", "CHECKING WORKER SIGNALS", "VERIFYING EVIDENCE"
  category: 'MARKET_SCAN' | 'WORKER_SUPERVISION' | 'EVIDENCE_VERIFY' | 'OPPORTUNITY_EVAL' | 'RISK_CHECK' | 'PORTFOLIO_MONITOR' | 'LEARNING' | 'SYSTEM' | 'TRADE_MANAGEMENT';
  detail: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';
}

export interface LearningEvaluation {
  id: string;
  timestamp: string;
  strategyPerformance: {
    strategyName: string;
    tradesCount?: number;
    totalTrades?: number;
    winRate: number;
    avgReturn?: number;
    profitContribution?: number;
    profitFactor: number;
    weight: number; // 0.0 - 2.0
    auditableStatus: string;
  }[];
  workerAccuracy?: {
    workerName: string;
    specialty: WorkerDeskType;
    accuracyScore: number;
    sampleSize: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  }[];
  workerAccuracyRankings?: {
    workerName: string;
    approvedProposals: number;
    accuracyScore: number;
  }[];
  totalTradesEvaluated?: number;
  lastEvaluatedAt?: string;
  missedOpportunitiesCount?: number;
  reasoningAccuracyScore: number; // %
  falsePositiveRate: number; // %
  falseNegativeRate?: number; // %
  missedOpportunitiesIdentified?: number;
  riskEffectivenessScore: number; // %
  topLessonsLearned: string[];
}

export interface MarketQuote {
  ticker: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  relativeVolume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
  dataStatus: 'LIVE' | 'CURRENT' | 'DELAYED' | 'NOT CONNECTED' | 'DATA NOT FOUND';
  provider: 'ALPACA' | 'YAHOO_FINANCE_SEC' | 'UNAVAILABLE';
}

export interface MarketCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  ticker: string;
  company: string;
  desk: WorkerDeskType;
  price: number;
  changePercent: number;
  signal: string;
  setup: string;
  confidence: number;
  addedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  category: 'NEXUS' | 'WORKERS' | 'MARKET DATA' | 'ALPACA' | 'RISK' | 'PORTFOLIO' | 'EXECUTION' | 'RECOVERY' | 'DECISIONS' | 'HUMAN ESCALATIONS' | 'SYSTEM' | 'PROFIT';
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  technicalDetails?: string;
}

export interface SystemStatusSummary {
  nexusCore: SystemStatusState;
  marketData: SystemStatusState;
  alpacaPaper: SystemStatusState;
  workerNetwork: SystemStatusState;
  riskEngine: SystemStatusState;
  portfolioMonitor: SystemStatusState;
  decisionArchive: SystemStatusState;
  learningEngine: SystemStatusState;
  alpacaConnected: boolean;
  geminiConnected: boolean;
  lastHeartbeat: string;
}

export type RobotFaceState = 
  | 'STANDBY'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'NAVIGATING'
  | 'ALERT'
  | 'RECOVERY'
  | 'EXPLAINING'
  | 'GOT ONE'
  | 'ACTION REQUIRED';

export interface AlpacaAccountData {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: number;
  portfolio_value: number;
  buying_power: number;
  equity: number;
  last_equity: number;
  multiplier: string;
  daytrade_count: number;
  pattern_day_trader: boolean;
  trade_suspended_by_user: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
}

export interface AlpacaOrderData {
  id: string;
  client_order_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  type: string;
  side: 'buy' | 'sell';
  time_in_force: string;
  limit_price?: string;
  stop_price?: string;
  status: string;
  submitted_at: string;
  filled_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  filled_avg_price?: string;
}

export interface NavigatorExplanation {
  screenName: string;
  summary: string;
  keyMetrics: { label: string; value: string; assessment: string }[];
  nexusObservation: string;
  availableControls: string[];
  relevantRisks: string[];
  dataSource: {
    provider: string;
    state: 'LIVE' | 'IEX' | 'DELAYED' | 'PAPER' | 'DEMO' | 'STALE' | 'NOT CONNECTED' | 'DATA UNAVAILABLE';
    freshness: string;
  };
}

export type ChartTimeframe = '1D' | '5D' | '1M' | '3M' | '1Y';

export interface StockChartMarker {
  id: string;
  time: string;
  price: number;
  type: 'ENTRY' | 'STOP' | 'TARGET' | 'DECISION' | 'ALERT' | 'GOT_ONE';
  label: string;
  details?: string;
  color?: string;
}

export interface StockLiveActivityItem {
  id: string;
  timestamp: string;
  source: string;
  actionText: string;
  detail: string;
  status: 'IN_PROGRESS' | 'VERIFIED' | 'CAUTION' | 'COMPLETED';
}

export interface StockWorkerFinding {
  workerId: string;
  workerName: string;
  specialty: WorkerDeskType;
  signal: string;
  quality: number;
  timestamp: string;
  status: 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'ALERT';
  rationale: string;
}

export interface StockWorkspaceData {
  quote: MarketQuote;
  position?: Position | null;
  nexusThesis: {
    summary: string;
    confidence: number;
    conviction: 'HIGH' | 'MODERATE' | 'LOW' | 'CAUTION';
    entryRange: string;
    exitTarget: string;
    stopBoundary: string;
    riskRewardRatio: number;
    evidenceSummary: string[];
    conflictingFactors: string[];
    supervisoryVerdict: OpportunityVerdict | 'MONITORING' | 'NO_OPPORTUNITY';
  };
  workerFindings: StockWorkerFinding[];
  riskCheck: {
    isPassed: boolean;
    perTradeCapOk: boolean;
    spreadScoreOk: boolean;
    liquidityScoreOk: boolean;
    maxPositionsOk: boolean;
    notes: string[];
  };
  liveActivities: StockLiveActivityItem[];
  recentOrders: AlpacaOrderData[];
  chartMarkers: StockChartMarker[];
}

// ---------------------------------------------------------
// CAPITAL ARENA (MONEY GAME & CAPITAL STRATEGY) TYPES
// ---------------------------------------------------------

export type ArenaTimeframe = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL_TIME';

export type ArenaActionState = 
  | 'WATCHING' 
  | 'RESEARCHING' 
  | 'GOT ONE' 
  | 'REVIEWING' 
  | 'PAPER BUY' 
  | 'HOLDING' 
  | 'ADDING' 
  | 'REDUCING' 
  | 'EXITING' 
  | 'CLOSED' 
  | 'REJECTED';

export interface ArenaStockCard {
  ticker: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  dataStatus: 'LIVE' | 'DEMO';
  nexusConfidence: number;
  strategy: string;
  paperCapitalAllocated: number;
  sharesOwned: number;
  currentPnL: number;
  currentPnLPercent: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH';
  workerActivity: string;
  nexusActionState: ArenaActionState;
  isHeld: boolean;
  entryPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
  spread: number;
  relativeVolume: number;
}

export interface CapitalMovementEvent {
  id: string;
  time: string;
  ticker: string;
  action: 'ALLOCATE' | 'ADD' | 'REDUCE' | 'HOLD' | 'CLOSE' | 'REJECT_CASH' | 'PROFIT_TAKEN';
  paperAmount: number;
  quantity: number;
  price: number;
  nexusReason: string;
  riskStatus: 'PASSED' | 'CAP_ENFORCED' | 'SPREAD_TOLERATED' | 'PROTECTIVE_EXIT';
  result?: string;
  flowStage: 'CASH' | 'ALLOCATION' | 'POSITION' | 'VALUATION' | 'SETTLEMENT' | 'CASH_RETURN';
}

export interface ArenaLiveActivityItem {
  id: string;
  timestamp: string;
  source: string; // e.g. "NEXUS", "MOMENTUM WORKER", "RISK WORKER", "PORTFOLIO HEALTH"
  message: string;
  type: 'SCAN' | 'WORKER' | 'RISK' | 'DECISION' | 'ALLOCATION' | 'MONITOR' | 'EXIT';
  ticker?: string;
  riskStatus?: 'SAFE' | 'CAUTION' | 'VERIFIED';
}
