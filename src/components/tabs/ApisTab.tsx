import React from 'react';
import { ArchitectureResult } from '../../types/architecture';
import { Terminal, Lock, Layers } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
}

export const ApisTab: React.FC<Props> = ({ result }) => {
  const { apiDesign, services } = result;

  // Determine the associated service for an endpoint path
  const getAssociatedService = (path: string): string => {
    const cleanPath = path.toLowerCase();
    for (const srv of services) {
      const srvName = srv.name.toLowerCase();
      // Match keywords in path with service name
      if (
        (cleanPath.includes('auth') || cleanPath.includes('token') || cleanPath.includes('login') || cleanPath.includes('user')) &&
        (srvName.includes('auth') || srvName.includes('user') || srvName.includes('identity'))
      ) {
        return srv.name;
      }
      if (
        (cleanPath.includes('pay') || cleanPath.includes('transaction') || cleanPath.includes('order') || cleanPath.includes('billing')) &&
        (srvName.includes('pay') || srvName.includes('order') || srvName.includes('billing'))
      ) {
        return srv.name;
      }
      if (
        (cleanPath.includes('product') || cleanPath.includes('catalog') || cleanPath.includes('item')) &&
        (srvName.includes('catalog') || srvName.includes('product'))
      ) {
        return srv.name;
      }
      if (
        (cleanPath.includes('telemetry') || cleanPath.includes('metric') || cleanPath.includes('device') || cleanPath.includes('event')) &&
        (srvName.includes('telemetry') || srvName.includes('ingestion') || srvName.includes('event'))
      ) {
        return srv.name;
      }
    }

    // Default to the first application service or Gateway Core
    return services[0]?.name || 'Core Domain Service';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            API Design & Endpoint Specifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key REST, RPC and GraphQL contracts, gateway protocols, authentication schemes, and associated handler services.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          {apiDesign.keyEndpoints.length} Endpoints Defined
        </span>
      </div>

      {/* Gateway & Paradigm Meta Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            API Paradigm
          </span>
          <span className="text-xs font-bold text-slate-900">{apiDesign.paradigm}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Gateway Technology
          </span>
          <span className="text-xs font-bold text-slate-900">{apiDesign.gatewayTechnology}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Auth Method
          </span>
          <span className="text-xs font-bold text-slate-900">{apiDesign.authMethod}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Rate Limiting
          </span>
          <span className="text-xs font-bold text-slate-900">{apiDesign.rateLimitingAndThrottling}</span>
        </div>
      </div>

      {/* Primary Endpoints Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            API Endpoints & Associated Handler Services
          </h4>
          <span className="text-[11px] text-slate-500">
            Versioning: <code className="font-mono">{apiDesign.versioningStrategy}</code>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {apiDesign.keyEndpoints.map((ep, idx) => {
            const associatedService = getAssociatedService(ep.path);
            return (
              <div key={idx} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
                  {/* Method & Path */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md ${
                        ep.method === 'GET'
                          ? 'text-sky-700 bg-sky-50 border border-sky-200'
                          : ep.method === 'POST'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : ep.method === 'PUT' || ep.method === 'PATCH'
                          ? 'text-amber-700 bg-amber-50 border border-amber-200'
                          : ep.method === 'DELETE'
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : 'text-purple-700 bg-purple-50 border border-purple-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      {ep.path}
                    </span>
                  </div>

                  {/* Badges: Associated Service + Auth + Rate Limit */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Service:</span>
                      <span className="font-semibold">{associatedService}</span>
                    </span>

                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ep.rateLimit}
                    </span>

                    {ep.authRequired ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                        <Lock className="w-3 h-3" /> Auth Required
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>

                {/* Purpose / Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {ep.description}
                </p>

                {/* Sample Payload Summary */}
                {ep.samplePayloadSummary && (
                  <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2">
                    <span className="text-slate-400 shrink-0 font-sans font-semibold">Payload Contract:</span>
                    <span className="text-slate-800">{ep.samplePayloadSummary}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
