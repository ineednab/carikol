# Database Schema — Bounded Contexts
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

---

## Architecture Approach

CariKOL's database is organized around **bounded contexts** — not tables.

Each bounded context owns its domain, its data, its business logic, and its computed views. No module reaches into another module's data directly. If Module A needs data from Module B, it goes through Module B's service layer.

This maps directly to the folder structure:

```
modules/
  campaign/
  creator/
  brand/
  auth/
```

Not:
```
tables/
  decision.ts
  campaign.ts
  creator.ts
```

---

## Bounded Context 1 — Campaign

**Owns:** Campaign lifecycle, Brief, Decision events, and Outcome Reviews.

**Responsibility:** Everything that happens inside a campaign from creation to close.

```
campaign
  id              UUID        PK
  name            VARCHAR
  brand_id        UUID        FK → brand.id
  status          ENUM        draft | active | pending_close | closed
  created_by      UUID        FK → user.id
  created_at      TIMESTAMP
  closed_at       TIMESTAMP   nullable

brief
  id              UUID        PK
  campaign_id     UUID        FK → campaign.id  UNIQUE
  platform        ENUM        tiktok | instagram | youtube | other
  objective       TEXT
  creator_criteria TEXT
  budget_min      INTEGER     IDR
  budget_max      INTEGER     IDR
  deliverables    TEXT
  start_date      DATE
  content_deadline DATE
  posting_date    DATE
  special_requirements TEXT   nullable
  created_at      TIMESTAMP

decision                                        -- append-only, never UPDATE
  id              UUID        PK
  campaign_id     UUID        FK → campaign.id
  creator_id      UUID        FK → creator.id
  type            ENUM        creator_proposed
                              internal_approved
                              internal_rejected
                              client_approved
                              client_rejected
                              creator_confirmed
                              creator_declined
                              creator_no_response
                              creator_budget_rejected
                              creator_unavailable
  owner           ENUM        campaign_manager | client | creator | system
  confidence      ENUM        explicit | inferred
  confirmed_rate  INTEGER     nullable — IDR, filled only when type = creator_confirmed
  notes           TEXT        nullable
  recorded_by     UUID        FK → user.id
  decided_at      TIMESTAMP   when the decision was actually made
  created_at      TIMESTAMP   when it was logged in the system
  supersedes_id   UUID        nullable FK → decision.id

decision_reason
  id              UUID        PK
  decision_id     UUID        FK → decision.id  UNIQUE
  category        VARCHAR     -- taxonomy defined during UX design with team input
  free_text       TEXT        nullable

outcome_review
  id              UUID        PK
  campaign_id     UUID        FK → campaign.id
  creator_id      UUID        FK → creator.id
  content_quality SMALLINT    1–5
  communication   SMALLINT    1–5
  professionalism SMALLINT    1–5
  would_work_again ENUM       yes | no | conditional
  notes           TEXT        nullable
  completed_by    UUID        FK → user.id
  completed_at    TIMESTAMP
  UNIQUE (campaign_id, creator_id)
```

**Campaign business rules enforced at service layer:**
- `decision` rows are insert-only. No UPDATE is permitted via the service.
- Campaign status transitions are validated before persisting: `draft → active → pending_close → closed`.
- Transition to `closed` is blocked if any `creator_confirmed` decision on this campaign lacks a matching `outcome_review`.
- `brief.campaign_id` is unique — one brief per campaign.

**Indexes:**
```
decision: (campaign_id, creator_id)       -- all decisions for a creator in a campaign
decision: (creator_id, type)              -- behavioral queries across campaigns
decision: (campaign_id, type)             -- campaign status queries
outcome_review: (creator_id)             -- reputation computation
```

---

## Bounded Context 2 — Creator

**Owns:** Creator profile data. Does NOT own Decision records — those belong to Campaign.

**Responsibility:** Creator identity, static attributes, and access to its own computed reputation.

```
creator
  id              UUID        PK
  name            VARCHAR
  username        VARCHAR
  platform        ENUM        tiktok | instagram | youtube
  niche           VARCHAR
  tier            ENUM        nano | micro | macro | mega
  follower_count  INTEGER     updated periodically
  engagement_rate DECIMAL(5,2)
  typical_rate_min INTEGER    IDR — updated from confirmed decision history
  typical_rate_max INTEGER    IDR
  contact         VARCHAR     WhatsApp or other
  is_active       BOOLEAN     DEFAULT true
  notes           TEXT        nullable
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

**Computed: CreatorReputation (not a table — view or query)**

Computed on demand from `decision` and `outcome_review` in the Campaign context.

```sql
-- Example: reputation query for creator_id = X
SELECT
  AVG(content_quality)        AS avg_content_quality,
  AVG(communication)          AS avg_communication,
  AVG(professionalism)        AS avg_professionalism,
  COUNT(*)                    AS total_outcome_reviews,
  SUM(CASE WHEN would_work_again = 'yes' THEN 1 ELSE 0 END)::FLOAT
    / COUNT(*)                AS would_work_again_rate
