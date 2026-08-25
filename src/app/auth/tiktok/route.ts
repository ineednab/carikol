import { NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
const SCOPES = ["user.info.basic", "user.info.profile", "user.info.stats", "video.list"]

export async function GET(request: Request) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
  const state   = crypto.randomUUID()
  const { searchParams } = new URL(request.url)
  const rawMode = searchParams.get("mode")
  const mode = rawMode === "connect" ? "connect" : rawMode === "onboarding" ? "onboarding" : "login"

  // PKCE — TikTok requires code_challenge (errCode 10007 without it)
  const codeVerifier  = randomBytes(32).toString("base64url")
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url")

  // Encode mode into state so callback can recover it even if cookies fail
  const stateParam = `${state}.${mode}`

  const params = new URLSearchParams({
    client_key:            process.env.TIKTOK_CLIENT_KEY!,
    scope:                 SCOPES.join(","),
    response_type:         "code",
    redirect_uri:          `${APP_URL}/auth/tiktok/callback`,
    state:                 stateParam,
    code_challenge:        codeChallenge,
    code_challenge_method: "S256",
  })

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   600,
    path:     "/",
  }

  const response = NextResponse.redirect(`${TIKTOK_AUTH_URL}?${params}`)
  response.cookies.set("tiktok_oauth_state",   stateParam,   cookieOpts)
  response.cookies.set("tiktok_oauth_mode",    mode,         cookieOpts)
  response.cookies.set("tiktok_code_verifier", codeVerifier, cookieOpts)
  return response
}
