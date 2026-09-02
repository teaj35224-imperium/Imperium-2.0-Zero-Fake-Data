import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Opportunity,
  DecisionArchiveRecord,
  Worker,
  Position,
  Portfolio,
  RiskLimits,
  CapitalState,
  HumanActionRequired,
  SystemLog,
  SystemStatusSummary,
  NexusActivityItem,
  LearningEvaluation,
  MarketQuote,
  WatchlistItem,
  OpportunityVerdict,
  NexusState,
  RobotFaceState,
  AlpacaAccountData,
  AlpacaOrderData,
  NavigatorExplanation,
  OperatingState,
  ProfitAllocationSettings,
  HorizonSnapshot,
  ShadowObservation,
  CapitalWaitingOpportunity
} from '../types';

export type ActiveModalType = 
  | null 
  | 'NEXUS' 
  | 'PORTFOLIO' 
  | 'MARKETS' 
  | 'WORKERS' 
  | 'RISK' 
  | 'SETTINGS' 
  | 'GOT_ONE_DETAIL' 
  | 'POSITION_DETAIL' 
  | 'WORKER_DETAIL' 
  | 'DECISION_DETAIL' 
  | 'LEARNING' 
  | 'ACTION_REQUIRED' 
  | 'LOGS' 
  | 'CHAT'
  | 'STOCK_WORKSPACE'
  | 'CAPITAL_ARENA';

interface ImperiumContextType {
  systemStatus: SystemStatusSummary;
  nexusState: NexusState;
  nexusActivities: NexusActivityItem[];
  robotFaceState: RobotFaceState;
  alpacaAccount: AlpacaAccountData | null;
  alpacaOrders: AlpacaOrderData[];
  screenExplanation: NavigatorExplanation | null;
  isExplaining: boolean;
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  decisionArchive: DecisionArchiveRecord[];
  selectedDecision: DecisionArchiveRecord | null;
  workers: Worker[];
  selectedWorker: Worker | null;
  positions: Position[];
  selectedPosition: Position | null;
  portfolio: Portfolio;
  riskLimits: RiskLimits;
  capitalState: CapitalState;
  humanEscalations: HumanActionRequired[];
  learningEvaluation: LearningEvaluation | null;
  quotes: MarketQuote[];
  watchlist: WatchlistItem[];
  logs: SystemLog[];
  activeModal: ActiveModalType;
  selectedTicker: string | null;
  isLoading: boolean;
  isAlpacaPaperConnected: boolean;
  isNexusArenaPaused: boolean;
  operatingState: OperatingState;
  isStopBuying: boolean;
  profitAllocation: ProfitAllocationSettings;
  horizonSnapshots: HorizonSnapshot[];
  shadowObservations: ShadowObservation[];
  capitalWaitingQueue: CapitalWaitingOpportunity[];
  
  // Actions
  setActiveModal: (modal: ActiveModalType) => void;
  openCapitalArena: () => void;
  setIsNexusArenaPaused: (paused: boolean) => void;
  setSelectedOpportunity: (opp: Opportunity | null) => void;
  setSelectedWorker: (worker: Worker | null) => void;
  setSelectedPosition: (pos: Position | null) => void;
  setSelectedDecision: (dec: DecisionArchiveRecord | null) => void;
  setSelectedTicker: (ticker: string | null) => void;
  openStockWorkspace: (ticker: string) => void;
  setRobotFaceState: (state: RobotFaceState) => void;
  setNexusState: (state: NexusState) => Promise<void>;
  setOperatingState: (state: OperatingState, standbyOption?: 'KEEP_EXISTING' | 'CASH_OUT') => Promise<boolean>;
  emergencyStop: () => Promise<boolean>;
  emergencyResume: () => Promise<boolean>;
  toggleStopBuying: () => Promise<boolean>;
  updateProfitAllocation: (reinvestPct: number, reservePct: number) => Promise<boolean>;
  abortPosition: (positionId: string) => Promise<boolean>;
  cashOutAllPositions: () => Promise<boolean>;
  refreshCapitalQueue: () => Promise<void>;
  recordShadowObservation: (obs: Partial<ShadowObservation>) => Promise<boolean>;
  submitVerdict: (opportunityId: string, verdict: OpportunityVerdict, reason: string) => Promise<boolean>;
  recoverWorker: (workerId: string) => Promise<boolean>;
  goldenRestoreWorker: (workerId: string) => Promise<boolean>;
  quarantineWorker: (workerId: string) => Promise<boolean>;
  updateRiskLimits: (limits: Partial<RiskLimits>) => Promise<boolean>;
  closePosition: (symbolOrId: string) => Promise<boolean>;
  resolveEscalation: (escalationId: string, actionId: string, customNote?: string) => Promise<boolean>;
  adjustStrategyWeight: (strategyName: string, newWeight: number) => Promise<boolean>;
  sendNexusChat: (message: string) => Promise<string>;
  fetchAlpacaAccount: () => Promise<void>;
  fetchAlpacaOrders: () => Promise<void>;
  createPaperOrder: (order: {
    ticker: string;
    qty: number;
    side?: 'buy' | 'sell';
    type?: 'market' | 'limit';
    limit_price?: number;
    stop_price?: number;
    workerSource?: string;
    strategy?: string;
    setup?: string;
  }) => Promise<{ success: boolean; message: string; riskGateFailed?: boolean; reason?: string }>;
  explainScreen: (screenName: string) => Promise<NavigatorExplanation | null>;
  speakExplanation: (text: string) => void;
  refreshAll: () => Promise<void>;
}

