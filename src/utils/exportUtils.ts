import {
  ArchitectureResult,
  ArchitectureInput,
  ArchitectureReviewResult,
  ArchitectureComparisonResult,
} from '../types/architecture';

export interface ReportGenerationOptions {
  result: ArchitectureResult;
  input: ArchitectureInput;
  review?: ArchitectureReviewResult | null;
  comparison?: ArchitectureComparisonResult | null;
  format?: 'markdown' | 'text';
}

function renderTextDiagram(result: ArchitectureResult): string {
  if (result.diagram?.nodes && result.diagram.nodes.length > 0) {
    const lines: string[] = [];
    lines.push('Topology Architecture Map:');
    const nodesByTier: Record<number, string[]> = {};
    for (const node of result.diagram.nodes) {
      const tier = node.tier || 1;
      if (!nodesByTier[tier]) nodesByTier[tier] = [];
      nodesByTier[tier].push(`[${node.name} (${node.category})]`);
    }

    const sortedTiers = Object.keys(nodesByTier).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierNum = sortedTiers[i];
      lines.push(`  Tier ${tierNum}: ${nodesByTier[tierNum].join('  ---  ')}`);
      if (i < sortedTiers.length - 1) {
        lines.push('        │');
        lines.push('        ▼ (Network / API Flow)');
      }
    }

    if (result.diagram.edges && result.diagram.edges.length > 0) {
      lines.push('');
      lines.push('Key Service Communication Flows:');
      for (const edge of result.diagram.edges.slice(0, 10)) {
        lines.push(`  - ${edge.source} ===[ ${edge.label || edge.protocol} ]===> ${edge.target}`);
      }
    }

    return lines.join('\n');
  }

  // Fallback text diagram from components
  if (result.architectureComponents && result.architectureComponents.length > 0) {
    const lines: string[] = ['Components Flow:'];
    for (const c of result.architectureComponents) {
      lines.push(`  [${c.name} (${c.layer})] --> ${c.connections?.length ? c.connections.join(', ') : 'Integrated Datastores'}`);
    }
    return lines.join('\n');
  }

  return 'Not available / Not generated.';
}

