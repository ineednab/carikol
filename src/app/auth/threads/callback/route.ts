import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { scrapeThreadsCreator } from "@/lib/threads"
import { toSnapshotInput } from "@/lib/threads/snapshot"
import { encryptToken } from "@/lib/oauth/token-crypto"

const THREADS_TOKEN_URL = "https://graph.threads.com/oauth/access_token"
const THREADS_EXCHANGE_URL = "https://graph.threads.com/access_token"
const THREADS_ME_URL = "https://graph.threads.com/v1.0/me"

type ThreadsMe = {
  id?: string
  username?: string
  name?: string
  threads_profile_picture_url?: string
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://carikol.id"
  const clientId = process.env.THREADS_APP_ID
  const clientSecret = process.env.THREADS_APP_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/portal/profile?threads=missing_config`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/portal/profile?threads=denied`)
  }

  const storedState = request.cookies.get("threads_oauth_state")?.value
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/portal/profile?threads=state`)
  }

  const session = await getSession()
  if (!session?.user.creatorId) {
    return NextResponse.redirect(`${appUrl}/login?error=session`)
  }

  try {
    // 1) auth code -> short-lived token
    const tokenRes = await fetch(THREADS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${appUrl}/auth/threads/callback`,
      }),
    })
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok || tokenJson.error) {
      throw new Error(tokenJson.error?.message ?? "Token exchange gagal")
    }

    const shortToken = tokenJson.access_token as string | undefined
    if (!shortToken) throw new Error("Access token Threads kosong")

    // 2) short-lived -> long-lived token (60 hari)
    const exchangeUrl = new URL(THREADS_EXCHANGE_URL)
    exchangeUrl.searchParams.set("grant_type", "th_exchange_token")
    exchangeUrl.searchParams.set("client_secret", clientSecret)
    exchangeUrl.searchParams.set("access_token", shortToken)

    const longRes = await fetch(exchangeUrl)
    const longJson = await longRes.json()
    if (!longRes.ok || longJson.error) {
      throw new Error(longJson.error?.message ?? "Long-lived exchange gagal")
    }
    const longToken = (longJson.access_token as string | undefined) ?? shortToken
    const expiresIn = Number(longJson.expires_in ?? 0)

    // 3) me profile dari API resmi Threads
    const meUrl = new URL(THREADS_ME_URL)
    meUrl.searchParams.set("fields", "id,username,name,threads_profile_picture_url")
    meUrl.searchParams.set("access_token", longToken)
    const meRes = await fetch(meUrl)
    const me = (await meRes.json()) as ThreadsMe & { error?: { message?: string } }
    if (!meRes.ok || me.error || !me.username) {
      throw new Error(me.error?.message ?? "Gagal ambil profil Threads")
    }

    // 4) pakai scraper untuk snapshot metrik awal (kompatibel dg pipeline saat ini)
    const creatorData = await scrapeThreadsCreator(me.username)
    const snapshot = toSnapshotInput(creatorData)
    const now = new Date()
    const nextSyncAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const account = await prisma.socialAccount.upsert({
      where: {
        creatorId_platformId: {
          creatorId: session.user.creatorId,
          platformId: "threads",
        },
      },
      create: {
        creatorId: session.user.creatorId,
        platformId: "threads",
        username: me.username,
        displayName: me.name ?? creatorData.profile.displayName ?? me.username,
        avatarUrl: me.threads_profile_picture_url ?? creatorData.profile.avatarUrl,
        profileUrl: `https://www.threads.com/@${me.username}`,
        syncType: "AUTO",
        connectedAt: now,
        lastSyncAt: now,
        nextSyncAt,
      },
      update: {
        username: me.username,
        displayName: me.name ?? creatorData.profile.displayName ?? me.username,
        avatarUrl: me.threads_profile_picture_url ?? creatorData.profile.avatarUrl,
        profileUrl: `https://www.threads.com/@${me.username}`,
        syncType: "AUTO",
        lastSyncAt: now,
        nextSyncAt,
      },
    })

    const tokenExpiresAt =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? new Date(now.getTime() + expiresIn * 1000)
        : null

    await prisma.socialAuthToken.upsert({
      where: { socialAccountId: account.id },
      create: {
        socialAccountId: account.id,
        provider: "threads",
        providerUserId: me.id ?? null,
        accessTokenEnc: encryptToken(longToken),
        scope: "threads_basic,threads_manage_insights",
        tokenExpiresAt,
      },
      update: {
        providerUserId: me.id ?? null,
        accessTokenEnc: encryptToken(longToken),
        scope: "threads_basic,threads_manage_insights",
        tokenExpiresAt,
      },
    })

    await prisma.socialSnapshot.create({
      data: {
        accountId: account.id,
        followerCount: snapshot.followerCount,
        followingCount: snapshot.followingCount,
        postCount: snapshot.postCount,
        engagementRate: snapshot.engagementRate,
        capturedBy: "AUTO",
        rawJson: snapshot.rawJson,
      },
    })

    const response = NextResponse.redirect(`${appUrl}/portal/profile?threads=connected`)
    response.cookies.delete("threads_oauth_state")
    return response
  } catch (err) {
    console.error("[Threads OAuth callback]", err)
    return NextResponse.redirect(`${appUrl}/portal/profile?threads=failed`)
  }
}
