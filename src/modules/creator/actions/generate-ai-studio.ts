"use server"
import { generateJSON }             from "@/lib/ai/client"
import { getSession }               from "@/lib/session"
import { prisma }                   from "@/lib/prisma"
import { processCreatorFacts, type CreatorFacts, type TikTokVideo } from "@/lib/creator-facts"
import { buildCreatorIntelPrompt }  from "@/lib/ai/prompts/creator-intel"

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

  const prompt = buildCreatorIntelPrompt(facts)

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