export function generateFullArchitectureReport(options: ReportGenerationOptions): string {
  const { result, input, review, comparison, format = 'markdown' } = options;
  const isMd = format === 'markdown';
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const formatList = (items: string[] | undefined, emptyText = 'Not available / Not generated.') => {
    if (!items || items.length === 0) return emptyText;
    return items.map((i) => (isMd ? `- ${i}` : `  * ${i}`)).join('\n');
  };

  const h1 = (title: string) => (isMd ? `# ${title}\n` : `================================================================================\n${title.toUpperCase()}\n================================================================================\n`);
  const h2 = (title: string) => (isMd ? `\n## ${title}\n` : `\n--------------------------------------------------------------------------------\n${title}\n--------------------------------------------------------------------------------\n`);
  const h3 = (title: string) => (isMd ? `\n### ${title}\n` : `\n[ ${title} ]\n`);
  const bold = (label: string, value: string) => (isMd ? `- **${label}**: ${value}` : `  * ${label}: ${value}`);
  const divider = () => (isMd ? '\n---\n' : '\n');

  let report = '';

  // Title
  report += h1(`Software Architecture Design Report: ${result.projectName || 'System Architecture'}`);
  report += isMd
    ? `> **Author**: AI Senior Software Architect Engine  \n> **Generated**: ${dateStr}  \n> **Evaluation Target**: Engineering Design Review & RFC Specification\n\n`
    : `Author: AI Senior Software Architect Engine\nGenerated: ${dateStr}\nEvaluation Target: Engineering Design Review & RFC Specification\n\n`;

  // 1. Project Overview
  report += h2('1. Project Overview');
  report += bold('Project Name', result.projectName || 'Not specified') + '\n';
  report += bold('Description', input.description || 'Not available / Not generated.') + '\n';
  report += bold('Cloud Provider', input.cloudProvider || 'General / Cloud-Agnostic') + '\n';
  report += bold('Expected Scale / Users', input.expectedUsers || 'Not specified') + '\n';
  report += bold('Availability SLA Requirement', input.availability || '99.9%') + '\n';
  report += bold('Infrastructure Budget Target', input.budget || 'Flexible') + '\n';
  report += bold('Estimated Architecture Complexity', result.estimatedComplexity || 'Moderate') + '\n';
  report += bold('Estimated Monthly Cost Range', result.estimatedMonthlyCostRange || 'Not available / Not generated.') + '\n';

  // 2. Requirements
  report += h2('2. Requirements');
  report += h3('Functional Requirements');
  if (result.functionalRequirements && result.functionalRequirements.length > 0) {
    report += result.functionalRequirements
      .map((req) => {
        let text = isMd
          ? `**${req.id || 'REQ'}: ${req.title}** (Priority: ${req.priority})\n${req.description}\n`
          : `* ${req.id || 'REQ'}: ${req.title} [Priority: ${req.priority}]\n  Description: ${req.description}\n`;
        if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
          text += isMd ? `*Acceptance Criteria:*\n` : `  Acceptance Criteria:\n`;
          text += req.acceptanceCriteria.map((ac) => (isMd ? `  - ${ac}` : `    - ${ac}`)).join('\n') + '\n';
        }
        return text;
      })
      .join('\n');
  } else {
    report += 'Not available / Not generated.\n';
  }

  report += h3('Non-Functional Requirements');
  if (result.nonFunctionalRequirements && result.nonFunctionalRequirements.length > 0) {
    if (isMd) {
      report += '| Category | Metric | Target SLA | Implementation Strategy |\n| :--- | :--- | :--- | :--- |\n';
      report += result.nonFunctionalRequirements
        .map((nfr) => `| **${nfr.category}** | ${nfr.metric} | \`${nfr.target}\` | ${nfr.implementationStrategy} |`)
        .join('\n') + '\n';
    } else {
      report += result.nonFunctionalRequirements
        .map(
          (nfr) =>
            `* [${nfr.category}] Metric: ${nfr.metric} | Target: ${nfr.target}\n  Strategy: ${nfr.implementationStrategy}`
        )
        .join('\n\n') + '\n';
    }
  } else {
    report += 'Not available / Not generated.\n';
  }

  // 3. Architecture Overview
  report += h2('3. Architecture Overview');
  report += bold('Architecture Style', result.recommendedArchitectureStyle?.name || 'Not specified') + '\n';
  report += bold('Architecture Summary', result.executiveSummary || 'Not available / Not generated.') + '\n';

  report += h3('Architectural Style Rationale');
  report += (result.recommendedArchitectureStyle?.rationale || 'Not available / Not generated.') + '\n';

  if (result.recommendedArchitectureStyle?.keyCharacteristics?.length) {
    report += h3('Key Architectural Characteristics');
    report += formatList(result.recommendedArchitectureStyle.keyCharacteristics) + '\n';
  }

  report += h3('System Components Breakdown');
  if (result.architectureComponents && result.architectureComponents.length > 0) {
    report += result.architectureComponents
      .map((c) => {
        let text = isMd
          ? `**${c.name}** (\`${c.layer}\`)\n- **Purpose**: ${c.purpose}\n- **Technologies**: ${c.technologies?.join(', ') || 'Standard'}\n`
          : `* Component: ${c.name} [Layer: ${c.layer}]\n  Purpose: ${c.purpose}\n  Technologies: ${c.technologies?.join(', ') || 'Standard'}\n`;
        if (c.connections?.length) {
          text += isMd ? `- **Connections**: ${c.connections.join(' -> ')}\n` : `  Connections: ${c.connections.join(' -> ')}\n`;
        }
        return text;
      })
      .join('\n');
  } else {
    report += 'Not available / Not generated.\n';
  }

  report += h3('Data Flow & Request Lifecycle');
  if (result.diagram?.edges && result.diagram.edges.length > 0) {
    report += result.diagram.edges
      .map((e) =>
        isMd
          ? `- **${e.source}** -> **${e.target}**: ${e.label} (Protocol: \`${e.protocol}\`)`
          : `  * ${e.source} -> ${e.target}: ${e.label} [Protocol: ${e.protocol}]`
      )
      .join('\n') + '\n';
  } else {
    report +=
      '1. Client applications initiate encrypted HTTPS / TLS 1.3 requests via global CDN and edge shield.\n' +
      '2. API Gateway validates JWT authentication tokens, enforces rate limiting, and routes to appropriate service.\n' +
      '3. Core application services process business rules and query cache or primary datastore.\n' +
      '4. Transactions are persisted with ACID guarantees and asynchronously propagated to read replicas / caches.\n';
  }

  // 4. Architecture Diagram
  report += h2('4. Architecture Diagram');
  if (isMd && result.mermaidDiagram) {
    report += '```mermaid\n' + result.mermaidDiagram + '\n```\n\n';
  }
  report += h3('System Topology Textual Mapping');
  report += renderTextDiagram(result) + '\n';

  // 5. Services
  report += h2('5. Services');
  if (result.services && result.services.length > 0) {
    report += result.services
      .map((s) => {
        let text = isMd
          ? `### Service: ${s.name} (${s.type})\n`
          : `\n* Service: ${s.name} [Type: ${s.type}]\n`;
        text += bold('Responsibilities', s.responsibilities?.join('; ') || 'Not specified') + '\n';
        text += bold('Communication Protocol', s.communicationProtocol || 'HTTP / REST') + '\n';
        text += bold('Dependencies', s.dependencies?.length ? s.dependencies.join(', ') : 'None / Root Service') + '\n';
        text += bold('Scaling Policy / Trigger', s.scalingTrigger || 'CPU / Memory threshold') + '\n';
        return text;
      })
      .join('\n');
  } else {
    report += 'Not available / Not generated.\n';
  }

  // 6. Database & Storage
  report += h2('6. Database & Storage');
  if (result.databaseRecommendation) {
    const db = result.databaseRecommendation;
    report += h3('Primary Datastore');
    report += bold('Technology', db.primaryStore?.technology || 'Not specified') + '\n';
    report += bold('Database Type', db.primaryStore?.type || 'Relational SQL') + '\n';
    report += bold('Purpose & Justification', db.primaryStore?.justification || 'Not specified') + '\n';
    report += bold('Schema Strategy', db.primaryStore?.schemaStrategy || 'Relational schemas') + '\n';
    report += bold('Replication & Sharding', db.primaryStore?.shardingOrReplication || 'Multi-AZ replication') + '\n';

    report += h3('Caching Layer');
    report += bold('Technology', db.cacheLayer?.technology || 'Redis') + '\n';
    report += bold('Strategy', db.cacheLayer?.strategy || 'Cache-aside') + '\n';
    report += bold('TTL Strategy', db.cacheLayer?.ttlStrategy || 'Session and dynamic TTLs') + '\n';

    if (db.specializedStores && db.specializedStores.length > 0) {
      report += h3('Specialized Storage / Object Stores');
      report += db.specializedStores
        .map((store) => bold(store.purpose, `${store.technology} - ${store.justification}`))
        .join('\n') + '\n';
    }

    if (db.backupAndDisasterRecovery) {
      report += h3('Backup & Disaster Recovery Strategy');
      report += bold('RPO (Recovery Point Objective)', db.backupAndDisasterRecovery.rpo) + '\n';
      report += bold('RTO (Recovery Time Objective)', db.backupAndDisasterRecovery.rto) + '\n';
      report += bold('Backup Strategy', db.backupAndDisasterRecovery.strategy) + '\n';
    }
  } else {
    report += 'Not available / Not generated.\n';
  }

  // 7. API Design
  report += h2('7. API Design');
  if (result.apiDesign) {
    const api = result.apiDesign;
    report += bold('API Paradigm', api.paradigm || 'RESTful API') + '\n';
    report += bold('Gateway Technology', api.gatewayTechnology || 'API Gateway') + '\n';
    report += bold('Authentication Method', api.authMethod || 'JWT / OAuth 2.0') + '\n';
    report += bold('Versioning Strategy', api.versioningStrategy || 'URI path versioning (/v1)') + '\n';
    report += bold('Rate Limiting & Throttling', api.rateLimitingAndThrottling || 'Token bucket per client IP') + '\n';

    report += h3('Key Endpoints');
    if (api.keyEndpoints && api.keyEndpoints.length > 0) {
      if (isMd) {
        report += '| Method | Path | Auth | Rate Limit | Purpose |\n| :--- | :--- | :--- | :--- | :--- |\n';
        report += api.keyEndpoints
          .map((ep) => `| \`${ep.method}\` | \`${ep.path}\` | ${ep.authRequired ? 'Yes' : 'No'} | ${ep.rateLimit} | ${ep.description} |`)
          .join('\n') + '\n';
      } else {
        report += api.keyEndpoints
          .map(
            (ep) =>
              `  * [${ep.method}] ${ep.path} (Auth: ${ep.authRequired ? 'Yes' : 'No'}, RateLimit: ${ep.rateLimit})\n    Purpose: ${ep.description}`
          )
          .join('\n\n') + '\n';
      }
    } else {
      report += 'Not available / Not generated.\n';
    }
  } else {
    report += 'Not available / Not generated.\n';
  }

  // 8. Security
  report += h2('8. Security');
  report += bold('Authentication', result.apiDesign?.authMethod || 'OAuth2 / OpenID Connect + Stateless JWT') + '\n';
  report += bold('Authorization', 'Role-Based Access Control (RBAC) with fine-grained claim validation') + '\n';
  report += bold('Encryption in Transit', 'TLS 1.3 enforced at CDN, Load Balancer, and internal mTLS') + '\n';
  report += bold('Encryption at Rest', 'AES-256 for datastores, persistent volumes, and S3/GCS buckets with KMS') + '\n';
  report += bold('Secrets Management', 'Cloud Secret Manager / AWS Secrets Manager with automated rotation') + '\n';
  report += bold('Network Security', 'VPC with private subnets, NAT gateway, Security Groups, and WAF protection') + '\n';

  if (result.securityConsiderations && result.securityConsiderations.length > 0) {
    report += h3('Security Architectural Controls');
    report += result.securityConsiderations
      .map(
        (sec) =>
          isMd
            ? `**${sec.domain}**\n- Risk: ${sec.riskIdentified}\n- Architectural Control: ${sec.architecturalControl}\n- Implementation: ${sec.implementationDetail}\n`
            : `* Domain: ${sec.domain}\n  Risk: ${sec.riskIdentified}\n  Control: ${sec.architecturalControl}\n  Implementation: ${sec.implementationDetail}\n`
      )
      .join('\n');
  }

  // 9. Scalability
  report += h2('9. Scalability');
  report += bold('Scaling Strategy', 'Horizontal autoscaling based on CPU/Memory and queue latency metrics') + '\n';
  report += bold('Caching Strategy', result.databaseRecommendation?.cacheLayer?.strategy || 'Read-through caching') + '\n';
  report += bold('Load Balancing', 'Layer 7 Application Load Balancer with health checks and SSL termination') + '\n';
  report += bold('Traffic Spikes & Throttling', 'Edge CDN caching, token bucket rate limiting, and backpressure queueing') + '\n';

  if (result.scalabilityConsiderations && result.scalabilityConsiderations.length > 0) {
    report += h3('Scalability Mechanisms');
    report += result.scalabilityConsiderations
      .map(
        (sca) =>
          isMd
            ? `**${sca.aspect}**\n- Technique: ${sca.technique}\n- Bottleneck Mitigation: ${sca.bottleneckMitigation}\n- Failover: ${sca.failoverMechanism}\n`
            : `* Aspect: ${sca.aspect}\n  Technique: ${sca.technique}\n  Bottleneck Mitigation: ${sca.bottleneckMitigation}\n  Failover: ${sca.failoverMechanism}\n`
      )
      .join('\n');
  }

  // 10. Architecture Review
  report += h2('10. Architecture Review');
  if (review) {
    report += bold('Architecture Health Score', `${review.overallHealthScore}/100`) + '\n';
    report += bold('Executive Review Summary', review.executiveReviewSummary) + '\n';

    if (review.categoryScores) {
      report += h3('Category Health Scores');
      const cs = review.categoryScores;
      report += bold('Scalability', `${cs.scalability}/100`) + '\n';
      report += bold('Availability', `${cs.availability}/100`) + '\n';
      report += bold('Performance', `${cs.performance}/100`) + '\n';
      report += bold('Security', `${cs.security}/100`) + '\n';
      report += bold('Reliability', `${cs.reliability}/100`) + '\n';
      report += bold('Cost Efficiency', `${cs.costEfficiency}/100`) + '\n';
    }

    if (review.summaryCounts) {
      report += h3('Finding Summary Counts');
      const sc = review.summaryCounts;
      report += bold('Critical Issues', String(sc.critical || 0)) + '\n';
      report += bold('High Severity Issues', String(sc.high || 0)) + '\n';
      report += bold('Medium Severity Issues', String(sc.medium || 0)) + '\n';
      report += bold('Low Severity Issues', String(sc.low || 0)) + '\n';
      report += bold('Good Practices', String(sc.good || 0)) + '\n';
    }

    if (review.findings && review.findings.length > 0) {
      report += h3('Review Findings & Recommendations');
      report += review.findings
        .map((f, idx) => {
          let text = isMd
            ? `#### Finding ${idx + 1}: [${f.severity}] ${f.title} (${f.category})\n`
            : `\n* Finding ${idx + 1}: [${f.severity}] ${f.title} (Category: ${f.category})\n`;
          text += bold('Problem', f.problem) + '\n';
          text += bold('Why It Matters', f.why_it_matters) + '\n';
          text += bold('Recommendation', f.recommendation) + '\n';
          return text;
        })
        .join('\n');
    }
  } else {
    report += 'Not available / Not generated. (AI Architecture Review has not been run for this session.)\n';
  }

  // 11. Applied Architecture Fixes
  report += h2('11. Applied Architecture Fixes');
  const history = result.changeHistory || [];
  if (history.length > 0) {
    report += `Total Fixes Applied: ${history.length}\n\n`;
    report += history
      .map((item, idx) => {
        let text = isMd
          ? `#### Fix ${idx + 1}: ${item.findingTitle} (${item.appliedAtFormatted || new Date(item.timestamp).toISOString()})\n`
          : `* Fix ${idx + 1}: ${item.findingTitle} [${item.appliedAtFormatted || new Date(item.timestamp).toISOString()}]\n`;
        text += bold('Proposed Change', item.proposedFix) + '\n';
        text += bold('Reason for Change', item.reasonForChange) + '\n';
        text += bold('Affected Components', item.componentsChanged?.join(', ') || 'System-wide') + '\n';
        return text;
      })
      .join('\n');
  } else {
    report += 'Not available / Not generated. (No surgical fixes applied yet.)\n';
  }

  // 12. Architecture Comparison
  report += h2('12. Architecture Comparison');
  if (comparison) {
    report += bold('Option A', `${comparison.optionA?.name || 'Option A'} (${comparison.optionA?.architectureStyle || ''})`) + '\n';
    report += bold('Option A Summary', comparison.optionA?.summary || '') + '\n';
    report += bold('Option B', `${comparison.optionB?.name || 'Option B'} (${comparison.optionB?.architectureStyle || ''})`) + '\n';
    report += bold('Option B Summary', comparison.optionB?.summary || '') + '\n';

    if (comparison.comparison) {
      report += h3('Comparison Scorecard (1-10 Scale)');
      const c = comparison.comparison;
      const metrics = [
        { label: 'Scalability', data: c.scalability },
        { label: 'Availability', data: c.availability },
        { label: 'Performance', data: c.performance },
        { label: 'Security', data: c.security },
        { label: 'Development Simplicity', data: c.developmentComplexity },
        { label: 'Operational Simplicity', data: c.operationalComplexity },
        { label: 'Maintainability', data: c.maintainability },
        { label: 'Cost Efficiency', data: c.cost },
      ];

      if (isMd) {
        report += '| Criterion | Option A Score | Option B Score | Architectural Assessment Rationale |\n| :--- | :--- | :--- | :--- |\n';
        report += metrics
          .map((m) => `| **${m.label}** | ${m.data?.optionA || '-'}/10 | ${m.data?.optionB || '-'}/10 | ${m.data?.reason || ''} |`)
          .join('\n') + '\n';
      } else {
        report += metrics
          .map((m) => `  * ${m.label}: Option A = ${m.data?.optionA}/10 vs Option B = ${m.data?.optionB}/10\n    Rationale: ${m.data?.reason || ''}`)
          .join('\n\n') + '\n';
      }
    }

    if (comparison.recommendation) {
      report += h3('Architect Recommendation');
      report += bold('Selected Option', comparison.recommendation.selectedOption) + '\n';
      report += bold('Deciding Reason', comparison.recommendation.reason) + '\n';
      if (comparison.recommendation.tradeoffs?.length) {
        report += bold('Key Trade-offs', comparison.recommendation.tradeoffs.join('; ')) + '\n';
      }
      report += bold('When to Choose Option A', comparison.recommendation.whenToChooseOptionA || 'Not specified') + '\n';
      report += bold('When to Choose Option B', comparison.recommendation.whenToChooseOptionB || 'Not specified') + '\n';
    }
  } else {
    report += 'Not available / Not generated. (Architecture Comparison has not been synthesized for this session.)\n';
  }

  // 13. Final Architecture Decision
  report += h2('13. Final Architecture Decision');
  report += bold('Selected Architecture', result.recommendedArchitectureStyle?.name || 'Not specified') + '\n';
  report += bold('Why Selected (Decision Driver)', result.adrSummary?.decision || result.recommendedArchitectureStyle?.rationale || 'Not specified') + '\n';

  report += h3('Major Trade-offs Accepted');
  if (result.tradeoffs && result.tradeoffs.length > 0) {
    report += result.tradeoffs
      .map(
        (to) =>
          isMd
            ? `**${to.tradeoffName}**\n- Chosen: ${to.optionChosen}\n- Sacrificed: ${to.sacrificedOption}\n- Rationale: ${to.architecturalRationale}\n- Cost Impact: ${to.operationalCostImpact}\n`
            : `* Trade-off: ${to.tradeoffName}\n  Chosen: ${to.optionChosen} (Sacrificed: ${to.sacrificedOption})\n  Rationale: ${to.architecturalRationale}\n  Cost Impact: ${to.operationalCostImpact}\n`
      )
      .join('\n');
  } else {
    report += 'Not available / Not generated.\n';
  }

  report += h3('Remaining Operational Risks & Mitigations');
  if (result.risks && result.risks.length > 0) {
    if (isMd) {
      report += '| Risk | Probability | Impact | Mitigation Strategy | Monitoring Alarm |\n| :--- | :--- | :--- | :--- | :--- |\n';
      report += result.risks
        .map((r) => `| **${r.risk}** | \`${r.probability}\` | \`${r.impact}\` | ${r.mitigation} | \`${r.monitoringAlarm}\` |`)
        .join('\n') + '\n';
    } else {
      report += result.risks
        .map(
          (r) =>
            `* Risk: ${r.risk} [Prob: ${r.probability}, Impact: ${r.impact}]\n  Mitigation: ${r.mitigation}\n  Alarm: ${r.monitoringAlarm}`
        )
        .join('\n\n') + '\n';
    }
  } else {
    report += 'Not available / Not generated.\n';
  }

  report += divider();
  report += isMd
    ? `\n*End of Architecture Report for ${result.projectName}. Generated by AI Software Architect.*\n`
    : `\nEnd of Architecture Report for ${result.projectName}.\n`;

  return report;
}

