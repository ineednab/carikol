import { redirect } from "next/navigation"
import { getAuthUser, getSession } from "@/lib/session"
import { OnboardingWizard } from "./_components/OnboardingWizard"

export const metadata = { title: "Get Discovered — CariKOL" }

export default async function OnboardingPage() {
  const [authUser, session] = await Promise.all([getAuthUser(), getSession()])

  if (!authUser) redirect("/login")
  if (session?.user.creatorId) redirect("/portal")

  const prefill = {
    name:      authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? "",
    email:     authUser.email ?? "",
    avatarUrl: authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? "",
  }

  return <OnboardingWizard prefill={prefill} />
}
