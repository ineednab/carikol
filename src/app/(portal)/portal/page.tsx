import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PortalNav } from "@/components/portal/PortalNav"
import { Sparkles, ChevronRight, Globe, User } from "lucide-react"

function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export const metadata = { title: "Portal — CariKOL" }

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tiktok?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.user.creatorId) redirect("/portal/onboarding")

  const [creator, tiktokAccount, { tiktok: tiktokStatus }] = await Promise.all([
    prisma.creator.findUnique({ where: { id: session.user.creatorId } }),
    prisma.tikTokAccount.findUnique({ where: { creatorId: session.user.creatorId } }),
    searchParams,
  ])
  if (!creator) redirect("/portal/onboarding")

  const firstName = session.user.name?.split(" ")[0] ?? "Creator"

  const actions = [
    {
      href:        `/k/${creator.username}`,
      icon:        Globe,
      label:       "Media Kit Publik",
      description: "Halaman profil yang bisa dibagikan ke brand",
      accent:      "bg-blue-50 text-blue-600",
      cta:         "Lihat & share",
    },
    {
      href:        "/portal/profile",
      icon:        User,
      label:       "Profil",
      description: "Lihat dan edit data profil kamu",
      accent:      "bg-zinc-100 text-zinc-600",
      cta:         "Buka profil",
    },
  ]

  return (
    <>
      <PortalNav creator={{ name: session.user.name ?? "", username: creator.username, tier: creator.tier }} />

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* TikTok status banners */}
        {tiktokStatus === "connected" && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-3.5">
            <span className="text-lg">✓</span>
            <p className="text-sm font-medium text-green-800">TikTok berhasil terhubung! Data kamu sudah diimport.</p>
          </div>
        )}
        {tiktokStatus === "error" && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5">
            <span className="text-lg">⚠</span>
            <p className="text-sm font-medium text-red-800">Gagal menghubungkan TikTok. Coba lagi.</p>
          </div>
        )}

        {/* Connect TikTok nudge (only if TikTok platform, not yet connected) */}
        {creator.platform === "tiktok" && !tiktokAccount && (
          <Link
            href="/auth/tiktok"
            className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white text-lg shrink-0">𝕋</div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Hubungkan TikTok kamu</p>
                <p className="text-xs text-zinc-400">Auto-import followers, stats & videos ke portfolio</p>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-zinc-300" />
          </Link>
        )}

        {/* TikTok connected status card */}
        {tiktokAccount && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white text-lg shrink-0">𝕋</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900">@{tiktokAccount.username ?? tiktokAccount.displayName}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {(tiktokAccount.followerCount / 1000).toFixed(1)}K followers · terakhir sync {tiktokAccount.lastSyncAt ? new Date(tiktokAccount.lastSyncAt).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-600">Connected</span>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {firstName}.</h1>
          <p className="mt-1 text-sm text-zinc-500">Selamat datang di Creator Portal kamu</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Follower",     value: formatFollower(creator.followerCount) },
            { label: "Platform",     value: creator.platform.charAt(0).toUpperCase() + creator.platform.slice(1) },
            { label: "Niche",        value: creator.niche.split(" ")[0] },
            { label: "Tier",         value: creator.tier.charAt(0).toUpperCase() + creator.tier.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-zinc-200/80 bg-white p-4">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="mt-1 text-lg font-bold text-zinc-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Creator Identity hero CTA */}
        <Link
          href="/portal/studio"
          className="group mb-4 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 shadow-lg shadow-violet-200 transition hover:opacity-95"
        >
          <div>
            <p className="text-lg font-bold text-white">Your Creator Identity is ready.</p>
            <p className="mt-0.5 text-sm text-violet-200">View Digital Passport →</p>
          </div>
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles size={18} className="text-white" />
          </div>
        </Link>

        {/* Secondary actions */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Lainnya</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(({ href, icon: Icon, label, description, accent, cta }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{label}</p>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-violet-600">
                {cta} <ChevronRight size={12} className="transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