// Core Architecture Export Functions
export function generateMarkdownReport(result: ArchitectureResult, input: ArchitectureInput): string {
  const dateStr = new Date().toISOString().split('T')[0];

  return `# Software Architecture Specification: ${result.projectName}
Generated on: ${dateStr}
Author: AI Software Architect Engine

---

## Executive Summary
${result.executiveSummary}

- **Architecture Style**: ${result.recommendedArchitectureStyle.name}
- **Target Cloud Provider**: ${input.cloudProvider || 'Agnostic'}
- **Estimated Complexity**: ${result.estimatedComplexity}
- **Estimated Infrastructure Cost**: ${result.estimatedMonthlyCostRange}
- **Target Availability SLA**: ${input.availability || '99.9%'}

---

## 1. Functional Requirements
${result.functionalRequirements
  .map(
    (req) => `### ${req.id}: ${req.title} [Priority: ${req.priority}]
${req.description}

**Acceptance Criteria:**
${req.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}
`
  )
  .join('\n')}

---

## 2. Non-Functional Requirements
| Category | Metric | Target SLA | Implementation Strategy |
| :--- | :--- | :--- | :--- |
${result.nonFunctionalRequirements
  .map(
    (nfr) =>
      `| **${nfr.category}** | ${nfr.metric} | \`${nfr.target}\` | ${nfr.implementationStrategy} |`
  )
  .join('\n')}

