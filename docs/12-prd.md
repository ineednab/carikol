# Product Requirements Document
CariKOL — MVP
Last updated: 2026-07-07

---

## Context

This PRD does not repeat what is already documented. Before reading this document, the following must be read:

| Document | What it covers |
|---|---|
| 00-founder-thesis.md | Product philosophy, vocabulary, mental model |
| 03-product-vision.md | Vision, positioning, Knowledge Maturity Model |
| 05-user-journey.md | Full campaign lifecycle and decision points |
| 07-information-architecture.md | Screens, routes, UX principles |
| 08-domain-model.md | Entity definitions and relationships |
| 09-database-schema.md | Bounded contexts and schema |
| 11-mvp-scope.md | What is and is not being built |

This PRD covers only: **Functional Requirements, Business Rules, Acceptance Criteria, Edge Cases, Non-Functional Requirements, and Success Metrics.**

---

## Functional Requirements

### Module: Campaign

**FR-CAM-01 — Create Campaign**
A Campaign Manager can create a new campaign by completing a structured brief form.
The campaign is created in `draft` status.
All brief fields except `special_requirements` are required before the campaign can be saved.

**FR-CAM-02 — Campaign Status Transitions**
Campaigns move through exactly these states in order:
`draft → active → pending_close → closed`
No status can be skipped. No status can be reversed.

**FR-CAM-03 — Lock Brief on Activation**
Once a campaign transitions to `active`, the Brief becomes read-only.
Brief fields cannot be edited after activation.

**FR-CAM-04 — Advance to Internal Review**
A KOL Specialist marks a creator list as "Ready for Internal Review."
This action is only available when at least one creator has been proposed.

**FR-CAM-05 — Advance to Client Submission**
A Campaign Manager can advance to Client Submission only after every proposed creator has received an `internal_approved` or `internal_rejected` decision.
Creators with no decision block this transition.

**FR-CAM-06 — Campaign Close Gate**
A campaign cannot transition from `pending_close` to `closed` until every creator who received a `creator_confirmed` decision has a completed `outcome_review`.
The "Complete Close" action is hidden until all Outcome Reviews are submitted.

**FR-CAM-07 — Campaign Detail View**
The Campaign Detail screen shows:
- Brief summary (read-only after activation)
- Full creator list with current status per creator
- Last action timestamp per creator
- Stage-appropriate action buttons

---

### Module: Creator Workspace

**FR-CRW-01 — Creator Search and Filter**
KOL Specialist can filter creators by:
- Platform (single or multi-select)
- Niche (text search)
- Tier (Nano / Micro / Macro / Mega)
- Follower count range
- Typical rate range (IDR)
- "Has worked with [brand]": Yes / No / Either
- "Would work again": Yes only / Include conditional / All
- Is active: true (default)

**FR-CRW-02 — Creator Card in List View**
Each creator card shows:
- Name, platform, niche, tier
- Follower count, engagement rate, typical rate range
- Aggregate rating (avg content + communication + professionalism across all OutcomeReviews)
- "Would work again" indicator
- Last campaign date

**FR-CRW-03 — Brand Context Indicators**
When Creator Workspace is opened in Campaign Context (from a campaign for Brand Y), each creator card shows one of:
- Green: "Previously confirmed for [Brand Y]" + outcome rating
- Red: "Previously rejected for [Brand Y]" + reason category
- Yellow: "No history with [Brand Y]"

This computation requires no separate table — it is a query against `decision` filtered by `campaign.brand_id`.

**FR-CRW-04 — Creator Detail**
Creator Detail shows:
- Static profile attributes
- Computed reputation (avg ratings, would-work-again rate, campaign count)
- Full decision history across all campaigns (sortable, filterable by brand and decision type)
- Rate history from all `creator_confirmed` records

**FR-CRW-05 — Add Creator to Campaign**
From Creator Workspace in Campaign Context, a KOL Specialist can add a creator to the current campaign.
This creates a `creator_proposed` Decision record.

**FR-CRW-06 — Bulk Import (Admin)**
An Admin user can import creator records from a CSV or spreadsheet.
Required import fields: name, username, platform, niche, tier, follower_count, engagement_rate, typical_rate_min, typical_rate_max, contact.
Optional: notes, is_active.

---

### Module: Decision

**FR-DEC-01 — Internal Rejection Requires Reason**
When a Campaign Manager rejects a creator during Internal Review:
- `decision_reason.category` is required
- `confidence` defaults to `explicit` and cannot be changed (internal decisions are always explicit)
- Free text note is optional
- The creator's status updates immediately (optimistic UI)

