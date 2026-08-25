import type { ThreadPost } from "@/lib/threads/types"

// AI Reasoning → Creator Brief.
// Filosofi: JANGAN mengklasifikasi ke label. BACA akun seperti manusia lalu
// jawab 5 pertanyaan dalam PROSA. Setiap klaim WAJIB mengutip bukti dari post
// yang tersedia (postCode + kutipan persis). Lebar klaim menyempit mengikuti
// jumlah sampel — sedikit data = banyak hedge. Dilarang mengarang kategori
// yang tidak ada buktinya di post.
export function buildCreatorBriefPrompt(
  username: string,
  posts: ThreadPost[],
  hedge: string,
): string {
  const postBlocks = posts
    .map((p, i) => {
      const e = p.raw.engagement
      return [
        `POST #${i + 1} [code=${p.raw.code}] (${p.raw.media.type})`,
        `metrik: views=${e.views ?? "?"} likes=${e.likes} replies=${e.replies}`,
        `caption: ${JSON.stringify((p.raw.text || "").replace(/\s+/g, " ").slice(0, 900))}`,
      ].join("\n")
    })
    .join("\n\n")

  return `Kamu analis creator Indonesia untuk agensi influencer. Kamu diberi ${posts.length} postingan
Threads publik dari @${username}. Baca semuanya, lalu jawab 5 pertanyaan sebagai PROSA singkat
(bukan daftar label). Tulis dalam Bahasa Indonesia.

ATURAN KETAT — patuhi atau hasil ditolak:
1. Hanya simpulkan dari bukti yang ADA di ${posts.length} post ini. DILARANG mengarang topik/niche
   yang tidak muncul di caption. Kalau tidak ada bukti untuk sesuatu, jangan sebut.
2. Setiap jawaban WAJIB menyertakan "evidence": array {postCode, quote, role}. "quote" HARUS potongan
   kata yang PERSIS ada di caption post tsb (copy apa adanya, boleh dipotong). "role"="primary" untuk
   bukti terkuat, "supporting" untuk pendukung. Klaim tanpa bukti = dilarang.
3. Kalibrasi ke jumlah data. ${hedge}
4. Untuk brandFit: "fit" = kategori brand yang cocok (berdasarkan bukti), "avoid" = kategori yang JELAS
   tidak nyambung dengan konten ini. Jangan menyebut kategori teknis (AI, developer, SaaS, crypto,
   gaming, dll) kecuali caption benar-benar membahasnya.

5 PERTANYAAN:
- identity      : Siapa creator ini? (karakter utama, dalam 1–2 kalimat)
- audience      : Siapa yang kemungkinan mengikuti mereka?
- content       : Apa yang biasanya mereka posting?
- communication : Bagaimana gaya mereka berkomunikasi?
- brandFit      : Brand kategori apa yang cocok, dan apa yang harus dihindari?

POSTINGAN:
${postBlocks}

Return JSON ONLY, persis struktur ini:
{
  "identity":      { "statement": "", "evidence": [{ "postCode": "", "quote": "", "role": "primary" }] },
  "audience":      { "statement": "", "evidence": [{ "postCode": "", "quote": "", "role": "supporting" }] },
  "content":       { "statement": "", "evidence": [] },
  "communication": { "statement": "", "evidence": [] },
  "brandFit":      { "statement": "", "fit": [], "avoid": [], "evidence": [] }
}`
}
