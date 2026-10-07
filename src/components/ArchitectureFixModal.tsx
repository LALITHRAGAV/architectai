import React from 'react';
import { ArchitectureFixProposal } from '../types/architecture';
import {
  Wrench,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proposal: ArchitectureFixProposal | null;
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;
  onApplyFix: (proposal: ArchitectureFixProposal) => void;
}

export const ArchitectureFixModal: React.FC<Props> = ({
  isOpen,
  onClose,
  proposal,
  isLoading,
  isApplying,
  error,
  onApplyFix,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold block">
                Targeted Remediation
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                ARCHITECTURE FIX PROPOSAL
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Engineering Surgical Fix Proposal...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Senior architect is analyzing the finding, isolating affected subsystems, and calculating minimum necessary changes.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto" />
              <p className="text-xs text-rose-800 font-medium">{error}</p>
              <button
                onClick={onClose}
                className="text-xs px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : proposal ? (
            <div className="space-y-4 text-xs">
              {/* Finding Title Banner */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">{proposal.findingTitle}</span>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                  {proposal.category}
                </span>
              </div>

              {/* 1. Problem */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  Problem
                </span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                  {proposal.problem}
                </p>
              </div>

              {/* 2. CURRENT */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  CURRENT
                </span>
                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px]">
                  {proposal.currentArchitecture}
                </div>
              </div>

              {/* 3. PROPOSED CHANGE */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-600 block mb-1">
                  PROPOSED CHANGE
                </span>
                <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200/80 text-indigo-950 font-medium leading-relaxed shadow-2xs">
                  {proposal.proposedChange}
                </div>
              </div>

              {/* 4. WHY */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  WHY
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {proposal.whyThisFix}
                </p>
              </div>

              {/* 5. BENEFITS */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 block mb-1.5">
                  BENEFITS
                </span>
                <ul className="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  {proposal.expectedBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-800">
                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. TRADE-OFFS */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 block mb-1.5">
                  TRADE-OFFS
                </span>
                <ul className="space-y-1.5 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                  {proposal.newTradeoffs.map((tradeoff, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-800">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span>{tradeoff}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 7. AFFECTED COMPONENTS */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
                  AFFECTED COMPONENTS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proposal.componentsAffected.map((comp, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg"
                    >
                      • {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Implementation Impact note */}
              {proposal.implementationImpact && (
                <div className="pt-2 text-[11px] text-slate-500 italic">
                  Implementation Impact: {proposal.implementationImpact}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          {proposal && !isLoading && !error && (
            <button
              type="button"
              onClick={() => onApplyFix(proposal)}
              disabled={isApplying}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Surgical Fix...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Fix</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
