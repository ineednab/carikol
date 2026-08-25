// Step 1 — scrapeThreadsPost(url)  (Tier 🟢 raw + 🔵 computed)
// Zero-dependency: fetch → parse <script data-sjs> → traverse Relay blob.
// Ekstraksi defensif: cari by NAMA FIELD, bukan by nama query (query bisa berubah).
// Lihat docs/16-threads-intelligence-pipeline.md
import { createHash } from "node:crypto"
import { logger }     from "@/lib/logger"
import {
  type JsonObj, isObj, num, collect, extractSjsBlobs, fetchThreadsHtml,
} from "./internal"
import type {
  ThreadPost, ThreadPostRaw, ThreadPostComputed, ThreadsMediaType, ThreadsReply,
} from "./types"

// IG media_type → enum kita
const MEDIA_TYPE: Record<number, ThreadsMediaType> = { 1: "image", 2: "video", 8: "carousel", 19: "text" }

export function parseThreadsUrl(url: string): { username: string; code: string } {
  const m = url.match(/threads\.(?:com|net)\/@([^/]+)\/post\/([A-Za-z0-9_-]+)/)
  if (!m) throw new Error(`URL Threads tidak valid: ${url}`)
  return { username: m[1], code: m[2] }
}

// view_counts punya DUA bentuk: boolean toggle (false = disembunyikan) & number.
// Ambil hanya yang numerik; kalau tak ada → null (private).
function pickViews(node: JsonObj, blobs: unknown[], postPk: string, code: string): number | null {
  const direct = num(node.view_counts)
  if (direct !== null) return direct
  // Sumber autoritatif: holder view-count level-halaman (punya flag `enable_view_counts`
  // + `view_counts` numerik). Terbukti = view count post utama (salpriadi 8355).
  const holder = collect(blobs, o => "enable_view_counts" in o && typeof o.view_counts === "number")[0]
  if (holder) return holder.view_counts as number
  // Cadangan: node media dgn view_counts/impression_count yang cocok pk/code.
  const hits = collect(blobs, o =>
    (typeof o.view_counts === "number" || typeof o.impression_count === "number") &&
    (o.pk === postPk || o.id === postPk || o.code === code),
  )
  for (const h of hits) {
    const v = num(h.view_counts) ?? num(h.impression_count)
    if (v !== null) return v
  }
  return null
}

function pickMedia(node: JsonObj): ThreadPostRaw["media"] {
  const mtInt = typeof node.media_type === "number" ? node.media_type : 19
  const carousel = Array.isArray(node.carousel_media) ? (node.carousel_media as JsonObj[]) : null

  const bestImage = (o: JsonObj): string | null => {
    const iv = o.image_versions2 as JsonObj | undefined
    const cands = iv && Array.isArray(iv.candidates) ? (iv.candidates as JsonObj[]) : []
    return (cands[0]?.url as string) ?? null
  }
  const bestVideo = (o: JsonObj): string | null => {
    const vv = Array.isArray(o.video_versions) ? (o.video_versions as JsonObj[]) : []
    return (vv[0]?.url as string) ?? null
  }

  const imageUrls: string[] = []
  let videoUrl: string | null = null
  if (carousel) {
    for (const c of carousel) { const i = bestImage(c); if (i) imageUrls.push(i); if (!videoUrl) videoUrl = bestVideo(c) }
  } else {
    const i = bestImage(node); if (i) imageUrls.push(i)
    videoUrl = bestVideo(node)
  }

  const type = MEDIA_TYPE[mtInt] ?? (carousel ? "carousel" : videoUrl ? "video" : imageUrls.length ? "image" : "text")
  return {
    type,
    count:     carousel ? carousel.length : (videoUrl || imageUrls.length ? 1 : 0),
    imageUrls,
    videoUrl,
    thumbnail: imageUrls[0] ?? null,
    hasVideo:  !!videoUrl,
    hasImage:  imageUrls.length > 0,
  }
}

function extractReplies(blobs: unknown[], mainCode: string, mainUser: string): ThreadsReply[] {
  // Reply = post-node lain (punya code+caption+user) selain post utama. Sampel, bukan lengkap.
  const nodes = collect(blobs, o =>
    typeof o.code === "string" && o.code !== mainCode &&
    isObj(o.caption) && isObj(o.user) && typeof (o.user as JsonObj).username === "string",
  )
  const seen = new Set<string>()
  const out: ThreadsReply[] = []
  for (const n of nodes) {
    const code = n.code as string
    if (seen.has(code)) continue
    seen.add(code)
    const user = n.user as JsonObj
    const cap = n.caption as JsonObj
    out.push({
      username:  user.username as string,
      text:      (cap.text as string) ?? "",
      likes:     num(n.like_count) ?? 0,
      createdAt: new Date((num(n.taken_at) ?? 0) * 1000).toISOString(),
    })
    if (out.length >= 40) break
  }
  return out.filter(r => r.username !== mainUser)
}

