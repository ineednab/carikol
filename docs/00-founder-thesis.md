# Founder Thesis
CariKOL — The Language of the Product
Last updated: 2026-07-07

This document exists before the PRD, before the database, and before the UI.

Its purpose is to define the vocabulary, mental models, and foundational beliefs that will govern every product decision CariKOL makes — now and in the future. When engineers, designers, investors, or new team members join, this is the document they read first.

If the language is consistent from the beginning, the product will be consistent as it grows.

---

## The Core Insight

Buzzeryok has operated for four years. In that time, the company has run hundreds of campaigns, worked with 1,000+ creators, and served 100+ brands.

The knowledge generated from that experience — which creators perform well, which brands have strong preferences, which strategies work — is genuinely valuable. It took years to accumulate.

None of it is accessible.

It lives in WhatsApp, in spreadsheets, and in the memory of individual employees. It cannot be searched. It cannot be transferred. When an employee leaves, it disappears.

Every new campaign begins by reconstructing information that already exists.

That reconstruction is the largest operational cost in the business.

**CariKOL exists to stop that from happening.**

---

## The Mental Model

```
Campaign opens
    ↓
Decisions are made
    ↓
Decisions are captured (automatically, as a byproduct of completing workflow steps)
    ↓
Decisions become knowledge
    ↓
Knowledge is surfaced at the moment the next decision is being made
    ↓
Better decisions are made
    ↓
Knowledge compounds
```

This loop is the product. Everything else is infrastructure that supports it.

---

## The Layered Product Model

CariKOL has four layers. Only the first layer is visible to users. The others operate silently.

```
Layer 1 — Campaign Workspace        (what users see)
          The place where campaigns are run.
          Familiar, operational, fast.

Layer 2 — Decision Capture          (what happens behind each action)
          Every workflow step produces a structured decision record.
          Users experience this as completing a normal step.
          They do not experience it as documentation.

Layer 3 — Knowledge Graph           (the organizational moat)
          Every decision accumulates into a searchable, contextual memory.
          Brand preferences. Creator behavior. Historical rates. Rejection patterns.
          This is what competitors cannot replicate.

Layer 4 — AI Intelligence           (the future consequence)
          AI emerges naturally from the knowledge base.
          Recommendations, predictions, and automation become possible
          only after the knowledge exists.
          AI is not a feature. It is the eventual outcome of disciplined operation.
```

**The product identity is Layer 1.** Users are running campaigns. Layers 2, 3, and 4 are what make it different from every other campaign tool.

---

## The Product Vocabulary

These terms have precise meanings inside CariKOL. They should be used consistently across all documents, UI copy, database schemas, and engineering discussions.

### Campaign
A structured work unit with a defined brief, a set of contributors, a timeline, and a required outcome. In MVP: KOL campaigns only.

### Brief
The standardized structured document that defines what a campaign is trying to accomplish. A campaign without a brief does not exist in CariKOL.

### Creator
A contributor who produces content for a campaign. In MVP, creators are influencers on TikTok, Instagram, or YouTube. In future phases, contributors may include reviewers, affiliates, community members, or other participant types.

### Creator Workspace
The searchable interface where creators are discovered, filtered, and listed for a campaign. The Workspace surfaces historical knowledge about each creator at the moment they are being considered — not after.

### Decision
A discrete action taken during a campaign that changes the status of a creator, campaign, or relationship. Every decision generates knowledge. Decisions are the atomic unit of the CariKOL data model.

*Operational framing: "Every campaign is a sequence of decisions."*

**Decision types:**
- Internal Approval
- Internal Rejection
- Client Approval
- Client Rejection
- Creator Confirmed
- Creator Declined
- Creator No Response
- Creator Budget Rejected
- Creator Unavailable
- Outcome Rating (at campaign close)

### Decision Owner
The actor who made the decision. In MVP: Campaign Manager, Client, Creator, or System (future).

### Reason
The structured explanation for a decision. In MVP: structured category (required) + optional free-text note. Taxonomy to be defined during database design.

