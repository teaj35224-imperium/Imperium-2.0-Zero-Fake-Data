import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Zap, RefreshCw, Eye } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const NexusControl: React.FC = () => {
  const { 
    nexusState, 
    setActiveModal, 
    opportunities, 
    humanEscalations
  } = useImperium();
  const [isPressed, setIsPressed] = useState(false);

  const pendingGotOnes = opportunities.filter(o => o.status === 'PENDING_NEXUS');
  const activeEscalations = humanEscalations.filter(e => !e.isResolved);

  const getStateConfig = () => {
    switch (nexusState) {
      case 'GOT ONE':
        return {
          title: 'NEXUS • GOT ONE',
          subtext: `${pendingGotOnes.length} Opportunity Awaiting Supervisory Verdict`,
          glowColor: 'rgba(197, 160, 89, 0.4)',
          borderColor: '#C5A059',
          coreGradient: 'from-[#C5A059]/30 via-[#C5A059]/10 to-transparent',
          accentText: 'text-[#C5A059]',
          pulseRing: 'border-[#C5A059]/60 animate-pulse',
          icon: Zap
        };
      case 'ACTION REQUIRED':
        return {
          title: 'NEXUS • ACTION REQUIRED',
          subtext: `${activeEscalations.length} Critical Escalation Requires Human Authorization`,
          glowColor: 'rgba(255, 82, 82, 0.4)',
          borderColor: '#FF5252',
          coreGradient: 'from-[#FF5252]/30 via-[#FF5252]/10 to-transparent',
          accentText: 'text-[#FF5252]',
          pulseRing: 'border-[#FF5252]/60 animate-ping',
          icon: AlertTriangle
        };
      case 'CAUTION':
        return {
          title: 'NEXUS • CAUTION',
          subtext: 'Holding Divergence or Macro Regime Shift Flagged',
          glowColor: 'rgba(249, 115, 22, 0.35)',
          borderColor: '#F97316',
          coreGradient: 'from-orange-600/30 via-orange-500/10 to-transparent',
          accentText: 'text-orange-300',
          pulseRing: 'border-orange-400/50 animate-pulse',
          icon: AlertTriangle
        };
      case 'RECOVERY':
        return {
          title: 'NEXUS • RECOVERY',
          subtext: 'Executing Watchdog Self-Repair Sequence',
          glowColor: 'rgba(6, 182, 212, 0.35)',
          borderColor: '#06b6d4',
          coreGradient: 'from-cyan-600/30 via-cyan-500/10 to-transparent',
          accentText: 'text-cyan-300',
          pulseRing: 'border-cyan-400/60 animate-spin',
          icon: RefreshCw
        };
      case 'VERIFYING':
        return {
          title: 'NEXUS • VERIFYING',
          subtext: 'Chief of Staff Evidence Deduplication in Progress',
          glowColor: 'rgba(197, 160, 89, 0.3)',
          borderColor: '#C5A059',
          coreGradient: 'from-[#C5A059]/25 via-[#C5A059]/10 to-transparent',
          accentText: 'text-[#E5E5E5]',
          pulseRing: 'border-[#C5A059]/40 animate-pulse',
          icon: Eye
        };
      case 'STANDBY':
        return {
          title: 'NEXUS • STANDBY',
          subtext: 'Background Telemetry Active • Touch to Engage Core',
          glowColor: 'rgba(122, 122, 122, 0.2)',
          borderColor: '#7A7A7A',
          coreGradient: 'from-[#1F1F21] via-[#141416] to-transparent',
          accentText: 'text-[#7A7A7A]',
          pulseRing: 'border-[#2F2F31]',
          icon: ShieldCheck
        };
      case 'ACTIVE':
      default:
        return {
          title: 'NEXUS • ACTIVE',
          subtext: 'Supervising 8 Specialist Desks • Risk Gates Safe',
          glowColor: 'rgba(197, 160, 89, 0.35)',
          borderColor: '#C5A059',
          coreGradient: 'from-[#C5A059]/25 via-[#C5A059]/10 to-transparent',
          accentText: 'text-[#C5A059]',
          pulseRing: 'border-[#C5A059]/40 animate-pulse',
          icon: Sparkles
        };
    }
  };

  const stateCfg = getStateConfig();
  const IconComponent = stateCfg.icon;

  const handleTouchNexus = () => {
    if (nexusState === 'GOT ONE' && pendingGotOnes.length > 0) {
      setActiveModal('GOT_ONE_DETAIL');
    } else if (nexusState === 'ACTION REQUIRED') {
      setActiveModal('ACTION_REQUIRED');
    } else {
      setActiveModal('NEXUS_HUB');
    }
  };

  return (
    <div className="relative z-10 w-full py-3 flex flex-col items-center justify-center px-4">
      {/* Octagonal Outer Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Subtle Ambient Back-Glow */}
        <div 
          className="absolute -inset-6 rounded-full opacity-40 pointer-events-none transition-all duration-700 blur-2xl"
          style={{
            background: `radial-gradient(circle, ${stateCfg.glowColor} 0%, transparent 70%)`
          }}
        />

        {/* Master Octagon Touch Button */}
        <button
          id="nexus-master-octagonal-control"
          type="button"
          onClick={handleTouchNexus}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          className={`relative group touch-manipulation focus:outline-none transition-all duration-200 cursor-pointer ${
            isPressed ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'
          }`}
          style={{
            width: '180px',
            height: '180px',
            filter: `drop-shadow(0 0 12px ${stateCfg.glowColor})`
          }}
          aria-label={stateCfg.title}
        >
          {/* Layer 1: Outer Octagonal Geometry Frame */}
          <div 
            className="absolute inset-0 bg-[#141416] transition-all duration-300"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              border: `1.5px solid ${stateCfg.borderColor}`
            }}
          />

          {/* Layer 2: Inner Stepped Octagon Rim */}
          <div 
            className="absolute inset-1.5 bg-[#0D0D0E] transition-all duration-300"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              border: '1px solid #1F1F21'
            }}
          />

          {/* Layer 3: Concentric Octagon Grid & Nexus Core Icon */}
          <div 
            className={`absolute inset-4 bg-gradient-to-b ${stateCfg.coreGradient} flex flex-col items-center justify-center overflow-hidden`}
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              background: '#141416',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)'
            }}
          >
            {/* Spinning Coordinate Activity Ring */}
            <div 
              className={`absolute inset-2 rounded-full border border-dashed ${stateCfg.pulseRing}`}
              style={{ animationDuration: '8s' }}
            />

            {/* Core Nexus Icon & Typography */}
            <div className="relative z-10 flex flex-col items-center justify-center p-2">
              <div className={`p-2.5 rounded-full bg-[#0D0D0E] border border-[#1F1F21] mb-1 ${stateCfg.accentText} shadow-inner`}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              <span 
                className="font-serif italic text-sm tracking-widest text-[#E5E5E5] text-center"
              >
                Nexus
              </span>
              
              <span className={`text-[8px] font-mono tracking-[0.2em] uppercase font-semibold mt-0.5 ${stateCfg.accentText}`}>
                {nexusState}
              </span>
            </div>

            {/* Subtle Inner Corner Ticks */}
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-[#C5A059]/40" />
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-[#C5A059]/40" />
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[1px] h-3 bg-[#C5A059]/40" />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[1px] h-3 bg-[#C5A059]/40" />
          </div>
        </button>

        {/* State Banner & Direct Touch Action */}
        <div className="mt-2.5 flex flex-col items-center text-center max-w-sm">
          <button 
            id="nexus-state-banner-btn"
            onClick={handleTouchNexus}
            className="cursor-pointer group flex items-center gap-2 px-3.5 py-1 rounded-sm bg-[#141416] border border-[#1F1F21] hover:border-[#C5A059]/50 active:scale-95 transition-all"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${nexusState === 'GOT ONE' || nexusState === 'ACTION REQUIRED' ? 'bg-[#C5A059] animate-ping' : 'bg-[#C5A059]'}`} />
            <span className={`text-xs font-mono font-medium tracking-[0.15em] ${stateCfg.accentText}`}>
              {stateCfg.title}
            </span>
          </button>
          <span className="text-[11px] text-[#7A7A7A] mt-1 font-sans">
            {stateCfg.subtext}
          </span>
        </div>
      </div>
    </div>
  );
};