---

## 3. Recommended Architecture Style
**Primary Style**: ${result.recommendedArchitectureStyle.name}

### Rationale & Justification
${result.recommendedArchitectureStyle.rationale}

### Key Architectural Characteristics
${result.recommendedArchitectureStyle.keyCharacteristics.map((c) => `- ${c}`).join('\n')}

### Alternative Styles Evaluated
${result.recommendedArchitectureStyle.alternativeStylesConsidered.map((a) => `- ${a}`).join('\n')}

---

## 4. Architecture Components
${result.architectureComponents
  .map(
    (comp) => `### ${comp.name} (\`${comp.layer}\`)
- **Purpose**: ${comp.purpose}
- **Technologies**: ${comp.technologies.join(', ')}
- **Downstream Connections**: ${comp.connections.join(' -> ')}
`
  )
  .join('\n')}

---

## 5. Domain Services Decomposition
${result.services
  .map(
    (srv) => `### Service: ${srv.name} (${srv.type})
- **Protocol**: \`${srv.communicationProtocol}\`
- **Autoscaling Trigger**: ${srv.scalingTrigger}
- **Dependencies**: ${srv.dependencies.join(', ')}

**Responsibilities:**
${srv.responsibilities.map((r) => `- ${r}`).join('\n')}
`
  )
  .join('\n')}

