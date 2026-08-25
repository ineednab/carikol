import Link from "next/link"
import { MapPin, CheckCircle } from "lucide-react"
import { fmt } from "@/lib/format"

const PLATFORM_COLOR: Record<string, string> = {
  tiktok:    "bg-zinc-900 text-white",
  instagram: "bg-gradient-to-r from-pink-500 to-violet-500 text-white",
  youtube:   "bg-red-600 text-white",
  threads:   "bg-zinc-800 text-white",
  linkedin:  "bg-blue-700 text-white",
  other:     "bg-zinc-200 text-zinc-700",
}

type ListCreator = {
  id:       string
  name:     string
  city:     string | null
  contact:  string
  isActive: boolean
  categories:     { category: string }[]
  socialAccounts: {
    platform:  { id: string; name: string }
    username:  string
    snapshots: { followerCount: number; capturedAt: Date }[]
  }[]
  applications:   { status: string; campaignId: string }[]
  outcomeReviews: { wouldWorkAgain: string }[]
}

export function CreatorListRow({ creator: c }: { creator: ListCreator }) {
  const initials    = c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const primary     = c.socialAccounts[0] ?? null
  const latestSnap  = primary?.snapshots[0] ?? null
  const catLabel    = c.categories.map(x => x.category).join(" · ")
  const totalApps   = c.applications.length
  const selectedApps = c.applications.filter(a =>
    ["SELECTED","CONTENT_SUBMITTED","CONTENT_APPROVED","COMPLETED"].includes(a.status)
  ).length
  const wyaYes = c.outcomeReviews.filter(r => r.wouldWorkAgain === "yes").length
  const avatarClass = primary ? (PLATFORM_COLOR[primary.platform.id] ?? PLATFORM_COLOR.other) : "bg-zinc-200 text-zinc-700"

  return (
    <Link
      href={`/creators/${c.id}`}
      className="flex items-center gap-4 border-b border-zinc-100 px-5 py-3.5 transition hover:bg-zinc-50 last:border-0"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${avatarClass}`}>
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">{c.name}</p>
        {c.city && (
          <p className="flex items-center gap-0.5 truncate text-[10px] text-zinc-400">
            <MapPin size={9} />{c.city}
          </p>
        )}
      </div>

      <div className="hidden w-32 min-w-0 sm:block">
        <p className="truncate text-[11px] text-zinc-600">{catLabel || "—"}</p>
      </div>

      <div className="hidden w-36 min-w-0 sm:block">
        {primary ? (
          <>
            <p className="truncate text-[11px] font-medium text-zinc-800">
              {primary.platform.name} · @{primary.username}
            </p>
            {latestSnap && (
              <p className="text-[10px] text-zinc-400">{fmt(latestSnap.followerCount)} followers</p>
            )}
          </>
        ) : (
          <p className="text-[11px] text-zinc-400">—</p>
        )}
      </div>

      <div className="hidden w-24 text-right sm:block">
        {latestSnap ? (
          <p className="text-sm font-bold text-zinc-800">{fmt(latestSnap.followerCount)}</p>
        ) : (
          <p className="text-[11px] text-zinc-400">—</p>
        )}
      </div>

      <div className="hidden w-20 flex-col items-end sm:flex">
        <p className="text-sm font-bold text-zinc-800">{selectedApps}/{totalApps}</p>
        <p className="text-[10px] text-zinc-400">dipilih</p>
        {wyaYes > 0 && (
          <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-emerald-600">
            <CheckCircle size={9} />{wyaYes} lagi
          </p>
        )}
      </div>
    </Link>
  )
}
