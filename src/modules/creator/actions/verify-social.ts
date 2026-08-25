"use server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

async function requireInternalUser() {
  const session = await getSession()
  if (!session || session.user.role === "talent") throw new Error("Unauthorized")
  return session.user
}

export async function verifyAccount(id: string) {
  const user = await requireInternalUser()
  await prisma.socialAccount.update({
    where: { id },
    data: { status: "VERIFIED", verifiedById: user.id, verifiedAt: new Date(), reviewNote: null },
  })
  revalidatePath("/social-accounts")
}

export async function rejectAccount(id: string, note: string) {
  const user = await requireInternalUser()
  if (!note.trim()) throw new Error("Alasan reject wajib diisi")
  await prisma.socialAccount.update({
    where: { id },
    data: { status: "REJECTED", reviewNote: note.trim(), verifiedById: user.id, verifiedAt: new Date() },
  })
  revalidatePath("/social-accounts")
}
