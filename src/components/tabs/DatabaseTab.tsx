import React from 'react';
import { ArchitectureResult } from '../../types/architecture';
import { Database, HardDrive, Archive, RefreshCw } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
}

export const DatabaseTab: React.FC<Props> = ({ result }) => {
  const { databaseRecommendation } = result;
  const { primaryStore, cacheLayer, specializedStores, backupAndDisasterRecovery } = databaseRecommendation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Persistence, Caching & Storage Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary databases, distributed caching layers, object storage, and disaster recovery SLA targets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Database Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                  Primary Transactional Datastore
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  {primaryStore.technology}
                </h4>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              {primaryStore.type}
            </span>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Architectural Purpose & Justification
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {primaryStore.justification}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Schema Strategy & Data Model
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {primaryStore.schemaStrategy}
              </p>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Partitioning & High Availability
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {primaryStore.shardingOrReplication}
              </p>
            </div>
          </div>
        </div>

        {/* Distributed Cache Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                In-Memory Cache Tier
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {cacheLayer.technology}
              </h4>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Caching Pattern
              </span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {cacheLayer.strategy}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">
                TTL & Invalidation Strategy
              </span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {cacheLayer.ttlStrategy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary / Object Storage & Specialized Stores */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Archive className="w-4 h-4 text-indigo-600" />
            Specialized Datastores & Object Storage
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {specializedStores?.length || 0} Stores Configured
          </span>
        </div>

        {specializedStores && specializedStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specializedStores.map((store, idx) => (
              <div key={idx} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{store.purpose}</span>
                  <span className="text-[10px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {store.technology}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {store.justification}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 border border-slate-100">
            Standard cloud object storage (e.g. AWS S3 / Google Cloud Storage) configured for media assets, logs, and database backup snapshots.
          </div>
        )}
      </div>

      {/* Backup and Disaster Recovery */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            Backup & Disaster Recovery (DR) SLAs
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              RPO (Recovery Point Objective)
            </span>
            <span className="text-lg font-black font-mono text-indigo-600 block">
              {backupAndDisasterRecovery.rpo}
            </span>
            <span className="text-[11px] text-slate-500">Maximum allowable data loss</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              RTO (Recovery Time Objective)
            </span>
            <span className="text-lg font-black font-mono text-indigo-600 block">
              {backupAndDisasterRecovery.rto}
            </span>
            <span className="text-[11px] text-slate-500">Maximum allowable downtime</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col justify-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Disaster Recovery Strategy
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {backupAndDisasterRecovery.strategy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