// Truthful Empty Initial State
const defaultStatus: SystemStatusSummary = {
  nexusCore: 'ONLINE',
  marketData: 'ONLINE',
  alpacaPaper: 'NOT CONNECTED',
  workerNetwork: 'ONLINE',
  riskEngine: 'ONLINE',
  portfolioMonitor: 'ONLINE',
  decisionArchive: 'ONLINE',
  learningEngine: 'ONLINE',
  alpacaConnected: false,
  geminiConnected: false,
  lastHeartbeat: new Date().toISOString()
};

const defaultPortfolio: Portfolio = {
  equity: 0.00,
  cash: 0.00,
  buyingPower: 0.00,
  dayChange: 0.00,
  dayChangePercent: 0.00,
  realizedPnLDay: 0.00,
  unrealizedPnLTotal: 0.00,
  totalPositionsCount: 0,
  positions: [],
  exposureTotal: 0.00,
  exposurePercent: 0.00
};

const defaultRiskLimits: RiskLimits = {
  perTradeCap: 100.00,
  globalLossStop: 1000.00,
  dailyMaxExposure: 500.00,
  weeklyMaxExposure: 1000.00,
  maxConcurrentPositions: 5,
  minLiquidityScore: 70,
  maxSpreadAllowed: 0.05,
  marketHoursOnly: true,
  catalystGatingEnabled: true,
  emergencyFreezeActive: false,
  riskState: 'SAFE'
};

const defaultCapital: CapitalState = {
  availableBuyingPower: 0.00,
  capitalDeployed: 0.00,
  capitalReserved: 0.00,
  currentExposure: 0.00,
  maxExposure: 500.00,
  exposurePercent: 0.00,
  riskState: 'SAFE',
  activePositionsCount: 0,
  remainingPositionCapacity: 5
};

const defaultProfitAllocation: ProfitAllocationSettings = {
  reinvestPercent: 75,
  reservePercent: 25,
  totalRealizedProfit: 0.00,
  profitReserved: 0.00,
  withdrawableCash: 0.00,
  actuallyWithdrawnProfit: 0.00
};

const ImperiumContext = createContext<ImperiumContextType | null>(null);

