# Engineering Principles
CariKOL — Engineering Constraints for Development
Last updated: 2026-07-07

**This document is for engineers and AI assistants generating code.**

These principles are not preferences. They are constraints derived directly from the product philosophy. Violating them does not just create technical debt — it undermines the product's core value proposition.

Read the Founder Thesis (00) before reading this document.

---

## 1. Decisions Are Append-Only Events

**Rule:** No `UPDATE` or `DELETE` on `decision` rows. Ever.

**Why:** Decision records are the source of organizational knowledge. Editing them rewrites history. A knowledge system that can be retroactively changed is not trustworthy.

**How to apply:**
- If a user recorded the wrong reason, create a new decision with `supersedes_id` pointing to the incorrect record
- The old record remains visible in history, marked as superseded
- Enforce this at the service layer — not just the UI
- The database can have a trigger or application-level guard preventing UPDATE on `decision`

**Wrong:**
```ts
// Never do this
await db.decision.update({ where: { id }, data: { reason: newReason } });
```

**Right:**
```ts
// Create a corrective record instead
await decision.service.recordCorrection({ originalDecisionId: id, newReason, recordedBy });
```

---

## 2. No Duplicated Source of Truth

**Rule:** Every piece of data lives in exactly one place. Computed values are derived at query time, not stored in a second table.

**Why:** Two tables representing the same fact will diverge. When `creator_reputation` table disagrees with the `outcome_review` records it was derived from, the system is untrustworthy and users lose confidence in the data.

**How to apply:**
- `CreatorReputation` → computed from `outcome_review` rows
- `BrandMemory` → computed from `decision` rows filtered by `campaign.brand_id`
- `typical_rate_min/max` on `creator` → updated from `creator_confirmed` decision records, not entered manually
- If the same value appears in two places, one of them is wrong

**The test:** If you change a row in table A, should any other table automatically change? If yes, table B should not be a separate table — it should be a query against table A.

---

## 3. Business Logic Lives in Services, Not in Components

**Rule:** React components (or any UI layer) never contain business logic. They render and emit events. Services make decisions.

**Why:** Business logic in components cannot be tested independently, cannot be reused across screens, and leaks into the UI layer where it does not belong. When CariKOL grows, untestable logic becomes expensive to maintain.

**How to apply:**
```
Component              → handles rendering and user interaction
Server Action / API    → validates input, calls service
Service                → applies business rules, calls repository
Repository             → runs database queries
```

**Wrong:**
```tsx
// Business rule in a component
async function handleReject(creatorId: string) {
  if (!reason) throw new Error("Reason required");
  if (campaign.status !== 'active') throw new Error("Wrong status");
  await db.decision.create({ ... });
}
```

**Right:**
```tsx
// Component calls a server action
async function handleReject(creatorId: string) {
  await rejectCreatorAction({ campaignId, creatorId, reason, confidence });
}

// Business rule in the service
async function rejectCreator({ campaignId, creatorId, reason, confidence, recordedBy }) {
  const campaign = await campaignRepository.findById(campaignId);
  if (!campaign) throw new CampaignNotFoundError();
  if (campaign.status !== 'active') throw new InvalidStatusError();
  if (!reason) throw new ReasonRequiredError();
  return decisionRepository.create({ campaignId, creatorId, type: 'internal_rejected', reason, confidence, recordedBy });
}
```

---

## 4. No Feature Without a Workflow Step

**Rule:** Every feature must map to a step in the campaign workflow or a decision in the user journey. Features that exist outside of a workflow do not belong in MVP.

**Why:** CariKOL is a workflow tool. Features that exist independently of the workflow are either navigation aids (acceptable) or scope creep (not acceptable). This principle enforces the product boundary.

**How to apply:** Before building any feature, answer: "Which step in the user journey (05-user-journey.md) does this belong to?" If the answer is "none," the feature is probably out of scope.

---

## 5. Server Actions First

**Rule:** Use Server Actions for all mutations. Avoid client-side API calls for operations that modify data.

**Why:** Server Actions keep mutation logic on the server where it belongs, colocate the action with the component that triggers it, and eliminate the need for a separate API endpoint for every mutation. Secrets stay server-side. Validation happens before any data reaches the client.

**How to apply:**
```ts
// Correct: Server Action
'use server'
export async function recordDecisionAction(input: DecisionInput) {
  // validate, call service, return result
}

// Wrong for mutations: client-side fetch
const res = await fetch('/api/decisions', { method: 'POST', body: JSON.stringify(input) });
```

