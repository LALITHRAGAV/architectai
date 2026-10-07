import React, { useState, useMemo } from 'react';
import { ArchitectureComponent, ArchitectureResult } from '../types/architecture';
import { VisualArchitectureDiagram } from './VisualArchitectureDiagram';
import { Layers, Network, ArrowRight, CheckCircle2, Copy, Check, Info } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
  onRunReview?: () => void;
}

export const ArchitectureTopology: React.FC<Props> = ({ result, onRunReview }) => {
  const [activeView, setActiveView] = useState<'visual_diagram' | 'layered_components' | 'mermaid'>('visual_diagram');
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(
    result.architectureComponents[0] || null
  );
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  // Group components by layer (memoized for performance)
  const layersOrder = [
    'Client',
    'Edge & CDN',
    'API Gateway',
    'Compute & Services',
    'Messaging & Cache',
    'Storage & Database',
    'Observability & Security',
  ] as const;

  const grouped = useMemo(() => {
    return layersOrder.reduce((acc, layer) => {
      acc[layer] = result.architectureComponents.filter((c) => c.layer === layer);
      return acc;
    }, {} as Record<string, ArchitectureComponent[]>);
  }, [result.architectureComponents]);

  const copyMermaid = () => {
    navigator.clipboard.writeText(result.mermaidDiagram);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-600" />
            <span>System Architecture Diagram & Pipeline</span>
            <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
              v{result.version || 1}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual relationships between Users, CDN, Load Balancer, API Gateway, Services, Cache, Message Queues, and Databases.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {onRunReview && (
            <button
              onClick={onRunReview}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              title="Launch AI Architecture Review"
            >
              <span>🔍 Review Architecture</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveView('visual_diagram')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'visual_diagram'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Diagram
            </button>
            <button
              onClick={() => setActiveView('layered_components')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'layered_components'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Component Grid
            </button>
            <button
              onClick={() => setActiveView('mermaid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'mermaid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mermaid Syntax
            </button>
          </div>
        </div>
      </div>

      {/* 1. Visual Software Architecture Diagram */}
      {activeView === 'visual_diagram' && (
        <VisualArchitectureDiagram result={result} />
      )}

      {/* 2. Layered Component Breakdown */}
      {activeView === 'layered_components' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {layersOrder.map((layerName, layerIdx) => {
              const comps = grouped[layerName] || [];
              if (comps.length === 0) return null;

              return (
                <div key={layerName} className="relative">
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {layerName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {comps.length} {comps.length === 1 ? 'component' : 'components'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {comps.map((comp) => {
                        const isSelected = selectedComponent?.id === comp.id || selectedComponent?.name === comp.name;
                        return (
                          <button
                            key={comp.id || comp.name}
                            onClick={() => setSelectedComponent(comp)}
                            className={`text-left p-3 rounded-lg border transition-all text-xs ${
                              isSelected
                                ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                                : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                              <span className="truncate">{comp.name}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {comp.purpose}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {comp.technologies.slice(0, 2).map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {comp.technologies.length > 2 && (
                                <span className="text-[10px] font-mono text-slate-400 px-1">
                                  +{comp.technologies.length - 2}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {layerIdx < layersOrder.length - 1 && (
                    <div className="flex justify-center -my-1.5 relative z-10">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 shadow-xs">
                        <ArrowRight className="w-2.5 h-2.5 rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              {selectedComponent ? (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-600 font-semibold block mb-1">
                      {selectedComponent.layer} Layer
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{selectedComponent.name}</h4>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Role & Purpose
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedComponent.purpose}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Selected Technologies & Stacks
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedComponent.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono bg-indigo-50/70 text-indigo-900 border border-indigo-100/80 px-2.5 py-1 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedComponent.connections && selectedComponent.connections.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Connected Subsystems
                      </h5>
                      <ul className="space-y-1.5">
                        {selectedComponent.connections.map((conn, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100"
                          >
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800">{conn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Select a component from the topology flow to inspect its details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mermaid Syntax View */}
      {activeView === 'mermaid' && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
            <span>Mermaid.js Flow Definition</span>
            <button
              onClick={copyMermaid}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
            >
              {copiedMermaid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedMermaid ? 'Copied' : 'Copy Mermaid Code'}
            </button>
          </div>
          <pre className="text-emerald-400 leading-relaxed">{result.mermaidDiagram}</pre>
        </div>
      )}
    </div>
  );
};

