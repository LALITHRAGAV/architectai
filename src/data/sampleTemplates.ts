import { ArchitectureInput } from '../types/architecture';

export interface SampleTemplate {
  id: string;
  name: string;
  tagline: string;
  input: ArchitectureInput;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'fintech-payments',
    name: 'FinTech Real-Time Payment Gateway',
    tagline: 'High-throughput, strictly consistent financial ledger with sub-100ms latency',
    input: {
      description: 'A global multi-currency payment processing engine that processes credit card transactions, digital wallets, and automated bank transfers. Requires idempotent transaction processing, double-entry ledger bookkeeping, real-time fraud scoring via machine learning, and automated webhooks for merchant settlement.',
      expectedUsers: '1.5M Daily Transactions (Peak: 4,500 transactions/sec)',
      availability: '99.999% (Five Nines - Mission Critical)',
      cloudProvider: 'AWS',
      budget: '$5,000 - $15,000 / month (Enterprise Scale)',
      architecturePreference: 'Event-Driven Microservices + CQRS',
      additionalNotes: 'Strict PCI-DSS Level 1 compliance required. Zero transaction loss guarantee. Double-entry ledger must adhere to ACID guarantees.',
    },
  },
  {
    id: 'b2b-saas-workspace',
    name: 'B2B Multi-Tenant Collaboration SaaS',
    tagline: 'Multi-tenant project management platform with real-time sync and audit logs',
    input: {
      description: 'An enterprise B2B team workspace platform featuring document editing, kanban sprint boards, team chat, role-based access control (RBAC), and fine-grained audit logging. Supports customer tenant data isolation, SSO (SAML/Okta), and customer-managed encryption keys (CMEK).',
      expectedUsers: '250,000 Monthly Active Users (15,000 concurrent peak)',
      availability: '99.95% (High Availability)',
      cloudProvider: 'Google Cloud Platform',
      budget: '$2,000 - $6,000 / month (Growth Tier)',
      architecturePreference: 'Modular Monolith with Event Bus',
      additionalNotes: 'SOC2 Type II compliance, tenant-level data segregation, full-text search across documents and comments.',
    },
  },
  {
    id: 'iot-telemetry-fleet',
    name: 'IoT Fleet Telemetry & Analytics Platform',
    tagline: 'Ingesting 50,000 events/sec from connected electric vehicles',
    input: {
      description: 'Connected vehicle telemetry platform ingesting battery health, GPS coordinates, tire pressure, and speed diagnostics every 2 seconds from 100,000 connected commercial vehicles. Features real-time geofence alerting, hot storage for the past 48 hours of vehicle telemetry, and cold storage data lake for ML predictive maintenance.',
      expectedUsers: '100,000 Connected Devices (Ingestion: ~50k events/sec)',
      availability: '99.9% (Three Nines)',
      cloudProvider: 'AWS',
      budget: '$4,000 - $10,000 / month',
      architecturePreference: 'Serverless-First & Stream Processing',
      additionalNotes: 'MQTT broker ingestion, time-series data storage, automated cold tier archival to S3 Parquet.',
    },
  },
  {
    id: 'ecommerce-marketplace',
    name: 'High-Volume Global E-Commerce',
    tagline: 'Flash sales, catalog search, cart & inventory reservation engine',
    input: {
      description: 'A consumer marketplace handling heavy flash-sale spikes (10x traffic in minutes). Includes product catalog with multi-faceted search, inventory reservation system with distributed locking, shopping cart, customer reviews, and order fulfillment orchestration.',
      expectedUsers: '5M Monthly Active Users (Spikes up to 50k req/s during flash sales)',
      availability: '99.99% (Four Nines)',
      cloudProvider: 'Cloud Agnostic / Kubernetes',
      budget: '$3,000 - $8,000 / month',
      architecturePreference: 'Microservices with Saga Pattern',
      additionalNotes: 'Zero inventory overselling during flash sales. Sub-200ms catalog search p95 latency.',
    },
  },
];
