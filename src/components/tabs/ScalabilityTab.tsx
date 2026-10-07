import React from 'react';
import { ArchitectureResult, ArchitectureInput } from '../../types/architecture';
import {
  TrendingUp,
  Activity,
  Server,
  HardDrive,
  Shuffle,
} from 'lucide-react';

interface Props {
  result: ArchitectureResult;
  input: ArchitectureInput;
}

export const ScalabilityTab: React.FC<Props> = ({ result, input }) => {
  const { scalabilityConsiderations, databaseRecommendation, apiDesign } = result;

  const keyScalabilityPillars = [
    {
      title: 'Scaling Strategy',
      icon: TrendingUp,
      value: 'Horizontal Autoscaling',
      details: 'Stateless application service pods with metric-based autoscaling (CPU > 70%, request latency p95).',
    },
    {
      title: 'Expected Load & Concurrency',
      icon: Activity,
      value: input.expectedUsers || 'High Concurrency',
      details: 'Configured connection pooling, asynchronous worker queues, and non-blocking I/O event loops.',
    },
    {
      title: 'Availability & Failover Strategy',
      icon: Server,
      value: input.availability || '99.99% High Availability',
      details: 'Multi-Availability-Zone replication with automated health checks, circuit breakers, and sub-minute failovers.',
    },
    {
      title: 'Multi-Tier Caching Hierarchy',
      icon: HardDrive,
      value: `${databaseRecommendation.cacheLayer.technology}`,
      details: `Edge CDN caching + ${databaseRecommendation.cacheLayer.strategy} in-memory cache to absorb 85%+ of read traffic.`,
    },
    {
      title: 'Load Balancing & Ingress',
      icon: Shuffle,
      value: `${apiDesign.gatewayTechnology}`,
      details: 'Layer 7 application routing, round-robin / least-connection dispatch, and TLS termination.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Scalability & Elasticity Decisions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Autoscaling strategies, concurrency thresholds, availability clustering, caching hierarchy, and load balancing.
          </p>
        </div>
      </div>

      {/* 5 High-Level Scalability Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyScalabilityPillars.map((pillar, idx) => {
          const PillarIcon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <PillarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      {pillar.title}
                    </span>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {pillar.value}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {pillar.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scalability Vectors & Bottleneck Mitigations */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Architectural Bottleneck Mitigations & Failover Mechanisms
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scalabilityConsiderations.map((scale, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900">{scale.aspect}</h5>
                  <span className="text-[10px] font-mono text-slate-400">Vector #{idx + 1}</span>
                </div>

                <div className="mt-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Scaling Technique
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {scale.technique}
                  </p>
                </div>

                <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Bottleneck Mitigation
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {scale.bottleneckMitigation}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Failover Mechanism
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {scale.failoverMechanism}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
