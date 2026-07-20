import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PortalNav } from "@/components/portal/PortalNav"
import { RateCardGenerator } from "./_components/RateCardGenerator"

export const metadata = { title: "Rate Card — CariKOL" }

export default async function RateCardPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.user.creatorId) redirect("/portal/onboarding")

  const creator = await prisma.creator.findUnique({
    where: { id: session.user.creatorId },
  })
  if (!creator) redirect("/portal/onboarding")

  return (
    <>
      <PortalNav creator={{ name: session.user.name ?? "", username: creator.username, tier: creator.tier }} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Rate Card</h1>
          <p className="mt-1 text-sm text-zinc-500">
            AI akan generate harga yang sesuai berdasarkan profil dan pasar Indonesia
          </p>
        </div>
        <RateCardGenerator creatorName={creator.name} />
      </main>
    </>
  )
}
