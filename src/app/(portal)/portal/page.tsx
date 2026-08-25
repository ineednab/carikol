import { redirect }    from "next/navigation"
import Link           from "next/link"
import { getSession } from "@/lib/session"
import { prisma }     from "@/lib/prisma"
import { PortalShell } from "@/components/portal/PortalShell"
import {
  BarChart2, TrendingUp,
  Users, ChevronRight, Check, Circle,
} from "lucide-react"
import { fmt } from "@/lib/format"

export const metadata = { title: "Portal — CariKOL" }

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tiktok?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.user.creatorId) redirect("/portal/onboarding")

  const { tiktok: tiktokStatus } = await searchParams

  const creator = await prisma.creator.findUnique({
    where:   { id: session.user.creatorId },
    include: {
      categories:    true,
      socialAccounts: {
        include: {
          platform:  true,
          snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!creator) redirect("/portal/onboarding")

  const firstName    = session.user.name?.split(" ")[0] ?? "Creator"
  const tiktokAcct   = creator.socialAccounts.find(a => a.platformId === "tiktok") ?? null
  const latestSnap   = tiktokAcct?.snapshots[0] ?? null
  const followerCount = latestSnap?.followerCount ?? 0
  const catLabel      = creator.categories.map(c => c.category).join(", ")

  const profilePct = [
    !!tiktokAcct,
    !!creator.city,
    creator.categories.length > 0,
  ].filter(Boolean).length * 33

  const nextSteps: Array<{ href: string; icon: string; title: string; sub: string }> = []
  if (!tiktokAcct)
    nextSteps.push({ href: "/auth/tiktok?mode=connect",    icon: "🔗", title: "Hubungkan TikTok",  sub: "Impor statistik dan video otomatis" })
  if (!creator.city)
    nextSteps.push({ href: "/portal/profile", icon: "📍", title: "Tambah Kota",       sub: "Brand sering mencari creator lokal" })
  if (creator.categories.length === 0)
    nextSteps.push({ href: "/portal/profile", icon: "🏷️", title: "Tambah Kategori",  sub: "Bantu brand menemukan kamu" })
  const topSteps = nextSteps.slice(0, 3)

  return (
    <PortalShell user={{ name: session.user.name, email: creator.contact }}>
      <div className="mx-auto max-w-5xl px-5 py-6 space-y-5">

        {tiktokStatus === "connected" && (
          <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-3">
            <span>&#x2713;</span>
            <p className="text-sm font-medium text-green-800">TikTok berhasil terhubung. Data berhasil diimpor.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_300px]">

          <div className="space-y-5">

            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Hai, {firstName}!</h1>
              <p className="mt-0.5 text-sm text-zinc-400">
                {tiktokAcct ? "Ini ringkasan profil creator kamu." : "Yuk mulai setup profil creator kamu."}
              </p>
            </div>

            {!tiktokAcct && (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 px-8 py-10 text-center">
                <div className="mb-3 text-3xl">&#x2756;</div>
                <h2 className="mb-1 font-semibold text-zinc-700">Profil kamu belum aktif</h2>
                <p className="mx-auto mb-5 max-w-xs text-sm text-zinc-400">
                  Hubungkan TikTok untuk mengimpor performa kamu.
                </p>
                <Link
                  href="/auth/tiktok"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Hubungkan TikTok &rarr;
                </Link>
              </div>
            )}

            {profilePct < 100 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-zinc-900">
                  Selesaikan setup profilmu
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                    {profilePct}%
                  </span>
                </p>
                <div className="space-y-3">
                  <StepItem done={!!tiktokAcct} num={1} title="Hubungkan TikTok" sub="Impor follower dan statistik" href="/auth/tiktok" cta="Hubungkan" active={!tiktokAcct} />
                  <StepItem done={!!creator.city} num={2} title="Tambah kota" sub="Brand mencarimu berdasarkan lokasi" href="/portal/profile" cta="Edit Profil" active={!!tiktokAcct && !creator.city} />
                  <StepItem done={creator.categories.length > 0} num={3} title="Pilih kategori" sub="Bantu brand menemukanmu" href="/portal/profile" cta="Edit Profil" active={!!creator.city && creator.categories.length === 0} />
                </div>
              </div>
            )}

            {tiktokAcct && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard icon={<Users size={12} className="text-zinc-400" />} label="Followers" value={fmt(followerCount)} />
                <StatCard icon={<BarChart2 size={12} className="text-zinc-400" />} label="Kategori" value={creator.categories.length > 0 ? creator.categories.length.toString() : "—"} sub={catLabel || null} />
                <StatCard icon={<TrendingUp size={12} className="text-violet-400" />} label="Akun Sosial" value={creator.socialAccounts.length.toString()} />
              </div>
            )}

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Aksi Cepat</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { href: "/portal/studio",  icon: "&#x2728;", title: "Creator Identity", sub: "Laporan AI lengkap"   },
                  { href: "/portal/profile", icon: "&#x1F464;", title: "Edit Profil",      sub: `${profilePct}% lengkap` },
                  { href: "/auth/tiktok?mode=connect",    icon: "&#x1D54B;", title: "TikTok",          sub: tiktokAcct ? "Terhubung" : "Belum terhubung" },
                  { href: "/portal/profile", icon: "&#x1F3F7;", title: "Kategori",        sub: catLabel || "Belum diset" },
                ].map(({ href, icon, title, sub }) => (
                  <Link
                    key={href + title}
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200/60 bg-white p-4 text-center transition hover:border-zinc-300"
                  >
                    <span className="text-xl" dangerouslySetInnerHTML={{ __html: icon }} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{title}</p>
                      <p className="text-[10px] text-zinc-400">{sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">

            {tiktokAcct ? (
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white text-sm">&#x1D54B;</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">@{tiktokAcct.username}</p>
                  <p className="text-xs text-zinc-400">{fmt(followerCount)} followers</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  &#x2713; Tersambung
                </span>
              </div>
            ) : (
              <Link
                href="/auth/tiktok"
                className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-zinc-300"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-500 text-sm">&#x1D54B;</div>
                  <div>
                    <p className="font-semibold text-zinc-900">Hubungkan TikTok</p>
                    <p className="mt-0.5 text-xs text-zinc-400">Impor statistik dan video kamu</p>
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-zinc-300" />
              </Link>
            )}

            {creator.socialAccounts.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Akun Social Kamu</p>
                <div className="space-y-2.5">
                  {creator.socialAccounts.map(acct => (
                    <div key={acct.id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-800">{acct.platform.name}</p>
                        {acct.profileUrl && (
                          <a
                            href={acct.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-[11px] text-zinc-400 hover:text-violet-600 hover:underline"
                          >
                            {acct.profileUrl.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {acct.status === "REJECTED" && acct.reviewNote && (
                          <p className="mt-0.5 text-[11px] text-red-500">{acct.reviewNote}</p>
                        )}
                      </div>
                      <SocialStatusBadge status={acct.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Langkah Selanjutnya</p>
              {topSteps.length === 0 ? (
                <p className="text-xs text-zinc-400">Profil kamu sudah lengkap!</p>
              ) : (
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
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Kelengkapan Profil</p>
                <span className="text-sm font-bold text-zinc-900">{profilePct}%</span>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all ${profilePct >= 80 ? "bg-emerald-400" : profilePct >= 50 ? "bg-violet-500" : "bg-amber-400"}`}
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <div className="space-y-2.5">
                <CompletionItem done={!!tiktokAcct}              label="TikTok terhubung"    points={33} />
                <CompletionItem done={!!creator.city}            label="Kota ditambahkan"     points={33} />
                <CompletionItem done={creator.categories.length > 0} label="Kategori dipilih" points={34} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </PortalShell>
  )
}

function SocialStatusBadge({ status }: { status: "PENDING_REVIEW" | "VERIFIED" | "REJECTED" }) {
  const map = {
    PENDING_REVIEW: { label: "Menunggu verifikasi", cls: "bg-amber-50 text-amber-600" },
    VERIFIED:       { label: "Terverifikasi",        cls: "bg-emerald-50 text-emerald-600" },
    REJECTED:       { label: "Ditolak",              cls: "bg-red-50 text-red-600" },
  }[status]
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${map.cls}`}>
      {map.label}
    </span>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string | null }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-4">
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      </div>
      <p className="text-xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="mt-1 text-[10px] text-zinc-400 truncate">{sub}</p>}
    </div>
  )
}

function StepItem({ done, num, title, sub, href, cta, active }: {
  done: boolean; num: number; title: string; sub: string
  href: string; cta: string; active: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${active ? "bg-violet-50 border border-violet-200" : done ? "bg-zinc-50" : "bg-zinc-50 opacity-50"}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-100 text-emerald-600" : active ? "bg-violet-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
        {done ? <Check size={13} strokeWidth={3} /> : num}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? "text-zinc-400 line-through" : "text-zinc-800"}`}>{title}</p>
        {!done && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      {active && (
        <Link href={href} className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700">
          {cta} &rarr;
        </Link>
      )}
    </div>
  )
}

function CompletionItem({ done, label, points }: { done: boolean; label: string; points: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
        {done ? <Check size={10} strokeWidth={3} /> : <Circle size={7} strokeWidth={2.5} />}
      </span>
      <span className={`flex-1 text-xs ${done ? "text-zinc-400 line-through" : "text-zinc-700"}`}>{label}</span>
      <span className="text-[10px] text-zinc-400">+{points}</span>
    </div>
  )
}
