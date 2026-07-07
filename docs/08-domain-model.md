# Domain Model
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

This document defines the core entities, their relationships, and their precise meanings. It translates the vocabulary defined in the Founder Thesis into a concrete data model that informs the database schema and the UX structure.

---

## MVP Database Tables (Source of Truth Only)

The MVP database contains exactly these tables. No more.

Everything else is computed from these five sources of truth.

```
Campaign
Brief
Creator
Brand
Decision      ← event record, append-only
OutcomeReview
Reason
User
```

**What is NOT a table in MVP:**
- ~~KnowledgeObject~~ — future derived entity, not built in MVP
- ~~CreatorReputation~~ — computed view from Decision + OutcomeReview
- ~~BrandMemory~~ — computed view from Decision across campaigns

If it is not a source of truth, it is not a table.

---

## The Event Model

Every meaningful action in CariKOL is an event.

**Decision is not an object. Decision is an event.**

This distinction matters because:
- Events are immutable. A recorded Decision is never edited.
- Events have sequence. The history of a campaign is the ordered list of its events.
- Events have provenance. Every event knows who triggered it, when, and in what context.
- Future AI can analyze event streams. Pattern detection, prediction, and recommendation become possible when history is complete and trustworthy.

**Practical implication for MVP:** Decision records are append-only at the application level. If someone records the wrong reason, they do not edit the existing record — they create a corrective decision that supersedes it. The old record remains. The history is preserved.

This does not require event sourcing architecture. It requires discipline: no UPDATE on Decision rows.

**The campaign event sequence:**

```
CampaignCreated
      ↓
BriefCompleted
      ↓
CreatorProposed (KOL Specialist adds creator to list)
      ↓
CreatorInternalRejected  OR  CreatorApprovedForClient
      ↓
CreatorClientRejected  OR  CreatorClientApproved
      ↓
CreatorConfirmed  OR  CreatorDeclined  OR  CreatorNoResponse  OR  CreatorBudgetRejected  OR  CreatorUnavailable
      ↓
CampaignActive
      ↓
OutcomeReviewCompleted (per creator)
      ↓
CampaignClosed
```

Each of these is a Decision record with a specific type.

---

## Core Entities

### Campaign
The primary work unit.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| brand_id | → Brand | |
| status | Enum | draft / active / pending_close / closed |
| created_by | → User | |
| created_at | Timestamp | |
| closed_at | Timestamp | null until closed |

---

### Brief
The structured definition of what a campaign is trying to accomplish. Required before a campaign can move to Active.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| campaign_id | → Campaign | one-to-one |
| platform | Enum | tiktok / instagram / youtube / other |
| objective | String | |
| creator_criteria | String | niche, tier, audience type |
| budget_min | Integer | IDR |
| budget_max | Integer | IDR |
| deliverables | String | |
| start_date | Date | |
| content_deadline | Date | |
| posting_date | Date | |
| special_requirements | String | optional |
| created_at | Timestamp | |

---

### Creator
An external contributor who may participate in campaigns. Records accumulate operational history through the Decisions attached to them.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| username | String | platform-specific handle |
| platform | Enum | tiktok / instagram / youtube |
| niche | String | |
| tier | Enum | nano / micro / macro / mega |
| follower_count | Integer | updated periodically |
| engagement_rate | Decimal | updated periodically |
| contact | String | WhatsApp or other |
| is_active | Boolean | still reachable and working |
| typical_rate_min | Integer | IDR — updated from Decision history |
| typical_rate_max | Integer | IDR — updated from Decision history |
| notes | String | general notes |
| created_at | Timestamp | |
| updated_at | Timestamp | |

**Note:** Creator Reputation is NOT stored here. It is computed at query time from Decision and OutcomeReview records. No risk of inconsistency.

---

### Brand
A client organization.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| industry | String | |
| account_manager_id | → User | |
| notes | String | |
| created_at | Timestamp | |

**Note:** Brand Memory is NOT stored here. It is computed at query time from Decisions across campaigns for this brand.

---

### Decision
The atomic event record. Append-only. Never updated after creation.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| campaign_id | → Campaign | |
| creator_id | → Creator | |
| type | Enum | see Decision Types below |
| owner | Enum | campaign_manager / client / creator / system |
| reason_id | → Reason | required (except for type: creator_proposed) |
| confidence | Enum | explicit / inferred |
| confirmed_rate | Integer | IDR — filled only for type: creator_confirmed |
| notes | String | optional free text |
| recorded_by | → User | internal user who logged this event |
| decided_at | Timestamp | when the decision was actually made |
| created_at | Timestamp | when it was logged in the system |
| supersedes_id | → Decision | if this corrects a previous record |