---

## 6. Database & Storage Architecture
### Primary Datastore
- **Technology**: **${result.databaseRecommendation.primaryStore.technology}** (${result.databaseRecommendation.primaryStore.type})
- **Justification**: ${result.databaseRecommendation.primaryStore.justification}
- **Schema & Partitioning Strategy**: ${result.databaseRecommendation.primaryStore.schemaStrategy}
- **Sharding & Replication**: ${result.databaseRecommendation.primaryStore.shardingOrReplication}

### Caching Strategy
- **Technology**: ${result.databaseRecommendation.cacheLayer.technology}
- **Pattern**: ${result.databaseRecommendation.cacheLayer.strategy}
- **TTL Strategy**: ${result.databaseRecommendation.cacheLayer.ttlStrategy}

### Specialized Datastores
${result.databaseRecommendation.specializedStores
  .map(
    (store) => `- **${store.purpose}**: \`${store.technology}\` - ${store.justification}`
  )
  .join('\n')}

### Backup & Disaster Recovery
- **RPO (Recovery Point Objective)**: \`${result.databaseRecommendation.backupAndDisasterRecovery.rpo}\`
- **RTO (Recovery Time Objective)**: \`${result.databaseRecommendation.backupAndDisasterRecovery.rto}\`
- **Strategy**: ${result.databaseRecommendation.backupAndDisasterRecovery.strategy}

---

## 7. API Design & Integration Contracts
- **API Paradigm**: ${result.apiDesign.paradigm}
- **Gateway**: ${result.apiDesign.gatewayTechnology}
- **Authentication**: ${result.apiDesign.authMethod}
- **Versioning Strategy**: ${result.apiDesign.versioningStrategy}
- **Rate Limiting**: ${result.apiDesign.rateLimitingAndThrottling}

### Primary Endpoints
| Method | Path | Auth | Rate Limit | Purpose |
| :--- | :--- | :--- | :--- | :--- |
${result.apiDesign.keyEndpoints
  .map(
    (ep) =>
      `| \`${ep.method}\` | \`${ep.path}\` | ${ep.authRequired ? 'Yes' : 'No'} | ${ep.rateLimit} | ${ep.description} |`
  )
  .join('\n')}

