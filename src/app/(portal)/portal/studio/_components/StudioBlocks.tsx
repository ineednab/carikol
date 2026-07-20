"use client"
import { Activity, BarChart2, Layers, TrendingUp, Sparkles, CreditCard, Zap } from "lucide-react"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-zinc-400">
      <Icon size={13} />
      <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  )
}

function EvidenceTag({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
      {text}
    </span>
  )
}

interface Props { data: AIStudioResult }

export function StudioBlocks({ data }: Props) {
  const { facts, ai } = data
  const f = facts

  return (
    <div className="space-y-4">

      {/* Card 1 — Creator Snapshot (pure data) */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <SectionHeader icon={BarChart2} label="Creator Snapshot" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Followers",       value: fmt(f.profile.followers) },
            { label: "Videos (90 days)", value: f.activity.videos90d.toString() },
            { label: "Avg Views",        value: fmt(f.performance.avgViews) },
            { label: "Posts / Week",     value: f.activity.postingFreqPerWeek.toString() },
            { label: "Engagement",       value: `${f.performance.avgEngagement}%` },
            { label: "Active Weeks",     value: `${f.activity.activeWeeks90d} / ${f.activity.totalWeeks}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{label}</p>
              <p className="mt-1 text-xl font-bold text-zinc-900">{value}</p>
            </div>
          ))}
        </div>
        {f.dataQuality.insufficient && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Only {f.dataQuality.videosAnalyzed} videos analyzed — more data improves accuracy.
          </p>
        )}
      </div>

      {/* Card 2 — Creator Activity */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <SectionHeader icon={Activity} label="Creator Activity" />
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${Math.round((f.activity.activeWeeks90d / f.activity.totalWeeks) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-zinc-700 capitalize">
            {f.activity.activityLevel.replace("_", " ")}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {f.activity.evidence.map((e) => <EvidenceTag key={e} text={e} />)}
        </div>
        {ai.activitySummary && (
          <p className="mt-3 text-sm text-zinc-600 border-t border-zinc-100 pt-3">{ai.activitySummary}</p>
        )}
      </div>

      {/* Card 3 — Content Distribution */}
      {f.content.categories.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <SectionHeader icon={Layers} label="Content Distribution" />
          <div className="space-y-2.5">
            {f.content.categories.slice(0, 5).map(({ name, pct }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-zinc-700">{name}</span>
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-medium text-zinc-400">{pct}%</span>
              </div>
            ))}
          </div>
          {ai.contentSummary && (
            <p className="mt-3 text-sm text-zinc-600 border-t border-zinc-100 pt-3">{ai.contentSummary}</p>
          )}
        </div>
      )}

      {/* Card 4 — Performance */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <SectionHeader icon={TrendingUp} label="Performance" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-xl bg-violet-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-violet-400">Top 5 Avg</p>
            <p className="mt-1 text-xl font-bold text-violet-900">
              {f.performance.top5AvgViews ? fmt(f.performance.top5AvgViews) : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Overall Avg</p>
            <p className="mt-1 text-xl font-bold text-zinc-900">{fmt(f.performance.avgViews)}</p>
          </div>
        </div>
        {f.performance.performanceRatio && (
          <p className="text-xs text-zinc-500">
            Top content outperforms average by <span className="font-semibold text-zinc-700">{f.performance.performanceRatio}×</span>
          </p>
        )}
        {ai.performanceSummary && (
          <p className="mt-3 text-sm text-zinc-600 border-t border-zinc-100 pt-3">{ai.performanceSummary}</p>
        )}
      </div>

      {/* Card 5 — Brand Fit (deterministic) */}
      {f.brandFit.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <SectionHeader icon={TrendingUp} label="Brand Fit" />
          <div className="space-y-3">
            {f.brandFit.map(({ category, score, reason }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-800">{category}</span>
                  <span className="text-xs font-bold text-zinc-700">{score}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${score}%` }} />
                </div>
                <p className="mt-0.5 text-[10px] text-zinc-400">{reason}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-zinc-400 border-t border-zinc-100 pt-2">
            Score = content category % × 2 + engagement bonus. No AI inference.
          </p>
        </div>
      )}

      {/* Card 6 — AI Rate Card */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <SectionHeader icon={CreditCard} label="Creator Pricing" />
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900">
            {formatIDR(f.rateCard.basePriceMin)}
          </span>
          <span className="text-zinc-400">–</span>
          <span className="text-2xl font-bold text-zinc-900">
            {formatIDR(f.rateCard.basePriceMax)}
          </span>
          <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 capitalize">
            {f.rateCard.confidence} confidence
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {f.rateCard.factors.map((factor) => <EvidenceTag key={factor} text={factor} />)}
        </div>
        {ai.rateCardExplanation && (
          <p className="text-sm text-zinc-600 border-t border-zinc-100 pt-3">{ai.rateCardExplanation}</p>
        )}
        <p className="mt-2 text-[10px] text-zinc-400">
          Range based on avg views × CPV benchmark for {f.profile.tier} tier. Not historical transaction data.
        </p>
      </div>

      {/* Card 7 — AI Observations */}
      {ai.observations.length > 0 && (
        <div className="rounded-2xl bg-[#1B1B2E] p-6 text-white">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">AI Observations</span>
          </div>
          <div className="space-y-4">
            {ai.observations.map((obs, i) => (
              <div key={i} className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-zinc-200">{obs.text}</p>
                <p className="mt-2 text-[10px] text-zinc-500">Evidence: {obs.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 8 — Strengths & Opportunities */}
      {(ai.strengths.length > 0 || ai.opportunities.length > 0) && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <SectionHeader icon={Zap} label="Strengths & Opportunities" />
          <div className="space-y-4">
            {ai.strengths.length > 0 && (
              <div className="space-y-2">
                {ai.strengths.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">{s.label}</p>
                      <p className="text-xs text-emerald-600">{s.evidence}</p>
                    </div>
                    <span className="shrink-0 text-emerald-400">✓</span>
                  </div>
                ))}
              </div>
            )}
            {ai.opportunities.length > 0 && (
              <div className="space-y-2">
                {ai.opportunities.map((o, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <p className="text-sm text-zinc-700">{o.label}</p>
                    <span className="text-zinc-300">○</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
