"use server"
import { createClient } from "@/lib/supabase/server"

const VALID_TYPES = ["creator", "brand", "agency"] as const
type WaitlistType = typeof VALID_TYPES[number]

export type JoinWaitlistResult =
  | { success: true }
  | { success: false; error: string }

export async function joinWaitlistAction(formData: FormData): Promise<JoinWaitlistResult> {
  const rawEmail    = formData.get("email")?.toString().trim().toLowerCase() ?? ""
  const rawType     = formData.get("type")?.toString().trim() ?? "creator"
  const pain        = formData.get("pain")?.toString().trim() || null
  const workflow    = formData.get("workflow")?.toString().trim() || null
  const demographic = formData.get("demographic")?.toString().trim() || null
  const wish        = formData.get("wish")?.toString().trim() || null

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { success: false, error: "Email tidak valid." }
  }

  if (!VALID_TYPES.includes(rawType as WaitlistType)) {
    return { success: false, error: "Tipe tidak valid." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("waitlist").insert({
    email:        rawEmail,
    type:         rawType,
    pain,
    workflow,
    demographic,
    wish,
    completed_at: new Date().toISOString(),
  })

  if (error) {
    if (error.code === "23505") return { success: false, error: "Email ini sudah terdaftar." }
    return { success: false, error: "Gagal mendaftar. Coba lagi." }
  }

  return { success: true }
}
