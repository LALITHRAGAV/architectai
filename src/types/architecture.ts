export interface ArchitectureInput {
  description: string;
  expectedUsers: string; // e.g. "100k Monthly Active Users (Peak: 5,000 req/s)"
  availability: string; // e.g. "99.99% (Four Nines)"
  cloudProvider: string; // e.g. "AWS", "Google Cloud Platform", "Microsoft Azure", "Cloud Agnostic"
  budget: string; // e.g. "$1,000 - $3,000 / month (Growth Tier)"
  architecturePreference: string; // e.g. "Event-Driven Microservices", "Modular Monolith", "Serverless-First"
  additionalNotes?: string;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  acceptanceCriteria: string[];
}

export interface NonFunctionalRequirement {
  category: 'Performance' | 'Reliability & SLA' | 'Security & Compliance' | 'Observability' | 'Maintainability';
  metric: string;
  target: string;
  implementationStrategy: string;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  layer: 'Client' | 'Edge & CDN' | 'API Gateway' | 'Compute & Services' | 'Messaging & Cache' | 'Storage & Database' | 'Observability & Security';
  purpose: string;
  technologies: string[];
  connections: string[]; // Connected component IDs or names
}

export interface ServiceDefinition {
  name: string;
  type: string; // e.g., "gRPC Microservice", "Event Consumer", "REST API"
  responsibilities: string[];
  communicationProtocol: string;
  scalingTrigger: string;
  dependencies: string[];
}

export interface DatabaseRecommendation {
  primaryStore: {
    technology: string;
    type: string; // "Relational SQL", "Document NoSQL", etc.
    justification: string;
    schemaStrategy: string;
    shardingOrReplication: string;
  };
  cacheLayer: {
    technology: string;
    strategy: string; // "Cache-aside", "Write-through", etc.
    ttlStrategy: string;
  };
  specializedStores: {
    purpose: string;
    technology: string;
    justification: string;
  }[];
  backupAndDisasterRecovery: {
    rpo: string; // Recovery Point Objective
    rto: string; // Recovery Time Objective
    strategy: string;
  };
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'SUBSCRIBE';
  path: string;
  description: string;
  authRequired: boolean;
  rateLimit: string;
  samplePayloadSummary?: string;
}

export interface ApiDesign {
  paradigm: string; // "RESTful + Async Webhooks", "GraphQL Federation", "gRPC Internal + REST Edge"
  gatewayTechnology: string;
  authMethod: string;
  versioningStrategy: string;
  rateLimitingAndThrottling: string;
  keyEndpoints: ApiEndpoint[];
}

export interface SecurityConsideration {
  domain: string; // "Identity & Access", "Data Protection", "Network Security", "Compliance & Threat Mitigation"
  riskIdentified: string;
  architecturalControl: string;
  implementationDetail: string;
}

export interface ScalabilityConsideration {
  aspect: string; // "Horizontal Scaling", "Database Partitioning", "Caching Hierarchy", "Traffic Spikes & Throttling"
  technique: string;
  bottleneckMitigation: string;
  failoverMechanism: string;
}

export interface ArchitectureRisk {
  risk: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'Critical';
  mitigation: string;
  monitoringAlarm: string;
}

export interface ArchitectureTradeoff {
  tradeoffName: string; // e.g., "Consistency vs Latency (CAP Theorem)"
  optionChosen: string;
  sacrificedOption: string;
  architecturalRationale: string;
  operationalCostImpact: string;
}

export type DiagramComponentType =
  | 'Users'
  | 'CDN'
  | 'Load Balancer'
  | 'API Gateway'
  | 'Application Services'
  | 'Cache'
  | 'Message Queues'
  | 'Databases';

export interface DiagramNode {
  id: string;
  name: string;
  category: DiagramComponentType;
  technologies: string[];
  role: string;
  tier: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  protocol?: string;
  flowType?: 'sync' | 'async' | 'bidirectional';
}