export const ImperiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatusSummary>(defaultStatus);
  const [nexusState, setLocalNexusState] = useState<NexusState>('STANDBY');
  const [operatingState, setOperatingStateLocal] = useState<OperatingState>('STANDBY');
  const [isStopBuying, setIsStopBuying] = useState<boolean>(false);
  const [profitAllocation, setProfitAllocation] = useState<ProfitAllocationSettings>(defaultProfitAllocation);
  const [horizonSnapshots, setHorizonSnapshots] = useState<HorizonSnapshot[]>([]);
  const [shadowObservations, setShadowObservations] = useState<ShadowObservation[]>([]);
  const [capitalWaitingQueue, setCapitalWaitingQueue] = useState<CapitalWaitingOpportunity[]>([]);
  const [nexusActivities, setNexusActivities] = useState<NexusActivityItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [decisionArchive, setDecisionArchive] = useState<DecisionArchiveRecord[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionArchiveRecord | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
  const [riskLimits, setRiskLimits] = useState<RiskLimits>(defaultRiskLimits);
  const [capitalState, setCapitalState] = useState<CapitalState>(defaultCapital);
  const [humanEscalations, setHumanEscalations] = useState<HumanActionRequired[]>([]);
  const [learningEvaluation, setLearningEvaluation] = useState<LearningEvaluation | null>(null);
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAlpacaPaperConnected, setIsAlpacaPaperConnected] = useState<boolean>(false);
  const [alpacaAccount, setAlpacaAccount] = useState<AlpacaAccountData | null>(null);
  const [alpacaOrders, setAlpacaOrders] = useState<AlpacaOrderData[]>([]);
  const [robotFaceState, setRobotFaceState] = useState<RobotFaceState>('STANDBY');
  const [screenExplanation, setScreenExplanation] = useState<NavigatorExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [isNexusArenaPaused, setIsNexusArenaPaused] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const json = await res.json();
        setSystemStatus(json.data);
        if (json.operatingState) setOperatingStateLocal(json.operatingState);
        if (json.nexusState) setLocalNexusState(json.nexusState);
        setIsAlpacaPaperConnected(Boolean(json.data.alpacaConnected));
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Status fetch error:', e);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/nexus/state');
      if (res.ok) {
        const json = await res.json();
        if (json.activities) setNexusActivities(json.activities);
        if (json.state) setLocalNexusState(json.state);
        if (json.operatingState) setOperatingStateLocal(json.operatingState);
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Activities fetch error:', e);
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.opportunities || []);
        if (!selectedOpportunity && json.opportunities?.length > 0) {
          setSelectedOpportunity(json.opportunities[0]);
        }
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Opportunities fetch error:', e);
    }
  }, [selectedOpportunity]);

  const fetchArchive = useCallback(async () => {
    try {
      const res = await fetch('/api/decisions/archive');
      if (res.ok) {
        const json = await res.json();
        setDecisionArchive(json.decisionArchive || []);
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Archive fetch error:', e);
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const json = await res.json();
        setWorkers(json.workers || []);
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Workers fetch error:', e);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const [posRes, accRes] = await Promise.all([
        fetch('/api/alpaca/positions'),
        fetch('/api/alpaca/account')
      ]);

      let currentPositions: Position[] = [];
      if (posRes.ok) {
        const json = await posRes.json();
        currentPositions = json.positions || [];
        setPositions(currentPositions);
      }

      if (accRes.ok) {
        const accJson = await accRes.json();
        setIsAlpacaPaperConnected(Boolean(accJson.connected));
        if (accJson.account) {
          setAlpacaAccount(accJson.account);
          const equity = Number(accJson.account.equity || accJson.account.portfolio_value || 0);
          const cash = Number(accJson.account.cash || 0);
          const buyingPower = Number(accJson.account.buying_power || 0);
          const exposureTotal = currentPositions.reduce((acc, p) => acc + p.marketValue, 0);
          const unrealizedPnLTotal = currentPositions.reduce((acc, p) => acc + p.unrealizedPnL, 0);

          setPortfolio({
            equity,
            cash,
            buyingPower,
            dayChange: 0,
            dayChangePercent: 0,
            realizedPnLDay: 0,
            unrealizedPnLTotal,
            totalPositionsCount: currentPositions.length,
            positions: currentPositions,
            exposureTotal,
            exposurePercent: equity > 0 ? (exposureTotal / equity) * 100 : 0
          });
        }
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Portfolio fetch error:', e);
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/markets/quotes');
      if (res.ok) {
        const json = await res.json();
        if (json.quotes) setQuotes(json.quotes);
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Quotes fetch error:', e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/system/logs');
      if (res.ok) {
        const json = await res.json();
        if (json.logs) setLogs(json.logs);
      }
    } catch (e) {
      console.warn('[NEXUS SYNC] Logs fetch error:', e);
    }
  }, []);

  const fetchAlpacaAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/alpaca/account');
      if (res.ok) {
        const json = await res.json();
        setIsAlpacaPaperConnected(Boolean(json.connected));
        if (json.account) {
          setAlpacaAccount(json.account);
        }
      }
    } catch (e) {
      console.warn('[ALPACA CLIENT] Failed to fetch account:', e);
    }
  }, []);

  const fetchAlpacaOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/alpaca/orders');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.orders)) {
          setAlpacaOrders(json.orders);
        }
      }
    } catch (e) {
      console.warn('[ALPACA CLIENT] Failed to fetch orders:', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([
      fetchStatus(),
      fetchActivities(),
      fetchOpportunities(),
      fetchArchive(),
      fetchWorkers(),
      fetchPortfolio(),
      fetchQuotes(),
      fetchLogs(),
      fetchAlpacaAccount(),
      fetchAlpacaOrders()
    ]);
    setIsLoading(false);
  }, [
    fetchStatus,
    fetchActivities,
    fetchOpportunities,
    fetchArchive,
    fetchWorkers,
    fetchPortfolio,
    fetchQuotes,
    fetchLogs,
    fetchAlpacaAccount,
    fetchAlpacaOrders
  ]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchStatus();
      fetchActivities();
      fetchPortfolio();
      fetchAlpacaAccount();
      fetchAlpacaOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchStatus, fetchActivities, fetchPortfolio, fetchAlpacaAccount, fetchAlpacaOrders]);

  const openStockWorkspace = (ticker: string) => {
    setSelectedTicker(ticker.toUpperCase().trim());
    setActiveModal('STOCK_WORKSPACE');
  };

  const openCapitalArena = useCallback(() => {
    setActiveModal('CAPITAL_ARENA');
  }, []);

  const setNexusState = async (state: NexusState) => {
    setLocalNexusState(state);
    try {
      await fetch('/api/nexus/set-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const setOperatingState = async (state: OperatingState, standbyOption?: 'KEEP_EXISTING' | 'CASH_OUT'): Promise<boolean> => {
    try {
      const res = await fetch('/api/system/operating-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, standbyOption })
      });
      if (res.ok) {
        setOperatingStateLocal(state);
        setIsStopBuying(state === 'STOP_BUYING');
        await fetchPortfolio();
        await fetchStatus();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const emergencyStop = async (): Promise<boolean> => {
    return setOperatingState('EMERGENCY_STOP');
  };

  const emergencyResume = async (): Promise<boolean> => {
    return setOperatingState('ACTIVE');
  };

  const toggleStopBuying = async (): Promise<boolean> => {
    const nextState = isStopBuying ? 'ACTIVE' : 'STOP_BUYING';
    return setOperatingState(nextState);
  };

  const updateProfitAllocation = async (reinvestPct: number, reservePct: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/capital/profit-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reinvestPercent: reinvestPct, reservePercent: reservePct })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.profitAllocation) setProfitAllocation(json.profitAllocation);
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const submitVerdict = async (opportunityId: string, verdict: OpportunityVerdict, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict, reason })
      });
      if (res.ok) {
        await Promise.all([
          fetchOpportunities(),
          fetchArchive(),
          fetchPortfolio(),
          fetchLogs(),
          fetchStatus()
        ]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const recoverWorker = async (workerId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${workerId}/recover`, { method: 'POST' });
      if (res.ok) {
        await fetchWorkers();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const goldenRestoreWorker = async (workerId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${workerId}/golden-restore`, { method: 'POST' });
      if (res.ok) {
        await fetchWorkers();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const quarantineWorker = async (workerId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${workerId}/quarantine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Operator Manual Quarantine' })
      });
      if (res.ok) {
        await fetchWorkers();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const updateRiskLimits = async (newLimits: Partial<RiskLimits>): Promise<boolean> => {
    try {
      const res = await fetch('/api/risk/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimits)
      });
      if (res.ok) {
        const json = await res.json();
        setRiskLimits(json.riskLimits);
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const closePosition = async (symbolOrId: string): Promise<boolean> => {
    const symbol = symbolOrId.includes('-') ? symbolOrId.split('-')[1] : symbolOrId;
    try {
      const res = await fetch(`/api/alpaca/positions/close/${symbol}`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchPortfolio();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const abortPosition = async (positionId: string): Promise<boolean> => {
    return closePosition(positionId);
  };

  const cashOutAllPositions = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/alpaca/positions/close-all', {
        method: 'POST'
      });
      if (res.ok) {
        await fetchPortfolio();
        await fetchLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const resolveEscalation = async (_escalationId: string, _actionId: string): Promise<boolean> => {
    return true;
  };

  const adjustStrategyWeight = async (_strategyName: string, _newWeight: number): Promise<boolean> => {
    return true;
  };

  const refreshCapitalQueue = async (): Promise<void> => {};
  const recordShadowObservation = async (_obs: Partial<ShadowObservation>): Promise<boolean> => true;

  const createPaperOrder = async (order: {
    ticker: string;
    qty: number;
    side?: 'buy' | 'sell';
    type?: 'market' | 'limit';
    limit_price?: number;
    stop_price?: number;
    workerSource?: string;
    strategy?: string;
    setup?: string;
  }) => {
    setRobotFaceState('THINKING');
    try {
      const res = await fetch('/api/alpaca/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const json = await res.json();
      
      await fetchPortfolio();
      await fetchLogs();
      await fetchArchive();
      await fetchOpportunities();
      await fetchAlpacaOrders();
      await fetchAlpacaAccount();

      setTimeout(() => setRobotFaceState('STANDBY'), 2000);

      if (!res.ok || json.riskGateFailed) {
        return {
          success: false,
          riskGateFailed: Boolean(json.riskGateFailed),
          reason: json.reason || json.error || 'Paper execution rejected by risk engine',
          message: json.reason || json.error || 'Risk Gate Rejection'
        };
      }

      return {
        success: true,
        message: json.message || 'Paper order routed to Alpaca Broker'
      };
    } catch (e: any) {
      setRobotFaceState('ALERT');
      setTimeout(() => setRobotFaceState('STANDBY'), 3000);
      return {
        success: false,
        message: e.message || 'Network error during order submission'
      };
    }
  };

  const explainScreen = async (screenName: string): Promise<NavigatorExplanation | null> => {
    setIsExplaining(true);
    setRobotFaceState('THINKING');
    try {
      const res = await fetch('/api/nexus/explain-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenName })
      });
      if (res.ok) {
        const json = await res.json();
        setScreenExplanation(json.explanation);
        setRobotFaceState('SPEAKING');
        setTimeout(() => setRobotFaceState('STANDBY'), 4000);
        return json.explanation;
      }
    } catch (e) {
      console.warn('[NEXUS EXPLAIN] Error:', e);
    } finally {
      setIsExplaining(false);
    }
    return null;
  };

  const speakExplanation = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.onstart = () => setRobotFaceState('SPEAKING');
        utterance.onend = () => setRobotFaceState('STANDBY');
        utterance.onerror = () => setRobotFaceState('STANDBY');
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis unsupported or blocked in iframe:', err);
      }
    }
  };

  const sendNexusChat = async (message: string): Promise<string> => {
    setRobotFaceState('THINKING');
    try {
      const res = await fetch('/api/nexus/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const json = await res.json();
        setRobotFaceState('SPEAKING');
        setTimeout(() => setRobotFaceState('STANDBY'), 3500);
        return json.response || json.reply || 'Nexus supervisory intelligence processed transmission.';
      }
    } catch (e) {
      console.error(e);
      setRobotFaceState('ALERT');
      setTimeout(() => setRobotFaceState('STANDBY'), 2500);
    }
    return 'Nexus Supervisory Core active.';
  };

  return (
    <ImperiumContext.Provider
      value={{
        systemStatus,
        nexusState,
        operatingState,
        isStopBuying,
        profitAllocation,
        horizonSnapshots,
        shadowObservations,
        capitalWaitingQueue,
        nexusActivities,
        robotFaceState,
        alpacaAccount,
        alpacaOrders,
        screenExplanation,
        isExplaining,
        opportunities,
        selectedOpportunity,
        decisionArchive,
        selectedDecision,
        workers,
        selectedWorker,
        positions,
        selectedPosition,
        portfolio,
        riskLimits,
        capitalState,
        humanEscalations,
        learningEvaluation,
        quotes,
        watchlist,
        logs,
        activeModal,
        selectedTicker,
        isLoading,
        isAlpacaPaperConnected,
        isNexusArenaPaused,
        setActiveModal,
        openCapitalArena,
        setIsNexusArenaPaused,
        setSelectedOpportunity,
        setSelectedWorker,
        setSelectedPosition,
        setSelectedDecision,
        setSelectedTicker,
        openStockWorkspace,
        setRobotFaceState,
        setNexusState,
        setOperatingState,
        emergencyStop,
        emergencyResume,
        toggleStopBuying,
        updateProfitAllocation,
        abortPosition,
        cashOutAllPositions,
        refreshCapitalQueue,
        recordShadowObservation,
        submitVerdict,
        recoverWorker,
        goldenRestoreWorker,
        quarantineWorker,
        updateRiskLimits,
        closePosition,
        resolveEscalation,
        adjustStrategyWeight,
        sendNexusChat,
        fetchAlpacaAccount,
        fetchAlpacaOrders,
        createPaperOrder,
        explainScreen,
        speakExplanation,
        refreshAll
      }}
    >
      {children}
    </ImperiumContext.Provider>
  );
};

export function useImperium() {
  const ctx = useContext(ImperiumContext);
  if (!ctx) throw new Error('useImperium must be used within an ImperiumProvider');
  return ctx;
}
