import React from 'react';
import { ArchitectureResult } from '../../types/architecture';
import { Shield, Key, Lock, Network, Database } from 'lucide-react';

interface Props {
  result: ArchitectureResult;
}

export const SecurityTab: React.FC<Props> = ({ result }) => {
  const { securityConsiderations, apiDesign } = result;

  // Group security controls or highlight key dimensions:
  // - Authentication
  // - Authorization
  // - Encryption (At Rest & In Transit)
  // - Secrets Management
  // - Network Security
  const securityPillars = [
    {
      title: 'Authentication (AuthN)',
      icon: Key,
      tech: apiDesign.authMethod || 'OAuth2 / OIDC & JWT Bearer Tokens',
      summary: 'Identity federation, token signing, session lifecycle, and MFA verification.',
    },
    {
      title: 'Authorization (AuthZ)',
      icon: Lock,
      tech: 'Role-Based Access Control (RBAC) & Fine-Grained Scopes',
      summary: 'Principle of least privilege, token claims validation, and tenant segregation.',
    },
    {
      title: 'Encryption (Rest & Transit)',
      icon: Database,
      tech: 'TLS 1.3 in-transit & AES-256 / KMS at rest',
      summary: 'End-to-end cryptographic protection for database disks, backups, and API traffic.',
    },
    {
      title: 'Secrets & Key Management',
      icon: Shield,
      tech: 'Cloud KMS / HashiCorp Vault / Secrets Manager',
      summary: 'Automated secret rotation, zero plaintext keys in source repositories.',
    },
    {
      title: 'Network & Perimeter Security',
      icon: Network,
      tech: 'VPC Private Subnets, Cloud WAF, DDoS Shield',
      summary: 'Network isolation, rate-limiting ingress filters, and egress firewall rules.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Security Architecture & Defense-in-Depth
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Authentication, authorization, cryptographic protection, secrets management, and network perimeter controls.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          {securityConsiderations.length} Controls Evaluated
        </span>
      </div>

      {/* 5 Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {securityPillars.map((pillar, idx) => {
          const PillarIcon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <PillarIcon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{pillar.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {pillar.summary}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded block truncate">
                  {pillar.tech}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Security Recommendations Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Specific Threat Vectors & Architectural Controls
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityConsiderations.map((sec, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Domain Header */}
                <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    {sec.domain}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Control #{idx + 1}</span>
                </div>

                {/* Risk Identified */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Threat / Vulnerability Addressed
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {sec.riskIdentified}
                  </p>
                </div>

                {/* Architectural Control */}
                <div className="mt-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold block mb-1">
                    Architectural Control
                  </span>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    {sec.architecturalControl}
                  </p>
                </div>
              </div>

              {/* Implementation Detail */}
              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Implementation Detail
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sec.implementationDetail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
