import { MapPin, Phone, CheckCircle2, AlertCircle } from "lucide-react"
import { fmt, formatIDR } from "@/lib/format"
import dayjs from "dayjs"

const PILL: Record<string, string> = {
  tiktok:    "bg-zinc-900 text-white",
  instagram: "bg-gradient-to-r from-pink-500 to-violet-500 text-white",
  youtube:   "bg-red-600 text-white",
  threads:   "bg-zinc-700 text-white",
  linkedin:  "bg-blue-700 text-white",
  other:     "bg-zinc-100 text-zinc-600",
}

interface Account {
  id:          string
  platformId:  string
  username:    string
  syncType:    string
  lastSyncAt:  Date | null
  platform:    { name: string }
  snapshots:   { followerCount: number; capturedAt: Date }[]
}

interface Props {
  name:          string
  city:          string | null
  contact:       string
  isActive:      boolean
  acceptsBarter: boolean
  minimumFee:    unknown  // Decimal from Prisma — toString() to use
  feeNotes:      string | null
  categories:    { category: string }[]
  socialAccounts: Account[]
}

export function IdentitySection({
  name, city, contact, isActive, acceptsBarter, minimumFee, feeNotes, categories, socialAccounts,
}: Props) {
  const minFeeNum = minimumFee ? Number(minimumFee.toString()) : null

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      {/* Name + status */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{name}</h1>
          {city && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-400">
              <MapPin size={12} /> {city}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
          {isActive ? "Aktif" : "Tidak Aktif"}
        </span>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map(c => (
            <span key={c.category} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
              {c.category}
            </span>
          ))}
        </div>
      )}

      {/* Contact + commercial */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-50 pt-4">
        <a href={`tel:${contact}`} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900">
          <Phone size={11} /> {contact}
        </a>
        <span className={`flex items-center gap-1 text-xs font-semibold ${acceptsBarter ? "text-emerald-600" : "text-zinc-400"}`}>
          {acceptsBarter
            ? <><CheckCircle2 size={11} /> Nerima barter</>
            : <><AlertCircle   size={11} /> Tidak nerima barter</>}
        </span>
        {minFeeNum && (
          <span className="text-xs text-zinc-500">
            Min fee <span className="font-semibold text-zinc-800">{formatIDR(minFeeNum)}</span>
          </span>
        )}
        {feeNotes && (
          <span className="text-xs italic text-zinc-400">&ldquo;{feeNotes}&rdquo;</span>
        )}
      </div>

      {/* Connected platforms */}
      {socialAccounts.length > 0 && (
        <div className="mt-4 border-t border-zinc-50 pt-4">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Platform Terhubung</p>
          <div className="flex flex-wrap gap-2">
            {socialAccounts.map(a => {
              const snap = a.snapshots[0]
              return (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${PILL[a.platformId] ?? PILL.other}`}>
                    {a.platform.name}
                  </span>
                  <span className="text-xs text-zinc-600">@{a.username}</span>
                  {snap && (
                    <span className="text-xs font-semibold text-zinc-800">{fmt(snap.followerCount)}</span>
                  )}
                  {a.lastSyncAt && (
                    <span className="text-[10px] text-zinc-400">
                      {dayjs(a.lastSyncAt).format("D MMM")}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
