"use server"
import { createClient } from "@/lib/supabase/server"

export async function updateDemographicAction(email: string, demographic: string): Promise<void> {
  if (!email || !demographic) return
  try {
    const supabase = await createClient()
    await supabase
      .from("waitlist")
      .update({
        demographic,
        completed_at: new Date().toISOString(),
      })
      .eq("email", email)
  } catch {
    // best-effort, silently ignore
  }
}
