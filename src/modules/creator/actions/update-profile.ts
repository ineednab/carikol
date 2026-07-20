"use server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const schema = z.object({
  city:    z.string().min(2, "Kota wajib diisi"),
  contact: z.string().min(5, "Kontak wajib diisi"),
  niche:   z.string().min(2, "Pilih minimal satu niche"),
})

export type UpdateProfileInput = z.infer<typeof schema>
export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string }

export async function updateProfileAction(data: UpdateProfileInput): Promise<UpdateProfileResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak valid." }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

  await prisma.creator.update({
    where: { id: session.user.creatorId },
    data: {
      city:    parsed.data.city,
      contact: parsed.data.contact,
      niche:   parsed.data.niche,
    },
  })

  return { success: true }
}
