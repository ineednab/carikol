"use server"
import { generateJSON, generateJSONArray }                    from "@/lib/ai/client"
import { prisma }                                             from "@/lib/prisma"
import { getSession }                                         from "@/lib/session"
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
  username: string | null
  platform: string | null
  niche: string | null
  tier: string | null
  followerCount: number | null
  engagementRate: number | null
  typicalRateMin: null
  typicalRateMax: null
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
  const session = await getSession()
  if (!session) return { success: false, error: "Silakan login untuk menggunakan fitur ini." }
  if (session.user.role === "talent") {
    return { success: false, error: "Fitur ini hanya untuk tim internal CariKOL." }
  }

  const VALID_PLATFORMS = ["tiktok", "instagram", "youtube", "other"] as const
  type ValidPlatform = typeof VALID_PLATFORMS[number]

  const sanitize = (s: string, max: number) =>
    s.replace(/[\n\r]/g, " ").replace(/[`"]/g, "'").slice(0, max)

  const product    = sanitize(formData.get("product")?.toString().trim()    ?? "", 200)
  const budget     = sanitize(formData.get("budget")?.toString().trim()      ?? "", 50)
  const target     = sanitize(formData.get("target")?.toString().trim()      ?? "", 200)
  const rawPlatform = formData.get("platform")?.toString().trim() ?? ""
  const objective  = sanitize(formData.get("objective")?.toString().trim()   ?? "", 200)

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

    // Query creators who have a social account on the requested platform
    const creators = await prisma.creator.findMany({
      where: {
        isActive: true,
        socialAccounts: { some: { platformId: platform } },
      },
      take: 3,
      include: {
        categories: { take: 1 },
        socialAccounts: {
          where: { platformId: platform },
          take: 1,
          include: {
            platform: true,
            snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
          },
        },
      },
    })

    type CreatorRow = typeof creators[number]

    const toCreatorInfo = (c: CreatorRow) => {
      const acct = c.socialAccounts[0] ?? null
      const snap = acct?.snapshots[0] ?? null
      return {
        name:           c.name,
        username:       acct?.username ?? null,
        niche:          c.categories[0]?.category ?? null,
        followerCount:  snap?.followerCount ?? null,
        engagementRate: snap?.engagementRate != null ? Number(snap.engagementRate) : null,
      }
    }

    let matchedCreators: CreatorMatch[] = []
    if (creators.length > 0) {
      const matchPrompt = buildCreatorMatchPrompt(
        product,
        target,
        creators.map(c => toCreatorInfo(c)),
      )

      const scores = await generateJSONArray<{ score: number; reason: string }>(matchPrompt, 512) ?? []

      matchedCreators = creators.map((c, i) => {
        const acct = c.socialAccounts[0] ?? null
        const snap = acct?.snapshots[0] ?? null
        return {
          id: c.id,
          name: c.name,
          username:       acct?.username ?? null,
          platform:       acct?.platform.name ?? null,
          niche:          c.categories[0]?.category ?? null,
          tier:           null,
          followerCount:  snap?.followerCount ?? null,
          engagementRate: snap?.engagementRate != null ? Number(snap.engagementRate) : null,
          typicalRateMin: null,
          typicalRateMax: null,
          matchScore:  scores[i]?.score  ?? 80,
          matchReason: scores[i]?.reason ?? "Relevan dengan campaign",
        }
      })
    }

    return { success: true, data: { plan, creators: matchedCreators } }
  } catch {
    return { success: false, error: "Gagal generate campaign plan. Coba lagi." }
  }
}
