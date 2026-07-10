# Aegis AI: Prioritized Architecture Backlog

This backlog translates the findings from the CTO Architecture Review into prioritized engineering tickets. It categorizes improvements into Critical Fixes, MVP features, V2 capabilities, and Future enhancements.

---

## 1. Critical Fixes (Must Have)

### Item 1.1: Prisma RLS Isolation Context Leak Fix

- **Why it matters:** Fastify and Prisma reuse database connections in a pool. If workspace context is set dynamically at the PostgreSQL transaction level and fails to reset on transaction completion or failure, queries from another workspace could execute on that connection, leaking tenant data.
- **Estimated complexity:** Medium
- **Dependencies:** Core API database service initialization, Prisma middleware/extension layer.
- **Recommended sprint:** Sprint 1

### Item 1.2: Biometric Consent Tracking Schema and Logic

- **Why it matters:** Collecting and processing creators' voice and image references (e.g., in `IdentityReference` model) without signed, auditable opt-in records violates BIPA, CCPA, and GDPR. This introduces severe regulatory and class-action risks.
- **Estimated complexity:** Low-Medium
- **Dependencies:** Legal policy approval for consent copy.
- **Recommended sprint:** Sprint 1

### Item 1.3: Gateway Write-Behind Buffering (Redis-to-Postgres)

- **Why it matters:** Livestreams with heavy chat volume generate hundreds of messages per second. Writing each message to PostgreSQL synchronously inside the Live Guardian ingestion gateway will exhaust database connection pools and cause massive write locks.
- **Estimated complexity:** High
- **Dependencies:** Redis stream configuration on ingestion gateway.
- **Recommended sprint:** Sprint 2

### Item 1.4: Model Gateway PII Redaction Middleware

- **Why it matters:** Sending raw chat contents to external LLMs for moderation risk-scoring leaks community member PII (names, phone numbers, addresses), violating CCPA/GDPR data-sharing regulations.
- **Estimated complexity:** Medium
- **Dependencies:** `ModelGateway` package integration.
- **Recommended sprint:** Sprint 2

---

## 2. High Priority Features (MVP)

### Item 2.1: Live Channel "Panic Button" (Shield Mode) API and Config

- **Why it matters:** Livestreamers are target targets for automated bot raids and doxxing attacks. A single-click API button is required to immediately transition the moderation gateway to its most restrictive policy configuration (e.g., mute all, block links, timeout new users).
- **Estimated complexity:** Low-Medium
- **Dependencies:** Gateway cached moderation policy engine.
- **Recommended sprint:** Sprint 3

### Item 2.2: Event-Driven CDC Outbox Publisher

- **Why it matters:** Polling the `outbox_events` table in PostgreSQL continuously generates high read-write overhead. Implementing a CDC (Change Data Capture) publisher ensures events are pushed to workers instantly with zero database polling load.
- **Estimated complexity:** High
- **Dependencies:** Database logical replication configurations, Redis message broker.
- **Recommended sprint:** Sprint 3

### Item 2.3: Evidence Cryptographic TSA Manifest Signing

- **Why it matters:** Storing screenshot and video files without digital proof of custody makes them challengeable in court. Signing evidence manifests with a secure private key and an RFC 3161 trusted timestamp authority (TSA) proves evidence integrity.
- **Estimated complexity:** Medium
- **Dependencies:** AWS KMS (or equivalent) key vault access.
- **Recommended sprint:** Sprint 4

### Item 2.4: Outbound Webhooks Egress API and Schema

- **Why it matters:** Workspaces need to forward high-priority alerts (such as threat cluster detections or crisis incidents) to external tools like Slack, Discord, or their own security dashboards.
- **Estimated complexity:** Medium
- **Dependencies:** API authentication middleware, Outbound delivery worker.
- **Recommended sprint:** Sprint 4

---

## 3. Medium Priority Features (V2)

### Item 3.1: Stateless Gateway Clustering & Connection Lease Ring

- **Why it matters:** The Live Guardian WebSocket connection managers run on a single pod. If the pod crashes, stream ingestion stops. Distributing active streams across a stateless connection ring ensures high availability.
- **Estimated complexity:** High
- **Dependencies:** Redis Cluster / distributed lock setup.
- **Recommended sprint:** Sprint 5

### Item 3.2: Natural Language Policy Translation Agent

- **Why it matters:** Creators and moderators struggle to configure complex JSON-based moderation policies. An AI agent translating plain English instructions to schema-compliant JSON makes onboarding highly accessible.
- **Estimated complexity:** Medium
- **Dependencies:** `ModelGateway` configuration, Live moderation policy schema.
- **Recommended sprint:** Sprint 5

### Item 3.3: Fair-Share Queue Scheduling (BullMQ Multi-Tenancy)

- **Why it matters:** A single workspace undergoing a large-scale scan or raid can saturate worker queues, slowing down moderation and scans for all other tenants on the platform.
- **Estimated complexity:** High
- **Dependencies:** Redis queue worker infrastructure.
- **Recommended sprint:** Sprint 6

### Item 3.4: Unified Search API (`GET /v1/search`)

- **Why it matters:** Trust & Safety teams need to research relationships across cases, detections, and timeline events rapidly. A single indexed search query is a crucial UX enabler for triage.
- **Estimated complexity:** Medium
- **Dependencies:** PostgreSQL Full Text Search indexes.
- **Recommended sprint:** Sprint 6

---

## 4. Nice to Have Features (Future)

### Item 4.1: Model Evaluator Agent (Red-Teaming Evaluation)

- **Why it matters:** Over time, updates to moderation models or prompt versions cause scoring drift. A test harness running prompts against golden datasets identifies regression before deployment.
- **Estimated complexity:** High
- **Dependencies:** Golden evaluation datasets, Model Gateway.
- **Recommended sprint:** Sprint 7

### Item 4.2: Crisis Coordination Agent

- **Why it matters:** During an active security crisis, operators are overwhelmed. A specialized LLM agent helps by maintaining incident timeline logs and drafting external alerts for legal or PR stakeholders.
- **Estimated complexity:** Medium
- **Dependencies:** Case management modules.
- **Recommended sprint:** Sprint 7

### Item 4.3: Workspace API Key Portal & Management

- **Why it matters:** Enterprise customers require programmatic access to read detections, update cases, and download verified evidence manifests into their internal systems.
- **Estimated complexity:** Medium
- **Dependencies:** API gateway authentication layer.
- **Recommended sprint:** Sprint 8

### Item 4.4: Dynamic Database Partitioning Automation (`pg_partman`)

- **Why it matters:** Manually creating partitions for high-volume chat tables causes operational overhead. Automating partition creation via `pg_partman` ensures index efficiency and safe retention purges.
- **Estimated complexity:** Medium
- **Dependencies:** Postgres database admin rights, migration setup.
- **Recommended sprint:** Sprint 8
