import { redirect }    from "next/navigation"
import Link           from "next/link"
import { getSession } from "@/lib/session"
import { prisma }     from "@/lib/prisma"
import { PortalNav }  from "@/components/portal/PortalNav"
import { DisconnectTikTok } from "@/components/portal/DisconnectTikTok"
import { SyncButton }       from "@/components/portal/SyncButton"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"
import type { TikTokVideo }   from "@/lib/creator-facts"
import {
  Sparkles, Globe, User, BarChart2, TrendingUp,
  Users, ChevronRight, ArrowRight, Star, Play,
} from "lucide-react"

export const metadata = { title: "Portal — CariKOL" }

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)    return "baru saja"
  if (s < 3600)  return `${Math.floor(s / 60)}m lalu`
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`
  return `${Math.floor(s / 86400)}h lalu`
}

function dateShort(date: Date): string {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n)
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function avgArr(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

function completeness(opts: {
  hasTikTok: boolean; hasAI: boolean; hasNotes: boolean; hasCity: boolean
}): number {
  return (opts.hasTikTok ? 30 : 0) + (opts.hasAI ? 40 : 0) +
         (opts.hasNotes ? 15 : 0)  + (opts.hasCity ? 15 : 0)
}

function creatorScore(opts: {
  profilePct:     number
  avgEngagement:  number
  activityLevel:  string | null
  hasAI:          boolean
  videosAnalyzed: number
}): number {
  const profileScore   = Math.round(opts.profilePct * 0.35)
  const engScore       = opts.avgEngagement >= 5 ? 35 : opts.avgEngagement >= 3 ? 25 : opts.avgEngagement >= 1 ? 15 : 5
  const activityScore  = opts.activityLevel === "very_active" ? 20
                       : opts.activityLevel === "active"      ? 15
                       : opts.activityLevel === "moderate"    ?  8 : 2
  const dataScore      = opts.videosAnalyzed >= 15 ? 10 : opts.videosAnalyzed >= 7 ? 6 : opts.videosAnalyzed > 0 ? 3 : 0
  return Math.min(Math.round(profileScore + engScore + activityScore + dataScore), 100)
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const aiResult  = creator.aiInsight
    ? (() => {
        try {
          const parsed = JSON.parse(creator.aiInsight!) as AIStudioResult
          // Validate new format shape — old stored data won't have facts.activity or ai
          if (!parsed?.facts?.activity || !parsed?.ai?.observations) return null
          return parsed
        } catch { return null }
      })()
    : null

  const profilePct = completeness({
    hasTikTok: !!tiktokAccount,
    hasAI:     !!aiResult,
    hasNotes:  !!creator.notes,
    hasCity:   !!creator.city,
  })

  // ── Compute view delta from raw video data (last 30d vs prev 30d) ──────────
  const rawVideos = Array.isArray(tiktokAccount?.videosJson)
    ? (tiktokAccount!.videosJson as unknown as TikTokVideo[])
    : []
  const NOW_S     = Math.floor(Date.now() / 1000)
  const DAY_S     = 86_400
  const recent30  = rawVideos.filter(v => v.create_time >= NOW_S - 30 * DAY_S)
  const prev30    = rawVideos.filter(v => v.create_time >= NOW_S - 60 * DAY_S && v.create_time < NOW_S - 30 * DAY_S)
  const recentAvg = avgArr(recent30.map(v => v.view_count))
  const prevAvg   = avgArr(prev30.map(v => v.view_count))
  const viewDelta = recent30.length > 0 && prev30.length > 0 && prevAvg > 0
    ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100)
    : null

  // ── Derived metrics ────────────────────────────────────────────────────────
  const activityLevel  = aiResult?.facts.activity.activityLevel ?? null
  const avgViews       = aiResult?.facts.performance.avgViews ?? 0
  const avgEngagement  = aiResult?.facts.performance.avgEngagement ?? 0
  const videos90d      = aiResult?.facts.activity.videos90d ?? 0
  const freqPerWeek    = aiResult?.facts.activity.postingFreqPerWeek ?? 0
  const rateMin        = aiResult?.facts.rateCard.basePriceMin ?? creator.typicalRateMin
  const rateMax        = aiResult?.facts.rateCard.basePriceMax ?? creator.typicalRateMax
  const lastSync       = tiktokAccount?.lastSyncAt ? new Date(tiktokAccount.lastSyncAt) : null
  const topCategories  = aiResult?.facts.content.categories.slice(0, 3) ?? []
  const isConsistent   = freqPerWeek >= 1.5

  const score = creatorScore({
    profilePct,
    avgEngagement,
    activityLevel,
    hasAI:          !!aiResult,
    videosAnalyzed: aiResult?.facts.dataQuality.videosAnalyzed ?? 0,
  })

  // ── AI Insight cards (strength / opportunity / observation) ───────────────
  const insightCards = [
    aiResult?.ai.strengths[0] ? {
      title:       aiResult.ai.strengths[0].label,
      body:        aiResult.ai.strengths[0].evidence,
      badge:       "Positif",
      badgeClass:  "bg-emerald-100 text-emerald-700",
    } : null,
    aiResult?.ai.opportunities[0] ? {
      title:       aiResult.ai.opportunities[0].label,
      body:        "Gap terdeteksi dari analisis konten kamu.",
      badge:       "Opportunity",
      badgeClass:  "bg-amber-100 text-amber-700",
    } : null,
    aiResult?.ai.observations[0] ? {
      title:       "Insight",
      body:        aiResult.ai.observations[0].text,
      badge:       "Tips",
      badgeClass:  "bg-blue-100 text-blue-700",
    } : null,
  ].filter(Boolean) as Array<{ title: string; body: string; badge: string; badgeClass: string }>

  // ── Next steps (sidebar, max 3) ────────────────────────────────────────────
  const nextSteps: Array<{ href: string; icon: string; title: string; sub: string }> = []
  if (!tiktokAccount)
    nextSteps.push({ href: "/auth/tiktok",    icon: "🔗", title: "Hubungkan TikTok",            sub: "Impor statistik dan video otomatis" })
  if (tiktokAccount && !aiResult)
    nextSteps.push({ href: "/portal/studio",  icon: "✨", title: "Generate Creator Intelligence", sub: "Analisis video kamu dengan AI · ~15 detik" })
  if (!creator.notes)
    nextSteps.push({ href: "/portal/profile", icon: "📝", title: "Lengkapi Bio",                 sub: "Ceritakan dirimu kepada brand" })
  if (!creator.city)
    nextSteps.push({ href: "/portal/profile", icon: "📍", title: "Tambah Kota",                  sub: "Brand sering mencari creator lokal" })
  nextSteps.push(  { href: `/k/${creator.username}`, icon: "📤", title: "Bagikan Media Kit",     sub: "Media kit kamu siap dibagikan ke brand" })
  const topSteps = nextSteps.slice(0, 3)

  return (
    <>
      <PortalNav creator={{ name: session.user.name ?? "", username: creator.username, tier: creator.tier }} />

      <main className="mx-auto max-w-5xl px-5 py-6 space-y-5">

        {/* Flash banners */}
        {tiktokStatus === "connected" && (
          <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-3">
            <span>✓</span>
            <p className="text-sm font-medium text-green-800">TikTok berhasil terhubung. Data berhasil diimpor.</p>
          </div>
        )}
        {tiktokStatus === "error" && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-3">
            <span>⚠</span>
            <p className="text-sm font-medium text-red-800">Koneksi TikTok gagal. Coba lagi.</p>
          </div>
        )}

        {/* ── Top row: AI banner + TikTok status ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          {/* AI Intelligence banner */}
          {aiResult ? (
            <Link
              href="/portal/studio"
              className="flex items-center justify-between gap-4 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 transition hover:border-violet-300 hover:bg-violet-100/80"
            >
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-0.5 shrink-0 text-violet-500" />
                <div>
                  <p className="font-semibold text-violet-900">Creator Intelligence terbaru siap!</p>
                  <p className="mt-0.5 text-xs text-violet-500">
                    Updated {timeAgo(new Date(aiResult.generatedAt))}
                    {aiResult.facts.dataQuality.videosAnalyzed > 0 &&
                      ` · ${aiResult.facts.dataQuality.videosAnalyzed} videos analyzed`}
                  </p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-violet-600">
                Lihat Laporan <ArrowRight size={14} />
              </span>
            </Link>
          ) : tiktokAccount ? (
            <Link
              href="/portal/studio"
              className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 px-5 py-4 transition hover:bg-violet-50"
            >
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-0.5 shrink-0 text-violet-400" />
                <div>
                  <p className="font-semibold text-zinc-700">Generate Creator Intelligence</p>
                  <p className="mt-0.5 text-xs text-zinc-400">Analisis video kamu dengan AI · ~15 detik</p>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-zinc-300" />
            </Link>
          ) : (
            <Link
              href="/auth/tiktok"
              className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-zinc-300"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white text-sm">𝕋</div>
                <div>
                  <p className="font-semibold text-zinc-900">Hubungkan TikTok</p>
                  <p className="mt-0.5 text-xs text-zinc-400">Impor statistik dan video kamu</p>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-zinc-300" />
            </Link>
          )}

          {/* TikTok account status */}
          {tiktokAccount ? (
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white text-sm">𝕋</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">@{tiktokAccount.username ?? tiktokAccount.displayName}</p>
                <p className="text-xs text-zinc-400">{fmt(tiktokAccount.followerCount)} followers</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  ✓ Tersambung
                </span>
                <SyncButton lastSyncAt={lastSync} />
                <DisconnectTikTok creatorId={session.user.creatorId!} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-500 text-sm">𝕋</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-500">TikTok belum terhubung</p>
                <p className="text-xs text-zinc-400">Hubungkan untuk mengimpor data</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_300px]">

          {/* ── Main column ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {firstName}! 👋</h1>
              <p className="mt-0.5 text-sm text-zinc-400">
                {lastSync
                  ? "Ini ringkasan performa kamu selama 90 hari terakhir."
                  : "Yuk mulai setup profil creator kamu."}
              </p>
            </div>

            {/* Onboarding checklist — shown until profile is 100% complete */}
            {profilePct < 100 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-zinc-900">
                  Selesaikan setup profilmu
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                    {profilePct}%
                  </span>
                </p>
                <div className="space-y-3">
                  {/* Step 1 */}
                  <OnboardingStep
                    done={!!tiktokAccount}
                    num={1}
                    title="Hubungkan TikTok"
                    sub="Impor follower, video, dan statistik kamu"
                    href="/auth/tiktok"
                    cta="Hubungkan"
                    active={!tiktokAccount}
                  />
                  {/* Step 2 */}
                  <OnboardingStep
                    done={!!aiResult}
                    num={2}
                    title="Generate Creator Intelligence"
                    sub="AI analisis video kamu → rate card + insights · ~15 detik"
                    href="/portal/studio"
                    cta="Generate"
                    active={!!tiktokAccount && !aiResult}
                  />
                  {/* Step 3 */}
                  <OnboardingStep
                    done={!!creator.notes && !!creator.city}
                    num={3}
                    title="Lengkapi profil"
                    sub="Tambah bio dan kota — brand mencarimu berdasarkan ini"
                    href="/portal/profile"
                    cta="Lengkapi"
                    active={!!aiResult && (!creator.notes || !creator.city)}
                  />
                </div>
              </div>
            )}

            {/* 5 Stat cards */}
            {(tiktokAccount || aiResult) && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                <StatCard
                  icon={<Users size={12} className="text-zinc-400" />}
                  label="Followers"
                  value={fmt(tiktokAccount?.followerCount ?? creator.followerCount)}
                />

                <StatCard
                  icon={<BarChart2 size={12} className="text-zinc-400" />}
                  label="Views Rata-rata"
                  value={avgViews > 0 ? fmt(avgViews) : "—"}
                  sub={
                    viewDelta !== null
                      ? <span className={`text-xs font-medium ${viewDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {viewDelta >= 0 ? "↑" : "↓"}{Math.abs(viewDelta)}% vs 30h lalu
                        </span>
                      : avgViews > 0
                      ? <span className="text-[10px] text-zinc-400">per video</span>
                      : null
                  }
                />

                <StatCard
                  icon={<TrendingUp size={12} className="text-violet-400" />}
                  label="Engagement Rate"
                  value={avgEngagement > 0 ? `${avgEngagement}%` : "—"}
                  sub={avgEngagement > 0
                    ? <span className="text-[10px] text-zinc-400">likes + komentar + share</span>
                    : null}
                />

                <StatCard
                  icon={<Play size={12} className="text-zinc-400" />}
                  label="Video Diposting"
                  value={videos90d > 0 ? videos90d.toString() : "—"}
                  sub={freqPerWeek > 0
                    ? <span className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400">{freqPerWeek}/minggu</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          isConsistent ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {isConsistent ? "Konsisten" : "Moderat"}
                        </span>
                      </span>
                    : null}
                />

                <StatCard
                  icon={<Star size={12} className="text-amber-400" />}
                  label="Creator Score"
                  value={<>{score}<span className="text-sm font-normal text-zinc-400">/100</span></>}
                  sub={<span className="text-[10px] text-zinc-400">
                    {score >= 80 ? "Sangat kuat" : score >= 60 ? "Kuat" : score >= 40 ? "Berkembang" : "Lengkapi profil"}
                  </span>}
                />
              </div>
            )}

            {/* AI Insights */}
            {insightCards.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-violet-500" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                      AI Insights untuk Kamu
                    </span>
                  </div>
                  <Link href="/portal/studio" className="text-xs font-medium text-violet-500 hover:text-violet-700">
                    Lihat semua insight →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {insightCards.map((card, i) => (
                    <div key={i} className="rounded-xl bg-zinc-50 p-4">
                      <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                      <p className="mb-1 text-sm font-semibold text-zinc-800">{card.title}</p>
                      <p className="text-xs leading-relaxed text-zinc-500">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Topics (replaces Niche) */}
            {topCategories.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Primary Topics</p>
                <div className="space-y-2.5">
                  {topCategories.map(({ name, pct }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-sm text-zinc-700">{name}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-violet-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs font-medium text-zinc-400">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Card */}
            {rateMin && rateMax && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-white p-5">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Estimasi Rate Kamu · TikTok Video Dedicated
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-zinc-900">{formatIDR(Number(rateMin))}</span>
                    <span className="text-zinc-400">–</span>
                    <span className="text-2xl font-bold text-zinc-900">{formatIDR(Number(rateMax))}</span>
                  </div>
                  {aiResult?.facts.rateCard.confidence && (
                    <p className="mt-1 text-xs text-zinc-400">
                      Confidence:{" "}
                      <span className="font-medium capitalize text-zinc-600">
                        {aiResult.facts.rateCard.confidence}
                      </span>{" "}
                      · Berdasarkan performa dan profil kamu.
                    </p>
                  )}
                </div>
                <Link
                  href="/portal/studio"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Lihat Detail <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Aksi Cepat</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { href: "/portal/studio",       icon: "✨",  title: "Lihat Creator Intelligence", sub: "Laporan AI lengkap"     },
                  { href: "/portal/rate-card",     icon: "💰",  title: "Edit Rate Card",             sub: "Kelola harga kamu"     },
                  { href: `/k/${creator.username}`,icon: "🌐",  title: "Buka Media Kit",             sub: "Lihat & bagikan"       },
                  { href: "/portal/profile",       icon: "👤",  title: "Edit Profil",                sub: `${profilePct}% lengkap` },
                ].map(({ href, icon, title, sub }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200/60 bg-white p-4 text-center transition hover:border-zinc-300"
                  >
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{title}</p>
                      <p className="text-[10px] text-zinc-400">{sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Next Steps */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Langkah Selanjutnya</p>
              <div className="space-y-3">
                {topSteps.map((step, i) => (
                  <Link
                    key={i}
                    href={step.href}
                    className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 transition hover:bg-zinc-100"
                  >
                    <span className="mt-0.5 shrink-0 text-lg">{step.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-zinc-500">{step.sub}</p>
                    </div>
                    <ChevronRight size={14} className="mt-1 shrink-0 text-zinc-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Kelengkapan Profil</p>
                <span className="text-sm font-bold text-zinc-900">{profilePct}%</span>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    profilePct >= 80 ? "bg-emerald-400" : profilePct >= 50 ? "bg-violet-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <div className="space-y-2.5">
                <CompletionItem done={!!tiktokAccount}   label="TikTok terhubung"                 points={30} />
                <CompletionItem done={!!aiResult}        label="Creator Intelligence generated"    points={40} />
                <CompletionItem done={!!creator.notes}   label="Bio ditambahkan"                  points={15} />
                <CompletionItem done={!!creator.city}    label="Kota ditambahkan"                 points={15} />
              </div>
              {profilePct < 100 && (
                <p className="mt-3 text-[10px] text-zinc-400">
                  Selesaikan {[!tiktokAccount, !aiResult, !creator.notes, !creator.city].filter(Boolean).length} langkah lagi untuk 100%
                </p>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub,
}: {
  icon:   React.ReactNode
  label:  string
  value:  React.ReactNode
  sub?:   React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-4">
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      </div>
      <p className="text-xl font-bold text-zinc-900">{value}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  )
}

function OnboardingStep({
  done, num, title, sub, href, cta, active,
}: {
  done: boolean; num: number; title: string; sub: string
  href: string; cta: string; active: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
      active ? "bg-violet-50 border border-violet-200" : done ? "bg-zinc-50" : "bg-zinc-50 opacity-50"
    }`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        done ? "bg-emerald-100 text-emerald-600" : active ? "bg-violet-500 text-white" : "bg-zinc-200 text-zinc-400"
      }`}>
        {done ? "✓" : num}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? "text-zinc-400 line-through" : "text-zinc-800"}`}>{title}</p>
        {!done && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      {active && (
        <Link
          href={href}
          className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
        >
          {cta} →
        </Link>
      )}
    </div>
  )
}

function CompletionItem({ done, label, points }: { done: boolean; label: string; points: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
        done ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400"
      }`}>
        {done ? "✓" : "○"}
      </span>
      <span className={`flex-1 text-xs ${done ? "text-zinc-400 line-through" : "text-zinc-700"}`}>{label}</span>
      <span className="text-[10px] text-zinc-400">+{points}</span>
    </div>
  )
}
