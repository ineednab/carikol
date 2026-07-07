# Information Architecture
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

---

## UX Principles

These principles govern every screen, every interaction, and every UI decision in CariKOL. They exist before wireframes. If a screen violates these principles, the screen should be redesigned.

### 1. One Screen, One Decision
Every screen or modal exists to complete one decision. Not to display information. Not to navigate. Not to review history. To make or record a decision. If a screen requires the user to make two decisions, it should be two screens.

### 2. Knowledge Surfaces, Not Alerts
Historical context appears automatically at the moment it is relevant. It does not live on a separate page. It does not require navigation. When a KOL Specialist is adding Creator X to a campaign for Brand Y, the relevant history appears on that same screen — without being asked for.

### 3. Never Ask Twice
If the system already knows something, it does not ask. If the creator's platform is already recorded, it is not re-entered. If the Campaign Manager just logged a rejection, the system does not ask them to also write a report. Information flows forward through the workflow — it is never re-collected.

### 4. Every Action Ends With a Structured Output
No action in the workflow is free-form. Approving a creator, rejecting a creator, logging client feedback, confirming a negotiation — every action produces a Decision record with a type, a reason, and a confidence level. The UI makes this feel like completing a step, not filing a report.

### 5. Fast or Invisible
If an action takes more than 3 clicks, redesign it. If a field does not serve a decision, remove it. Busy campaign managers will not tolerate complexity. Speed is a feature.

### 6. History Is Always One Click Away
From any screen involving a creator or brand, the full decision history is accessible in one click. Not navigated to — surfaced. The creator's past with this brand, their ratings, their negotiation behavior — available without leaving the current task.

---

## Screen Hierarchy

```
App
├── Dashboard
├── Campaigns
│   ├── Campaign List
│   ├── New Campaign
│   └── Campaign Detail
│       ├── Brief
│       ├── Creator List
│       │   ├── Internal Review Mode
│       │   ├── Client Feedback Mode
│       │   └── Negotiation Mode
│       └── Campaign Close (Outcome Review)
├── Creator Workspace
│   ├── Creator Search + Filter
│   └── Creator Detail
├── Brands
│   ├── Brand List
│   └── Brand Detail
└── Settings
```

---

## Routes

| Route | Screen | Primary User |
|---|---|---|
| `/` | Dashboard | Campaign Manager |
| `/campaigns` | Campaign List | Campaign Manager |
| `/campaigns/new` | New Campaign (Brief) | Campaign Manager |
| `/campaigns/:id` | Campaign Detail | Campaign Manager |
| `/campaigns/:id/review` | Internal Review Mode | Campaign Manager |
| `/campaigns/:id/client-feedback` | Client Feedback Mode | Campaign Manager |
| `/campaigns/:id/negotiation` | Negotiation Mode | KOL Specialist |
| `/campaigns/:id/close` | Campaign Close (Outcome Review) | Campaign Manager |
| `/creators` | Creator Workspace | KOL Specialist |
| `/creators/:id` | Creator Detail | KOL Specialist / Campaign Manager |
| `/brands` | Brand List | Campaign Manager |
| `/brands/:id` | Brand Detail | Campaign Manager |
| `/settings` | Settings | Admin |

---

## Screen Definitions

### Dashboard
**Primary user:** Campaign Manager
**Purpose:** Single-glance overview of everything requiring attention today.

**Content:**
- Active campaigns with current stage and next required action
- Campaigns pending Outcome Review (awaiting close)
- Campaigns with pending client feedback to log
- Quick count: campaigns this week, creators confirmed this week

**Principles applied:** Not a metrics dashboard. Not analytics. A "what needs my attention right now" screen.

**What it is NOT:**
- No charts
- No trend lines
- No creator statistics
- No revenue data

---

### Campaign List
**Primary user:** Campaign Manager
**Purpose:** Navigate to any campaign.

**Content:**
- Campaign name
- Brand
- Status (Draft / Active / Pending Close / Closed)
- Campaign Manager assigned
- Created date
- Next action required

**Filters:** Status, Brand, Date range
**Sort:** Created date (default), Status, Brand

---

### New Campaign (Brief)
**Primary user:** Campaign Manager
**Purpose:** Create a campaign by completing a structured brief.

**One decision:** Define what this campaign is trying to accomplish.

**Fields:**
- Campaign name
- Brand (select from existing, or create new)
- Platform
- Campaign objective
- Creator criteria
- Budget range (IDR)
- Deliverables
- Timeline (start / content deadline / posting date)
- Special requirements (optional)

**Behavior:**
- Campaign is created in `draft` status
- Transitions to `active` after KOL Specialist confirms the list is ready for review
- Brief is locked (read-only) once campaign moves to `active`

---

### Campaign Detail
**Primary user:** Campaign Manager
**Purpose:** The central workspace for one campaign.

**Sections:**

**Brief tab** — read-only summary of the campaign brief. Link to edit if status is still `draft`.

**Creator List tab** — the main working area. Displays all creators on this campaign with their current status in the workflow:

```
Creator Name | Platform | Niche | Rate | Status          | Last Action
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aurel S.     | TikTok   | Beauty| 1.5M | Proposed        | Added by Dina, 2h ago
Reni A.      | IG       | Lifes | 800K | Internal Review | Pending CM decision
Tika W.      | TikTok   | Food  | 2M   | Client Approved | Client confirmed, 1d ago
Bowo K.      | YouTube  | Tech  | 500K | Rejected        | Budget too high, 3d ago
```

Each row shows the current stage and is clickable to see the full decision history for that creator on this campaign.

