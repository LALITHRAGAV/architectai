import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type { ArchitectureInput, ArchitectureResult } from './src/types/architecture';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Architecture Schema Definition for Gemini JSON output
const architectureResponseSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    executiveSummary: { type: Type.STRING },
    estimatedComplexity: {
      type: Type.STRING,
      enum: ['Low', 'Moderate', 'High', 'Very High'],
    },
    estimatedMonthlyCostRange: { type: Type.STRING },

    // 1. Functional requirements
    functionalRequirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          acceptanceCriteria: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['id', 'title', 'description', 'priority', 'acceptanceCriteria'],
      },
    },

    // 2. Non-functional requirements
    nonFunctionalRequirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: ['Performance', 'Reliability & SLA', 'Security & Compliance', 'Observability', 'Maintainability'],
          },
          metric: { type: Type.STRING },
          target: { type: Type.STRING },
          implementationStrategy: { type: Type.STRING },
        },
        required: ['category', 'metric', 'target', 'implementationStrategy'],
      },
    },

    // 3. Recommended architecture style
    recommendedArchitectureStyle: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        rationale: { type: Type.STRING },
        keyCharacteristics: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        alternativeStylesConsidered: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['name', 'rationale', 'keyCharacteristics', 'alternativeStylesConsidered'],
    },

    // 4. Architecture components
    architectureComponents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          layer: {
            type: Type.STRING,
            enum: ['Client', 'Edge & CDN', 'API Gateway', 'Compute & Services', 'Messaging & Cache', 'Storage & Database', 'Observability & Security'],
          },
          purpose: { type: Type.STRING },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          connections: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['id', 'name', 'layer', 'purpose', 'technologies', 'connections'],
      },
    },

    // 5. Services
    services: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          responsibilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          communicationProtocol: { type: Type.STRING },
          scalingTrigger: { type: Type.STRING },
          dependencies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['name', 'type', 'responsibilities', 'communicationProtocol', 'scalingTrigger', 'dependencies'],
      },
    },

    // 6. Database recommendation
    databaseRecommendation: {
      type: Type.OBJECT,
      properties: {
        primaryStore: {
          type: Type.OBJECT,
          properties: {
            technology: { type: Type.STRING },
            type: { type: Type.STRING },
            justification: { type: Type.STRING },
            schemaStrategy: { type: Type.STRING },
            shardingOrReplication: { type: Type.STRING },
          },
          required: ['technology', 'type', 'justification', 'schemaStrategy', 'shardingOrReplication'],
        },
        cacheLayer: {
          type: Type.OBJECT,
          properties: {
            technology: { type: Type.STRING },
            strategy: { type: Type.STRING },
            ttlStrategy: { type: Type.STRING },
          },
          required: ['technology', 'strategy', 'ttlStrategy'],
        },
        specializedStores: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              technology: { type: Type.STRING },
              justification: { type: Type.STRING },
            },
            required: ['purpose', 'technology', 'justification'],
          },
        },
        backupAndDisasterRecovery: {
          type: Type.OBJECT,
          properties: {
            rpo: { type: Type.STRING },
            rto: { type: Type.STRING },
            strategy: { type: Type.STRING },
          },
          required: ['rpo', 'rto', 'strategy'],
        },
      },
      required: ['primaryStore', 'cacheLayer', 'specializedStores', 'backupAndDisasterRecovery'],
    },

    // 7. API design
    apiDesign: {
      type: Type.OBJECT,
      properties: {
        paradigm: { type: Type.STRING },
        gatewayTechnology: { type: Type.STRING },
        authMethod: { type: Type.STRING },
        versioningStrategy: { type: Type.STRING },
        rateLimitingAndThrottling: { type: Type.STRING },
        keyEndpoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              method: { type: Type.STRING, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'SUBSCRIBE'] },
              path: { type: Type.STRING },
              description: { type: Type.STRING },
              authRequired: { type: Type.BOOLEAN },
              rateLimit: { type: Type.STRING },
              samplePayloadSummary: { type: Type.STRING },
            },
            required: ['method', 'path', 'description', 'authRequired', 'rateLimit'],
          },
        },
      },
      required: ['paradigm', 'gatewayTechnology', 'authMethod', 'versioningStrategy', 'rateLimitingAndThrottling', 'keyEndpoints'],
    },

    // 8. Security considerations
    securityConsiderations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING },
          riskIdentified: { type: Type.STRING },
          architecturalControl: { type: Type.STRING },
          implementationDetail: { type: Type.STRING },
        },
        required: ['domain', 'riskIdentified', 'architecturalControl', 'implementationDetail'],
      },
    },

    // 9. Scalability considerations
    scalabilityConsiderations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          aspect: { type: Type.STRING },
          technique: { type: Type.STRING },
          bottleneckMitigation: { type: Type.STRING },
          failoverMechanism: { type: Type.STRING },
        },
        required: ['aspect', 'technique', 'bottleneckMitigation', 'failoverMechanism'],
      },
    },

    // 10. Risks
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          probability: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          impact: { type: Type.STRING, enum: ['Low', 'Medium', 'Critical'] },
          mitigation: { type: Type.STRING },
          monitoringAlarm: { type: Type.STRING },
        },
        required: ['risk', 'probability', 'impact', 'mitigation', 'monitoringAlarm'],
      },
    },

    // 11. Architecture trade-offs
    tradeoffs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tradeoffName: { type: Type.STRING },
          optionChosen: { type: Type.STRING },
          sacrificedOption: { type: Type.STRING },
          architecturalRationale: { type: Type.STRING },
          operationalCostImpact: { type: Type.STRING },
        },
        required: ['tradeoffName', 'optionChosen', 'sacrificedOption', 'architecturalRationale', 'operationalCostImpact'],
      },
    },

    // ADR
    adrSummary: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ['Proposed', 'Accepted'] },
        context: { type: Type.STRING },
        decision: { type: Type.STRING },
        consequencesPositive: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        consequencesNegative: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['status', 'context', 'decision', 'consequencesPositive', 'consequencesNegative'],
    },

    // Mermaid Diagram
    mermaidDiagram: { type: Type.STRING },

    // Visual Architecture Diagram
    diagram: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'Users',
                  'CDN',
                  'Load Balancer',
                  'API Gateway',
                  'Application Services',
                  'Cache',
                  'Message Queues',
                  'Databases',
                ],
              },
              technologies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              role: { type: Type.STRING },
              tier: { type: Type.INTEGER },
            },
            required: ['id', 'name', 'category', 'technologies', 'role', 'tier'],
          },
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              source: { type: Type.STRING },
              target: { type: Type.STRING },
              label: { type: Type.STRING },
              protocol: { type: Type.STRING },
              flowType: {
                type: Type.STRING,
                enum: ['sync', 'async', 'bidirectional'],
              },
            },
            required: ['id', 'source', 'target', 'label'],
          },
        },
      },
      required: ['title', 'summary', 'nodes', 'edges'],
    },
  },
  required: [
    'projectName',
    'executiveSummary',
    'estimatedComplexity',
    'estimatedMonthlyCostRange',
    'diagram',
    'functionalRequirements',
    'nonFunctionalRequirements',
    'recommendedArchitectureStyle',
    'architectureComponents',
    'services',
    'databaseRecommendation',
    'apiDesign',
    'securityConsiderations',
    'scalabilityConsiderations',
    'risks',
    'tradeoffs',
    'adrSummary',
    'mermaidDiagram',
  ],
};

