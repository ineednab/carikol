# Problem Statement
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

---

## The Scene

A new campaign brief arrives.

The Campaign Manager sits down and the first thing they do is not plan. The first thing they do is search.

They open old spreadsheets. They scroll through WhatsApp. They dig through Google Drive folders with names like "Campaign - Wardah Q3 2024 FINAL v2". They ask a colleague. They try to remember.

The information they are looking for already exists. The company has run this type of campaign before. The KOL Specialist worked with these creators six months ago. Someone wrote notes about why three of them were replaced mid-campaign. A brand manager left detailed feedback about content quality. There were rates negotiated, and one creator ghosted the team entirely.

None of this is findable in under an hour.

So the Campaign Manager starts from scratch. Again.

This is not an occasional problem. It happens on almost every campaign. It wastes hours before a single creator is contacted.

---

## Primary Problem

**Every campaign begins by reconstructing knowledge that already exists.**

Buzzeryok has operated for four years. In that time, the company has generated enormous operational intelligence — which creators perform well, which brands have specific preferences, which strategies work for which verticals, which creators communicate professionally and which disappear after accepting a brief.

That intelligence exists. It is not accessible.

It lives in WhatsApp conversations that scroll off the screen. In spreadsheets that no one can find. In the memory of employees who may or may not still work at the company. In Google Drive folders organized by someone who has since changed their folder naming convention.

Every new campaign starts by partially reconstructing this intelligence from scratch. The reconstruction is expensive — in time, in mental effort, and in the quality of decisions made without full context.

This is the primary operational cost that CariKOL is built to eliminate.

---

## Root Cause

The problem is not a lack of data. Buzzeryok generates data constantly — every campaign, every creator interaction, every client response.

The root cause is structural: **decisions are made verbally, in WhatsApp, without a required output format, at the exact moment when no one has time to document anything.**

Because decisions leave no structured trace, the knowledge they contain cannot be preserved, searched, or reused. The organization starts each campaign almost as naive as it was before the previous one.

The fix is not a documentation requirement. Documentation requirements always fail under operational pressure. People are running campaigns, not filing reports.

The fix is redesigning the workflow so that **completing a required action automatically produces a structured decision record.** When a Campaign Manager rejects a creator, they are already making a decision. The product only needs to require a structured output from that decision before allowing them to move to the next step.

Knowledge capture must be invisible. It must feel like doing the work — because it is.

---

## The Specific Failure Moment

The failure is most visible when someone needs to answer a question that should take seconds:

- "Which creators have we worked with for Brand X before?"
- "Why was this creator rejected on our last campaign for this brand?"
- "Which beauty creators under IDR 2 million have performed well for us?"
- "Does this creator tend to go unresponsive after we confirm them?"

Today each of these questions takes 30 minutes to over an hour — and sometimes cannot be answered at all, because the person who knew is no longer available.

After three months of using CariKOL, each of these questions should take under 30 seconds.

---

## Problem Scope (MVP)

CariKOL MVP addresses the pre-execution phase of KOL campaigns only.

**In scope:**
- Campaign brief creation and standardization
- Creator workspace search and filtering
- Internal review decisions (approval and rejection with structured reason)
- Client approval logging with confidence level
- Negotiation outcome logging per creator
- Mandatory Outcome Review at campaign close

**Out of scope for MVP:**
- Campaign execution tracking (briefing, content review, posting verification)
- Financial and payment workflows
- Client-facing portal
- Creator-facing portal
- Non-KOL campaign types
- AI-powered recommendations (Phase 2 — after sufficient knowledge accumulates)

---

## Assumptions Still To Validate

These assumptions do not block MVP design. They should be validated during and after MVP launch.

1. **Adoption assumption.** Campaign Managers and KOL Specialists will use CariKOL instead of spreadsheets if the creator search experience is demonstrably faster from Day 1. Not yet tested in practice.

2. **Minimum viable dataset.** Importing ~300 quality creator records is sufficient to make the creator workspace immediately useful at launch. The actual minimum number has not been confirmed.

3. **Rejection taxonomy.** Specific structured categories for rejection reasons must be defined during database and UX design. The right taxonomy requires input from the KOL Specialist and Campaign Manager — it must match how they already think, not how a designer imagined they think.

4. **Outcome Review compliance.** The mandatory gate (campaign cannot move to Closed without completing the Outcome Review) will drive completion behavior without creating resentment. To be validated during first month of use.

5. **Confidence level usability.** Campaign Managers will intuitively understand the Explicit / Inferred distinction without training. Requires UX validation.

6. **Cross-agency applicability.** The product has been designed for Buzzeryok's specific workflow. Whether other agencies share the same pre-execution structure is unvalidated. This matters only for Phase 5 (multi-tenant SaaS) and does not affect MVP design.

---

## Success Metrics for MVP

**The MVP succeeds if:**
1. A KOL Specialist finds relevant creator history in under 30 seconds (vs. current 30 min – 1 hour)
2. Every creator list submitted for internal review has a documented rejection reason for every creator not approved
3. Every closed campaign has a completed Outcome Review with ratings for each participating creator
4. The Buzzeryok team completes at least 3 full campaigns inside CariKOL without reverting to parallel spreadsheet management
5. After 90 days, the creator workspace surfaces historically relevant context that the team did not have to manually search for

**The MVP fails if:**
- The team continues managing campaigns in parallel on WhatsApp and spreadsheets after 30 days
- Outcome Reviews are consistently skipped or partially completed
- The creator workspace search returns results no more useful than opening a Google Sheet
- Any team member describes CariKOL as "extra work"
