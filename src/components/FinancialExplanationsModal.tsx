import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, BookOpen, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { FINANCIAL_CONCEPTS } from '../data/financialConcepts';

interface FinancialExplanationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConceptKey?: string | null;
}

export const FinancialExplanationsModal: React.FC<FinancialExplanationsModalProps> = ({
  isOpen,
  onClose,
  initialConceptKey
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string>(
    initialConceptKey && FINANCIAL_CONCEPTS[initialConceptKey] ? initialConceptKey : 'UNREALIZED_PROFIT'
  );

  React.useEffect(() => {
    if (initialConceptKey && FINANCIAL_CONCEPTS[initialConceptKey]) {
      setSelectedKey(initialConceptKey);
    }
  }, [initialConceptKey]);

  if (!isOpen) return null;

  const activeConcept = FINANCIAL_CONCEPTS[selectedKey] || FINANCIAL_CONCEPTS.UNREALIZED_PROFIT;

  return (
    <AnimatePresence>
      <div id="financial-explanations-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#0f0e0c] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Plain-English Financial Guide</h3>
                <p className="text-xs text-amber-300/80">Every concept explained without jargon</p>
              </div>
            </div>
            <button
              id="close-financial-explanations-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Concept Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {Object.entries(FINANCIAL_CONCEPTS).map(([key, item]) => {
                const isActive = key === selectedKey;
                return (
                  <button
                    key={key}
                    id={`concept-tab-${key}`}
                    onClick={() => setSelectedKey(key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {item.term}
                  </button>
                );
              })}
            </div>

            {/* Active Concept Card */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Concept Deep-Dive</span>
                <h4 className="text-lg font-bold text-white mt-0.5">{activeConcept.title}</h4>
              </div>

              {/* Simple Explanation */}
              <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Simple Translation</span>
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">{activeConcept.simpleExplanation}</p>
              </div>

              {/* Why It Matters */}
              <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Why This Protects You</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{activeConcept.whyItMatters}</p>
              </div>

              {/* How Nexus Uses It */}
              <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>How Nexus Executes This Automatically</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{activeConcept.howNexusUsesIt}</p>
              </div>

              {/* Concrete Example */}
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                  <ArrowRight className="w-4 h-4" />
                  <span>Concrete Live Example</span>
                </div>
                <p className="text-xs font-mono text-amber-200/90 leading-relaxed">{activeConcept.example}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">All executions run in Alpaca Paper mode</span>
            <button
              id="close-guide-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider transition-colors"
            >
              GOT IT
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
