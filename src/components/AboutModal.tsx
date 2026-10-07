import React from 'react';
import { X, Cpu, Layers, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  v2.5 Pro
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">Portfolio Edition</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                About ArchitectAI
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              AI-Powered Software Architecture Design Workbench
            </h4>
            <p>
              <strong>ArchitectAI</strong> is an interactive engineering workbench designed for software architects, tech leads, and systems engineers to formulate, stress-test, and benchmark distributed application architectures.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="font-mono text-[11px] uppercase font-bold text-slate-700">
              Core Capabilities
            </h5>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Architectural Synthesis:</strong> Generates tiered topology diagrams, bounded context services, ACID/NoSQL database partitioning, and API contracts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Adversarial Architecture Review:</strong> Evaluates 13 critical software dimensions with health score (0-100) and categorized findings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Surgical Architecture Remediation:</strong> Propose and apply targeted fixes without unneeded microservice complexity.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-Approach Architecture Comparison:</strong> Benchmark competing paradigms (e.g., Modular Monolith vs Event-Driven Microservices) for identical business requirements.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>RFC & Design Review Export:</strong> 13-section Markdown and Plain Text export ready for RFCs, design docs, and ADR archives.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <span>Built with React 19, TypeScript, Tailwind CSS, & Google Gemini 3.8</span>
            <span className="font-mono">Ready for Design Reviews</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