### Confidence
The certainty level of the recorded reason.
- **Explicit** — the decision owner stated this directly
- **Inferred** — the recording team member believes this based on context

The system never stores assumptions as facts. A decision with Unknown confidence is more trustworthy than a decision with fabricated certainty.

### Knowledge
A persistent, searchable record generated from one or more decisions. Knowledge always carries provenance: what was observed, how certain we are, which campaign it came from, who recorded it, and when.

**Knowledge types:**
- Creator Reputation (behavioral patterns across campaigns)
- Brand Memory (client preferences and patterns)
- Campaign Pattern (what worked, what failed, in which context)
- Rate History (negotiated pricing over time)

### Knowledge Object
The data structure that represents a single piece of knowledge. Every Knowledge Object contains:
- **Type** — what kind of knowledge this is
- **Subject** — creator, brand, or campaign pattern
- **Assertion** — what the knowledge claims
- **Evidence** — the decision(s) that generated it
- **Confidence** — Explicit or Inferred
- **Source** — campaign ID + date
- **Owner** — who recorded it

This provenance structure is what will eventually make AI-powered recommendations trustworthy.

### Brand Memory
The accumulated knowledge about a client's preferences, patterns, and history across all campaigns. Includes: creator preferences, rejection patterns, approval speed, revision behavior, and successful strategies.

### Creator Reputation
The accumulated knowledge about a creator's behavior and performance across all campaigns. Includes: content quality, communication reliability, negotiation patterns, deadline adherence, and outcome ratings.

### Outcome Review
A mandatory structured evaluation completed by the Campaign Manager when a campaign closes. Covers each participating creator. Produces Creator Reputation knowledge. A campaign is not Closed until the Outcome Review is complete.

### Campaign Status
The lifecycle states a campaign moves through in CariKOL:
- Draft → Active → Pending Outcome Review → Closed

A campaign in "Closed" status has a complete record: brief, all decisions, and a completed Outcome Review.

---

## The Knowledge Maturity Model

CariKOL is not built in feature phases. It is built in knowledge maturity phases.

```
Level 1 — Data
          Creators, campaigns, and brands exist as records.
          No history yet. No patterns. Just structure.

Level 2 — Workflow
          Campaigns move through a structured lifecycle.
          Approvals, rejections, and negotiations are tracked.
          The workflow produces data consistently.

Level 3 — Decision
          Every workflow action captures a decision with reason and confidence.
          The system knows not just what happened, but why.

Level 4 — Knowledge
          Decisions accumulate into Brand Memory, Creator Reputation,
          and Campaign Patterns. The system can answer questions
          that previously required hour-long searches.

Level 5 — Intelligence
          The knowledge base is rich enough to surface recommendations,
          detect patterns, and eventually automate decisions.
          AI is not added. It emerges.
```

**MVP delivers Levels 1, 2, and 3.**
Level 4 emerges after consistent use.
Level 5 is designed for, not yet built.

---

## The One Sentence

> Every campaign should leave the organization smarter than before it started.

This is what CariKOL is for. Every product decision should be evaluated against it.

---

## What This Product Is Not

CariKOL is not an influencer marketplace.
CariKOL is not a creator discovery platform.
CariKOL is not a CRM.
CariKOL is not a social media scheduler.
CariKOL is not an analytics dashboard.

Those are existing categories. CariKOL is a campaign workspace where organizational knowledge compounds with every decision made.

---

## Design Constraints

These constraints are non-negotiable for MVP. They exist to keep the scope narrow enough to ship and valuable enough to use.

1. **Internal only.** No client portal. No creator portal.
2. **KOL campaigns only.** Other campaign types are future phases.
3. **Knowledge capture must be invisible.** If it requires extra steps, it will be skipped.
4. **Every campaign must close with a complete Outcome Review.** No exceptions.
5. **Confidence must be recorded for every decision with an uncertain reason.** The system must never store assumptions as facts.
6. **The creator workspace must be useful on Day 1.** At least 300 quality creator records must be migrated before launch.
