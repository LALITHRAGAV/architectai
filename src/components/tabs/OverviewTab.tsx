import React from 'react';
import { ArchitectureResult, ArchitectureInput } from '../../types/architecture';
import {
  Cloud,
  Cpu,
  CheckCircle2,
  FileText,
  ArrowRight,
  Download,
} from 'lucide-react';

interface Props {
  result: ArchitectureResult;
  input: ArchitectureInput;
  onNavigateTab: (tabId: string) => void;
  onRunReview: () => void;
  onOpenExportReport?: () => void;
}

export const OverviewTab: React.FC<Props> = ({
  result,
  input,
  onNavigateTab,
  onRunReview,
  onOpenExportReport,
}) => {
  // Calculate a deterministic architectural quality assessment score based on specs
  const calculateScore = () => {
    let score = 88;
    if (result.nonFunctionalRequirements?.length >= 4) score += 3;
    if (result.securityConsiderations?.length >= 4) score += 3;
    if (result.databaseRecommendation?.backupAndDisasterRecovery?.rpo) score += 2;
    if (result.tradeoffs?.length >= 2) score += 2;
    return Math.min(score, 98);
  };

  const archScore = calculateScore();

  return (
    <div className="space-y-6">
      {/* Hero Overview Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-2xs">
                Architecture v{result.version || 1}
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                System Overview
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">
                {result.recommendedArchitectureStyle.name}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {result.projectName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {result.executiveSummary}
            </p>
          </div>

          {/* Prominent Actions & Score Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 self-start lg:self-auto">
            {onOpenExportReport && (
              <button
                onClick={onOpenExportReport}
                className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                title="Export comprehensive 13-section Architecture Report (Markdown & Text)"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export Report</span>
              </button>
            )}

            <button
              onClick={onRunReview}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
              title="Launch Senior Architect Peer Review"
            >
              <span>🔍 Review Architecture</span>
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-2xs">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white border-2 border-indigo-500 shadow-xs">
                <div className="text-center">
                  <span className="text-lg font-black text-indigo-700 leading-none block font-mono">
                    {archScore}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    / 100
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Design Rating
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  Production-Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Architectural Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Architecture Style
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate" title={result.recommendedArchitectureStyle.name}>
              {result.recommendedArchitectureStyle.name}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Cloud Target
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate" title={input.cloudProvider}>
              {input.cloudProvider}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Expected Scale
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate" title={input.expectedUsers}>
              {input.expectedUsers}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Availability Target
            </span>
            <span className="text-xs font-bold font-mono text-indigo-700 block">
              {input.availability.split(' ')[0]} SLA
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Complexity
            </span>
            <span className="text-xs font-bold text-slate-900 block">
              {result.estimatedComplexity}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Est. Monthly Budget
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 block truncate">
              {result.estimatedMonthlyCostRange}
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Architectural Invariants & ADR Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Architectural Style Justification */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Architecture Style Rationale
            </h3>
            <span className="text-xs font-mono font-medium text-slate-500">
              {result.recommendedArchitectureStyle.name}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {result.recommendedArchitectureStyle.rationale}
          </p>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Core Architectural Pillars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.recommendedArchitectureStyle.keyCharacteristics.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs text-slate-700 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Architecture Decision Record (ADR) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Architecture Decision (ADR-001)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              {result.adrSummary.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                Context & Drivers
              </span>
              <p className="text-slate-600 line-clamp-3 leading-relaxed">
                {result.adrSummary.context}
              </p>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-mono text-indigo-700 uppercase font-bold block mb-1">
                Decision Adopted
              </span>
              <p className="text-indigo-950 font-medium leading-relaxed">
                {result.adrSummary.decision}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('architecture')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>View Full Visual Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
