# Product Principles
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

---

These principles govern every product decision. When two features conflict, these principles determine which wins. When a feature cannot be justified against these principles, it should not be built.

---

## Design Principles (UI / UX / Product Behavior)

### 1. Knowledge Capture Must Be Invisible
This is the most important design constraint in CariKOL.

If capturing knowledge requires extra steps beyond completing the work, it will be skipped. People are running campaigns, not filing reports.

Knowledge must be generated as an automatic byproduct of completing required workflow actions. A Campaign Manager who rejects a creator is already making a decision — the product only needs to require a structured output from that decision before allowing them to proceed.

If a user must open a separate form, switch screens, or write a paragraph to capture knowledge, the design has failed.

### 2. Every Campaign Is a Sequence of Decisions
This is how CariKOL understands a campaign.

Not a collection of files. Not a chat thread. Not a spreadsheet row.

A campaign is the sum of every decision made during it: who was approved, who was rejected and why, who was confirmed, who declined, what rate was agreed, how they performed.

Every screen, every action, every form in CariKOL exists to facilitate or capture one of those decisions.

*Internal framing for data architecture: the Decision is the atomic unit of the CariKOL data model.*

### 3. Surface Knowledge at the Moment of Decision
Storing knowledge is not enough. Knowledge must appear at the exact moment it is relevant.

When a KOL Specialist is adding Creator X to a campaign for Brand Y, the system should automatically surface: prior collaborations with Brand Y, past rejection reasons, outcome ratings, rate history, and behavioral patterns — without the user having to search for them.

If knowledge is buried inside past campaign records instead of surfaced contextually during active decisions, the knowledge system provides no operational value.

### 4. The Campaign Workspace Is the Product
Users experience CariKOL as a campaign workspace — the place where campaigns are run. The decision capture layer and knowledge graph are invisible. Users should feel that "the system just knows things," not that they are using a knowledge management system.

This distinction matters for every UI copy decision, onboarding flow, and feature naming choice.

---

## Product Strategy Principles

### 5. Internal-First
Every feature must solve a real operational problem experienced by Buzzeryok's internal team. If Buzzeryok's own team does not use a feature every week, it should not be in the product. We are not building to impress — we are building to replace our own manual work.

### 6. Knowledge Over Database
CariKOL is not a creator directory. A creator record without decision history is just a row in a spreadsheet. Value comes from the accumulated decisions attached to that record, not from the record itself.

### 7. Confidence Over Completeness
Not all knowledge has the same certainty. The system must distinguish between Explicit (stated directly) and Inferred (believed based on context).

A record that says "client rejected — reason unknown" is more trustworthy than a record that confidently states an assumption as fact. An incomplete but honest knowledge base is more valuable than a complete but unreliable one.

### 8. Every Campaign Close Is a Knowledge Event
A campaign that closes without an Outcome Review is a missed knowledge event. The knowledge generated at campaign close — creator performance ratings, behavioral observations, outcome context — is the most valuable input into the long-term knowledge base.

Outcome Review is mandatory. It is not a gate before closing. It is the closing event itself.

### 9. AI Is a Consequence, Not a Feature
AI recommendations, predictions, and automation are the natural outcome of a disciplined knowledge base. They cannot be built before the knowledge exists and are not planned for MVP.

Designing for AI means designing clean, structured, provenance-aware decision records now — so that AI has something trustworthy to reason from later.

### 10. Build the Smallest Useful Thing First
If a feature cannot be justified against the weekly usage test, it cannot be in MVP. If the feature can wait, it waits. Three campaigns run inside CariKOL are worth more than thirty features never adopted.

---

## Feature Evaluation Test

Before recommending any feature, answer these seven questions. If the answers are weak, challenge the feature rather than adding it.

1. Which operational pain does this solve?
2. Who uses this feature, specifically?
3. How often will they use it?
4. Does this replace an existing manual workflow?
5. Does this generate or surface organizational knowledge?
6. Can this feature wait until a later phase?
7. Would Buzzeryok's internal team genuinely use this every week?

---

## What CariKOL Is Not Building

- An influencer marketplace
- A creator discovery platform
- A CRM
- A social media scheduler
- An analytics dashboard
- A media kit platform
- A client-facing portal (MVP)
- A creator-facing portal (MVP)

These categories already exist with many competitors. CariKOL is a campaign workspace where organizational knowledge compounds with every decision made. That is a different product.
