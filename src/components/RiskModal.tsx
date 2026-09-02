import React, { useState } from 'react';
import { ArrowLeft, Shield, ShieldAlert, AlertOctagon, Save, Sliders, CheckCircle2 } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const RiskModal: React.FC = () => {
  const { riskLimits, capitalState, setActiveModal, updateRiskLimits } = useImperium();
  const [perTradeCap, setPerTradeCap] = useState(riskLimits.perTradeCap.toString());
  const [globalLossStop, setGlobalLossStop] = useState(riskLimits.globalLossStop.toString());
  const [maxPositions, setMaxPositions] = useState(riskLimits.maxConcurrentPositions.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateRiskLimits({
      perTradeCap: parseFloat(perTradeCap) || 100,
      globalLossStop: parseFloat(globalLossStop) || 10000,
      maxConcurrentPositions: parseInt(maxPositions) || 5
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleFreeze = async () => {
    await updateRiskLimits({ emergencyFreezeActive: !riskLimits.emergencyFreezeActive });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto py-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            RISK ENGINE & LIMITS
          </span>
        </div>

        {/* State Banner */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#7A7A7A] block uppercase">
              PRIMARY RISK STATE
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#C5A059]">
              {riskLimits.riskState}
            </div>
            <p className="text-[10px] font-mono text-[#7A7A7A] mt-0.5">
              Strict mathematical boundaries enforced across all worker desks
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`p-3 rounded-xs border font-mono font-medium text-xs flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation cursor-pointer ${
              riskLimits.emergencyFreezeActive
                ? 'bg-[#FF5252] text-[#0D0D0E] animate-pulse border-[#FF5252]'
                : 'bg-[#0D0D0E] border-[#1F1F21] text-[#9A9A9A] hover:text-[#FF5252]'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{riskLimits.emergencyFreezeActive ? 'FREEZE ACTIVE' : 'EMERGENCY FREEZE'}</span>
          </button>
        </div>

        {/* Emergency Liquidate All Positions Card */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 shadow-xl mb-3 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Emergency Kill Switch: Exit All Paper Positions</span>
          </div>
          <p className="text-xs text-neutral-300">
            Immediately sells all open paper holdings at current market bids, cancels pending buy orders, and returns 100% of capital to safe cash reserves.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Confirm Emergency Exit All: This will liquidate all active paper positions immediately.')) {
                await fetch('/api/risk/emergency-exit', { method: 'POST' });
                window.location.reload();
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>EMERGENCY EXIT ALL PAPER POSITIONS</span>
          </button>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveLimits} className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-3 mb-3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Configurable Limits (Paper Defaults)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-mono text-[#7A7A7A] block mb-1">
                PER-TRADE CAP ($)
              </label>
              <input
                type="number"
                step="10"
                value={perTradeCap}
                onChange={(e) => setPerTradeCap(e.target.value)}
                className="w-full p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] focus:outline-none focus:border-[#C5A059]"
              />
              <span className="text-[8px] font-mono text-[#555] mt-0.5 block">Default: $100.00</span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#7A7A7A] block mb-1">
                GLOBAL LOSS STOP ($)
              </label>
              <input
                type="number"
                step="500"
                value={globalLossStop}
                onChange={(e) => setGlobalLossStop(e.target.value)}
                className="w-full p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] focus:outline-none focus:border-[#C5A059]"
              />
              <span className="text-[8px] font-mono text-[#555] mt-0.5 block">Default: $10,000.00</span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#7A7A7A] block mb-1">
                MAX POSITIONS
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxPositions}
                onChange={(e) => setMaxPositions(e.target.value)}
                className="w-full p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] focus:outline-none focus:border-[#C5A059]"
              />
              <span className="text-[8px] font-mono text-[#555] mt-0.5 block">Default: 5 Concurrent</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 p-3 rounded-xs bg-[#C5A059] hover:bg-[#b08e4d] text-[#0D0D0E] font-mono font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all touch-manipulation cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'LIMITS SAVED TO RISK ENGINE' : 'SAVE RISK PARAMETERS'}</span>
          </button>
        </form>

        {/* Exposure Gating Rules */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2 text-xs font-mono text-[#D1D1D1]">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Active Risk Gating Rules
          </h3>
          <ul className="space-y-1.5 text-[10px] text-[#9A9A9A]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
              <span>Liquidity Gating: Proposals with Liquidity Score &lt; 70 are rejected.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
              <span>Spread Limit: Maximum allowed bid-ask spread is $0.05.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
              <span>Market Hours: Paper orders strictly routed during standard 09:30 - 16:00 EST.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
              <span>Catalyst Gate: Penny stocks require verified SEC 8-K contract filing before approval.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
