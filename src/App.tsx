/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArchitectureInput, ArchitectureResult, SavedArchitecture } from './types/architecture';
import { SAMPLE_TEMPLATES } from './data/sampleTemplates';
import { ArchitectureForm } from './components/ArchitectureForm';
import { ArchitectureTopology } from './components/ArchitectureTopology';
import { RequirementsView } from './components/RequirementsView';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ServicesTab } from './components/tabs/ServicesTab';
import { DatabaseTab } from './components/tabs/DatabaseTab';
import { ApisTab } from './components/tabs/ApisTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { ScalabilityTab } from './components/tabs/ScalabilityTab';
import { RisksTradeoffsTab } from './components/tabs/RisksTradeoffsTab';
import { ArchitectureReviewTab } from './components/tabs/ArchitectureReviewTab';
import { CompareTab } from './components/tabs/CompareTab';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ArchitectureFixModal } from './components/ArchitectureFixModal';
import { ArchitectureChangeHistoryModal } from './components/ArchitectureChangeHistoryModal';
import { ExportReportModal } from './components/ExportReportModal';
import { MainDashboard } from './components/MainDashboard';
import { AboutModal } from './components/AboutModal';
import {
  generateMarkdownReport,
  generateAdrReport,
  downloadFile,
} from './utils/exportUtils';
import {
  apiGenerateArchitecture,
  apiReviewArchitecture,
  apiProposeFix,
  apiApplyFix,
  apiCompareArchitectures,
} from './services/architectureApi';
import {
  Compass,
  CheckSquare,
  Network,
  Cpu,
  Database,
  Terminal,
  Shield,
  TrendingUp,
  AlertTriangle,
  Search,
  FileText,
  Download,
  Clock,
  Printer,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Copy,
  RotateCcw,
  History,
  CheckCircle2,
  GitCompare,
  Layers,
  BookOpen,
  PanelLeft,
  PanelRight,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ArchitectureReviewResult,
  ArchitectureReviewFinding,
  ArchitectureFixProposal,
  ArchitectureChangeHistoryItem,
  ArchitectureComparisonResult,
  ComparisonOptionData,
} from './types/architecture';

const STORAGE_KEY = 'mini_architect_saved_v1';

export type TabType =
  | 'overview'
  | 'requirements'
  | 'architecture'
  | 'services'
  | 'database'
  | 'apis'
  | 'security'
  | 'scalability'
  | 'risks_tradeoffs'
  | 'review'
  | 'compare';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'requirements', label: 'Requirements', icon: CheckSquare },
  { id: 'architecture', label: 'Architecture', icon: Network },
  { id: 'services', label: 'Services', icon: Cpu },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'apis', label: 'APIs', icon: Terminal },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'scalability', label: 'Scalability', icon: TrendingUp },
  { id: 'risks_tradeoffs', label: 'Risks & Trade-offs', icon: AlertTriangle },
  { id: 'review', label: 'Architecture Review', icon: Search },
  { id: 'compare', label: 'Compare', icon: GitCompare },
];

