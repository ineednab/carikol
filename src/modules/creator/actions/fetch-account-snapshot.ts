"use server"
import { revalidatePath }       from "next/cache"
import { prisma }               from "@/lib/prisma"
import { getSession }           from "@/lib/session"
import { scrapeThreadsCreator } from "@/lib/threads"
import { toSnapshotInput }      from "@/lib/threads/snapshot"

export type FetchSnapshotResult =
  | { success: true }
  | { success: false; error: string }

export async function fetchAccountSnapshot(accountId: string): Promise<FetchSnapshotResult> {
  const session = await getSession()
  if (!session || session.user.role === "talent") return { success: false, error: "Unauthorized" }

  const account = await prisma.socialAccount.findUnique({
    where: { id: accountId },
    include: { platform: true },
  })
  if (!account) return { success: false, error: "Akun tidak ditemukan" }

  if (account.platform.id !== "threads") {
    return { success: false, error: `Scrape otomatis belum didukung untuk ${account.platform.name}` }
  }

  try {
    const creator = await scrapeThreadsCreator(account.username)
    const snap    = toSnapshotInput(creator)

    await prisma.$transaction([
      prisma.socialSnapshot.create({
        data: {
          accountId:      account.id,
          followerCount:  snap.followerCount,
          followingCount: snap.followingCount,
          postCount:      snap.postCount,
          engagementRate: snap.engagementRate,
          capturedBy:     "MANUAL",
          rawJson:        snap.rawJson,
        },
      }),
      prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          displayName: creator.profile.displayName,
          avatarUrl:   creator.profile.avatarUrl,
          lastSyncAt:  new Date(),
        },
      }),
    ])

    revalidatePath("/social-accounts")
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal scrape"
    return { success: false, error: msg }
  }
}
