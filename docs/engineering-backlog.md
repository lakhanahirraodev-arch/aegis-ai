# Aegis AI: Complete Engineering Backlog

This document organizes the development of Aegis AI into four strategic Milestones containing two Sprints each. The roadmap prioritizes MVP core capabilities (security, consent, buffering, incident management) before moving to advanced scaling, V2 AI agents, and enterprise developer features.

---

## Milestone 1: Security, Compliance & Ingestion Foundation

### Sprint 1: Tenant Security & Biometric Compliance

- **Objectives:** Prevent cross-tenant data leaks in connection-pooled environments and establish strict opt-in schemas for biometric likeness scanning.
- **Deliverables:**
  - Prisma Client Extension automatically injecting `where: { workspaceId }` to guarantee data isolation.
  - Database migrations creating `biometric_consent_logs` and user workspace settings.
  - Consent check blocker middleware preventing ingestion of image/voice references without positive consent verification.
- **Dependencies:** None.
- **Complexity:** Medium
- **Testing:**
  - Integration tests checking that queries without explicit workspace filters automatically fail compile or execute.
  - Unit tests checking that biometric scans throw database exceptions if no consent log is associated.
- **Definition of Done:**
  - No cross-tenant data leak tests fail.
  - DB schema passes migration validations.
- **Recommended Git commit message:** `feat(db): implement secure tenant isolation extension and biometric consent schemas`

### Sprint 2: High-Frequency Ingestion Buffering & Gateway PII Redaction

- **Objectives:** Protect the primary PostgreSQL instance from write saturation during active streams and protect community members' PII from escaping to third-party LLMs.
- **Deliverables:**
  - Redis streams ingestion write-behind buffer in `apps/live-guardian`.
  - Micro-batch consumer writing messages in batches of 500 or every 1 second to PostgreSQL.
  - Regex and NER (Named Entity Recognition) PII scrubbing pipeline in the `ModelGateway`.
- **Dependencies:** Redis environment container setup, Model Gateway skeleton.
- **Complexity:** High
- **Testing:**
  - Stress-testing ingestion with 1,000 chat messages/sec, validating PostgreSQL connection utilization.
  - Scrub testing sending sample chat logs containing phone numbers/addresses, verifying redacted payloads.
- **Definition of Done:**
  - Gateway latency remains under 150ms under peak load.
  - Zero raw PII found in outbound model integration payloads.
- **Recommended Git commit message:** `feat(live): implement redis chat buffering and model gateway pii redaction`

---

## Milestone 2: MVP Feature Delivery

### Sprint 3: Live Incident "Panic Mode" & CDC Outbox Dispatcher

- **Objectives:** Build the core crisis lockdown toggle for creators and deploy a low-latency event dispatcher that replaces database polling.
- **Deliverables:**
  - Shield Mode API endpoint: `POST /v1/live-channels/:id/shield`.
  - Active gateway state listener applying pre-configured restriction filters immediately.
  - Logical replication CDC listener (Debezium/pg_recvlogical) forwarding outbox events to BullMQ queues.
- **Dependencies:** Sprint 2 Redis configurations.
- **Complexity:** High
- **Testing:**
  - Simulating stream raids, verifying toggle restricts link posts and enforces slow-mode in < 1 second.
  - Tracing outbox writes, verifying database commits instantly publish message topics to Redis streams.
- **Definition of Done:**
  - CDC dispatcher processes outbox events with under 50ms propagation latency.
  - API endpoints conform to OpenAPI specifications.
- **Recommended Git commit message:** `feat(api): implement shield mode API and logical cdc outbox publishing`

### Sprint 4: Cryptographic Evidence Locker & Egress Webhooks

- **Objectives:** Secure captured files with legal-grade cryptographic credentials and construct outbound webhook systems for workspace notifications.
- **Deliverables:**
  - RFC 3161 TSA client executing timestamp requests against public and private TSA endpoints.
  - KMS-signed manifest schema containing SHA-256 capture hashes.
  - Database tables and endpoints for configuring outbound webhooks (`POST /v1/webhooks/endpoints`).
  - Webhook dispatcher worker with exponential backoff retries.
