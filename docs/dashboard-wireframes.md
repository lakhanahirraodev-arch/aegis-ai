# Dashboard Information Architecture and Wireframes

## Product principles

The dashboard helps a person answer four questions in seconds: *What changed? How serious is it? What is the evidence? What safe next action should we take?* It avoids presenting an AI conclusion as a fact and makes confidence, evidence, policy state, and reviewer ownership visible.

Navigation is permission-aware, but the API remains the authority. Mobile uses the same task order with a condensed bottom navigation and no evidence preview that bypasses signed access controls.

## Global shell

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ AEGIS AI   [Workspace: Acme Creator Team ▾]       [Search] [Help] [Alerts 3] [Avatar ▾] │
├───────────────┬─────────────────────────────────────────────────────────────────────────┤
│ Overview      │ Page title                                      [Date range ▾] [Export]  │
│ Threats       ├─────────────────────────────────────────────────────────────────────────┤
│ Cases         │                                                                         │
│ Evidence      │                              Page content                               │
│ Monitoring    │                                                                         │
│ Reports       │                                                                         │
│ Integrations* │                                                                         │
│ Team*         │                                                                         │
│ Settings*     │                                                                         │
└───────────────┴─────────────────────────────────────────────────────────────────────────┘
* Owner/Admin only. Evidence download/access controls are evaluated after navigation.
```

Persistent UI elements:

- A visible active workspace avoids accidental cross-client agency work.
- Alert count represents actionable, unread changes—not every scan result.
- Global search returns only authorized, tenant-scoped metadata. Evidence content is never indexed into an unrestricted client search.
- Every score has a tooltip/link to its deterministic factors, time range, and data coverage.

## Overview: daily protection posture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Good morning, Maya                              Coverage: 8/10 monitoring rules active  │
├───────────────┬─────────────────┬──────────────────┬────────────────────────────────────┤
│ Safety Score  │ Open threats    │ Needs review     │ Monitored reach                     │
│     82 ↑ 4    │  12 (2 urgent)  │       3          │ 1.2M views / last 7 days             │
├───────────────────────────────────────┬─────────────────────────────────────────────────┤
│ Priority queue                        │ Threat trend                                  │
│ [URGENT] Fake support account   92     │          ╭─╮                                   │
│         16k followers · Instagram     │       ╭──╯ ╰──╮  Harassment / impersonation   │
│ [HIGH]  Reposted paid course     81    │  ─────╯       ╰────                              │
│ [MED]   Toxicity increase        64    │  30d                                           │
├───────────────────────────────────────┼─────────────────────────────────────────────────┤
│ Coverage & health                     │ Recent activity                                │
│ YouTube  ● healthy  Instagram ● delay │ 10:32 Evidence captured                         │
│ X        ● healthy  Web       ○ paused │ 10:21 Case AC-104 opened                        │
└───────────────────────────────────────┴─────────────────────────────────────────────────┘
```

The score is a trend/triage signal, not a claim that a user is “safe.” It displays coverage gaps and stale connector status alongside its score so a low incident count cannot be mistaken for full protection.

## Threat inbox

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Threats  [Open] [Severity ▾] [Category ▾] [Platform ▾] [Assignee ▾]  [Saved view ▾]      │
├────┬───────────────┬────────────────────────────┬────────┬─────────┬────────────────────┤
│ □  │ Severity      │ Finding                    │ Source │ Score   │ State / owner       │
├────┼───────────────┼────────────────────────────┼────────┼─────────┼────────────────────┤
│ □  │ URGENT        │ Fake support account       │ IG     │ 92/100  │ New · Unassigned    │
│ □  │ HIGH          │ Likely transformed repost  │ YT     │ 81/100  │ Triaged · Alex       │
│ □  │ MEDIUM        │ Harassment spike           │ X      │ 64/100  │ Monitoring · Priya   │
├────┴───────────────┴────────────────────────────┴────────┴─────────┴────────────────────┤
│ Bulk actions: assign / mark reviewed. Never bulk-submit enforcement actions.              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Threat detail and human triage

