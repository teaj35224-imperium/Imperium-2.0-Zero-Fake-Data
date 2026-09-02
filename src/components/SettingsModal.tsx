import React, { useState } from 'react';
import { ArrowLeft, Settings, Radio, Key, Bell, Shield, Database, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const SettingsModal: React.FC = () => {
  const { setActiveModal, isAlpacaPaperConnected, riskLimits } = useImperium();
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [ambientAudio, setAmbientAudio] = useState(true);

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto py-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F1F21]">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#141416] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#C5A059] active:scale-95 transition-all text-xs font-mono touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COCKPIT</span>
          </button>

          <span className="text-[10px] font-mono text-[#C5A059] font-medium px-2 py-1 rounded-xs bg-[#141416] border border-[#C5A059]/30">
            SYSTEM SETTINGS & INTEGRATIONS
          </span>
        </div>

        {/* Integration Status: Alpaca Paper API */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#C5A059]" />
            <span>Brokerage & Market Data Connections</span>
          </h3>

          <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-[#C5A059]" />
              <div>
                <span className="text-xs font-mono font-bold text-[#E5E5E5] block">ALPACA PAPER TRADING</span>
                <span className="text-[10px] font-mono text-[#7A7A7A]">Simulated orders & position reconciliation</span>
              </div>
            </div>

            <span className={`text-[9px] font-mono font-medium px-2 py-1 rounded-xs ${
              isAlpacaPaperConnected 
                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' 
                : 'bg-[#141416] text-[#7A7A7A] border border-[#1F1F21]'
            }`}>
              {isAlpacaPaperConnected ? 'ALPACA PAPER CONNECTED' : 'ALPACA NOT CONNECTED'}
            </span>
          </div>

          <p className="text-[10px] font-mono text-[#7A7A7A] leading-relaxed">
            API keys are configured securely via environment variables (<code className="text-[#C5A059]">ALPACA_API_KEY_ID</code>, <code className="text-[#C5A059]">ALPACA_API_SECRET_KEY</code>, <code className="text-[#C5A059]">GEMINI_API_KEY</code>). All values are protected and verified server-side.
          </p>
        </div>

        {/* Feedback & UI Preferences */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C5A059]" />
            <span>Supervisory Feedback</span>
          </h3>

          <div className="flex items-center justify-between p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
            <div>
              <span className="text-xs font-mono font-bold text-[#E5E5E5] block">TACTILE HAPTIC CLICKS</span>
              <span className="text-[10px] font-mono text-[#7A7A7A]">Vibration response on touchscreen buttons</span>
            </div>
            <button
              type="button"
              onClick={() => setHapticFeedback(!hapticFeedback)}
              className={`px-3 py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                hapticFeedback ? 'bg-[#C5A059] text-[#0D0D0E]' : 'bg-[#141416] text-[#7A7A7A] border border-[#1F1F21]'
              }`}
            >
              {hapticFeedback ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
            <div>
              <span className="text-xs font-mono font-bold text-[#E5E5E5] block">BINARY STREAM FX</span>
              <span className="text-[10px] font-mono text-[#7A7A7A]">Background dimensional cyber matrix visual</span>
            </div>
            <button
              type="button"
              onClick={() => setAmbientAudio(!ambientAudio)}
              className={`px-3 py-1 rounded-xs text-xs font-mono font-medium transition-all cursor-pointer ${
                ambientAudio ? 'bg-[#C5A059] text-[#0D0D0E]' : 'bg-[#141416] text-[#7A7A7A] border border-[#1F1F21]'
              }`}
            >
              {ambientAudio ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* System Diagnostics & Build Telemetry */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2 text-xs font-mono">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            System Diagnostics & Telemetry
          </h3>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">SUPERVISOR KERNEL</span>
              <span className="text-[#E5E5E5] font-medium">NEXUS v4.9.2</span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">WATCHDOG STATUS</span>
              <span className="text-[#4CAF50] font-medium">HEARTBEAT 100%</span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">PER-TRADE CAP</span>
              <span className="text-[#C5A059] font-medium">${riskLimits.perTradeCap.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block">GLOBAL LOSS STOP</span>
              <span className="text-[#C5A059] font-medium">${riskLimits.globalLossStop.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
