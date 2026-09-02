import React from 'react';
import { AlertTriangle, ShieldAlert, Check, X, ArrowRight } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const ActionRequiredSection: React.FC = () => {
  const { humanEscalations, resolveEscalation, closePosition } = useImperium();
  const activeEscalations = humanEscalations.filter(e => !e.isResolved);

  if (activeEscalations.length === 0) return null;

  const handleAction = async (escId: string, action: any) => {
    if (action.actionType === 'CLOSE_POSITION') {
      await resolveEscalation(escId, action.id, action.label);
    } else {
      await resolveEscalation(escId, action.id, action.label);
    }
  };

  return (
    <div className="relative z-10 w-full px-4 mb-4 max-w-4xl mx-auto">
      <div className="p-4 rounded-sm bg-[#141416] border border-[#FF5252]/50 shadow-xl">
        {/* Banner Alert */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="p-1.5 rounded-xs bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/40">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#FF5252]">
              Nexus • Action Required ({activeEscalations.length})
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-[#9A9A9A]">
              Human Authorization Mandatory
            </span>
          </div>
        </div>

        {/* Escalation Cards */}
        <div className="space-y-3">
          {activeEscalations.map((esc) => (
            <div
              key={esc.id}
              className="p-3.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] text-[#D1D1D1]"
            >
              <h3 className="font-serif text-base text-[#E5E5E5] mb-2.5">
                {esc.title}
              </h3>

              {/* 5-Field Breakdown */}
              <div className="space-y-2 text-[11px] mb-3">
                <div className="p-2.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
                  <strong className="text-[#C5A059] block text-[10px] uppercase tracking-wider font-medium">WHAT HAPPENED:</strong>
                  <p className="text-[#D1D1D1] text-[11px] leading-relaxed mt-0.5">{esc.whatHappened}</p>
                </div>

                <div className="p-2.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
                  <strong className="text-[#FF5252] block text-[10px] uppercase tracking-wider font-medium">WHY IT MATTERS:</strong>
                  <p className="text-[#D1D1D1] text-[11px] leading-relaxed mt-0.5">{esc.whyItMatters}</p>
                </div>

                <div className="p-2.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
                  <strong className="text-[#7A7A7A] block text-[10px] uppercase tracking-wider font-medium">WHAT NEXUS TRIED:</strong>
                  <p className="text-[#D1D1D1] text-[11px] leading-relaxed mt-0.5">{esc.whatNexusTried}</p>
                </div>

                <div className="p-2.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
                  <strong className="text-[#C5A059] block text-[10px] uppercase tracking-wider font-medium">CURRENT STATE:</strong>
                  <p className="text-[#D1D1D1] text-[11px] leading-relaxed mt-0.5">{esc.currentState}</p>
                </div>
              </div>

              {/* Available Human Actions */}
              <div className="pt-2.5 border-t border-[#1F1F21]">
                <strong className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A7A7A] block mb-2">
                  Available Human Actions
                </strong>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {esc.availableHumanActions.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleAction(esc.id, act)}
                      className="p-3 rounded-sm bg-[#141416] border border-[#FF5252]/40 hover:border-[#FF5252] active:scale-[0.98] transition-all text-left touch-manipulation flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-mono font-medium text-[#FF5252]">
                        {act.label}
                      </span>
                      <span className="text-[10px] text-[#7A7A7A] mt-1">
                        {act.impactDescription}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
