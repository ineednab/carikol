// Threads Intelligence Pipeline — per-post types
// Lihat docs/16-threads-intelligence-pipeline.md
//
// Step 1 mengisi `raw` (🟢) + `computed` (🔵). `intelligence` (🟡) & `analysis`
// diisi tahap AI berikutnya — sengaja dibiarkan opsional di sini.

export type ThreadsMediaType = "text" | "image" | "carousel" | "video"

export interface ThreadsReply {
  username:  string
  text:      string
  likes:     number
  createdAt: string   // ISO
}

export interface ThreadPostRaw {
  id:        string
  code:      string
  url:       string
  authorId:  string
  username:  string
  createdAt: string   // ISO (dari taken_at Unix)
  text:      string
  isReply:   boolean
  isQuote:   boolean
  isRepost:  boolean

  engagement: {
    views:   number | null   // dari view_counts NUMERIK; null bila disembunyikan
    likes:   number
    replies: number
    reposts: number
    quotes:  number
    shares:  number
  }

  media: {
    type:       ThreadsMediaType
    count:      number
    imageUrls:  string[]
    videoUrl:   string | null
    thumbnail:  string | null
    hasVideo:   boolean
    hasImage:   boolean
  }

  replySample: {
    totalCount: number
    sampled:    ThreadsReply[]   // ~30–40 top reply (bias: top, bukan kronologis)
  }
}

export interface ThreadPostComputed {
  engagement:       number        // likes+replies+reposts+quotes
  engagementRate:   number | null // engagement / views (null bila views null/0)
  likeRate:         number | null
  replyRate:        number | null
  quoteRate:        number | null
  repostRate:       number | null
  shareRate:        number | null
  wordCount:        number
  characterCount:   number
  emojiCount:       number
  lineCount:        number
  mentionCount:     number
  hashtagCount:     number
  externalLinkCount: number
  contentHash:      string        // hash(caption + mediaUrls) — konten mutable saja
}

// ─────────────────────────────────────── 🟡 INTELLIGENCE (output AI)
// Setiap inferensi dibungkus: value + confidence + evidence (explainable by construction).
export interface Inferred<T> {
  value:      T
  confidence: number     // 0–1
  evidence:   string[]   // kutipan asli pemicu inferensi
}

export type Tone      = "informative" | "humorous" | "inspirational" | "promotional" | "personal" | "controversial" | "neutral"
export type Intent    = "educate" | "entertain" | "promote" | "engage" | "inform" | "opinion"
export type HookType  = "question" | "statement" | "story" | "statistic" | "controversy" | "listicle" | "none"
export type CtaType   = "follow" | "comment" | "share" | "link" | "buy" | "none"
export type Sentiment = "positive" | "neutral" | "negative" | "mixed"

export interface PostEntity { type: "person" | "company" | "product" | "place"; name: string }

export interface PostIntelligence {
  content: {
    topic:     Inferred<{ topic: string; subtopic: string; microtopic: string }>
    tone:      Inferred<Tone>
    intent:    Inferred<Intent>
    hookType:  Inferred<HookType>
    ctaType:   Inferred<CtaType>
    sentiment: Inferred<Sentiment>
    language:  Inferred<string>
    keywords:  string[]
    entities:  PostEntity[]
  }
  audience: {
    replyQuality: Inferred<{ positiveRatio: number; negativeRatio: number; spamRatio: number; questionRatio: number }>
    persona:      Inferred<string[]>   // ⚠️ atas replySample (top, bias), bukan totalCount
    topics:       string[]
  }
  brand: {
    safety: {
      score:    number                 // 0–100 (100 = paling aman)
      severity: "LOW" | "MEDIUM" | "HIGH"
      labels:   string[]               // ["politics","religion",...]
      evidence: string[]
    }
    affinity: Inferred<Record<string, number>>   // { fintech: 0.95, gaming: 0.20 }
  }
  performance: {
    reason: {
      summary: string
      drivers: {
        type:       "hook" | "emotion" | "topic" | "timing" | "community" | "controversy"
        confidence: number
        evidence:   string
      }[]
    }
  }
}

// ⚙️ Provenance/state — hidup sejak scrape (PENDING), diisi worker AI.
export interface PostAnalysis {
  status:          "PENDING" | "RUNNING" | "SUCCESS" | "FAILED"
  model:           string | null   // null saat belum jalan
  promptVersion:   string
  pipelineVersion: string
  createdAt:       string           // ISO
  error?:          string           // diisi saat FAILED → worker retry
}

export interface ThreadPost {
  raw:           ThreadPostRaw
  computed:      ThreadPostComputed
  rawJson:       unknown   // blob relay mentah milik post — sumber kebenaran
  analysis?:     PostAnalysis        // diisi analyzePost()
  intelligence?: PostIntelligence    // ada hanya saat analysis.status === "SUCCESS"
}
