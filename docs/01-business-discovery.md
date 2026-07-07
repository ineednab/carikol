# Business Discovery Document
CariKOL — Pre-PRD Synthesis
Last updated: 2026-07-07

---

## 1. Company Background

**Company:** Buzzeryok
**Type:** Campaign operations company (not solely an influencer agency)
**Market:** Indonesia
**Stage:** 4+ years of operation, pre-seed SaaS product

Buzzeryok operates as a campaign execution company. Influencer marketing is one of many campaign types managed. The business has achieved genuine operational product-market fit at the services level — real clients, real campaigns, recurring revenue.

**Scale:**
- 1,000+ creator network
- 100+ brand clients
- Multiple campaign types active simultaneously

---

## 2. Campaign Types Managed

Buzzeryok manages any campaign involving external contributors:

- KOL / Influencer Campaigns
- UGC Campaigns
- Affiliate Campaigns
- Google Maps Reviews
- App Store / Play Store Reviews
- Social Media Engagement (likes, comments, shares, saves, follows)
- Community Activation
- Digital Buzz Campaigns
- Microtask-based Campaigns

**MVP focus:** KOL campaigns only. Other types are future phases.

---

## 3. Team Structure

| Role | Primary Responsibility |
|---|---|
| Campaign Manager | Coordinates all stakeholders, owns decisions, manages client relationship |
| KOL Specialist | Sources and proposes creators, manages creator communication |
| Operations | Workflow administration |
| Finance | Invoicing, payment tracking |
| Freelance Creators | Campaign execution (external contributors) |

**Campaign Manager is the primary power user.** They coordinate clients, KOL Specialists, creators, and finance. Every major campaign decision passes through them.

**KOL Specialist is the primary daily user.** They search, list, and contact creators on every campaign.

---

## 4. Current Tool Stack

| Tool | Used For |
|---|---|
| Google Sheets | Creator lists, campaign trackers, payment tracking |
| WhatsApp | Internal coordination, client communication, creator communication |
| Google Drive | Briefs, content submissions, reports |
| Gmail | Client communication |
| Canva / PowerPoint | Client reporting decks |
| Human memory | Creator reputation, brand preferences, operational reasoning |

**No single source of truth exists.** Campaign knowledge is fragmented across all of the above.

---

## 5. KOL Campaign Lifecycle (Current State)

The full campaign has 14 operational steps:

**Pre-execution (Steps 1–7):**
1. Client Inquiry — WhatsApp / Gmail
2. Internal Brief — WhatsApp / Google Docs (no standard template)
3. Creator Listing — Sheets, old spreadsheets, WhatsApp, memory
4. Internal Review — WhatsApp discussion, no documented reasoning
5. Client Approval — Sheet / PDF sent, revisions via WhatsApp
6. Creator Outreach — Individual WhatsApp messages
7. Negotiation — WhatsApp, no historical rate data available

**Execution (Steps 8–14):**
8. Briefing — WhatsApp / PDF
9. Content Production — Submission via Google Drive / WhatsApp
10. Revision — WhatsApp, history disappears in chat
11. Posting — Manual verification by Campaign Manager
12. Insight Collection — Creator submits screenshots via WhatsApp, manually compiled
13. Client Reporting — Manual Slides / Canva / PowerPoint
14. Invoice & Payment — Manual tracking

**MVP scope:** Steps 1–7 (pre-execution) + Outcome Review after campaign closes.

---

## 6. Decision Points in the KOL Workflow

Every campaign involves a series of decisions. Three types of decisions generate the most valuable operational knowledge:

### Internal Rejection (Steps 3–4)
- Decision owner: Campaign Manager (KOL Specialist proposes)
- Reason: usually known and should always be captured
- Knowledge quality: HIGH — this is the most reliable organizational knowledge

### Client Rejection (Step 5)
- Decision owner: Client
- Reason: sometimes explicit, sometimes vague, sometimes inferred
- Must distinguish: Explicit reason / Internal interpretation / Unknown
- Knowledge quality: MEDIUM — depends on how clearly the client communicated

### Creator Unavailability (Steps 6–7)
- Not a rejection — reflects creator behavior, not campaign fit
- Sub-types:
  - Creator Declined (said no explicitly)
  - Creator No Response (unreachable)
  - Creator Budget Rejected (negotiation failed)
  - Creator Unavailable (booking conflict)
- Knowledge quality: HIGH for behavioral patterns, must not be confused with quality rejection

---

## 7. Organizational Knowledge Today

**Where knowledge lives:**
- Structured (partially importable): Google Sheets, campaign trackers, creator lists
- Unstructured (not importable): WhatsApp conversations, emails, individual memory

**The knowledge reconstruction problem:**
When asked "which creators worked with Brand X before?" — the answer takes minutes to over an hour. The information exists somewhere. It is not findable.

Example of knowledge that disappears today:
- Why a creator was rejected
- Why a client preferred one creator over another
- Which creators communicate unreliably
- Which brands have long approval cycles
- Which campaign strategies worked for which verticals
- Historical negotiated rates

**If all WhatsApp history disappeared tomorrow:** years of operational intelligence would be permanently lost.

---

## 8. Historical Data for Migration

| Data Type | Location | Importable? |
|---|---|---|
| Creator profiles (username, platform, followers, niche, rate) | Google Sheets | Yes |
| Brand/client records | Google Sheets | Yes |
| Campaign history (basic) | Google Sheets | Yes |
| Rejection reasoning | WhatsApp | No |
| Negotiation notes | WhatsApp / Memory | No |
| Creator behavioral notes | Memory | No |

**Migration strategy:** Import ~300 highest-quality creator records first. Quality over quantity. Unstructured knowledge will be rebuilt gradually through future campaign operations.

---

## 9. Key Operational Inefficiencies

In order of operational impact:

1. **Creator listing reconstruction** — every campaign rebuilds the same information from scratch
2. **No searchable creator history** — finding past collaborations requires manual spreadsheet archaeology
3. **Decision reasoning disappears** — rejection reasons, rate negotiations, and client preferences are never documented
4. **No campaign brief standardization** — every manager documents differently
5. **Client approval is untracked** — revision rounds leave no audit trail
6. **Creator behavioral patterns are invisible** — reliability, communication quality, rate negotiation patterns are informal knowledge only
7. **Campaign close is not a knowledge event** — nothing is captured when a campaign ends

---

## 10. Constraints and Non-Negotiables

- **Internal only for MVP** — no client portal, no creator portal
- **KOL campaigns only for MVP** — other campaign types are future phases
- **Single founder, AI-assisted development** — MVP must be extremely narrow
- **Knowledge capture must be a byproduct of workflow** — if it requires extra steps, it will not happen
- **Trust over completeness** — the system must never store assumptions as facts
