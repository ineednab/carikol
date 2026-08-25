// Map hasil scrape Threads → bentuk SocialSnapshot yang dikonsumsi Platform Intel.
// Penting: `rawJson.videos` harus cocok dgn RawVideo di lib/decision-intel.ts
// (view_count, like_count, comment_count, share_count, create_time, title)
// supaya median/CV/eng-rate/kategori jalan tanpa ubah decision-intel.
import type { Prisma }         from "@prisma/client"
import type { ThreadsCreator } from "./index"
import type { ThreadPost }     from "./types"

interface ThreadsRawVideo {
  view_count:    number
  like_count:    number
  comment_count: number
  share_count:   number
  create_time:   number   // unix seconds
  title:         string
}

export interface ThreadsSnapshotInput {
  followerCount:  number
  followingCount: number | null
  postCount:      number | null
  engagementRate: number | null   // rata-rata % (kolom Decimal snapshot)
  rawJson:        Prisma.InputJsonValue   // { profile, videos }
}

// Threads: replies≈comments, reposts+shares≈shares. views null → 0 (post tanpa view count).
function toRawVideo(post: ThreadPost): ThreadsRawVideo {
  const e = post.raw.engagement
  return {
    view_count:    e.views ?? 0,
    like_count:    e.likes,
    comment_count: e.replies,
    share_count:   e.reposts + e.shares,
    create_time:   Math.floor(new Date(post.raw.createdAt).getTime() / 1000),
    title:         post.raw.text,
  }
}

export function toSnapshotInput(creator: ThreadsCreator): ThreadsSnapshotInput {
  const videos = creator.posts.map(toRawVideo)

  // Rata-rata engagement rate hanya dari post yang punya views.
  const rated = videos.filter(v => v.view_count > 0)
  const engagementRate = rated.length
    ? Math.round(
        (rated.reduce((s, v) => s + ((v.like_count + v.comment_count + v.share_count) / v.view_count) * 100, 0) /
          rated.length) * 100,
      ) / 100
    : null

  return {
    followerCount:  creator.profile.followerCount,
    followingCount: creator.profile.followingCount,
    postCount:      creator.profile.postCount,
    engagementRate,
    rawJson:        { profile: creator.profile, videos } as unknown as Prisma.InputJsonValue,
  }
}
