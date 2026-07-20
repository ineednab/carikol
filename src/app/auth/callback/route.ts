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
      let dbUser = await prisma.user.findUnique({
        where: { email: data.user.email! },
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: data.user.email!,
            name: data.user.user_metadata?.full_name ?? data.user.email!.split("@")[0],
            role: "talent",
          },
        })
      }

      if (dbUser.role !== "talent") {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      // New talent without creator profile → onboarding
      const destination = dbUser.creatorId ? "/portal" : "/portal/onboarding"
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
