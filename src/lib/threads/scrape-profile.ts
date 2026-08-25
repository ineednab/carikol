// Step 2 — scrapeThreadsProfile(username)  (Tier 🟢, Jalur A / no-login)
// follower_count + 4 post terbaru (SSR) + authorId. Lihat docs/16-threads-intelligence-pipeline.md
import { logger } from "@/lib/logger"
import {
  type JsonObj, isObj, num, collect, extractSjsBlobs, fetchThreadsHtml, unesc,
} from "./internal"

export interface ThreadsProfile {
  username:        string
  authorId:        string
  displayName:     string
  biography:       string | null
  avatarUrl:       string | null
  isVerified:      boolean
  followerCount:   number
  followingCount:  number | null   // tidak diekspos logged-out → biasanya null
  postCount:       number | null   // dari og:description ("N Threads")
  recentPostCodes: string[]        // Jalur A: hanya ~4 post SSR
  recentPostUrls:  string[]
}

const metaContent = (html: string, prop: string): string | null => {
  const m = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`))
  return m ? m[1] : null
}

// Decode entity HTML sederhana yang muncul di og tags (&amp; &#x2022; dst).
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
}

export async function scrapeThreadsProfile(username: string): Promise<ThreadsProfile> {
  const handle = username.replace(/^@/, "")
  const url = `https://www.threads.com/@${handle}`
  const html  = await fetchThreadsHtml(url)
  const blobs = extractSjsBlobs(html)

  // Node owner = objek dengan username cocok DAN follower_count numerik.
  const owner = collect(blobs, o =>
    o.username === handle && typeof o.follower_count === "number",
  )[0]
  if (!owner) throw new Error(`Node profil @${handle} tidak ditemukan (mungkin private/berubah).`)

  const authorId = String(owner.pk ?? owner.id ?? "")

  // displayName: full_name (bisa unicode) → og:title sebelum " (@" → handle.
  const ogTitle = decodeEntities(metaContent(html, "og:title") ?? "")
  const displayName =
    (typeof owner.full_name === "string" && owner.full_name.trim()) ||
    ogTitle.split(" (@")[0] ||
    handle

  // postCount dari og:description: "... • 253 Threads • ..."
  const ogDesc = decodeEntities(metaContent(html, "og:description") ?? "")
  const postCount = (() => {
    const m = ogDesc.match(/([\d,.]+)\s*Threads/i)
    return m ? parseInt(m[1].replace(/[,.]/g, ""), 10) : null
  })()

  // Post milik owner: node ber-code yang user-nya = owner. Dedupe, jaga urutan.
  const ownerPosts = collect(blobs, o =>
    typeof o.code === "string" &&
    isObj(o.user) &&
    ((o.user as JsonObj).username === handle || String((o.user as JsonObj).pk ?? "") === authorId),
  )
  const seen = new Set<string>()
  const recentPostCodes: string[] = []
  for (const p of ownerPosts) {
    const code = p.code as string
    if (!seen.has(code)) { seen.add(code); recentPostCodes.push(code) }
  }

  const profile: ThreadsProfile = {
    username:       handle,
    authorId,
    displayName,
    biography:      typeof owner.biography === "string" ? owner.biography : null,
    avatarUrl:      unesc(owner.profile_pic_url as string | undefined),
    isVerified:     owner.is_verified === true,
    followerCount:  num(owner.follower_count) ?? 0,
    followingCount: num(owner.following_count),
    postCount,
    recentPostCodes,
    recentPostUrls: recentPostCodes.map(c => `https://www.threads.com/@${handle}/post/${c}`),
  }

  logger.info("threads.scrapeProfile", {
    username: handle, followers: profile.followerCount, posts: recentPostCodes.length,
  })
  return profile
}
