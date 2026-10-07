import React, { useState, useMemo } from 'react';
import {
  ArchitectureInput,
  ArchitectureResult,
  ArchitectureComparisonResult,
  ComparisonOptionData,
  ArchitectureDiagram,
  DiagramNode,
  DiagramEdge,
} from '../../types/architecture';
import { VisualArchitectureDiagram } from '../VisualArchitectureDiagram';
import { apiRecommendComparisonStyles } from '../../services/architectureApi';
import {
  Scale,
  GitCompare,
  ArrowRightLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  TrendingUp,
  Server,
  DollarSign,
  Shield,
  Activity,
  Cpu,
  Code,
  Check,
  X,
  Network,
} from 'lucide-react';

interface Props {
  input: ArchitectureInput;
  currentResult: ArchitectureResult;
  comparison: ArchitectureComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  onGenerateComparison: (optionAStyle: string, optionBStyle: string) => void;
  onApplyOption: (selectedOption: ComparisonOptionData, otherOption: ComparisonOptionData) => void;
}

const COMMON_STYLES = [
  'Modular Monolith',
  'Microservices',
  'Event-Driven',
  'Serverless',
  'Monolithic',
  'Hybrid',
];

interface MetricItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  data: {
    optionA: number;
    optionB: number;
    reason: string;
  };
}

// Helper to construct a dynamic ArchitectureResult for VisualArchitectureDiagram
function buildDynamicResultForOption(
  option: ComparisonOptionData,
  input: ArchitectureInput,
  baseResult: ArchitectureResult
): ArchitectureResult {
  const serviceList = option.services?.length
    ? option.services
    : ['Core Domain Service', 'API Gateway Service', 'Worker Service'];
  const dbList = option.databases?.length
    ? option.databases
    : ['Primary PostgreSQL Store', 'Redis Cache'];

  const nodes: DiagramNode[] = [
    {
      id: 'node-users',
      name: 'Client Applications',
      category: 'Users',
      technologies: ['Web Browsers', 'Mobile Clients'],
      role: 'Client requests & interactive user workflows',
      tier: 1,
    },
    {
      id: 'node-cdn',
      name: 'Edge CDN & DDoS Shield',
      category: 'CDN',
      technologies: [input.cloudProvider === 'AWS' ? 'CloudFront' : 'Cloudflare Edge'],
      role: 'Global content caching, SSL termination & rate limiting',
      tier: 2,
    },
    {
      id: 'node-gateway',
      name: option.architectureStyle.includes('Monolith') ? 'Reverse Proxy & Load Balancer' : 'API Gateway & Router',
      category: 'API Gateway',
      technologies: ['Nginx / Envoy Gateway'],
      role: 'Traffic routing, JWT auth verification & connection pooling',
      tier: 3,
    },
    ...serviceList.slice(0, 4).map((s, idx) => ({
      id: `node-service-${idx}`,
      name: s,
      category: 'Application Services' as const,
      technologies: [option.architectureStyle],
      role: `Domain processing for ${s}`,
      tier: 4,
    })),
    ...dbList.slice(0, 3).map((db, idx) => ({
      id: `node-db-${idx}`,
      name: db,
      category: idx === 0 ? ('Databases' as const) : ('Cache' as const),
      technologies: [db],
      role: `State persistence & query acceleration for ${db}`,
      tier: 5,
    })),
  ];

  const edges: DiagramEdge[] = [
    {
      id: 'edge-1',
      source: 'node-users',
      target: 'node-cdn',
      label: 'HTTPS / TLS 1.3',
      protocol: 'HTTPS',
      flowType: 'sync',
    },
    {
      id: 'edge-2',
      source: 'node-cdn',
      target: 'node-gateway',
      label: 'Edge Proxy',
      protocol: 'TCP / HTTP/2',
      flowType: 'sync',
    },
    ...serviceList.slice(0, 4).map((_, idx) => ({
      id: `edge-svc-${idx}`,
      source: 'node-gateway',
      target: `node-service-${idx}`,
      label: option.architectureStyle.includes('Microservices') ? 'gRPC / HTTP' : 'In-process Call',
      protocol: option.architectureStyle.includes('Microservices') ? 'gRPC' : 'Direct',
      flowType: 'sync' as const,
    })),
    ...serviceList.slice(0, 4).flatMap((_, sIdx) =>
      dbList.slice(0, 2).map((_, dbIdx) => ({
        id: `edge-db-${sIdx}-${dbIdx}`,
        source: `node-service-${sIdx}`,
        target: `node-db-${dbIdx}`,
        label: dbIdx === 0 ? 'ACID Transaction' : 'Read/Write Cache',
        protocol: 'TCP / Wire',
        flowType: 'sync' as const,
      }))
    ),
  ];

  const diagram: ArchitectureDiagram = {
    title: `${option.architectureStyle} Architecture Topology`,
    summary: option.summary,
    nodes,
    edges,
  };

  return {
    ...baseResult,
    recommendedArchitectureStyle: {
      name: option.architectureStyle,
      rationale: option.summary,
      keyCharacteristics: option.advantages,
      alternativeStylesConsidered: [],
    },
    diagram,
    mermaidDiagram: `graph TD\n  Client[Clients] --> CDN[Edge CDN]\n  CDN --> GW[Gateway / LB]\n  GW --> App[${option.architectureStyle}]\n  App --> DB[Datastores]`,
  };
}