// Helper for resilient Gemini API calls with exponential backoff
async function callGeminiWithRetry(options: {
  contents: any;
  config: any;
  preferredModel?: string;
  maxRetries?: number;
}) {
  const models = [
    options.preferredModel || 'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];
  const maxRetries = options.maxRetries || 3;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota');

        if (isTemporary) {
          // Check for suggested retry time in milliseconds (e.g., "retry in 500ms")
          const retryMatch = errMsg.match(/retry in\s+([\d.]+)\s*(ms|s)/i);
          let delay = (attempt + 1) * 2000;
          if (retryMatch) {
            const val = parseFloat(retryMatch[1]);
            const unit = retryMatch[2].toLowerCase();
            delay = Math.max(delay, unit === 's' ? val * 1000 : val);
          }

          if (attempt < maxRetries - 1) {
            console.warn(`[Gemini] Model ${model} rate/capacity limited (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }
        // If not retryable or max attempts on this model reached, try next fallback model
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate content from Gemini API.');
}

// Architecture Generation Endpoint
app.post('/api/architecture/generate', async (req, res) => {
  try {
    const input: ArchitectureInput = req.body;

    if (!input || !input.description?.trim()) {
      return res.status(400).json({ error: 'Application description is required.' });
    }

    const systemPrompt = `You are a Principal Solutions Architect at a world-class technology consulting firm.
Your job is to analyze software requirements provided by an engineering lead or founder and engineer a rigorous, comprehensive, production-grade software architecture specification.

Be highly practical, specific to their preferred cloud provider (${input.cloudProvider || 'General'}), realistic about their budget tier (${input.budget || 'Standard'}), their user scale (${input.expectedUsers || 'Standard'}), and their availability SLA target (${input.availability || '99.9%'}).

Avoid generic platitudes. Name concrete services, protocols, data store choices, replication strategies, and failure modes.

The architecture MUST include all 11 required dimensions:
1. Functional requirements (concrete user journeys & capabilities with clear acceptance criteria)
2. Non-functional requirements (quantified metrics: latency p99, throughput req/s, recovery RPO/RTO, compliance)
3. Recommended architecture style (e.g., Modular Monolith vs Event-Driven Microservices vs Serverless, with architectural justification and trade-offs)
4. Architecture components (layered system decomposition with technologies, purpose, and directional data flow connections)
5. Services (microservice/service boundaries, responsibilities, inter-service RPC/event protocols, scaling policies)
6. Database recommendation (primary OLTP store, caching layer, specialized stores like search/vector/time-series, backup and disaster recovery)
7. API design (architecture style, auth mechanism, versioning, rate limiting, and 4-6 primary REST/gRPC endpoints with methods and paths)
8. Security considerations (defense-in-depth across identity, encryption at rest/transit, network isolation, secrets, OWASP mitigations)
9. Scalability considerations (horizontal scaling strategies, autoscaling triggers, read/write splitting, database sharding/partitioning)
10. Risks (concrete engineering, cost, or operational failure risks, with probability, impact, and mitigation strategies)
11. Architecture trade-offs (rigorous CAP theorem, consistency vs latency, operational complexity vs development velocity)

Also provide:
- A structured 'diagram' object representing the visual software architecture topology. The diagram MUST contain nodes across the following software tiers and clear directed edges showing exact data flow paths between them:
  * Users (tier 1: e.g. Web Browsers, Mobile Apps, IoT clients)
  * CDN (tier 2: e.g. CloudFront, Cloudflare, Fastly)
  * Load Balancer (tier 3: e.g. ALB, Nginx Ingress, Envoy LB)
  * API Gateway (tier 4: e.g. Kong, AWS API Gateway, Apigee)
  * Application services (tier 5: domain microservices / service modules)
  * Cache (tier 6: e.g. Redis Cluster, Memcached)
  * Message queues (tier 6: e.g. Apache Kafka, RabbitMQ, Amazon SQS/SNS)
  * Databases (tier 7: Primary OLTP, Read Replicas, Document DB, Analytics Data Warehouse)
  Ensure each edge has source (source node ID), target (target node ID), descriptive label (e.g. 'HTTPS / TLS 1.3', 'Reverse Proxy', 'gRPC Request', 'Cache Read/Write', 'Pub/Sub Events', 'ACID Write / Query'), protocol, and flowType ('sync' | 'async' | 'bidirectional').
- A clean, valid Mermaid.js graph definition in 'mermaidDiagram' (e.g. 'graph TD\\n  Client[Web/Mobile App] --> CDN[CloudFront / Cloudflare]...') representing the primary data flow through the architecture.
- An Architecture Decision Record (ADR) summary.`;

    const userPrompt = `System Requirements to Architect:
- Application Description: ${input.description}
- Expected User Scale & Traffic: ${input.expectedUsers || 'Not specified'}
- Availability & SLA Requirement: ${input.availability || '99.9%'}
- Preferred Cloud Provider: ${input.cloudProvider || 'Agnostic / Best fit'}
- Target Infrastructure Budget: ${input.budget || 'Flexible'}
- Architecture Preference: ${input.architecturePreference || 'Architect Recommendation'}
${input.additionalNotes ? `- Additional Constraints: ${input.additionalNotes}` : ''}

Please engineer the comprehensive software architecture specification for this system.`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for consistent, structured engineering outputs
        responseMimeType: 'application/json',
        responseSchema: architectureResponseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response received from Gemini model.');
    }

    const architectureResult: ArchitectureResult = JSON.parse(responseText);
    architectureResult.version = 1;
    return res.json(architectureResult);
  } catch (error: any) {
    console.error('Error generating architecture:', error);
    const rawMsg = error?.message || String(error);
    let friendlyMsg = 'Failed to generate software architecture. Please try again.';

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('429')) {
      friendlyMsg = 'Gemini free-tier request limit reached. Please wait a few seconds and click Generate Architecture again.';
    } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
      friendlyMsg = 'The AI model is currently under high demand. Please try again in a moment.';
    } else if (rawMsg.length < 200 && !rawMsg.includes('{')) {
      friendlyMsg = rawMsg;
    }

    return res.status(500).json({ error: friendlyMsg });
  }
});

// Architecture Review Schema Definition for Gemini JSON output
const architectureReviewSchema = {
  type: Type.OBJECT,
  properties: {
    overallHealthScore: { type: Type.INTEGER },
    executiveReviewSummary: { type: Type.STRING },
    categoryScores: {
      type: Type.OBJECT,
      properties: {
        scalability: { type: Type.INTEGER },
        availability: { type: Type.INTEGER },
        performance: { type: Type.INTEGER },
        security: { type: Type.INTEGER },
        reliability: { type: Type.INTEGER },
        costEfficiency: { type: Type.INTEGER },
      },
      required: [
        'scalability',
        'availability',
        'performance',
        'security',
        'reliability',
        'costEfficiency',
      ],
    },
    summaryCounts: {
      type: Type.OBJECT,
      properties: {
        critical: { type: Type.INTEGER },
        high: { type: Type.INTEGER },
        medium: { type: Type.INTEGER },
        low: { type: Type.INTEGER },
        good: { type: Type.INTEGER },
      },
      required: ['critical', 'high', 'medium', 'low', 'good'],
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'GOOD'],
          },
          problem: { type: Type.STRING },
          why_it_matters: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: [
          'title',
          'category',
          'severity',
          'problem',
          'why_it_matters',
          'recommendation',
        ],
      },
    },
  },
  required: [
    'overallHealthScore',
    'executiveReviewSummary',
    'categoryScores',
    'summaryCounts',
    'findings',
  ],
};

// Architecture Review Endpoint
app.post('/api/architecture/review', async (req, res) => {
  try {
    const { architecture, input, requirements } = req.body;
    const userReqs = requirements || input;

    if (!architecture || !userReqs) {
      return res.status(400).json({ error: 'Architecture specification and requirements are required.' });
    }

    // Strip previous review to ensure no stale review bias
    const { review: _prevReview, ...archToReview } = architecture;
    const currentVersion = archToReview.version || 1;

    console.log(`[Review API] Reviewing architecture: "${archToReview.projectName}" (Version ${currentVersion})`);

    const servicesSummary = (archToReview.services || [])
      .map((s: any) => `${s.name} (${s.type}): ${s.responsibilities?.join(', ')} [Protocol: ${s.communicationProtocol || 'HTTP'}, Scaling: ${s.scalingTrigger || 'CPU threshold'}]`)
      .join('\n');

    const dbDetails = [
      `Primary Store: ${archToReview.databaseRecommendation?.primaryStore?.technology} (${archToReview.databaseRecommendation?.primaryStore?.type})`,
      `Replication/HA: ${archToReview.databaseRecommendation?.primaryStore?.shardingOrReplication || 'Standard'}`,
      `Schema Strategy: ${archToReview.databaseRecommendation?.primaryStore?.schemaStrategy || 'Standard'}`,
      `Justification: ${archToReview.databaseRecommendation?.primaryStore?.justification || ''}`,
      `Cache Tier: ${archToReview.databaseRecommendation?.cacheLayer?.technology} (${archToReview.databaseRecommendation?.cacheLayer?.strategy})`,
      `Disaster Recovery: RPO=${archToReview.databaseRecommendation?.backupAndDisasterRecovery?.rpo}, RTO=${archToReview.databaseRecommendation?.backupAndDisasterRecovery?.rto}`,
    ].join('; ');

    const componentsSummary = (archToReview.architectureComponents || [])
      .map((c: any) => `${c.name} [${c.layer}]: ${c.purpose} (Tech: ${c.technologies?.join(', ') || 'Standard'})`)
      .join('\n');

    const apiSummary = (archToReview.apiDesign?.keyEndpoints || [])
      .slice(0, 10)
      .map((e: any) => `${e.method} ${e.path}: ${e.description}`)
      .join('\n');

    const appliedFixesSummary = (archToReview.changeHistory || [])
      .map((h: any, i: number) => `Fix #${i + 1}: [${h.findingTitle}] - Applied Change: ${h.proposedFix} (${h.reasonForChange})`)
      .join('\n');

    const systemPrompt = `You are a Senior Principal Software Architect conducting an adversarial, thorough peer review of a system architecture specification.

CRITICAL REVIEW INSTRUCTIONS:
- You MUST evaluate the CURRENT, LATEST state of the architecture (Version ${currentVersion}) against the user's specific requirements.
- IMPORTANT ON APPLIED FIXES: If architectural fixes were already applied to this architecture (see Applied Fixes History and current configuration below), YOU MUST RECOGNIZE THEM! DO NOT re-flag problems that have already been resolved by applied fixes (e.g. if a database has already been configured with High Availability, Multi-AZ replication, and automated failover, DO NOT flag it as a single point of failure; instead, evaluate whether any new trade-offs or remaining gaps exist, or recognize it under GOOD practices).
- Base your evaluation strictly on the user's specific context:
  * Application description: ${userReqs.description}
  * Expected users & scale: ${userReqs.expectedUsers || 'Standard'}
  * Availability target SLA: ${userReqs.availability || '99.9%'}
  * Selected cloud provider: ${userReqs.cloudProvider || 'General'}
  * Target budget: ${userReqs.budget || 'Flexible'}
  * Architecture style: ${archToReview.recommendedArchitectureStyle?.name}
  * Architecture Version: ${currentVersion}

Current Applied Fixes History:
${appliedFixesSummary || 'None (Initial Architecture Version)'}

Current Architectural Components:
${componentsSummary}

Current Database & Storage Tier:
${dbDetails}

Current Services:
${servicesSummary}

Current API Gateway & Endpoints:
${apiSummary}

Review the architecture across ALL 13 critical software architecture dimensions:
1. Scalability
2. Availability
3. Performance
4. Security
5. Reliability
6. Database design
7. Service boundaries
8. Single points of failure
9. Network architecture
10. Caching strategy
11. Messaging/event architecture
12. Cost efficiency
13. Observability and monitoring

- Analyze realistic potential bottlenecks, race conditions, single points of failure, network hops, cache invalidation pitfalls, or budget overruns for this specific cloud provider and traffic scale.
- Include a diverse set of findings: highlight CRITICAL risks (if any), HIGH and MEDIUM architectural concerns, LOW optimizations, and GOOD practices (where the design made sound choices).
- Provide an overall Architecture Health Score (0-100), and individual scores for Scalability, Availability, Performance, Security, Reliability, and Cost Efficiency.
- For each finding, provide:
  * title: Concise summary of the finding
  * category: One of the 13 review dimensions (e.g., "Single points of failure", "Database design", "Security", etc.)
  * severity: Exactly one of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'GOOD']
  * problem: Detailed description of the vulnerability, design gap, or strength
  * why_it_matters: Real-world operational, business, SLA, or cost consequence
  * recommendation: Concrete architectural remediation or best-practice configuration advice`;

    const userPrompt = `Requirements:
${JSON.stringify(userReqs, null, 2)}

Current Architecture to Review (Version ${currentVersion}):
${JSON.stringify({
  projectName: archToReview.projectName,
  version: currentVersion,
  style: archToReview.recommendedArchitectureStyle,
  components: archToReview.architectureComponents,
  services: archToReview.services,
  database: archToReview.databaseRecommendation,
  api: archToReview.apiDesign,
  security: archToReview.securityConsiderations,
  scalability: archToReview.scalabilityConsiderations,
  changeHistory: archToReview.changeHistory,
}, null, 2)}

Evaluate this CURRENT architecture (Version ${currentVersion}) against the requirements and provide the structured review.`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: architectureReviewSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response received from Gemini model.');
    }

    const reviewResult = JSON.parse(responseText);
    reviewResult.reviewedAt = Date.now();

    return res.json(reviewResult);
  } catch (error: any) {
    console.error('Error reviewing architecture:', error);
    const rawMsg = error?.message || String(error);
    let friendlyMsg = 'Failed to review software architecture. Please try again.';

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('429')) {
      friendlyMsg = 'Gemini free-tier request limit reached. Please wait a few seconds and click Review Architecture again.';
    } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
      friendlyMsg = 'The AI model is currently under high demand. Please try again in a moment.';
    } else if (rawMsg.length < 200 && !rawMsg.includes('{')) {
      friendlyMsg = rawMsg;
    }

    return res.status(500).json({ error: friendlyMsg });
  }
});

