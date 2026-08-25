const TALENT_LABELS: Record<string, string> = {
  CREATOR:   "Creator / Influencer",
  UGC:       "UGC Creator",
  KOL:       "Key Opinion Leader",
  AFFILIATE: "Affiliate Creator",
  TALENT:    "Talent / Personality",
  OTHER:     "Creator",
}

// Tier hanya membentuk NUANCE positioning — bukan angka yang diklaim.
const TIER_NUANCE: Record<string, string> = {
  BUZZER: "audiens kecil tapi personal, cocok untuk amplifikasi & word-of-mouth",
  NANO:   "komunitas kecil yang sangat engaged dan personal",
  MIKRO:  "audiens niche dengan kepercayaan tinggi",
  MAKRO:  "jangkauan luas dengan pengaruh yang kuat di kategorinya",
}

type BioInput = {
  talentTypes: string[]
  categories:  string[]
  tier?:       string
}

export function buildBioPrompt({ talentTypes, categories, tier }: BioInput): string {
  const types = talentTypes.map((t) => TALENT_LABELS[t] ?? t).join(", ")
  const cats  = categories.join(", ")
  const nuance = tier ? TIER_NUANCE[tier] : null

  return `Kamu penulis bio kreator untuk marketplace talent Indonesia. Tulis SATU bio singkat orang pertama yang menggambarkan POSITIONING & gaya konten kreator ini.

Data:
- Tipe talent: ${types}
- Kategori konten: ${cats}
${nuance ? `- Skala/gaya: ${nuance}` : ""}

Aturan penting:
- Maksimal 200 karakter, 1-2 kalimat, bahasa Indonesia natural (boleh 1-2 istilah Inggris umum seperti "honest review").
- Fokus pada APA yang dibuat & gayanya — BUKAN klaim angka.
- DILARANG menyebut jumlah follower, engagement rate, views, atau angka apa pun.
- Jangan pakai tanda kutip, hashtag, atau emoji.
- Terdengar meyakinkan tapi jujur, bukan hiperbolik.

Return HANYA JSON (tanpa teks lain):
{"bio": "teks bio di sini"}`
}
