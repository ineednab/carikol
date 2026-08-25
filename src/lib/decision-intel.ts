/**
 * Decision Center Intelligence Engine
 * Pure arithmetic — no AI, no I/O, no Prisma.
 * Every metric is derivable from stored data; nothing invented.
 */

// ─── Raw input shapes (minimal subset of Prisma output) ──────────────────────

type RawVideo = {
  view_count:    number
  like_count:    number
  comment_count: number
  share_count:   number
  create_time:   number  // unix seconds
  title:         string
}

type RawSnapshot = {
  followerCount:  number
  followingCount: number | null
  postCount:      number | null
  capturedAt:     Date
  rawJson:        unknown
}

type RawAccount = {
  id:          string
  platformId:  string
  username:    string
  syncType:    string
  lastSyncAt:  Date | null
  platform:    { name: string }
  snapshots:   RawSnapshot[]
}

type RawApplication = {
  id:       string
  status:   string
  campaign: {
    id:           string
    name:         string
    type:         string
    rewardAmount: number | null
    status:       string
    brand:        { name: string }
  }
}

type RawOutcomeReview = {
  contentQuality:  number
  communication:   number
  professionalism: number
  wouldWorkAgain:  string
}

// ─── Output types ────────────────────────────────────────────────────────────

export type ViewStability  = "Stable" | "Moderate" | "Volatile"
export type ActivityStatus = "Active" | "Moderate" | "Inactive"
export type Confidence     = "HIGH" | "MEDIUM" | "LOW" | "NONE"

export type PlatformIntel = {
  accountId:     string
  platformId:    string
  platformName:  string
  username:      string
  syncType:      string
  lastSyncAt:    Date | null
  followerCount: number | null

  hasVideoData:       boolean
  videosAnalyzed:     number
  medianViews:        number | null
  avgViews:           number | null
  p10Views:           number | null
  p90Views:           number | null
  viewCV:             number | null
  viewStability:      ViewStability | null
  medianEngRate:      number | null
  postingFreqPerWeek: number | null
  daysSinceLastPost:  number | null
  activityStatus:     ActivityStatus | null
  categoryDist:       Array<{ name: string; count: number; pct: number }>
  brandContentPct:    number | null
  topVideo:           { title: string; views: number } | null
  insufficient:       boolean
}

export type OperationalIntel = {
  hasCampaigns:       boolean
  completedCampaigns: number
  paidCompleted:      number
  barterCompleted:    number
  avgRating:          number | null
  ratingN:            number
  wouldWorkAgainPct:  number | null
  wouldWorkAgainN:    number
  confidence:         Confidence
}

export type PricingEvidence = {
  dealCount:   number
  feeMin:      number | null
  feeMax:      number | null
  feeMedian:   number | null
  barterCount: number
}

export type DecisionIntel = {
  platforms:   PlatformIntel[]
  operational: OperationalIntel
  pricing:     PricingEvidence
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m]
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function stddev(nums: number[]): number {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  return Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length)
}

function cv(nums: number[]): number | null {
  if (nums.length < 3) return null
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  if (mean === 0) return null
  return Math.round((stddev(nums) / mean) * 100)
}

function pct(nums: number[], p: number): number {
  const s = [...nums].sort((a, b) => a - b)
  const idx = Math.max(0, Math.floor((p / 100) * s.length) - 1)
  return s[idx]
}

// ─── Category keywords ───────────────────────────────────────────────────────

const CATEGORIES: Record<string, string[]> = {
  Beauty:        ["makeup","skincare","beauty","lipstik","serum","moisturizer","sunscreen","glowing","kecantikan","jerawat","masker","toner","blush","concealer"],
  Lifestyle:     ["lifestyle","daily","vlog","dayinmylife","routine","morning","night","keseharian","pagi","tips","hacks","produktif","aesthetic"],
  Food:          ["food","kuliner","makan","resep","recipe","cooking","masak","resto","cafe","kafe","makanan","minuman","snack","jajan","foodie","mukbang"],
  Fashion:       ["fashion","outfit","ootd","style","baju","tas","sepatu","dress","hijab","streetstyle","lookbook","thrift"],
  Travel:        ["travel","wisata","liburan","vacation","holiday","trip","pantai","gunung","explore","destinasi","hotel"],
  Business:      ["bisnis","business","entrepreneur","startup","jualan","marketing","investasi","uang","cuan"],
  Entertainment: ["funny","lucu","comedy","viral","trending","dance","challenge","duet","react","gaming","storytime"],
  Health:        ["workout","gym","fitness","olahraga","diet","sehat","mental","yoga","nutrisi","wellness","mindset"],
}