// Architecture Fix Proposal Schema
const architectureFixProposalSchema = {
  type: Type.OBJECT,
  properties: {
    findingTitle: { type: Type.STRING },
    category: { type: Type.STRING },
    problem: { type: Type.STRING },
    currentArchitecture: { type: Type.STRING },
    proposedChange: { type: Type.STRING },
    whyThisFix: { type: Type.STRING },
    expectedBenefits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    newTradeoffs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    implementationImpact: { type: Type.STRING },
    componentsAffected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'findingTitle',
    'category',
    'problem',
    'currentArchitecture',
    'proposedChange',
    'whyThisFix',
    'expectedBenefits',
    'newTradeoffs',
    'implementationImpact',
    'componentsAffected',
  ],
};

// 1. Propose Architecture Fix Endpoint
app.post('/api/architecture/propose-fix', async (req, res) => {
  try {
    const { finding, architecture, input } = req.body;

    if (!finding || !architecture || !input) {
      return res.status(400).json({ error: 'Finding, architecture, and input requirements are required.' });
    }

    const systemPrompt = `You are a Senior Principal Software Architect creating a targeted, surgical architectural remediation proposal for a specific review finding.

CRITICAL ARCHITECTURAL CONSTRAINTS & BEHAVIOR:
- You must NOT blindly accept previous recommendations.
- Inspect the CURRENT architecture and determine the MINIMUM necessary change.
- Avoid unnecessary complexity. For simple or moderate applications, prefer simple, robust fixes (e.g., adding a managed replica, connection pooler, circuit breaker, or read-through cache).
- Do NOT introduce microservices, Kafka, Kubernetes, multi-region replication, or complex infrastructure UNLESS strictly justified by the original requirements.
- Analyze the finding specifically in the context of the user's constraints:
  * Application description: ${input.description}
  * Expected users & scale: ${input.expectedUsers}
  * Availability target SLA: ${input.availability}
  * Preferred cloud provider: ${input.cloudProvider}
  * Target budget: ${input.budget}

Formulate a structured Architecture Fix Proposal containing:
1. Problem (concise summary of the root cause)
2. Current Architecture (what the existing component/design currently looks like)
3. Proposed Change (surgical, concrete recommendation)
4. Why This Fix (architectural reasoning)
5. Expected Benefits (bullet points of quantifiable or architectural gains)
6. New Trade-offs (operational overhead, cost, or complexity trade-offs introduced)
7. Implementation Impact (effort and migration considerations)
8. Components Affected (list of specific services, databases, or infrastructure components touched)`;

    const userPrompt = `Specific Review Finding to Fix:
- Finding Title: ${finding.title}
- Category: ${finding.category}
- Severity: ${finding.severity}
- Problem Statement: ${finding.problem}
- Why It Matters: ${finding.why_it_matters}
- Initial Review Suggestion: ${finding.recommendation}

Current System:
- Project Name: ${architecture.projectName}
- Architecture Style: ${architecture.recommendedArchitectureStyle?.name}
- Primary Database: ${architecture.databaseRecommendation?.primaryStore?.technology} (${architecture.databaseRecommendation?.primaryStore?.type})
- Cache: ${architecture.databaseRecommendation?.cacheLayer?.technology}
- Key Services: ${(architecture.services || []).map((s: any) => s.name).join(', ')}

Please engineer the concrete Architecture Fix Proposal for this finding.`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: architectureFixProposalSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response received from Gemini model.');
    }

    const proposal = JSON.parse(responseText);
    return res.json(proposal);
  } catch (error: any) {
    console.error('Error proposing architecture fix:', error);
    const rawMsg = error?.message || String(error);
    let friendlyMsg = 'Failed to propose architecture fix. Please try again.';

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('429')) {
      friendlyMsg = 'Gemini rate limit reached. Please wait a few seconds and try again.';
    } else if (rawMsg.length < 200 && !rawMsg.includes('{')) {
      friendlyMsg = rawMsg;
    }

    return res.status(500).json({ error: friendlyMsg });
  }
});

