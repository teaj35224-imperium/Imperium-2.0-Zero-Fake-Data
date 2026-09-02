import React, { useState } from 'react';
import { ArrowLeft, Cpu, Sparkles, Send, Bot, Shield, Zap, RefreshCw, CheckCircle2, AlertOctagon, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import type { NexusState, OperatingState } from '../types';

export const NexusHubModal: React.FC = () => {
  const { 
    nexusState, 
    setNexusState, 
    operatingState, 
    isStopBuying, 
    setOperatingState, 
    emergencyStop, 
    emergencyResume, 
    toggleStopBuying, 
    setActiveModal, 
    sendNexusChat 
  } = useImperium();

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'nexus'; text: string; time: string }[]>([
    {
      role: 'nexus',
      text: 'Nexus Supervisory Core online. All 8 specialist desks operational. Autonomic supervision and risk guards standing by.',
      time: 'Just now'
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [showStandbyDialog, setShowStandbyDialog] = useState(false);

  const states: NexusState[] = [
    'ACTIVE',
    'GOT ONE',
    'ACTION REQUIRED',
    'CAUTION',
    'RECOVERY',
    'VERIFYING',
    'STANDBY'
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg = chatInput.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg, time }]);
    setChatInput('');
    setIsSending(true);

    const reply = await sendNexusChat(userMsg);
    setChatMessages(prev => [...prev, { role: 'nexus', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsSending(false);
  };

  const handleStandbySelect = async (option: 'KEEP_EXISTING' | 'CASH_OUT') => {
    await setOperatingState('STANDBY', option);
    setShowStandbyDialog(false);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-28 px-3 sm:px-4">
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
            NEXUS COMMAND CORE
          </span>
        </div>

        {/* Operating State Global Control Panel (Imperium 2.0) */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/50 shadow-xl mb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full border ${
                operatingState === 'EMERGENCY_STOP' 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : operatingState === 'STANDBY'
                  ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  : 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
              }`}>
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-mono font-bold text-[#E5E5E5]">
                  OPERATING SYSTEM STATE
                </h2>
                <span className="text-xs font-mono text-[#9A9A9A]">
                  Active State: <strong className="text-[#C5A059] font-medium">{operatingState}</strong>
                  {isStopBuying && <span className="ml-2 text-amber-400 font-bold">• STOP BUYING ENGAGED</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Imperium 2.0 Operating Mode Switchers */}
          <div className="pt-2 border-t border-[#1F1F21] space-y-2">
            <span className="text-[9px] font-mono text-[#7A7A7A] block uppercase tracking-wider">
              GLOBAL OPERATING CONTROLS:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setOperatingState('ACTIVE')}
                className={`p-2 rounded-xs text-[10px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operatingState === 'ACTIVE'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-[#0D0D0E] border border-[#1F1F21] text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </button>

              <button
                type="button"
                onClick={() => toggleStopBuying()}
                className={`p-2 rounded-xs text-[10px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isStopBuying || operatingState === 'STOP_BUYING'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#0D0D0E] border border-[#1F1F21] text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>STOP BUYING</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStandbyDialog(true)}
                className={`p-2 rounded-xs text-[10px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operatingState === 'STANDBY'
                    ? 'bg-neutral-200 text-black shadow-md'
                    : 'bg-[#0D0D0E] border border-[#1F1F21] text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>STANDBY</span>
              </button>

              <button
                type="button"
                onClick={() => operatingState === 'EMERGENCY_STOP' ? emergencyResume() : emergencyStop()}
                className={`p-2 rounded-xs text-[10px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operatingState === 'EMERGENCY_STOP'
                    ? 'bg-rose-600 text-white shadow-md animate-pulse'
                    : 'bg-[#0D0D0E] border border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{operatingState === 'EMERGENCY_STOP' ? 'RESUME SYSTEM' : 'EMERGENCY STOP'}</span>
              </button>
            </div>
          </div>

          {/* Standby Mode Options Modal Dialog */}
          {showStandbyDialog && (
            <div className="p-3.5 rounded-sm bg-neutral-900 border border-amber-500/50 space-y-2.5 mt-2 animate-fadeIn">
              <div className="text-xs font-mono font-bold text-amber-300">
                STANDBY MODE CONFIGURATION
              </div>
              <p className="text-[11px] font-mono text-neutral-300 leading-relaxed">
                Choose how you want Imperium to treat active positions while entering Standby mode:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleStandbySelect('KEEP_EXISTING')}
                  className="p-2.5 rounded-xs bg-[#0D0D0E] border border-white/20 hover:border-emerald-400 text-left font-mono text-xs text-neutral-200 hover:text-white transition-all cursor-pointer"
                >
                  <strong className="text-emerald-400 block text-[10px] uppercase">Option A: Keep Existing Positions</strong>
                  <span className="text-[10px] text-neutral-400">Let active holdings manage themselves according to exit rules.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStandbySelect('CASH_OUT')}
                  className="p-2.5 rounded-xs bg-[#0D0D0E] border border-rose-500/40 hover:border-rose-500 text-left font-mono text-xs text-neutral-200 hover:text-white transition-all cursor-pointer"
                >
                  <strong className="text-rose-400 block text-[10px] uppercase">Option B: Cash Out Everything</strong>
                  <span className="text-[10px] text-neutral-400">Liquidate all positions immediately to 100% Cash reserves.</span>
                </button>
              </div>
              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={() => setShowStandbyDialog(false)}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Quick Supervisory Visual State Switcher */}
          <div className="pt-2 border-t border-[#1F1F21]">
            <span className="text-[9px] font-mono text-[#7A7A7A] block mb-1.5 uppercase">
              SUPERVISORY STATE OVERRIDE:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {states.map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNexusState(st)}
                  className={`px-2 py-1 rounded-xs text-[9px] font-mono uppercase transition-all touch-manipulation cursor-pointer ${
                    nexusState === st
                      ? 'bg-[#C5A059] text-[#0D0D0E] font-medium shadow'
                      : 'bg-[#0D0D0E] border border-[#1F1F21] text-[#9A9A9A] hover:text-[#E5E5E5]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chief-of-Staff Pipeline Visualization */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2 text-xs font-mono">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Nexus Assistant & Chief-of-Staff Pipeline</span>
          </h3>

          <div className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-[10px] text-[#D1D1D1] space-y-1.5">
            <div className="flex items-center justify-between text-[#C5A059] font-medium">
              <span>PIPELINE:</span>
              <span className="text-[#4CAF50]">STATUS: ONLINE</span>
            </div>
            <p className="text-[#9A9A9A] leading-relaxed text-[10px]">
              WORKER → NEXUS ASSISTANT → VERIFY → CHECK FRESHNESS → DEDUPLICATE → CHECK CONFLICTS → ORGANIZE EVIDENCE → CREATE OPPORTUNITY FOLDER → NEXUS SUPERVISOR
            </p>
          </div>
        </div>

        {/* Nexus Interactive Conversational Console */}
        <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1F1F21]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Nexus Telemetry Conversation</span>
            </span>
            <span className="text-[9px] font-mono text-[#555]">
              STRATEGIC REASONING ENGINE
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xs max-w-[90%] leading-relaxed ${
                  msg.role === 'nexus'
                    ? 'bg-[#0D0D0E] border border-[#C5A059]/30 text-[#D1D1D1] mr-auto'
                    : 'bg-[#1F1F21] text-[#E5E5E5] ml-auto border border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] text-[#7A7A7A] mb-1">
                  <span className="font-medium uppercase text-[#C5A059]">
                    {msg.role === 'nexus' ? 'NEXUS SUPERVISOR' : 'OPERATOR'}
                  </span>
                  <span>{msg.time}</span>
                </div>
                <p className="text-[11px] leading-snug">{msg.text}</p>
              </div>
            ))}
            {isSending && (
              <div className="p-2 rounded-xs bg-[#0D0D0E] text-[#C5A059]/70 text-[10px] font-mono animate-pulse mr-auto">
                Nexus synthesizing supervisory evaluation...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="mt-2 pt-2 border-t border-[#1F1F21] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Query Nexus (e.g. 'Status of momentum desk', 'Audit risk envelope')..."
              className="flex-1 p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono text-[#E5E5E5] placeholder-[#7A7A7A] focus:outline-none focus:border-[#C5A059]"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="px-3 py-2 rounded-xs bg-[#C5A059] hover:bg-[#b08e4d] text-[#0D0D0E] font-mono font-medium text-xs flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

