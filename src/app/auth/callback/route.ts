import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const email = data.user.email!
      const fullName = data.user.user_metadata?.full_name ?? email.split("@")[0]

      // Provision the talent User only. The Creator profile is created during
      // onboarding (onboardingAction) — that keeps `creatorId` an honest
      // "onboarding complete" signal for the portal redirect guards below.
      let dbUser = await prisma.user.findUnique({ where: { email } })
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: { email, name: fullName, role: "talent" },
        })
      }

      if (dbUser.role !== "talent") {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      // Onboarding not finished until a Creator profile is linked.
      const destination = dbUser.creatorId ? "/portal" : "/portal/onboarding"
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
