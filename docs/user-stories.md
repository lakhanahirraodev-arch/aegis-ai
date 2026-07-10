# Aegis AI: User Stories

This document compiles the product-level user stories for Aegis AI based on the Product Requirements Document (PRD). Stories are categorized by core modules and address individual Creators, Livestreamers, Moderators, Agencies, Admins, and Enterprise customers.

---

## 1. Identity & Reputation Protection Module

### Story 1.1: Impersonation Handle Monitoring

- **User Story:** As an **Individual Creator**, I want to automatically monitor social media platforms for duplicate or deceptively similar handles using my display name and profile picture, so that I can protect my audience from financial scams.
- **Business Value:** Prevents brand reputation loss, shields fans from malicious direct-message phishing, and preserves creator monetization channels.
- **Acceptance Criteria:**
  - System scans platforms specified in `ConnectedAccount` rules.
  - System matches handle variations (homoglyphs, lookalikes, symbols).
  - Calculates similarity based on handle spelling, bio text, and profile picture signatures.
  - Creates a `ThreatCluster` and emails the creator with links to the fake accounts.
- **Edge Cases:**
  - Legitimate users sharing the creator's real name.
  - Fan accounts that explicitly state "not affiliated" in their bio.
- **Dependencies:** Platform API connectors, Search crawling worker.
- **Database Impact:** Writes new rows to `detections` and `threat_clusters`; reads from `creator_profiles` and `identity_references`.
- **API Impact:** Queried via `GET /v1/detections` and `GET /v1/threat-clusters`.
- **AI Agent Impact:**
  - `DiscoveryAgent` crawls platform results.
  - `IdentityMatchAgent` evaluates handle spelling and profile photo visual similarity.

### Story 1.2: Brand Abuse Detection

- **User Story:** As an **Agency Admin**, I want to monitor forums, news sites, and video uploads for negative sentiment, counterfeit sales, and trademark abuse regarding my clients' brands, so that I can address public relations risks immediately.
- **Business Value:** Lowers public relations response time, safeguards brand agreements, and protects revenue from counterfeit listings.
- **Acceptance Criteria:**
  - Monitors rules of type `BRAND_ABUSE_SEARCH` and `REPUTATION_MONITOR`.
  - Identifies unauthorized trademark usage or keywords.
  - Flags items that contain high risk scores for defamation or fraud.
- **Edge Cases:**
  - Sarcastic or satirical content that uses trademark terms.
  - Homonyms of brand terms used in normal context.
- **Dependencies:** External web monitoring adapters.
- **Database Impact:** Writes new rows to `source_items` and `detections`.
- **API Impact:** Queried via `GET /v1/detections?category=TRADEMARK_ABUSE`.
- **AI Agent Impact:**
  - `AbuseRiskAgent` parses context for brand defamation and scam indicators.

---

## 2. Content Protection Module

### Story 2.1: Copyright Infringement & Automatic DMCA Drafting

- **User Story:** As an **Enterprise Customer**, I want Aegis to scan video hosting sites for re-uploads of my premium media assets and generate pre-drafted DMCA takedown forms, so that I can quickly protect my intellectual property.
- **Business Value:** Reclaims ad-revenue from stolen uploads and dramatically lowers external legal and paralegal billing hours.
- **Acceptance Criteria:**
  - Compares candidate media hashes/embeddings against references in the workspace.
  - Flags matches above the configured similarity threshold (e.g., 85% match).
  - Generates a structured `EnforcementAction` of type `DMCA_NOTICE` with pre-populated video URLs, owner metadata, and infringement times.
- **Edge Cases:**
  - Fair use reviews or reaction commentary using short clips.
  - Legitimately licensed syndication partners re-uploading content.
- **Dependencies:** Core content similarity service, Private asset storage bucket.
- **Database Impact:** Reads from `IdentityReference` (kind `VIDEO_REFERENCE`); writes to `detections` and `enforcement_actions` (status `DRAFT`).
- **API Impact:** `POST /v1/enforcement-actions/:id/approve` transitions the draft to the submission pipeline.
- **AI Agent Impact:**
  - `ContentSimilarityAgent` calculates audio/video match scores.
  - `ResponseDraftAgent` formats the platform-specific legal complaint.

---

## 3. Live Guardian Module

### Story 3.1: Streamer Panic Button (Shield Mode)

