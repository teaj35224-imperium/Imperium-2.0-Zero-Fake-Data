import React from 'react';
import { BookOpen, CheckCircle, ChevronRight, Award, TrendingUp, Filter } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const NexusLearningSection: React.FC = () => {
  const { learningEvaluation, setActiveModal, adjustStrategyWeight } = useImperium();

  if (!learningEvaluation) return null;

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                What Has Nexus Learned?
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Continuous post-trade reflection, worker accuracy & auditable strategy weighting
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('LEARNING')}
            className="text-[9px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#E5E5E5] flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Full Evaluation</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Top High-Level Accuracy Score Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] flex flex-col">
            <span className="text-[9px] font-mono text-[#7A7A7A] uppercase">REASONING ACCURACY</span>
            <span className="font-mono text-base font-medium text-[#C5A059]">
              {learningEvaluation.reasoningAccuracyScore}%
            </span>
            <span className="text-[8px] font-mono text-[#4CAF50]">Thesis validation</span>
          </div>

          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] flex flex-col">
            <span className="text-[9px] font-mono text-[#7A7A7A] uppercase">RISK EFFECTIVENESS</span>
            <span className="font-mono text-base font-medium text-[#4CAF50]">
              {learningEvaluation.riskEffectivenessScore}%
            </span>
            <span className="text-[8px] font-mono text-[#7A7A7A]">Zero breaches</span>
          </div>

          <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] flex flex-col">
            <span className="text-[9px] font-mono text-[#7A7A7A] uppercase">FALSE POSITIVES</span>
            <span className="font-mono text-base font-medium text-[#D1D1D1]">
              {learningEvaluation.falsePositiveRate}%
            </span>
            <span className="text-[8px] font-mono text-[#555]">Pre-execution filtered</span>
          </div>
        </div>

        {/* Strategy Performance Multipliers Preview */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A] block mb-1">
            Strategy Performance & Auditable Weights
          </span>
          {learningEvaluation.strategyPerformance.slice(0, 3).map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[10px] font-mono"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-medium text-[#E5E5E5] truncate">{s.strategyName}</span>
                <span className="text-[9px] text-[#7A7A7A]">{s.auditableStatus}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#4CAF50] font-medium">{s.winRate}% Win</span>
                <span className="px-1.5 py-0.5 rounded-xs bg-[#141416] border border-[#C5A059]/30 text-[#C5A059] font-medium">
                  {s.weight}x
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Lesson Learned Banner */}
        <div className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#C5A059]/30 text-[10px] font-mono text-[#D1D1D1] leading-relaxed">
          <strong className="text-[#C5A059] block mb-0.5 uppercase tracking-wider text-[9px]">Key Takeaway & Evolution:</strong>
          {learningEvaluation.topLessonsLearned[0]}
        </div>
      </div>
    </div>
  );
};
