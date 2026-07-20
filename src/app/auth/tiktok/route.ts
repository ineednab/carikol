import { NextResponse, type NextRequest } from "next/server"

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
const SCOPES = ["user.info.basic", "user.info.profile", "user.info.stats", "video.list"]

export async function GET(request: NextRequest) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
  const state   = crypto.randomUUID()

  const params = new URLSearchParams({
    client_key:    process.env.TIKTOK_CLIENT_KEY!,
    scope:         SCOPES.join(","),
    response_type: "code",
    redirect_uri:  `${APP_URL}/auth/tiktok/callback`,
    state,
  })

  const response = NextResponse.redirect(`${TIKTOK_AUTH_URL}?${params}`)
  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600,
    path:     "/",
  })
  return response
}