export const CompareTab: React.FC<Props> = ({
  input,
  currentResult,
  comparison,
  isLoading,
  error,
  onGenerateComparison,
  onApplyOption,
}) => {
  const [styleA, setStyleA] = useState<string>(
    currentResult?.recommendedArchitectureStyle?.name || 'Modular Monolith'
  );
  const [styleB, setStyleB] = useState<string>('Microservices');
  const [isRecommendingStyles, setIsRecommendingStyles] = useState(false);
  const [recommendedStylesNote, setRecommendedStylesNote] = useState<string | null>(null);

  // Preferred option state
  const [preferredOptionKey, setPreferredOptionKey] = useState<'A' | 'B' | null>(null);
  const [preferredBannerMessage, setPreferredBannerMessage] = useState<string | null>(null);

  // Confirmation modal state
  const [showApplyConfirmModal, setShowApplyConfirmModal] = useState(false);
  const [diagramViewOption, setDiagramViewOption] = useState<'A' | 'B'>('A');

  const handleSwap = () => {
    const temp = styleA;
    setStyleA(styleB);
    setStyleB(temp);
  };

  const handleRecommendStyles = async () => {
    setIsRecommendingStyles(true);
    setRecommendedStylesNote(null);
    try {
      const data = await apiRecommendComparisonStyles(input);
      if (data.optionA) setStyleA(data.optionA);
      if (data.optionB) setStyleB(data.optionB);
      if (data.reasoning) setRecommendedStylesNote(data.reasoning);
    } catch (e) {
      console.error('Failed to get style recommendations', e);
    } finally {
      setIsRecommendingStyles(false);
    }
  };

  const handleSelectPreferred = (key: 'A' | 'B') => {
    setPreferredOptionKey(key);
    const styleName =
      key === 'A'
        ? comparison?.optionA.architectureStyle || comparison?.optionA.name
        : comparison?.optionB.architectureStyle || comparison?.optionB.name;
    setPreferredBannerMessage(`Option ${key} (${styleName}) selected as preferred architecture.`);
  };

  const handleConfirmApply = () => {
    if (!comparison || !preferredOptionKey) return;
    const selected = preferredOptionKey === 'A' ? comparison.optionA : comparison.optionB;
    const other = preferredOptionKey === 'A' ? comparison.optionB : comparison.optionA;
    setShowApplyConfirmModal(false);
    onApplyOption(selected, other);
  };

  // Convert comparison metrics object to structured array for scorecard table
  const metricsList = useMemo<MetricItem[]>(() => {
    if (!comparison?.comparison) return [];
    const c = comparison.comparison;
    return [
      { key: 'scalability', label: 'Scalability', icon: TrendingUp, data: c.scalability },
      { key: 'availability', label: 'Availability', icon: Server, data: c.availability },
      { key: 'performance', label: 'Performance', icon: Activity, data: c.performance },
      { key: 'security', label: 'Security', icon: Shield, data: c.security },
      {
        key: 'developmentComplexity',
        label: 'Development Simplicity',
        icon: Code,
        data: c.developmentComplexity,
      },
      {
        key: 'operationalComplexity',
        label: 'Operational Simplicity',
        icon: Cpu,
        data: c.operationalComplexity,
      },
      { key: 'maintainability', label: 'Maintainability', icon: Layers, data: c.maintainability },
      { key: 'cost', label: 'Cost Efficiency', icon: DollarSign, data: c.cost },
    ].filter((m) => Boolean(m.data));
  }, [comparison]);

  // Build dynamic diagrams
  const diagramResultA = useMemo(() => {
    if (!comparison?.optionA) return currentResult;
    return buildDynamicResultForOption(comparison.optionA, input, currentResult);
  }, [comparison?.optionA, input, currentResult]);

  const diagramResultB = useMemo(() => {
    if (!comparison?.optionB) return currentResult;
    return buildDynamicResultForOption(comparison.optionB, input, currentResult);
  }, [comparison?.optionB, input, currentResult]);

  return (
    <div className="space-y-7">
      {/* Top Configuration Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Decision Support
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">
                Multi-Approach Trade-off Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Architecture Comparison
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mt-0.5">
              Compare two distinct architectural paradigms for the exact same system requirements, scale (<span className="font-semibold text-slate-800">{input.expectedUsers}</span>), budget tier (<span className="font-semibold text-slate-800">{input.budget}</span>), and SLA target (<span className="font-semibold text-slate-800">{input.availability}</span>).
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              onClick={handleRecommendStyles}
              disabled={isRecommendingStyles || isLoading}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Let Gemini suggest 2 contrasting architecture styles for your requirements"
            >
              {isRecommendingStyles ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>✨ Recommend 2 Styles</span>
            </button>
          </div>
        </div>

        {recommendedStylesNote && (
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-900 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-indigo-950 mr-1.5">Architect Pair Suggestion:</span>
              <span>{recommendedStylesNote}</span>
            </div>
          </div>
        )}

        {/* Option Selection Controls: Option A VS Option B */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Option A Selector */}
          <div className="md:col-span-5 bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Option A
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Approach 1</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Architecture Style A
              </label>
              <input
                type="text"
                value={styleA}
                onChange={(e) => setStyleA(e.target.value)}
                placeholder="e.g. Modular Monolith"
                list="common-styles-list"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_STYLES.slice(0, 3).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStyleA(st)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    styleA === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button Center */}
          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              onClick={handleSwap}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Swap Option A and Option B"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Option B Selector */}
          <div className="md:col-span-5 bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Option B
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Approach 2</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Architecture Style B
              </label>
              <input
                type="text"
                value={styleB}
                onChange={(e) => setStyleB(e.target.value)}
                placeholder="e.g. Microservices"
                list="common-styles-list"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_STYLES.slice(1, 4).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStyleB(st)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    styleB === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <datalist id="common-styles-list">
            {COMMON_STYLES.map((st) => (
              <option key={st} value={st} />
            ))}
          </datalist>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Synthesizes both architecture options, 8-factor scorecards, trade-offs, and an architect's recommendation.
          </div>
          <button
            onClick={() => onGenerateComparison(styleA, styleB)}
            disabled={isLoading || !styleA.trim() || !styleB.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Comparative Architectures...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Generate Comparison</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State Banner */}
      {isLoading && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Conducting Dual Architectural Synthesis...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Evaluating <span className="font-semibold text-slate-700">{styleA}</span> versus <span className="font-semibold text-slate-700">{styleB}</span> across scale, failure modes, operational cost profiles, and team capacity.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comparing against {input.cloudProvider} benchmarks</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && !isLoading && (
        <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Comparison Generation Error</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => onGenerateComparison(styleA, styleB)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Comparison Results Content */}
      {comparison && !isLoading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Preferred Architecture Selection Banner */}
          {preferredBannerMessage && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {preferredBannerMessage}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Click "Apply to Current Architecture" below to promote this design into your active specification while preserving your original requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowApplyConfirmModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Current Architecture</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Side-by-Side Architecture Summaries */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Side-by-Side Architecture Summaries
                </h3>
                <p className="text-xs text-slate-500">
                  Direct breakdown of services, datastores, security, and scalability.
                </p>
              </div>

              {/* Action Buttons: Use Option A / Use Option B */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleSelectPreferred('A')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    preferredOptionKey === 'A'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preferredOptionKey === 'A' ? '✓ Preferred (A)' : 'Use Option A'}
                </button>
                <button
                  onClick={() => handleSelectPreferred('B')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    preferredOptionKey === 'B'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preferredOptionKey === 'B' ? '✓ Preferred (B)' : 'Use Option B'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A Summary Card */}
              <div
                className={`bg-white rounded-2xl p-6 shadow-xs border transition-all space-y-4 ${
                  preferredOptionKey === 'A'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Option A
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {comparison.optionA.architectureStyle || comparison.optionA.name}
                    </h4>
                  </div>
                  {comparison.recommendation.selectedOption?.toLowerCase().includes('a') ||
                  comparison.recommendation.selectedOption?.toLowerCase().includes(comparison.optionA.architectureStyle?.toLowerCase()) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3" />
                      Architect Pick
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  {comparison.optionA.summary}
                </p>

                {/* Key Attributes */}
                <div className="space-y-3 text-xs">
                  {/* Components */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Components
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionA.components?.map((c, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/80">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Services
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionA.services?.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded text-[11px] font-medium border border-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Databases */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Databases & Caches
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionA.databases?.map((db, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-100">
                          {db}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security & Scalability */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                        Security Approach
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {comparison.optionA.security?.join(', ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                        Scalability Approach
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {comparison.optionA.scalability?.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Cost & Complexity */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                        Cost Profile
                      </span>
                      <span className="font-semibold text-slate-800">{comparison.optionA.cost}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                        Complexity
                      </span>
                      <span className="font-semibold text-slate-800">{comparison.optionA.complexity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPreferred('A')}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      preferredOptionKey === 'A'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {preferredOptionKey === 'A' ? '✓ Selected as Preferred Architecture' : 'Use Option A'}
                  </button>
                </div>
              </div>

              {/* Option B Summary Card */}
              <div
                className={`bg-white rounded-2xl p-6 shadow-xs border transition-all space-y-4 ${
                  preferredOptionKey === 'B'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                      Option B
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {comparison.optionB.architectureStyle || comparison.optionB.name}
                    </h4>
                  </div>
                  {comparison.recommendation.selectedOption?.toLowerCase().includes('b') ||
                  comparison.recommendation.selectedOption?.toLowerCase().includes(comparison.optionB.architectureStyle?.toLowerCase()) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3" />
                      Architect Pick
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  {comparison.optionB.summary}
                </p>

                {/* Key Attributes */}
                <div className="space-y-3 text-xs">
                  {/* Components */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Components
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionB.components?.map((c, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/80">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Services
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionB.services?.map((s, i) => (
                        <span key={i} className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[11px] font-medium border border-purple-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Databases */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Databases & Caches
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.optionB.databases?.map((db, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-100">
                          {db}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security & Scalability */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                        Security Approach
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {comparison.optionB.security?.join(', ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                        Scalability Approach
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {comparison.optionB.scalability?.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Cost & Complexity */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                        Cost Profile
                      </span>
                      <span className="font-semibold text-slate-800">{comparison.optionB.cost}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                        Complexity
                      </span>
                      <span className="font-semibold text-slate-800">{comparison.optionB.complexity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPreferred('B')}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      preferredOptionKey === 'B'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {preferredOptionKey === 'B' ? '✓ Selected as Preferred Architecture' : 'Use Option B'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Comparison Scorecard Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  Comparison Scorecard
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side criteria scores (1-10) with engineering rationale.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 self-start sm:self-auto">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>Option A: {comparison.optionA.architectureStyle || 'Option A'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  <span>Option B: {comparison.optionB.architectureStyle || 'Option B'}</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 font-bold w-1/5">Criterion</th>
                    <th className="py-3 px-3 font-bold w-1/6">
                      Option A ({comparison.optionA.architectureStyle || 'Option A'})
                    </th>
                    <th className="py-3 px-3 font-bold w-1/6">
                      Option B ({comparison.optionB.architectureStyle || 'Option B'})
                    </th>
                    <th className="py-3 px-3 font-bold w-5/12">Architectural Assessment Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metricsList.map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <tr key={metric.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900 align-top">
                          <div className="flex items-center gap-1.5">
                            <MetricIcon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{metric.label}</span>
                          </div>
                        </td>

                        {/* Option A Score */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black font-mono text-indigo-700">
                              {metric.data.optionA}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">/10</span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.min(metric.data.optionA * 10, 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* Option B Score */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black font-mono text-purple-700">
                              {metric.data.optionB}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">/10</span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-purple-600 h-full rounded-full"
                              style={{ width: `${Math.min(metric.data.optionB * 10, 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* Comparative Reason */}
                        <td className="py-3.5 px-3 align-top text-[11px] text-slate-700 leading-relaxed bg-slate-50/40 rounded-lg">
                          {metric.data.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Assessment Notice: Scores are AI-generated comparative evaluations based on provided system requirements.
            </div>
          </div>

          {/* 3. Detailed Trade-offs Analysis */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                Detailed Trade-off Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Advantages, disadvantages, and situational boundary guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A Trade-offs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    Option A
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {comparison.optionA.architectureStyle || comparison.optionA.name} Trade-offs
                  </h4>
                </div>

                {/* Advantages */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Advantages
                  </span>
                  <ul className="space-y-1.5 text-xs bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-slate-800">
                    {comparison.optionA.advantages?.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disadvantages */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-rose-700 block mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Disadvantages
                  </span>
                  <ul className="space-y-1.5 text-xs bg-rose-50/40 p-3 rounded-xl border border-rose-100 text-slate-800">
                    {comparison.optionA.disadvantages?.map((dis, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold mt-0.5">•</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Choose Option A */}
                {comparison.recommendation?.whenToChooseOptionA && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 block mb-1">
                      When to Choose Option A
                    </span>
                    <p className="text-xs text-slate-700 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
                      {comparison.recommendation.whenToChooseOptionA}
                    </p>
                  </div>
                )}
              </div>

              {/* Option B Trade-offs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                    Option B
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {comparison.optionB.architectureStyle || comparison.optionB.name} Trade-offs
                  </h4>
                </div>

                {/* Advantages */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Advantages
                  </span>
                  <ul className="space-y-1.5 text-xs bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-slate-800">
                    {comparison.optionB.advantages?.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disadvantages */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-rose-700 block mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Disadvantages
                  </span>
                  <ul className="space-y-1.5 text-xs bg-rose-50/40 p-3 rounded-xl border border-rose-100 text-slate-800">
                    {comparison.optionB.disadvantages?.map((dis, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold mt-0.5">•</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Choose Option B */}
                {comparison.recommendation?.whenToChooseOptionB && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-700 block mb-1">
                      When to Choose Option B
                    </span>
                    <p className="text-xs text-slate-700 bg-purple-50/40 p-2.5 rounded-lg border border-purple-100">
                      {comparison.recommendation.whenToChooseOptionB}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Architect's Recommendation */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold block">
                    Definitive Architecture Verdict
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Architect's Recommendation: {comparison.recommendation.selectedOption}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  const sel = comparison.recommendation.selectedOption?.toLowerCase();
                  if (sel?.includes('b') || sel?.includes(comparison.optionB.architectureStyle?.toLowerCase())) {
                    handleSelectPreferred('B');
                  } else {
                    handleSelectPreferred('A');
                  }
                }}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Select Recommended Architecture</span>
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                Deciding Rationale & Context
              </span>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {comparison.recommendation.reason}
              </p>
            </div>

            {comparison.recommendation.tradeoffs?.length > 0 && (
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 text-xs text-slate-300 leading-relaxed space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Key Architectural Trade-offs Considered
                </span>
                <ul className="space-y-1">
                  {comparison.recommendation.tradeoffs.map((to, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 5. Dynamic Architecture Visualizations for Both Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600" />
                  Dynamic Architecture Diagrams
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect the physical topologies, component connections, and service flows for Option A vs Option B.
                </p>
              </div>

              {/* View Switcher: Diagram A vs Diagram B */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setDiagramViewOption('A')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    diagramViewOption === 'A'
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Option A: {comparison.optionA.architectureStyle || 'Option A'}
                </button>
                <button
                  onClick={() => setDiagramViewOption('B')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    diagramViewOption === 'B'
                      ? 'bg-white text-purple-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Option B: {comparison.optionB.architectureStyle || 'Option B'}
                </button>
              </div>
            </div>

            {/* Diagram View Container */}
            <div>
              {diagramViewOption === 'A' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 font-semibold">
                      Viewing Option A: <span className="text-indigo-700">{comparison.optionA.architectureStyle || 'Option A'}</span>
                    </span>
                    <button
                      onClick={() => handleSelectPreferred('A')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Use Option A as Preferred
                    </button>
                  </div>
                  <VisualArchitectureDiagram result={diagramResultA} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 font-semibold">
                      Viewing Option B: <span className="text-purple-700">{comparison.optionB.architectureStyle || 'Option B'}</span>
                    </span>
                    <button
                      onClick={() => handleSelectPreferred('B')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Use Option B as Preferred
                    </button>
                  </div>
                  <VisualArchitectureDiagram result={diagramResultB} />
                </div>
              )}
            </div>
          </div>

          {/* 6. Bottom Adoption Controls Toolbar */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold block">
                Decision Application Action
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Ready to adopt a comparison architecture?
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an option to promote it into your active architecture specification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSelectPreferred('A')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preferredOptionKey === 'A'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                Use Option A ({comparison.optionA.architectureStyle || 'Option A'})
              </button>

              <button
                onClick={() => handleSelectPreferred('B')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preferredOptionKey === 'B'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                Use Option B ({comparison.optionB.architectureStyle || 'Option B'})
              </button>

              {preferredOptionKey && (
                <button
                  onClick={() => setShowApplyConfirmModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Current Architecture</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explicit User Approval Confirmation Modal */}
      {showApplyConfirmModal && comparison && preferredOptionKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                    Explicit Confirmation
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    APPLY ARCHITECTURE OPTION {preferredOptionKey}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowApplyConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="leading-relaxed">
                You are about to promote{' '}
                <strong className="text-slate-900">
                  Option {preferredOptionKey} (
                  {preferredOptionKey === 'A'
                    ? comparison.optionA.architectureStyle || comparison.optionA.name
                    : comparison.optionB.architectureStyle || comparison.optionB.name}
                  )
                </strong>{' '}
                as your active software architecture specification.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 block">The following will occur:</span>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Your original software requirements & scale are preserved.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Visual architecture diagram, services, datastores, and security will update to this paradigm.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>This strategic change will be recorded in Architecture Change History.</span>
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                You can immediately re-run an Architecture Review on the adopted design.
              </p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowApplyConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Apply Architecture</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
