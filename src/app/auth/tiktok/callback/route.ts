import { NextResponse, type NextRequest } from "next/server"
import { createServerClient }             from "@supabase/ssr"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createHash }                     from "crypto"
import { prisma }                         from "@/lib/prisma"

const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
const TOKEN_URL    = "https://open.tiktokapis.com/v2/oauth/token/"
const PROFILE_FIELDS = "open_id,union_id,avatar_url,display_name,username,bio_description,follower_count,following_count,likes_count,video_count"
const VIDEO_FIELDS   = "id,title,cover_image_url,duration,share_url,like_count,comment_count,share_count,view_count,create_time"

function syntheticCredentials(openId: string) {
  const email    = `tiktok.${openId}@carikol.id`
  const password = createHash("sha256")
    .update(openId + process.env.TIKTOK_CLIENT_SECRET!)
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
      }),
    })
    const token = await tokenRes.json()
    if (token.error) throw new Error(token.error_description ?? token.error)

    const { access_token, refresh_token, expires_in, open_id } = token

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

    // 4 — Create or find Supabase auth user (admin API)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { email, password } = syntheticCredentials(open_id ?? u.open_id)

    // Try to create; ignore conflict if already exists
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name:           u.display_name ?? u.username ?? "Creator",
        avatar_url:     u.avatar_url   ?? null,
        tiktok_open_id: open_id ?? u.open_id,
      },
    })

    // 5 — Sign in → sets Supabase session cookies on the response
    const finalResponse = NextResponse.redirect(
      `${APP_URL}/portal?tiktok=connected`,
      { status: 302 }
    )
    finalResponse.cookies.delete("tiktok_oauth_state")

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

    // 6 — Upsert Prisma User + Creator + TikTokAccount
    const tiktokOpenId = open_id ?? u.open_id
    const displayName  = u.display_name ?? u.username ?? "Creator"
    const username     = (u.username ?? tiktokOpenId).toLowerCase().replace(/[^a-z0-9_]/g, "")

    let dbUser = await prisma.user.findUnique({ where: { email }, include: { creator: true } })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: displayName,
          role: "talent",
        },
        include: { creator: true },
      })
    }

    // Create creator profile if not yet exists
    if (!dbUser.creator) {
      const safeUsername = await ensureUniqueUsername(username)
      const creator = await prisma.creator.create({
        data: {
          name:          displayName,
          username:      safeUsername,
          platform:      "tiktok",
          niche:         "Creator",
          tier:          tierFromCount(u.follower_count ?? 0),
          followerCount: u.follower_count ?? 0,
          engagementRate: 0,
          contact:       email,
        },
      })
      await prisma.user.update({
        where: { id: dbUser.id },
        data:  { creatorId: creator.id },
      })
      dbUser = { ...dbUser, creator, creatorId: creator.id }
    }

    // Upsert TikTok account
    if (dbUser.creator) {
      await prisma.tikTokAccount.upsert({
        where:  { creatorId: dbUser.creator.id },
        create: {
          creatorId:      dbUser.creator.id,
          openId:         tiktokOpenId,
          accessToken:    access_token,
          refreshToken:   refresh_token ?? null,
          expiresAt:      new Date(Date.now() + (expires_in ?? 86400) * 1000),
          username:       u.username     ?? null,
          displayName:    u.display_name ?? null,
          avatarUrl:      u.avatar_url   ?? null,
          bio:            u.bio_description ?? null,
          followerCount:  u.follower_count  ?? 0,
          followingCount: u.following_count ?? 0,
          likesCount:     u.likes_count     ?? 0,
          videoCount:     u.video_count     ?? 0,
          videosJson:     videos,
          lastSyncAt:     new Date(),
        },
        update: {
          accessToken:    access_token,
          refreshToken:   refresh_token ?? null,
          expiresAt:      new Date(Date.now() + (expires_in ?? 86400) * 1000),
          username:       u.username     ?? null,
          displayName:    u.display_name ?? null,
          avatarUrl:      u.avatar_url   ?? null,
          bio:            u.bio_description ?? null,
          followerCount:  u.follower_count  ?? 0,
          followingCount: u.following_count ?? 0,
          likesCount:     u.likes_count     ?? 0,
          videoCount:     u.video_count     ?? 0,
          videosJson:     videos,
          lastSyncAt:     new Date(),
        },
      })
    }

    // Redirect new users to onboarding, returning users to portal
    const isNew = !dbUser.creatorId
    finalResponse.headers.set(
      "Location",
      `${APP_URL}${isNew ? "/portal/onboarding" : "/portal?tiktok=connected"}`
    )
    return finalResponse

  } catch (err) {
    console.error("[TikTok login callback]", err)
    return NextResponse.redirect(`${APP_URL}/login?error=tiktok_failed`)
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function tierFromCount(n: number): "nano" | "micro" | "macro" | "mega" {
  if (n >= 1_000_000) return "mega"
  if (n >= 100_000)   return "macro"
  if (n >= 10_000)    return "micro"
  return "nano"
}

async function ensureUniqueUsername(base: string): Promise<string> {
  const exists = await prisma.creator.findUnique({ where: { username: base } })
  if (!exists) return base
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `${base}${suffix}`
}
