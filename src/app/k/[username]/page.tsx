import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MediaKitView } from "./_components/MediaKitView"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const creator = await prisma.creator.findUnique({ where: { username } })
  if (!creator) return { title: "Creator not found — CariKOL" }
  return {
    title: `${creator.name} (@${creator.username}) — Media Kit CariKOL`,
    description: creator.notes ?? `Creator ${creator.niche} di ${creator.platform}`,
  }
}

export default async function MediaKitPage({ params }: Props) {
  const { username } = await params
  const creator = await prisma.creator.findUnique({ where: { username } })
  if (!creator) notFound()

  const studioData = creator.aiInsight
    ? (() => {
        try {
          const parsed = JSON.parse(creator.aiInsight!) as AIStudioResult
          if (!parsed?.facts?.activity || !parsed?.ai?.observations) return null
          return parsed
        } catch { return null }
      })()
    : null

  return (
    <MediaKitView
      creator={{
        name: creator.name,
        username: creator.username,
        platform: creator.platform,
        niche: creator.niche,
        tier: creator.tier,
        followerCount: creator.followerCount,
        engagementRate: Number(creator.engagementRate),
        city: creator.city ?? null,
        bio: creator.notes ?? null,
        contact: creator.contact,
        typicalRateMin: creator.typicalRateMin ?? null,
        typicalRateMax: creator.typicalRateMax ?? null,
      }}
      studioData={studioData}
    />
  )
}
