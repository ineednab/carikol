// Threads Intelligence Pipeline — public API
// Lihat docs/16-threads-intelligence-pipeline.md
import { logger }               from "@/lib/logger"
import { scrapeThreadsPost }    from "./scrape-post"
import { scrapeThreadsProfile } from "./scrape-profile"
import type { ThreadsProfile }  from "./scrape-profile"
import type { ThreadPost }      from "./types"

export { scrapeThreadsPost, parseThreadsUrl } from "./scrape-post"
export { scrapeThreadsProfile }               from "./scrape-profile"
export type { ThreadsProfile }                from "./scrape-profile"
export { analyzePost, THREADS_PROMPT_VERSION, THREADS_PIPELINE_VERSION } from "./analyze-post"
export type { AnalyzedPost }                   from "./analyze-post"
export type * from "./types"

export interface ThreadsCreator {
  profile: ThreadsProfile
  posts:   ThreadPost[]
}

// Payload creator utuh (Jalur A): profil → fetch semua permalink post SSR paralel.
// Post yang gagal di-fetch di-skip (log warn), tidak menggagalkan seluruh creator.
export async function scrapeThreadsCreator(username: string): Promise<ThreadsCreator> {
  const profile = await scrapeThreadsProfile(username)

  const settled = await Promise.allSettled(
    profile.recentPostUrls.map(u => scrapeThreadsPost(u)),
  )
  const posts: ThreadPost[] = []
  for (const [i, r] of settled.entries()) {
    if (r.status === "fulfilled") posts.push(r.value)
    else logger.warn("threads.scrapeCreator.postFailed", { url: profile.recentPostUrls[i], error: String(r.reason) })
  }

  logger.info("threads.scrapeCreator", { username: profile.username, posts: posts.length })
  return { profile, posts }
}
