import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MediaKitView } from "./_components/MediaKitView"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  // username param is now treated as the creator ID or social account username
  const socialAccount = await prisma.socialAccount.findFirst({
    where:   { username },
    include: { creator: true },
  })
  const creator = socialAccount?.creator
    ?? await prisma.creator.findFirst({ where: { id: username } })
  if (!creator) return { title: "Creator not found — CariKOL" }
  return {
    title: `${creator.name} — Media Kit CariKOL`,
    description: `Creator dari ${creator.city ?? "Indonesia"}`,
  }
}

export default async function MediaKitPage({ params }: Props) {
  const { username } = await params

  const socialAccount = await prisma.socialAccount.findFirst({
    where:   { username },
    include: {
      creator: {
        include: {
          categories:    true,
          socialAccounts: { include: { platform: true, snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } } },
        },
      },
    },
  })

  const creator = socialAccount?.creator
    ?? await prisma.creator.findFirst({
      where: { id: username },
      include: {
        categories:    true,
        socialAccounts: { include: { platform: true, snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } } },
      },
    })

  if (!creator) notFound()

  const primaryAccount = creator.socialAccounts[0] ?? null
  const latestSnap     = primaryAccount?.snapshots[0] ?? null

  return (
    <MediaKitView
      creator={{
        name:           creator.name,
        categories:     creator.categories.map(c => c.category),
        city:           creator.city ?? null,
        contact:        creator.contact,
        platform:       primaryAccount?.platform.name ?? null,
        username:       primaryAccount?.username ?? null,
        followerCount:  latestSnap?.followerCount ?? null,
        engagementRate: latestSnap?.engagementRate != null ? Number(latestSnap.engagementRate) : null,
      }}
    />
  )
}