**FR-DEC-02 — Client Rejection Requires Confidence**
When a Campaign Manager logs a client rejection:
- `decision_reason.category` or free text is required
- `confidence` is required and must be explicitly selected (Explicit / Inferred)
- The system never pre-selects confidence — the user must choose

**FR-DEC-03 — Creator Unavailability Categorized Separately**
Decisions of type `creator_declined`, `creator_no_response`, `creator_budget_rejected`, and `creator_unavailable` are labeled differently from rejections in the UI.
They appear in history with the label "Unavailable / Declined" — never "Rejected."
Reason category field is optional for these types.

**FR-DEC-04 — Confirmation Requires Rate**
A `creator_confirmed` decision requires `confirmed_rate` (IDR) before saving.
Confirmed rate is used to update the creator's `typical_rate_min/max` range.

**FR-DEC-05 — Decision Immutability**
Once a Decision is saved, its core fields (`type`, `owner`, `reason`, `confidence`) cannot be edited.
If the user made an error, they can create a corrective decision using "Mark as incorrect" — which creates a new decision with `supersedes_id` pointing to the original.
Superseded decisions remain visible in history with a visual indicator.

**FR-DEC-06 — Decision History Always Visible**
On the Campaign Detail screen, every decision ever recorded for each creator on this campaign is visible in chronological order.
Superseded decisions are shown with a strikethrough or muted style.

---

### Module: Outcome Review

**FR-OR-01 — Outcome Review Required Per Confirmed Creator**
When a Campaign Manager initiates Campaign Close, a form opens for each creator who received a `creator_confirmed` decision.
All forms must be completed before the campaign can close.
There is no "skip" option.

**FR-OR-02 — Outcome Review Fields**
For each creator, required fields:
- Content Quality: 1–5 (required)
- Communication: 1–5 (required)
- Professionalism / Reliability: 1–5 (required)
- Would work again: Yes / No / Conditional (required)

Optional: Notes (free text)

**FR-OR-03 — Creator Reputation Updates on Submit**
After all Outcome Reviews are submitted and the campaign closes:
- Computed reputation for each evaluated creator reflects the new ratings immediately
- Rate history for each `creator_confirmed` creator is updated from `confirmed_rate`
- Brand Memory for the campaign's brand is updated

---

### Module: Brand

**FR-BRD-01 — Brand Detail Page**
Brand Detail shows:
- Brand profile (name, industry, account manager)
- All past campaigns sorted by date
- Computed Brand Memory:
  - Creators previously confirmed + outcome ratings
  - Creators previously rejected by client + reason categories
  - Most common client rejection reason (top 3)

**FR-BRD-02 — Brand Creation**
A Campaign Manager can create a new brand when starting a campaign.
Required fields: name. Optional: industry, notes.

---

## Business Rules

These rules are enforced at the service layer, not only in the UI.

| ID | Rule |
|---|---|
| BR-01 | Decision rows are insert-only. No UPDATE permitted on `decision` table via any service method. |
| BR-02 | Campaign status can only advance forward. Draft → Active → Pending Close → Closed. No reverse transitions. |
| BR-03 | Campaign cannot close without completed OutcomeReview for every `creator_confirmed` decision. |
| BR-04 | `internal_rejected` decisions always have confidence = `explicit`. No exceptions. |
| BR-05 | `client_rejected` decisions require user to explicitly select confidence (no default). |
| BR-06 | `creator_confirmed` decisions require a non-null `confirmed_rate`. |
| BR-07 | A creator can appear only once in the active creator list per campaign. The same creator can be proposed again after being rejected if the Campaign Manager adds them back. |
| BR-08 | CreatorReputation and BrandMemory are computed from source records. They are never stored independently. |
| BR-09 | A superseded decision does not affect computed reputation or brand memory. Only non-superseded decisions count. |
| BR-10 | Brief is locked (read-only) once campaign status = `active`. |

---

## Acceptance Criteria

### AC-01 — Creator Search Returns Contextual Results

**Given** a KOL Specialist is adding creators to a campaign for Brand Wardah
**When** they open the Creator Workspace
**Then** every creator who has history with Wardah shows a colored indicator (green / red / yellow) automatically, without any additional action from the user

---

### AC-02 — Internal Rejection Is Blocked Without Reason

**Given** a Campaign Manager is in Internal Review mode
**When** they click "Reject" on a creator
**Then** the system requires a reason category before the decision is saved
**And** the campaign cannot advance to Client Submission until the reason is selected

