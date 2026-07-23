"use server"
import { getSession }          from "@/lib/session"
import { prisma }              from "@/lib/prisma"
import { processCreatorFacts, type TikTokVideo } from "@/lib/creator-facts"
import { generateAIStudioAction }                from "./generate-ai-studio"
import { tierFromCount }                         from "@/lib/format"

const TOKEN_URL    = "https://open.tiktokapis.com/v2/oauth/token/"
const PROFILE_FIELDS = "open_id,avatar_url,display_name,username,bio_description,follower_count,following_count,likes_count,video_count"
const VIDEO_FIELDS   = "id,title,cover_image_url,duration,share_url,like_count,comment_count,share_count,view_count,create_time"

export type ResyncResult =
  | { success: true;  newVideos: number; followerDiff: number; aiUpdated: boolean }
  | { success: false; error: string }

async function getValidToken(tiktokAccountId: string): Promise<string> {
  const account = await prisma.tikTokAccount.findUnique({ where: { id: tiktokAccountId } })
  if (!account) throw new Error("TikTok account not found")

  // Token still valid
  if (account.expiresAt > new Date()) return account.accessToken

  // Refresh token
  if (!account.refreshToken) throw new Error("Token expired and no refresh token available")

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type:    "refresh_token",
      refresh_token: account.refreshToken,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error_description ?? data.error)

  // Save refreshed token
  await prisma.tikTokAccount.update({
    where: { id: tiktokAccountId },
    data: {
      accessToken:  data.access_token,
      refreshToken: data.refresh_token ?? account.refreshToken,
      expiresAt:    new Date(Date.now() + (data.expires_in ?? 86400) * 1000),
    },
  })

  return data.access_token as string
}

export async function resyncTikTokAction(): Promise<ResyncResult> {
  const session = await getSession()
  if (!session?.user.creatorId) return { success: false, error: "Sesi tidak ditemukan." }

  const [creator, tiktokAccount] = await Promise.all([
    prisma.creator.findUnique({ where: { id: session.user.creatorId } }),
    prisma.tikTokAccount.findUnique({ where: { creatorId: session.user.creatorId } }),
  ])
  if (!creator)       return { success: false, error: "Creator tidak ditemukan." }
  if (!tiktokAccount) return { success: false, error: "TikTok belum terhubung." }

  try {
    const accessToken = await getValidToken(tiktokAccount.id)

    // Fetch latest profile
    const profileRes = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${PROFILE_FIELDS}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const { data: { user: u = {} } = {} } = await profileRes.json()

    // Fetch latest videos
    const videoRes = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`,
      {
        method:  "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ max_count: 20 }),
      }
    )
    const { data: { videos = [] } = {} } = await videoRes.json()

    const prevFollowers = tiktokAccount.followerCount
    const newFollowers  = u.follower_count ?? prevFollowers
    const prevVideos    = Array.isArray(tiktokAccount.videosJson) ? (tiktokAccount.videosJson as TikTokVideo[]) : []
    const prevVideoIds  = new Set(prevVideos.map((v) => v.id))
    const newVideos: TikTokVideo[] = videos
    const newVideoCount = newVideos.filter((v) => !prevVideoIds.has(v.id)).length

    // Update TikTokAccount
    await prisma.tikTokAccount.update({
      where: { id: tiktokAccount.id },
      data: {
        username:       u.username      ?? tiktokAccount.username,
        displayName:    u.display_name  ?? tiktokAccount.displayName,
        avatarUrl:      u.avatar_url    ?? tiktokAccount.avatarUrl,
        bio:            u.bio_description ?? tiktokAccount.bio,
        followerCount:  newFollowers,
        followingCount: u.following_count ?? tiktokAccount.followingCount,
        likesCount:     u.likes_count    ?? tiktokAccount.likesCount,
        videoCount:     u.video_count    ?? tiktokAccount.videoCount,
        videosJson:     newVideos.length > 0 ? newVideos : (tiktokAccount.videosJson ?? undefined),
        lastSyncAt:     new Date(),
      },
    })

    // Update creator tier + follower count
    const newTier = tierFromCount(newFollowers)
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        followerCount: newFollowers,
        tier:          newTier,
      },
    })

    // Save historical snapshot
    const facts = processCreatorFacts(
      newVideos.length > 0 ? newVideos : prevVideos,
      { followerCount: newFollowers, followingCount: u.following_count ?? 0, likesCount: u.likes_count ?? 0, videoCount: u.video_count ?? 0 },
      { tier: newTier, platform: creator.platform, engagementRate: Number(creator.engagementRate) }
    )

    await prisma.creatorSnapshot.create({
      data: {
        creatorId:     creator.id,
        followerCount: newFollowers,
        avgViews:      facts.performance.avgViews,
        avgEngagement: facts.performance.avgEngagement,
        videos90d:     facts.activity.videos90d,
      },
    })

    // Auto-regenerate AI if new videos found
    let aiUpdated = false
    if (newVideoCount > 0 || !creator.aiInsight) {
      const aiResult = await generateAIStudioAction()
      aiUpdated = aiResult.success
    }

    return {
      success:      true,
      newVideos:    newVideoCount,
      followerDiff: newFollowers - prevFollowers,
      aiUpdated,
    }
  } catch (err) {
    console.error("[Resync TikTok]", err)
    return { success: false, error: "Gagal sync. Coba lagi." }
  }
}

