# Threads Intelligence Pipeline
CariKOL — Arsitektur Scraping & Analisis Konten Threads
Last updated: 2026-08-10

---

## Prinsip Desain

> Crawl sekali, simpan raw, parser boleh berkembang.
> Jangan pernah mengklaim lebih dari bukti yang bisa ditunjuk.

Pipeline ini memisahkan **data objektif** dari **inferensi AI** secara struktural, dan setiap
output AI wajib membawa **confidence** + **evidence**. Kalau model berganti (GPT-5.5 → GPT-6 →
model internal), lapisan `raw` tidak pernah tersentuh — cukup re-analisis dari blob mentah.

---

## Temuan Validasi (empiris, 2026-08-10)

Diuji langsung terhadap `@salpriadi/post/Dbx641YE8Dy` dan `@hafshadini_/post/Db0J_jkkxiW`.

| Temuan | Detail | Implikasi |
|---|---|---|
| **Consent-gate, bukan IP-block** | Plain fetch → shell 576KB, `RelayPrefetchedStreamCache` dicopot, 10× "Consent". | Datacenter IP OK — **tidak perlu proxy residential**. |
| **Cookie = kunci** | Kirim `Cookie:` apa pun (dummy `mid=xyz`) + header browser wajar → data penuh 848KB, blob Relay lengkap. | Cukup 1 cookie palsu. **Tanpa headless browser.** |
| **Views di `view_counts` (angka)** | `impression_count` selalu `null`. Angka asli di `view_counts` (salpriadi 8146, hafshadini 276791). ⚠️ Ada DUA field bernama `view_counts`: satu **boolean** toggle (`false` = views disembunyikan) dan satu **number**. | Parser ambil yang bertipe number; kalau hanya boolean `false` → views = null (private). |
| **Profil = SSR (parsial)** | `follower_count: 138276` ada; `og:description` = "138.3K Followers • 253 Threads"; tapi timeline SSR **hanya 4 post pertama**. | 12 post penuh butuh GraphQL paginate. |
| **Media & reply ada di blob** | `media_type`, `carousel_media`, `video_versions`, `image_versions2`, `audio` + ~30–40 top reply (text + author). | Content-intel & convo-quality feasible dari 1 fetch. |

### Recipe fetch (validated)
```
GET https://www.threads.com/@{user}/post/{code}
  User-Agent: Mozilla/5.0 ... Chrome/131 ...
  Accept-Language: en-US,en;q=0.9
  Sec-Fetch-Dest: document | Mode: navigate | Site: none
  Cookie: ig_did=1; csrftoken=abc; mid=xyz     ← WAJIB (dummy pun jadi)
→ parse <script type="application/json" data-sjs> → cari "RelayPrefetchedStreamCache"
```

---

## Tiga Lapisan Data (source tier)

```
🟢 raw          — langsung dari blob JSON. Instan, 0 biaya AI.
🔵 computed     — aritmatika di atas raw (rasio, hitungan teks). Instan, deterministik.
🟡 intelligence — output AI. Async, nullable, ber-confidence + evidence, ber-versi.
```

Field velocity/half-life/growth-curve **tidak** masuk per-post (butuh time-series) — lihat §Snapshots.

---

## Wrapper Explainability

Setiap output AI dibungkus. Confidence + evidence jadi struktural, bukan opsional.

```ts
interface Inferred<T> {
  value:      T
  confidence: number     // 0–1
  evidence:   string[]   // kutipan asli pemicu inferensi
}
```

---

## Skema `ThreadPost` (final)

