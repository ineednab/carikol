"use client"
import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { resyncTikTokAction } from "@/modules/creator/actions/resync-tiktok"
import { useRouter } from "next/navigation"

interface Props {
  lastSyncAt: Date | null
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)    return "baru saja"
  if (s < 3600)  return `${Math.floor(s / 60)}m lalu`
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`
  return `${Math.floor(s / 86400)}h lalu`
}

export function SyncButton({ lastSyncAt }: Props) {
  const router = useRouter()
  const [loading,  setLoading]  = useState(false)
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setFeedback(null)

    const result = await resyncTikTokAction()

    if (!result.success) {
      setFeedback({ type: "err", msg: result.error })
      setLoading(false)
      return
    }

    const parts: string[] = []
    if (result.newVideos > 0) parts.push(`${result.newVideos} video baru`)
    else parts.push("Data terbaru")
    if (result.followerDiff > 0) parts.push(`+${result.followerDiff} followers`)
    if (result.aiUpdated)        parts.push("AI diperbarui")
    setFeedback({ type: "ok", msg: `✓ ${parts.join(" · ")}` })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {feedback && (
        <span className={`text-xs font-medium ${feedback.type === "ok" ? "text-emerald-600" : "text-red-500"}`}>
          {feedback.msg}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
      >
        <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
        {loading ? "Syncing…" : lastSyncAt ? `Sync · ${timeAgo(lastSyncAt)}` : "Sync"}
      </button>
    </div>
  )
}
