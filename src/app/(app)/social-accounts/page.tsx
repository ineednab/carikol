import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CreatorCard } from "./_components/CreatorCard"

export const metadata: Metadata = { title: "Verify Social Accounts — CariKOL" }

type StatusFilter = "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "ALL"

const TABS: { label: string; value: StatusFilter }[] = [
  { label: "Pending",  value: "PENDING_REVIEW" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Semua",    value: "ALL" },
]

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function SocialAccountsPage({ searchParams }: Props) {
  const { status: rawStatus } = await searchParams
  const validStatuses: StatusFilter[] = ["PENDING_REVIEW", "VERIFIED", "REJECTED", "ALL"]
  const activeTab: StatusFilter = validStatuses.includes(rawStatus as StatusFilter)
    ? (rawStatus as StatusFilter)
    : "PENDING_REVIEW"

  const [stats, accounts] = await Promise.all([
    prisma.socialAccount.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.socialAccount.findMany({
      where: activeTab !== "ALL" ? { status: activeTab } : undefined,
      include: {
        platform: { select: { id: true, name: true } },
        creator: {
          select: {
            id: true,
            name: true,
            contact: true,
            createdAt: true,
            userAccount: { select: { email: true } },
          },
        },
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1,
          select: { followerCount: true, engagementRate: true, capturedAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ])

  // Group accounts by creator
  const byCreator = new Map<string, { creator: typeof accounts[0]["creator"]; accounts: typeof accounts }>()
  for (const account of accounts) {
    const existing = byCreator.get(account.creator.id)
    if (existing) {
      existing.accounts.push(account)
    } else {
      byCreator.set(account.creator.id, { creator: account.creator, accounts: [account] })
    }
  }
  const groups = Array.from(byCreator.values())

  const countByStatus = Object.fromEntries(stats.map(s => [s.status, s._count.id]))

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-zinc-400" />
          <h1 className="text-lg font-bold text-zinc-900">Verify Social Accounts</h1>
        </div>
        <p className="mt-0.5 text-xs text-zinc-400">
          Verifikasi akun social creator sebelum muncul di discovery.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",  status: "PENDING_REVIEW", color: "text-amber-600"  },
          { label: "Verified", status: "VERIFIED",       color: "text-emerald-600" },
          { label: "Rejected", status: "REJECTED",       color: "text-red-500"    },
        ].map(s => (
          <div key={s.status} className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{countByStatus[s.status] ?? 0}</p>
            <p className="text-[11px] text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-zinc-200/70 bg-white p-1">
        {TABS.map(tab => {
          const isActive = tab.value === activeTab
          return (
            <Link
              key={tab.value}
              href={`/social-accounts?status=${tab.value}`}
              className={`flex-1 rounded-lg py-1.5 text-center text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && (countByStatus[tab.value] ?? 0) > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {countByStatus[tab.value]}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Creator groups */}
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/60 bg-white py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">
            {activeTab === "PENDING_REVIEW" ? "Tidak ada akun yang menunggu verifikasi." : "Tidak ada data."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(({ creator, accounts: creatorAccounts }) => (
            <CreatorCard
              key={creator.id}
              creator={{
                name: creator.name,
                contact: creator.contact,
                userAccount: creator.userAccount,
                submittedAt: creator.createdAt.toISOString(),
              }}
              accounts={creatorAccounts.map(a => ({
                id: a.id,
                username: a.username,
                displayName: a.displayName,
                avatarUrl: a.avatarUrl,
                profileUrl: a.profileUrl,
                status: a.status,
                reviewNote: a.reviewNote,
                platform: { id: a.platform.id, name: a.platform.name },
                snapshot: a.snapshots[0] ? {
                  followerCount:  a.snapshots[0].followerCount,
                  engagementRate: a.snapshots[0].engagementRate ? Number(a.snapshots[0].engagementRate) : null,
                  capturedAt:     a.snapshots[0].capturedAt.toISOString(),
                } : null,
              }))}
            />
          ))}
        </div>
      )}

    </div>
  )
}