FROM outcome_review
WHERE creator_id = X;
```

```sql
-- Decision behavioral pattern for creator_id = X
SELECT type, COUNT(*) as count
FROM decision
WHERE creator_id = X
GROUP BY type;
```

**Computed: CreatorCampaignHistory for Brand Y (context surfacing)**

When building a creator list for a campaign with Brand Y, the Creator Workspace queries:

```sql
SELECT d.type, d.decided_at, dr.category, d.confidence, c.name as campaign_name
FROM decision d
JOIN campaign c ON d.campaign_id = c.id
LEFT JOIN decision_reason dr ON dr.decision_id = d.id
WHERE d.creator_id = X
  AND c.brand_id = Y
ORDER BY d.decided_at DESC;
```

This is what produces the green / red / yellow indicators in the Creator Workspace. No AI. No separate table. One query.

**Indexes:**
```
creator: (platform, niche, tier)          -- workspace filter queries
creator: (is_active)                      -- active creator filter
```

---

## Bounded Context 3 — Brand

**Owns:** Brand identity and access to its computed Brand Memory.

**Responsibility:** Client records and summary of historical campaign behavior.

```
brand
  id              UUID        PK
  name            VARCHAR
  industry        VARCHAR
  account_manager_id UUID     FK → user.id
  notes           TEXT        nullable
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

**Computed: BrandMemory (not a table — query)**

```sql
-- Creators confirmed for brand Y
SELECT DISTINCT d.creator_id, c.name as creator_name,
  COUNT(*) as confirmed_count,
  AVG(or.content_quality) as avg_rating
FROM decision d
JOIN creator c ON d.creator_id = c.id
JOIN campaign camp ON d.campaign_id = camp.id
LEFT JOIN outcome_review or ON or.creator_id = d.creator_id 
  AND or.campaign_id = d.campaign_id
WHERE camp.brand_id = Y
  AND d.type = 'creator_confirmed'
GROUP BY d.creator_id, c.name;

-- Client rejection patterns for brand Y
SELECT dr.category, COUNT(*) as count
FROM decision d
JOIN campaign camp ON d.campaign_id = camp.id
JOIN decision_reason dr ON dr.decision_id = d.id
WHERE camp.brand_id = Y
  AND d.type = 'client_rejected'
GROUP BY dr.category
ORDER BY count DESC;
```

**No table for BrandMemory.** It is a set of queries run against Campaign and Decision data. The Brand module exposes a `getBrandMemory(brandId)` service method that runs these queries and returns the computed result.

---

## Bounded Context 4 — Auth

**Owns:** Users and sessions.

**Responsibility:** Identity only. No business logic.

```
user
  id              UUID        PK
  name            VARCHAR
  email           VARCHAR     UNIQUE
  role            ENUM        campaign_manager | kol_specialist | admin
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

Auth implementation (session tokens, password hashing, etc.) handled at application level.

---

## Cross-Module Rules

**Module A never queries Module B's tables directly.**

| If you need... | Go through... |
|---|---|
| Creator reputation inside a campaign screen | `creator.service.getReputation(creatorId)` |
| Brand memory inside a creator workspace | `brand.service.getBrandMemory(brandId)` |
| Creator history for a brand | `campaign.service.getCreatorHistoryForBrand(creatorId, brandId)` |
| Campaign count for a creator profile | `campaign.service.getCreatorCampaignSummary(creatorId)` |

**Decision records are owned by the Campaign module.** The Creator module and Brand module query decision data through Campaign module service methods, not by joining directly in their own queries.

---

## Folder Structure

```
modules/
├── campaign/
│   ├── campaign.model.ts         -- schema types
│   ├── brief.model.ts
│   ├── decision.model.ts
│   ├── outcome-review.model.ts
│   ├── campaign.service.ts       -- business logic + state transitions
│   ├── decision.service.ts       -- append-only event recording
│   └── campaign.repository.ts    -- DB queries
│
├── creator/
│   ├── creator.model.ts
│   ├── creator.service.ts        -- reputation computation, workspace search
│   └── creator.repository.ts
│
├── brand/
│   ├── brand.model.ts
│   ├── brand.service.ts          -- brand memory computation
│   └── brand.repository.ts
│
└── auth/
    ├── user.model.ts
    └── auth.service.ts
```

---

## What Is Not In This Schema

| Excluded | Reason |
|---|---|
| `knowledge_object` table | Not in MVP. Derived from decisions + outcome_reviews |
| `creator_reputation` table | Computed view — stored separately creates inconsistency |
| `brand_memory` table | Computed view — same reason |
| `notification` table | Phase 2 feature |
| `content_submission` table | Phase 3 — execution tracking |
| `invoice`, `payment` table | Finance module, out of MVP scope |
