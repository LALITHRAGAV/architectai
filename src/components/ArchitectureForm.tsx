import React, { useState } from 'react';
import { ArchitectureInput } from '../types/architecture';
import { SAMPLE_TEMPLATES, SampleTemplate } from '../data/sampleTemplates';
import { Sparkles, Compass, Server, Users, Cloud, DollarSign, Cpu, Loader2, Info } from 'lucide-react';

interface Props {
  input: ArchitectureInput;
  onChange: (input: ArchitectureInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ArchitectureForm: React.FC<Props> = ({ input, onChange, onSubmit, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const userScaleOptions = [
    '< 10k Active Users',
    '100k Active Users (Peak: 2,000 req/s)',
    '1M - 10M Global MAU (High Concurrency)',
    '100M+ Hyperscale (Global Multi-Region)',
  ];

  const availabilityOptions = [
    { label: '99.0% (Standard SLA - ~87.6 hrs/yr)', value: '99.0% (Standard SLA)' },
    { label: '99.9% (Three Nines - ~8.7 hrs/yr)', value: '99.9% (Three Nines - SaaS Standard)' },
    { label: '99.99% (Four Nines - ~52.6 min/yr)', value: '99.99% (Four Nines - High Availability)' },
    { label: '99.999% (Five Nines - ~5.2 min/yr)', value: '99.999% (Five Nines - Mission Critical)' },
  ];

  const cloudOptions = [
    'AWS (Amazon Web Services)',
    'Google Cloud Platform (GCP)',
    'Microsoft Azure',
    'Cloud Agnostic / Kubernetes',
    'Hybrid / On-Premises',
  ];

  const budgetOptions = [
    'Bootstrap (< $500 / mo)',
    'Growth ($500 - $3,000 / mo)',
    'Scale ($3,000 - $15,000 / mo)',
    'Hyperscale Enterprise (> $15,000 / mo)',
  ];

  const architectureOptions = [
    'Architect Recommendation (Best Fit)',
    'Event-Driven Microservices',
    'Modular Monolith',
    'Serverless-First',
    'CQRS & Event Sourcing',
    'Service-Oriented (SOA)',
    'Edge / Jamstack Distributed',
  ];

  const handleTemplateSelect = (template: SampleTemplate) => {
    onChange({ ...template.input });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.description.trim()) return;
    onSubmit();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Templates Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              Software Requirements Specification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your system requirements or load a production blueprint preset to analyze.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Quick Presets:</span>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleTemplateSelect(tmpl)}
              className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors text-xs group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-indigo-900 block truncate">
                {tmpl.name}
              </span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-500 block truncate mt-0.5">
                {tmpl.tagline}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Application Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Application Description & Core Domain Logic *</span>
            <span className="text-[11px] text-slate-400 normal-case font-normal">
              {input.description.length} characters
            </span>
          </label>
          <textarea
            rows={4}
            value={input.description}
            onChange={(e) => onChange({ ...input, description: e.target.value })}
            placeholder="Describe the application, primary user journeys, domain entities, transaction characteristics, and specific business workflows..."
            className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white leading-relaxed resize-y"
            required
          />
        </div>

        {/* 2. Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expected Number of Users */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Expected Scale & Traffic Volume</span>
            </label>
            <input
              type="text"
              value={input.expectedUsers}
              onChange={(e) => onChange({ ...input, expectedUsers: e.target.value })}
              placeholder="e.g. 500,000 Monthly Active Users (Peak: 3,000 req/s)"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {userScaleOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({ ...input, expectedUsers: opt })}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  {opt.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Availability SLA */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Availability & SLA Requirement</span>
            </label>
            <select
              value={input.availability}
              onChange={(e) => onChange({ ...input, availability: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white"
            >
              {availabilityOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Drives redundancy, multi-region replication, and failover design.
            </span>
          </div>

          {/* Preferred Cloud Provider */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Preferred Cloud Provider</span>
            </label>
            <select
              value={input.cloudProvider}
              onChange={(e) => onChange({ ...input, cloudProvider: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white"
            >
              {cloudOptions.map((cloud, idx) => (
                <option key={idx} value={cloud}>
                  {cloud}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Infrastructure Budget</span>
            </label>
            <select
              value={input.budget}
              onChange={(e) => onChange({ ...input, budget: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white"
            >
              {budgetOptions.map((b, idx) => (
                <option key={idx} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Architecture Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Architecture Style Preference</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {architectureOptions.map((arch, idx) => {
              const isSelected = input.architecturePreference === arch;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({ ...input, architecturePreference: arch })}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/60'
                  }`}
                >
                  <span className="block truncate">{arch}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Additional Notes Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <span>{showAdvanced ? 'Hide Additional Constraints' : '+ Add Compliance & Special Constraints'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2.5">
              <textarea
                rows={2}
                value={input.additionalNotes || ''}
                onChange={(e) => onChange({ ...input, additionalNotes: e.target.value })}
                placeholder="e.g. HIPAA / PCI-DSS compliance, GDPR EU residency requirement, zero-downtime Blue/Green deployments, low latency < 30ms..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white resize-y"
              />
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Analyzes 11 architectural dimensions with Gemini reasoning</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.description.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Engineering System Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Architecture</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