---

### AC-03 — Campaign Cannot Close Without Outcome Review

**Given** a Campaign Manager initiates Campaign Close
**When** any `creator_confirmed` creator does not have a completed OutcomeReview
**Then** the "Complete Close" button is not visible
**And** the system shows which creators still require a review

---

### AC-04 — Creator History Is Accurate and Trustworthy

**Given** Creator X was rejected by Brand Y's client in Campaign A (confidence: Explicit)
**When** Creator X is proposed in a new campaign for Brand Y
**Then** the Creator Workspace shows "Previously rejected for Brand Y — [reason category]" on Creator X's card
**And** the history note indicates confidence: Explicit

---

### AC-05 — Superseded Decision Does Not Affect Reputation

**Given** Campaign Manager recorded an incorrect `creator_confirmed` decision and created a superseding correction
**When** the Creator Workspace shows this creator's reputation
**Then** the superseded decision is excluded from all computed averages and counts
**And** only the superseding (correct) decision is counted

---

### AC-06 — Rate History Updates After Confirmation

**Given** Creator X was confirmed at IDR 1.8M in Campaign A and IDR 2.1M in Campaign B
**When** a KOL Specialist views Creator X's profile
**Then** the "Typical rate range" shows IDR 1.8M – 2.1M
**And** the rate history section lists both confirmation events with campaign names and dates

---

## Edge Cases

| Case | Expected Behavior |
|---|---|
| Campaign has 0 confirmed creators at close | Campaign Close shows "No creators to review. All proposed creators were rejected or unavailable." Campaign can close immediately. |
| Creator is proposed, then removed, then proposed again | Each proposal creates a new `creator_proposed` decision. History shows both, with timestamps. |
| Client feedback logged before all creators have internal approval | System accepts partial client feedback. Blocks Client Submission until all creators have an internal decision. |
| Same creator confirmed in two different campaigns for the same brand simultaneously | This is valid. Both confirmation records exist. Brand Memory shows both. |
| Campaign Manager records wrong confidence for client rejection | Creates a superseding decision. Original marked as superseded. New confidence is used for all future queries. |
| Creator is inactive (`is_active = false`) but appears in search results | Inactive creators appear in search with a clear "Inactive" label. They can still be added to campaigns if the user intentionally selects them. |
| Campaign Brief is missing optional field `special_requirements` | Campaign is created normally. Optional fields are nullable. |
| Two Campaign Managers submit OutcomeReview for the same creator in the same campaign | `UNIQUE (campaign_id, creator_id)` constraint on `outcome_review` prevents this. Second submission returns an error. |

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Creator Workspace search response | < 2 seconds for list of 300 creators with filters applied |
| Decision recording (submit to confirmation) | < 500ms |
| Campaign Detail page load | < 2 seconds |
| Brand context indicator computation | < 1 second (runs with Creator Workspace search query) |
| Concurrent users | Support 5–10 concurrent internal users without degradation |
| Mobile responsiveness | Campaign Detail and Creator Workspace must be usable on mobile browser |
| Data integrity | No decision record loss. No incomplete decision records written to DB. |
| Authentication | Session-based. Role separation: Campaign Manager, KOL Specialist, Admin. |
| Availability | Best-effort for internal MVP. No SLA required. |
| Browser support | Chrome, Safari, Firefox — latest 2 versions |

---

## Success Metrics

### Usage Metrics (measured at 30 and 90 days post-launch)

| Metric | Target |
|---|---|
| Campaigns run end-to-end in CariKOL | ≥ 3 within first 30 days |
| Outcome Review completion rate | ≥ 90% of closed campaigns |
| Creator list built without opening a spreadsheet | ≥ 80% of campaigns after Day 30 |
| Internal rejection reason fill rate | 100% (enforced by system gate) |
| Client rejection confidence fill rate | 100% (enforced by system gate) |

### Qualitative Metrics (measured via team interview at Day 30)

| Question | Target |
|---|---|
| "How long does it take to answer 'which creators worked with Brand X'?" | Under 1 minute (vs current 30–60 min) |
| "Did you use WhatsApp/Sheets as primary tracking this week?" | No |
| "Is CariKOL faster than your previous workflow for creator listing?" | Yes |
| "Do you trust the data in CariKOL?" | Yes |

### The Failure Signal

If any team member is still maintaining a parallel spreadsheet for a campaign being run inside CariKOL at Day 30 — the MVP has failed, regardless of feature completeness.