Use API routes only for: webhooks from external services, endpoints consumed by third parties, or file downloads.

---

## 6. Optimistic UI for Decision Recording

**Rule:** When a user submits a decision (approve, reject, confirm, etc.), the UI updates immediately before the server confirms. Roll back if the server returns an error.

**Why:** Campaign Managers and KOL Specialists move fast. A 300ms spinner on every creator status change feels broken. Optimistic UI respects the user's time.

**How to apply:**
- Use `useOptimistic` (React 19) or a local state pattern to update the UI before the server round-trip completes
- All optimistic updates must have a rollback state
- Server errors should show a toast and revert, not a blank screen

---

## 7. Thin Components

**Rule:** React components should contain only: JSX structure, local UI state (hover, open/closed), and event handlers that call server actions or hooks. Nothing else.

**Why:** Fat components are hard to test, hard to reuse, and hard to read. Thin components make the UI layer predictable.

**Symptoms of a fat component to refactor:**
- Database queries inside a component
- Business validation inside a component
- More than 150 lines of logic (not including JSX)
- More than 3 levels of nested conditionals

---

## 8. Computed Values Are Never Cached Without Invalidation

**Rule:** If a computed value (CreatorReputation, BrandMemory) is cached, it must be invalidated whenever a relevant source row changes.

**Why:** Stale cached reputation data is worse than no cache at all. If a Campaign Manager sees an outdated "5/5" rating for a creator who just received a bad Outcome Review in another campaign, the system becomes untrustworthy.

**How to apply for MVP (simple):**
- Do not cache computed views. Run queries fresh on demand.
- If performance becomes a problem after launch, add a Materialized View with a refresh trigger — not a separate table.
- Never cache reputation data in the component layer without a clear revalidation path.

---

## 9. No Premature Optimization

**Rule:** Do not optimize for scale that does not yet exist. Build for correctness first.

**Why:** CariKOL MVP will have ~300 creators and ~50 campaigns. Queries that would take milliseconds at this scale do not need indexes beyond the minimum, connection pools, or caching layers. Premature optimization adds complexity without adding value — and makes the code harder to change when product requirements shift.

**Permitted in MVP:**
- Essential indexes (listed in 09-database-schema.md)
- Server-side pagination on lists longer than 50 items
- Image optimization for creator profile photos

**Not permitted in MVP:**
- Redis or any caching layer
- Background job queues
- Database read replicas
- Full-text search engines (Elasticsearch, Algolia)
- CDN for dynamic content

---

## 10. No Feature Flag, No Backwards Compatibility Shim

**Rule:** When a requirement changes, change the code. Do not add a flag to keep both behaviors alive.

**Why:** CariKOL is internal-only during MVP. There is no external API consumer to break. Feature flags for internal tools create permanent code debt and make the codebase harder to read. When something needs to change, change it completely.

**Exception:** If a migration touches live data with real campaign records (post-launch), a controlled migration with a rollback plan is required. That is data safety, not a feature flag.

---

## 11. Knowledge Capture Is Enforced at Service Layer, Not Just UI

**Rule:** Required fields for decision records (reason, confidence) are validated in the service layer before any database write. The UI reinforces this, but the service is the enforcement point.

**Why:** If the UI is the only gate, a future API call or a future developer bypassing the UI can create incomplete decision records. Incomplete records corrupt the knowledge base. Enforcement must happen where data is written, not where data is displayed.

**How to apply:**
```ts
// Service validates — not just UI form validation
async function recordInternalRejection({ campaignId, creatorId, reason, confidence, recordedBy }) {
  if (!reason?.category) throw new ReasonRequiredError('Internal rejections require a reason category');
  if (!confidence) throw new ConfidenceRequiredError('Confidence level is required');
  // ...proceed to write
}
```

---

## 12. The Guardrail Test

Before writing any code, run this test:

> "Is this in the WE ARE BUILDING list in 11-mvp-scope.md?"

If no → do not build it.

> "Does this add a table to the schema that is not in 09-database-schema.md?"

If yes → justify it or remove it.

> "Does this add a UI screen not in 07-information-architecture.md?"

If yes → justify it or remove it.

The documents exist to make these decisions in advance so they do not have to be re-made under time pressure during development.
