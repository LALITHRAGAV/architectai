import React from 'react';
import { FunctionalRequirement, NonFunctionalRequirement } from '../types/architecture';
import { CheckSquare, Gauge, AlertCircle, ArrowUpRight } from 'lucide-react';

interface Props {
  functional: FunctionalRequirement[];
  nonFunctional: NonFunctionalRequirement[];
}

export const RequirementsView: React.FC<Props> = ({ functional, nonFunctional }) => {
  return (
    <div className="space-y-8">
      {/* 1. Functional Requirements Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              1. Functional Requirements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Core system capabilities, domain logic, and verifiable acceptance criteria.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {functional.length} Requirements Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {functional.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded">
                    {req.id}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                      req.priority === 'High'
                        ? 'text-rose-700 bg-rose-50'
                        : req.priority === 'Medium'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    Priority: {req.priority}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{req.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{req.description}</p>
              </div>

              {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Acceptance Criteria
                  </span>
                  <ul className="space-y-1">
                    {req.acceptanceCriteria.map((crit, cIdx) => (
                      <li key={cIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Non-Functional Requirements Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              2. Non-Functional Requirements (SLAs & Quality Attributes)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Architectural performance invariants, reliability targets, and operational metrics.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {nonFunctional.length} Target Metrics
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Target SLA</th>
                <th className="py-3 px-4">Architectural Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nonFunctional.map((nfr, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {nfr.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{nfr.metric}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                    <span className="bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                      {nfr.target}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">
                    {nfr.implementationStrategy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
