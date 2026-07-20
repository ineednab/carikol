import { generateJSON } from "@/lib/ai/client"
import { prisma } from "@/lib/prisma"

export type AIInsight = {
  headline: string
  strengths: string[]
  audienceInsight: string
  brandFit: string[]
  contentStyle: string
}

export async function getOrGenerateInsight(creatorId: string): Promise<AIInsight | null> {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } })
  if (!creator) return null

  if (creator.aiInsight) {
    try { return JSON.parse(creator.aiInsight) as AIInsight } catch { /* fall through */ }
  }

  const prompt = `Kamu adalah analis KOL marketing Indonesia. Buat AI insight profesional untuk creator berikut.

Data Creator:
- Nama: ${creator.name}
- Platform: ${creator.platform}
- Username: @${creator.username}
- Niche: ${creator.niche}
- Kota: ${creator.city ?? "tidak disebutkan"}
- Follower: ${creator.followerCount.toLocaleString("id")}
- Tier: ${creator.tier}
- Engagement Rate: ${creator.engagementRate}%
${creator.notes ? `- Bio: ${creator.notes}` : ""}

Return JSON ONLY (no other text):
{
  "headline": "tagline profesional 1 kalimat tentang creator ini (max 10 kata)",
  "strengths": ["kekuatan 1", "kekuatan 2", "kekuatan 3"],
  "audienceInsight": "deskripsi audience 1-2 kalimat (demografi, minat, perilaku)",
  "brandFit": ["kategori brand 1", "kategori brand 2", "kategori brand 3", "kategori brand 4"],
  "contentStyle": "deskripsi gaya konten 1 kalimat"
}`

  try {
    const insight = await generateJSON<AIInsight>(prompt, 512)
    if (!insight) return null
    await prisma.creator.update({
      where: { id: creatorId },
      data: { aiInsight: JSON.stringify(insight) },
    })
    return insight
  } catch {
    return null
  }
}
