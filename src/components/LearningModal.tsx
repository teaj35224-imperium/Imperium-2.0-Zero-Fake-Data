import React from 'react';
import { ArrowLeft, BookOpen, Award, TrendingUp, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const LearningModal: React.FC = () => {
  const { learningEvaluation, setActiveModal, adjustStrategyWeight } = useImperium();

  if (!learningEvaluation) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#0D0D0E]/95 backdrop-blur-md overflow-y-auto pt-safe pb-24 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto py-3">
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
            NEXUS POST-TRADE REFLECTION & LEARNING
          </span>
        </div>

        {/* High-Level Scorecard Banner */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#C5A059]/40 shadow-xl mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#E5E5E5]">
                EVALUATION REPORT #{learningEvaluation.totalTradesEvaluated} TRADES
              </h2>
              <span className="text-[10px] font-mono text-[#7A7A7A]">
                Last Evaluated: {learningEvaluation.lastEvaluatedAt}
              </span>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-xs bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30">
              AUDIT HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#1F1F21] text-[10px] font-mono">
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">REASONING ACCURACY</span>
              <span className="text-base font-bold text-[#C5A059]">{learningEvaluation.reasoningAccuracyScore}%</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">RISK EFFECTIVENESS</span>
              <span className="text-base font-bold text-[#4CAF50]">{learningEvaluation.riskEffectivenessScore}%</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">FALSE POSITIVES</span>
              <span className="text-base font-bold text-[#E5E5E5]">{learningEvaluation.falsePositiveRate}%</span>
            </div>
            <div className="p-2 rounded-sm bg-[#0D0D0E] border border-[#1F1F21]">
              <span className="text-[#7A7A7A] block text-[9px]">MISSED TRADES</span>
              <span className="text-base font-bold text-[#E5E5E5]">{learningEvaluation.missedOpportunitiesCount}</span>
            </div>
          </div>
        </div>

        {/* Auditable Strategy Weights with Sliders */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Auditable Strategy Weights & Multipliers</span>
            </span>
            <span className="text-[9px] text-[#555] font-mono">CONTROLLED RE-WEIGHTING</span>
          </h3>

          <div className="space-y-3">
            {learningEvaluation.strategyPerformance.map((strat, idx) => (
              <div key={idx} className="p-3 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#E5E5E5] block">
                      {strat.strategyName}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A7A7A]">
                      Win Rate: <strong className="text-[#4CAF50]">{strat.winRate}%</strong> • P&L: <strong className="text-[#4CAF50]">+${strat.profitContribution.toFixed(2)}</strong> • Trades: {strat.tradesCount}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-xs bg-[#141416] border border-[#C5A059]/30 text-[#C5A059]">
                    {strat.weight.toFixed(2)}x
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[9px] font-mono text-[#7A7A7A]">0.1x</span>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={strat.weight}
                    onChange={(e) => adjustStrategyWeight(strat.strategyName, parseFloat(e.target.value))}
                    className="flex-1 accent-[#C5A059] h-1.5 bg-[#1F1F21] rounded cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-[#7A7A7A]">2.0x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Accuracy Ranking Table */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] mb-3 space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Worker Desk Accuracy Leaderboard
          </h3>
          <div className="space-y-1.5">
            {learningEvaluation.workerAccuracyRankings.map((w, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#7A7A7A] font-bold">#{idx + 1}</span>
                  <span className="text-[#E5E5E5] font-medium">{w.workerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7A7A7A]">Approved: {w.approvedProposals}</span>
                  <span className="text-[#4CAF50] font-medium">{w.accuracyScore}% Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Lessons Learned */}
        <div className="p-4 rounded-sm bg-[#141416] border border-[#1F1F21] space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
            Synthesized Lessons Learned
          </h3>
          <ul className="space-y-2 text-xs font-mono text-[#D1D1D1]">
            {learningEvaluation.topLessonsLearned.map((lesson, idx) => (
              <li key={idx} className="p-2.5 rounded-xs bg-[#0D0D0E] border border-[#1F1F21] leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