const BRAND_SIGNALS = [
  "endorse","sponsor","collab","kerjasama","gifted","#ad","#endorse","#sponsor",
  "berbayar","paid collab","iklan","review produk","ft.","feat.","x @","bareng @",
  "bersama @","didukung","dukung oleh","partnership",
]

function classifyVideo(title: string): string[] {
  const lower = title.toLowerCase()
  return Object.entries(CATEGORIES)
    .filter(([, kws]) => kws.some(kw => lower.includes(kw)))
    .map(([cat]) => cat)
}

function isBrandContent(title: string): boolean {
  const lower = title.toLowerCase()
  return BRAND_SIGNALS.some(s => lower.includes(s))
}

// ─── Platform intelligence ────────────────────────────────────────────────────

function computePlatformIntel(account: RawAccount): PlatformIntel {
  const latest = account.snapshots[0] ?? null
  const followerCount = latest?.followerCount ?? null

  const base: Omit<PlatformIntel, "hasVideoData" | "videosAnalyzed" | "medianViews" | "avgViews" | "p10Views" | "p90Views" | "viewCV" | "viewStability" | "medianEngRate" | "postingFreqPerWeek" | "daysSinceLastPost" | "activityStatus" | "categoryDist" | "brandContentPct" | "topVideo" | "insufficient"> = {
    accountId:    account.id,
    platformId:   account.platformId,
    platformName: account.platform.name,
    username:     account.username,
    syncType:     account.syncType,
    lastSyncAt:   account.lastSyncAt,
    followerCount,
  }

  // Extract videos from rawJson (TikTok stores { profile, videos })
  const raw = latest?.rawJson as { videos?: RawVideo[] } | null | undefined
  const allVideos: RawVideo[] = Array.isArray(raw?.videos) ? raw!.videos! : []

  if (allVideos.length === 0) {
    return {
      ...base,
      hasVideoData: false,
      videosAnalyzed: 0,
      medianViews: null, avgViews: null, p10Views: null, p90Views: null,
      viewCV: null, viewStability: null, medianEngRate: null,
      postingFreqPerWeek: null, daysSinceLastPost: null, activityStatus: null,
      categoryDist: [], brandContentPct: null, topVideo: null,
      insufficient: true,
    }
  }

  // Sort by time desc, take last 12 for analysis
  const sorted = [...allVideos].sort((a, b) => b.create_time - a.create_time)
  const videos12 = sorted.slice(0, 12)
  const n = videos12.length

  // View stats
  const views = videos12.map(v => v.view_count)
  const medViews = median(views)
  const avgViews = avg(views)
  const viewCv   = cv(views)
  let viewStability: ViewStability | null = null
  if (viewCv !== null) {
    viewStability = viewCv < 20 ? "Stable" : viewCv <= 40 ? "Moderate" : "Volatile"
  }

  // Engagement rate (per-video: (likes+comments+shares)/views)
  const engRates = videos12
    .filter(v => v.view_count > 0)
    .map(v => ((v.like_count + v.comment_count + v.share_count) / v.view_count) * 100)
  const medEngRate = engRates.length > 0 ? parseFloat(median(engRates.map(e => Math.round(e * 100))).toString()) / 100 : null

  // Distribution
  const p10 = n >= 5 ? pct(views, 10) : null
  const p90 = n >= 5 ? pct(views, 90) : null

  // Posting frequency
  const NOW_S = Math.floor(Date.now() / 1000)
  const daysSinceLast = sorted.length > 0
    ? Math.floor((NOW_S - sorted[0].create_time) / 86400)
    : null

  let postingFreq: number | null = null
  let actStatus: ActivityStatus | null = null

  if (n >= 2) {
    const oldest12 = videos12[videos12.length - 1]
    const spanDays = (NOW_S - oldest12.create_time) / 86400
    postingFreq = spanDays > 0 ? parseFloat((n / (spanDays / 7)).toFixed(1)) : null

    if (n >= 12 && spanDays <= 45) actStatus = "Active"
    else if (n >= 6 && spanDays <= 90) actStatus = "Moderate"
    else actStatus = "Inactive"
  }

  // Category distribution
  const catCounts: Record<string, number> = {}
  videos12.forEach(v => {
    classifyVideo(v.title).forEach(c => {
      catCounts[c] = (catCounts[c] ?? 0) + 1
    })
  })
  const totalHits = Object.values(catCounts).reduce((a, b) => a + b, 0)
  const categoryDist = Object.entries(catCounts)
    .map(([name, count]) => ({ name, count, pct: totalHits > 0 ? Math.round(count / totalHits * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  // Brand content ratio
  const brandCount = videos12.filter(v => isBrandContent(v.title)).length
  const brandContentPct = Math.round(brandCount / n * 100)

  // Top video
  const topVid = [...videos12].sort((a, b) => b.view_count - a.view_count)[0]
  const topVideo = topVid ? { title: topVid.title, views: topVid.view_count } : null

  return {
    ...base,
    hasVideoData: true,
    videosAnalyzed: n,
    medianViews: medViews,
    avgViews,
    p10Views: p10,
    p90Views: p90,
    viewCV: viewCv,
    viewStability,
    medianEngRate: medEngRate,
    postingFreqPerWeek: postingFreq,
    daysSinceLastPost: daysSinceLast,
    activityStatus: actStatus,
    categoryDist,
    brandContentPct,
    topVideo,
    insufficient: n < 5,
  }
}

// ─── Operational intelligence ─────────────────────────────────────────────────

function computeOperationalIntel(
  applications: RawApplication[],
  outcomeReviews: RawOutcomeReview[],
): OperationalIntel {
  const completed = applications.filter(a => a.status === "COMPLETED")
  const paid      = completed.filter(a => a.campaign.type === "PAID")
  const barter    = completed.filter(a => a.campaign.type === "BARTER")

  const n = outcomeReviews.length
  let avgRating: number | null = null
  if (n > 0) {
    const total = outcomeReviews.reduce(
      (s, r) => s + (r.contentQuality + r.communication + r.professionalism) / 3,
      0
    )
    avgRating = Math.round((total / n) * 10) / 10
  }

  const wyaYes = outcomeReviews.filter(r => r.wouldWorkAgain === "yes").length
  const wouldWorkAgainPct = n > 0 ? Math.round(wyaYes / n * 100) : null

  let confidence: Confidence = "NONE"
  if (completed.length >= 10) confidence = "HIGH"
  else if (completed.length >= 5)  confidence = "MEDIUM"
  else if (completed.length >= 1)  confidence = "LOW"

  return {
    hasCampaigns:       completed.length > 0,
    completedCampaigns: completed.length,
    paidCompleted:      paid.length,
    barterCompleted:    barter.length,
    avgRating,
    ratingN:            n,
    wouldWorkAgainPct,
    wouldWorkAgainN:    n,
    confidence,
  }
}

// ─── Pricing evidence ─────────────────────────────────────────────────────────

function computePricingEvidence(applications: RawApplication[]): PricingEvidence {
  const completedPaid = applications.filter(
    a => a.status === "COMPLETED" && a.campaign.type === "PAID" && a.campaign.rewardAmount != null
  )
  const fees = completedPaid.map(a => a.campaign.rewardAmount as number)
  const barterCount = applications.filter(
    a => a.status === "COMPLETED" && a.campaign.type === "BARTER"
  ).length

  return {
    dealCount:   fees.length,
    feeMin:      fees.length > 0 ? Math.min(...fees) : null,
    feeMax:      fees.length > 0 ? Math.max(...fees) : null,
    feeMedian:   fees.length > 0 ? median(fees) : null,
    barterCount,
  }
}

// ─── Main entry ───────────────────────────────────────────────────────────────

export function buildDecisionIntel(creator: {
  socialAccounts: RawAccount[]
  applications:   RawApplication[]
  outcomeReviews: RawOutcomeReview[]
}): DecisionIntel {
  return {
    platforms:   creator.socialAccounts.map(computePlatformIntel),
    operational: computeOperationalIntel(creator.applications, creator.outcomeReviews),
    pricing:     computePricingEvidence(creator.applications),
  }
}
