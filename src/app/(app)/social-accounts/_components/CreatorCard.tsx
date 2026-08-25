"use client"
import { useState, useTransition } from "react"
import { ExternalLink, Check, X, Loader2, RefreshCw, Users } from "lucide-react"
import { verifyAccount, rejectAccount }     from "@/modules/creator/actions/verify-social"
import { fetchAccountSnapshot }             from "@/modules/creator/actions/fetch-account-snapshot"

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-50 text-amber-600 border-amber-200",
  VERIFIED:       "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJECTED:       "bg-red-50 text-red-500 border-red-200",
}
const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Pending",
  VERIFIED:       "Verified",
  REJECTED:       "Rejected",
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

interface Snapshot {
  followerCount:  number
  engagementRate: number | null
  capturedAt:     string
}

interface Account {
  id:          string
  username:    string
  displayName: string | null
  avatarUrl:   string | null
  profileUrl:  string | null
  status:      string
  reviewNote:  string | null
  platform:    { id: string; name: string }
  snapshot:    Snapshot | null
}

interface Props {
  creator: {
    name:        string
    contact:     string
    userAccount: { email: string } | null
    submittedAt: string
  }
  accounts: Account[]
}

function AccountRow({ account }: { account: Account }) {
  const [pending, startTransition] = useTransition()
  const [rejecting, setRejecting]  = useState(false)
  const [note, setNote]            = useState("")
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleVerify = () => startTransition(() => verifyAccount(account.id))

  const handleReject = () => {
    if (!rejecting) { setRejecting(true); return }
    if (!note.trim()) return
    startTransition(async () => {
      await rejectAccount(account.id, note)
      setRejecting(false)
      setNote("")
    })
  }

  const handleFetch = () => {
    setFetchError(null)
    startTransition(async () => {
      const result = await fetchAccountSnapshot(account.id)
      if (!result.success) setFetchError(result.error)
    })
  }

  const isPending    = account.status === "PENDING_REVIEW"
  const canAutoFetch = account.platform.id === "threads"

  return (
    <div className="py-4 space-y-3">

      {/* Row utama: avatar + info + actions */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="shrink-0">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.displayName ?? account.username}
              className="h-10 w-10 rounded-full object-cover border border-zinc-200"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-zinc-400">
                {account.username.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Platform badge + display name */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 shrink-0">
              {account.platform.name}
            </span>
            <span className="text-sm font-semibold text-zinc-800 truncate">
              {account.displayName ?? `@${account.username}`}
            </span>
            {account.displayName && (
              <span className="text-xs text-zinc-400 truncate">@{account.username}</span>
            )}
          </div>

          {/* Profile link */}
          {account.profileUrl && (
            <a
              href={account.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700 hover:underline w-fit"
            >
              <ExternalLink size={10} />
              {account.profileUrl}
            </a>
          )}

          {/* Snapshot stats */}
          {account.snapshot ? (
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Users size={10} />
                <span className="font-semibold text-zinc-700">{fmtFollowers(account.snapshot.followerCount)}</span> followers
              </span>
              {account.snapshot.engagementRate !== null && (
                <span>ER <span className="font-semibold text-zinc-700">{Number(account.snapshot.engagementRate).toFixed(1)}%</span></span>
              )}
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400">
                Data: {new Date(account.snapshot.capturedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </span>
            </div>
          ) : (
            canAutoFetch && (
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={handleFetch}
                  disabled={pending}
                  className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:border-violet-300 hover:text-violet-600 disabled:opacity-40"
                >
                  {pending ? <Loader2 size={9} className="animate-spin" /> : <RefreshCw size={9} />}
                  Fetch profile
                </button>
                {fetchError && <span className="text-[10px] text-red-400">{fetchError}</span>}
              </div>
            )
          )}
        </div>

        {/* Status + actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[account.status] ?? ""}`}>
            {STATUS_LABEL[account.status] ?? account.status}
          </span>

          {isPending && (
            rejecting ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReject()}
                  placeholder="Alasan reject…"
                  className="h-7 w-36 rounded-lg border border-red-200 bg-red-50 px-2 text-[11px] text-red-700 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-300"
                />
                <button
                  onClick={handleReject}
                  disabled={!note.trim() || pending}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white disabled:opacity-40 hover:bg-red-600"
                >
                  {pending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                </button>
                <button
                  onClick={() => { setRejecting(false); setNote("") }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleVerify}
                  disabled={pending}
                  className="flex h-7 items-center gap-1 rounded-lg bg-emerald-500 px-2.5 text-[11px] font-semibold text-white disabled:opacity-40 hover:bg-emerald-600"
                >
                  {pending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  Verify
                </button>
                <button
                  onClick={handleReject}
                  disabled={pending}
                  className="flex h-7 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 text-[11px] font-semibold text-zinc-500 disabled:opacity-40 hover:border-red-200 hover:text-red-500"
                >
                  <X size={11} />
                  Reject
                </button>
              </div>
            )
          )}

          {/* Review note if rejected */}
          {account.status === "REJECTED" && account.reviewNote && (
            <span className="text-[10px] text-red-400 text-right max-w-[160px]">{account.reviewNote}</span>
          )}
        </div>
      </div>

    </div>
  )
}

export function CreatorCard({ creator, accounts }: Props) {
  const waHref     = `https://wa.me/${creator.contact.replace(/\D/g, "")}`
  const pendingCount = accounts.filter(a => a.status === "PENDING_REVIEW").length

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white overflow-hidden">
      {/* Creator header */}
      <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">{creator.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                WA: {creator.contact}
              </a>
              {creator.userAccount?.email && (
                <a href={`mailto:${creator.userAccount.email}`} className="hover:text-violet-600">
                  {creator.userAccount.email}
                </a>
              )}
              <span className="text-zinc-300">·</span>
              <span>Submit: {new Date(creator.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Accounts list */}
      <div className="divide-y divide-zinc-100 px-5">
        {accounts.map(account => (
          <AccountRow key={account.id} account={account} />
        ))}
      </div>
    </div>
  )
}