---

## 8. Security Considerations & Defense-in-Depth
${result.securityConsiderations
  .map(
    (sec) => `### Domain: ${sec.domain}
- **Threat Identified**: ${sec.riskIdentified}
- **Architectural Control**: ${sec.architecturalControl}
- **Implementation Detail**: ${sec.implementationDetail}
`
  )
  .join('\n')}

---

## 9. Scalability Considerations & Bottleneck Mitigations
${result.scalabilityConsiderations
  .map(
    (scale) => `### Aspect: ${scale.aspect}
- **Technique**: ${scale.technique}
- **Bottleneck Mitigation**: ${scale.bottleneckMitigation}
- **Failover Mechanism**: ${scale.failoverMechanism}
`
  )
  .join('\n')}

---

## 10. Architecture Risk Matrix
| Risk | Probability | Impact | Mitigation Strategy | Monitoring Alarm |
| :--- | :--- | :--- | :--- | :--- |
${result.risks
  .map(
    (r) =>
      `| **${r.risk}** | \`${r.probability}\` | \`${r.impact}\` | ${r.mitigation} | \`${r.monitoringAlarm}\` |`
  )
  .join('\n')}

---

## 11. Architectural Trade-offs
${result.tradeoffs
  .map(
    (to) => `### ${to.tradeoffName}
- **Chosen Pattern**: ${to.optionChosen}
- **Sacrificed Characteristic**: ${to.sacrificedOption}
- **Architectural Rationale**: ${to.architecturalRationale}
- **Operational Cost Impact**: ${to.operationalCostImpact}
`
  )
  .join('\n')}

