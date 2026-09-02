// NEXUS KNOWLEDGE REGISTRY & SUPERVISORY INTELLIGENCE ENGINE
// Complete structured understanding of Imperium Command Center

export interface AppScreenKnowledge {
  id: string;
  name: string;
  category: 'PRIMARY' | 'DESK' | 'OPERATIONS' | 'AUDIT' | 'CONFIG';
  summary: string;
  purpose: string;
  availableControls: string[];
  keyDataPoints: string[];
  commonQuestions: string[];
  safeNavCommand: string[];
  risksMonitored: string[];
}

export const APP_SCREENS_REGISTRY: Record<string, AppScreenKnowledge> = {
  COMMAND_CENTER: {
    id: 'COMMAND_CENTER',
    name: 'Imperium Command Cockpit',
    category: 'PRIMARY',
    summary: 'The main tactical operations center providing top-level supervisory oversight of capital, workers, opportunities, and portfolio risk.',
    purpose: 'Aggregates whole-system telemetry, active got one proposals, holding health, and fast navigation bars.',
    availableControls: [
      'Original Large Octagonal Nexus Master Button',
      'System Telemetry Live Pill & Heartbeat',
      'Primary Touch Bar (Got One, Action Required, Capital & Portfolio, Markets, Risk)',
      'Operations Bar (Specialist Desks, Decision Archive, Learning Loop, System Status)',
      'Got One Candidate Opportunity Cards (1-touch evaluation)',
      'Holding Health Sentinel Alerts',
      'Live Matrix Background'
    ],
    keyDataPoints: [
      'Nexus Core State (STANDBY, ACTIVE, GOT ONE, ACTION REQUIRED, CAUTION, RECOVERY)',
      'Total Paper Equity & Buying Power',
      'Risk Envelope Status (SAFE / CAUTION / STOP)',
      'Active Positions Count & Slots Remaining',
      'Specialist Desks Online/Degraded Count'
    ],
    commonQuestions: [
      'What am I looking at?',
      'Is everything running safely?',
      'Do we have any new Got One opportunities?',
      'What is our paper buying power?',
      'Are any workers failing?'
    ],
    safeNavCommand: ['home', 'cockpit', 'command center', 'main screen', 'dashboard', 'overview'],
    risksMonitored: ['Holding thesis breakdowns', 'Macro regime transitions', 'System disconnections']
  },
  PORTFOLIO: {
    id: 'PORTFOLIO',
    name: 'Portfolio & Money Control Center',
    category: 'PRIMARY',
    summary: 'Comprehensive paper position tracker, capital & money flow pipeline, buying power breakdown, and order execution desk.',
    purpose: 'Calculates real-time P&L, traces capital flow from cash reserves to active market holdings, and executes risk-gated paper trades.',
    availableControls: [
      'Close Position (with confirmation review)',
      'Inspect Holding Health & Sentinel Audit',
      'Capital & Money Flow Pipeline View',
      'Paper Order Execution Desk (Risk-Gated)',
      'Alpaca Paper Live Status & Account Telemetry',
      'Order History & Execution Ledger',
      'Cash Out / Withdrawal Info & Security Lock'
    ],
    keyDataPoints: [
      'Total Paper Equity',
      'Cash Reserve & Buying Power',
      'Total Unrealized P&L ($ and %)',
      'Invested Money / Exposure ($ and %)',
      'Realized P&L for Today',
      'Open Positions & Risk Limits'
    ],
    commonQuestions: [
      'Where is my money?',
      'How much cash and buying power do I have?',
      'Show money flow pipeline',
      'Can I withdraw my money?',
      'How do I close an open paper position?'
    ],
    safeNavCommand: ['portfolio', 'positions', 'holdings', 'equity', 'paper orders', 'money', 'buying power', 'money flow', 'cash out', 'withdraw'],
    risksMonitored: ['Holding thesis degradation', 'Volume distribution breakdown', 'Earnings surprises', 'Over-allocation']
  },
  STOCK_WORKSPACE: {
    id: 'STOCK_WORKSPACE',
    name: 'Stock Workspace & Interactive Chart',
    category: 'PRIMARY',
    summary: 'Deep-dive stock detail view, multi-timeframe candlestick & line charts, overlaid stop/target markers, Nexus supervisory thesis, worker findings, and risk gates.',
    purpose: 'Provides institutional-grade technical, momentum, and risk telemetry for individual symbols with 1-touch paper execution.',
    availableControls: [
      'Timeframe Selector (1D, 5D, 1M, 3M, 1Y)',
      'Chart Mode Toggle (Candles vs Line Area)',
      'Interactive Price & Volume Crosshair Tooltip',
      'Ticker Search & Switcher',
      'Two-Step Paper Order Execution Desk',
      'Nexus Thesis & Worker Desk Evidence Review'
    ],
    keyDataPoints: [
      'Verified Market Price, Bid, Ask, Spread, Volume, Relative Volume',
      'Entry, Hard Stop, and Target Overlay Lines',
      'Holding Health Status (if owned)',
      'Nexus Thesis Conviction & Entry Range',
      'Per-Trade Cap Suitability Gate'
    ],
    commonQuestions: [
      'Show chart for NVDA / PLTR / CRWD',
      'What is the Nexus thesis on this stock?',
      'Are we holding this stock in our portfolio?',
      'What is the spread and volume confirmation?'
    ],
    safeNavCommand: ['stock workspace', 'stock chart', 'chart', 'candles', 'ticker detail', 'workspace', 'stock'],
    risksMonitored: ['Excessive spread risk', 'Volume divergence', 'Resistance rejection', 'Risk cap violation']
  },
  MARKETS: {
    id: 'MARKETS',
    name: 'Markets & Real-Time Intelligence Desk',
    category: 'PRIMARY',
    summary: 'Streaming market quote board, interactive 15-minute candlestick charts, bid-ask spread monitors, and watchlist scanner.',
    purpose: 'Provides authoritative market data from configured real providers. If authoritative data is unavailable, the system returns DATA NOT FOUND.',
    availableControls: [
      'Symbol Search Input',
      'Candlestick Chart Timeframe & Multi-Quote Selector',
      'Watchlist Item Filter (MegaCap, Tech, Penny, Momentum)',
      'Open Paper Order Desk (1-Touch Routing)'
    ],
    keyDataPoints: [
      'Real-time Bid / Ask / Spread / Relative Volume',
      '15-Minute Candlestick Open/High/Low/Close Series',
      'Feed State (ALPACA LIVE IEX vs TELEMETRY SIMULATOR)',
      'Watchlist Momentum Indicators'
    ],
    commonQuestions: [
      'What is the price of NVDA / PLTR / CRWD?',
      'Is authoritative market data available?',
      'What is the bid-ask spread on KULR?',
      'Show me market charts'
    ],
    safeNavCommand: ['markets', 'market data', 'quotes', 'watchlist', 'chart', 'candlestick', 'prices'],
    risksMonitored: ['Wide bid-ask spread illiquidity', 'Stale price feeds', 'Volume dry-ups']
  },
  WORKERS: {
    id: 'WORKERS',
    name: 'Specialist Worker Network',
    category: 'DESK',
    summary: '8 autonomous research desks continuously evaluating technical, fundamental, catalyst, and order-flow signals.',
    purpose: 'Generates structured candidate proposals, logs latency, and maintains strategy discipline.',
    availableControls: [
      'Select Worker for Deep-Dive',
      'Ping Worker / Trigger Health Diagnostic',
      'Quarantine Degraded Desk',
      'Filter Desks by Health Status'
    ],
    keyDataPoints: [
      'Worker Status (ONLINE, ACTIVE, STANDBY, DEGRADED, QUARANTINED)',
      'Heartbeat Latency (ms) and Last Successful Update',
      'Strategy Drift Score (0 - 100)',
      'Historical Win Rate (%) and Profit Factor',
      'Recent Signals Stream'
    ],
    commonQuestions: [
      'Which worker is the most accurate?',
      'Why is Penny Desk showing degraded latency?',
      'How does the self-healing watchdog repair failed workers?',
      'What is Momentum Breakout scanning right now?'
    ],
    safeNavCommand: ['workers', 'specialists', 'desks', 'agents', 'network', 'worker health', 'bot status'],
    risksMonitored: ['Strategy drift', 'Correlated false signals', 'Network latency', 'Model hallucination']
  },
  RISK: {
    id: 'RISK',
    name: 'Central Risk Engine & Capital Guardrails',
    category: 'PRIMARY',
    summary: 'Hard mathematical gating kernel that inspects and authorizes every trade before routing.',
    purpose: 'Enforces position sizing caps, global portfolio stops, spread limits, and emergency lockdown controls.',
    availableControls: [
      'Adjust Per-Trade Capital Cap ($)',
      'Adjust Global Daily Loss Stop ($)',
      'Adjust Max Concurrent Positions Limit',
      'Toggle Emergency Risk Freeze (Instant Fail-Closed Halt)',
      'Toggle Trade Only In Regular Market Hours'
    ],
    keyDataPoints: [
      'Current Risk State (SAFE / CAUTION / STOP)',
      'Per-Trade Cap ($500.00 default)',
      'Global Loss Stop ($1,500.00 default)',
      'Emergency Freeze Active Flag',
      'Available Capacity Slots'
    ],
    commonQuestions: [
      'What are our current risk limits?',
      'Is the emergency freeze on?',
      'Can I change the per-trade allocation cap?',
      'Why did Risk reject a trade?'
    ],
    safeNavCommand: ['risk', 'guardrails', 'limits', 'freeze', 'emergency stop', 'capital controls'],
    risksMonitored: ['Rogue position sizing', 'Correlated concentration', 'Slippage during illiquid market hours']
  },
  GOT_ONE_DETAIL: {
    id: 'GOT_ONE_DETAIL',
    name: 'Got One Opportunity Evaluation Chamber',
    category: 'PRIMARY',
    summary: 'Deep-dive supervisory inspection of a specific trade proposal submitted by a specialist desk.',
    purpose: 'Deduplicates evidence, calculates reward-to-risk, checks thesis integrity, and renders supervisory verdict.',
    availableControls: [
      'Approve for Paper Review (Gated)',
      'Reject Proposal (with reason archival)',
      'Request More Evidence',
      'Inspect Sponsoring Worker Desk',
      'Cycle Next Candidate Opportunity'
    ],
    keyDataPoints: [
      'Candidate Ticker, Company, Strategy, Setup',
      'Confidence Score (%) and Risk:Reward Ratio',
      'Technical / Fundamental / Catalyst / Order Flow Evidence Cards',
      'Conflicting Evidence Flags',
      'Nexus Supervisory Evaluation Text'
    ],
    commonQuestions: [
      'Why is this opportunity recommended?',
      'What is the conflicting evidence for this setup?',
      'What is the expected upside vs downside?',
      'Who found this trade?'
    ],
    safeNavCommand: ['got one', 'opportunity', 'proposals', 'candidate', 'latest idea'],
    risksMonitored: ['Low-liquidity penny pump', 'Unverified catalyst claims', 'Deteriorating volume profiles']
  },
  ACTION_REQUIRED: {
    id: 'ACTION_REQUIRED',
    name: 'Action Required Escalation Center',
    category: 'PRIMARY',
    summary: 'Critical holding alarms, broken theses, and human authorizations requiring immediate operator judgment.',
    purpose: 'Prevents silent portfolio decay by surfacing deteriorating catalysts and high-urgency alarms.',
    availableControls: [
      'Authorize Holding Exit / Close',
      'Acknowledge & Dismiss Alarm',
      'Inspect Problematic Position Thesis',
      'Review Footnote Filings & Volume Anomalies'
    ],
    keyDataPoints: [
      'Escalation Level (CRITICAL / HIGH / WARNING)',
      'Flagged Asset (e.g. $IONQ)',
      'Identified Root Cause & Footnote Evidence',
      'Recommended Operator Action'
    ],
    commonQuestions: [
      'Why is action required on IONQ?',
      'What happens if I dismiss this alarm?',
      'How does Nexus detect footnote filings?'
    ],
    safeNavCommand: ['action required', 'escalations', 'urgent', 'alarms', 'alerts', 'warnings'],
    risksMonitored: ['Silent thesis decay', 'SEC investigation disclosures', 'Insider distribution']
  },
  DECISIONS: {
    id: 'DECISIONS',
    name: 'Decision Archive & Post-Mortem Chamber',
    category: 'AUDIT',
    summary: 'Historical ledger of all approved, rejected, and waited opportunities with subsequent market price outcomes.',
    purpose: 'Measures decision quality, verifies whether Nexus or the worker was correct, and records distilled lessons.',
    availableControls: [
      'Filter by Decision (Approved, Rejected, Waited)',
      'Search Archive by Ticker or Strategy',
      'Inspect Lesson Learned & Future Strategy Implication',
      'View Simulated Outcome vs Actual Market Move'
    ],
    keyDataPoints: [
      'Archived Opportunity Record',
      'Nexus Decision Verdict & Stated Reason',
      'Actual Market Move After Verdict (+% or -%)',
      'Was Nexus Correct Flag',
      'Estimated Capital Preserved / Gained'
    ],
    commonQuestions: [
      'Why did Nexus reject KULR or SOUN?',
      'What did we learn from the last rejected trade?',
      'How much money was saved by rejecting false breakouts?'
    ],
    safeNavCommand: ['archive', 'decision archive', 'history', 'post mortem', 'past trades', 'rejected trades'],
    risksMonitored: ['Repeated strategy mistakes', 'Over-aggressive approvals in choppy regimes']
  },
  LEARNING: {
    id: 'LEARNING',
    name: 'Nexus Measurable Learning Loop',
    category: 'AUDIT',
    summary: 'Auditable strategic weight matrix, worker accuracy evaluations, and dynamic machine learning adaptation.',
    purpose: 'Continuously adjusts confidence weights across desks based on empirical price outcomes.',
    availableControls: [
      'Adjust Strategy Weight Multipliers',
      'Review Distilled Lessons Learned Ledger',
      'Inspect False Positive vs True Positive Breakdown',
      'Trigger Learning Re-weighting Cycle'
    ],
    keyDataPoints: [
      'Reasoning Accuracy Score (%)',
      'Risk Engine Defense Efficiency (%)',
      'Strategy Weights (Breakouts: 1.15x, Penny Pump: 0.65x, Catalysts: 1.10x)',
      'Worker Accuracy Rankings'
    ],
    commonQuestions: [
      'What has Nexus learned today?',
      'Why is the Penny Desk multiplier reduced to 0.65x?',
      'How does Nexus prevent overfitting?'
    ],
    safeNavCommand: ['learning', 'learning loop', 'weights', 'strategy matrix', 'lessons learned', 'machine learning'],
    risksMonitored: ['Overfitting to short-term volatility', 'Desk confirmation bias']
  },
  SYSTEM_STATUS: {
    id: 'SYSTEM_STATUS',
    name: 'System Status & Infrastructure Monitor',
    category: 'OPERATIONS',
    summary: 'Whole-system health monitor showing real-time ping latencies, API credentials, and background heartbeat loops.',
    purpose: 'Ensures transparent operational integrity across Alpaca Paper, Gemini AI, Risk Kernel, and Market Feeds.',
    availableControls: [
      'Run Full Infrastructure Health Check',
      'Test Alpaca Paper Connection',
      'Test Gemini Supervisory AI Model',
      'View Real-Time Heartbeat Interval'
    ],
    keyDataPoints: [
      'Nexus Core Status',
      'Alpaca Paper Status & Base URL',
      'Market Data Feed Status',
      'Risk Kernel Status',
      'Last Heartbeat Timestamp'
    ],
    commonQuestions: [
      'Is Alpaca paper trading connected?',
      'Is the Gemini AI model active?',
      'Are there any system-level errors?'
    ],
    safeNavCommand: ['status', 'system status', 'health', 'diagnostics', 'heartbeat', 'connection status'],
    risksMonitored: ['API rate limits', 'WebSocket disconnects', 'Missing environment variables']
  },
  SETTINGS: {
    id: 'SETTINGS',
    name: 'Settings & Connections Desk',
    category: 'CONFIG',
    summary: 'Configuration panel for broker credentials, API keys, telemetry preferences, and audio feedback.',
    purpose: 'Manages Alpaca Paper API keys, data provider preferences, and supervisory voice settings.',
    availableControls: [
      'Save Alpaca Paper Key & Secret',
      'Toggle Paper Mode vs Simulator',
      'Toggle Voice Feedback / Text-to-Speech',
      'Reset Local Demo State'
    ],
    keyDataPoints: [
      'Alpaca Configured Flag',
      'Active Broker Endpoint (https://paper-api.alpaca.markets)',
      'Voice Synthesis Engine Available Flag'
    ],
    commonQuestions: [
      'How do I connect my Alpaca paper account?',
      'Where do I enter API credentials?',
      'How do I turn on/off voice feedback?'
    ],
    safeNavCommand: ['settings', 'connections', 'configure', 'api keys', 'alpaca keys', 'preferences'],
    risksMonitored: ['Exposing live credentials (paper keys only)', 'Corrupt configuration']
  },
  LOGS: {
    id: 'LOGS',
    name: 'System Logs & Audit Trail',
    category: 'AUDIT',
    summary: 'Chronological telemetry log recording every supervisory decision, risk check, worker signal, and execution receipt.',
    purpose: 'Provides transparent verification and forensic debugging for all autonomous and human actions.',
    availableControls: [
      'Filter Logs by Category (NEXUS, WORKERS, RISK, ALPACA, EXECUTION)',
      'Filter Logs by Severity (INFO, SUCCESS, WARNING, ERROR, CRITICAL)',
      'Export / Copy Log Stream'
    ],
    keyDataPoints: [
      'Timestamped Log Entries',
      'Category & Severity Badges',
      'Technical Payload & Execution Receipts'
    ],
    commonQuestions: [
      'Why did a paper order fail?',
      'Show me the execution receipt for NVDA',
      'Show recent errors'
    ],
    safeNavCommand: ['logs', 'audit trail', 'system logs', 'console', 'debug logs'],
    risksMonitored: ['Silent errors', 'Unlogged state transitions']
  }
};

