"use server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const schema = z.object({
  creatorId:  z.string().uuid(),
  content:    z.string().min(1, "Catatan tidak boleh kosong").max(2000),
  visibility: z.enum(["PRIVATE", "TEAM"]).optional(),
})

export type AddInternalNoteResult = { success: true } | { success: false; error: string }

export async function addInternalNoteAction(data: {
  creatorId:  string
  content:    string
  visibility?: "PRIVATE" | "TEAM"
}): Promise<AddInternalNoteResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Tidak diizinkan." }
  if (session.user.role === "talent") return { success: false, error: "Tidak diizinkan." }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return { success: false, error: "User tidak ditemukan." }

  await prisma.internalNote.create({
    data: {
      creatorId:  parsed.data.creatorId,
      content:    parsed.data.content.trim(),
      authorId:   dbUser.id,
      visibility: parsed.data.visibility ?? "TEAM",
    },
  })

  return { success: true }
}
