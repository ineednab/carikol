import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PortalNav } from "@/components/portal/PortalNav"
import { AIStudio } from "./_components/AIStudio"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"

export const metadata = { title: "Creator Identity — CariKOL" }

export default async function StudioPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.user.creatorId) redirect("/portal/onboarding")

  const creator = await prisma.creator.findUnique({
    where: { id: session.user.creatorId },
  })
  if (!creator) redirect("/portal/onboarding")

  const cached = creator.aiInsight
    ? (() => { try { return JSON.parse(creator.aiInsight!) as AIStudioResult } catch { return null } })()
    : null

  return (
    <>
      <PortalNav creator={{ name: session.user.name ?? "", username: creator.username, tier: creator.tier }} />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Creator Identity</h1>
          <p className="mt-1 text-sm text-zinc-500">
            AI-powered intelligence — Brand Fit, Rate Card, dan Creator Insights.
          </p>
        </div>
        <AIStudio
          creatorUsername={creator.username}
          initialData={cached}
        />
      </main>
    </>
  )
}
