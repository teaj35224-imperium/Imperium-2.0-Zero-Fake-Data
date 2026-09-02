import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  Volume2,
  X,
  ArrowRight,
  ShieldAlert,
  Layers,
  TrendingUp,
  Activity,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';
import { NexusRobotFace } from './NexusRobotFace';

interface NexusNavigatorProps {
  currentScreenName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NexusNavigator: React.FC<NexusNavigatorProps> = ({
  currentScreenName = 'COMMAND_CENTER',
  isOpen,
  onClose
}) => {
  const {
    robotFaceState,
    setRobotFaceState,
    screenExplanation,
    isExplaining,
    explainScreen,
    speakExplanation,
    setActiveModal,
    setSelectedTicker,
    updateRiskLimits,
    createPaperOrder,
    isAlpacaPaperConnected
  } = useImperium();

  const [inputQuery, setInputQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'EXPLAIN' | 'QUICK_ROUTES'>('EXPLAIN');

  // Trigger screen explanation on mount or tab select
  const handleExplainCurrent = async () => {
    setActiveTab('EXPLAIN');
    const exp = await explainScreen(currentScreenName);
    if (exp) {
      setFeedbackMessage(`Nexus analyzed: ${exp.screenName}`);
    }
  };

  // Process natural language command
  const handleExecuteCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim().toLowerCase();
    if (!query) return;

    setRobotFaceState('THINKING');
    setFeedbackMessage(null);

    // 1. Screen explanation commands
    if (query.includes('explain') || query.includes('what am i') || query.includes('summary') || query.includes('overview')) {
      await handleExplainCurrent();
      setInputQuery('');
      return;
    }

    // 2. Emergency Freeze
    if (query.includes('freeze') || query.includes('emergency') || query.includes('halt') || query.includes('lock')) {
      await updateRiskLimits({ emergencyFreezeActive: true, riskState: 'STOP' });
      setFeedbackMessage('EMERGENCY RISK FREEZE ACTIVATED. All paper execution locked.');
      setRobotFaceState('ALERT');
      setInputQuery('');
      return;
    }

    // 3. Unfreeze
    if (query.includes('unfreeze') || query.includes('resume') || query.includes('unlock')) {
      await updateRiskLimits({ emergencyFreezeActive: false, riskState: 'SAFE' });
      setFeedbackMessage('Risk freeze lifted. Trading desk restored to SAFE state.');
      setRobotFaceState('STANDBY');
      setInputQuery('');
      return;
    }

    // 4. Navigation commands
    if (query.includes('portfolio') || query.includes('position') || query.includes('holding') || query.includes('pnl')) {
      setActiveModal('PORTFOLIO');
      setFeedbackMessage('Navigating to Portfolio & Holding Sentinel.');
      onClose();
      return;
    }

    if (query.includes('market') || query.includes('chart') || query.includes('quote') || query.includes('watchlist')) {
      setActiveModal('MARKETS');
      setFeedbackMessage('Navigating to Markets & Real-Time Intelligence.');
      onClose();
      return;
    }

    if (query.includes('worker') || query.includes('desk') || query.includes('specialist') || query.includes('health')) {
      setActiveModal('WORKERS');
      setFeedbackMessage('Navigating to Specialist Worker Network.');
      onClose();
      return;
    }

    if (query.includes('risk') || query.includes('guardrail') || query.includes('limit') || query.includes('cap')) {
      setActiveModal('RISK');
      setFeedbackMessage('Navigating to Central Risk Engine.');
      onClose();
      return;
    }

    if (query.includes('got one') || query.includes('opportunity') || query.includes('candidate')) {
      setActiveModal('GOT_ONE_DETAIL');
      setFeedbackMessage('Opening primary Got One candidate.');
      onClose();
      return;
    }

    if (query.includes('learn') || query.includes('weight') || query.includes('lesson') || query.includes('accuracy')) {
      setActiveModal('LEARNING');
      setFeedbackMessage('Navigating to Measurable Learning Engine.');
      onClose();
      return;
    }

    if (query.includes('archive') || query.includes('decision') || query.includes('history') || query.includes('audit')) {
      setActiveModal('DECISION_DETAIL');
      setFeedbackMessage('Opening Decision Archive.');
      onClose();
      return;
    }

    if (query.includes('setting') || query.includes('alpaca') || query.includes('api') || query.includes('connect')) {
      setActiveModal('SETTINGS');
      setFeedbackMessage('Opening Settings & Alpaca Connection Hub.');
      onClose();
      return;
    }

    // 5. Paper order intent parsing (e.g., "buy 5 shares NVDA" or "buy PLTR")
    if (query.startsWith('buy ') || query.startsWith('paper buy ')) {
      const parts = query.replace('paper buy ', '').replace('buy ', '').split(' ');
      let qty = 1;
      let symbol = '';

      if (parts.length >= 2 && !isNaN(Number(parts[0]))) {
        qty = Number(parts[0]);
        symbol = parts[1].replace('shares', '').replace('share', '').trim().toUpperCase();
      } else {
        symbol = parts[0].toUpperCase().trim();
      }


      if (symbol) {
        setFeedbackMessage(`Submitting paper order for ${qty}x $${symbol} via Central Risk Gate...`);
        const result = await createPaperOrder({
          ticker: symbol,
          qty,
          side: 'buy',
          type: 'market',
          workerSource: 'Nexus Voice Navigator',
          strategy: 'Navigator Intent Execution'
        });

        if (result.success) {
          setFeedbackMessage(`Paper Order Accepted: ${result.message}`);
          setRobotFaceState('STANDBY');
        } else {
          setFeedbackMessage(`Risk Gate Rejection: ${result.reason || result.message}`);
          setRobotFaceState('ALERT');
        }
        setInputQuery('');
        return;
      }
    }

    // Default fallback: search ticker in markets
    const cleanedTicker = query.replace('$', '').toUpperCase();
    if (cleanedTicker.length >= 1 && cleanedTicker.length <= 5) {
      setSelectedTicker(cleanedTicker);
      setActiveModal('MARKETS');
      setFeedbackMessage(`Loading intelligence for $${cleanedTicker}...`);
      onClose();
      return;
    }

    setFeedbackMessage(`Nexus parsed query: "${query}". Try "Explain this screen", "Emergency freeze", or "Open portfolio".`);
    setRobotFaceState('STANDBY');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-[#0d0f14] border border-amber-500/40 shadow-2xl overflow-hidden"
          id="nexus-navigator-modal"
        >
          {/* Header with Robot Face & Close */}
          <div className="p-4 border-b border-gray-800/80 bg-gradient-to-r from-[#14161d] via-[#101218] to-[#0a0c10] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NexusRobotFace size="sm" state={robotFaceState} showBadge={false} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    NEXUS NAVIGATOR
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    SUPERVISORY AI
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Natural Language Command & Supervisory Insight
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              id="nexus-navigator-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex border-b border-gray-800/80 bg-[#0a0c10] text-xs font-mono">
            <button
              onClick={() => {
                setActiveTab('EXPLAIN');
                if (!screenExplanation) handleExplainCurrent();
              }}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-colors ${
                activeTab === 'EXPLAIN'
                  ? 'bg-[#141720] text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              EXPLAIN SCREEN
            </button>
            <button
              onClick={() => setActiveTab('COMMAND')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-colors ${
                activeTab === 'COMMAND'
                  ? 'bg-[#141720] text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              COMMAND / INTENT
            </button>
            <button
              onClick={() => setActiveTab('QUICK_ROUTES')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-colors ${
                activeTab === 'QUICK_ROUTES'
                  ? 'bg-[#141720] text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              QUICK ROUTES
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {/* Feedback notification banner */}
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between"
              >
                <span>{feedbackMessage}</span>
                <button
                  onClick={() => setFeedbackMessage(null)}
                  className="text-amber-400 hover:text-amber-200 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* TAB 1: SCREEN EXPLANATION */}
            {activeTab === 'EXPLAIN' && (
              <div className="space-y-4">
                {isExplaining ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <NexusRobotFace size="md" state="THINKING" />
                    <p className="text-xs font-mono text-amber-300 animate-pulse">
                      Nexus synthesizing screen telemetry and risk envelopes...
                    </p>
                  </div>
                ) : screenExplanation ? (
                  <div className="space-y-3.5">
                    {/* Header with Title & Readout */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                          CURRENT VIEW INSIGHT
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {screenExplanation.screenName}
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          speakExplanation(
                            `${screenExplanation.screenName}. ${screenExplanation.summary}. Key observation: ${screenExplanation.nexusObservation}`
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1.5"
                        title="Voice Readout of Screen Explanation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        READ ALOUD
                      </button>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-[#12141c] border border-gray-800 text-xs text-gray-300 leading-relaxed">
                      {screenExplanation.summary}
                    </div>

                    {/* Key Metrics Grid */}
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                        Key Telemetry & Status
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {screenExplanation.keyMetrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 flex flex-col justify-between"
                          >
                            <span className="text-[10px] font-mono text-gray-400">{m.label}</span>
                            <span className="text-xs font-bold text-amber-300 my-0.5">{m.value}</span>
                            <span className="text-[9px] font-mono text-emerald-400">{m.assessment}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nexus Supervisory Observation */}
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">
                        <Activity className="w-3 h-3" />
                        NEXUS SUPERVISORY OBSERVATION
                      </div>
                      <p className="text-xs text-amber-100 leading-relaxed">
                        {screenExplanation.nexusObservation}
                      </p>
                    </div>

                    {/* Available Controls & Relevant Risks */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-800">
                        <span className="text-[10px] font-mono text-gray-400 block mb-1">
                          AVAILABLE CONTROLS
                        </span>
                        <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                          {screenExplanation.availableControls.slice(0, 3).map((c, i) => (
                            <li key={i} className="truncate">{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-800">
                        <span className="text-[10px] font-mono text-red-400 block mb-1">
                          RELEVANT RISKS
                        </span>
                        <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                          {screenExplanation.relevantRisks.slice(0, 3).map((r, i) => (
                            <li key={i} className="truncate">{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Data Source & Freshness (Honest connection reporting) */}
                    <div className="p-2 rounded-lg bg-black/60 border border-gray-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-gray-400">DATA FEED:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{screenExplanation.dataSource.provider}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            screenExplanation.dataSource.state === 'LIVE' ||
                            screenExplanation.dataSource.state === 'PAPER'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {screenExplanation.dataSource.state}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={handleExplainCurrent}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Analyze Current Screen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMMAND / INTENT */}
            {activeTab === 'COMMAND' && (
              <div className="space-y-4">
                <form onSubmit={handleExecuteCommand} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="e.g. Explain this screen, Buy 5 PLTR, Emergency freeze..."
                      className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-gray-900 border border-amber-500/40 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 p-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                      title="Execute Command"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                    Suggested Commands
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                    {[
                      { label: 'Explain this screen', cmd: 'Explain this screen' },
                      { label: 'Place paper order (Buy 5 NVDA)', cmd: 'Buy 5 NVDA' },
                      { label: 'Activate Emergency Risk Freeze', cmd: 'Emergency freeze' },
                      { label: 'Open Portfolio & Positions', cmd: 'Open portfolio' },
                      { label: 'Inspect Specialist Workers', cmd: 'Show workers' },
                      { label: 'Audit Learning Loop & Lessons', cmd: 'Review learning loop' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputQuery(item.cmd);
                        }}
                        className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-left text-gray-300 hover:text-amber-300 flex items-center justify-between text-xs transition-colors"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-gray-500">"{item.cmd}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QUICK ROUTES */}
            {activeTab === 'QUICK_ROUTES' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setActiveModal('PORTFOLIO');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="font-bold block text-white">PORTFOLIO</span>
                  <span className="text-[10px] text-gray-400">Holdings & Thesis Sentinel</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('MARKETS');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <Activity className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="font-bold block text-white">MARKETS</span>
                  <span className="text-[10px] text-gray-400">Live Quotes & Watchlist</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('WORKERS');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <Layers className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="font-bold block text-white">WORKERS</span>
                  <span className="text-[10px] text-gray-400">8 Autonomous Desks</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('RISK');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400 mb-1" />
                  <span className="font-bold block text-white">CENTRAL RISK</span>
                  <span className="text-[10px] text-gray-400">Caps & Loss Stops</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('LEARNING');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="font-bold block text-white">LEARNING LOOP</span>
                  <span className="text-[10px] text-gray-400">Auditable Strategy Weights</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('SETTINGS');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-amber-500/40 text-left hover:text-amber-300 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="font-bold block text-white">SETTINGS / ALPACA</span>
                  <span className="text-[10px] text-gray-400">
                    {isAlpacaPaperConnected ? 'Alpaca Connected' : 'Not Connected'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Footer with One-Touch Action */}
          <div className="p-3 border-t border-gray-800 bg-[#08090c] flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500 text-[11px]">
              Tap robot face anywhere to summon Navigator
            </span>
            <button
              onClick={handleExplainCurrent}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              EXPLAIN SCREEN
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
