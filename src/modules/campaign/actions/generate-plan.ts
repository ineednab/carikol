"use server"
import { generateJSON, generateJSONArray }                    from "@/lib/ai/client"
import { prisma }                                             from "@/lib/prisma"
import { buildCampaignPlanPrompt, buildCreatorMatchPrompt }  from "@/lib/ai/prompts/campaign-plan"

export type CampaignPlan = {
  objective: string
  creatorType: string
  deliverables: string[]
  timeline: string
  estimatedKPI: { reach: string; impressions: string; engagement: string }
  brief: string
  budgetBreakdown: { creatorFee: string; production: string; note: string }
}

export type CreatorMatch = {
  id: string
  name: string
  username: string
  platform: string
  niche: string
  tier: string
  followerCount: number
  engagementRate: number
  typicalRateMin: number | null
  typicalRateMax: number | null
  matchScore: number
  matchReason: string
}

export type PlannerResult = {
  plan: CampaignPlan
  creators: CreatorMatch[]
}

export async function generateCampaignPlanAction(formData: FormData): Promise<
  { success: true; data: PlannerResult } | { success: false; error: string }
> {
  const VALID_PLATFORMS = ["tiktok", "instagram", "youtube", "other"] as const
  type ValidPlatform = typeof VALID_PLATFORMS[number]

  const sanitize = (s: string, max: number) =>
    s.replace(/[\n\r]/g, " ").replace(/[`"]/g, "'").slice(0, max)

  const product   = sanitize(formData.get("product")?.toString().trim()   ?? "", 200)
  const budget    = sanitize(formData.get("budget")?.toString().trim()     ?? "", 50)
  const target    = sanitize(formData.get("target")?.toString().trim()     ?? "", 200)
  const rawPlatform = formData.get("platform")?.toString().trim() ?? ""
  const objective = sanitize(formData.get("objective")?.toString().trim()  ?? "", 200)

  if (!product || !budget || !target || !rawPlatform) {
    return { success: false, error: "Semua field wajib diisi." }
  }

  if (!VALID_PLATFORMS.includes(rawPlatform as ValidPlatform)) {
    return { success: false, error: "Platform tidak valid." }
  }
  const platform = rawPlatform as ValidPlatform

  const prompt = buildCampaignPlanPrompt({ product, budget, target, platform, objective })

  try {
    const plan = await generateJSON<CampaignPlan>(prompt, 1024)
    if (!plan) return { success: false, error: "Gagal memproses respons AI." }

    const creators = await prisma.creator.findMany({
      where: { isActive: true, platform },
      take: 3,
      orderBy: [{ engagementRate: "desc" }],
    })

    let matchedCreators: CreatorMatch[] = []
    if (creators.length > 0) {
      const matchPrompt = buildCreatorMatchPrompt(product, target, creators.map(c => ({
        name:           c.name,
        username:       c.username,
        niche:          c.niche,
        followerCount:  c.followerCount,
        engagementRate: Number(c.engagementRate),
      })))

      const scores = await generateJSONArray<{ score: number; reason: string }>(matchPrompt, 512) ?? []

      matchedCreators = creators.map((c, i) => ({
        id: c.id,
        name: c.name,
        username: c.username,
        platform: c.platform,
        niche: c.niche,
        tier: c.tier,
        followerCount: c.followerCount,
        engagementRate: Number(c.engagementRate),
        typicalRateMin: c.typicalRateMin,
        typicalRateMax: c.typicalRateMax,
        matchScore: scores[i]?.score ?? 80,
        matchReason: scores[i]?.reason ?? "Relevan dengan campaign",
      }))
    }

    return { success: true, data: { plan, creators: matchedCreators } }
  } catch {
    return { success: false, error: "Gagal generate campaign plan. Coba lagi." }
  }
}
