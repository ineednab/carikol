"use client"
import { Users, TrendingUp, Star, Sparkles, Lightbulb, CreditCard } from "lucide-react"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < score ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}
        />
      ))}
    </div>
  )
}

interface Props {
  data: AIStudioResult
}

export function StudioBlocks({ data }: Props) {
  return (
    <div className="space-y-4">

      {/* Block 1: AI Creator Summary */}
      <div className="rounded-2xl bg-[#1B1B2E] p-6 text-white">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={13} className="text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">AI Creator Summary</span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-200">{data.summary}</p>
      </div>

      {/* Block 2: Audience Insight */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <div className="mb-2 flex items-center gap-2 text-zinc-400">
          <Users size={13} />
          <span className="text-xs font-semibold uppercase tracking-widest">Audience Insight</span>
        </div>
        <p className="text-sm text-zinc-700">{data.audienceInsight}</p>
      </div>

      {/* Block 3: Brand Fit */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <div className="mb-4 flex items-center gap-2 text-zinc-400">
          <TrendingUp size={13} />
          <span className="text-xs font-semibold uppercase tracking-widest">AI Brand Fit</span>
        </div>
        <div className="space-y-3">
          {data.brandFit.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-700">{item.category}</span>
              <StarRating score={item.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Block 4: Rate Card */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <div className="mb-1 flex items-center gap-2 text-zinc-400">
          <CreditCard size={13} />
          <span className="text-xs font-semibold uppercase tracking-widest">AI Rate Card</span>
        </div>
        <p className="mb-4 text-xs font-medium text-violet-600">{data.rateCard.positioning}</p>
        <div className="space-y-3">
          {data.rateCard.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900">{item.type}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                  {item.reasons?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {item.reasons.map((r, ri) => (
                        <span key={ri} className="text-[11px] text-zinc-400">
                          <span className="text-green-500">✓</span> {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="shrink-0 text-base font-bold text-zinc-900">{formatIDR(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block 5: Creator Strength */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
        <div className="mb-4 flex items-center gap-2 text-zinc-400">
          <Lightbulb size={13} />
          <span className="text-xs font-semibold uppercase tracking-widest">Creator Strength</span>
        </div>

        <div className="space-y-4">
          {data.strengths.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-green-600">Kekuatan</p>
              <div className="space-y-1.5">
                {data.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-0.5 text-green-500">✓</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.weaknesses.length > 0 && (
            <div className="border-t border-zinc-100 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-600">Area untuk Ditingkatkan</p>
              <div className="space-y-1.5">
                {data.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-0.5 text-amber-500">△</span>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.tips.length > 0 && (
            <div className="border-t border-zinc-100 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600">Tips Meningkatkan Value</p>
              <div className="space-y-1.5">
                {data.tips.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="mt-0.5 text-violet-500">→</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
