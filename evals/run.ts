import "./_env" // WAJIB pertama — muat SUMOPOD_API_KEY sebelum ai/client di-init

import { scrapeThreadsCreator }  from "@/lib/threads"
import { generateCreatorBrief }  from "@/lib/threads/creator-brief"
import type { CreatorBrief }     from "@/lib/threads/creator-brief"
import type { GoldenCreator }    from "./schema"

import { hafshadini }  from "./creators/hafshadini"
import { jeromepolin } from "./creators/jeromepolin"
import { richardlee }  from "./creators/richardlee"

const GOLDEN: GoldenCreator[] = [hafshadini, jeromepolin, richardlee]

// ── util ──────────────────────────────────────────────────────────
const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, " ").trim()

// Teks "framing positif" — cara AI MENGGAMBARKAN creator. Sengaja TIDAK
// menyertakan brandFit.avoid: di situ term negatif ("hindari brand Gaming")
// memang SEHARUSNYA muncul, jadi bukan pelanggaran must_not_include.
function positiveText(b: CreatorBrief): string {
  return [
    b.identity.statement,
    b.audience.statement,
    b.content.statement,
    b.communication.statement,
    b.brandFit.statement,
    ...b.brandFit.fit,
  ].join("  ")
}

function allEvidence(b: CreatorBrief) {
  return [
    ...b.identity.evidence,
    ...b.audience.evidence,
    ...b.content.evidence,
    ...b.communication.evidence,
    ...b.brandFit.evidence,
  ]
}

// LEVEL 2a — hard-negative: term terlarang tidak boleh muncul (word-boundary,
// jadi "AI" tidak nyangkut di "santai"/"pakai").
function checkMustNotInclude(b: CreatorBrief, forbidden: string[]): string[] {
  const text = positiveText(b)
  const hits: string[] = []
  for (const term of forbidden) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
    if (re.test(text)) hits.push(term)
  }
  return hits
}

// LEVEL 2b — grounding: tiap quote evidence harus benar-benar ada di caption.
function checkGrounding(b: CreatorBrief, captionsNorm: string) {
  const ev = allEvidence(b)
  let grounded = 0
  const ungrounded: string[] = []
  for (const e of ev) {
    const q = norm(e.quote)
    if (q.length >= 3 && captionsNorm.includes(q)) grounded += 1
    else ungrounded.push(e.quote.slice(0, 60))
  }
  const claimsWithEvidence = [b.identity, b.audience, b.content, b.communication, b.brandFit].filter(
    (c) => c.evidence.length > 0,
  ).length
  return { total: ev.length, grounded, ungrounded, claimsWithEvidence, claimsTotal: 5 }
}

// ── run ───────────────────────────────────────────────────────────
async function evalOne(golden: GoldenCreator) {
  let posts, brief: CreatorBrief | null
  try {
    const creator = await scrapeThreadsCreator(golden.username)
    posts = creator.posts
    if (posts.length === 0) return { golden, status: "ERROR" as const, error: "0 post ter-scrape" }
    brief = await generateCreatorBrief(golden.username, posts)
  } catch (e) {
    return { golden, status: "ERROR" as const, error: String(e) }
  }
  if (!brief) return { golden, status: "ERROR" as const, error: "brief null (AI gagal)" }

  const captionsNorm = norm(posts.map((p) => p.raw.text || "").join("  "))
  const forbiddenHits = checkMustNotInclude(brief, golden.mustNotInclude)
  const grounding = checkGrounding(brief, captionsNorm)

  const pass = forbiddenHits.length === 0 && grounding.claimsWithEvidence >= 4
  return {
    golden,
    status: pass ? ("PASS" as const) : ("FAIL" as const),
    brief,
    forbiddenHits,
    grounding,
  }
}

async function main() {
  console.log(`\n=== CariKOL Creator-Brief Eval — Level 2 (grounding + must_not_include) ===`)
  console.log(`Golden creators: ${GOLDEN.length}\n`)

  const results = []
  for (const g of GOLDEN) {
    process.stdout.write(`• @${g.username} … `)
    const r = await evalOne(g)
    results.push(r)
    if (r.status === "ERROR") {
      console.log(`ERROR — ${r.error}`)
      continue
    }
    const g2 = r.grounding
    console.log(
      `${r.status}  ` +
        `[tier=${r.brief.tier} n=${r.brief.sampleSize}] ` +
        `must_not_include: ${r.forbiddenHits.length === 0 ? "ok" : "HIT " + r.forbiddenHits.join(",")} · ` +
        `grounding: ${g2.grounded}/${g2.total} quotes, ${g2.claimsWithEvidence}/5 klaim ber-evidence`,
    )
    if (r.forbiddenHits.length > 0) {
      console.log(`    ✗ identity: ${r.brief.identity.statement}`)
    }
    if (g2.ungrounded.length > 0) {
      console.log(`    ⚠ quote tak ditemukan di caption: ${g2.ungrounded.map((q) => `"${q}"`).join(", ")}`)
    }
  }

  const scored = results.filter((r) => r.status !== "ERROR")
  const passed = scored.filter((r) => r.status === "PASS").length
  const errored = results.length - scored.length
  console.log(`\n--- SUMMARY ---`)
  console.log(`PASS ${passed}/${scored.length}` + (errored ? ` · ERROR ${errored}` : ""))
  console.log(scored.length > 0 ? `Score: ${Math.round((passed / scored.length) * 100)}%\n` : "\n")

  // exit code non-zero kalau ada FAIL (bukan ERROR jaringan) → berguna nanti di CI
  const hardFail = scored.some((r) => r.status === "FAIL")
  process.exit(hardFail ? 1 : 0)
}

main()
