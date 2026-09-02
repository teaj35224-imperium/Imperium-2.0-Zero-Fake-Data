import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Filter, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const LogsSection: React.FC = () => {
  const { logs } = useImperium();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const categories = [
    'ALL',
    'NEXUS',
    'WORKERS',
    'MARKET DATA',
    'ALPACA',
    'RISK',
    'PORTFOLIO',
    'EXECUTION',
    'RECOVERY',
    'DECISIONS',
    'HUMAN ESCALATIONS'
  ];

  const filteredLogs = selectedCategory === 'ALL' 
    ? logs 
    : logs.filter(l => l.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="relative z-10 w-full px-4 mb-8 max-w-4xl mx-auto">
      <div className="p-3.5 rounded-sm bg-[#141416] border border-[#1F1F21]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <Terminal className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A]">
                System Telemetry & Audit Logs
              </h2>
              <span className="text-[10px] text-[#7A7A7A]">
                Plain-English supervision stream with expandable technical records
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-[#555]">
            {filteredLogs.length} EVENTS
          </span>
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 scrollbar-none no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xs text-[9px] font-mono whitespace-nowrap uppercase transition-colors touch-manipulation ${
                selectedCategory === cat
                  ? 'bg-[#C5A059] text-[#0D0D0E] font-medium'
                  : 'bg-[#0D0D0E] border border-[#1F1F21] text-[#7A7A7A] hover:text-[#E5E5E5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => toggleExpand(log.id)}
                className="p-2.5 rounded-sm bg-[#0D0D0E] border border-[#1F1F21] hover:border-[#2F2F31] cursor-pointer active:scale-[0.99] transition-all touch-manipulation"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-xs font-medium shrink-0 mt-0.5 ${
                      log.level === 'CRITICAL' ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30' :
                      log.level === 'WARNING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                      log.level === 'SUCCESS' ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' :
                      'bg-[#141416] text-[#9A9A9A] border border-[#1F1F21]'
                    }`}>
                      {log.category}
                    </span>

                    <span className="text-[11px] font-mono text-[#D1D1D1] leading-snug">
                      {log.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-[#555] text-[9px] font-mono">
                    <span>{log.timestamp}</span>
                    {log.technicalDetails && (
                      isExpanded ? <ChevronUp className="w-3 h-3 text-[#C5A059]" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </div>

                {/* Expandable Technical Details */}
                {isExpanded && log.technicalDetails && (
                  <div className="mt-2 p-2.5 rounded-sm bg-[#141416] border border-[#1F1F21] text-[10px] font-mono text-[#C5A059] leading-relaxed break-all">
                    <strong className="text-[#7A7A7A] block text-[9px] uppercase tracking-wider mb-0.5">TECHNICAL PAYLOAD:</strong>
                    {log.technicalDetails}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
