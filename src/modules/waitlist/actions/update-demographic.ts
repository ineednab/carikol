"use server"
import { createClient } from "@/lib/supabase/server"

export async function updateDemographicAction(email: string, demographic: string): Promise<void> {
  if (!email || !demographic) return
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const requesterEmail = user?.email?.trim().toLowerCase()
    const targetEmail = email.trim().toLowerCase()

    // Guard against IDOR: users can only update their own row.
    if (!requesterEmail || requesterEmail !== targetEmail) return

    await supabase
      .from("waitlist")
      .update({
        demographic,
        completed_at: new Date().toISOString(),
      })
      .eq("email", targetEmail)
  } catch {
    // best-effort, silently ignore
  }
}
