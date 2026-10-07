import React, { useState } from 'react';
import {
  ArchitectureReviewResult,
  ArchitectureReviewFinding,
  ReviewSeverity,
  ArchitectureResult,
  ArchitectureInput,
  ArchitectureChangeHistoryItem,
} from '../../types/architecture';
import {
  Search,
  RotateCcw,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Activity,
  Server,
  DollarSign,
  Cpu,
  Sparkles,
  Loader2,
  Filter,
  Wrench,
  History,
} from 'lucide-react';

interface Props {
  review: ArchitectureReviewResult | null;
  isLoading: boolean;
  error: string | null;
  onRunReview: () => void;
  result: ArchitectureResult;
  input: ArchitectureInput;
  onProposeFix: (finding: ArchitectureReviewFinding) => void;
  appliedFixNotification?: string | null;
  changeHistory?: ArchitectureChangeHistoryItem[];
  onOpenChangeHistory?: () => void;
  reviewedArchitectureVersion?: number | null;
}

const SEVERITY_CONFIG: Record<
  ReviewSeverity,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
  }
> = {
  CRITICAL: {
    label: 'Critical',
    icon: AlertOctagon,
    bg: 'bg-rose-50/50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  HIGH: {
    label: 'High',
    icon: AlertTriangle,
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  MEDIUM: {
    label: 'Medium',
    icon: AlertCircle,
    bg: 'bg-yellow-50/40',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  LOW: {
    label: 'Low',
    icon: Info,
    bg: 'bg-slate-50/50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  GOOD: {
    label: 'Good Practice',
    icon: CheckCircle2,
    bg: 'bg-emerald-50/40',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

export const ArchitectureReviewTab: React.FC<Props> = ({
  review,
  isLoading,
  error,
  onRunReview,
  result,
  input,
  onProposeFix,
  appliedFixNotification,
  changeHistory,
  onOpenChangeHistory,
  reviewedArchitectureVersion,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Senior Architect Peer Review in Progress...
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Evaluating single points of failure, concurrency bottlenecks, database partitioning,
            caching invalidation pitfalls, security vectors, and cloud budget feasibility.
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-indigo-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auditing {result.projectName} (Architecture v{result.version || 1}) against {input.cloudProvider} production benchmarks</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Architecture Review Error</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={onRunReview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          Try Review Again
        </button>
      </div>
    );
  }

  // Not Reviewed Yet (or Invalidated after Apply Fix) State
  if (!review) {
    return (
      <div className="space-y-6">
        {appliedFixNotification && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {appliedFixNotification}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Previous review invalidated. Ready for fresh evaluation of Architecture v{result.version || 1} against system requirements.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRunReview}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-run Architecture Review</span>
              </button>
              {onOpenChangeHistory && (
                <button
                  onClick={onOpenChangeHistory}
                  className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Audit Trail {changeHistory && changeHistory.length > 0 ? `(${changeHistory.length})` : ''}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <Search className="w-7 h-7" />
          </div>
          <div className="max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-mono text-slate-700 font-semibold mb-2">
              <span>Ready for Analysis: Architecture v{result.version || 1}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Adversarial Senior Architect Review
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Run an in-depth, multi-dimensional peer review of <span className="font-semibold text-slate-700">{result.projectName}</span> across scalability, single points of failure, network hops, caching strategy, security controls, and cloud costs.
            </p>
          </div>
          <div>
            <button
              onClick={onRunReview}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Review Architecture v{result.version || 1}</span>
            </button>
          </div>
          <div className="pt-2 text-[11px] text-slate-400">
            Advisory assessment based on {input.expectedUsers} users and {input.availability} SLA.
          </div>
        </div>
      </div>
    );
  }

  // Filter findings
  const filteredFindings = review.findings.filter((f) => {
    if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    return true;
  });

  const uniqueCategories = Array.from(new Set(review.findings.map((f) => f.category)));

  return (
    <div className="space-y-6">
      {/* Success Notification Banner after applying architectural fix */}
      {appliedFixNotification && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Architecture updated successfully.
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Surgical fix applied to the architecture. System topology, services, databases, and APIs have been synchronized.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRunReview}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Re-run architecture review on the updated architecture"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 Re-run Architecture Review</span>
            </button>
            {onOpenChangeHistory && (
              <button
                onClick={onOpenChangeHistory}
                className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-emerald-700" />
                <span>Change History {changeHistory && changeHistory.length > 0 ? `(${changeHistory.length})` : ''}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Header Card: Overall Health Score & Re-run Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                AI Architecture Review
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Audited: Architecture v{reviewedArchitectureVersion || result.version || 1}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(review.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Architecture Health Assessment
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {review.executiveReviewSummary}
            </p>
          </div>

          {/* Overall Health Score & Re-run Button */}
          <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <span className="text-xl font-black text-indigo-700 leading-none block font-mono">
                    {review.overallHealthScore}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    / 100
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Health Score
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  Architecture Health: {review.overallHealthScore}/100
                </span>
                <span className="text-[11px] text-slate-500">
                  {review.overallHealthScore >= 85
                    ? 'Robust & Resilient'
                    : review.overallHealthScore >= 70
                    ? 'Acceptable with Risks'
                    : 'Requires Remediation'}
                </span>
              </div>
            </div>

            <button
              onClick={onRunReview}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Re-run architecture review"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Review</span>
            </button>
          </div>
        </div>

        {/* Category Scores Grid */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400 mb-3">
            Category Breakdown Scores
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Scalability', score: review.categoryScores.scalability, icon: TrendingUp },
              { label: 'Availability', score: review.categoryScores.availability, icon: Server },
              { label: 'Performance', score: review.categoryScores.performance, icon: Activity },
              { label: 'Security', score: review.categoryScores.security, icon: ShieldCheck },
              { label: 'Reliability', score: review.categoryScores.reliability, icon: Cpu },
              { label: 'Cost Efficiency', score: review.categoryScores.costEfficiency, icon: DollarSign },
            ].map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold truncate">
                      {cat.label}
                    </span>
                    <CatIcon className="w-3 h-3 text-indigo-500 shrink-0" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-slate-900 leading-none">
                      {cat.score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        cat.score >= 85
                          ? 'bg-emerald-500'
                          : cat.score >= 70
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issue Summary Counts */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase mr-1">
              Findings Summary:
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{review.summaryCounts.critical} Critical</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{review.summaryCounts.high} High</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-800 font-semibold border border-yellow-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{review.summaryCounts.medium} Medium</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              <Info className="w-3.5 h-3.5" />
              <span>{review.summaryCounts.low} Low</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{review.summaryCounts.good} Good Practices</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            Advisory Review Only · Does not modify architecture automatically
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Findings */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase mr-1">
            Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'GOOD'].map((sev) => {
            const isSelected = selectedSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sev === 'ALL' ? 'All Severities' : sev}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        {uniqueCategories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              <option value="ALL">All Categories ({review.findings.length})</option>
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Findings Cards List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
            No findings match the selected filters.
          </div>
        ) : (
          filteredFindings.map((finding, idx) => {
            const config = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.MEDIUM;
            const SevIcon = config.icon;

            return (
              <div
                key={idx}
                className={`bg-white border ${config.border} rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:shadow-sm`}
              >
                {/* Header: Title, Category, Severity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 ${config.badgeBg}`}
                    >
                      <SevIcon className="w-3 h-3" />
                      <span>{finding.severity}</span>
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {finding.title}
                    </h4>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md self-start sm:self-auto shrink-0 font-medium">
                    {finding.category}
                  </span>
                </div>

                {/* Problem Description */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                    Identified Issue / Architectural Finding
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {finding.problem}
                  </p>
                </div>

                {/* Why It Matters */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                    Why It Matters (Impact & Consequences)
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.why_it_matters}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 block">
                    Architectural Recommendation
                  </span>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    {finding.recommendation}
                  </p>
                </div>

                {/* Propose Fix Action Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-[11px] text-slate-400">
                    {finding.severity === 'GOOD'
                      ? 'Architectural strength verified'
                      : 'Remediate this finding with AI architect'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onProposeFix(finding)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                    title={`Propose surgical architecture fix for: ${finding.title}`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🔧 Propose Fix</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mandatory Disclaimer Footer */}
      <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          Advisory AI Architecture Assessment Notice
        </p>
        <p className="text-[11px] leading-relaxed max-w-2xl mx-auto">
          The Architecture Health Score and peer review findings are AI-generated advisory assessments based on provided system constraints. This review does not constitute an industry-standard certification or official cloud vendor compliance audit.
        </p>
      </div>
    </div>
  );
};