- **Dependencies:** AWS KMS access configuration.
- **Complexity:** Medium
- **Testing:**
  - Validating TSA signatures on downloaded evidence manifests using OpenSSL.
  - Simulating event triggers, verifying webhooks correctly route payloads with signature verification headers.
- **Definition of Done:**
  - Evidence manifests contain cryptographic proofs of integrity.
  - Failed webhook delivery logs register in the database.
- **Recommended Git commit message:** `feat(evidence): integrate cryptographic tsa signing and egress webhooks`

---

## Milestone 3: Scale & V2 Capabilities

### Sprint 5: Stateless Gateway Connection Clustering & AI Policy Translation

- **Objectives:** Eliminate single-points-of-failure in streaming sockets and allow non-technical creators to update policies using natural language.
- **Deliverables:**
  - Consistent hashing ring connection balancer in Redis managing channel-lease assignments.
  - Failover routing worker restoring stream WS connections dynamically if a gateway pod drops.
  - `PolicyTranslationAgent` compiling conversational rules into structured JSON schemas.
- **Dependencies:** Sprint 3 Panic Mode settings.
- **Complexity:** High
- **Testing:**
  - Chaos-testing killing gateway instances mid-stream, verifying connection takeover occurs under 3 seconds.
  - Parsing structured instructions, verifying translated policy JSON conforms to the DB schema.
- **Definition of Done:**
  - Active stream subscriptions automatically rebalance across gateway pods.
  - Policy agent outputs valid schema configs.
- **Recommended Git commit message:** `feat(live): deploy gateway connection clustering and policy translation agent`

### Sprint 6: Fair-Share Queue Scheduling & Unified Search API

- **Objectives:** Prevent high-volume workspaces from starving others of processing capacity and offer a unified search cockpit for trust and safety analysts.
- **Deliverables:**
  - BullMQ child-queue manager configured with workspace priority weights and rate-limit boundaries.
  - Unified search endpoint `GET /v1/search` using PostgreSQL Full Text Search (FTS) indexes.
- **Dependencies:** Database migration tools.
- **Complexity:** Medium-High
- **Testing:**
  - Flooding the queues with a single-tenant scan, validating that secondary tenant scan jobs are not starved.
  - Querying search endpoints, checking response accuracy and index coverage.
- **Definition of Done:**
  - Queue scheduling limits any single tenant's queue share.
  - Unified search queries resolve in < 200ms across 1,000,000 records.
- **Recommended Git commit message:** `feat(infra): configure multi-tenant queue fair-share and unified search API`

---

## Milestone 4: Future Enhancements & Hardening

### Sprint 7: Prompt Red-Teaming Harness & Crisis Assistant Agent

- **Objectives:** Automate regression checks for AI prompts and assist moderators by drafting crisis timeline updates automatically.
- **Deliverables:**
  - `ModelEvaluatorAgent` pipeline simulation runner checking prompt drift against static golden datasets.
  - `CrisisCoordinationAgent` tracking incident state and auto-drafting communications.
- **Dependencies:** Model Gateway adapters.
- **Complexity:** High
- **Testing:**
  - Simulating prompt-drift attacks and checking that evaluator flags errors in regression tests.
  - Injecting incident streams, checking if the agent drafts matching crisis timelines.
- **Definition of Done:**
  - CI/CD runs prompt regression tests as quality check before merge.
  - Crisis agent logs events without data loss.
- **Recommended Git commit message:** `feat(ai): build model evaluator harness and crisis assistant agent`

### Sprint 8: Developer API Key Portal & Message Table Partitioning

- **Objectives:** Allow enterprise clients to integrate Aegis alerts with their software and optimize database storage scaling.
- **Deliverables:**
  - Developer credentials dashboard: create, rotate, and revoke API keys with SHA-256 hashing.
  - `pg_partman` setup on PostgreSQL managing weekly partition schemas for `live_chat_messages`.
- **Dependencies:** API Gateway integration.
- **Complexity:** Medium
- **Testing:**
  - Authenticating custom API requests using client keys, checking scope boundaries.
  - Simulating database aging, checking that partition pruning drops expired records without table locks.
- **Definition of Done:**
  - Revoking a client key immediately returns HTTP 401 unauthorized.
  - Partitions are created and purged automatically by database crons.
- **Recommended Git commit message:** `feat(auth): launch developer API key portal and automate database partitioning`