- **User Story:** As a **Livestreamer**, I want to trigger a "Panic Mode" during a live broadcast, so that I can immediately lock down chat settings and stop a coordinated hate raid.
- **Business Value:** Preserves stream continuity, protects sponsors from seeing unmoderated hate speech, and prevents channel suspensions.
- **Acceptance Criteria:**
  - One-click toggle instantly sets `panicModeActive` to `true` on the gateway.
  - Applies the channel's pre-configured emergency policy (e.g., enable slow mode, restrict links, restrict chat to subscribers).
  - Publishes alerts to active workspace moderators.
- **Edge Cases:**
  - Accidental trigger mid-stream.
  - Platform API connection dropping during active transition.
- **Dependencies:** Live Guardian WebSocket connection.
- **Database Impact:** Writes an incident record to `live_incidents` and updates the channel settings in `live_channels`.
- **API Impact:** Exposes `POST /v1/live-channels/:id/shield` to enable/disable.
- **AI Agent Impact:**
  - `CrisisCoordinationAgent` starts tracking the incident and begins generating the timeline log.

### Story 3.2: Real-Time Moderator AI Flagging

- **User Story:** As a **Moderator**, I want the Live Guardian dashboard to stream real-time chat messages annotated with toxicity flags and explanations, so that I can quickly review and execute actions.
- **Business Value:** Minimizes chat disruption, increases moderation speed, and reduces moderator stress during high-activity sessions.
- **Acceptance Criteria:**
  - Incoming chat events are evaluated by the local policy engine under 150ms.
  - UI displays toxic, spam, or scam messages with highlighted labels and brief AI rationales.
  - Includes one-click buttons to apply suggested actions (warn, timeout, ban).
- **Edge Cases:**
  - In-jokes, streamer slang, or gaming expressions flagged as toxic.
  - High message volume (500+ messages/sec) flooding the UI view.
- **Dependencies:** Real-time event broker subscription, local policy cache.
- **Database Impact:** Writes `live_chat_messages` (buffered/batched), `live_moderation_findings`, and `live_moderation_actions`.
- **API Impact:** Handled via real-time WebSocket topic `live.finding.created.v1`.
- **AI Agent Impact:**
  - `LiveModerationAgent` checks rules and scores context for abuse.

---

## 4. Evidence Center Module

### Story 4.1: Immutable Legal-Grade Evidence Vaulting

- **User Story:** As an **Agency Admin**, I want to capture evidence of online threats and lock them in a cryptographically signed locker, so that I have bulletproof proof of custody for legal prosecution.
- **Business Value:** Avoids evidence tampering challenges by opposing parties, protects the agency from liability, and streamlines legal intake.
- **Acceptance Criteria:**
  - System captures target URL, raw source headers, and metadata.
  - Generates a SHA-256 checksum of the capture file.
  - Acquires an RFC 3161 timestamp signature from a trusted Time Stamping Authority.
  - Stores files in a write-once-read-many (WORM) private bucket.
  - Creates a permanent, un-editable entry in the `AuditLog`.
- **Edge Cases:**
  - Web capture failures (e.g. target page deleted before crawl starts).
  - TSA server unreachable at moment of capture.
- **Dependencies:** Secure KMS keys, trusted TSA server integration.
- **Database Impact:** Writes new `EvidenceItem` and logs to `audit_logs`.
- **API Impact:** Exposes `POST /v1/cases/:id/evidence` and `GET /v1/evidence/:id/access-url`.
- **AI Agent Impact:**
  - `EvidenceAgent` extracts metadata and verifies structural integrity.

---

## 5. Analytics & Operations Module

### Story 5.1: System Admin Workspace Quota Enforcements

- **User Story:** As a **System Admin**, I want to enforce strict usage quotas (e.g., storage limits, active stream minutes, LLM token counts) per workspace, so that I can control operating costs and manage billing tiers.
- **Business Value:** Prevents runaway cloud costs, protects the platform from API abuse, and enables tier-based pricing models.
- **Acceptance Criteria:**
  - Tracks consumption counters in real time.
  - Issues warning notifications to workspace admins at 80% usage.
  - Bypasses long-running scans or locks API calls once a hard limit is exceeded.
- **Edge Cases:**
  - A creator stream hitting limits mid-broadcast (must support grace-period/overage policies to avoid sudden disconnection).
- **Dependencies:** Queue scheduler integration, workspace billing setup.
- **Database Impact:** Reads limits from `workspaces.settings`; updates `JobRun` and `AgentRun` logs; writes to billing counters.
- **API Impact:** Returns quota state in `GET /v1/workspaces/:id`.
- **AI Agent Impact:**
  - `AnalyticsAgent` generates monthly consumption reports and highlights anomalies.