// 2. Apply Architecture Fix Endpoint
app.post('/api/architecture/apply-fix', async (req, res) => {
  try {
    const { proposal, architecture, input } = req.body;

    if (!proposal || !architecture || !input) {
      return res.status(400).json({ error: 'Proposal, architecture, and input requirements are required.' });
    }

    const systemPrompt = `You are a Senior Principal Software Architect applying an approved architectural fix proposal to an existing software architecture specification.

CRITICAL SURGICAL INSTRUCTIONS:
- Apply ONLY the approved change described in the proposal.
- Preserve ALL unrelated architecture components, services, database configurations, and requirements.
- Maintain the user's original scale (${input.expectedUsers}), cloud provider (${input.cloudProvider}), and SLA target (${input.availability}).
- Update affected services, dependencies, database configurations, APIs, and scalability/security considerations to accurately reflect the fix.
- Update the 'architectureComponents' and 'mermaidDiagram' to reflect the fixed topology.
- Update the 'diagram' object with any modified or added nodes and directional edges.
- Do NOT introduce unrequested changes or unnecessary complexity.

Return the complete updated ArchitectureResult object conforming strictly to the architecture schema.`;

    const { review: _review, changeHistory: _history, ...cleanArch } = architecture;

    const userPrompt = `Approved Architecture Fix to Apply:
- Finding Title: ${proposal.findingTitle}
- Category: ${proposal.category}
- Problem Addressed: ${proposal.problem}
- Current State: ${proposal.currentArchitecture}
- Approved Change: ${proposal.proposedChange}
- Why This Fix: ${proposal.whyThisFix}
- Components Affected: ${proposal.componentsAffected?.join(', ')}

Current Architecture to Update:
${JSON.stringify(cleanArch)}

Please apply this fix and return the updated, complete software architecture specification.`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: architectureResponseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response received from Gemini model.');
    }

    const updatedArchitecture: ArchitectureResult = JSON.parse(responseText);
    const newVersion = (architecture.version || 1) + 1;
    updatedArchitecture.version = newVersion;

    // Safeguard: Preserve core requirements and metadata if model omitted them
    if (!updatedArchitecture.functionalRequirements?.length && architecture.functionalRequirements?.length) {
      updatedArchitecture.functionalRequirements = architecture.functionalRequirements;
    }
    if (!updatedArchitecture.nonFunctionalRequirements?.length && architecture.nonFunctionalRequirements?.length) {
      updatedArchitecture.nonFunctionalRequirements = architecture.nonFunctionalRequirements;
    }
    if (!updatedArchitecture.projectName) {
      updatedArchitecture.projectName = architecture.projectName;
    }

    // Invalidate stale review on updated architecture
    delete (updatedArchitecture as any).review;

    console.log(`[Apply Fix API] Applied fix "${proposal.findingTitle}". Architecture version updated to v${newVersion}`);

    return res.json(updatedArchitecture);
  } catch (error: any) {
    console.error('Error applying architecture fix:', error);
    const rawMsg = error?.message || String(error);
    let friendlyMsg = 'Failed to apply architecture fix. Please try again.';

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('429')) {
      friendlyMsg = 'Gemini rate limit reached. Please wait a few seconds and try again.';
    } else if (rawMsg.length < 200 && !rawMsg.includes('{')) {
      friendlyMsg = rawMsg;
    }

    return res.status(500).json({ error: friendlyMsg });
  }
});

