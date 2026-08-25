"use server"
import { getSession }          from "@/lib/session"
import { prisma }              from "@/lib/prisma"
import { scrapeThreadsCreator } from "@/lib/threads"
import { toSnapshotInput }      from "@/lib/threads/snapshot"

export type ResyncResult =
  | { success: true;  followerDiff: number }
  | { success: false; error: string }

// Sync Threads via scraper zero-login (bukan OAuth). Tulis SocialSnapshot dgn
// rawJson.videos berbentuk RawVideo → langsung dibaca Platform Intel yang ada.
export async function resyncThreadsAccountAction(accountId: string): Promise<ResyncResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak ditemukan." }

  const account = await prisma.socialAccount.findFirst({
    where: {
      id:         accountId,
      platformId: "threads",
      creatorId:  session.user.creatorId,
    },
  })
  if (!account) return { success: false, error: "Akun tidak ditemukan." }

  if (account.lastSyncAt && account.nextSyncAt && account.nextSyncAt > new Date()) {
    const hoursLeft = Math.ceil((account.nextSyncAt.getTime() - Date.now()) / (1000 * 60 * 60))
    return { success: false, error: `Refresh tersedia dalam ${hoursLeft} jam.` }
  }

  try {
    const creator = await scrapeThreadsCreator(account.username)
    const snap    = toSnapshotInput(creator)

    const latestSnapshot = await prisma.socialSnapshot.findFirst({
      where:   { accountId: account.id },
      orderBy: { capturedAt: "desc" },
    })
    const prevFollowers = latestSnapshot?.followerCount ?? 0

    const nowDate      = new Date()
    const nextSyncDate = new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    await prisma.socialSnapshot.create({
      data: {
        accountId:      account.id,
        followerCount:  snap.followerCount,
        followingCount: snap.followingCount,
        postCount:      snap.postCount,
        engagementRate: snap.engagementRate,
        capturedBy:     "MANUAL",
        rawJson:        snap.rawJson,
      },
    })

    await prisma.socialAccount.update({
      where: { id: account.id },
      data:  { lastSyncAt: nowDate, nextSyncAt: nextSyncDate },
    })

    return { success: true, followerDiff: snap.followerCount - prevFollowers }
  } catch (err) {
    console.error("[Resync Threads Account]", err)
    return { success: false, error: "Gagal sync Threads. Coba lagi." }
  }
}
