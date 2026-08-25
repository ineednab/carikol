"use client"
import { useState } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { generateAIStudioAction, type AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"
import { StudioBlocks } from "./StudioBlocks"

interface Props {
  initialData: AIStudioResult | null
}

export function AIStudio({ initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<AIStudioResult | null>(initialData)
  const [error, setError]     = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    const res = await generateAIStudioAction()
    if (res.success) {
      setResult(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
          <Sparkles size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Build Your Creator Identity</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          AI akan menganalisa profil kamu — summary, brand fit, rate card, dan creator intelligence report lengkap.
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}
        <button
          onClick={generate}
          disabled={loading}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <><RefreshCw size={15} className="animate-spin" /> AI sedang menganalisa...</>
          ) : (
            <><Sparkles size={15} /> Build Creator Identity</>
          )}
        </button>
        {loading && (
          <p className="mt-4 text-xs text-zinc-400">Membutuhkan sekitar 15 detik...</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <StudioBlocks data={result} />
      <div className="flex gap-3 pt-2">
        <button
          onClick={generate}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Generate ulang"}
        </button>
      </div>
    </div>
  )
}
