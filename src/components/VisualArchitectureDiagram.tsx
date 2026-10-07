import React, { useState, useMemo, useRef } from 'react';
import { ArchitectureResult, DiagramNode, DiagramEdge, DiagramComponentType } from '../types/architecture';
import { getOrBuildArchitectureDiagram } from '../utils/diagramBuilder';
import {
  Users,
  Globe,
  Shuffle,
  ShieldCheck,
  Cpu,
  HardDrive,
  Mail,
  Database,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';

interface Props {
  result: ArchitectureResult;
  onSelectNode?: (node: DiagramNode | null) => void;
}

// Map each category to iconic branding and styling
const CATEGORY_STYLES: Record<
  DiagramComponentType,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgBadge: string;
    borderColor: string;
    textColor: string;
    headerBg: string;
    description: string;
  }
> = {
  Users: {
    icon: Users,
    accentColor: '#4f46e5', // indigo
    bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-950',
    headerBg: 'bg-indigo-50/80',
    description: 'Clients, web browsers, mobile apps, and third-party consumers',
  },
  CDN: {
    icon: Globe,
    accentColor: '#0284c7', // sky
    bgBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-950',
    headerBg: 'bg-sky-50/80',
    description: 'Global edge content distribution, static caching & DDoS shield',
  },
  'Load Balancer': {
    icon: Shuffle,
    accentColor: '#0d9488', // teal
    bgBadge: 'bg-teal-50 text-teal-700 border-teal-200',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-950',
    headerBg: 'bg-teal-50/80',
    description: 'Layer 7 / Layer 4 traffic distribution & TLS termination',
  },
  'API Gateway': {
    icon: ShieldCheck,
    accentColor: '#7c3aed', // violet
    bgBadge: 'bg-violet-50 text-violet-700 border-violet-200',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-950',
    headerBg: 'bg-violet-50/80',
    description: 'Reverse proxy, JWT authentication, rate limiting, and route dispatch',
  },
  'Application Services': {
    icon: Cpu,
    accentColor: '#2563eb', // blue
    bgBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-950',
    headerBg: 'bg-blue-50/80',
    description: 'Core microservices, domain logic, worker nodes, and async compute',
  },
  Cache: {
    icon: HardDrive,
    accentColor: '#059669', // emerald
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-950',
    headerBg: 'bg-emerald-50/80',
    description: 'Sub-millisecond in-memory session and hot-query caching',
  },
  'Message Queues': {
    icon: Mail,
    accentColor: '#d97706', // amber
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-950',
    headerBg: 'bg-amber-50/80',
    description: 'Decoupled asynchronous event streaming and publish/subscribe brokers',
  },
  Databases: {
    icon: Database,
    accentColor: '#9333ea', // purple
    bgBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-950',
    headerBg: 'bg-purple-50/80',
    description: 'Primary transactional OLTP persistence, read replicas, and data warehouse',
  },
};

