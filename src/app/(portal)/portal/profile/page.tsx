import { redirect } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Lock } from "lucide-react"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PortalNav } from "@/components/portal/PortalNav"
import { ProfileForm } from "./_components/ProfileForm"

export const metadata = { title: "Profil — CariKOL" }

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", other: "Lainnya",
}
const TIER_LABEL: Record<string, string> = {
  nano: "Nano (< 10K)", micro: "Micro (10K – 100K)",
  macro: "Macro (100K – 1M)", mega: "Mega (> 1M)",
}

export default async function ProfilePage() {
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

      <main className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Profil</h1>
            <p className="mt-1 text-sm text-zinc-500">Informasi yang ditampilkan ke brand</p>
          </div>
          <Link
            href={`/k/${creator.username}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            <ExternalLink size={12} />
            Lihat Digital Passport
          </Link>
        </div>

        {/* Read-only identity */}
        <div className="mb-6 rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Lock size={11} className="text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Identitas</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Nama",     value: creator.name },
              { label: "Username", value: `@${creator.username}` },
              { label: "Platform", value: PLATFORM_LABEL[creator.platform] ?? creator.platform },
              { label: "Tier",     value: TIER_LABEL[creator.tier] ?? creator.tier },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-zinc-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-zinc-400">Nama dan username tidak bisa diubah. Hubungi tim CariKOL jika perlu perubahan.</p>
        </div>

        {/* Editable fields */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">Edit Profil</p>
          <ProfileForm
            initial={{
              city:    creator.city ?? "",
              contact: creator.contact,
              niche:   creator.niche,
            }}
          />
        </div>
      </main>
    </>
  )
}
