import React from 'react';
import { Shield, ShieldAlert, DollarSign, Lock, AlertOctagon, Sliders } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const RiskCapitalSection: React.FC = () => {
  const { riskLimits, capitalState, setActiveModal, updateRiskLimits } = useImperium();

  const handleToggleEmergencyFreeze = async () => {
    await updateRiskLimits({ emergencyFreezeActive: !riskLimits.emergencyFreezeActive });
  };

  const getRiskBadge = () => {
    switch (riskLimits.riskState) {
      case 'STOP':
        return { text: 'RISK STATE: STOP', bg: 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/40', dot: 'bg-[#FF5252] animate-ping' };
      case 'CAUTION':
        return { text: 'RISK STATE: CAUTION', bg: 'bg-orange-500/10 text-orange-400 border border-orange-500/40', dot: 'bg-orange-400' };
      case 'SAFE':
      default:
        return { text: 'RISK STATE: SAFE', bg: 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30', dot: 'bg-[#4CAF50]' };
    }
  };

  const badge = getRiskBadge();

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                Risk Supervisor & Capital Allocation
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Enforces $100 per-trade cap & $10,000 global loss stop
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('RISK')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xs text-[10px] font-mono font-medium transition-transform active:scale-95 touch-manipulation ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.text}</span>
          </button>
        </div>

        {/* Capital & Exposure Visual Meter */}
        <div className="p-3.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] mb-3">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            <span className="text-[#7A7A7A] uppercase tracking-wider text-[10px]">Deployed Exposure:</span>
            <span className="font-medium text-[#C5A059]">
              ${capitalState.currentExposure.toFixed(2)} / ${capitalState.maxExposure.toFixed(2)} ({capitalState.exposurePercent.toFixed(1)}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-xs bg-[#141416] overflow-hidden border border-[#1F1F21]">
            <div 
              className={`h-full transition-all duration-500 ${
                capitalState.exposurePercent > 75 
                  ? 'bg-[#FF5252]' 
                  : capitalState.exposurePercent > 40 
                  ? 'bg-[#C5A059]' 
                  : 'bg-[#4CAF50]'
              }`}
              style={{ width: `${Math.min(100, capitalState.exposurePercent)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#1F1F21] text-[10px] font-mono">
            <div>
              <span className="text-[#7A7A7A] block">BUYING POWER</span>
              <span className="text-[#E5E5E5] font-medium">
                ${capitalState.availableBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#7A7A7A] block">RESERVED STOP</span>
              <span className="text-[#E5E5E5] font-medium">
                ${capitalState.capitalReserved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#7A7A7A] block">CAPACITY</span>
              <span className="text-[#4CAF50] font-medium">
                {capitalState.activePositionsCount} / {riskLimits.maxConcurrentPositions} POSITIONS
              </span>
            </div>
          </div>
        </div>

        {/* Control Limits Strip & Emergency Freeze */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-1">
          <div className="flex items-center gap-3 text-[#7A7A7A]">
            <span>PER-TRADE: <strong className="text-[#C5A059]">${riskLimits.perTradeCap.toFixed(2)}</strong></span>
            <span>LOSS STOP: <strong className="text-[#D1D1D1]">${riskLimits.globalLossStop.toFixed(2)}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="risk-btn-emergency-freeze"
              type="button"
              onClick={handleToggleEmergencyFreeze}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-mono font-medium transition-all active:scale-95 touch-manipulation ${
                riskLimits.emergencyFreezeActive
                  ? 'bg-[#FF5252] text-[#0D0D0E]'
                  : 'bg-[#0D0D0E] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#FF5252]'
              }`}
            >
              <AlertOctagon className="w-3 h-3" />
              <span>{riskLimits.emergencyFreezeActive ? 'FREEZE ACTIVE' : 'EMERGENCY FREEZE'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('RISK')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[#C5A059] hover:border-[#C5A059]/40 active:scale-95 transition-all text-[10px] uppercase tracking-wider"
            >
              <Sliders className="w-3 h-3" />
              <span>Configure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