// Natural language query & navigation parser
export interface ParseResult {
  intent: 'NAVIGATE' | 'EXPLAIN_CURRENT' | 'EXPLAIN_SPECIFIC' | 'QUERY_STATE' | 'SOLVE_PROBLEM' | 'GENERAL_CONVERSATION';
  targetScreen?: string;
  queryParam?: string;
  directAnswer?: string;
  suggestedState: 'STANDBY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'NAVIGATING' | 'ALERT' | 'RECOVERY';
}

export function parseNexusCommand(
  rawInput: string,
  currentScreenId: string,
  systemContext: {
    portfolio: any;
    riskLimits: any;
    opportunities: any[];
    positions: any[];
    workers: any[];
    isAlpacaPaperConnected: boolean;
    alpacaAccount: any;
    humanEscalations: any[];
    decisionArchive: any[];
    systemLogs: any[];
  }
): ParseResult {
  const text = rawInput.trim().toLowerCase();

  // 1. Navigation requests
  const navPhrases = ['take me to', 'go to', 'open', 'show me', 'navigate to', 'switch to', 'bring up', 'look at'];
  const backPhrases = ['take me back', 'go back', 'back to cockpit', 'back home', 'return', 'close this', 'home'];

  if (backPhrases.some(p => text === p || text.startsWith(p))) {
    return {
      intent: 'NAVIGATE',
      targetScreen: 'COMMAND_CENTER',
      directAnswer: 'Returning to the Imperium Command Cockpit.',
      suggestedState: 'NAVIGATING'
    };
  }

  // Check matching target screen
  for (const [screenKey, screen] of Object.entries(APP_SCREENS_REGISTRY)) {
    for (const phrase of screen.safeNavCommand) {
      if (text.includes(phrase)) {
        return {
          intent: 'NAVIGATE',
          targetScreen: screenKey,
          directAnswer: `Navigating to ${screen.name}.`,
          suggestedState: 'NAVIGATING'
        };
      }
    }
  }

  // 2. "Where am I?" / "What am I looking at?" / "Explain this screen"
  if (
    text.includes('where am i') || 
    text.includes('what am i looking at') || 
    text.includes('explain this screen') || 
    text.includes('what screen is this') ||
    text.includes('what is open')
  ) {
    const current = APP_SCREENS_REGISTRY[currentScreenId] || APP_SCREENS_REGISTRY.COMMAND_CENTER;
    return {
      intent: 'EXPLAIN_CURRENT',
      targetScreen: current.id,
      directAnswer: `You are currently in the ${current.name}. ${current.summary} Available controls here include: ${current.availableControls.slice(0, 3).join(', ')}.`,
      suggestedState: 'SPEAKING'
    };
  }

  // 3. Problem solving & Diagnostics: "find the problem", "why isn't this loading", "what's causing this error", "diagnose"
  if (
    text.includes('problem') || 
    text.includes('error') || 
    text.includes('broken') || 
    text.includes('diagnose') || 
    text.includes('fix') ||
    text.includes('why is this number wrong') ||
    text.includes('why isn\'t this screen loading') ||
    text.includes('check next')
  ) {
    return {
      intent: 'SOLVE_PROBLEM',
      suggestedState: 'RECOVERY'
    };
  }

  // 4. Specific system queries — never invent runtime facts.
  if (text.includes('where is my money') || text.includes('how much cash') || text.includes('money flow') || text.includes('capital pipeline')) {
    const cash = systemContext.portfolio?.cash;
    const exposure = systemContext.portfolio?.exposureTotal;
    const equity = systemContext.portfolio?.equity;
    const positions = systemContext.positions;
    const hasAuthoritativePortfolio = [cash, exposure, equity].every(v => typeof v === 'number' && Number.isFinite(v)) && Array.isArray(positions);
    return {
      intent: 'NAVIGATE',
      targetScreen: 'PORTFOLIO',
      directAnswer: hasAuthoritativePortfolio
        ? `Opening the Money Control Center. Total Paper Equity is $${equity!.toLocaleString('en-US', { minimumFractionDigits: 2 })}. You have $${cash!.toLocaleString('en-US', { minimumFractionDigits: 2 })} in liquid Cash Reserve and $${exposure!.toLocaleString('en-US', { minimumFractionDigits: 2 })} deployed across ${positions!.length} open positions.`
        : 'Opening the Money Control Center. ACCOUNT DATA NOT FOUND. Imperium will not substitute estimated or placeholder balances.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('withdraw') || text.includes('cash out') || text.includes('payout')) {
    return {
      intent: 'NAVIGATE',
      targetScreen: 'PORTFOLIO',
      directAnswer: `Capital withdrawals are locked while Imperium is in Alpaca Paper Trading Mode. Paper-account balances come from Alpaca; real-money withdrawals are disabled.`,
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('chart') || text.includes('candles') || text.includes('stock workspace') || text.includes('stock view') || text.includes('inspect ')) {
    const knownSymbols = ['NVDA','PLTR','CRWD','KULR','IONQ','MSFT','SOUN','AAPL','TSLA','AMD'];
    const targetSym = knownSymbols.find(sym => text.includes(sym.toLowerCase()));
    return {
      intent: 'NAVIGATE',
      targetScreen: targetSym ? 'STOCK_WORKSPACE' : 'MARKETS',
      directAnswer: targetSym
        ? `Opening Stock Workspace for $${targetSym}. Only authoritative market and Nexus data will be displayed.`
        : 'Opening Markets. No ticker was specified; Imperium will not invent a default symbol.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('buying power') || text.includes('how much paper') || text.includes('capital')) {
    const bp = systemContext.portfolio?.buyingPower;
    const eq = systemContext.portfolio?.equity;
    const cap = systemContext.riskLimits?.perTradeCap;
    const valid = [bp, eq, cap].every(v => typeof v === 'number' && Number.isFinite(v));
    return {
      intent: 'QUERY_STATE',
      directAnswer: valid
        ? `Current Paper Buying Power is $${bp!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} with total account equity of $${eq!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Configured per-trade cap is $${cap!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
        : 'ACCOUNT DATA NOT FOUND. Imperium will not substitute a default buying-power, equity, or trade-cap value.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('alpaca') || text.includes('connected') || text.includes('broker')) {
    if (systemContext.isAlpacaPaperConnected) {
      const accountNumber = systemContext.alpacaAccount?.account_number;
      const buyingPower = systemContext.alpacaAccount?.buying_power ?? systemContext.portfolio?.buyingPower;
      return {
        intent: 'QUERY_STATE',
        directAnswer: accountNumber && typeof buyingPower === 'number' && Number.isFinite(buyingPower)
          ? `Alpaca Paper Brokerage is CONNECTED (Account #${accountNumber}). Paper buying power is $${buyingPower.toLocaleString()}. Orders route to the Alpaca Paper API with pre-trade risk gating.`
          : 'Alpaca Paper reports CONNECTED, but ACCOUNT DATA NOT FOUND. Imperium will not invent account identifiers or buying power.',
        suggestedState: 'SPEAKING'
      };
    }
    return {
      intent: 'QUERY_STATE',
      directAnswer: 'ALPACA PAPER NOT CONNECTED. ACCOUNT DATA NOT FOUND. Configure valid Alpaca Paper credentials in secure environment/secrets settings.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('why did you reject') || text.includes('rejection') || text.includes('rejected')) {
    const lastRejected = systemContext.decisionArchive?.find(d => d.nexusDecision === 'REJECT');
    return {
      intent: 'QUERY_STATE',
      directAnswer: lastRejected
        ? `Regarding $${lastRejected.ticker}: Nexus rejected this proposal because ${lastRejected.decisionReason}.`
        : 'REJECTION DATA NOT FOUND. Imperium will not invent a rejected ticker or reason.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('what you learned') || text.includes('learning') || text.includes('lessons')) {
    return {
      intent: 'QUERY_STATE',
      directAnswer: 'VERIFIED LEARNING DATA NOT FOUND. Open the Learning view when authoritative learning records are available.',
      suggestedState: 'SPEAKING'
    };
  }

  if (text.includes('worker that found') || text.includes('who found this')) {
    const opp = systemContext.opportunities?.[0];
    return {
      intent: 'QUERY_STATE',
      directAnswer: opp
        ? `The current top opportunity for $${opp.ticker} was submitted by ${opp.workerName}.`
        : 'OPPORTUNITY SOURCE DATA NOT FOUND. Imperium will not invent a ticker, worker, health state, or accuracy score.',
      suggestedState: 'SPEAKING'
    };
  }

  return {
    intent: 'GENERAL_CONVERSATION',
    suggestedState: 'THINKING'
  };
}