// Simple, Robust Architecture Comparison Schema
const comparisonOptionSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    architectureStyle: { type: Type.STRING },
    summary: { type: Type.STRING },
    advantages: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    disadvantages: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    components: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    services: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    databases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    security: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    scalability: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    cost: { type: Type.STRING },
    complexity: { type: Type.STRING },
  },
  required: [
    'name',
    'architectureStyle',
    'summary',
    'advantages',
    'disadvantages',
    'components',
    'services',
    'databases',
    'security',
    'scalability',
    'cost',
    'complexity',
  ],
};

const comparisonMetricSchema = {
  type: Type.OBJECT,
  properties: {
    optionA: { type: Type.INTEGER },
    optionB: { type: Type.INTEGER },
    reason: { type: Type.STRING },
  },
  required: ['optionA', 'optionB', 'reason'],
};

const simpleComparisonSchema = {
  type: Type.OBJECT,
  properties: {
    optionA: comparisonOptionSchema,
    optionB: comparisonOptionSchema,
    comparison: {
      type: Type.OBJECT,
      properties: {
        scalability: comparisonMetricSchema,
        availability: comparisonMetricSchema,
        performance: comparisonMetricSchema,
        security: comparisonMetricSchema,
        developmentComplexity: comparisonMetricSchema,
        operationalComplexity: comparisonMetricSchema,
        maintainability: comparisonMetricSchema,
        cost: comparisonMetricSchema,
      },
      required: [
        'scalability',
        'availability',
        'performance',
        'security',
        'developmentComplexity',
        'operationalComplexity',
        'maintainability',
        'cost',
      ],
    },
    recommendation: {
      type: Type.OBJECT,
      properties: {
        selectedOption: { type: Type.STRING },
        reason: { type: Type.STRING },
        tradeoffs: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        whenToChooseOptionA: { type: Type.STRING },
        whenToChooseOptionB: { type: Type.STRING },
      },
      required: [
        'selectedOption',
        'reason',
        'tradeoffs',
        'whenToChooseOptionA',
        'whenToChooseOptionB',
      ],
    },
  },
  required: ['optionA', 'optionB', 'comparison', 'recommendation'],
};

