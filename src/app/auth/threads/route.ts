import { NextResponse } from "next/server"

const THREADS_AUTH_URL = "https://threads.com/oauth/authorize"
const SCOPES = ["threads_basic", "threads_manage_insights"]

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
  const clientId = process.env.THREADS_APP_ID
  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/portal/profile?threads=missing_config`)
  }

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/auth/threads/callback`,
    scope: SCOPES.join(","),
    response_type: "code",
    state,
  })

  const response = NextResponse.redirect(`${THREADS_AUTH_URL}?${params}`)
  response.cookies.set("threads_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}