```text
┌──────────────────────────────────────────┬──────────────────────────────────────────────┐
│ Fake support account                      │ Case context                                  │
│ URGENT · 92 risk · NEW                    │ Not yet linked                                │
│ Instagram · first seen 10:04 UTC           │ [Create case] [Link to existing]              │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ [Evidence] [Analysis] [Activity]          │ Recommended next steps                         │
│                                              │ 1. Verify identity evidence                    │
│ Evidence preview (restricted)              │ 2. Preserve current profile capture            │
│ [Request secure access]                    │ 3. Draft platform report                       │
│ SHA-256: 4a7…   captured: 10:09 UTC        │ [Accept triage] [Dismiss] [Escalate]          │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Why this was flagged                       │ Confidence & limitations                       │
│ • Handle differs by 1 char                 │ Match confidence: 0.87                         │
│ • Uses protected avatar reference          │ Not identity proof; human verification needed  │
│ • External links lead to unrelated domain  │ Model/policy version: visible for reviewers    │
└──────────────────────────────────────────┴──────────────────────────────────────────────┘
```

Triage records a human decision and optional rationale. “Dismiss” never deletes the evidence; it changes the finding state. The analysis tab shows evidence references and limitations, not ungrounded free-form agent reasoning.

## Case workspace

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Case AC-104  Fake support account campaign  [IN REVIEW ▾]  Owner: Alex  Priority: Urgent │
├───────────────────┬─────────────────────────────────────────┬───────────────────────────┤
│ Timeline          │ Evidence bundle                         │ Response                  │
│ 10:04 discovered  │ ✓ Profile capture · SHA verified        │ Draft: Platform report    │
│ 10:09 captured    │ ✓ Scam landing-page capture             │ Status: Pending approval  │
│ 10:20 triaged     │ + Add existing evidence                  │ Reviewer: Priya           │
│ 10:21 case opened │ [Create evidence package]               │ [View draft]              │
│                   │                                         │ [Approve] / [Request edit]│
└───────────────────┴─────────────────────────────────────────┴───────────────────────────┘
```

Response controls reflect the enforcement state machine: an analyst can prepare a draft, while an authorized reviewer/owner can approve it. The submit action is performed asynchronously by the response worker and exposes the provider receipt/status when returned.

## Evidence center

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Evidence Center [All cases ▾] [Type ▾] [Legal hold ▾] [Captured date ▾]                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Type        Source               Integrity           Retention          Access           │
│ Screenshot  instagram.com/...    SHA-256 verified    Hold               [Request URL]    │
│ Video       youtube.com/...      SHA-256 verified    2027-07-10         [Request URL]    │
│ Report      Case AC-104          Generated + signed  Hold               [Download PDF]   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

All secure-access requests emit an audit event. Bulk export is intentionally omitted from the first release; a case-specific evidence package supports a controlled legal workflow.

## Monitoring and integration setup

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Monitoring rules                                                   [+ New rule]           │
├──────────────────────┬──────────┬────────────────────┬───────────┬──────────────────────┤
│ Impersonation search │ Active   │ Instagram, YouTube │ Every 6 h │ Last run: complete   │
│ Content match        │ Paused   │ YouTube            │ Daily     │ Needs reference asset│
│ Reputation monitor   │ Active   │ News, web          │ Every 2 h │ Last run: partial    │
└──────────────────────┴──────────┴────────────────────┴───────────┴──────────────────────┘

Rule creation uses a bounded configuration wizard: protected profile → approved sources/locales → cadence/budget → policy preview → review. It does not imply that an unsupported platform can be scanned or moderated.

## Assistant

The assistant is a scoped, evidence-linked query interface—not an administrative backdoor. It can summarize authorized data and prepare drafts; it cannot change roles, access unrestricted evidence, alter retention, approve enforcement, or send a report.

```text
User: “Show today’s urgent threats and summarize what changed.”
Assistant: [3 cited threat cards with time range and coverage note]
           “Two new impersonation detections and one content-repost cluster…”
           [Open filtered inbox] [Create briefing draft]
```

Every answer identifies its workspace, time range, source citations, and limitations. The UI clearly separates a generated draft from an approved record.