// Architecture Comparison Style Recommendation Endpoint
app.post('/api/architecture/recommend-styles', async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || !input.description?.trim()) {
      return res.status(400).json({ error: 'System requirements are required.' });
    }

    const prompt = `As a Principal Software Architect, recommend TWO competing, viable architectural styles to compare for this system.
Requirements:
- Description: ${input.description}
- Scale: ${input.expectedUsers || 'Standard'}
- SLA: ${input.availability || '99.9%'}
- Cloud: ${input.cloudProvider || 'General'}
- Budget: ${input.budget || 'Standard'}

Choose two distinct architectural paradigms (e.g. "Modular Monolith" vs "Event-Driven Microservices", or "Serverless Architecture" vs "Containerized Microservices", or "Monolithic Architecture" vs "Modular Monolith").
Do not always choose microservices. If the application is early stage or moderate scale, recommend simpler, pragmatic styles.

Return JSON with:
{
  "optionA": "Style Name A",
  "optionB": "Style Name B",
  "reasoning": "Why this specific pair offers a compelling architectural decision trade-off"
}`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Principal Software Architect recommending two distinct architectural styles for comparison.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      optionA: parsed.optionA || 'Modular Monolith',
      optionB: parsed.optionB || 'Microservices',
      reasoning: parsed.reasoning || 'Contrasts development simplicity against distributed independent scaling.',
    });
  } catch (error: any) {
    console.error('Error recommending styles:', error);
    return res.json({
      optionA: 'Modular Monolith',
      optionB: 'Microservices',
      reasoning: 'Standard industry comparison between cohesive monolith and distributed microservices.',
    });
  }
});

