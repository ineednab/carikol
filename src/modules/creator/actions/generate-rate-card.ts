"use server"
import { generateJSON }         from "@/lib/ai/client"
import { getSession }           from "@/lib/session"
import { prisma }               from "@/lib/prisma"
import { buildRateCardPrompt }  from "@/lib/ai/prompts/rate-card"

export type RateCardItem = {
  type: string
  description: string
  price: number
  priceFormatted: string
  notes: string
  reasons: string[]
}

export type RateCardResult = {
  items: RateCardItem[]
  summary: string
  positioning: string
}

export async function generateRateCardAction(): Promise<
  { success: true; data: RateCardResult } | { success: false; error: string }
> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Profil creator tidak ditemukan." }

  const creator = await prisma.creator.findUnique({
    where: { id: session.user.creatorId },
  })
  if (!creator) return { success: false, error: "Creator tidak ditemukan." }

  const prompt = buildRateCardPrompt({
    name:           creator.name,
    platform:       creator.platform,
    username:       creator.username,
    niche:          creator.niche,
    followerCount:  creator.followerCount,
    tier:           creator.tier,
    engagementRate: Number(creator.engagementRate),
    notes:          creator.notes ?? null,
  })

  try {
    const data = await generateJSON<RateCardResult>(prompt, 1024)
    if (!data) return { success: false, error: "Gagal memproses respons AI." }

    const prices = data.items.map((i) => i.price)
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        typicalRateMin: Math.min(...prices),
        typicalRateMax: Math.max(...prices),
        rateCardJson: data as object,
      },
    })

    return { success: true, data }
  } catch {
    return { success: false, error: "Gagal generate rate card. Coba lagi." }
  }
}
