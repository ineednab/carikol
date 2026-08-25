"use server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const schema = z.object({
  name:       z.string().min(2, "Nama minimal 2 karakter"),
  city:       z.string().min(2, "Kota wajib diisi"),
  contact:    z.string().min(5, "Kontak wajib diisi"),
  categories: z.array(z.string().min(1)).min(1, "Pilih minimal satu kategori").max(5, "Maksimal 5 kategori"),
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

  const { name, city, contact, categories } = parsed.data

  await prisma.$transaction([
    prisma.creator.update({
      where: { id: session.user.creatorId },
      data:  { name, city, contact },
    }),
    prisma.creatorCategory.deleteMany({
      where: { creatorId: session.user.creatorId },
    }),
    prisma.creatorCategory.createMany({
      data: categories.map(cat => ({ creatorId: session.user.creatorId!, category: cat })),
    }),
  ])

  return { success: true }
}
