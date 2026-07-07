# User Journey
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

Scope: KOL Campaign Pre-Execution + Outcome Review (MVP)

---

## Overview

The MVP user journey covers the full pre-execution lifecycle of a KOL campaign — from brief creation to creator approval and negotiation — plus the mandatory Outcome Review when the campaign closes.

Every step in the journey is either a decision point or a knowledge capture moment. The journey is designed so knowledge is captured as a byproduct of completing required steps, not as a separate documentation task.

---

## Journey Map

### Phase 1 — Campaign Creation

**Actor:** Campaign Manager

**Trigger:** Client confirms campaign intent (via WhatsApp or email, outside CariKOL)

**Action:**
Campaign Manager creates a new campaign inside CariKOL using a standardized brief template.

**Captures:**
- Campaign name
- Client / Brand
- Platform (TikTok, Instagram, YouTube, etc.)
- Campaign objective
- Creator criteria (niche, tier, platform, audience type)
- Budget range
- Timeline (start date, content deadline, posting date)
- Deliverables (number of posts, content type)
- Special requirements

**Knowledge generated:**
- Structured, searchable campaign record linked to a brand
- Brief exists in one place, not scattered across WhatsApp and Google Docs

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| WhatsApp discussion + Google Doc brief (inconsistent) | Standardized brief template, same structure every campaign |

---

### Phase 2 — Creator Listing

**Actor:** KOL Specialist

**Trigger:** Campaign Manager assigns campaign to KOL Specialist

**Action:**
KOL Specialist opens the Creator Workspace and builds a creator list for this campaign. Searches using filters. Sees historical context per creator — past campaigns, past brands worked with, past rejection reasons, outcome ratings.

**Captures:**
- Creators added to the campaign list
- Proposed rate per creator (at time of listing)
- Notes per creator (optional at this stage)

**Knowledge surfaced (from past decisions):**
- Has this creator worked with this brand before?
- Was this creator previously rejected for this brand?
- What was their outcome rating from past campaigns?
- What is their typical negotiated rate?
- Have they been unresponsive in past outreach?

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| Open old spreadsheets, search WhatsApp, ask colleagues — 30 min to 1 hour | Creator workspace with searchable history — seconds |

---

### Phase 3 — Internal Review

**Actor:** Campaign Manager

**Trigger:** KOL Specialist marks creator list as ready for review

**Action:**
Campaign Manager reviews the proposed list. For each creator, they make a decision.

**Decision types at this stage:**
- Approved for client submission
- Rejected internally

**For every rejection, required fields before proceeding:**
- Decision owner: Campaign Manager (default at this stage)
- Reason: structured category (required)
- Confidence: Explicit (Campaign Manager knows the reason)
- Optional note: free text

**Knowledge generated:**
- Every rejection is a permanent, searchable record
- Rejection reason is linked to campaign, brand, creator, and date
- Future listing of the same creator for the same brand surfaces this history

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| WhatsApp discussion, reasoning disappears | Structured rejection record, reason preserved permanently |

---

### Phase 4 — Client Submission & Approval

**Actor:** Campaign Manager

**Trigger:** Internal review complete, approved list is ready

**Action:**
Campaign Manager exports the approved creator list (PDF or spreadsheet) and sends it to the client via WhatsApp — same as today. Client responds via WhatsApp.

Campaign Manager then logs the client's feedback inside CariKOL.

**For each creator the client rejects, required fields:**
- Decision owner: Client
- Reason: structured category or free text
- Confidence: Explicit / Inferred / Unknown (mandatory selection)

**For revision requests (add more options, replace creators):**
- Campaign returns to listing phase with revision context visible

**Knowledge generated:**
- Client rejection history linked to brand
- Client preference patterns accumulate over time
- Confidence field prevents client assumptions from being stored as facts

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| Client feedback via WhatsApp, revision history disappears | Client decisions logged with confidence level, brand preference patterns build over time |

---

### Phase 5 — Negotiation

**Actor:** KOL Specialist

**Trigger:** Creator list approved by client

**Action:**
KOL Specialist contacts approved creators via WhatsApp (same as today) to confirm availability, rate, and timeline.