**Decision Types:**
```
creator_proposed         — KOL Specialist adds creator to campaign list
internal_approved        — Campaign Manager approves for client submission
internal_rejected        — Campaign Manager removes during internal review
client_approved          — Client confirms this creator
client_rejected          — Client requests removal or replacement
creator_confirmed        — Creator agrees, rate confirmed
creator_declined         — Creator said no explicitly
creator_no_response      — Unreachable after defined period
creator_budget_rejected  — Negotiation failed on price
creator_unavailable      — Confirmed booking conflict
```

**Important distinction:**
`internal_rejected` and `client_rejected` are assessments of creator-campaign fit.
`creator_declined`, `creator_no_response`, `creator_budget_rejected`, `creator_unavailable` are creator behavior events. They must never be conflated — they produce different kinds of knowledge.

---

### Reason
The structured explanation attached to a Decision.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| decision_id | → Decision | |
| category | Enum | taxonomy defined during database design |
| free_text | String | optional additional context |

**Note on taxonomy:** The specific category values must be defined with direct input from KOL Specialist and Campaign Manager during database design. The taxonomy must match how the team already thinks about rejections. This is an implementation decision, not a discovery decision.

---

### OutcomeReview
The mandatory closing evaluation per creator per campaign.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| campaign_id | → Campaign | |
| creator_id | → Creator | |
| content_quality | Integer | 1–5 |
| communication | Integer | 1–5 |
| professionalism | Integer | 1–5 |
| would_work_again | Enum | yes / no / conditional |
| notes | String | optional |
| completed_by | → User | |
| completed_at | Timestamp | |

A Campaign cannot transition to `closed` status until all creators who reached `creator_confirmed` have a completed OutcomeReview.

---

### User
Internal Buzzeryok team member.

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| email | String | |
| role | Enum | campaign_manager / kol_specialist / admin |
| created_at | Timestamp | |

---

## Computed Views (Not Tables)

These are derived from source tables at query time. They are never stored independently.

### CreatorReputation (computed from Decision + OutcomeReview)
When displaying a Creator's profile, the system computes:
- Average content quality, communication, professionalism (from OutcomeReviews)
- Would-work-again rate
- Total campaigns participated
- Internal rejection count and most common reason
- Client rejection count
- No-response / declined / unavailable counts
- Last campaign date

### BrandMemory (computed from Decision where campaign.brand_id = X)
When displaying a Brand, or when listing creators for a campaign, the system computes:
- Creators previously confirmed for this brand
- Creators previously rejected for this brand (and reasons)
- Average revision rounds before approval
- Most common client rejection reasons

### CreatorCampaignHistory (computed for Creator Workspace context)
When a creator is shown inside a campaign's creator list, the system shows:
- Was this creator previously considered for this brand? What happened?
- This is the "surfacing at the moment of decision" feature

---

## Entity Relationships

```
Brand ──────────────── has many ──────────→ Campaign
Campaign ───────────── has one ───────────→ Brief
Campaign ───────────── has many ──────────→ Decision
Campaign ───────────── has many ──────────→ OutcomeReview
Decision ───────────── belongs to ────────→ Campaign
Decision ───────────── belongs to ────────→ Creator
Decision ───────────── belongs to ────────→ User (recorded_by)
Decision ───────────── has one ───────────→ Reason
Decision ───────────── may supersede ─────→ Decision
OutcomeReview ──────── belongs to ────────→ Campaign
OutcomeReview ──────── belongs to ────────→ Creator
OutcomeReview ──────── belongs to ────────→ User (completed_by)
```

---

## Campaign Status Machine

```
draft
  └─ (brief complete) ──────────────────────────────→ active

active
  └─ (all creators resolved, close initiated) ──────→ pending_close

pending_close
  └─ (all OutcomeReviews completed) ───────────────→ closed

closed  [terminal — no further state transitions]
```

---

## What Is NOT In MVP

Removed from this version. May appear in future phases.

| Entity | Reason Not In MVP |
|---|---|
| KnowledgeObject | Future derived entity — Decision + OutcomeReview is sufficient |
| Notification | Future automation feature |
| ContentSubmission | Phase 3 — execution tracking |
| Invoice / Payment | Finance workflow, out of scope |
| ClientUser | No client portal in MVP |
| CreatorUser | No creator portal in MVP |
| AIRecommendation | Phase 5 — knowledge base must exist first |
