"use server"
import { generateJSON } from "@/lib/ai/client"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export type BrandFitItem = {
  category: string
  score: number // 1-5
}

export type RateCardItem = {
  type: string
  description: string
  price: number
  priceFormatted: string
  reasons: string[]
}

export type AIStudioResult = {
  summary: string
  audienceInsight: string
  brandFit: BrandFitItem[]
  strengths: string[]
  weaknesses: string[]
  tips: string[]
  rateCard: {
    items: RateCardItem[]
    positioning: string
  }
}

export async function generateAIStudioAction(): Promise<
  { success: true; data: AIStudioResult } | { success: false; error: string }
> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Profil creator tidak ditemukan." }

  const creator = await prisma.creator.findUnique({
    where: { id: session.user.creatorId },
  })
  if (!creator) return { success: false, error: "Creator tidak ditemukan." }

  // Sanitize user-controlled strings — strip newlines and cap length to prevent prompt injection
  const safe = (s: string, max = 100) =>
    s.replace(/[\n\r]/g, " ").replace(/[`"]/g, "'").slice(0, max)

  const prompt = `Kamu adalah AI analyst untuk platform creator Indonesia. Analisa creator berikut dan buat Creator Intelligence Report lengkap.

Data Creator:
- Nama: ${safe(creator.name)}
- Platform: ${safe(creator.platform)}
- Username: @${safe(creator.username)}
- Niche: ${safe(creator.niche, 200)}
- Kota: ${creator.city ? safe(creator.city) : "tidak disebutkan"}
- Follower: ${creator.followerCount.toLocaleString("id")}
- Tier: ${safe(creator.tier)}
- Engagement Rate: ${creator.engagementRate}%

Return JSON ONLY (no other text):
{
  "summary": "Paragraf 2-3 kalimat yang mendeskripsikan creator secara profesional. Sebutkan nama, platform, audience, dan value proposition untuk brand.",

  "audienceInsight": "1-2 kalimat deskripsi audience (demografi, minat utama, perilaku konsumsi konten)",

  "brandFit": [
    { "category": "Beauty & Skincare", "score": 5 },
    { "category": "Fashion & Style", "score": 4 },
    { "category": "Lifestyle", "score": 4 },
    { "category": "Food & Kuliner", "score": 3 },
    { "category": "Health & Wellness", "score": 3 }
  ],

  "strengths": [
    "kekuatan spesifik 1",
    "kekuatan spesifik 2",
    "kekuatan spesifik 3"
  ],

  "weaknesses": [
    "area yang perlu ditingkatkan 1",
    "area yang perlu ditingkatkan 2"
  ],

  "tips": [
    "tips konkret untuk meningkatkan value sebagai creator 1",
    "tips konkret 2"
  ],

  "rateCard": {
    "positioning": "1 frase positioning creator (contoh: 'Beauty Micro-Influencer TikTok')",
    "items": [
      {
        "type": "jenis konten sesuai platform ${creator.platform}",
        "description": "apa yang didapat brand",
        "price": angka_rupiah,
        "priceFormatted": "Rp X.XXX.XXX",
        "reasons": ["alasan singkat kenapa harga ini", "alasan 2"]
      }
    ]
  }
}

Untuk brandFit, sesuaikan dengan niche creator. Score 1-5.
Untuk rateCard, buat 4-5 item sesuai platform ${creator.platform} (TikTok: Video TikTok/Live/Duet, Instagram: Feed/Reels/Story, YouTube: Dedicated/Integration/Shorts).
Harga harus realistis untuk pasar Indonesia berdasarkan tier ${creator.tier} dan ${creator.followerCount.toLocaleString("id")} followers.`

  try {
    const data = await generateJSON<AIStudioResult>(prompt, 2048)
    if (!data) return { success: false, error: "Gagal memproses respons AI." }

    // Cache everything
    const prices = (data.rateCard?.items ?? []).map((i) => i.price).filter((p) => typeof p === "number" && isFinite(p))
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        aiInsight:      JSON.stringify(data),
        rateCardJson:   data.rateCard as object,
        typicalRateMin: prices.length > 0 ? Math.min(...prices) : null,
        typicalRateMax: prices.length > 0 ? Math.max(...prices) : null,
      },
    })

    return { success: true, data }
  } catch {
    return { success: false, error: "Gagal generate AI Studio. Coba lagi." }
  }
}
