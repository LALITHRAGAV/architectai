import React from 'react';
import { ArchitectureChangeHistoryItem } from '../types/architecture';
import { History, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: ArchitectureChangeHistoryItem[];
}

export const ArchitectureChangeHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  history,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold block">
                Audit Trail
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                ARCHITECTURE CHANGE HISTORY
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No architectural fixes applied yet.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900">{item.findingTitle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.appliedAtFormatted}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Applied Fix
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {item.proposedFix}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Reason for Change
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {item.reasonForChange}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Components Changed
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.componentsChanged.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