export const VisualArchitectureDiagram: React.FC<Props> = ({ result, onSelectNode }) => {
  const diagram = useMemo(() => getOrBuildArchitectureDiagram(result), [result]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(diagram.nodes[0]?.id || null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [animateFlow, setAnimateFlow] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on canvas background or dragging
    if ((e.target as HTMLElement).closest('.interactive-node-card')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Group nodes into sequential architectural tiers
  const tierDefinitions: { tier: number; title: string; category: DiagramComponentType }[] = [
    { tier: 1, title: 'Clients & Users', category: 'Users' },
    { tier: 2, title: 'Edge & CDN', category: 'CDN' },
    { tier: 3, title: 'Ingress & Load Balancer', category: 'Load Balancer' },
    { tier: 4, title: 'API Gateway & Security', category: 'API Gateway' },
    { tier: 5, title: 'Application Services', category: 'Application Services' },
    { tier: 6, title: 'Cache & Event Queues', category: 'Cache' },
    { tier: 7, title: 'Persistence & Databases', category: 'Databases' },
  ];

  const selectedNode = useMemo(() => {
    return diagram.nodes.find((n) => n.id === selectedNodeId) || diagram.nodes[0] || null;
  }, [diagram.nodes, selectedNodeId]);

  // Map of connected node IDs for the active/hovered node
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedEdgeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const edgeIds = new Set<string>();
    diagram.edges.forEach((e) => {
      if (e.source === activeNodeId || e.target === activeNodeId) {
        edgeIds.add(e.id);
      }
    });
    return edgeIds;
  }, [diagram.edges, activeNodeId]);

  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const ids = new Set<string>([activeNodeId]);
    diagram.edges.forEach((e) => {
      if (e.source === activeNodeId) ids.add(e.target);
      if (e.target === activeNodeId) ids.add(e.source);
    });
    return ids;
  }, [diagram.edges, activeNodeId]);

  // Outgoing and Incoming edges for inspector
  const inspectorEdges = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const incoming = diagram.edges
      .filter((e) => e.target === selectedNode.id)
      .map((e) => ({
        edge: e,
        node: diagram.nodes.find((n) => n.id === e.source),
      }));
    const outgoing = diagram.edges
      .filter((e) => e.source === selectedNode.id)
      .map((e) => ({
        edge: e,
        node: diagram.nodes.find((n) => n.id === e.target),
      }));
    return { incoming, outgoing };
  }, [selectedNode, diagram.edges, diagram.nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (filterCategory === 'All') return diagram.nodes;
    return diagram.nodes.filter((n) => n.category === filterCategory);
  }, [diagram.nodes, filterCategory]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Header & Interactive Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Visual Software Architecture
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">Directional Data Pipeline</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {diagram.title || `${result.projectName} System Component Topology`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
              {diagram.summary}
            </p>
          </div>

          {/* Interactive Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Animation Toggle */}
            <button
              onClick={() => setAnimateFlow(!animateFlow)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                animateFlow
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle animated data flow pulses"
            >
              {animateFlow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{animateFlow ? 'Flow Active' : 'Pause Flow'}</span>
            </button>

            {/* Edge labels toggle */}
            <button
              onClick={() => setShowEdgeLabels(!showEdgeLabels)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                showEdgeLabels
                  ? 'bg-white border-slate-300 text-slate-800 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Protocol Labels
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-600 px-2 min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors ml-0.5"
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Legend & Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 uppercase tracking-wider">
              Filter:
            </span>
            {['All', 'Users', 'CDN', 'Load Balancer', 'API Gateway', 'Application Services', 'Cache', 'Message Queues', 'Databases'].map(
              (cat) => {
                const isSelected = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
              <span className="w-2 h-0.5 bg-indigo-500 inline-block"></span> Sync Request
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
              <span className="w-2 h-0.5 bg-amber-500 border-b border-dashed inline-block"></span> Async Event
            </span>
          </div>
        </div>
      </div>

      {/* Main Diagram Area with Side Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12">
        {/* Visual Flow Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`xl:col-span-8 p-6 bg-slate-50/60 overflow-hidden min-h-[620px] flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-slate-200 relative select-none ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div
            className="space-y-6 transition-transform duration-100 origin-top-left"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            }}
          >
            {/* Visual Tiers Pipeline */}
            {tierDefinitions.map((tierDef, tierIdx) => {
              const tierNodes = filteredNodes.filter((n) => {
                if (tierDef.category === 'Cache' || tierDef.category === 'Message Queues') {
                  return n.category === 'Cache' || n.category === 'Message Queues';
                }
                return n.category === tierDef.category;
              });

              // Skip duplicate rendering of Tier 6 for Cache vs Queue
              if (tierDef.category === 'Message Queues') return null;
              if (tierNodes.length === 0) return null;

              const style = CATEGORY_STYLES[tierDef.category];
              const TierIcon = style.icon;

              return (
                <div key={tierDef.tier} className="relative group">
                  {/* Tier Container */}
                  <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all">
                    {/* Tier Header Label */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white shadow-2xs"
                          style={{ backgroundColor: style.accentColor }}
                        >
                          <TierIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 tracking-tight">
                            {tierDef.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {style.description}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        Tier {tierDef.tier}
                      </span>
                    </div>

                    {/* Nodes in this Tier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {tierNodes.map((node) => {
                        const isSelected = selectedNode?.id === node.id;
                        const isHovered = hoveredNodeId === node.id;
                        const isConnected = activeNodeId ? connectedNodeIds.has(node.id) : true;
                        const nodeStyle = CATEGORY_STYLES[node.category] || style;
                        const NodeIcon = nodeStyle.icon;

                        return (
                          <div
                            key={node.id}
                            onClick={() => {
                              setSelectedNodeId(node.id);
                              if (onSelectNode) onSelectNode(node);
                            }}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            className={`interactive-node-card cursor-pointer text-left p-3.5 rounded-xl border transition-all relative select-none ${
                              isSelected
                                ? 'bg-white ring-2 ring-indigo-600 shadow-sm border-transparent'
                                : isHovered
                                ? 'bg-white border-slate-300 shadow-2xs'
                                : isConnected
                                ? 'bg-slate-50/70 border-slate-200 hover:bg-white text-slate-800'
                                : 'bg-slate-50/40 border-slate-200 opacity-40 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${nodeStyle.bgBadge}`}
                              >
                                <NodeIcon className="w-3 h-3" />
                                {node.category}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              )}
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                              {node.name}
                            </h5>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                              {node.role}
                            </p>

                            {/* Tech stack tags */}
                            <div className="flex flex-wrap gap-1">
                              {node.technologies.slice(0, 2).map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs"
                                >
                                  {tech}
                                </span>
                              ))}
                              {node.technologies.length > 2 && (
                                <span className="text-[10px] font-mono text-slate-400 px-1">
                                  +{node.technologies.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flow Arrow to next tier with directional protocol label */}
                  {tierIdx < tierDefinitions.length - 1 && (
                    <div className="flex flex-col items-center my-2 relative z-10">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs text-[11px] text-slate-500">
                        <span className="font-mono text-indigo-600 font-semibold text-[10px]">
                          ▼ DATA FLOW
                        </span>
                        {showEdgeLabels && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            {tierDef.tier === 1
                              ? 'HTTPS / TLS 1.3'
                              : tierDef.tier === 2
                              ? 'Origin Pass / WAF'
                              : tierDef.tier === 3
                              ? 'HTTP2 / TCP Routing'
                              : tierDef.tier === 4
                              ? 'gRPC / JWT Validated'
                              : tierDef.tier === 5
                              ? 'SQL / PubSub / Cache Query'
                              : 'Commit & Replicate'}
                          </span>
                        )}
                        {animateFlow && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Component Inspector Panel */}
        <div className="xl:col-span-4 p-5 bg-white flex flex-col justify-between space-y-6">
          {selectedNode ? (
            <div className="space-y-5">
              {/* Selected Node Header */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      CATEGORY_STYLES[selectedNode.category]?.bgBadge
                    }`}
                  >
                    {selectedNode.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Tier {selectedNode.tier}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {selectedNode.name}
                </h4>
              </div>

              {/* Functional Role */}
              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Component Responsibility & Role
                </h5>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {selectedNode.role}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Concrete Technologies & Stacks
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingress / Upstream Dependencies */}
              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Upstream Ingress (Data Sources)</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {inspectorEdges.incoming.length} incoming
                  </span>
                </h5>
                {inspectorEdges.incoming.length > 0 ? (
                  <div className="space-y-1.5">
                    {inspectorEdges.incoming.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-indigo-500 rotate-180 shrink-0" />
                            {item.node?.name || item.edge.source}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                            {item.edge.protocol || 'TCP'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{item.edge.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Top of ingestion pipeline (Edge origin)</p>
                )}
              </div>

              {/* Downstream Egress / Outgoing Paths */}
              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Downstream Egress (Data Targets)</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {inspectorEdges.outgoing.length} outgoing
                  </span>
                </h5>
                {inspectorEdges.outgoing.length > 0 ? (
                  <div className="space-y-1.5">
                    {inspectorEdges.outgoing.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                            {item.node?.name || item.edge.target}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {item.edge.protocol || 'gRPC / SQL'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{item.edge.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Terminal storage layer (Data sink)</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Select a component node from the topology map to inspect its connections and data flow.
            </div>
          )}

          {/* Bottom Guidance Info */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              Dynamically derived from Gemini systems reasoning based on specified cloud & SLAs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
