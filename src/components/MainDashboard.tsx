import React from 'react';
import { SavedArchitecture } from '../types/architecture';
import {
  Compass,
  Layers,
  Search,
  Activity,
  Shield,
  Server,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Trash2,
} from 'lucide-react';

interface Props {
  savedArchitectures: SavedArchitecture[];
  onSelectProject: (saved: SavedArchitecture) => void;
  onNewArchitecture: () => void;
  onDeleteProject?: (id: string) => void;
}

export const MainDashboard: React.FC<Props> = ({
  savedArchitectures,
  onSelectProject,
  onNewArchitecture,
  onDeleteProject,
}) => {
  // Aggregate real statistics across saved architectures
  const totalProjects = savedArchitectures.length;
  const architecturesGenerated = totalProjects;

  const reviewsWithScores = savedArchitectures
    .map((s) => s.result?.review?.overallHealthScore)
    .filter((score): score is number => typeof score === 'number');

  const totalReviews = reviewsWithScores.length;
  const avgHealthScore =
    reviewsWithScores.length > 0
      ? Math.round(
          reviewsWithScores.reduce((acc, score) => acc + score, 0) / reviewsWithScores.length
        )
      : null;

  // Gather latest available category scores from recent reviews if available
  const latestReview = savedArchitectures.find((s) => s.result?.review)?.result?.review;
  const categoryScores = latestReview?.categoryScores;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Engineering Workspace
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">Overview Dashboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Software Architecture Portfolio
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Formulate, inspect, review, and compare resilient cloud system architectures. Create new specifications or reopen saved sessions below.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNewArchitecture}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Create New Architecture</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Total Projects
            </span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{totalProjects}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Stored design workspaces</span>
        </div>

        {/* Architectures Generated */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Architectures
            </span>
            <Compass className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {architecturesGenerated}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">System topologies active</span>
        </div>

        {/* Architecture Reviews */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Reviews Run
            </span>
            <Search className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{totalReviews}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">AI audit evaluations</span>
        </div>

        {/* Average Health Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Avg Health Score
            </span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {avgHealthScore !== null ? `${avgHealthScore}/100` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {avgHealthScore !== null ? 'Across audited projects' : 'No reviews recorded yet'}
          </span>
        </div>
      </div>

      {/* Visual Indicator Cards (Using real AI scores if available) */}
      {categoryScores && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Latest System Architecture Health Assessment
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Score: {latestReview?.overallHealthScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-indigo-500" /> Scalability
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {categoryScores.scalability}/100
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" /> Security
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {categoryScores.security}/100
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1 flex items-center gap-1">
                <Server className="w-3 h-3 text-sky-500" /> Availability
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {categoryScores.availability}/100
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-500" /> Cost Efficiency
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {categoryScores.costEfficiency}/100
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3 text-purple-500" /> Reliability
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {categoryScores.reliability}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
            <p className="text-xs text-slate-500">
              Access previously generated systems, diagrams, and design specifications.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {savedArchitectures.length} Total
          </span>
        </div>

        {savedArchitectures.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Architecture Projects Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by defining your application requirements, expected scale, and cloud constraints.
            </p>
            <button
              onClick={onNewArchitecture}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create First Architecture</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {savedArchitectures.map((item) => {
              const res = item.result;
              const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex flex-col justify-between gap-3 text-xs group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase">
                        {res.recommendedArchitectureStyle?.name || 'Architecture'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {res.projectName}
                    </h4>

                    <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                      {res.executiveSummary}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 font-mono text-slate-500">
                      <span>{item.input.cloudProvider || 'Cloud'}</span>
                      <span>·</span>
                      <span>{item.input.expectedUsers}</span>
                      {res.review && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-bold">
                            {res.review.overallHealthScore}/100
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectProject(item)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