export interface ArchitectureDiagram {
  title: string;
  summary: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export type ReviewSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'GOOD';

export interface ArchitectureReviewFinding {
  title: string;
  category: string;
  severity: ReviewSeverity;
  problem: string;
  why_it_matters: string;
  recommendation: string;
}

export interface ArchitectureReviewCategoryScores {
  scalability: number;
  availability: number;
  performance: number;
  security: number;
  reliability: number;
  costEfficiency: number;
}

export interface ArchitectureReviewResult {
  overallHealthScore: number;
  executiveReviewSummary: string;
  categoryScores: ArchitectureReviewCategoryScores;
  summaryCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    good: number;
  };
  findings: ArchitectureReviewFinding[];
  reviewedAt: number;
}

export interface ArchitectureFixProposal {
  findingTitle: string;
  category: string;
  problem: string;
  currentArchitecture: string;
  proposedChange: string;
  whyThisFix: string;
  expectedBenefits: string[];
  newTradeoffs: string[];
  implementationImpact: string;
  componentsAffected: string[];
}

export interface ArchitectureChangeHistoryItem {
  id: string;
  timestamp: number;
  findingTitle: string;
  proposedFix: string;
  componentsChanged: string[];
  reasonForChange: string;
  appliedAtFormatted: string;
}

export interface ArchitectureResult {
  projectName: string;
  version?: number;
  executiveSummary: string;
  estimatedComplexity: 'Low' | 'Moderate' | 'High' | 'Very High';
  estimatedMonthlyCostRange: string;
  
  // Visual Architecture Diagram
  diagram?: ArchitectureDiagram;

  // AI Review (Optional cached review)
  review?: ArchitectureReviewResult;

  // Applied Architecture Change History
  changeHistory?: ArchitectureChangeHistoryItem[];
  
  // 1. Functional requirements
  functionalRequirements: FunctionalRequirement[];
  
  // 2. Non-functional requirements
  nonFunctionalRequirements: NonFunctionalRequirement[];
  
  // 3. Recommended architecture style
  recommendedArchitectureStyle: {
    name: string;
    rationale: string;
    keyCharacteristics: string[];
    alternativeStylesConsidered: string[];
  };
  
  // 4. Architecture components
  architectureComponents: ArchitectureComponent[];
  
  // 5. Services
  services: ServiceDefinition[];
  
  // 6. Database recommendation
  databaseRecommendation: DatabaseRecommendation;
  
  // 7. API design
  apiDesign: ApiDesign;
  
  // 8. Security considerations
  securityConsiderations: SecurityConsideration[];
  
  // 9. Scalability considerations
  scalabilityConsiderations: ScalabilityConsideration[];
  
  // 10. Risks
  risks: ArchitectureRisk[];
  
  // 11. Architecture trade-offs
  tradeoffs: ArchitectureTradeoff[];
  
  // Architecture Decision Record
  adrSummary: {
    status: 'Proposed' | 'Accepted';
    context: string;
    decision: string;
    consequencesPositive: string[];
    consequencesNegative: string[];
  };

  // Mermaid diagram string for diagram rendering & export
  mermaidDiagram: string;
}

export interface ComparisonOptionData {
  name: string;
  architectureStyle: string;
  summary: string;
  advantages: string[];
  disadvantages: string[];
  components: string[];
  services: string[];
  databases: string[];
  security: string[];
  scalability: string[];
  cost: string;
  complexity: string;
}

export interface ComparisonCriterionData {
  optionA: number; // 1-10
  optionB: number; // 1-10
  reason: string;
}

export interface ComparisonMetrics {
  scalability: ComparisonCriterionData;
  availability: ComparisonCriterionData;
  performance: ComparisonCriterionData;
  security: ComparisonCriterionData;
  developmentComplexity: ComparisonCriterionData;
  operationalComplexity: ComparisonCriterionData;
  maintainability: ComparisonCriterionData;
  cost: ComparisonCriterionData;
}

export interface ComparisonRecommendation {
  selectedOption: string;
  reason: string;
  tradeoffs: string[];
  whenToChooseOptionA: string;
  whenToChooseOptionB: string;
}

export interface ArchitectureComparisonResult {
  optionA: ComparisonOptionData;
  optionB: ComparisonOptionData;
  comparison: ComparisonMetrics;
  recommendation: ComparisonRecommendation;
  comparedAt: number;
}

export interface SavedArchitecture {
  id: string;
  timestamp: number;
  input: ArchitectureInput;
  result: ArchitectureResult;
  comparison?: ArchitectureComparisonResult;
}
