# Observability, SLOs, and Operational Readiness

## Signals and ownership

Every production component emits OpenTelemetry traces, structured JSON logs, and Prometheus-compatible metrics. Signals use a shared correlation ID across HTTP requests, outbox events, jobs, provider calls, evidence artifacts, and audit decisions. Logging is redacted before export; raw evidence, tokens, full prompts, legal names, and unbounded provider payloads are not observability data.

| Signal family   | Required dimensions                                                                 | Primary owner             |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| API             | route, status, error code, latency, workspace-plan class                            | API team                  |
| Queue/job       | queue, job type, age, attempt, outcome, provider, failure class                     | Worker team               |
| Evidence        | capture outcome, artifact type, hash verification, quarantine, retention hold       | Evidence owner            |
| Detection/AI    | agent, model/policy version, latency, cost, verdict, reviewer override              | Trust & Safety / AI owner |
| Connector       | platform, quota, rate-limit events, auth state, coverage freshness                  | Integration owner         |
| Security        | auth failures, denied cross-tenant access, privileged action, secret/provider error | Security owner            |
| Business safety | open threat severity, time-to-triage, response backlog, coverage gap                | Trust & Safety owner      |

## Initial service-level objectives

Targets are reviewed quarterly and refined from observed traffic. They exclude an outage or delay of a third-party platform/provider from core API availability, but provider status is exposed to users and operations.

| Service indicator               | Initial objective                                        | Error budget / action                              |
| ------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Dashboard/read API availability | 99.9% monthly                                            | Page API/on-call when budget burn predicts breach. |
| Read endpoint latency           | p95 < 300 ms, p99 < 750 ms                               | Investigate query/edge regressions.                |
| Command acknowledgement         | p95 < 500 ms; long work is 202                           | Reject synchronous provider waits.                 |
| Critical job start              | p95 < 2 minutes from accepted command                    | Scale queue pool or apply intake controls.         |
| Evidence integrity              | 100% captured artifacts have verified SHA-256 + manifest | Stop downstream analysis on violation.             |
| External action correctness     | 0 duplicate submissions; 100% approval/audit linkage     | Page immediately on violation.                     |
| Backup recovery                 | quarterly restore meets stated RPO/RTO                   | Block launch/expansion on failed drill.            |

## Dashboards and alerts

Minimum production dashboards: executive safety posture, API health, database health, queue/worker health, evidence pipeline, connectors, model gateway/cost, external response delivery, security/audit, and deployment/release health.

Page immediately for: cross-tenant authorization anomaly, evidence hash mismatch, unauthorized/duplicate external action, confirmed secret exposure, sustained API outage, database data-loss risk, or security incident. Create a ticket/urgent notification for: SLO burn, queue oldest-age breach, dead-letter growth, provider outage, connector reauthentication surge, model cost breach, or storage/backup lifecycle failure.

Each alert links to a dashboard, owner, severity definition, immediate mitigation, escalation path, and runbook. Alerts without an owner or action are removed rather than normalized as noise.

## Capacity and cost controls

- Scale workers on queue depth and oldest-job age, with per-platform/provider concurrency and spend ceilings.
- Track cost per scan, evidence capture, model run, active workspace, and external report. Alert on deviation from budget and automatically pause non-critical work when configured limits are reached.
- Benchmark and index the top tenant-scoped queries; isolate analytics/read replicas or warehouse workloads before they degrade case operations.
- Run load tests before major launches and review capacity for anticipated events (large creator onboarding, elections, major livestreams, or public incidents).

## Incident management

Use an incident commander, technical lead, communications lead, and scribe for high-severity events. Preserve relevant evidence and logs, suspend harmful automations if needed, communicate only verified facts, and create a blameless post-incident review with timeline, root cause, control gap, owners, and due dates. Security/privacy incidents also follow counsel-approved notification and evidence-preservation procedures.
