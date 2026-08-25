"use server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

const schema = z.object({
  platformId:    z.string().min(1),
  username:      z.string().min(1, "Username wajib diisi").max(100),
  followerCount: z.number().int().min(0),
  followingCount: z.number().int().min(0).optional(),
  postCount:     z.number().int().min(0).optional(),
})

export type AddSocialAccountResult = { success: true } | { success: false; error: string }

export async function addSocialAccountAction(
  data: z.infer<typeof schema>
): Promise<AddSocialAccountResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak valid." }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

  const { platformId, username, followerCount, followingCount, postCount } = parsed.data

  const platform = await prisma.platform.findUnique({ where: { id: platformId } })
  if (!platform) return { success: false, error: "Platform tidak valid." }
  if (platform.supportsLogin) return { success: false, error: "Platform ini pakai koneksi OAuth, bukan manual." }

  const existing = await prisma.socialAccount.findUnique({
    where: { creatorId_platformId: { creatorId: session.user.creatorId, platformId } },
  })
  if (existing) return { success: false, error: `${platform.name} sudah ditambahkan.` }

  const account = await prisma.socialAccount.create({
    data: {
      creatorId: session.user.creatorId,
      platformId,
      username:  username.replace(/^@/, ""),
      syncType:  "MANUAL",
    },
  })

  await prisma.socialSnapshot.create({
    data: {
      accountId:     account.id,
      followerCount,
      followingCount: followingCount ?? null,
      postCount:      postCount ?? null,
      capturedBy:    "MANUAL",
    },
  })

  revalidatePath("/portal/profile")
  return { success: true }
}
