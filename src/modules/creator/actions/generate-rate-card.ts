"use server"
import { generateJSON } from "@/lib/ai/client"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

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

  const prompt = `Kamu adalah ahli KOL marketing Indonesia. Berdasarkan data creator berikut, buat rate card yang realistis dan kompetitif untuk pasar Indonesia.

Data Creator:
- Nama: ${creator.name}
- Platform: ${creator.platform}
- Username: @${creator.username}
- Niche: ${creator.niche}
- Follower: ${creator.followerCount.toLocaleString("id")}
- Tier: ${creator.tier}
- Engagement Rate: ${creator.engagementRate}%
${creator.notes ? `- Bio: ${creator.notes}` : ""}

Buat rate card dalam format JSON dengan struktur berikut (HANYA return JSON, tidak ada teks lain):
{
  "items": [
    {
      "type": "nama jenis konten",
      "description": "deskripsi singkat apa yang didapat brand",
      "price": angka_dalam_rupiah,
      "priceFormatted": "Rp X.XXX.XXX",
      "notes": "catatan penting atau include apa",
      "reasons": ["alasan 1 kenapa harga ini wajar", "alasan 2", "alasan 3"]
    }
  ],
  "summary": "1-2 kalimat positioning creator ini di pasar",
  "positioning": "kata kunci positioning (contoh: 'Beauty Micro-Influencer TikTok')"
}

Sesuaikan jenis konten dengan platform (${creator.platform}):
- TikTok: Video TikTok, TikTok Live, Duet/Stitch, Story TikTok
- Instagram: Feed Post, Reels, Story (1 frame), Story (3-5 frame), IG Live
- YouTube: Dedicated Video, Mention/Integration, YouTube Shorts, Community Post

Harga harus realistis untuk pasar Indonesia berdasarkan tier dan follower count. Buat 4-6 item.`

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
