// Step 3 — analyzePost(post)  (Tier 🟡 intelligence)
// 1 structured AI call → content + audience + brand + performance, dibungkus Inferred<T>.
// Output model divalidasi defensif: enum di-whitelist, confidence & ratio di-clamp,
// evidence dipaksa array. Bila call gagal → analysis.status=FAILED, intelligence undefined.
import { logger }                    from "@/lib/logger"
import { generateJSON }              from "@/lib/ai/client"
import { AI_MODEL }                  from "@/lib/ai/client"
import { buildThreadsAnalyzePrompt } from "@/lib/ai/prompts/threads-analyze"
import type {
  ThreadPost, PostAnalysis, PostIntelligence, Inferred,
  Tone, Intent, HookType, CtaType, Sentiment, PostEntity,
} from "./types"

export const THREADS_PROMPT_VERSION   = "threads-analyze-v1"
export const THREADS_PIPELINE_VERSION = "1.0.0"

// ── coercion helpers ──────────────────────────────────────────────
const clamp01 = (n: unknown): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0
  return v < 0 ? 0 : v > 1 ? 1 : v
}
const strArr = (x: unknown): string[] =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []

const oneOf = <T extends string>(x: unknown, allowed: readonly T[], fallback: T): T =>
  typeof x === "string" && (allowed as readonly string[]).includes(x) ? (x as T) : fallback

function inferred<T>(raw: unknown, coerceValue: (v: unknown) => T): Inferred<T> {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return { value: coerceValue(o.value), confidence: clamp01(o.confidence), evidence: strArr(o.evidence) }
}

const TONES:      readonly Tone[]      = ["informative", "humorous", "inspirational", "promotional", "personal", "controversial", "neutral"]
const INTENTS:    readonly Intent[]    = ["educate", "entertain", "promote", "engage", "inform", "opinion"]
const HOOKS:      readonly HookType[]  = ["question", "statement", "story", "statistic", "controversy", "listicle", "none"]
const CTAS:       readonly CtaType[]   = ["follow", "comment", "share", "link", "buy", "none"]
const SENTIMENTS: readonly Sentiment[] = ["positive", "neutral", "negative", "mixed"]
const ENTITY_TYPES = ["person", "company", "product", "place"] as const
const DRIVER_TYPES = ["hook", "emotion", "topic", "timing", "community", "controversy"] as const

function coerceIntelligence(raw: Record<string, unknown>): PostIntelligence {
  const content  = (raw.content     ?? {}) as Record<string, unknown>
  const audience = (raw.audience    ?? {}) as Record<string, unknown>
  const brand    = (raw.brand       ?? {}) as Record<string, unknown>
  const perf     = (raw.performance ?? {}) as Record<string, unknown>

  const safety   = (brand.safety ?? {}) as Record<string, unknown>
  const reason   = (perf.reason  ?? {}) as Record<string, unknown>

  const score = typeof safety.score === "number" ? Math.max(0, Math.min(100, safety.score)) : 100

  const drivers = (Array.isArray(reason.drivers) ? reason.drivers : [])
    .map((d) => {
      const o = (d && typeof d === "object" ? d : {}) as Record<string, unknown>
      return {
        type:       oneOf(o.type, DRIVER_TYPES, "topic"),
        confidence: clamp01(o.confidence),
        evidence:   typeof o.evidence === "string" ? o.evidence : "",
      }
    })

  const affinityVal = (v: unknown): Record<string, number> => {
    const out: Record<string, number> = {}
    if (v && typeof v === "object") {
      for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
        if (typeof n === "number" && Number.isFinite(n)) out[k] = clamp01(n)
      }
    }
    return out
  }

  return {
    content: {
      topic: inferred(content.topic, (v) => {
        const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>
        return {
          topic:      typeof o.topic === "string" ? o.topic : "",
          subtopic:   typeof o.subtopic === "string" ? o.subtopic : "",
          microtopic: typeof o.microtopic === "string" ? o.microtopic : "",
        }
      }),
      tone:      inferred(content.tone,      (v) => oneOf(v, TONES, "neutral")),
      intent:    inferred(content.intent,    (v) => oneOf(v, INTENTS, "inform")),
      hookType:  inferred(content.hookType,  (v) => oneOf(v, HOOKS, "none")),
      ctaType:   inferred(content.ctaType,   (v) => oneOf(v, CTAS, "none")),
      sentiment: inferred(content.sentiment, (v) => oneOf(v, SENTIMENTS, "neutral")),
      language:  inferred(content.language,  (v) => (typeof v === "string" ? v : "id")),
      keywords:  strArr(content.keywords),
      entities:  (Array.isArray(content.entities) ? content.entities : [])
        .map((x): PostEntity | null => {
          const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>
          if (typeof o.name !== "string" || !o.name) return null
          return { type: oneOf(o.type, ENTITY_TYPES, "product"), name: o.name }
        })
        .filter((x): x is PostEntity => x !== null),
    },
    audience: {
      replyQuality: inferred(audience.replyQuality, (v) => {
        const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>
        return {
          positiveRatio: clamp01(o.positiveRatio),
          negativeRatio: clamp01(o.negativeRatio),
          spamRatio:     clamp01(o.spamRatio),
          questionRatio: clamp01(o.questionRatio),
        }
      }),
      persona: inferred(audience.persona, (v) => strArr(v)),
      topics:  strArr(audience.topics),
    },
    brand: {
      safety: {
        score,
        severity: oneOf(safety.severity, ["LOW", "MEDIUM", "HIGH"] as const, "LOW"),
        labels:   strArr(safety.labels),
        evidence: strArr(safety.evidence),
      },
      affinity: inferred(brand.affinity, affinityVal),
    },
    performance: {
      reason: {
        summary: typeof reason.summary === "string" ? reason.summary : "",
        drivers,
      },
    },
  }
}

export type AnalyzedPost = ThreadPost & { analysis: PostAnalysis }

export async function analyzePost(post: ThreadPost): Promise<AnalyzedPost> {
  const base: PostAnalysis = {
    status:          "RUNNING",
    model:           AI_MODEL,
    promptVersion:   THREADS_PROMPT_VERSION,
    pipelineVersion: THREADS_PIPELINE_VERSION,
    createdAt:       new Date().toISOString(),
  }

  try {
    // 8192: model reasoning membakar ~3.8k token tersembunyi sebelum output;
    // budget kecil (2–4k) truncate → JSON tak lengkap → parse null.
    const raw = await generateJSON<Record<string, unknown>>(buildThreadsAnalyzePrompt(post), 8192)
    if (!raw) {
      logger.warn("threads.analyzePost.empty", { code: post.raw.code })
      return { ...post, analysis: { ...base, status: "FAILED", error: "AI returned no JSON" } }
    }
    const intelligence = coerceIntelligence(raw)
    logger.info("threads.analyzePost", {
      code:   post.raw.code,
      tone:   intelligence.content.tone.value,
      safety: intelligence.brand.safety.score,
    })
    return { ...post, analysis: { ...base, status: "SUCCESS" }, intelligence }
  } catch (err) {
    logger.warn("threads.analyzePost.failed", { code: post.raw.code, error: String(err) })
    return { ...post, analysis: { ...base, status: "FAILED", error: String(err) } }
  }
}
