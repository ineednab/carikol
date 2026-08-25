// AI Reasoning → Creator Brief (Tier 🟡, level akun).
// Menjawab 5 pertanyaan sebagai prosa + evidence per klaim. Confidence & tier
// diturunkan dari JUMLAH SAMPEL (deterministik), BUKAN dari keyakinan AI —
// sesuai prinsip: makin sedikit data, makin sempit klaim.
import { logger }                   from "@/lib/logger"
import { generateJSON, AI_MODEL }   from "@/lib/ai/client"
import { buildCreatorBriefPrompt }  from "@/lib/ai/prompts/creator-brief"
import type { ThreadPost }          from "./types"

export const CREATOR_BRIEF_PROMPT_VERSION = "creator-brief-v1"

export type BriefTier       = "snapshot" | "intelligence" | "connected"
export type BriefConfidence = "LOW" | "MEDIUM" | "HIGH"
export type EvidenceRole    = "primary" | "supporting"

export interface BriefEvidence {
  postCode: string
  quote:    string
  role:     EvidenceRole
}

export interface BriefClaim {
  statement: string
  evidence:  BriefEvidence[]
}

export interface BriefBrandFit {
  statement: string
  fit:       string[]
  avoid:     string[]
  evidence:  BriefEvidence[]
}

export interface CreatorBrief {
  username:      string
  tier:          BriefTier
  confidence:    BriefConfidence
  sampleSize:    number
  model:         string
  promptVersion: string
  identity:      BriefClaim
  audience:      BriefClaim
  content:       BriefClaim
  communication: BriefClaim
  brandFit:      BriefBrandFit
}

// Confidence = fungsi dari sampel (bukan AI). Tier menyempit kalau data tipis.
export function tierForSample(n: number): { tier: BriefTier; confidence: BriefConfidence; hedge: string } {
  if (n < 10) {
    return {
      tier: "snapshot",
      confidence: "LOW",
      hedge:
        `Kamu HANYA punya ${n} post — sampel acak dari ujung timeline. Wajib hedge: pakai kata seperti ` +
        `"berdasarkan post terbaru", "tampaknya", "sinyal awal". JANGAN mengklaim identitas menyeluruh, ` +
        `demografi audiens pasti, atau pola jangka panjang. Kalau bukti tak cukup untuk sebuah pertanyaan, ` +
        `katakan terus terang bahwa datanya belum cukup.`,
    }
  }
  if (n < 100) {
    return {
      tier: "intelligence",
      confidence: "MEDIUM",
      hedge:
        `Kamu punya ${n} post — cukup untuk pola, belum untuk kepastian. Boleh menyimpulkan identity, pilar ` +
        `konten, gaya komunikasi, dan brand fit, tapi tetap tandai sebagai pola yang teramati, bukan fakta mutlak.`,
    }
  }
  return {
    tier: "connected",
    confidence: "HIGH",
    hedge:
      `Kamu punya ${n} post (histori memadai). Boleh menyimpulkan positioning jangka panjang dengan percaya diri, ` +
      `namun setiap klaim tetap harus berbasis bukti.`,
  }
}

// ── coercion ──────────────────────────────────────────────────────
const str = (x: unknown): string => (typeof x === "string" ? x : "")
const strArr = (x: unknown): string[] =>
  Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []

function coerceEvidence(x: unknown): BriefEvidence[] {
  if (!Array.isArray(x)) return []
  return x
    .map((e): BriefEvidence | null => {
      const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>
      const quote = str(o.quote)
      if (!quote) return null
      return {
        postCode: str(o.postCode),
        quote,
        role: o.role === "primary" ? "primary" : "supporting",
      }
    })
    .filter((e): e is BriefEvidence => e !== null)
}

function coerceClaim(x: unknown): BriefClaim {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>
  return { statement: str(o.statement), evidence: coerceEvidence(o.evidence) }
}

function coerceBrandFit(x: unknown): BriefBrandFit {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>
  return {
    statement: str(o.statement),
    fit:       strArr(o.fit),
    avoid:     strArr(o.avoid),
    evidence:  coerceEvidence(o.evidence),
  }
}

export async function generateCreatorBrief(
  username: string,
  posts: ThreadPost[],
): Promise<CreatorBrief | null> {
  const sampleSize = posts.length
  const { tier, confidence, hedge } = tierForSample(sampleSize)

  const raw = await generateJSON<Record<string, unknown>>(
    buildCreatorBriefPrompt(username, posts, hedge),
    8192,
  )
  if (!raw) {
    logger.warn("threads.creatorBrief.empty", { username })
    return null
  }

  const brief: CreatorBrief = {
    username,
    tier,
    confidence,
    sampleSize,
    model:         AI_MODEL,
    promptVersion: CREATOR_BRIEF_PROMPT_VERSION,
    identity:      coerceClaim(raw.identity),
    audience:      coerceClaim(raw.audience),
    content:       coerceClaim(raw.content),
    communication: coerceClaim(raw.communication),
    brandFit:      coerceBrandFit(raw.brandFit),
  }

  logger.info("threads.creatorBrief", { username, tier, sampleSize })
  return brief
}