Outcomes are logged inside CariKOL per creator:

**Decision types at this stage:**
- Creator Confirmed — rate agreed, campaign proceeds
- Creator Declined — said no explicitly
- Creator No Response — unreachable after [defined period]
- Creator Budget Rejected — negotiation failed on price
- Creator Unavailable — confirmed booking conflict

**For each outcome, captures:**
- Decision type (required)
- Final confirmed rate (if confirmed)
- Notes (optional)
- Date

**Knowledge generated:**
- Creator availability and negotiation behavioral patterns
- Rate history per creator
- Creator responsiveness record
- Replacement triggers (when confirmed creator drops out, replacement sourcing restarts at Phase 2 with context)

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| WhatsApp negotiation, rate and outcome lost | Rate and response behavior logged per creator, patterns visible across campaigns |

---

### Phase 6 — Campaign Active

**Actor:** Campaign Manager

**Trigger:** All creators confirmed

**Note:** Execution steps (briefing, content review, posting, insights, payment) are OUT OF SCOPE for MVP. Campaign status moves to "Active" and the Campaign Manager continues using WhatsApp and Google Drive for execution as today.

CariKOL holds the record of who was confirmed, at what rate, and the full decision history from pre-execution.

---

### Phase 7 — Campaign Close + Knowledge Update

**Actor:** Campaign Manager

**Trigger:** Campaign execution is complete. Campaign Manager initiates campaign close.

**The philosophical point:** A campaign is not finished when execution ends. A campaign is finished when the knowledge from that campaign has entered the system. Outcome Review is not a gate before closing — it is the closing event itself.

**Sequence:**

```
Campaign Manager initiates Close
          ↓
Outcome Review opens (required, cannot be skipped)
Campaign Manager evaluates each participating creator:
  - Content Quality: ⭐⭐⭐⭐⭐
  - Communication: ⭐⭐⭐⭐⭐
  - Professionalism / Reliability: ⭐⭐⭐⭐⭐
  - Would work again: Yes / No / Conditional
  - Notes: optional free text
          ↓
Outcome Review submitted
          ↓
System updates Creator Reputation for each evaluated creator
          ↓
System updates Brand Memory with campaign outcome context
          ↓
Campaign status changes to Closed
          ↓
Campaign record is complete and permanently searchable
```

**Knowledge generated:**
- Creator Reputation enriched: performance ratings, reliability record, "would work again" flag
- Brand Memory enriched: campaign context, creator performance for this brand
- Future creator workspace surfaces outcome ratings alongside decision history

**Current state vs future state:**
| Now | CariKOL |
|---|---|
| Campaign ends, knowledge disappears into a spreadsheet row | Campaign close IS the knowledge event — no knowledge, no close |

---

## Journey Summary

```
[Client brief received externally]
          ↓
Campaign Manager creates structured campaign brief in CariKOL
          ↓
KOL Specialist builds creator list using searchable creator workspace
(Historical context surfaced automatically per creator)
          ↓
Campaign Manager reviews list — every rejection requires structured reason + confidence
          ↓
Approved list sent to client via WhatsApp
Client feedback logged in CariKOL with confidence level
          ↓
KOL Specialist contacts approved creators via WhatsApp
Negotiation outcomes logged per creator (Confirmed / Declined / No Response / Budget Rejected / Unavailable)
          ↓
Campaign status: Active — execution continues outside CariKOL (MVP)
          ↓
Execution complete — Campaign Manager initiates Close
Outcome Review completed for every participating creator
          ↓
System updates Creator Reputation + Brand Memory
          ↓
Campaign status: Closed — knowledge permanently embedded
```

---

## Knowledge Accumulation Over Time

Each completed campaign adds:
- Rejection records for creators (with reasons and confidence)
- Client preference patterns per brand
- Creator behavioral data (responsiveness, negotiation, reliability)
- Creator performance ratings
- Brand-creator relationship history

After 10 campaigns: creator workspace has meaningful search value.
After 30 campaigns: brand preference patterns are visible.
After 100 campaigns: the system surfaces recommendations without prompting.