**Stage-specific action buttons** appear contextually based on campaign status:
- In Draft: "Ready for Internal Review" button
- In Internal Review: Review mode activates
- Awaiting Client Feedback: Client Feedback mode activates
- In Negotiation: Negotiation mode activates
- Active: "Close Campaign" button

---

### Internal Review Mode
**Primary user:** Campaign Manager
**Purpose:** Review proposed creator list and approve or reject each creator before sending to client.

**One decision per creator:** Approve or Reject.

**For each Rejected creator, required before proceeding:**
- Reason: structured category (required)
- Confidence: Explicit (always explicit at internal review)
- Notes: optional

**Behavior:**
- System prevents moving to Client Submission until every creator has a decision
- Approved creators move to "Pending Client Approval" status
- Rejected creators are moved out of the active list but remain in the campaign history

**Knowledge surfaced automatically per creator:**
- "Previously rejected for this brand" — shows past rejection reason
- "Previously worked with this brand" — shows outcome rating
- "Has not responded in past campaigns" — shows no-response count

---

### Client Feedback Mode
**Primary user:** Campaign Manager
**Purpose:** Log the client's response to the proposed creator list.

**One decision per creator:** Client Approved, Client Rejected, or Pending.

**For Client Rejected:**
- Reason: structured category or free text
- Confidence: Explicit / Inferred (required — system never assumes)
- Notes: optional

**For revision requests (add options, replace creators):**
- Campaign returns to Creator Listing stage
- Revision context is visible to KOL Specialist: "Client requested replacement — previous note: [reason]"

---

### Negotiation Mode
**Primary user:** KOL Specialist
**Purpose:** Log outcome of creator outreach for each client-approved creator.

**One decision per creator:**
- Creator Confirmed → required: confirmed rate (IDR)
- Creator Declined
- Creator No Response
- Creator Budget Rejected
- Creator Unavailable

**Behavior:**
- If a confirmed creator later drops out, a new decision is recorded
- Replacement sourcing restarts at Creator Workspace with context visible

---

### Campaign Close (Outcome Review)
**Primary user:** Campaign Manager
**Purpose:** Complete the mandatory Outcome Review for every confirmed creator. This IS the campaign close event.

**One form per confirmed creator:**
- Content Quality: 1–5
- Communication: 1–5
- Professionalism / Reliability: 1–5
- Would work again: Yes / No / Conditional
- Notes: optional

**Behavior:**
- All creators must be reviewed before the "Complete Close" button appears
- On submit: system updates computed CreatorReputation and BrandMemory views
- Campaign moves to `closed`
- Campaign record becomes permanently read-only

---

### Creator Workspace
**Primary user:** KOL Specialist
**Purpose:** Find and evaluate creators for a campaign.

**Two modes:**
1. **Standalone search** — browse creators outside of a campaign context
2. **Campaign context** — accessed from a campaign's Creator List; shows contextual history for the current brand

**Filters:**
- Platform
- Niche
- Tier (Nano / Micro / Macro / Mega)
- Follower range
- Typical rate range (IDR)
- "Has worked with [brand]" — yes / no / either
- "Would work again" — yes only / include conditional / all
- Last campaign: within 3 months / 6 months / 1 year / any

**Creator card (in list view) shows:**
- Name, platform, niche, tier
- Follower count, engagement rate, typical rate
- Avg rating (content + communication + professionalism)
- Last campaign date
- "Would work again" badge

**Knowledge surfaced in Campaign Context mode:**
- Red indicator: "Previously rejected for [Brand X] — [reason]"
- Green indicator: "Previously confirmed for [Brand X] — rated [X/5]"
- Yellow indicator: "No history with [Brand X]"

---

### Creator Detail
**Primary user:** KOL Specialist / Campaign Manager
**Purpose:** Full profile and complete decision history for one creator.

**Sections:**

**Profile** — static attributes (platform, niche, followers, contact, notes)

**Computed Reputation** — derived from all OutcomeReviews:
- Avg content quality / communication / professionalism
- Would work again rate
- Total campaigns completed

**Decision History** — all Decision records for this creator, sorted newest first:
- Campaign name, brand, decision type, reason, confidence, date
- Filterable by brand, decision type, date range

**Rate History** — all `creator_confirmed` decisions showing negotiated rate by campaign and date

---

### Brand Detail
**Primary user:** Campaign Manager
**Purpose:** Full history and computed Brand Memory for one client.

**Sections:**

**Profile** — brand name, industry, account manager, notes

**Campaign History** — all campaigns for this brand, sorted newest first

**Computed Brand Memory** — derived from all Decisions for this brand:
- Creators previously confirmed (with outcome ratings)
- Creators previously rejected (with reasons)
- Most common client rejection reasons
- Average revision rounds

---

## Navigation Structure

```
Primary nav (always visible):
[ Dashboard ]  [ Campaigns ]  [ Creator Workspace ]  [ Brands ]

Secondary nav (within Campaign Detail):
[ Brief ]  [ Creator List ]  [ History ]
```

---

## Empty States

Each section must have a useful empty state that guides the user to the first action:

| Screen | Empty State Message |
|---|---|
| Campaign List | "No campaigns yet. Create your first campaign." |
| Creator Workspace | "No creators match your filters. Try widening the search." |
| Creator History | "No campaign history yet for this creator." |
| Brand Memory | "No decision history yet for this brand. Run a campaign to start building Brand Memory." |
| Dashboard | "No active campaigns. Create a campaign to get started." |

Empty states are not error states. They are onboarding moments.
