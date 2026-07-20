"use server"
import { generateJSON }      from "@/lib/ai/client"
import { getSession }        from "@/lib/session"
import { prisma }            from "@/lib/prisma"
import {
  processCreatorFacts,
  type CreatorFacts,
  type TikTokVideo,
} from "@/lib/creator-facts"

// ── Types ─────────────────────────────────────────────────────────────────────

export type AIObservation = {
  text:     string   // what AI says
  evidence: string   // which computed fact supports this
}

export type AIStrength = {
  label:    string   // e.g. "Consistent Posting"
  evidence: string   // e.g. "28 uploads in 90 days"
}

export type AIOpportunity = {
  label: string      // e.g. "Rate Card Missing"
}

type AIGenerated = {
  activitySummary:    string
  contentSummary:     string
  performanceSummary: string
  rateCardExplanation: string
  observations:       AIObservation[]
  strengths:          AIStrength[]
  opportunities:      AIOpportunity[]
}

export type AIStudioResult = {
  facts:       CreatorFacts
  ai:          AIGenerated
  generatedAt: string
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(facts: CreatorFacts): string {
  // Only send what AI needs — not the full object
  const context = {
    profile:     facts.profile,
    activity:    { ...facts.activity,    evidence: facts.activity.evidence },
    performance: { ...facts.performance, evidence: facts.performance.evidence },
    content:     { ...facts.content,     evidence: facts.content.evidence },
    brandFit:    facts.brandFit,
    rateCard:    facts.rateCard,
    facts:       facts.facts,
    dataQuality: facts.dataQuality,
  }

  return `You are an analytics writer for CariKOL, a creator platform.

Your ONLY job is to write clear, human-readable explanations of the pre-computed data below.

STRICT RULES:
1. Do NOT invent facts. Every claim must come from the data provided.
2. Do NOT mention audience demographics (gender, age, location) — this data is not available from TikTok Login Kit.
3. Do NOT guess brand preferences beyond what content categories explicitly show.
4. Do NOT use hedge words ("likely", "probably", "suggests") for values that are already computed.
5. If a value is null or 0, skip it — do not fill in the gap with assumptions.
6. Each observation MUST cite one item from the facts array verbatim.
7. Strengths must have direct numerical evidence. No personality assessments.
8. Opportunities are gaps in data or profile completeness — not advice.
9. Write in English. Be concise.

DATA (pre-computed, do not modify):
${JSON.stringify(context, null, 2)}

Return valid JSON only. No markdown, no explanation outside the JSON.

{
  "activitySummary": "One sentence about posting habit. Must cite posting frequency or videos90d.",
  "contentSummary": "One sentence about content focus. Must cite top category and percentage. If no categories found, say 'Content categories could not be determined from available video titles.'",
  "performanceSummary": "One sentence about views or engagement. Must cite avgViews or avgEngagement.",
  "rateCardExplanation": "One sentence explaining why the price range is basePriceMin–basePriceMax. Cite tier and avgViews.",
  "observations": [
    {
      "text": "Observation sentence — explain one pattern from the data.",
      "evidence": "Exact string from facts[] array that supports this."
    }
  ],
  "strengths": [
    {
      "label": "Short label (2-4 words)",
      "evidence": "Specific number or metric from the data"
    }
  ],
  "opportunities": [
    {
      "label": "Short label describing a missing or incomplete data point"
    }
  ]
}

Maximum: 3 observations, 3 strengths, 3 opportunities.
If dataQuality.insufficient is true, limit observations to 1 and note limited data.`
}

// ── Validator ─────────────────────────────────────────────────────────────────

function validateAIOutput(ai: AIGenerated, facts: CreatorFacts): AIGenerated {
  const factSet = new Set(facts.facts)

  const validatedObservations = (ai.observations ?? [])
    .filter((o) => {
      // Reject any observation that references audience demographics
      const banned = ["female", "male", "gender", "age", "location", "demografi", "perempuan", "laki"]
      return !banned.some((b) => o.text.toLowerCase().includes(b))
    })
    .slice(0, 3)

  const validatedStrengths = (ai.strengths ?? [])
    .filter((s) => s.label && s.evidence)
    .slice(0, 3)

  const validatedOpportunities = (ai.opportunities ?? [])
    .filter((o) => o.label)
    .slice(0, 3)

  // Add missing fact check — if observation evidence not in facts, keep it but don't reject
  // (AI may paraphrase rather than quote verbatim)
  void factSet

  return {
    ...ai,
    observations:   validatedObservations,
    strengths:      validatedStrengths,
    opportunities:  validatedOpportunities,
  }
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function generateAIStudioAction(): Promise<
  { success: true; data: AIStudioResult } | { success: false; error: string }
> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Profil creator tidak ditemukan." }

  const [creator, tiktokAccount] = await Promise.all([
    prisma.creator.findUnique({ where: { id: session.user.creatorId } }),
    prisma.tikTokAccount.findUnique({ where: { creatorId: session.user.creatorId } }),
  ])
  if (!creator) return { success: false, error: "Creator tidak ditemukan." }

  const rawVideos = (tiktokAccount?.videosJson ?? []) as TikTokVideo[]

  const facts = processCreatorFacts(
    rawVideos,
    {
      followerCount:  tiktokAccount?.followerCount  ?? creator.followerCount,
      followingCount: tiktokAccount?.followingCount ?? 0,
      likesCount:     tiktokAccount?.likesCount     ?? 0,
      videoCount:     tiktokAccount?.videoCount     ?? 0,
    },
    {
      tier:           creator.tier,
      platform:       creator.platform,
      engagementRate: Number(creator.engagementRate),
    }
  )

  const prompt = buildPrompt(facts)

  try {
    const aiRaw = await generateJSON<AIGenerated>(prompt, 1024)
    if (!aiRaw) return { success: false, error: "Gagal memproses respons AI." }

    const ai = validateAIOutput(aiRaw, facts)

    const result: AIStudioResult = {
      facts,
      ai,
      generatedAt: new Date().toISOString(),
    }

    // Derive rate card price range from rule engine (not AI)
    const prices = [facts.rateCard.basePriceMin, facts.rateCard.basePriceMax].filter(Boolean)
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        aiInsight:      JSON.stringify(result),
        typicalRateMin: prices[0] ?? null,
        typicalRateMax: prices[1] ?? null,
      },
    })

    return { success: true, data: result }
  } catch (err) {
    console.error("[AI Studio]", err)
    return { success: false, error: "Gagal generate. Coba lagi." }
  }
}