```ts
interface ThreadPost {
  // ─────────────────────────────────────────────── 🟢 RAW
  raw: {
    id; code; url; authorId; username;
    createdAt;                        // taken_at (Unix) → Date
    text;
    isReply; isQuote; isRepost;
    engagement: { views; likes; replies; reposts; quotes; shares };  // views: number|null (dari view_counts NUMERIK, bukan boolean toggle)
    media: {
      type;                           // text | image | carousel | video  (dari media_type int)
      count; imageUrls[]; videoUrl; thumbnail; aspectRatio;
      hasVideo; hasImage;
    };
    replySample: { totalCount; sampled: { username; text; likes; createdAt }[] };  // ~30–40 top
    rawJson;                          // blob mentah = sumber kebenaran
  }

  // ─────────────────────────────────────────────── 🔵 COMPUTED
  computed: {
    engagement;                       // likes+replies+reposts+quotes
    engagementRate;                   // engagement/views  → null bila views 0
    likeRate; replyRate; quoteRate; repostRate; shareRate;
    wordCount; characterCount; emojiCount; lineCount;
    mentionCount; hashtagCount; externalLinkCount;
    contentHash;                      // hash(caption + mediaUrls) — konten MUTABLE saja (bukan timestamp). Stabil antar-snapshot; berubah = edit → re-run AI.
    performance;                      // LOW | NORMAL | HIGH | VIRAL   (self-relative)
    percentile;                       // vs 12 post creator SENDIRI, bukan global
  }

  // ─────────────────────────────────────────────── ⚙️ ANALYSIS (SELALU ada — provenance/state)
  // Hidup sejak post di-scrape, sebelum AI jalan. status=PENDING → intelligence masih null.
  analysis: {
    status;                            // PENDING | RUNNING | SUCCESS | FAILED
    model;                             // "gpt-5.5"  (null saat belum jalan)
    promptVersion; pipelineVersion;
    createdAt; error?;                 // error diisi saat FAILED → worker bisa retry
  }

  // ─────────────────────────────────────────────── 🟡 INTELLIGENCE (nullable; isi hanya saat status=SUCCESS)
  intelligence?: {
    content: {
      topic:    Inferred<{ topic; subtopic; microtopic }>   // taksonomi 3 tingkat
      tone:     Inferred<Tone>
      intent:   Inferred<Intent>
      hookType: Inferred<HookType>
      ctaType:  Inferred<CtaType>
      sentiment:Inferred<Sentiment>
      language: Inferred<string>
      keywords: string[]
      entities: { type: "person"|"company"|"product"|"place"; name: string }[]
    }
    audience: {
      replyQuality: Inferred<{ positiveRatio; negativeRatio; spamRatio; questionRatio }>
      persona:      Inferred<string[]>   // ⚠️ atas replySample (top, bias), bukan totalCount
      topics:       string[]
    }
    brand: {
      safety: {
        score;                         // 0–100
        severity;                      // LOW | MEDIUM | HIGH
        labels;                        // ["politics","religion",...]
        evidence;                      // kutipan pemicu
      }
      affinity: Inferred<Record<string, number>>   // { fintech: 0.95, gaming: 0.20 }
    }
    performance: {
      reason: {
        summary: string
        drivers: {
          type: "hook"|"emotion"|"topic"|"timing"|"community"|"controversy"
          confidence: number
          evidence: string
        }[]
      }
    }
  }
}
```

