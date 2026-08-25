"use server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export type RemoveSocialAccountResult = { success: true } | { success: false; error: string }

export async function removeSocialAccountAction(accountId: string): Promise<RemoveSocialAccountResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak valid." }

  const account = await prisma.socialAccount.findUnique({
    where:  { id: accountId },
    select: { creatorId: true, syncType: true, platform: { select: { name: true } } },
  })

  if (!account) return { success: false, error: "Akun tidak ditemukan." }
  if (account.creatorId !== session.user.creatorId) return { success: false, error: "Tidak diizinkan." }
  if (account.syncType === "AUTO") return { success: false, error: `${account.platform.name} tidak bisa dihapus manual — gunakan tombol Disconnect.` }

  await prisma.socialAccount.delete({ where: { id: accountId } })

  revalidatePath("/portal/profile")
  return { success: true }
}