// Architecture Comparison Endpoint
app.post('/api/architecture/compare', async (req, res) => {
  console.log('[Compare API] Received request:', req.body?.optionAStyle, 'vs', req.body?.optionBStyle);
  try {
    const { input, optionAStyle, optionBStyle } = req.body;
    if (!input || !input.description?.trim()) {
      return res.status(400).json({ error: 'System requirements are required.' });
    }

    const styleA = optionAStyle?.trim() || 'Modular Monolith';
    const styleB = optionBStyle?.trim() || 'Microservices';

    console.log('[Compare API] Comparing styles:', { styleA, styleB, descLength: input.description.length });

    const systemPrompt = `You are a Principal Software Architect conducting an authoritative, rigorous side-by-side Architectural Comparison between TWO distinct architecture approaches for the EXACT SAME user software requirements:
- Approach A: ${styleA}
- Approach B: ${styleB}

IMPORTANT CONTEXT CONSIDERATIONS:
You MUST evaluate the architectures specifically against:
- User requirements: ${input.description}
- Scale & Traffic: ${input.expectedUsers || 'Standard'}
- Availability & SLA target: ${input.availability || '99.9%'}
- Preferred Cloud Provider: ${input.cloudProvider || 'Agnostic'}
- Infrastructure Budget: ${input.budget || 'Flexible'}
${input.additionalNotes ? `- Additional Constraints: ${input.additionalNotes}` : ''}

CRITICAL ARCHITECTURAL GUIDELINES:
1. Do NOT automatically recommend microservices.
   - If the engineering team is small (e.g. 3-6 developers), timeline is short (e.g. 3-6 months), or requirements are cohesive, a Monolith or Modular Monolith is often vastly superior in velocity, operational simplicity, and cost efficiency.
   - If extreme scale, organizational domain boundaries, or independent deployment cycles justify microservices, clearly explain the real operational trade-offs (distributed transactions, observability complexity, IPC latency).
2. For Option A, design a complete ${styleA} approach.
3. For Option B, design a complete ${styleB} approach.
4. For both options, list concrete components, services, databases, security, scalability, cost estimate, and complexity.
5. In comparison scores, assign realistic integer scores from 1 to 10 for both Option A and Option B across:
   - scalability
   - availability
   - performance
   - security
   - developmentComplexity (higher score = simpler / easier to develop)
   - operationalComplexity (higher score = simpler / easier to operate)
   - maintainability
   - cost (higher score = cheaper / more cost-effective)
   Include a clear explanation reason for each score comparison.
6. In recommendation:
   - Choose the superior architecture for THIS project context.
   - State why it was selected.
   - List trade-offs.
   - Give concrete guidelines for when to choose Option A vs Option B.`;

    const userPrompt = `Compare "${styleA}" (Option A) vs "${styleB}" (Option B) for this system:\n${input.description}\nScale: ${input.expectedUsers}\nSLA: ${input.availability}\nBudget: ${input.budget}`;

    console.log('[Compare API] Calling Gemini model...');
    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: simpleComparisonSchema,
      },
    });

    const responseText = response.text;
    console.log('[Compare API] Received Gemini response text length:', responseText?.length);

    if (!responseText) {
      throw new Error('No response text received from Gemini model.');
    }

    let comparisonResult: any;
    try {
      comparisonResult = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('[Compare API] JSON.parse failed on direct text. Attempting substring match...', parseError);
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        comparisonResult = JSON.parse(match[0]);
      } else {
        throw new Error('Gemini response could not be parsed as valid JSON.');
      }
    }

    // Comprehensive safety normalizations
    if (!comparisonResult || typeof comparisonResult !== 'object') {
      comparisonResult = {};
    }

    // Default structure helper
    const defaultOption = (styleName: string, defaultComplexity: string) => ({
      name: styleName,
      architectureStyle: styleName,
      summary: `${styleName} architecture optimized for this application workload.`,
      advantages: [
        'Well-defined domain boundaries and clear engineering responsibilities',
        'Standard operational baseline and manageable tooling footprint',
      ],
      disadvantages: [
        'Requires ongoing governance to maintain architectural consistency',
      ],
      components: ['Application Load Balancer', 'Application Servers', 'Managed Database Cluster'],
      services: ['Core Application Service', 'API Gateway Service', 'Worker Processing Service'],
      databases: ['Primary Relational Database', 'Redis In-Memory Cache'],
      security: ['TLS 1.3 in transit', 'AES-256 at rest', 'Role-Based Access Control (RBAC)'],
      scalability: ['Horizontal autoscaling based on CPU/Memory load'],
      cost: 'Cost-effective for current target scale',
      complexity: defaultComplexity,
    });

    if (!comparisonResult.optionA || typeof comparisonResult.optionA !== 'object') {
      comparisonResult.optionA = defaultOption(styleA, 'Moderate');
    }
    if (!comparisonResult.optionB || typeof comparisonResult.optionB !== 'object') {
      comparisonResult.optionB = defaultOption(styleB, 'High');
    }

    // Ensure array fields exist
    const arrayFields = ['advantages', 'disadvantages', 'components', 'services', 'databases', 'security', 'scalability'] as const;
    for (const field of arrayFields) {
      if (!Array.isArray(comparisonResult.optionA[field])) {
        comparisonResult.optionA[field] = comparisonResult.optionA[field] ? [String(comparisonResult.optionA[field])] : [];
      }
      if (!Array.isArray(comparisonResult.optionB[field])) {
        comparisonResult.optionB[field] = comparisonResult.optionB[field] ? [String(comparisonResult.optionB[field])] : [];
      }
    }

    comparisonResult.optionA.name = comparisonResult.optionA.name || styleA;
    comparisonResult.optionA.architectureStyle = comparisonResult.optionA.architectureStyle || styleA;
    comparisonResult.optionA.summary = comparisonResult.optionA.summary || `${styleA} system design.`;
    comparisonResult.optionA.cost = comparisonResult.optionA.cost || 'Estimated within budget';
    comparisonResult.optionA.complexity = comparisonResult.optionA.complexity || 'Moderate';

    comparisonResult.optionB.name = comparisonResult.optionB.name || styleB;
    comparisonResult.optionB.architectureStyle = comparisonResult.optionB.architectureStyle || styleB;
    comparisonResult.optionB.summary = comparisonResult.optionB.summary || `${styleB} system design.`;
    comparisonResult.optionB.cost = comparisonResult.optionB.cost || 'Estimated within budget';
    comparisonResult.optionB.complexity = comparisonResult.optionB.complexity || 'High';

    // Normalize comparison metric scores
    const metricKeys = [
      'scalability',
      'availability',
      'performance',
      'security',
      'developmentComplexity',
      'operationalComplexity',
      'maintainability',
      'cost',
    ];

    if (!comparisonResult.comparison || typeof comparisonResult.comparison !== 'object') {
      comparisonResult.comparison = {};
    }

    for (const key of metricKeys) {
      const metric = comparisonResult.comparison[key];
      if (!metric || typeof metric !== 'object') {
        comparisonResult.comparison[key] = {
          optionA: 8,
          optionB: 7,
          reason: `Evaluated relative trade-offs between ${styleA} and ${styleB}.`,
        };
      } else {
        comparisonResult.comparison[key] = {
          optionA: typeof metric.optionA === 'number' ? metric.optionA : parseInt(metric.optionA, 10) || 7,
          optionB: typeof metric.optionB === 'number' ? metric.optionB : parseInt(metric.optionB, 10) || 7,
          reason: metric.reason || `Comparative assessment for ${key}.`,
        };
      }
    }

    // Normalize recommendation
    if (!comparisonResult.recommendation || typeof comparisonResult.recommendation !== 'object') {
      comparisonResult.recommendation = {
        selectedOption: styleA,
        reason: `Based on your requirements, ${styleA} provides the optimal balance of delivery velocity, operational overhead, and budget alignment.`,
        tradeoffs: [
          `Prioritizes simplicity and rapid implementation over distributed micro-scaling.`,
        ],
        whenToChooseOptionA: `Choose ${styleA} when engineering team bandwidth is focused on fast shipping and predictable operations.`,
        whenToChooseOptionB: `Choose ${styleB} if independent team ownership and isolated deployment velocity are the primary business drivers.`,
      };
    } else {
      comparisonResult.recommendation.selectedOption = comparisonResult.recommendation.selectedOption || styleA;
      comparisonResult.recommendation.reason = comparisonResult.recommendation.reason || `Architectural recommendation based on requirements and budget.`;
      if (!Array.isArray(comparisonResult.recommendation.tradeoffs)) {
        comparisonResult.recommendation.tradeoffs = comparisonResult.recommendation.tradeoffs ? [String(comparisonResult.recommendation.tradeoffs)] : [];
      }
      comparisonResult.recommendation.whenToChooseOptionA = comparisonResult.recommendation.whenToChooseOptionA || `Choose ${styleA} for streamlined team coordination and simplicity.`;
      comparisonResult.recommendation.whenToChooseOptionB = comparisonResult.recommendation.whenToChooseOptionB || `Choose ${styleB} for distributed scalability and isolated service scaling.`;
    }

    comparisonResult.comparedAt = Date.now();

    console.log('[Compare API] Successfully synthesized comparison. Selected:', comparisonResult.recommendation?.selectedOption);
    return res.json(comparisonResult);
  } catch (error: any) {
    console.error('[Compare API] Error generating architecture comparison:', error);
    const rawMsg = error?.message || String(error);
    let friendlyMsg = 'Failed to generate architecture comparison. Please try again.';

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('429')) {
      friendlyMsg = 'Gemini rate limit reached. Please wait a moment and click Generate Comparison again.';
    } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
      friendlyMsg = 'The AI model is currently under high demand. Please try again shortly.';
    } else if (rawMsg.length < 200 && !rawMsg.includes('{')) {
      friendlyMsg = rawMsg;
    }

    return res.status(500).json({ error: friendlyMsg, debugMessage: rawMsg });
  }
});