### Kenapa dibentuk begini
- **`raw` / `computed` / `intelligence` terpisah** → ganti model AI tanpa menyentuh data objektif.
- **`Inferred<T>`** → `confidence` (#4) + `evidence` seragam di seluruh output. Explainable by construction.
- **`performance.reason.drivers[]`** (bukan string) → bisa di-query: "driver viral tersering di creator ini".
- **`brand.safety.score`** (bukan boolean) → severity + evidence, fleksibel untuk filter agency.
- **taksonomi topic 3 tingkat** → filtering & agregasi Creator Intelligence jauh lebih tajam.
- **`entities` bertipe** → siap jadi graph.
- **`analysis` di level atas (bukan nested)** → status hidup sejak scrape (`PENDING`) sebelum `intelligence` ada; worker retry via `FAILED`+`error`. AI tidak jalan tiap crawl.
- **`contentHash`** → skip AI & cache embedding kalau konten tak berubah; deteksi edit/duplikat.

---

## Keputusan Terkunci (MVP)

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Embedding / semantic search | **Ditunda** | `keywords`+`entities` cukup untuk filter awal; pgvector nyusul saat search dibutuhkan. |
| `percentile` cohort | **Self-relative** (12 post sendiri) | Global cohort butuh DB besar dulu; "post terbaik ke-2 dia" sudah actionable. |
| AI + brandSafety | **1 structured call** | Lebih murah, 1 round-trip. |
| Reply analysis | **Atas `replySample` (~30–40)** | Blob tak bawa semua reply; `totalCount` tetap disimpan, ratio dilabel "sampel". |
| Growth/velocity/half-life | **Keluar dari per-post** | Butuh snapshot berulang → lihat §Snapshots. |

---

## Known Limitations & Open Risks

Jujur soal apa yang **belum** kevalidasi atau punya batas — supaya sistem tidak over-claim.

| # | Risiko | Status | Mitigasi / Keputusan |
|---|---|---|---|
| **R1** | **GraphQL pagination.** ✅ TERUJI 2026-08-10: endpoint `/api/graphql` **menerima request logged-out** (HTTP 200, resolver jalan, tanpa login-wall). Header wajib: `X-FB-LSD` (dari HTML) + `X-IG-App-ID` + `Sec-Fetch-Site: same-origin` + cookie dummy; `fb_dtsg` kosong OK. ⚠️ TAPI replay query profile-threads logged-out balik `viewer.user:null` + data null → timeline **viewer-gated**. Halaman-1 (4 post) ada via SSR; pagination lanjutan **kemungkinan butuh session login**. | 🟡 Partially resolved | **Jalur A (no-login):** follower + 4 post SSR + metrik penuh per permalink. **Jalur B (12 post):** butuh 1 akun service + refresh session cookie. Keputusan produk: A cukup untuk MVP? |
| **R2** | **Legal/ToS & PII.** Scraping melanggar ToS Meta; kita menyimpan username + teks reply **orang non-user** (data pribadi pihak ketiga). | ⚠️ Belum diputuskan | MVP internal only. Sebelum publik: kebijakan retensi, anonimisasi reply author (hash/handle only), dan review legal. |
| **R3** | **Bias sampling reply.** `replySample` (~30–40) kemungkinan **ranked/top**, bukan kronologis → persona & sentiment condong ke reply populer. | ⚠️ Diketahui | Label output sebagai "berdasarkan top-reply, bukan seluruh percakapan". Jangan klaim mewakili 100% audience. |
| **R4** | **Threshold `performance` belum didefinisikan** dan percentile atas **n=12** granularitasnya kasar (loncat ~8 persentil/post). | ⚠️ Diketahui | Definisikan cut LOW/NORMAL/HIGH/VIRAL saat Step 6 (butuh distribusi nyata). MVP: relatif ke median 12-post creator. |
| **R5** | **Cookie durability & skala.** Cookie dummy terbukti 1× hari ini; belum diuji pada ribuan request (rate limit) atau saat Meta memperketat. | ⚠️ Diketahui | Queue + exponential backoff + jitter. Monitor rasio consent-shell; siapkan rotasi cookie session bila perlu. |
| **R6** | **Biaya AI belum di-sizing.** 1000 creator × 12 post = 12k call analisis + reply analysis = biaya dominan. | 🟢 Catatan | Batch caption+reply per creator jadi 1 call; cache via `contentHash`; hanya re-run saat `promptVersion` naik. |
| **R8** | **`views` bisa `null` untuk sebagian post** (mis. image tertentu) — holder view-count berisi nilai config, bukan angka asli. | 🟢 Handled | Sanity guard: `views < likes` (mustahil) → `null`. Lebih baik jujur "tidak diketahui" daripada lapor angka salah. Rate berbasis views ikut `null`. |
| **R7** | **Jembatan ke DB belum dispesifikasi.** Tipe `ThreadPost` belum dipetakan ke Prisma (`docs/09-database-schema.md` / `snapshots[].rawJson`). | 🟢 Catatan | Diputuskan saat implementasi: `raw.rawJson` → JSON column; `computed`/`intelligence` → kolom queryable atau JSON. |

---

## Snapshots (Tier Time-series)

`views_per_hour · engagement_velocity · half_life · growth_curve` mustahil dari 1 fetch.
Schema sudah punya `snapshots[]` — inilah alasannya. Scrape post yang sama ≥2× dengan jeda,
`rawJson` tiap snapshot disimpan, velocity dihitung dari selisih. **MVP: mulai kumpulkan
snapshot dari hari-1, tampilkan velocity setelah snapshot ke-2 masuk.**

---

## Build Order

**Keputusan (2026-08-10): MVP pakai Jalur A — 4 post terbaru, zero-login.** Pagination 12-post (Jalur B)
ditunda; butuh akun service. 4 post SSR + deep-metric per permalink dianggap cukup untuk sinyal awal.

```
1. scrapeThreadsPost(url)      🟢🔵  zero-dep, parse data-sjs → ThreadPost.raw + computed   ✅ DONE (src/lib/threads/)
2. scrapeThreadsProfile(user)  🟢    follower_count + 4 post terbaru (SSR) + authorId       ✅ DONE (+scrapeThreadsCreator composer)
2b. DB wiring                  🔵    toSnapshotInput → SocialSnapshot(rawJson.videos=RawVideo) ✅ DONE (snapshot.ts + connect/resync-threads actions; feeds Platform Intel tanpa ubah decision-intel)
3. analyzePost(post)           🟡    1 call → content+audience+brand+performance (Inferred)  ✅ DONE (analyze-post.ts + prompts/threads-analyze.ts; max_tokens 8192 krn model reasoning; output di-coerce/whitelist)
4. buildCreatorDNA(posts[])    🟡    agregasi 4 post → Creator Intelligence
5. snapshot diff               🔵    velocity/half-life setelah snapshot ke-2
—  paginateThreadsPosts(id)    ⏸️    DITUNDA (Jalur B, butuh akun service) — lihat R1
```

Setiap langkah menulis `rawJson`; langkah AI hanya mengisi `intelligence?` — raw tak pernah di-crawl ulang.
