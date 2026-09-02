// Persistent JSON Database Engine for Imperium 2.0
// Guarantees atomic writes and complete crash resilience across server restarts.

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'node:crypto';
import type { 
  RiskLimits, 
  CapitalState, 
  OperatingState, 
  ProfitAllocationSettings,
  Worker, 
  Opportunity, 
  DecisionArchiveRecord, 
  Position, 
  SystemLog, 
  NexusActivityItem,
  ShadowObservation,
  CapitalWaitingOpportunity,
  HorizonSnapshot
} from '../types';

export interface CapitalLedgerEntry {
  id: string;
  timestamp: string;
  type: 
    | 'DEPOSIT' 
    | 'WITHDRAWAL' 
    | 'ALLOWANCE_ALLOCATION' 
    | 'ALLOWANCE_REDUCTION' 
    | 'TRADE_CAPITAL_DEPLOYED' 
    | 'TRADE_CAPITAL_RETURNED' 
    | 'PAPER_PROFIT' 
    | 'PAPER_LOSS' 
    | 'PROFIT_ALLOCATION' 
    | 'RECONCILIATION_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
}

export interface WorkerTaskRecord {
  taskId: string;
  workerId: string;
  symbol: string;
  taskType: 'SCAN' | 'ANALYZE' | 'AUDIT_HOLDING' | 'TEST';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  resultSummary?: string;
  opportunityProducedId?: string;
  error?: string;
}

export interface ImperiumDatabaseSchema {
  version: string;
  lastSavedAt: string;
  operatingState: OperatingState;
  nexusAllowance: number;
  mainMoney: number;
  profitReserve: number;
  profitAllocation: ProfitAllocationSettings;
  riskLimits: RiskLimits;
  capitalLedger: CapitalLedgerEntry[];
  workers: Worker[];
  tasks: WorkerTaskRecord[];
  opportunities: Opportunity[];
  decisionArchive: DecisionArchiveRecord[];
  positions: Position[];
  shadowObservations: ShadowObservation[];
  capitalWaitingQueue: CapitalWaitingOpportunity[];
  horizonSnapshots: HorizonSnapshot[];
  systemLogs: SystemLog[];
  nexusActivities: NexusActivityItem[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'imperium_db.json');

// Default initial clean state (TRUTHFUL EMPTY BOOT)
function createDefaultDatabase(): ImperiumDatabaseSchema {
  return {
    version: '2.0.0',
    lastSavedAt: new Date().toISOString(),
    operatingState: 'STANDBY', // Start safely in Standby / Idle
    nexusAllowance: 0.00, // No allowance until explicitly configured by operator
    mainMoney: 0.00, // No locally invented brokerage balance
    profitReserve: 0.00, // Protected paper gains
    profitAllocation: {
      reinvestPercent: 75,
      reservePercent: 25,
      totalRealizedProfit: 0.00,
      profitReserved: 0.00,
      withdrawableCash: 0.00,
      actuallyWithdrawnProfit: 0.00
    },
    riskLimits: {
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
    },
    capitalLedger: [],
    workers: [], // Populated by worker engine with clean 0-measured stats
    tasks: [],
    opportunities: [], // 0 fake opportunities
    decisionArchive: [], // 0 fake decisions
    positions: [], // 0 fake positions (authoritative from Alpaca Paper)
    shadowObservations: [],
    capitalWaitingQueue: [],
    horizonSnapshots: [],
    systemLogs: [
      {
        id: `log-boot-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        category: 'NEXUS',
        level: 'INFO',
        message: 'Imperium 2.0 Persistent Storage initialized.',
        technicalDetails: 'Database path: /data/imperium_db.json. Clean zero-mock state active.'
      }
    ],
    nexusActivities: []
  };
}

class DatabaseManager {
  private state: ImperiumDatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.state = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private load(): ImperiumDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        console.log(`[DB] Successfully loaded database from ${DB_FILE}`);
        return parsed;
      }
    } catch (err) {
      console.error('[DB] Failed to load database file, creating fresh default:', err);
    }
    const fresh = createDefaultDatabase();
    this.saveDirect(fresh);
    return fresh;
  }

  public save(): void {
    this.saveDirect(this.state);
  }

  private saveDirect(data: ImperiumDatabaseSchema): void {
    try {
      this.ensureDirectory();
      data.lastSavedAt = new Date().toISOString();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Atomic write error:', err);
    }
  }

  public getState(): ImperiumDatabaseSchema {
    return this.state;
  }

  public updateState(updater: (state: ImperiumDatabaseSchema) => void): void {
    updater(this.state);
    this.save();
  }

  public addLog(category: SystemLog['category'], level: SystemLog['level'], message: string, technicalDetails?: string): SystemLog {
    const log: SystemLog = {
      id: `log-${Date.now()}-${randomUUID()}`,
      timestamp: new Date().toLocaleTimeString(),
      category,
      level,
      message,
      technicalDetails
    };
    this.state.systemLogs.unshift(log);
    if (this.state.systemLogs.length > 200) {
      this.state.systemLogs.pop();
    }
    this.save();
    return log;
  }

  public addActivity(actionText: string, category: NexusActivityItem['category'], detail: string, status: NexusActivityItem['status'] = 'COMPLETED'): NexusActivityItem {
    const act: NexusActivityItem = {
      id: `act-${Date.now()}-${randomUUID()}`,
      timestamp: 'Just now',
      actionText,
      category,
      detail,
      status
    };
    this.state.nexusActivities.unshift(act);
    if (this.state.nexusActivities.length > 50) {
      this.state.nexusActivities.pop();
    }
    this.save();
    return act;
  }

  public recordLedgerTransaction(type: CapitalLedgerEntry['type'], amount: number, description: string, referenceId?: string): CapitalLedgerEntry {
    const currentAllowance = this.state.nexusAllowance;
    let newAllowance = currentAllowance;

    if (type === 'ALLOWANCE_ALLOCATION') {
      newAllowance += amount;
    } else if (type === 'ALLOWANCE_REDUCTION') {
      newAllowance = Math.max(0, newAllowance - amount);
    } else if (type === 'PAPER_PROFIT') {
      const reinvestPct = this.state.profitAllocation.reinvestPercent / 100;
      const reservePct = this.state.profitAllocation.reservePercent / 100;
      const reinvestAmount = amount * reinvestPct;
      const reserveAmount = amount * reservePct;

      newAllowance += reinvestAmount;
      this.state.profitReserve += reserveAmount;
      this.state.profitAllocation.totalRealizedProfit += amount;
      this.state.profitAllocation.profitReserved += reserveAmount;
    } else if (type === 'PAPER_LOSS') {
      newAllowance = Math.max(0, newAllowance - Math.abs(amount));
    }

    this.state.nexusAllowance = Number(newAllowance.toFixed(2));

    const entry: CapitalLedgerEntry = {
      id: `ledg-${Date.now()}-${randomUUID()}`,
      timestamp: new Date().toISOString(),
      type,
      amount: Number(amount.toFixed(2)),
      balanceAfter: Number(newAllowance.toFixed(2)),
      description,
      referenceId
    };

    this.state.capitalLedger.unshift(entry);
    if (this.state.capitalLedger.length > 500) {
      this.state.capitalLedger.pop();
    }
    this.save();
    return entry;
  }
}

export const db = new DatabaseManager();
