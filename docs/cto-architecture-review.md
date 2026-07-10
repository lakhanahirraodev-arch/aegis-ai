# Aegis AI: CTO Architecture Review

This document provides a comprehensive, production-grade review of the Aegis AI system architecture, database design, API specifications, AI safety boundaries, and operational resiliency as if preparing for a scale deployment.

---

## 1. Architecture & Resiliency

### Assessment

The choice of a modular monolith deploying 4 separate workloads (`apps/web`, `apps/api`, `apps/worker`, `apps/live-guardian`) is correct for early iteration. It enforces hard package boundaries (`packages/contracts`, `packages/database`, `packages/ai-contracts`) while keeping deployment simple.

### Identified Gaps

- **No Gateway Connection Clustering/Failover:** `apps/live-guardian` relies on active WebSocket connections to platforms (Twitch, Kick, YouTube). A single pod crash terminates all subscriptions for that node, dropping messages during reconnect.
- **No Connection State Management:** Stream session metadata and moderator channel state live in transient memory on the ingestion gateway. A gateway restart causes full state rebuilds and platforms to trigger strict connection rate limits.

### Suggested Improvements

1.  **Stateless Connection Gateway Fleet:** Implement a gateway clustering model where active stream connections are distributed across nodes using a distributed lock manager (Redis/Redlock).
2.  **Consistent Hashing Ring:** Use a consistent hashing ring to partition active channel subscriptions across available Live Guardian pods to prevent overlapping connection requests.

---

## 2. Database Design & Relational Model

### Assessment

The relational schema managed by Prisma in `packages/database/prisma/schema.prisma` is highly descriptive and maps the domain objects cleanly.

### Identified Gaps

- **Missing Biometric & AI Consent Log Tables:** To comply with biometric privacy laws (BIPA, CCPA, GDPR), Aegis AI must track explicit user-signed consent before processing voice, image, or video references. Currently, no database structure exists for consent tracking.
- **Missing Outbound Webhook Subscriptions:** The system references webhook notifications, but lacks a table to configure outbound endpoints, target URLs, secret signatures, and subscribed event types.
- **Missing Developer API Keys:** No mechanism to authenticate and rotate tokens for custom developer integrations with the platform core.
- **Missing Usage & Quota Ledger:** Running high-volume media scans and LLM evaluations exposes the platform to runaway cloud and provider costs. There is no DB table to enforce quotas per workspace (e.g., active stream minutes, media storage, model tokens).

### Suggested Improvements

1.  **Add `BiometricConsent` Table:** Track consent type, signature timestamp, IP address, and revocation status.
2.  **Add `WebhookEndpoint` and `WebhookSubscription` Tables:** Define outbound webhooks with signing keys and filters.
3.  **Add `ApiKey` Table:** Store encrypted API key hashes (`value_hash`), access scopes, and usage metadata.
4.  **Add `WorkspaceQuota` Table:** Establish monthly limits and usage counters for billing and safety controls.

---

## 3. API Design

### Assessment

The REST API under `/v1` is structured around Fastify. The real-time subscription model relies on upgraded WebSockets.

### Identified Gaps

- **Missing Unified Search API:** Analysts must query `/v1/detections`, `/v1/threat-clusters`, and `/v1/cases` separately. There is no unified search endpoint to find related items across these tables quickly.
- **Missing Outbound Webhook Configuration APIs:** No routes are defined to manage or test outbound webhooks.
- **Missing Panic/Shield Mode APIs:** During active chat attacks, moderators need to trigger a lockdown immediately. The current policy APIs require individual, slow PATCH updates.

### Suggested Improvements

1.  **Expose `GET /v1/search`:** Introduce a unified endpoint returning ranked search results across detections, clusters, cases, and logs using PostgreSQL Full Text Search (FTS).
2.  **Expose Webhook Configuration Endpoints:** Establish `POST /v1/webhooks/endpoints` and a test-ping route `/v1/webhooks/endpoints/:id/test`.
3.  **Expose `POST /v1/live-channels/:id/shield`:** A dedicated API to instantly activate or deactivate pre-configured shield policies (e.g., block links, lock chat to subscriber-only).

---

## 4. AI Agent Design & Safety Boundaries

### Assessment

Agents act as validation and finding generators, maintaining a clear boundary where humans approve external actions.

### Identified Gaps

- **No Policy Translation Agent:** The current architecture requires manual JSON configuration of policies. A creator cannot configure moderation rules using natural language (e.g., "mute anyone spamming links").
- **No Crisis Coordination Agent:** During high-stress raids, manual execution of response steps is error-prone. No agent exists to assist in orchestrating incident timelines or draft updates.
- **No Golden Set Evaluator Agent:** Drift in agent detection prompts (such as toxicity scoring or doxxing checks) is not programmatically measured.

### Suggested Improvements

1.  **Introduce `PolicyTranslationAgent`:** An offline agent that parses unstructured creator guidelines and outputs a schema-compliant `LiveModerationPolicy` JSON configuration.
2.  **Introduce `CrisisCoordinationAgent`:** Instantiated during a high-severity incident to generate timeline logs, suggest responses based on active playbooks, and draft notifications.
3.  **Implement `ModelEvaluatorAgent` (Red-Teaming):** A scheduled test harness running prompt variations against historical golden datasets to detect regression and score drift.

---

## 5. Security & Privacy Gaps

### Assessment

The system isolates tenants via workspace ID matching and uses envelope encryption for key secrets.

### Identified Gaps

