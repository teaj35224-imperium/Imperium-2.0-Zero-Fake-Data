import React from 'react';
import { motion } from 'motion/react';
import type { RobotFaceState } from '../types';

interface NexusRobotFaceProps {
  state?: RobotFaceState;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  onFaceClick?: () => void;
  className?: string;
}

export const NexusRobotFace: React.FC<NexusRobotFaceProps> = ({
  state = 'STANDBY',
  size = 'md',
  showBadge = true,
  onFaceClick,
  className = ''
}) => {
  // Dimension scale mappings
  const dimensions = {
    sm: { width: 56, height: 56, eyeRadius: 6, stroke: 1.5 },
    md: { width: 84, height: 84, eyeRadius: 9, stroke: 2 },
    lg: { width: 120, height: 120, eyeRadius: 13, stroke: 2.5 }
  }[size];

  // State color mapping (Amber dominant futuristic palette)
  const isAlert = state === 'ALERT' || state === 'ACTION REQUIRED';
  const isRecovery = state === 'RECOVERY';
  const isNavigating = state === 'NAVIGATING';
  const isThinking = state === 'THINKING';
  const isSpeaking = state === 'SPEAKING' || state === 'EXPLAINING';
  const isListening = state === 'LISTENING';

  const primaryGlow = isAlert 
    ? '#ef4444' 
    : isRecovery 
    ? '#06b6d4'
    : isNavigating
    ? '#38bdf8' 
    : '#f59e0b'; // Gold / Amber default

  const secondaryGlow = isAlert 
    ? '#dc2626' 
    : isRecovery
    ? '#0891b2'
    : isNavigating 
    ? '#0284c7' 
    : '#d97706';

  return (
    <div 
      className={`relative flex flex-col items-center select-none cursor-pointer group ${className}`}
      onClick={onFaceClick}
      id="nexus-robot-face-root"
      title={`Nexus Chief-of-Staff Intelligence • State: ${state}`}
    >
      {/* Outer ambient glow field */}
      <motion.div
        className="absolute -inset-2 rounded-2xl filter blur-md opacity-30 pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: primaryGlow
        }}
        animate={{
          opacity: isSpeaking ? [0.3, 0.65, 0.3] : isThinking ? [0.2, 0.5, 0.2] : isAlert ? [0.4, 0.8, 0.4] : 0.25,
          scale: isSpeaking ? [0.98, 1.05, 0.98] : 1
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 0.6 : isThinking ? 1.4 : isAlert ? 0.8 : 3,
          ease: 'easeInOut'
        }}
      />

      {/* SVG Face Chasis */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        className="relative z-10 filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Metallic chasis linear gradient */}
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#242730" />
            <stop offset="50%" stopColor="#14161d" />
            <stop offset="100%" stopColor="#0a0c10" />
          </linearGradient>

          {/* Golden Amber eye glow */}
          <radialGradient id="amberEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor={primaryGlow} />
            <stop offset="85%" stopColor={secondaryGlow} />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Chin grille pattern */}
          <pattern id="grillePattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#2a2e39" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Outer Angular Robot Helmet / Shell */}
        <polygon
          points="25,5 75,5 92,25 95,65 78,95 22,95 5,65 8,25"
          fill="url(#chassisGrad)"
          stroke={primaryGlow}
          strokeWidth={dimensions.stroke}
          strokeOpacity={0.8}
          className="transition-colors duration-300"
        />

        {/* Cybernetic Bevel Lines */}
        <line x1="25" y1="5" x2="32" y2="25" stroke="#374151" strokeWidth="1" />
        <line x1="75" y1="5" x2="68" y2="25" stroke="#374151" strokeWidth="1" />
        <line x1="8" y1="25" x2="25" y2="35" stroke="#374151" strokeWidth="1" />
        <line x1="92" y1="25" x2="75" y2="35" stroke="#374151" strokeWidth="1" />

        {/* Forehead Nexus Status Diamond */}
        <motion.polygon
          points="50,10 56,16 50,22 44,16"
          fill={primaryGlow}
          animate={{
            opacity: isThinking ? [0.4, 1, 0.4] : 0.9,
            scale: isThinking ? [0.9, 1.15, 0.9] : 1
          }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />

        {/* Eye Visor Recess (Dark background) */}
        <polygon
          points="18,34 82,34 80,58 20,58"
          fill="#050608"
          stroke="#1f2937"
          strokeWidth="1"
        />

        {/* Scanline Sweep effect inside visor */}
        <motion.line
          x1="20"
          y1="36"
          x2="80"
          y2="36"
          stroke={primaryGlow}
          strokeWidth="1"
          strokeOpacity="0.4"
          animate={{
            y1: [36, 56, 36],
            y2: [36, 56, 36],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
        />

        {/* Left Angular Cyber Eye */}
        <g id="left-eye-group">
          {/* Outer focus reticle during THINKING */}
          {isThinking && (
            <motion.circle
              cx="35"
              cy="46"
              r="11"
              fill="none"
              stroke={primaryGlow}
              strokeWidth="1"
              strokeDasharray="3 3"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              style={{ originX: '35px', originY: '46px' }}
            />
          )}
          {/* Main Amber Eye Core */}
          <motion.ellipse
            cx="35"
            cy="46"
            rx={dimensions.eyeRadius}
            ry={isListening ? dimensions.eyeRadius * 1.15 : dimensions.eyeRadius * 0.8}
            fill="url(#amberEyeGlow)"
            animate={{
              scaleY: isAlert ? [1, 0.2, 1] : [1, 0.95, 1],
              opacity: isAlert ? [0.7, 1, 0.7] : 1
            }}
            transition={{ repeat: Infinity, duration: isAlert ? 0.6 : 3.5 }}
          />
          {/* Iris Pupil Dot */}
          <circle cx="35" cy="46" r="2.5" fill="#000000" />
          <circle cx="36.5" cy="44.5" r="1" fill="#ffffff" />
        </g>

        {/* Right Angular Cyber Eye */}
        <g id="right-eye-group">
          {/* Outer focus reticle during THINKING */}
          {isThinking && (
            <motion.circle
              cx="65"
              cy="46"
              r="11"
              fill="none"
              stroke={primaryGlow}
              strokeWidth="1"
              strokeDasharray="3 3"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              style={{ originX: '65px', originY: '46px' }}
            />
          )}
          {/* Main Amber Eye Core */}
          <motion.ellipse
            cx="65"
            cy="46"
            rx={dimensions.eyeRadius}
            ry={isListening ? dimensions.eyeRadius * 1.15 : dimensions.eyeRadius * 0.8}
            fill="url(#amberEyeGlow)"
            animate={{
              scaleY: isAlert ? [1, 0.2, 1] : [1, 0.95, 1],
              opacity: isAlert ? [0.7, 1, 0.7] : 1
            }}
            transition={{ repeat: Infinity, duration: isAlert ? 0.6 : 3.5 }}
          />
          {/* Iris Pupil Dot */}
          <circle cx="65" cy="46" r="2.5" fill="#000000" />
          <circle cx="66.5" cy="44.5" r="1" fill="#ffffff" />
        </g>

        {/* Listening Acoustic Arcs (When state is LISTENING) */}
        {isListening && (
          <g>
            <motion.path
              d="M 12 40 A 10 10 0 0 0 12 52"
              fill="none"
              stroke={primaryGlow}
              strokeWidth="1.5"
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.0 }}
            />
            <motion.path
              d="M 88 40 A 10 10 0 0 1 88 52"
              fill="none"
              stroke={primaryGlow}
              strokeWidth="1.5"
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.0 }}
            />
          </g>
        )}

        {/* Mouth / Voice Synthesizer Gate */}
        <g id="mouth-gate">
          {/* Mouth cavity backing */}
          <polygon points="32,70 68,70 64,84 36,84" fill="#0a0c10" stroke="#1f2937" strokeWidth="1" />
          
          {/* Dynamic Audio Equalizer Wave Bars (Active during SPEAKING) */}
          {isSpeaking ? (
            <g>
              <motion.line
                x1="38" y1="77" x2="38" y2="77"
                stroke={primaryGlow} strokeWidth="2.5" strokeLinecap="round"
                animate={{ y1: [75, 71, 75], y2: [79, 83, 79] }}
                transition={{ repeat: Infinity, duration: 0.25 }}
              />
              <motion.line
                x1="44" y1="77" x2="44" y2="77"
                stroke={primaryGlow} strokeWidth="2.5" strokeLinecap="round"
                animate={{ y1: [74, 69, 74], y2: [80, 85, 80] }}
                transition={{ repeat: Infinity, duration: 0.18 }}
              />
              <motion.line
                x1="50" y1="77" x2="50" y2="77"
                stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round"
                animate={{ y1: [73, 68, 73], y2: [81, 86, 81] }}
                transition={{ repeat: Infinity, duration: 0.22 }}
              />
              <motion.line
                x1="56" y1="77" x2="56" y2="77"
                stroke={primaryGlow} strokeWidth="2.5" strokeLinecap="round"
                animate={{ y1: [74, 70, 74], y2: [80, 84, 80] }}
                transition={{ repeat: Infinity, duration: 0.19 }}
              />
              <motion.line
                x1="62" y1="77" x2="62" y2="77"
                stroke={primaryGlow} strokeWidth="2.5" strokeLinecap="round"
                animate={{ y1: [75, 72, 75], y2: [79, 82, 79] }}
                transition={{ repeat: Infinity, duration: 0.26 }}
              />
            </g>
          ) : (
            /* Standby Sleek Voice Slit */
            <line
              x1="38"
              y1="77"
              x2="62"
              y2="77"
              stroke={primaryGlow}
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Lower Chin Vent Grid */}
        <line x1="30" y1="90" x2="70" y2="90" stroke="#1f2937" strokeWidth="1" />
        <line x1="35" y1="92" x2="65" y2="92" stroke="#1f2937" strokeWidth="1" />
      </svg>

      {/* Floating State Badge */}
      {showBadge && (
        <div className="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-amber-500/30 text-[9px] font-mono uppercase tracking-widest text-amber-300">
          <span 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: primaryGlow }}
          />
          <span>{state}</span>
        </div>
      )}
    </div>
  );
};