---

## 12. Architecture Decision Record (ADR-001)
- **Status**: ${result.adrSummary.status}
- **Context**: ${result.adrSummary.context}
- **Decision**: ${result.adrSummary.decision}

**Positive Consequences:**
${result.adrSummary.consequencesPositive.map((c) => `+ ${c}`).join('\n')}

**Negative Consequences / Trade-offs:**
${result.adrSummary.consequencesNegative.map((c) => `- ${c}`).join('\n')}

---

## 13. System Topology Flowchart (Mermaid)
\`\`\`mermaid
${result.mermaidDiagram}
\`\`\`
`;
}

export function generateAdrReport(result: ArchitectureResult): string {
  const dateStr = new Date().toISOString().split('T')[0];

  return `# ADR-001: Core Architecture Pattern for ${result.projectName}

**Status:** ${result.adrSummary.status}  
**Date:** ${dateStr}  
**Architect:** AI Software Architect Engine  

## Context
${result.adrSummary.context}

## Decision
${result.adrSummary.decision}

Selected Architecture Pattern: **${result.recommendedArchitectureStyle.name}**  
Primary Datastore: **${result.databaseRecommendation.primaryStore.technology}**  
API Paradigm: **${result.apiDesign.paradigm}**  

## Rationale
${result.recommendedArchitectureStyle.rationale}

## Consequences
### Positive Consequences
${result.adrSummary.consequencesPositive.map((c) => `- ${c}`).join('\n')}

### Negative Consequences & Mitigations
${result.adrSummary.consequencesNegative.map((c) => `- ${c}`).join('\n')}

## Compliance & Security Impact
${result.securityConsiderations.map((sec) => `- **${sec.domain}**: ${sec.architecturalControl}`).join('\n')}
`;
}

export function downloadFile(filename: string, content: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
