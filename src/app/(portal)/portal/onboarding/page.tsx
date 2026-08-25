import { redirect } from "next/navigation"
import { cookies }  from "next/headers"
import { getAuthUser, getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { OnboardingWizard } from "./_components/OnboardingWizard"

export const metadata = { title: "Get Discovered — CariKOL" }

interface Props { searchParams: Promise<{ tiktok?: string }> }

export default async function OnboardingPage({ searchParams }: Props) {
  const [authUser, session, { tiktok: tiktokParam }, cookieStore] = await Promise.all([
    getAuthUser(), getSession(), searchParams, cookies(),
  ])

  if (!authUser) redirect("/login")
  if (session?.user.creatorId) redirect("/portal")

  const platforms = await prisma.platform.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const prefill = {
    name:      authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? "",
    email:     authUser.email ?? "",
    avatarUrl: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? "",
  }

  let tiktokProfile: {
    openId: string; username: string; displayName: string
    avatarUrl: string | null; profileUrl: string; followerCount: number
  } | null = null

  if (tiktokParam === "ok") {
    const raw = cookieStore.get("tiktok_onboarding_profile")?.value
    if (raw) {
      try { tiktokProfile = JSON.parse(raw) } catch {}
    }
  }

  return (
    <OnboardingWizard
      prefill={prefill}
      platforms={platforms}
      tiktokProfile={tiktokProfile}
    />
  )
}
