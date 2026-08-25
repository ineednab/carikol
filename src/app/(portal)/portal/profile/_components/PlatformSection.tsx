"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2, CheckCircle, Link2 } from "lucide-react"
import { fmt } from "@/lib/format"
import { addSocialAccountAction } from "@/modules/creator/actions/add-social-account"
import { removeSocialAccountAction } from "@/modules/creator/actions/remove-social-account"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const PILL: Record<string, string> = {
  tiktok:    "bg-zinc-900 text-white",
  instagram: "bg-gradient-to-r from-pink-500 to-violet-500 text-white",
  youtube:   "bg-red-600 text-white",
  threads:   "bg-zinc-800 text-white",
  linkedin:  "bg-blue-700 text-white",
  other:     "bg-zinc-100 text-zinc-700",
}

interface Account {
  id: string
  platformId: string
  username: string
  syncType: string
  lastSyncAt: Date | null
  platform: { id: string; name: string; supportsLogin: boolean }
  snapshots: { followerCount: number; capturedAt: Date }[]
}

interface Platform {
  id: string
  name: string
  supportsLogin: boolean
}

interface Props {
  accounts:  Account[]
  platforms: Platform[]
}

const EMPTY_FORM = { username: "", followerCount: "", followingCount: "", postCount: "" }

export function PlatformSection({ accounts, platforms }: Props) {
  const [adding, setAdding]     = useState<string | null>(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const connectedIds  = new Set(accounts.map(a => a.platformId))
  const availableToAdd = platforms.filter(p => !connectedIds.has(p.id))

  function openAdd(platformId: string, supportsLogin: boolean) {
    if (supportsLogin || platformId === "threads") {
      router.push(platformId === "threads" ? "/auth/threads" : "/auth/tiktok")
      return
    }
    setAdding(platformId)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function handleSave() {
    if (!adding) return
    setError(null)
    startTransition(async () => {
      const result = await addSocialAccountAction({
        platformId:    adding,
        username:      form.username,
        followerCount: parseInt(form.followerCount) || 0,
        followingCount: form.followingCount ? parseInt(form.followingCount) : undefined,
        postCount:      form.postCount      ? parseInt(form.postCount)      : undefined,
      })
      if (result.success) {
        setAdding(null)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeSocialAccountAction(id)
      router.refresh()
    })
  }

  const addingName = platforms.find(p => p.id === adding)?.name ?? ""

  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link2 size={13} className="text-zinc-400" />
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Platform Kamu</p>
      </div>

      {/* Connected accounts */}
      <div className="space-y-2">
        {accounts.length === 0 && (
          <p className="text-sm text-zinc-400">Belum ada platform yang terhubung.</p>
        )}
        {accounts.map(a => {
          const latest = a.snapshots[0]
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${PILL[a.platformId] ?? PILL.other}`}>
                {a.platform.name}
              </span>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-zinc-800">@{a.username}</p>
                <p className="text-[11px] text-zinc-400">
                  {latest ? `${fmt(latest.followerCount)} followers` : "Belum ada data"}
                  {a.lastSyncAt && ` · sync ${dayjs(a.lastSyncAt).fromNow()}`}
                </p>
              </div>

              {a.syncType === "AUTO" ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle size={10} /> Connected
                </span>
              ) : (
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={isPending}
                  title="Hapus akun ini"
                  className="shrink-0 text-zinc-300 transition hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add platform */}
      {availableToAdd.length > 0 && !adding && (
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <p className="mb-2.5 text-xs font-medium text-zinc-500">Tambah Platform</p>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map(p => (
              <button
                key={p.id}
                onClick={() => openAdd(p.id, p.supportsLogin)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-90 ${PILL[p.id] ?? PILL.other}`}
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual entry form */}
      {adding && (
        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-800">Tambah {addingName}</p>
            <button
              onClick={() => { setAdding(null); setError(null) }}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              Batal
            </button>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500">Username</label>
            <input
              type="text"
              placeholder="@username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-violet-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "followerCount",  label: "Followers" },
              { key: "followingCount", label: "Following" },
              { key: "postCount",      label: "Posts / Video" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form[key as keyof typeof EMPTY_FORM]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-violet-400 focus:bg-white"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={isPending || !form.username.trim() || !form.followerCount}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-40"
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : "Simpan"}
          </button>
        </div>
      )}
    </div>
  )
}
