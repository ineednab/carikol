"use client"
import { useState } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { generateRateCardAction, type RateCardResult } from "@/modules/creator/actions/generate-rate-card"

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

export function RateCardGenerator({ creatorName }: { creatorName: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RateCardResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    const res = await generateRateCardAction()
    if (res.success) {
      setResult(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
          <Sparkles size={28} className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Generate Rate Card kamu</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          AI akan analisa profil dan buat rate card yang realistis sesuai pasar Indonesia
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}
        <button
          onClick={generate}
          disabled={loading}
          className="mt-8 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? (
            <><RefreshCw size={15} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={15} /> Generate Rate Card</>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Rate Card</p>
        <h2 className="mt-1 text-xl font-bold text-zinc-900">{creatorName}</h2>
        <p className="mt-1 text-sm font-medium text-violet-600">{result.positioning}</p>
        <p className="mt-2 text-sm text-zinc-500">{result.summary}</p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {result.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900">{item.type}</p>
              <p className="mt-0.5 text-sm text-zinc-500">{item.description}</p>
              {item.notes && (
                <p className="mt-1.5 text-xs text-zinc-400">📌 {item.notes}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold text-zinc-900">{formatIDR(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Regenerate */}
      <button
        onClick={generate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? "Generating..." : "Generate ulang"}
      </button>
    </div>
  )
}