// Deep Dive / Refine Endpoint
app.post('/api/architecture/deepdive', async (req, res) => {
  try {
    const { architecture, topic } = req.body;
    if (!architecture || !topic) {
      return res.status(400).json({ error: 'Architecture context and deep-dive topic are required.' });
    }

    const prompt = `As a Principal Software Architect, provide an in-depth technical deep-dive specification for the following topic regarding the system "${architecture.projectName}":

Topic: ${topic}

System Executive Summary: ${architecture.executiveSummary}
Architecture Style: ${architecture.recommendedArchitectureStyle?.name}
Primary Database: ${architecture.databaseRecommendation?.primaryStore?.technology}

Provide a deep technical breakdown with concrete configuration guidelines, code/schema snippets (e.g. SQL DDL, Docker/K8s manifests, or Terraform/IaC snippets if relevant), step-by-step implementation notes, and failure handling considerations.`;

    const response = await callGeminiWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Principal Software Architect writing a technical implementation addendum.',
        temperature: 0.3,
      },
    });

    return res.json({ deepDiveContent: response.text || '' });
  } catch (error: any) {
    console.error('Error in deep dive:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate technical deep dive.',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mini AI Software Architect API' });
});

// Vite Middleware for dev, or Static build for prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mini AI Software Architect running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
