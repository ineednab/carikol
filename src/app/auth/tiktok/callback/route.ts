import { NextResponse, type NextRequest } from "next/server"
import { createServerClient }             from "@supabase/ssr"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createHmac }                     from "crypto"
import { prisma }                         from "@/lib/prisma"
import { getSession }                     from "@/lib/session"

const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
const TOKEN_URL      = "https://open.tiktokapis.com/v2/oauth/token/"
const PROFILE_FIELDS = "open_id,union_id,avatar_url,display_name,username,bio_description,follower_count,following_count,likes_count,video_count"
const VIDEO_FIELDS   = "id,title,cover_image_url,duration,share_url,like_count,comment_count,share_count,view_count,create_time"

function syntheticCredentials(openId: string) {
  const signingSecret = process.env.TIKTOK_OAUTH_PASSWORD_SECRET ?? process.env.TIKTOK_CLIENT_SECRET
  if (!signingSecret) {
    throw new Error("Missing TIKTOK_OAUTH_PASSWORD_SECRET")
  }

  const email    = `tiktok.${openId}@carikol.id`.toLowerCase()
  const password = createHmac("sha256", signingSecret)
    .update(`tiktok:${openId}`)
    .digest("hex")
  return { email, password }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/login?error=tiktok_denied`)
  }

  const storedState = request.cookies.get("tiktok_oauth_state")?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=tiktok_state`)
  }

  // Mode is encoded in state as "uuid.mode" — use cookie as override, state as fallback
  const modeFromState = state.split(".")[1] ?? "login"
  const mode          = request.cookies.get("tiktok_oauth_mode")?.value ?? modeFromState
  const codeVerifier  = request.cookies.get("tiktok_code_verifier")?.value ?? ""

  const clearModeCookies = (res: NextResponse) => {
    res.cookies.delete("tiktok_oauth_state")
    res.cookies.delete("tiktok_oauth_mode")
    res.cookies.delete("tiktok_code_verifier")
    return res
  }

  try {
    // 1 — Exchange code for TikTok access token
    const tokenRes = await fetch(TOKEN_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key:    process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type:    "authorization_code",
        redirect_uri:  `${APP_URL}/auth/tiktok/callback`,
        code_verifier: codeVerifier,
      }),
    })
    const token = await tokenRes.json()
    if (token.error) throw new Error(token.error_description ?? token.error)

    const { access_token, open_id } = token

    // 2 — Fetch TikTok profile
    const profileRes = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${PROFILE_FIELDS}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const { data: { user: u = {} } = {} } = await profileRes.json()

    // 3 — Fetch public videos
    const videoRes = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`,
      {
        method:  "POST",
        headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ max_count: 20 }),
      }
    )
    const { data: { videos = [] } = {} } = await videoRes.json()

    // ── Onboarding mode: store profile in cookie, redirect back to wizard ────
    if (mode === "onboarding") {
      const tiktokOpenId = open_id ?? u.open_id
      const username     = (u.username ?? tiktokOpenId ?? "").toLowerCase().replace(/[^a-z0-9_.]/g, "")
      const profile = {
        openId:       tiktokOpenId,
        username,
        displayName:  u.display_name ?? u.username ?? "Creator",
        avatarUrl:    u.avatar_url ?? null,
        profileUrl:   `https://www.tiktok.com/@${username}`,
        followerCount: u.follower_count ?? 0,
      }
      const res = NextResponse.redirect(`${APP_URL}/portal/onboarding?tiktok=ok`)
      res.cookies.delete("tiktok_oauth_state")
      res.cookies.delete("tiktok_oauth_mode")
      res.cookies.set("tiktok_onboarding_profile", JSON.stringify(profile), {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge:   1800,
        path:     "/",
      })
      return res
    }

    // ── Connect mode: attach TikTok to existing session ──────────────────────
    if (mode === "connect") {
      const session = await getSession()
      if (session?.user.creatorId) {
        const creatorId  = session.user.creatorId
        const nowDate    = new Date()
        const nextSync   = new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        const tiktokOpenId = open_id ?? u.open_id
        const displayName  = u.display_name ?? u.username ?? "Creator"
        const username     = (u.username ?? tiktokOpenId ?? "").toLowerCase().replace(/[^a-z0-9_.]/g, "")

        const existing = await prisma.socialAccount.findUnique({
          where: { creatorId_platformId: { creatorId, platformId: "tiktok" } },
        })

        let accountId: string
        if (existing) {
          await prisma.socialAccount.update({
            where: { id: existing.id },
            data: {
              username:    username || existing.username,
              displayName, avatarUrl: u.avatar_url ?? null,
              syncType:    "AUTO",
              status:      "VERIFIED", verifiedAt: nowDate,
              lastSyncAt:  nowDate,   nextSyncAt:  nextSync,
            },
          })
          accountId = existing.id
        } else {
          const acct = await prisma.socialAccount.create({
            data: {
              creatorId, platformId: "tiktok",
              username: username || (tiktokOpenId ?? "unknown"),
              displayName, avatarUrl: u.avatar_url ?? null,
              syncType: "AUTO", status: "VERIFIED",
              verifiedAt: nowDate, connectedAt: nowDate,
              lastSyncAt: nowDate, nextSyncAt:  nextSync,
            },
          })
          accountId = acct.id
        }

        await prisma.socialSnapshot.create({
          data: {
            accountId,
            followerCount:  u.follower_count  ?? 0,
            followingCount: u.following_count ?? null,
            postCount:      u.video_count     ?? null,
            capturedBy:     "AUTO",
            rawJson:        { profile: u, videos },
          },
        })

        return clearModeCookies(
          NextResponse.redirect(`${APP_URL}/portal?tiktok=connected`)
        )
      }
      // No active session → fall through to full login flow
    }

    // 4 — Create or find Supabase auth user (admin API)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const tiktokOpenId = open_id ?? u.open_id
    if (!tiktokOpenId) throw new Error("Missing TikTok open_id")

    const displayName  = u.display_name ?? u.username ?? "Creator"
    const { email, password } = syntheticCredentials(tiktokOpenId)

    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name:           displayName,
        avatar_url:     u.avatar_url ?? null,
        tiktok_open_id: tiktokOpenId,
      },
    })
    if (
      created.error &&
      !/already|exists|registered/i.test(created.error.message ?? "")
    ) {
      throw created.error
    }

    // 5 — Sign in → sets Supabase session cookies on the response
    const finalResponse = NextResponse.redirect(
      `${APP_URL}/portal?tiktok=connected`,
      { status: 302 }
    )
    clearModeCookies(finalResponse)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (toSet) => toSet.forEach(({ name, value, options }) =>
            finalResponse.cookies.set(name, value, options)
          ),
        },
      }
    )

    const { data: { session }, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !session) throw new Error(signInError?.message ?? "Sign-in failed")

    // 6 — Upsert Prisma User
    let dbUser = await prisma.user.findUnique({ where: { email }, include: { creator: true } })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data:    { email, name: displayName, role: "talent" },
        include: { creator: true },
      })
    }

    const isNew = !dbUser.creatorId

    // 7 — Create Creator if not exists
    if (!dbUser.creator) {
      const creator = await prisma.creator.create({
        data: { name: displayName, contact: email, city: null },
      })
      await prisma.user.update({
        where: { id: dbUser.id },
        data:  { creatorId: creator.id },
      })
      dbUser = { ...dbUser, creator, creatorId: creator.id }
    }

    // 8 — Upsert SocialAccount (TikTok)
    if (dbUser.creator) {
      const nowDate      = new Date()
      const nextSyncDate = new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const username     = (u.username ?? tiktokOpenId).toLowerCase().replace(/[^a-z0-9_.]/g, "")

      const existingAccount = await prisma.socialAccount.findUnique({
        where: { creatorId_platformId: { creatorId: dbUser.creator.id, platformId: "tiktok" } },
      })

      let accountId: string

      if (existingAccount) {
        await prisma.socialAccount.update({
          where: { id: existingAccount.id },
          data: {
            username:    username || existingAccount.username,
            displayName: displayName,
            avatarUrl:   u.avatar_url ?? null,
            lastSyncAt:  nowDate,
            nextSyncAt:  nextSyncDate,
          },
        })
        accountId = existingAccount.id
      } else {
        const newAccount = await prisma.socialAccount.create({
          data: {
            creatorId:   dbUser.creator.id,
            platformId:  "tiktok",
            username:    username || tiktokOpenId,
            displayName: displayName,
            avatarUrl:   u.avatar_url    ?? null,
            syncType:    "AUTO",
            connectedAt: nowDate,
            lastSyncAt:  nowDate,
            nextSyncAt:  nextSyncDate,
          },
        })
        accountId = newAccount.id
      }

      // 9 — Insert SocialSnapshot
      await prisma.socialSnapshot.create({
        data: {
          accountId:     accountId,
          followerCount: u.follower_count  ?? 0,
          followingCount: u.following_count ?? null,
          postCount:     u.video_count     ?? null,
          capturedBy:    "AUTO",
          rawJson:       { profile: u, videos },
        },
      })
    }

    // Redirect new users to onboarding, returning users to portal
    finalResponse.headers.set(
      "Location",
      `${APP_URL}${isNew ? "/portal/onboarding" : "/portal?tiktok=connected"}`
    )
    return finalResponse

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[TikTok callback] mode=%s error=%s", mode, msg, err)
    const url = new URL(`${APP_URL}/login`)
    url.searchParams.set("error", "tiktok_failed")
    url.searchParams.set("detail", msg.slice(0, 120))
    return NextResponse.redirect(url.toString())
  }
}
