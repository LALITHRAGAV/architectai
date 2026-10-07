import { ArchitectureResult, ArchitectureDiagram, DiagramNode, DiagramEdge, DiagramComponentType } from '../types/architecture';

export function getOrBuildArchitectureDiagram(result: ArchitectureResult): ArchitectureDiagram {
  // If Gemini provided a valid diagram with nodes and edges, validate and return it
  if (
    result.diagram &&
    Array.isArray(result.diagram.nodes) &&
    result.diagram.nodes.length >= 4 &&
    Array.isArray(result.diagram.edges) &&
    result.diagram.edges.length > 0
  ) {
    return result.diagram;
  }

  // Fallback dynamic synthesis from the architecture sections
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // 1. Users Node
  nodes.push({
    id: 'node-users',
    name: 'Clients & Users',
    category: 'Users',
    technologies: ['Web Apps (React)', 'Mobile Apps (iOS/Android)', 'Public API Consumers'],
    role: 'Originates HTTP/HTTPS traffic, WebSockets, and user requests',
    tier: 1,
  });

  // 2. CDN Node
  const cdnTech = result.architectureComponents.find(c => c.layer === 'Edge & CDN')?.technologies || ['CloudFront', 'Cloudflare Edge CDN'];
  nodes.push({
    id: 'node-cdn',
    name: 'Content Delivery Network (CDN)',
    category: 'CDN',
    technologies: cdnTech,
    role: 'Static asset caching, DDoS shield, TLS termination at edge',
    tier: 2,
  });

  // 3. Load Balancer Node
  nodes.push({
    id: 'node-lb',
    name: 'Application Load Balancer',
    category: 'Load Balancer',
    technologies: ['AWS ALB / Nginx Ingress', 'WAF Layer 7'],
    role: 'SSL/TLS offloading, health checks, path-based routing',
    tier: 3,
  });

  // 4. API Gateway Node
  const gwTech = result.apiDesign?.gatewayTechnology ? [result.apiDesign.gatewayTechnology] : ['Kong API Gateway', 'Envoy Proxy'];
  nodes.push({
    id: 'node-gw',
    name: 'API Gateway & Ingress',
    category: 'API Gateway',
    technologies: gwTech,
    role: 'Rate limiting, OAuth2/JWT auth verification, request routing',
    tier: 4,
  });

  // 5. Application Services Nodes
  const serviceNodes: DiagramNode[] = [];
  if (result.services && result.services.length > 0) {
    result.services.slice(0, 4).forEach((srv, idx) => {
      const srvNode: DiagramNode = {
        id: `node-srv-${idx}`,
        name: srv.name,
        category: 'Application Services',
        technologies: [srv.type, srv.communicationProtocol || 'gRPC / REST'],
        role: srv.responsibilities[0] || 'Core business logic service',
        tier: 5,
      };
      serviceNodes.push(srvNode);
      nodes.push(srvNode);
    });
  } else {
    const srvNode: DiagramNode = {
      id: 'node-srv-core',
      name: `${result.projectName} Core Services`,
      category: 'Application Services',
      technologies: ['Microservices Container Cluster', 'Docker / Kubernetes'],
      role: 'Core business domain and application processing',
      tier: 5,
    };
    serviceNodes.push(srvNode);
    nodes.push(srvNode);
  }

  // 6. Cache Node
  const cacheTech = result.databaseRecommendation?.cacheLayer?.technology
    ? [result.databaseRecommendation.cacheLayer.technology]
    : ['Redis Cluster', 'In-Memory Cache'];
  nodes.push({
    id: 'node-cache',
    name: 'Distributed Cache Tier',
    category: 'Cache',
    technologies: cacheTech,
    role: `${result.databaseRecommendation?.cacheLayer?.strategy || 'Cache-aside'} session & hot-data store`,
    tier: 6,
  });

  // 7. Message Queue Node
  nodes.push({
    id: 'node-mq',
    name: 'Message Broker & Event Bus',
    category: 'Message Queues',
    technologies: ['Apache Kafka', 'RabbitMQ / Amazon SQS'],
    role: 'Asynchronous event streaming, decoupling services & worker tasks',
    tier: 6,
  });

  // 8. Databases Node(s)
  const primaryDbTech = result.databaseRecommendation?.primaryStore?.technology
    ? [result.databaseRecommendation.primaryStore.technology]
    : ['PostgreSQL Cluster', 'Multi-AZ Replicas'];
  nodes.push({
    id: 'node-db-primary',
    name: 'Primary Datastore',
    category: 'Databases',
    technologies: primaryDbTech,
    role: `ACID transactional storage, ${result.databaseRecommendation?.primaryStore?.shardingOrReplication || 'Multi-AZ replication'}`,
    tier: 7,
  });

  if (result.databaseRecommendation?.specializedStores?.length) {
    const spec = result.databaseRecommendation.specializedStores[0];
    nodes.push({
      id: 'node-db-specialized',
      name: spec.purpose,
      category: 'Databases',
      technologies: [spec.technology],
      role: spec.justification,
      tier: 7,
    });
  }

  // Build Directional Edges
  edges.push({
    id: 'edge-users-cdn',
    source: 'node-users',
    target: 'node-cdn',
    label: 'HTTPS / TLS 1.3 Requests',
    protocol: 'HTTPS / HTTP3',
    flowType: 'sync',
  });

  edges.push({
    id: 'edge-cdn-lb',
    source: 'node-cdn',
    target: 'node-lb',
    label: 'Dynamic Cache Miss / API Pass-through',
    protocol: 'HTTPS',
    flowType: 'sync',
  });

  edges.push({
    id: 'edge-lb-gw',
    source: 'node-lb',
    target: 'node-gw',
    label: 'Load-Balanced Ingress Traffic',
    protocol: 'TCP / HTTP2',
    flowType: 'sync',
  });

  // Route gateway to all services
  serviceNodes.forEach((sNode, idx) => {
    edges.push({
      id: `edge-gw-${sNode.id}`,
      source: 'node-gw',
      target: sNode.id,
      label: idx === 0 ? 'JWT Auth & gRPC / REST Dispatch' : 'Internal Service Call',
      protocol: 'gRPC / HTTP2',
      flowType: 'sync',
    });

    // Connect services to Cache
    edges.push({
      id: `edge-${sNode.id}-cache`,
      source: sNode.id,
      target: 'node-cache',
      label: 'Cache-Aside Query / Invalidation',
      protocol: 'RESP (TCP)',
      flowType: 'sync',
    });

    // Connect services to Message Queue (async events)
    edges.push({
      id: `edge-${sNode.id}-mq`,
      source: sNode.id,
      target: 'node-mq',
      label: 'Async Domain Event Pub/Sub',
      protocol: 'Kafka / AMQP',
      flowType: 'async',
    });

    // Connect services to Primary Database
    edges.push({
      id: `edge-${sNode.id}-db`,
      source: sNode.id,
      target: 'node-db-primary',
      label: 'ACID Write / Query Connection Pool',
      protocol: 'SQL over TCP / TLS',
      flowType: 'sync',
    });
  });

  return {
    title: `${result.projectName} End-to-End System Topology`,
    summary: `Visual architecture showing the directional data pipeline from Users through CDN, Load Balancer, API Gateway, Application Services, Caching, Event Queues, and Databases.`,
    nodes,
    edges,
  };
}
