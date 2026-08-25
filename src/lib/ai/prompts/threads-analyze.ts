import type { ThreadPost } from "@/lib/threads/types"

// 1 structured call → content + audience + brand + performance.
// Reply analysis DILABEL bias: hanya top-reply sampel, bukan seluruh percakapan.
export function buildThreadsAnalyzePrompt(post: ThreadPost): string {
  const { raw, computed } = post
  const e = raw.engagement

  const replies = raw.replySample.sampled
    .slice(0, 30)
    .map((r, i) => `${i + 1}. @${r.username} (${r.likes} likes): ${r.text.replace(/\s+/g, " ").slice(0, 160)}`)
    .join("\n") || "(tidak ada sampel reply)"

  return `Kamu adalah analis konten media sosial Indonesia. Analisis SATU post Threads di bawah.
Hanya simpulkan dari bukti yang ADA — jangan mengarang. Untuk tiap inferensi, sertakan confidence (0–1)
dan evidence (kutipan asli dari caption/reply yang memicu kesimpulan). Bila bukti tipis, confidence rendah.

POST
- Caption: ${JSON.stringify(raw.text.slice(0, 1500))}
- Media: ${raw.media.type} (${raw.media.count})
- Metrik: views=${e.views ?? "?"}, likes=${e.likes}, replies=${e.replies}, reposts=${e.reposts}, quotes=${e.quotes}
- Engagement rate: ${computed.engagementRate ?? "?"}
- Emoji=${computed.emojiCount}, hashtag=${computed.hashtagCount}, mention=${computed.mentionCount}, link=${computed.externalLinkCount}

SAMPEL REPLY (top by likes — BIAS, bukan seluruh ${raw.replySample.totalCount} reply):
${replies}

Return JSON ONLY (isi persis struktur ini, confidence 0–1, evidence array kutipan):
{
  "content": {
    "topic":     { "value": { "topic": "", "subtopic": "", "microtopic": "" }, "confidence": 0, "evidence": [] },
    "tone":      { "value": "informative|humorous|inspirational|promotional|personal|controversial|neutral", "confidence": 0, "evidence": [] },
    "intent":    { "value": "educate|entertain|promote|engage|inform|opinion", "confidence": 0, "evidence": [] },
    "hookType":  { "value": "question|statement|story|statistic|controversy|listicle|none", "confidence": 0, "evidence": [] },
    "ctaType":   { "value": "follow|comment|share|link|buy|none", "confidence": 0, "evidence": [] },
    "sentiment": { "value": "positive|neutral|negative|mixed", "confidence": 0, "evidence": [] },
    "language":  { "value": "id|en|...", "confidence": 0, "evidence": [] },
    "keywords":  ["kata kunci"],
    "entities":  [{ "type": "person|company|product|place", "name": "" }]
  },
  "audience": {
    "replyQuality": { "value": { "positiveRatio": 0, "negativeRatio": 0, "spamRatio": 0, "questionRatio": 0 }, "confidence": 0, "evidence": [] },
    "persona":      { "value": ["deskripsi persona audiens dari reply"], "confidence": 0, "evidence": [] },
    "topics":       ["topik yang muncul di reply"]
  },
  "brand": {
    "safety":   { "score": 100, "severity": "LOW|MEDIUM|HIGH", "labels": [], "evidence": [] },
    "affinity": { "value": { "kategori": 0.0 }, "confidence": 0, "evidence": [] }
  },
  "performance": {
    "reason": {
      "summary": "kenapa post ini perform begini, 1-2 kalimat",
      "drivers": [{ "type": "hook|emotion|topic|timing|community|controversy", "confidence": 0, "evidence": "" }]
    }
  }
}`
}
