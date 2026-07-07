# MVP Scope
CariKOL — Engineering Guardrail
Last updated: 2026-07-07

**This document exists to prevent scope creep during development.**

If a feature is not on the WE ARE BUILDING list, it is not being built. If a feature appears in any other document but is not in this list, it is not being built in MVP.

When in doubt: ship less, ship right.

---

## We Are NOT Building

```
❌ AI recommendations
❌ Machine learning of any kind
❌ Knowledge graph
❌ Recommendation engine
❌ Creator reputation engine (as a separate system)
❌ Brand memory engine (as a separate system)
❌ Analytics dashboard
❌ Performance reporting
❌ Content submission or review
❌ Posting verification
❌ Briefing delivery to creators
❌ Invoice generation
❌ Payment tracking
❌ Client portal
❌ Creator portal
❌ External API integrations (TikTok, Instagram, YouTube)
❌ Follower or engagement auto-scraping
❌ Email or WhatsApp automation
❌ Notification system
❌ Commenting or @mentions
❌ File upload or attachment storage
❌ Campaign templates
❌ Multi-tenancy (other agencies)
❌ Role-based permissions beyond basic role separation
❌ Audit log UI
❌ Data export to Excel/PDF
❌ Mobile app
❌ Dark mode
❌ Public landing page
```

---

## We ARE Building

### 1. Campaign Workspace
A structured lifecycle for one KOL campaign from brief to close.

```
Draft → Active → Pending Close → Closed
```

Every campaign has a standardized brief. Every campaign moves through defined stages. Every stage requires specific decisions before advancing.

### 2. Creator Workspace
A searchable list of creator records with filters and contextual history.

```
Search creators by:
  Platform / Niche / Tier / Rate range / "Has worked with [Brand]" / Rating / Last active
```

Creator records are built from imports and enriched by every campaign they appear in.

### 3. Decision Capture
Every meaningful action in the workflow produces an immutable, structured Decision record.

```
creator_proposed
internal_approved
internal_rejected
client_approved
client_rejected
creator_confirmed
creator_declined
creator_no_response
creator_budget_rejected
creator_unavailable
```

Every Decision has: type, owner, reason (structured), confidence (Explicit / Inferred), timestamp, recorded by.

### 4. Outcome Review
A mandatory closing form per creator per campaign. Required before campaign moves to Closed.

```
Content Quality (1–5)
Communication (1–5)
Professionalism (1–5)
Would Work Again (Yes / No / Conditional)
Notes (optional)
```

### 5. Contextual Knowledge Surfacing
When a creator is being considered for a campaign, the system automatically surfaces:
- Prior work with this brand (confirmed, rejected, outcome)
- Creator's aggregate ratings
- Behavioral patterns (no-response count, decline rate)

This is not AI. This is a database query. It appears automatically in the UI without requiring the user to navigate anywhere.

### 6. Brand Detail
A page per client showing:
- All past campaigns
- Creators previously confirmed and their ratings
- Creators previously rejected and common reasons

### 7. Data Migration Support
A mechanism to import the initial ~300 creator records from spreadsheets before launch. This is a one-time admin operation, not a user-facing feature.

---

## MVP Tech Decisions (Guardrails)

These are constraints, not recommendations. They exist to keep the build fast.

| Decision | Choice | Reason |
|---|---|---|
| CreatorReputation | Computed at query time | No separate table — no inconsistency risk |
| BrandMemory | Computed at query time | Same |
| KnowledgeObject | Not built | Premature — Decision + OutcomeReview is sufficient |
| Decision records | Append-only | No UPDATE on Decision rows |
| Client approval | Internal-only | Client still uses WhatsApp — Campaign Manager logs the feedback |
| Creator interaction | Internal-only | Creators still use WhatsApp — results logged internally |
| Auth | Simple role-based (Campaign Manager / KOL Specialist / Admin) | No complex permissions needed for internal tool |

---

## MVP Success Criteria

The MVP is complete when:

1. A KOL Specialist can search for creators and see their full history with a specific brand in under 30 seconds
2. A Campaign Manager can take a campaign from Brief to Closed without touching a spreadsheet
3. Every closed campaign has a completed Outcome Review for every confirmed creator
4. The first 300 creator records are imported and searchable
5. The Buzzeryok team uses CariKOL as the primary tool for at least 3 KOL campaigns in a row

The MVP is NOT complete based on:
- Number of features shipped
- Lines of code written
- UI polish
- Performance benchmarks

The only measure is whether the Buzzeryok team uses it instead of their current tools.

---

## The Guardrail Question

Before adding any feature during development, ask:

> "Will the Buzzeryok team use this feature every week? Does it replace something they currently do manually? Is it on the WE ARE BUILDING list?"

If the answer to any of these is No — do not build it.

Features not built in MVP are not lost. They go into the backlog. The backlog is fine. Scope creep is not.
