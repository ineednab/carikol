"use client"
import { useState } from "react"
import { BarChart2, AlertCircle } from "lucide-react"
import { fmt } from "@/lib/format"
import type { PlatformIntel, ViewStability, ActivityStatus } from "@/lib/decision-intel"

const PILL: Record<string, string> = {
  tiktok:    "bg-zinc-900 text-white",
  instagram: "bg-gradient-to-r from-pink-500 to-violet-500 text-white",
  youtube:   "bg-red-600 text-white",
  threads:   "bg-zinc-700 text-white",
  linkedin:  "bg-blue-700 text-white",
  other:     "bg-zinc-100 text-zinc-600",
}

const STABILITY_CFG: Record<ViewStability, { cls: string }> = {
  Stable:   { cls: "bg-emerald-50 text-emerald-700" },
  Moderate: { cls: "bg-amber-50 text-amber-700" },
  Volatile: { cls: "bg-red-50 text-red-600" },
}

const ACTIVITY_CFG: Record<ActivityStatus, { cls: string }> = {
  Active:   { cls: "bg-emerald-50 text-emerald-700" },
  Moderate: { cls: "bg-amber-50 text-amber-700" },
  Inactive: { cls: "bg-red-50 text-red-600" },
}

function MetricRow({ label, value, sub, dim = false }: { label: string; value: string; sub?: string; dim?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-2 py-2.5 ${dim ? "opacity-35" : ""}`}>
      <span className="text-xs text-zinc-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-zinc-900">{value}</span>
        {sub && <p className="text-[10px] text-zinc-400">{sub}</p>}
      </div>
    </div>
  )
}

function InsuffBadge({ label }: { label: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 opacity-35">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-400">Insufficient</span>
    </div>
  )
}

function PlatformTab({ account }: { account: PlatformIntel }) {
  const { hasVideoData, insufficient } = account

  if (!hasVideoData || insufficient) {
    return (
      <div className="rounded-xl bg-zinc-50 px-5 py-6 text-center">
        <AlertCircle size={16} className="mx-auto mb-2 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-500">Data performa tidak tersedia</p>
        <p className="mt-1 text-xs text-zinc-400">
          {account.platformId === "tiktok"
            ? insufficient
              ? `Hanya ${account.videosAnalyzed} video tersimpan. Butuh minimal 5.`
              : "Sync TikTok untuk mendapatkan data video."
            : "Platform ini menggunakan input manual — data postingan tidak tersimpan."}
        </p>
      </div>
    )
  }

  const stability = account.viewStability ? STABILITY_CFG[account.viewStability] : null
  const activity  = account.activityStatus ? ACTIVITY_CFG[account.activityStatus] : null

  return (
    <div className="divide-y divide-zinc-50">
      {/* Views */}
      <div className="pb-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Views ({account.videosAnalyzed} video)
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Median",  value: account.medianViews },
            { label: "P10",     value: account.p10Views },
            { label: "P90",     value: account.p90Views },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-50 p-3 text-center">
              <p className="text-[10px] text-zinc-400">{label}</p>
              <p className="mt-0.5 text-lg font-bold text-zinc-900">
                {value !== null ? fmt(value) : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stability + Activity + Engagement */}
      <div className="divide-y divide-zinc-50">
        {stability ? (
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-zinc-500">View Consistency</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">CV {account.viewCV}%</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stability.cls}`}>
                {account.viewStability}
              </span>
            </div>
          </div>
        ) : <InsuffBadge label="View Consistency" />}

        {account.medianEngRate !== null
          ? <MetricRow label="Median Engagement Rate" value={`${account.medianEngRate.toFixed(1)}%`} sub="likes+komentar+share / views" />
          : <InsuffBadge label="Median Engagement Rate" />
        }

        {activity ? (
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-zinc-500">Aktivitas</span>
            <div className="flex items-center gap-2">
              {account.postingFreqPerWeek !== null && (
                <span className="text-[10px] text-zinc-400">{account.postingFreqPerWeek}×/minggu</span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activity.cls}`}>
                {account.activityStatus}
              </span>
            </div>
          </div>
        ) : <InsuffBadge label="Aktivitas Posting" />}

        {account.daysSinceLastPost !== null && (
          <MetricRow
            label="Post Terakhir"
            value={account.daysSinceLastPost === 0 ? "Hari ini" : `${account.daysSinceLastPost} hari lalu`}
          />
        )}
      </div>

      {/* Categories */}
      {account.categoryDist.length > 0 && (
        <div className="pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Kategori Konten</p>
          <div className="space-y-1.5">
            {account.categoryDist.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-violet-400"
                    style={{ width: `${Math.min(c.pct, 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right text-[11px] text-zinc-500">{c.name}</span>
                <span className="w-8 text-right text-[11px] font-semibold text-zinc-700">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand ratio */}
      {account.brandContentPct !== null && (
        <div className="pt-3">
          <MetricRow
            label="Konten Brand"
            value={`${account.brandContentPct}%`}
            sub={`Deteksi otomatis dari ${account.videosAnalyzed} video — belum tentu akurat`}
          />
        </div>
      )}

      {/* Top video */}
      {account.topVideo && (
        <div className="pt-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Video Terbaik</p>
          <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
            <p className="text-xs text-zinc-700 line-clamp-2">{account.topVideo.title}</p>
            <p className="mt-1 text-[11px] font-semibold text-zinc-500">{fmt(account.topVideo.views)} views</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  accounts: PlatformIntel[]
}

export function PlatformIntel({ accounts }: Props) {
  const [active, setActive] = useState(0)
  if (accounts.length === 0) return null

  const current = accounts[active]

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <BarChart2 size={13} className="text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Platform Intelligence</p>
      </div>

      {/* Tabs */}
      {accounts.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {accounts.map((a, i) => (
            <button
              key={a.accountId}
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                i === active
                  ? `${PILL[a.platformId] ?? PILL.other} shadow-sm`
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {a.platformName}
              <span className="opacity-70">@{a.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Current account header */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${PILL[current.platformId] ?? PILL.other}`}>
          {current.platformName}
        </span>
        <span className="text-sm text-zinc-600">@{current.username}</span>
        {current.followerCount !== null && (
          <span className="ml-auto text-sm font-bold text-zinc-900">
            {fmt(current.followerCount)} followers
          </span>
        )}
      </div>

      <PlatformTab account={current} />
    </div>
  )
}
