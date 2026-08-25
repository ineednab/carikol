"use server"
import { z } from "zod"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/session"

const socialSchema = z.object({
  platformId: z.string().min(1, "Pilih platform"),
  profileUrl: z
    .string()
    .trim()
    .min(1, "Link wajib diisi")
    // Terima paste tanpa skema ("tiktok.com/@me") — normalkan ke https lebih dulu.
    .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
    .pipe(z.string().url("Link tidak valid")),
})

const TALENT_TYPES = ["CREATOR", "KOL", "AFFILIATE", "OTHER"] as const

const schema = z
  .object({
    name:         z.string().min(2, "Nama minimal 2 karakter"),
    bio:          z.string().trim().max(200, "Bio maksimal 200 karakter").optional(),
    categories:   z.array(z.string().min(1)).min(1, "Pilih minimal satu kategori").max(5, "Maksimal 5 kategori"),
    province:     z.string().trim().max(60).optional(),
    city:         z.string().trim().max(60).optional(),
    contact:      z.string().trim().min(5, "Nomor WhatsApp wajib diisi"),
    talentTypes:  z.array(z.enum(TALENT_TYPES)).min(1, "Pilih minimal satu tipe talent").max(TALENT_TYPES.length),
    socials:      z.array(socialSchema).min(2, "Submit minimal 2 akun social").max(6, "Maksimal 6 akun"),
    agreeTos:     z.literal(true, { message: "Kamu harus menyetujui Syarat & Kebijakan Privasi" }),
  })
  .refine((d) => new Set(d.socials.map((s) => s.platformId)).size === d.socials.length, {
    message: "Pilih platform berbeda untuk tiap akun",
    path: ["socials"],
  })

export type OnboardingInput = z.infer<typeof schema>
export type OnboardingFieldErrors = Partial<Record<keyof OnboardingInput | "_root", string>>
export type OnboardingResult =
  | { success: true }
  | { success: false; errors: OnboardingFieldErrors }

// MVP link-submission: admin memverifikasi & scrape belakangan, jadi username
// belum tentu ada. Ambil best-effort dari URL supaya kolom terisi manusiawi.
function deriveUsername(url: string): string {
  try {
    const u = new URL(url)
    const seg = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname
    return (seg.replace(/^@/, "").slice(0, 60) || u.hostname).slice(0, 60)
  } catch {
    return url.slice(0, 60)
  }
}

export async function onboardingAction(data: OnboardingInput): Promise<OnboardingResult> {
  const authUser = await getAuthUser()
  if (!authUser?.email) return { success: false, errors: { _root: "Sesi tidak valid, silakan login ulang." } }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: OnboardingFieldErrors = {}
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k as keyof OnboardingInput] = v?.[0]
    }
    // form-level refine errors land in formErrors, not fieldErrors
    const formErr = parsed.error.flatten().formErrors[0]
    if (formErr && !fieldErrors.socials) fieldErrors.socials = formErr
    return { success: false, errors: fieldErrors }
  }

  const { name, bio, categories, province, city, contact, talentTypes, socials } = parsed.data

  const cookieStore = await cookies()
  const tiktokRaw = cookieStore.get("tiktok_onboarding_profile")?.value
  type TikTokProfile = { openId: string; username: string; displayName: string; avatarUrl: string | null; profileUrl: string; followerCount: number }
  let tiktokOAuth: TikTokProfile | null = null
  if (tiktokRaw) { try { tiktokOAuth = JSON.parse(tiktokRaw) } catch {} }

  let dbUser = await prisma.user.findUnique({ where: { email: authUser.email } })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: { email: authUser.email, name, role: "talent" },
    })
  }

  if (dbUser.creatorId) return { success: true }

  // Guard against stale/tampered platformId before the FK-backed nested create.
  const validPlatformIds = new Set(
    (await prisma.platform.findMany({ select: { id: true } })).map((p) => p.id),
  )
  if (socials.some((s) => !validPlatformIds.has(s.platformId))) {
    return { success: false, errors: { socials: "Platform tidak dikenal, muat ulang halaman." } }
  }

  const now = new Date()

  try {
    const creator = await prisma.creator.create({
      data: {
        name,
        bio: bio || null,
        province: province || null,
        city: city || null,
        contact,
        talentTypes,
        tosAcceptedAt: now,
        categories: { create: categories.map((category) => ({ category })) },
        socialAccounts: {
          create: socials.map((s) => {
            if (s.platformId === "tiktok" && tiktokOAuth) {
              return {
                platformId:  "tiktok",
                profileUrl:  tiktokOAuth.profileUrl,
                username:    tiktokOAuth.username,
                displayName: tiktokOAuth.displayName,
                avatarUrl:   tiktokOAuth.avatarUrl,
                syncType:    "AUTO",
                status:      "VERIFIED",
                verifiedAt:  now,
                connectedAt: now,
              }
            }
            return {
              platformId: s.platformId,
              profileUrl: s.profileUrl,
              username:   deriveUsername(s.profileUrl),
              syncType:   "NONE",
              status:     "PENDING_REVIEW",
            }
          }),
        },
      },
      include: { socialAccounts: { select: { id: true, platformId: true } } },
    })

    await prisma.user.update({
      where: { id: dbUser.id },
      data:  { name, creatorId: creator.id },
    })

    // Create a snapshot for the TikTok OAuth account so follower count is immediately visible
    if (tiktokOAuth && tiktokOAuth.followerCount > 0) {
      const tiktokAccount = creator.socialAccounts.find(a => a.platformId === "tiktok")
      if (tiktokAccount) {
        await prisma.socialSnapshot.create({
          data: {
            accountId:     tiktokAccount.id,
            followerCount: tiktokOAuth.followerCount,
            capturedBy:    "AUTO",
          },
        })
      }
    }

    cookieStore.delete("tiktok_onboarding_profile")
  } catch {
    return { success: false, errors: { _root: "Gagal menyimpan profil. Coba lagi sebentar." } }
  }

  return { success: true }
}
