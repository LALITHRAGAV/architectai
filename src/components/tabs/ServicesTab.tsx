import React from 'react';
import { ServiceDefinition, ArchitectureResult } from '../../types/architecture';
import { Cpu, Activity } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
}

export const ServicesTab: React.FC<Props> = ({ result }) => {
  const { services, architectureComponents } = result;

  // Derive the architecture tier for each service
  const getServiceTier = (srv: ServiceDefinition, index: number): string => {
    // Check if matched in architecture components
    const matchedComp = architectureComponents?.find(
      (c) => c.name.toLowerCase().includes(srv.name.toLowerCase()) || srv.name.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedComp) {
      return matchedComp.layer;
    }

    const typeLower = (srv.type || '').toLowerCase();
    const nameLower = srv.name.toLowerCase();

    if (nameLower.includes('gateway') || nameLower.includes('edge') || typeLower.includes('ingress')) {
      return 'API Gateway & Ingress';
    }
    if (nameLower.includes('worker') || nameLower.includes('consumer') || typeLower.includes('event')) {
      return 'Async Compute & Worker Tier';
    }
    if (nameLower.includes('auth') || nameLower.includes('security')) {
      return 'Security & Identity Tier';
    }
    if (nameLower.includes('data') || nameLower.includes('analytics') || nameLower.includes('storage')) {
      return 'Data & Storage Tier';
    }

    return 'Application Services (Compute)';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Generated Domain Services Decomposition
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Microservice & service boundaries with assigned responsibilities, communication protocols, dependencies, and architecture tiers.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          {services.length} Services Defined
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv, idx) => {
          const tier = getServiceTier(srv, idx);
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Name and Tier */}
                <div className="pb-3 border-b border-slate-100 mb-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {tier}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {srv.type}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {srv.name}
                  </h4>
                </div>

                {/* Responsibility */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Responsibilities
                  </span>
                  <ul className="space-y-1.5">
                    {srv.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom metadata: Technology, Dependencies, Autoscaling */}
              <div className="pt-3.5 border-t border-slate-100 space-y-2.5 text-xs">
                {/* Technology / Protocol */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Technology & Protocol
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {srv.communicationProtocol}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      {srv.type}
                    </span>
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Dependencies
                  </span>
                  {srv.dependencies && srv.dependencies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {srv.dependencies.map((dep, dIdx) => (
                        <span
                          key={dIdx}
                          className="font-mono text-[10px] text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No external dependencies</span>
                  )}
                </div>

                {/* Autoscale Trigger */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Activity className="w-3 h-3 text-indigo-500" /> Autoscale:
                  </span>
                  <span className="font-medium text-slate-700 truncate max-w-[180px]" title={srv.scalingTrigger}>
                    {srv.scalingTrigger}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
