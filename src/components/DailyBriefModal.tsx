import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, FileText } from 'lucide-react';

interface DailyBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConceptExplanation?: (conceptKey: string) => void;
}

export const DailyBriefModal: React.FC<DailyBriefModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div id="daily-brief-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full max-w-2xl bg-[#0d0c0a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-amber-400"/><div><h2 className="text-lg font-black text-white">Daily Intelligence Brief</h2><p className="text-xs text-neutral-400">Authoritative activity only</p></div></div>
            <button id="close-daily-brief-btn" onClick={onClose} className="p-2 text-neutral-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-8 text-center">
            <div className="text-sm font-mono font-bold text-amber-300">DATA NOT FOUND</div>
            <p className="mt-2 text-xs text-neutral-400">No authoritative Daily Brief feed is connected yet. No trading results, P&amp;L, win rate, ticker outcomes, or market events will be invented.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
