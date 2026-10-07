import React from 'react';
import { SavedArchitecture } from '../types/architecture';
import { Clock, Trash2, ArrowUpRight, X, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedArchitectures: SavedArchitecture[];
  onSelect: (arch: SavedArchitecture) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  savedArchitectures,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Architecture History</h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {savedArchitectures.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedArchitectures.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No architectures generated yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your generated system architectures will be automatically saved here.
              </p>
            </div>
          ) : (
            savedArchitectures.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 rounded-xl p-3.5 transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {item.result.recommendedArchitectureStyle.name}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1 group-hover:text-indigo-950">
                    {item.result.projectName}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.result.executiveSummary}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <span>Load Architecture</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete saved architecture"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedArchitectures.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClearAll}
              className="w-full py-2 text-xs text-slate-600 hover:text-rose-600 font-medium transition-colors"
            >
              Clear All Architecture History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
