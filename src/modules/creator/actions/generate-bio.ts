"use server"
import { z } from "zod"
import { generateJSON } from "@/lib/ai/client"
import { buildBioPrompt } from "@/lib/ai/prompts/creator-bio"

const TALENT_TYPES = ["CREATOR", "UGC", "KOL", "AFFILIATE", "TALENT", "OTHER"] as const
const TIERS = ["BUZZER", "NANO", "MIKRO", "MAKRO"] as const

const schema = z.object({
  talentTypes: z.array(z.enum(TALENT_TYPES)).min(1),
  categories:  z.array(z.string().min(1)).min(1),
  tier:        z.enum(TIERS).optional(),
})

export type GenerateBioInput = z.infer<typeof schema>
export type GenerateBioResult =
  | { success: true; bio: string }
  | { success: false; error: string }

const BIO_MAX = 200

export async function generateBioAction(input: GenerateBioInput): Promise<GenerateBioResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Pilih tipe talent & kategori dulu." }

  const prompt = buildBioPrompt(parsed.data)
  // deepseek-v4-pro menghabiskan reasoning tokens dulu — beri budget besar agar JSON tidak terpotong.
  const result = await generateJSON<{ bio: string }>(prompt, 8192)

  const bio = result?.bio?.trim()
  if (!bio) return { success: false, error: "Gagal generate bio. Coba lagi sebentar." }

  return { success: true, bio: bio.slice(0, BIO_MAX) }
}
