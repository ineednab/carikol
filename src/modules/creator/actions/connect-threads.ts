"use server"
import { z }                    from "zod"
import { prisma }               from "@/lib/prisma"
import { getSession }           from "@/lib/session"
import { revalidatePath }       from "next/cache"
import { scrapeThreadsCreator } from "@/lib/threads"
import { toSnapshotInput }      from "@/lib/threads/snapshot"

const schema = z.object({ username: z.string().min(1, "Username wajib diisi").max(100) })

export type ConnectThreadsResult = { success: true } | { success: false; error: string }

// Tambah akun Threads TANPA input manual: scrape → buat SocialAccount + snapshot pertama.
export async function connectThreadsAccountAction(
  data: z.infer<typeof schema>,
): Promise<ConnectThreadsResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak valid." }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

  const username = parsed.data.username.replace(/^@/, "")

  const existing = await prisma.socialAccount.findUnique({
    where: { creatorId_platformId: { creatorId: session.user.creatorId, platformId: "threads" } },
  })
  if (existing) return { success: false, error: "Threads sudah ditambahkan." }

  let snap
  try {
    snap = toSnapshotInput(await scrapeThreadsCreator(username))
  } catch (err) {
    console.error("[Connect Threads]", err)
    return { success: false, error: "Gagal ambil data Threads. Cek username-nya." }
  }

  const nextSyncDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const account = await prisma.socialAccount.create({
    data: {
      creatorId:  session.user.creatorId,
      platformId: "threads",
      username,
      syncType:   "MANUAL",
      lastSyncAt: new Date(),
      nextSyncAt: nextSyncDate,
    },
  })

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

  revalidatePath("/portal/profile")
  return { success: true }
}
