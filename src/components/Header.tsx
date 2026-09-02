import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Sparkles, User, HelpCircle, DollarSign, FileText } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const Header: React.FC = () => {
  const { systemStatus, nexusState, setActiveModal, isAlpacaPaperConnected } = useImperium();
  const [timeStr, setTimeStr] = useState<string>('');
  const [utcStr, setUtcStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setUtcStr(now.toUTCString().split(' ').slice(4, 5)[0] + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getNexusStateBadge = () => {
    switch (nexusState) {
      case 'GOT ONE':
        return { text: 'GOT ONE', bg: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40', pulse: true };
      case 'ACTION REQUIRED':
        return { text: 'ACTION REQ', bg: 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/40', pulse: true };
      case 'CAUTION':
        return { text: 'CAUTION', bg: 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/40', pulse: false };
      case 'RECOVERY':
        return { text: 'RECOVERY', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', pulse: true };
      case 'VERIFYING':
        return { text: 'VERIFYING', bg: 'bg-[#C5A059]/15 text-[#E5E5E5] border-[#C5A059]/30', pulse: true };
      default:
        return { text: 'ACTIVE', bg: 'bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30', pulse: false };
    }
  };

  const badge = getNexusStateBadge();

  return (
    <header className="relative z-20 w-full bg-[#0D0D0E]/95 border-b border-[#1F1F21] backdrop-blur-md">
      {/* Top Persistent Paper Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black px-4 py-1 flex items-center justify-between text-[11px] font-black tracking-widest uppercase shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>PAPER MODE — FAKE MONEY (NO REAL MONEY USED)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="hidden sm:inline bg-black/20 px-2 py-0.5 rounded font-bold">FEED: IEX REAL-TIME (42ms)</span>
          <button 
            onClick={() => setActiveModal('AUTH' as any)}
            className="hover:underline bg-black/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold"
          >
            <User className="w-3 h-3" />
            <span>ROLE: OWNER/ADMIN</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveModal('NEXUS')}>
              <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
              <h1 
                id="imperium-logo-title"
                className="font-serif italic text-xl sm:text-2xl tracking-tight text-[#E5E5E5] hover:text-amber-300 transition-colors"
              >
                Imperium
              </h1>
            </div>
            <span className="h-3.5 w-[1px] bg-[#1F1F21] inline-block" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
              Command Center
            </span>
          </div>

          {/* Sub-bar / Telemetry Status */}
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-[#7A7A7A] font-mono mt-0.5">
            <span className="flex items-center gap-1.5 text-[#C5A059]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span>NEXUS v4.8</span>
            </span>
            <span className="text-[#555]">•</span>
            <span className="text-[#9A9A9A]">{timeStr}</span>
            <span className="hidden sm:inline text-[#555]">({utcStr})</span>
          </div>
        </div>

        {/* Right: Touch Shortcuts & Status Badges */}
        <div className="flex items-center gap-2">
          {/* Quick Money Touch Pill */}
          <button
            id="header-money-pill"
            onClick={() => setActiveModal('MONEY' as any)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WHERE IS MY MONEY?</span>
            <span className="sm:hidden">MONEY</span>
          </button>

          {/* Daily Brief Pill */}
          <button
            id="header-brief-pill"
            onClick={() => setActiveModal('DAILY_BRIEF' as any)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-[10px] font-bold tracking-wider uppercase transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>DAILY BRIEF</span>
          </button>

          {/* Nexus State Trigger Pill */}
          <button
            id="header-nexus-state-pill"
            onClick={() => setActiveModal('NEXUS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[10px] font-mono font-medium tracking-[0.15em] uppercase transition-all active:scale-95 touch-manipulation ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${badge.pulse ? 'animate-ping' : ''}`} />
            <span>{badge.text}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

