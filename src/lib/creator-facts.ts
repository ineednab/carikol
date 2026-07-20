/**
 * Data Processor: TikTok raw video data → CreatorFacts
 *
 * Rules:
 * - No AI at this layer. Only arithmetic and keyword matching.
 * - Every field must be derivable from the input data.
 * - If data is insufficient, mark it explicitly (not silently filled).
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ActivityLevel = "very_active" | "active" | "moderate" | "low"
export type Confidence    = "high" | "medium" | "low"

export type TikTokVideo = {
  id:              string
  title:           string
  view_count:      number
  like_count:      number
  comment_count:   number
  share_count:     number
  create_time:     number  // unix seconds
  duration?:       number
  share_url?:      string
  cover_image_url?: string
}

export type CreatorFacts = {
  profile: {
    followers:      number
    following:      number
    likes:          number
    videoCount:     number
    engagementRate: number
    tier:           string
    platform:       string
  }

  activity: {
    totalVideosInDataset: number
    videos90d:            number
    postingFreqPerWeek:   number
    activeWeeks90d:       number
    totalWeeks:           number        // 13 (90 days)
    activityLevel:        ActivityLevel
    daysSinceLastPost:    number | null
    evidence:             string[]
  }

  performance: {
    avgViews:       number
    medianViews:    number
    avgLikes:       number
    avgComments:    number
    avgShares:      number
    avgEngagement:  number              // (likes+comments+shares)/views %
    top5AvgViews:   number | null
    performanceRatio: number | null     // top5 / overall avg
    topVideo: { title: string; views: number; url?: string } | null
    evidence:       string[]
  }

  content: {
    categories:           Array<{ name: string; count: number; pct: number }>
    topCategory:          string | null
    topCategoryPct:       number | null
    uncategorizedPct:     number
    sampleTitles:         string[]      // up to 5 titles for AI context
    evidence:             string[]
  }

  brandFit: Array<{
    category: string
    score:    number                    // 0–100 deterministic
    reason:   string                    // exactly what drove the score
  }>

  rateCard: {
    basePriceMin: number
    basePriceMax: number
    confidence:   Confidence
    factors:      string[]
  }

  dataQuality: {
    videosAnalyzed:   number
    hasRecentData:    boolean           // any video in last 90d
    coverageDays:     number | null
    insufficient:     boolean           // < 5 videos → low confidence
  }

  facts: string[]                       // pre-written fact sentences for AI prompt
}

// ── Category keyword dictionary ───────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Beauty: [
    "makeup","skincare","beauty","lipstik","eyeshadow","foundation","serum",
    "moisturizer","sunscreen","glowing","cantik","kecantikan","jerawat","acne",
    "masker","toner","spf","blush","concealer","highlighter","skingoals",
  ],
  Lifestyle: [
    "lifestyle","daily","vlog","dayinmylife","routine","morning","night",
    "keseharian","pagi","malam","tips","hacks","produktif","aesthetic",
  ],
  Food: [
    "food","kuliner","makan","resep","recipe","cooking","masak","resto",
    "restaurant","cafe","kafe","makanan","minuman","drink","snack","jajan",
    "foodie","review","mukbang",
  ],
  Fashion: [
    "fashion","outfit","ootd","style","baju","pakaian","tas","sepatu",
    "dress","hijab","streetstyle","lookbook","thrift","preloved",
  ],
  Travel: [
    "travel","wisata","liburan","vacation","holiday","trip","pantai","gunung",
    "explore","destinasi","backpacker","itinerary","hotel","vlog",
  ],
  Business: [
    "bisnis","business","entrepreneur","startup","jualan","usaha","digital",
    "marketing","finance","investasi","invest","uang","cuan","passive",
  ],
  Entertainment: [
    "funny","lucu","comedy","humor","viral","trending","dance","tari",
    "challenge","duet","react","prank","gaming","game","storytime",
  ],
  Health: [
    "workout","gym","fitness","olahraga","diet","sehat","mental","yoga",
    "nutrisi","wellness","mindset","meditasi","meditation","lari","cardio",
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW_S = Math.floor(Date.now() / 1000)
const DAY_S = 86400
const WEEK_S = 7 * DAY_S

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function classifyVideo(title: string): string[] {
  const lower = title.toLowerCase()
  const matches: string[] = []
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) matches.push(cat)
  }
  return matches
}

// ── Main processor ────────────────────────────────────────────────────────────

export function processCreatorFacts(
  videos: TikTokVideo[],
  tiktokAccount: {
    followerCount:  number
    followingCount: number
    likesCount:     number
    videoCount:     number
    follower?: number
  },
  creatorMeta: {
    tier:           string
    platform:       string
    engagementRate: number
  }
): CreatorFacts {

  // ── Activity ────────────────────────────────────────────────────────────────
  const cutoff90 = NOW_S - 90 * DAY_S
  const videos90d = videos.filter((v) => v.create_time >= cutoff90)
  const totalWeeks = 13

  const weekSet = new Set<number>()
  videos90d.forEach((v) => {
    const weekNum = Math.floor((NOW_S - v.create_time) / WEEK_S)
    weekSet.add(weekNum)
  })
  const activeWeeks = weekSet.size
  const freqPerWeek = parseFloat((videos90d.length / totalWeeks).toFixed(1))

  let activityLevel: ActivityLevel
  if (freqPerWeek >= 2.5)      activityLevel = "very_active"
  else if (freqPerWeek >= 1.5) activityLevel = "active"
  else if (freqPerWeek >= 0.5) activityLevel = "moderate"
  else                         activityLevel = "low"

  const sortedByTime = [...videos].sort((a, b) => b.create_time - a.create_time)
  const lastPostDaysAgo = sortedByTime.length > 0
    ? Math.floor((NOW_S - sortedByTime[0].create_time) / DAY_S)
    : null

  const activityEvidence: string[] = [
    `${videos90d.length} videos posted in the last 90 days`,
    `Active in ${activeWeeks} of ${totalWeeks} weeks`,
    `Posting frequency: ${freqPerWeek} videos/week`,
  ]
  if (lastPostDaysAgo !== null) {
    activityEvidence.push(`Last post: ${lastPostDaysAgo} day${lastPostDaysAgo === 1 ? "" : "s"} ago`)
  }

  // ── Performance ─────────────────────────────────────────────────────────────
  const viewCounts    = videos.map((v) => v.view_count)
  const likeCounts    = videos.map((v) => v.like_count)
  const commentCounts = videos.map((v) => v.comment_count)
  const shareCounts   = videos.map((v) => v.share_count)

  const avgViews    = avg(viewCounts)
  const medViews    = median(viewCounts)
  const avgLikes    = avg(likeCounts)
  const avgComments = avg(commentCounts)
  const avgShares   = avg(shareCounts)
  const avgEng      = avgViews > 0
    ? parseFloat(((avgLikes + avgComments + avgShares) / avgViews * 100).toFixed(2))
    : 0

  const sortedByViews = [...videos].sort((a, b) => b.view_count - a.view_count)
  const top5         = sortedByViews.slice(0, 5)
  const top5AvgViews = top5.length > 0 ? avg(top5.map((v) => v.view_count)) : null
  const perfRatio    = top5AvgViews && avgViews > 0
    ? parseFloat((top5AvgViews / avgViews).toFixed(1))
    : null
  const topVideo     = sortedByViews[0]
    ? { title: sortedByViews[0].title, views: sortedByViews[0].view_count, url: sortedByViews[0].share_url }
    : null

  const perfEvidence: string[] = [
    `Average views: ${fmt(avgViews)}`,
    `Median views: ${fmt(medViews)}`,
    `Average engagement: ${avgEng}% (likes + comments + shares / views)`,
  ]
  if (top5AvgViews) perfEvidence.push(`Top 5 average views: ${fmt(top5AvgViews)}`)
  if (perfRatio)    perfEvidence.push(`Top content outperforms average by ${perfRatio}×`)

  // ── Content classification ──────────────────────────────────────────────────
  const catCounts: Record<string, number> = {}
  let categorized = 0
  videos.forEach((v) => {
    const cats = classifyVideo(v.title)
    if (cats.length > 0) {
      categorized++
      cats.forEach((c) => { catCounts[c] = (catCounts[c] ?? 0) + 1 })
    }
  })

  const totalCatHits = Object.values(catCounts).reduce((s, n) => s + n, 0)
  const categories = Object.entries(catCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: totalCatHits > 0 ? Math.round((count / totalCatHits) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const topCat    = categories[0] ?? null
  const uncatPct  = videos.length > 0
    ? Math.round(((videos.length - categorized) / videos.length) * 100)
    : 100

  const sampleTitles = videos.slice(0, 5).map((v) => v.title).filter(Boolean)

  const contentEvidence: string[] = categories
    .slice(0, 3)
    .map((c) => `${c.pct}% of classified content: ${c.name}`)
  if (uncatPct > 0) contentEvidence.push(`${uncatPct}% of videos could not be classified by keyword`)

  // ── Brand Fit (deterministic) ───────────────────────────────────────────────
  function brandScore(category: string): { score: number; reason: string } {
    const catData = categories.find((c) => c.name === category)
    if (!catData) return { score: 0, reason: "No content in this category detected" }
    const base = Math.min(catData.pct * 2, 80)
    const engBonus = avgEng > 5 ? 10 : avgEng > 3 ? 5 : 0
    const score = Math.min(Math.round(base + engBonus), 100)
    const reason = `${catData.pct}% of recent content is ${category.toLowerCase()} — ${avgEng}% avg engagement`
    return { score, reason }
  }

  const brandFitCategories = ["Beauty", "Lifestyle", "Food", "Fashion", "Travel", "Business", "Entertainment", "Health"]
  const brandFit = brandFitCategories
    .map((cat) => ({ category: cat, ...brandScore(cat) }))
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // ── Rate Card (rule engine) ─────────────────────────────────────────────────
  // CPV benchmark Indonesia (IDR): nano 5–8, micro 4–6, macro 3–5, mega 2–4
  const cpvRange: Record<string, [number, number]> = {
    nano:  [5, 8],
    micro: [4, 6],
    macro: [3, 5],
    mega:  [2, 4],
  }
  const [cpvMin, cpvMax] = cpvRange[creatorMeta.tier] ?? [3, 6]
  const baseMin = Math.round((avgViews * cpvMin) / 100) * 100
  const baseMax = Math.round((avgViews * cpvMax) / 100) * 100
  const rcConfidence: Confidence = videos.length >= 15 ? "high" : videos.length >= 7 ? "medium" : "low"

  const rateFactors: string[] = [
    `Average views: ${fmt(avgViews)}`,
    `Tier: ${creatorMeta.tier} (CPV ${cpvMin}–${cpvMax} IDR)`,
    `Engagement: ${avgEng}%`,
    `Based on ${videos.length} videos analyzed`,
  ]

  // ── Data quality ────────────────────────────────────────────────────────────
  const oldest = sortedByTime.length > 0 ? sortedByTime[sortedByTime.length - 1] : null
  const coverageDays = oldest
    ? Math.floor((NOW_S - oldest.create_time) / DAY_S)
    : null

  // ── Pre-written facts for AI ────────────────────────────────────────────────
  const facts: string[] = [
    `Follower count: ${tiktokAccount.followerCount.toLocaleString()} (${creatorMeta.tier} tier)`,
    `${videos90d.length} videos posted in the last 90 days across ${activeWeeks} active weeks`,
    `Posting frequency: ${freqPerWeek} videos/week`,
    `Activity level: ${activityLevel.replace("_", " ")}`,
    `Average views per video: ${fmt(avgViews)}`,
    `Average engagement rate: ${avgEng}%`,
  ]
  if (topCat) facts.push(`Top content category: ${topCat.name} (${topCat.pct}% of classified content)`)
  if (top5AvgViews && perfRatio) facts.push(`Top 5 videos average ${fmt(top5AvgViews)} views — ${perfRatio}× the overall average`)
  if (topVideo) facts.push(`Best performing video: "${topVideo.title}" with ${fmt(topVideo.views)} views`)

  return {
    profile: {
      followers:      tiktokAccount.followerCount,
      following:      tiktokAccount.followingCount,
      likes:          tiktokAccount.likesCount,
      videoCount:     tiktokAccount.videoCount,
      engagementRate: creatorMeta.engagementRate,
      tier:           creatorMeta.tier,
      platform:       creatorMeta.platform,
    },
    activity: {
      totalVideosInDataset: videos.length,
      videos90d:            videos90d.length,
      postingFreqPerWeek:   freqPerWeek,
      activeWeeks90d:       activeWeeks,
      totalWeeks,
      activityLevel,
      daysSinceLastPost:    lastPostDaysAgo,
      evidence:             activityEvidence,
    },
    performance: {
      avgViews, medianViews: medViews,
      avgLikes, avgComments, avgShares,
      avgEngagement: avgEng,
      top5AvgViews, performanceRatio: perfRatio,
      topVideo,
      evidence: perfEvidence,
    },
    content: {
      categories,
      topCategory:      topCat?.name ?? null,
      topCategoryPct:   topCat?.pct ?? null,
      uncategorizedPct: uncatPct,
      sampleTitles,
      evidence:         contentEvidence,
    },
    brandFit,
    rateCard: {
      basePriceMin: baseMin,
      basePriceMax: baseMax,
      confidence:   rcConfidence,
      factors:      rateFactors,
    },
    dataQuality: {
      videosAnalyzed: videos.length,
      hasRecentData:  videos90d.length > 0,
      coverageDays,
      insufficient:   videos.length < 5,
    },
    facts,
  }
}
