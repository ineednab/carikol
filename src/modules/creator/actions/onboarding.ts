"use server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/session"

const TIER_FOLLOWER_MAP = {
  nano:  5_000,
  micro: 50_000,
  macro: 500_000,
  mega:  2_000_000,
} as const

const schema = z.object({
  name:         z.string().min(2, "Nama minimal 2 karakter"),
  username:     z.string().min(2, "Username minimal 2 karakter").regex(/^[a-z0-9_.]+$/, "Hanya huruf kecil, angka, titik, underscore"),
  platform:     z.enum(["tiktok", "instagram", "youtube", "other"]),
  followerTier: z.enum(["nano", "micro", "macro", "mega"]),
  niche:        z.string().min(2, "Pilih minimal satu niche"),
  city:         z.string().min(2, "Kota wajib diisi"),
  contact:      z.string().min(5, "Kontak wajib diisi"),
  avatarUrl:    z.string().optional(),
})

export type OnboardingInput = z.infer<typeof schema>
export type OnboardingFieldErrors = Partial<Record<keyof OnboardingInput | "_root", string>>
export type OnboardingResult =
  | { success: true }
  | { success: false; errors: OnboardingFieldErrors }

export async function onboardingAction(data: OnboardingInput): Promise<OnboardingResult> {
  const authUser = await getAuthUser()
  if (!authUser?.email) return { success: false, errors: { _root: "Sesi tidak valid, silakan login ulang." } }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: OnboardingFieldErrors = {}
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k as keyof OnboardingInput] = v?.[0]
    }
    return { success: false, errors: fieldErrors }
  }

  const { name, username, platform, followerTier, niche, city, contact } = parsed.data

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } })
  if (!dbUser) return { success: false, errors: { _root: "User tidak ditemukan." } }
  if (dbUser.creatorId) return { success: true }

  const existingUsername = await prisma.creator.findUnique({ where: { username } })
  if (existingUsername) return { success: false, errors: { username: "Username sudah dipakai, coba yang lain." } }

  const followerCount = TIER_FOLLOWER_MAP[followerTier]

  const creator = await prisma.creator.create({
    data: {
      name,
      username,
      city,
      platform,
      niche,
      followerCount,
      engagementRate: 0,
      contact,
      tier: followerTier,
    },
  })

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { name, creatorId: creator.id },
  })

  return { success: true }
}