- **Prisma RLS Leakage Risk:** Prisma uses TCP connection pooling. Setting transaction-scoped PostgreSQL session variables (e.g., `SET local app.current_workspace_id = ...`) can leak between requests if a transaction fails before variable reset.
- **Model Gateway Egress PII Leak:** Sending raw chat contents to external LLM providers can leak real-world PII (names, phone numbers, home addresses) in breach of GDPR/CCPA.
- **Biometric Data Lifecycle Compliance:** Storing reference voice and image data without an automated deletion timeline violates BIPA (requires deletion once the verification purpose is satisfied or within 3 years).

### Suggested Improvements

1.  **Prisma Tenant Extension Safety:** Avoid dynamic transaction-level SQL session variables for RLS where possible. Implement a Prisma client extension that automatically appends `where: { workspaceId }` to every query, treating PostgreSQL RLS strictly as an infrastructure backup layer.
2.  **PII Scrubbing Pipeline:** Embed a deterministic regex and Named Entity Recognition (NER) scrubber in the `ModelGateway` to redact PII before sending data to external model providers.
3.  **Biometric Retention Purge Cron:** Create a hard-stop worker that enforces maximum retention policies on `IdentityReference` records of biometric kind.

---

## 6. Multi-Tenancy & Database Scalability

### Assessment

Multi-tenancy is logically isolated by workspace. High-volume tables are planned for partitioning.

### Identified Gaps

- **Partition Migration Complexity:** Prisma does not natively support schema migrations for partitioned tables (`live_chat_messages`). Running regular Prisma deployments will fail or drop partitions.
- **Multi-Tenant Queue Starvation:** A massive raid on one tenant's channel can saturate BullMQ/Redis queues, starving scans and moderation for all other tenants.

### Suggested Improvements

1.  **Partition Isolation Pattern:** Exclude `live_chat_messages` from Prisma schema generation and manage table creation and retention rules via raw SQL migrations and `pg_partman`.
2.  **Fair-Share Queue Partitioning:** Configure BullMQ child queues using dynamic concurrency limits and queue priorities based on workspace IDs to prevent single-tenant queue monopolization.

---

## 7. Performance & Latency Optimization

### Assessment

Ingestion must run under tight budgets (deterministic checks under 150ms).

### Identified Gaps

- **Synchronous Postgres Ingestion Bottleneck:** Writing every chat message to PostgreSQL individually during large streams (500+ messages/sec) will saturate connection pools and lead to lock contention.
- **Policy Cache Staleness:** Gateway instances caching policies in memory lack a low-latency invalidation mechanism when a policy is modified on the dashboard.

### Suggested Improvements

1.  **Write-Behind Buffer Pattern:** Buffer chat messages in Redis Streams and write them to PostgreSQL in micro-batches (e.g., every 1 second or 500 messages). The gateway should query Redis or memory for active stream context, keeping Postgres out of the critical ingestion path.
2.  **Redis Pub/Sub Cache Invalidation:** Publish policy change events over Redis Pub/Sub to trigger immediate local memory cache invalidations across all active Live Guardian gateway pods.

---

## 8. Event-Driven Architecture (EDA)

### Assessment

A transactional outbox ensures at-least-once message delivery to worker queues.

### Identified Gaps

- **High-Overhead Outbox Polling:** Polling `outbox_events` via cron creates continuous read load on the primary PostgreSQL instance.
- **No Event Schema Registry:** Schema definitions are validated at runtime inside TypeScript apps but not checked at the broker level, risking silent consumer failures during backward-incompatible deployments.

### Suggested Improvements

1.  **Logical Replication CDC:** Deploy a Change Data Capture (CDC) connector (e.g., Debezium) listening to PostgreSQL logical replication logs to forward outbox events to Redis/RabbitMQ instantly without polling.
2.  **Contract Test Automation:** Implement event contract verification in CI/CD using JSON Schema matching across all apps, rejecting builds with breaking event payloads.

---

## 9. Reputation & Content Protection Risks

### Assessment

Scanning the web for copyright theft and impersonation requires robust web crawlers and scraping setups.

### Identified Gaps

- **Anti-Scraping Egress Blocking:** Platforms like Instagram, TikTok, and X enforce highly restrictive CDNs. Running search queries from static cloud provider IPs will lead to immediate blocking.
- **No Legal Proof of Evidence Custody:** Storing evidence artifacts as raw files is insufficient for court disputes. Aegis lacks cryptographically verifiable proof of capture time and content integrity.

### Suggested Improvements

1.  **Residential Proxy Routing:** Route scan workers through rotating residential proxy networks and leverage specialized threat intelligence APIs rather than performing raw scraping.
2.  **Evidence Cryptographic Timestamping:** Sign evidence manifests using a secure KMS private key and an RFC 3161-compliant trusted timestamp authority (TSA) to prove the item was captured at the specified time and has not been altered since.

---

## 10. Crisis Management

### Assessment

The system tracks incident timelines using `LiveIncident` and timeline logs.

### Identified Gaps

- **No "Panic Button" Core Implementation:** While the database has enums for policies, there is no first-class state or workflow representing a channel-wide lockdown state.
- **No Direct Emergency Integrations:** High-severity threats (such as doxxing or swatting indicators) do not have direct integration paths to dispatch alerts to crisis response services or corporate security channels.

### Suggested Improvements

1.  **Define a Channel-Wide "Panic State":** Add `panicModeActive` to `LiveChannel`. When active, it bypasses regular policy checks to enforce the most restrictive moderation guidelines (mute all link creators, timeout new users).
2.  **Integrate Alerting Adapters:** Configure dedicated crisis alerting integrations (PagerDuty, Webhooks to security providers) triggered automatically when high-severity incident criteria are satisfied.
