"use client"
import { useState } from "react"
import Link from "next/link"
import { Sparkles, RefreshCw, Target, Users, Clock, TrendingUp, ChevronRight, Check } from "lucide-react"
import { generateCampaignPlanAction, type PlannerResult } from "@/modules/campaign/actions/generate-plan"

const PLATFORMS = [
  { value: "tiktok",    label: "TikTok",    emoji: "🎵" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "youtube",   label: "YouTube",   emoji: "▶️" },
]

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}
function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function PlannerForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlannerResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const data = await generateCampaignPlanAction(new FormData(e.currentTarget))
    if (data.success) {
      setResult(data.data)
    } else {
      setError(data.error)
    }
    setLoading(false)
  }

  if (result) {
    const { plan, creators } = result
    return (
      <div className="space-y-4">
        {/* Plan header */}
        <div className="rounded-2xl bg-[#1B1B2E] p-6 text-white">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Campaign Plan</span>
          </div>
          <p className="text-lg font-semibold">{plan.objective}</p>
          <p className="mt-2 text-sm text-zinc-400">{plan.brief}</p>
        </div>

        {/* Details grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <Users size={14} />
              <span className="text-xs font-semibold uppercase tracking-widest">Creator yang Ideal</span>
            </div>
            <p className="text-sm text-zinc-800">{plan.creatorType}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <Clock size={14} />
              <span className="text-xs font-semibold uppercase tracking-widest">Timeline</span>
            </div>
            <p className="text-sm text-zinc-800">{plan.timeline}</p>
          </div>
        </div>

        {/* Deliverables */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-zinc-400">
            <Target size={14} />
            <span className="text-xs font-semibold uppercase tracking-widest">Deliverables</span>
          </div>
          <div className="space-y-2">
            {plan.deliverables.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <Check size={13} className="mt-0.5 shrink-0 text-green-500" />
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Estimated KPI */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-zinc-400">
            <TrendingUp size={14} />
            <span className="text-xs font-semibold uppercase tracking-widest">Estimasi KPI</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Reach",       value: plan.estimatedKPI.reach },
              { label: "Impressions", value: plan.estimatedKPI.impressions },
              { label: "Engagement",  value: plan.estimatedKPI.engagement },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-zinc-50 p-3 text-center">
                <p className="text-sm font-bold text-zinc-900">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Budget Breakdown</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Creator Fee</span>
              <span className="font-semibold text-zinc-900">{plan.budgetBreakdown.creatorFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Produksi Konten</span>
              <span className="font-semibold text-zinc-900">{plan.budgetBreakdown.production}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-violet-600">{plan.budgetBreakdown.note}</p>
        </div>

        {/* Creator matches */}
        {creators.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-violet-500" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Creator Match Terbaik</h2>
            </div>
            <div className="space-y-3">
              {creators.map((c) => (
                <Link
                  key={c.id}
                  href={`/k/${c.username}`}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{c.name}</p>
                      <p className="text-xs text-zinc-400">@{c.username} · {c.niche}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                        <Check size={11} />
                        {c.matchReason}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="mb-1 text-lg font-bold text-violet-600">{c.matchScore}%</div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Match</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatFollower(c.followerCount ?? 0)} followers</p>
                    {c.typicalRateMin && (
                      <p className="text-xs font-medium text-zinc-700">{formatIDR(c.typicalRateMin)}+</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="self-center shrink-0 text-zinc-300 transition group-hover:text-violet-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setResult(null)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          <RefreshCw size={13} />
          Buat Campaign Baru
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 space-y-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {/* Product */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-500">Produk / Bisnis kamu</label>
          <input
            name="product"
            required
            placeholder="contoh: Skincare lokal untuk kulit sensitif"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none"
          />
        </div>

        {/* Target */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-500">Target audience</label>
          <input
            name="target"
            required
            placeholder="contoh: Wanita 18-25 tahun, tertarik skincare"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none"
          />
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-500">Budget campaign (Rp)</label>
          <input
            name="budget"
            required
            type="text"
            placeholder="contoh: 5.000.000"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none"
          />
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-500">Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <label
                key={p.value}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-3 text-xs font-medium text-zinc-700 transition has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 has-[:checked]:text-violet-700"
              >
                <input type="radio" name="platform" value={p.value} className="sr-only" defaultChecked={p.value === "tiktok"} />
                <span className="text-base">{p.emoji}</span>
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {/* Objective (optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-500">
            Tujuan spesifik <span className="font-normal text-zinc-300">(opsional)</span>
          </label>
          <input
            name="objective"
            placeholder="contoh: Meningkatkan penjualan 30%, awareness brand baru"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? (
          <><RefreshCw size={15} className="animate-spin" /> AI sedang menyusun campaign...</>
        ) : (
          <><Sparkles size={15} /> Generate Campaign Plan</>
        )}
      </button>
    </form>
  )
}
