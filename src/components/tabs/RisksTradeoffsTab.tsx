import React from 'react';
import { ArchitectureResult } from '../../types/architecture';
import { AlertTriangle, Scale, Bell } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
}

export const RisksTradeoffsTab: React.FC<Props> = ({ result }) => {
  const { risks, tradeoffs } = result;

  return (
    <div className="space-y-8">
      {/* 1. Risks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identified Architecture Risks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated technical, operational, and data risks with severity, impact analysis, mitigations, and monitoring alarm triggers.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {risks.length} Risks Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((r, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header: Risk Title & Badges */}
                <div className="pb-2.5 border-b border-slate-100 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {r.risk}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        r.impact === 'Critical'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : r.impact === 'Medium'
                          ? 'text-amber-700 bg-amber-50 border border-amber-200'
                          : 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      Severity: {r.impact}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        r.probability === 'High'
                          ? 'text-rose-600 bg-rose-50'
                          : r.probability === 'Medium'
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      Prob: {r.probability}
                    </span>
                  </div>
                </div>

                {/* Impact */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Impact Explanation
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Failure to isolate or protect this dimension leads to {r.impact.toLowerCase()} degradation in service availability or throughput.
                  </p>
                </div>

                {/* Mitigation */}
                <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Mitigation Strategy
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {r.mitigation}
                  </p>
                </div>
              </div>

              {/* Monitoring Alarm */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Alarm Trigger:</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-[220px]" title={r.monitoringAlarm}>
                  {r.monitoringAlarm}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trade-offs Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Architectural Trade-offs & Compromises
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deliberate engineering decisions balancing consistency vs latency, operational complexity vs velocity, and cost vs resilience.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {tradeoffs.length} Trade-offs Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tradeoffs.map((to, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Fundamental Trade-off
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{to.tradeoffName}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block mb-0.5">
                      Chosen Option
                    </span>
                    <span className="font-semibold text-emerald-950 block">{to.optionChosen}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                      Sacrificed Characteristic
                    </span>
                    <span className="text-slate-600 line-through block">{to.sacrificedOption}</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Architectural Rationale
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {to.architecturalRationale}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Cost / Ops Impact
                </span>
                <span className="font-medium text-slate-800">{to.operationalCostImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