export default function App() {
  const [input, setInput] = useState<ArchitectureInput>(SAMPLE_TEMPLATES[0].input);
  const [architectureResult, setArchitectureResult] = useState<ArchitectureResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [savedArchitectures, setSavedArchitectures] = useState<SavedArchitecture[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Architecture Review State
  const [reviewResult, setReviewResult] = useState<ArchitectureReviewResult | null>(null);
  const [reviewedArchitectureVersion, setReviewedArchitectureVersion] = useState<number | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Architecture Fix State
  const [fixProposal, setFixProposal] = useState<ArchitectureFixProposal | null>(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [isProposingFix, setIsProposingFix] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [appliedFixNotification, setAppliedFixNotification] = useState<string | null>(null);
  const [isChangeHistoryModalOpen, setIsChangeHistoryModalOpen] = useState(false);

  // Architecture Comparison State
  const [comparisonResult, setComparisonResult] = useState<ArchitectureComparisonResult | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // Export Architecture Report Modal State
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);

  // Navigation & Workspace UI State
  const [currentNav, setCurrentNav] = useState<'workspace' | 'projects'>('workspace');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const loadingSteps = [
    'Analyzing software requirements and system domain logic...',
    'Decomposing domain services and bounded contexts...',
    'Selecting optimal datastores, partitioning, and caching tiers...',
    'Designing API gateway, protocols, and security defense-in-depth...',
    'Formulating scalability mechanisms and operational risk matrix...',
    'Synthesizing architectural trade-offs, ADR, and topology graph...',
  ];

  // Load saved architectures on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedArchitectures(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved architectures', e);
    }
  }, []);

  // Cycle loading steps
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const saveToHistory = (res: ArchitectureResult, currentInput: ArchitectureInput) => {
    const versionNum = res.version || 1;
    const entryId = `arch-${Date.now()}-v${versionNum}`;
    const newEntry: SavedArchitecture = {
      id: entryId,
      timestamp: Date.now(),
      input: { ...currentInput },
      result: JSON.parse(JSON.stringify(res)), // Deep-clone to preserve historical architecture integrity
    };

    setSavedArchitectures((prev) => {
      // Keep up to 30 historical project versions
      const updated = [newEntry, ...prev.filter((p) => p.id !== entryId)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const handleGenerate = async () => {
    if (!input.description.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiGenerateArchitecture(input);
      result.version = 1;
      delete (result as any).review;
      console.log('[ARCHITECTURE]');
      console.log('Current version: 1');

      setArchitectureResult(result);
      setReviewResult(null);
      setReviewedArchitectureVersion(null);
      saveToHistory(result, input);
      setIsFormCollapsed(true);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Architecture generation error:', err);
      setError(err.message || 'Failed to generate architecture. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunReview = async () => {
    if (!architectureResult || isReviewLoading) return;
    setIsReviewLoading(true);
    setReviewError(null);
    setActiveTab('review');

    const currentVersion = architectureResult.version || 1;
    console.log('[ARCHITECTURE]');
    console.log(`Current version: ${currentVersion}`);
    console.log('[REVIEW]');
    console.log(`Reviewing architecture version: ${currentVersion}`);
    console.log('[REVIEW]');
    console.log('Using current architecture: true');

    try {
      const reviewData = await apiReviewArchitecture(architectureResult, input);
      setReviewResult(reviewData);
      setReviewedArchitectureVersion(currentVersion);

      const archWithReview: ArchitectureResult = { ...architectureResult, review: reviewData };
      setArchitectureResult(archWithReview);
      saveToHistory(archWithReview, input);
    } catch (err: any) {
      console.error('Architecture review error:', err);
      setReviewError(err.message || 'Failed to review architecture. Please try again.');
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleProposeFix = async (finding: ArchitectureReviewFinding) => {
    if (!architectureResult || isProposingFix) return;
    setFixProposal(null);
    setFixError(null);
    setIsProposingFix(true);
    setIsFixModalOpen(true);

    try {
      const proposal = await apiProposeFix(finding, architectureResult, input);
      setFixProposal(proposal);
    } catch (err: any) {
      console.error('Propose fix error:', err);
      setFixError(err.message || 'Failed to propose fix. Please try again.');
    } finally {
      setIsProposingFix(false);
    }
  };

  const handleApplyFix = async (proposal: ArchitectureFixProposal) => {
    if (!architectureResult || isApplyingFix) return;
    setIsApplyingFix(true);
    setFixError(null);

    const currentVersion = architectureResult.version || 1;
    console.log('[ARCHITECTURE]');
    console.log(`Current version: ${currentVersion}`);
    console.log('[FIX]');
    console.log(`Applied finding: ${proposal.findingTitle}`);

    try {
      const updatedArchitecture = await apiApplyFix(proposal, architectureResult, input);
      const newVersion = updatedArchitecture.version || currentVersion + 1;
      updatedArchitecture.version = newVersion;

      console.log('[FIX]');
      console.log('Architecture updated: true');
      console.log('[FIX]');
      console.log(`New version: ${newVersion}`);

      const newHistoryItem: ArchitectureChangeHistoryItem = {
        id: `fix-${Date.now()}`,
        timestamp: Date.now(),
        findingTitle: proposal.findingTitle,
        proposedFix: proposal.proposedChange,
        componentsChanged: proposal.componentsAffected || [],
        reasonForChange: proposal.whyThisFix,
        appliedAtFormatted: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const previousHistory = architectureResult.changeHistory || [];
      const updatedHistory = [newHistoryItem, ...previousHistory];
      updatedArchitecture.changeHistory = updatedHistory;

      // Invalidate old review cache - user must receive fresh review when clicking Re-run
      delete updatedArchitecture.review;
      setReviewResult(null);
      setReviewedArchitectureVersion(null);

      // Update single authoritative architecture state
      setArchitectureResult(updatedArchitecture);
      saveToHistory(updatedArchitecture, input);
      setIsFixModalOpen(false);
      setAppliedFixNotification(`Architecture v${newVersion} updated successfully.`);
    } catch (err: any) {
      console.error('Apply fix error:', err);
      setFixError(err.message || 'Failed to apply architecture fix. Please try again.');
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleGenerateComparison = async (optionAStyle: string, optionBStyle: string) => {
    if (isComparisonLoading) return;
    setIsComparisonLoading(true);
    setComparisonError(null);

    try {
      const data = await apiCompareArchitectures(input, optionAStyle, optionBStyle);
      setComparisonResult(data);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setComparisonError(err.message || 'Failed to generate architecture comparison. Please try again.');
    } finally {
      setIsComparisonLoading(false);
    }
  };

  const handleApplyComparisonOption = (
    selectedOption: ComparisonOptionData,
    otherOption?: ComparisonOptionData
  ) => {
    if (!architectureResult) return;

    const styleName = selectedOption.architectureStyle || selectedOption.name;

    // Convert option services and components into ArchitectureResult structure
    const updatedServices = selectedOption.services?.length
      ? selectedOption.services.map((s, idx) => ({
          name: s,
          type: idx === 0 ? 'API Gateway Service' : idx === 1 ? 'Core Domain Service' : 'Worker / Background Service',
          responsibilities: [s],
          communicationProtocol: styleName.includes('Microservices') ? 'gRPC / HTTP/2' : 'Internal In-Process Calls',
          scalingTrigger: selectedOption.scalability?.[0] || 'CPU / Memory threshold > 70%',
          dependencies: idx > 0 ? [selectedOption.services[0]] : [],
        }))
      : architectureResult.services;

    const updatedComponents = selectedOption.components?.length
      ? selectedOption.components.map((c, idx) => ({
          id: `comp-${idx}`,
          name: c,
          layer: (idx === 0 ? 'Compute & Services' : idx === 1 ? 'Storage & Database' : 'API Gateway') as 'Client' | 'Edge & CDN' | 'API Gateway' | 'Compute & Services' | 'Messaging & Cache' | 'Storage & Database' | 'Observability & Security',
          purpose: `System component for ${c} within the ${styleName} architecture`,
          technologies: [c],
          connections: [],
        }))
      : architectureResult.architectureComponents;

    const updatedArchitecture: ArchitectureResult = {
      ...architectureResult,
      projectName: architectureResult.projectName,
      executiveSummary: selectedOption.summary || architectureResult.executiveSummary,
      recommendedArchitectureStyle: {
        name: styleName,
        rationale: selectedOption.summary || architectureResult.recommendedArchitectureStyle.rationale,
        keyCharacteristics: selectedOption.advantages || [],
        alternativeStylesConsidered: otherOption ? [otherOption.architectureStyle || otherOption.name] : [],
      },
      services: updatedServices,
      architectureComponents: updatedComponents,
      databaseRecommendation: {
        ...architectureResult.databaseRecommendation,
        primaryStore: {
          technology: selectedOption.databases?.[0] || architectureResult.databaseRecommendation.primaryStore.technology,
          type: 'Relational SQL',
          justification: 'Primary persistence store for active workload state',
          schemaStrategy: 'Partitioned Multi-AZ Cluster',
          shardingOrReplication: 'Active-Active Multi-AZ Replication',
        },
        cacheLayer: {
          technology: selectedOption.databases?.[1] || 'Redis Cluster',
          strategy: 'Read-Through / Write-Back Caching',
          ttlStrategy: 'Dynamic session and catalog TTLs',
        },
      },
      securityConsiderations: selectedOption.security?.length
        ? selectedOption.security.map((sec) => ({
            domain: 'Network & Access Security',
            riskIdentified: 'Unauthorized access and traffic spoofing',
            architecturalControl: sec,
            implementationDetail: `Enforced within ${styleName} boundaries`,
          }))
        : architectureResult.securityConsiderations,
      scalabilityConsiderations: selectedOption.scalability?.length
        ? selectedOption.scalability.map((sca) => ({
            aspect: 'Horizontal Scaling',
            technique: sca,
            bottleneckMitigation: sca,
            failoverMechanism: 'Multi-AZ auto-failover with health checking',
          }))
        : architectureResult.scalabilityConsiderations,
      mermaidDiagram: `graph TD\n  Client[Clients] --> Edge[Edge CDN & WAF]\n  Edge --> LB[Load Balancer / Gateway]\n  LB --> App[${styleName}]\n  App --> DB[${selectedOption.databases?.[0] || 'Primary Datastore'}]`,
    };

    // Preserve original requirements
    updatedArchitecture.functionalRequirements = architectureResult.functionalRequirements;
    updatedArchitecture.nonFunctionalRequirements = architectureResult.nonFunctionalRequirements;

    // Record change in Architecture Change History
    const newHistoryItem: ArchitectureChangeHistoryItem = {
      id: `compare-adopt-${Date.now()}`,
      timestamp: Date.now(),
      findingTitle: `Adopted Architecture Option: ${styleName}`,
      proposedFix: `Promoted ${styleName} as primary system architecture: ${selectedOption.summary.slice(0, 120)}...`,
      componentsChanged: selectedOption.components || [styleName],
      reasonForChange: `Strategic architecture decision from comparative evaluation against ${
        otherOption ? otherOption.architectureStyle || otherOption.name : 'alternatives'
      }.`,
      appliedAtFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const previousHistory = architectureResult.changeHistory || [];
    updatedArchitecture.changeHistory = [newHistoryItem, ...previousHistory];

    const currentVersion = architectureResult.version || 1;
    const newVersion = currentVersion + 1;
    updatedArchitecture.version = newVersion;
    console.log('[ARCHITECTURE]');
    console.log(`Current version: ${currentVersion}`);
    console.log(`[FIX] Applied finding: Adopted Architecture Option: ${styleName}`);
    console.log('[FIX] Architecture updated: true');
    console.log(`[FIX] New version: ${newVersion}`);

    delete updatedArchitecture.review;
    setReviewResult(null);
    setReviewedArchitectureVersion(null);

    setArchitectureResult(updatedArchitecture);
    saveToHistory(updatedArchitecture, input);

    setAppliedFixNotification(`Architecture updated successfully to ${styleName} (v${newVersion}).`);
    setActiveTab('overview');
  };

  const handleSelectSaved = (saved: SavedArchitecture) => {
    // Deep-clone when restoring to ensure working mutations never corrupt stored session
    const restoredArch: ArchitectureResult = JSON.parse(JSON.stringify(saved.result));
    const versionNum = restoredArch.version || 1;
    restoredArch.version = versionNum;

    setInput({ ...saved.input });
    setArchitectureResult(restoredArch);
    setReviewResult(restoredArch.review || null);
    setReviewedArchitectureVersion(restoredArch.review ? versionNum : null);
    setComparisonResult(saved.comparison ? JSON.parse(JSON.stringify(saved.comparison)) : null);
    setIsFormCollapsed(true);
    setCurrentNav('workspace');
    setActiveTab('overview');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedArchitectures((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setSavedArchitectures([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleExportMarkdown = () => {
    if (!architectureResult) return;
    const md = generateMarkdownReport(architectureResult, input);
    const slug = architectureResult.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`${slug}-architecture-spec.md`, md, 'text/markdown');
    setShowExportMenu(false);
  };

  const handleExportAdr = () => {
    if (!architectureResult) return;
    const adr = generateAdrReport(architectureResult);
    const slug = architectureResult.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`ADR-001-${slug}.md`, adr, 'text/markdown');
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!architectureResult) return;
    const jsonStr = JSON.stringify({ input, result: architectureResult }, null, 2);
    const slug = architectureResult.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`${slug}-architecture.json`, jsonStr, 'application/json');
    setShowExportMenu(false);
  };

  const handleCopySpec = () => {
    if (!architectureResult) return;
    const md = generateMarkdownReport(architectureResult, input);
    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Product Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentNav('workspace')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>ArchitectAI</span>
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  AI-Powered Software Architecture Design
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentNav('projects')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentNav === 'projects'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Projects</span>
              {savedArchitectures.length > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    currentNav === 'projects'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {savedArchitectures.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentNav('workspace');
                setIsFormCollapsed(false);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentNav === 'workspace' && (!architectureResult || !isFormCollapsed)
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Architecture</span>
            </button>

            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Documentation/About</span>
              <span className="md:hidden">About</span>
            </button>
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* History Sessions Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-medium flex items-center gap-1.5 transition-colors bg-white cursor-pointer"
              title="Saved Sessions"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sessions</span>
            </button>

            {/* Architecture Change History Audit Trail Button */}
            {architectureResult?.changeHistory && architectureResult.changeHistory.length > 0 && (
              <button
                onClick={() => setIsChangeHistoryModalOpen(true)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View Architecture Change History"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Audit Trail</span>
                <span className="text-[10px] font-mono bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
                  {architectureResult.changeHistory.length}
                </span>
              </button>
            )}

            {/* Export Menu if Architecture is present */}
            {architectureResult && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        setIsExportReportModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-indigo-900 font-semibold flex items-center gap-2 border-b border-slate-100 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export Architecture Report</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Download Spec (.md)</span>
                    </button>
                    <button
                      onClick={handleExportAdr}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download ADR (.md)</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-amber-600" />
                      <span>Export JSON Payload</span>
                    </button>
                    <button
                      onClick={handleCopySpec}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy Spec Markdown'}</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print / PDF Document</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reset / New Design button */}
            <button
              onClick={() => {
                setArchitectureResult(null);
                setComparisonResult(null);
                setIsFormCollapsed(false);
                setCurrentNav('workspace');
              }}
              className="text-xs p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium transition-colors cursor-pointer"
              title="Start a new architecture session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* VIEW 1: Projects Dashboard View */}
        {currentNav === 'projects' && (
          <MainDashboard
            savedArchitectures={savedArchitectures}
            onSelectProject={handleSelectSaved}
            onNewArchitecture={() => {
              setArchitectureResult(null);
              setCurrentNav('workspace');
              setIsFormCollapsed(false);
            }}
            onDeleteProject={handleDeleteSaved}
          />
        )}

        {/* VIEW 2: Workspace View */}
        {currentNav === 'workspace' && (
          <div className="space-y-6">
            {/* Requirements Form Section (Collapsible when design exists) */}
            <div>
              {architectureResult && (
                <div className="flex items-center justify-between pb-2 mb-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    System Requirements & Engineering Parameters
                  </span>
                  <button
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {isFormCollapsed ? 'Edit Requirements & Re-generate' : 'Collapse Requirements Form'}
                  </button>
                </div>
              )}

              {(!architectureResult || !isFormCollapsed) && (
                <ArchitectureForm
                  input={input}
                  onChange={setInput}
                  onSubmit={handleGenerate}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Loading State Banner */}
            {isLoading && (
              <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-xs text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Synthesizing Architecture Specification</h3>
                  <p className="text-xs text-indigo-600 font-mono mt-1 font-medium">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
                <div className="max-w-md mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Evaluating trade-offs, consistency models, failure domains, and cloud deployment topology.
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Architecture Generation Error</span>
                  <p>{error}</p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Architecture Results View: 3-Column Workspace */}
            {architectureResult && !isLoading && (
              <div className="space-y-4">
                {/* Top Action Bar with Exposed Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                      Architecture v{architectureResult.version || 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {architectureResult.recommendedArchitectureStyle?.name || 'Architecture'}
                    </span>
                    <span className="text-slate-300">/</span>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-sm">
                      {architectureResult.projectName}
                    </h2>
                    <span className="hidden sm:inline text-slate-300">·</span>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold text-[11px]">
                        {input.cloudProvider}
                      </span>
                      <span>·</span>
                      <span className="text-indigo-700 font-bold text-[11px]">
                        {input.availability.split(' ')[0]} SLA
                      </span>
                    </div>
                  </div>

                  {/* Top Actions: Clearly Exposed */}
                  <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    <button
                      onClick={() => {
                        setIsFormCollapsed(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Adjust requirements or re-generate architecture"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Generate Architecture</span>
                    </button>

                    <button
                      onClick={handleRunReview}
                      className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Run AI Architecture Review"
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Review Architecture</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('compare')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs border ${
                        activeTab === 'compare'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Compare alternative architecture styles"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Compare</span>
                    </button>

                    <button
                      onClick={() => setIsExportReportModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Export complete 13-section Architecture Report (Markdown & Text)"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Export Report</span>
                    </button>

                    {/* Sidebar Toggles on Desktop */}
                    <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-200">
                      <button
                        onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                        className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                          isLeftSidebarCollapsed
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                        title={isLeftSidebarCollapsed ? 'Show Navigation Panel' : 'Collapse Navigation Panel'}
                      >
                        <PanelLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                        className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                          isRightSidebarCollapsed
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                        title={isRightSidebarCollapsed ? 'Show Context Panel' : 'Collapse Context Panel'}
                      >
                        <PanelRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3-Column Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* LEFT COLUMN: Project & Navigation Area */}
                  {!isLeftSidebarCollapsed && (
                    <aside className="lg:col-span-3 space-y-4">
                      {/* Project Specs Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                            Project Context
                          </span>
                          <span className="text-[11px] font-mono text-indigo-700 font-semibold">
                            {input.cloudProvider}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">Scale</span>
                            <span className="font-semibold text-slate-800">{input.expectedUsers}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">Availability Target</span>
                            <span className="font-semibold text-slate-800">{input.availability}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">Budget</span>
                            <span className="font-semibold text-slate-800">{input.budget}</span>
                          </div>
                        </div>
                      </div>

                      {/* Domain Navigation Menu (11 Tabs) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1">
                        <div className="px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400">
                          Architecture Views
                        </div>
                        <nav className="space-y-1" aria-label="Architecture Sidebar Navigation">
                          {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const TabIcon = tab.icon;
                            const isDiagramCenterpiece = tab.id === 'architecture';

                            return (
                              <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <TabIcon
                                    className={`w-3.5 h-3.5 ${
                                      isActive ? 'text-white' : isDiagramCenterpiece ? 'text-indigo-600' : 'text-slate-500'
                                    }`}
                                  />
                                  <span>{tab.label}</span>
                                </div>
                                {isDiagramCenterpiece && !isActive && (
                                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                                    Diagram
                                  </span>
                                )}
                                {tab.id === 'review' && reviewResult && !isActive && (
                                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                                    {reviewResult.overallHealthScore}/100
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </nav>
                      </div>

                      {/* Visual Indicator Cards (Using real AI scores) */}
                      {(reviewResult?.categoryScores || architectureResult.review?.categoryScores) && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-indigo-600" />
                              Health Indicators
                            </span>
                            <span className="text-xs font-bold font-mono text-emerald-700">
                              {(reviewResult || architectureResult.review)?.overallHealthScore}/100
                            </span>
                          </div>

                          {(() => {
                            const cs = (reviewResult || architectureResult.review)!.categoryScores;
                            return (
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 text-[11px]">Scalability</span>
                                  <span className="font-mono font-bold text-slate-800">{cs.scalability}/100</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 text-[11px]">Security</span>
                                  <span className="font-mono font-bold text-slate-800">{cs.security}/100</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 text-[11px]">Availability</span>
                                  <span className="font-mono font-bold text-slate-800">{cs.availability}/100</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 text-[11px]">Cost Efficiency</span>
                                  <span className="font-mono font-bold text-slate-800">{cs.costEfficiency}/100</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </aside>
                  )}

                  {/* CENTER COLUMN: Architecture Content & Visualization Centerpiece */}
                  <div
                    className={`${
                      isLeftSidebarCollapsed && isRightSidebarCollapsed
                        ? 'lg:col-span-12'
                        : isLeftSidebarCollapsed || isRightSidebarCollapsed
                        ? 'lg:col-span-9'
                        : 'lg:col-span-6'
                    } min-w-0 space-y-4`}
                  >
                    {/* Horizontal Tabs Bar for Responsive & Quick Access */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs overflow-hidden">
                      <nav
                        className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin px-0.5"
                        aria-label="Horizontal Architecture Tabs"
                      >
                        {TABS.map((tab) => {
                          const isActive = activeTab === tab.id;
                          const TabIcon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/70 border border-slate-200/80'
                              }`}
                            >
                              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </nav>
                    </div>

                    {/* Notification Banner when on non-review tabs */}
                    {appliedFixNotification && activeTab !== 'review' && (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-emerald-950">
                              Architecture updated successfully.
                            </h4>
                            <p className="text-[11px] text-emerald-800">
                              Surgical fix applied. System diagram, services, datastores, and APIs have been synchronized.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setActiveTab('review');
                              handleRunReview();
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Re-run Review</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active Tab View */}
                    <div className="transition-all duration-150">
                      {activeTab === 'overview' && (
                        <OverviewTab
                          result={architectureResult}
                          input={input}
                          onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                          onRunReview={handleRunReview}
                          onOpenExportReport={() => setIsExportReportModalOpen(true)}
                        />
                      )}

                      {activeTab === 'requirements' && (
                        <RequirementsView
                          functional={architectureResult.functionalRequirements}
                          nonFunctional={architectureResult.nonFunctionalRequirements}
                        />
                      )}

                      {activeTab === 'architecture' && (
                        <ArchitectureTopology
                          result={architectureResult}
                          onRunReview={handleRunReview}
                        />
                      )}

                      {activeTab === 'services' && (
                        <ServicesTab result={architectureResult} />
                      )}

                      {activeTab === 'database' && (
                        <DatabaseTab result={architectureResult} />
                      )}

                      {activeTab === 'apis' && (
                        <ApisTab result={architectureResult} />
                      )}

                      {activeTab === 'security' && (
                        <SecurityTab result={architectureResult} />
                      )}

                      {activeTab === 'scalability' && (
                        <ScalabilityTab result={architectureResult} input={input} />
                      )}

                      {activeTab === 'risks_tradeoffs' && (
                        <RisksTradeoffsTab result={architectureResult} />
                      )}

                      {activeTab === 'review' && (
                        <ArchitectureReviewTab
                          review={reviewResult}
                          isLoading={isReviewLoading}
                          error={reviewError}
                          onRunReview={handleRunReview}
                          result={architectureResult}
                          input={input}
                          onProposeFix={handleProposeFix}
                          appliedFixNotification={appliedFixNotification}
                          changeHistory={architectureResult.changeHistory || []}
                          onOpenChangeHistory={() => setIsChangeHistoryModalOpen(true)}
                          reviewedArchitectureVersion={reviewedArchitectureVersion}
                        />
                      )}

                      {activeTab === 'compare' && (
                        <CompareTab
                          input={input}
                          currentResult={architectureResult}
                          comparison={comparisonResult}
                          isLoading={isComparisonLoading}
                          error={comparisonError}
                          onGenerateComparison={handleGenerateComparison}
                          onApplyOption={handleApplyComparisonOption}
                        />
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Contextual Information & Selected Component Details */}
                  {!isRightSidebarCollapsed && (
                    <aside className="lg:col-span-3 space-y-4">
                      {/* Component Inspector & Details */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-indigo-600" />
                            Component Details
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {architectureResult.architectureComponents?.length || 0} Total
                          </span>
                        </div>

                        {/* Component Selector Dropdown */}
                        {architectureResult.architectureComponents && architectureResult.architectureComponents.length > 0 && (
                          <div>
                            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                              Select Component
                            </label>
                            <select
                              value={
                                selectedComponentId ||
                                architectureResult.architectureComponents[0]?.id
                              }
                              onChange={(e) => setSelectedComponentId(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            >
                              {architectureResult.architectureComponents.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.layer})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Selected Component Spec */}
                        {(() => {
                          const comp =
                            architectureResult.architectureComponents?.find(
                              (c) => c.id === selectedComponentId
                            ) || architectureResult.architectureComponents?.[0];

                          if (!comp) {
                            return (
                              <p className="text-xs text-slate-400 italic">No component selected.</p>
                            );
                          }

                          return (
                            <div className="space-y-3 text-xs">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-bold text-slate-900 text-sm">{comp.name}</span>
                                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                                    {comp.layer}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {comp.purpose}
                                </p>
                              </div>

                              {comp.technologies?.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                                    Technologies
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {comp.technologies.map((t) => (
                                      <span
                                        key={t}
                                        className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {comp.connections?.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                                    Connections
                                  </span>
                                  <div className="space-y-1">
                                    {comp.connections.map((conn) => (
                                      <div
                                        key={conn}
                                        className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono"
                                      >
                                        <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                                        <span className="truncate">{conn}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Architecture Quick Facts */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
                          Architecture Summary
                        </span>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">
                              Primary Datastore
                            </span>
                            <span className="font-semibold text-slate-800">
                              {architectureResult.databaseRecommendation?.primaryStore?.technology || 'SQL / ACID'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">
                              Cache Tier
                            </span>
                            <span className="font-semibold text-slate-800">
                              {architectureResult.databaseRecommendation?.cacheLayer?.technology || 'In-Memory Cache'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-mono block">
                              API Gateway
                            </span>
                            <span className="font-semibold text-slate-800">
                              {architectureResult.apiDesign?.gatewayTechnology || 'API Gateway'}
                            </span>
                          </div>
                        </div>

                        {/* Fast Report Export Shortcuts */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <button
                            onClick={() => setIsExportReportModalOpen(true)}
                            className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>Download Full Report</span>
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Documentation / About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedArchitectures={savedArchitectures}
        onSelect={handleSelectSaved}
        onDelete={handleDeleteSaved}
        onClearAll={handleClearHistory}
      />

      {/* Architecture Fix Proposal & Approval Modal */}
      <ArchitectureFixModal
        isOpen={isFixModalOpen}
        onClose={() => {
          if (!isApplyingFix) {
            setIsFixModalOpen(false);
            setFixError(null);
          }
        }}
        proposal={fixProposal}
        isLoading={isProposingFix}
        isApplying={isApplyingFix}
        error={fixError}
        onApplyFix={handleApplyFix}
      />

      {/* Architecture Change History Audit Trail Modal */}
      <ArchitectureChangeHistoryModal
        isOpen={isChangeHistoryModalOpen}
        onClose={() => setIsChangeHistoryModalOpen(false)}
        history={architectureResult?.changeHistory || []}
      />

      {/* Export Architecture Report Modal */}
      {architectureResult && (
        <ExportReportModal
          isOpen={isExportReportModalOpen}
          onClose={() => setIsExportReportModalOpen(false)}
          result={architectureResult}
          input={input}
          reviewResult={reviewResult}
          comparisonResult={comparisonResult}
        />
      )}
    </div>
  );
}