const EMOJI_RE   = /\p{Extended_Pictographic}/gu
const MENTION_RE = /@[A-Za-z0-9._]+/g
const HASHTAG_RE = /#[\p{L}0-9_]+/gu
const LINK_RE    = /https?:\/\/\S+/g

function computeDerived(raw: ThreadPostRaw): ThreadPostComputed {
  const { engagement: e, text, media } = raw
  const engagement = e.likes + e.replies + e.reposts + e.quotes
  const rate = (n: number): number | null =>
    e.views && e.views > 0 ? Math.round((n / e.views) * 10000) / 10000 : null

  const contentHash = createHash("sha256")
    .update(text + "|" + media.imageUrls.join(","))
    .digest("hex").slice(0, 16)

  return {
    engagement,
    engagementRate:  rate(engagement),
    likeRate:        rate(e.likes),
    replyRate:       rate(e.replies),
    quoteRate:       rate(e.quotes),
    repostRate:      rate(e.reposts),
    shareRate:       rate(e.shares),
    wordCount:       text.trim() ? text.trim().split(/\s+/).length : 0,
    characterCount:  text.length,
    emojiCount:      (text.match(EMOJI_RE)   ?? []).length,
    lineCount:       text.split("\n").length,
    mentionCount:    (text.match(MENTION_RE) ?? []).length,
    hashtagCount:    (text.match(HASHTAG_RE) ?? []).length,
    externalLinkCount: (text.match(LINK_RE)  ?? []).length,
    contentHash,
  }
}

export async function scrapeThreadsPost(url: string): Promise<ThreadPost> {
  const { username, code } = parseThreadsUrl(url)
  const html  = await fetchThreadsHtml(url)
  const blobs = extractSjsBlobs(html)

  // Post utama = node dengan code target yang punya metrik (like_count).
  const candidates = collect(blobs, o => o.code === code && typeof o.like_count === "number")
  const node = candidates[0]
  if (!node) throw new Error(`Node post ${code} tidak ditemukan di blob.`)

  const user = (isObj(node.user) ? node.user : {}) as JsonObj
  const tpi  = (isObj(node.text_post_app_info) ? node.text_post_app_info : {}) as JsonObj
  const share = (isObj(tpi.share_info) ? tpi.share_info : {}) as JsonObj
  const cap  = (isObj(node.caption) ? node.caption : {}) as JsonObj
  const pk   = String(node.pk ?? node.id ?? "")

  const likes = num(node.like_count) ?? 0
  // Sanity fisika: views tak mungkin < likes. Bila terjadi (mis. holder berisi nilai
  // config utk post image), anggap views tak diketahui → null, jangan lapor angka mustahil.
  let views = pickViews(node, blobs, pk, code)
  if (views !== null && views < likes) {
    logger.warn("threads.scrapePost.viewsBelowLikes", { code, views, likes })
    views = null
  }

  const raw: ThreadPostRaw = {
    id:        pk,
    code,
    url,
    authorId:  String(user.pk ?? user.id ?? ""),
    username:  (user.username as string) ?? username,
    createdAt: new Date((num(node.taken_at) ?? 0) * 1000).toISOString(),
    text:      (cap.text as string) ?? "",
    isReply:   !!tpi.reply_to_author,
    isQuote:   !!share.quoted_post,
    isRepost:  !!share.reposted_post,
    engagement: {
      views,
      likes,
      replies: num(tpi.direct_reply_count)   ?? 0,
      reposts: num(tpi.repost_count)         ?? 0,
      quotes:  num(tpi.quote_count) ?? num(node.quote_count) ?? 0,
      shares:  num(tpi.reshare_count)        ?? 0,
    },
    media:       pickMedia(node),
    replySample: {
      totalCount: num(tpi.direct_reply_count) ?? 0,
      sampled:    extractReplies(blobs, code, (user.username as string) ?? username),
    },
  }

  const computed: ThreadPostComputed = computeDerived(raw)
  logger.info("threads.scrapePost", { code, username: raw.username, views: raw.engagement.views, likes: raw.engagement.likes })
  return { raw, computed, rawJson: node }
}
