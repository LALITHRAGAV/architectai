import React, { useState } from 'react';
import {
  ArchitectureResult,
  ArchitectureInput,
  ArchitectureReviewResult,
  ArchitectureComparisonResult,
} from '../types/architecture';
import { generateFullArchitectureReport, downloadFile } from '../utils/exportUtils';
import {
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  X,
  CheckCircle2,
  Copy,
  Layers,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: ArchitectureResult;
  input: ArchitectureInput;
  reviewResult: ArchitectureReviewResult | null;
  comparisonResult: ArchitectureComparisonResult | null;
}

export const ExportReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  input,
  reviewResult,
  comparisonResult,
}) => {
  const [format, setFormat] = useState<'markdown' | 'text'>('markdown');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const currentReview = reviewResult || result.review || null;
  const currentComparison = comparisonResult || null;

  const handleDownload = async (chosenFormat: 'markdown' | 'text') => {
    setIsGenerating(true);
    setExportError(null);
    setDownloadSuccess(null);

    try {
      // Yield to let UI show generating state smoothly
      await new Promise((resolve) => setTimeout(resolve, 350));

      const reportContent = generateFullArchitectureReport({
        result,
        input,
        review: currentReview,
        comparison: currentComparison,
        format: chosenFormat,
      });

      if (!reportContent || reportContent.trim().length === 0) {
        throw new Error('Generated report is empty. Please verify current architecture state.');
      }

      const slug = (result.projectName || 'architecture-report')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const extension = chosenFormat === 'markdown' ? 'md' : 'txt';
      const mimeType = chosenFormat === 'markdown' ? 'text/markdown' : 'text/plain';
      const filename = `${slug}-architecture-report.${extension}`;

      downloadFile(filename, reportContent, mimeType);
      setDownloadSuccess(`Downloaded "${filename}" successfully!`);
    } catch (err: any) {
      console.error('Export report error:', err);
      setExportError(err?.message || 'Failed to generate architecture report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    setExportError(null);
    try {
      const reportContent = generateFullArchitectureReport({
        result,
        input,
        review: currentReview,
        comparison: currentComparison,
        format,
      });
      await navigator.clipboard.writeText(reportContent);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch (err: any) {
      setExportError('Failed to copy to clipboard: ' + (err?.message || 'Permission denied'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Design Review Asset
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">13 Sections</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Export Architecture Report
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Generate an authoritative, publication-ready software architecture report of the{' '}
            <strong className="text-slate-900 font-bold">CURRENT</strong> system state suitable for engineering design reviews, RFCs, and security audits.
          </p>

          {/* Current State Summary Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Current Architecture State</span>
              </span>
              <span className="font-mono text-slate-500 font-semibold">{result.projectName}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Style</span>
                <span className="font-bold text-slate-800 truncate block">
                  {result.recommendedArchitectureStyle.name}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Services</span>
                <span className="font-bold text-slate-800 block">
                  {result.services?.length || 0} Defined
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 font-mono block text-[10px] uppercase">AI Review</span>
                <span className={`font-bold block ${currentReview ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {currentReview ? `${currentReview.overallHealthScore}/100 Score` : 'Not run'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Fixes Applied</span>
                <span className={`font-bold block ${(result.changeHistory?.length || 0) > 0 ? 'text-indigo-700' : 'text-slate-500'}`}>
                  {result.changeHistory?.length || 0} Changes
                </span>
              </div>
            </div>
          </div>

          {/* Report Sections Included */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 mb-2">
              Included Design Review Sections (13 Core Domains)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>1. Project Overview & Cloud Scale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>2. Functional & Non-Functional Req.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>3. Architecture Style & Data Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>4. Visual Topology (Mermaid & ASCII)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>5. Domain Services Decomposition</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>6. Database & Storage Architecture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>7. API Contracts & Endpoints</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>8. Security & Defense-in-Depth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>9. Scalability & High Availability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${currentReview ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>10. Architecture Health & Review {currentReview ? '✓' : '(Not run)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${(result.changeHistory?.length || 0) > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>11. Applied Architecture Fixes {result.changeHistory?.length ? `(${result.changeHistory.length})` : '(None)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${currentComparison ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>12. Architecture Comparison {currentComparison ? '✓' : '(Not run)'}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>13. Final Architecture Decision (ADR-001) & Trade-offs</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {exportError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Export Failed</span>
                <p>{exportError}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Report Generated</span>
                <p>{downloadSuccess}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Two Explicit Download Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isGenerating}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Copy active format to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedNotification ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Download Text Report Button */}
            <button
              onClick={() => handleDownload('text')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 bg-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>Download Text Report</span>
            </button>

            {/* Download Markdown Report Button */}
            <button
              onClick={() => handleDownload('markdown')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              <span>Download Markdown Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
