# Creator Intelligence Engine
CariKOL — Arsitektur Penilaian Creator
Last updated: 2026-07-31

---

## Prinsip Desain

> Jangan mengklaim lebih dari data yang kita punya.

Sistem ini memisahkan tiga jenis bukti secara eksplisit dan tidak pernah menggabungkannya jadi satu label tunggal. Setiap output selalu diberi label: **ini dari mana** dan **seberapa yakin**.

---

## Tiga Tier Evidence

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1 — Public Evidence                                   │
│  Apa yang bisa diobservasi langsung dari data publik TikTok │
│  Reliabilitas: MEDIUM — dapat diverifikasi, bisa dimainkan  │
├─────────────────────────────────────────────────────────────┤
│  TIER 2 — Statistical Signals                               │
│  Inferensi dari pola data — selalu ditampilkan dengan CI    │
│  Reliabilitas: LOW–MEDIUM — hipotesis, bukan fakta          │
├─────────────────────────────────────────────────────────────┤
│  TIER 3 — First-party Evidence          [coming: Q4 2026]   │
│  Apa yang diobservasi langsung via ekosistem CariKOL        │
│  Reliabilitas: HIGH — ground truth nyata                    │
└─────────────────────────────────────────────────────────────┘
```

Tier 3 adalah moat. Tier 1 dan 2 adalah yang bisa dibangun sekarang.

---

## Creator Passport (Output)

```
┌──────────────────────────────────────────────────────────────┐
│  CREATOR PASSPORT                                            │
│  @ininabnabb · TikTok · Business & Daily Life               │
│                                                              │
│  ── PUBLIC EVIDENCE ────────────────────────────────────     │
│                                                              │
│  Creator Type       Business educator                        │
│  Content Behavior   Organic Creator                          │
│  Political Exp.     No indication                            │
│                                                              │
│  Commercial Footprint                                        │
│    Top categories   Beauty, Finance, Lifestyle              │
│    Brand mentions   12 brands (last 12 months)               │
│    Sponsored est.   ~30% of content                          │
│    Affiliate        Low density                              │
│                                                              │
│  ── STATISTICAL SIGNALS ─────────────────────────────────   │
│  (inferensi — bukan fakta, ditampilkan dengan confidence)    │
│                                                              │
│  Audience Quality   Likely authentic   [confidence: 72%]    │
│  Growth Pattern     Organic trend      [confidence: 68%]    │
│  Comment Quality    Mixed signals      [confidence: 55%]    │
│                                                              │
│  ── FIRST-PARTY EVIDENCE ────────────────────────────────   │
│  Belum tersedia. Creator ini belum pernah bekerja            │
│  melalui ekosistem CariKOL / Buzzeryok.                     │
│                                                              │
│  ── SIGNALS ─────────────────────────────────────────────   │
│  ✓ [Public] Wajah konsisten dalam 20 video terakhir         │
│  ✓ [Public] Bukan akun recycled                              │
│  ~ [Signal] Komentar pendek dominan — umum di niche ini      │
│  ⚠ [Signal] Spike follower Maret 2026 — belum conclusive     │
│                                                              │
│  ── RECOMMENDATION ──────────────────────────────────────   │
│  PROMISING — berdasarkan data publik saja                    │
│  Belum ada first-party evidence untuk perkuat kesimpulan.   │
└──────────────────────────────────────────────────────────────┘
```

**Recommendation levels:**
```
VERIFIED RELIABLE   ← ada first-party evidence kuat
PROMISING           ← public evidence positif, belum ada first-party
SIGNALS MIXED       ← ada anomali statistik, perlu perhatian
INSUFFICIENT DATA   ← belum cukup data untuk penilaian
KNOWN ISSUE         ← ada first-party evidence negatif
```

---

## Tier 1 — Public Evidence

Semua ini **fakta terobservasi**, bukan inferensi.

### 1A. Creator Classification

Dilakukan sebelum penilaian apa pun. Karena creator yang berbeda tidak bisa dinilai dengan standar yang sama.

**Creator Type:**
```
Organic Creator     → konten sendiri, dinilai penuh
UGC Creator         → deliverable, bukan ER — benchmark beda
Agency Managed      → negotiation via pihak ketiga
Anonymous Creator   → Identity confidence rendah by default
AI Creator          → Content flagged by default
Media / News Acct   → engagement benchmark berbeda
Meme Account        → audience tidak personal
Brand Account       → exclude dari sistem
```

**Political Exposure:**
```
No Indication  → tidak ada tanda keterlibatan politik
Low            → sesekali komentar politik, bukan campaign
Medium         → pernah post konten politik (tidak jelas berbayar)
High           → pernah menjadi bagian kampanye politik terdeteksi
```

Catatan: "High" tidak otomatis jadi flag negatif. Brand harus memutuskan sendiri relevansinya. Kita menyajikan bukti, bukan verdict.

---

### 1B. Commercial Footprint

**Ini yang bisa dibangun sekarang dari caption publik saja.**

Bukan "Campaign History" — karena kita tidak tahu apakah creator dibayar. Ini jejak komersial yang terdeteksi.

#### Brand Mentions

```
Bagaimana: NER (Named Entity Recognition) pada caption
           + brand dictionary Indonesia
           + pola hashtag brand official

Output:
  Somethinc   8x   [mostly organic]
  Wardah      5x   [likely sponsored]
  Skintific   4x   [likely sponsored]
  Erigo       2x   [unknown]
  Kopi Kenangan 1x  [likely organic]

Catatan yang ditampilkan ke user:
  "Creator menyebut brand ini dalam caption videonya.
   Ini bukan konfirmasi kerja sama — bisa organik atau berbayar."
```

#### Sponsored Content Detection

Bukan "pernah kerjasama dengan brand X". Tapi "kemungkinan konten ini berbayar".

```
Sinyal eksplisit (confidence tinggi):
  #ad, #sponsored, #iklan, #kerjasama, #endorsement
  "paid partnership" di caption
  Label "Branded Content" TikTok

Sinyal implisit (confidence medium):
  Discount code (pola: NAMA10, COBA20, dll)
  "link di bio" + nama produk + CTA kuat
  Affiliate link pattern
  Kalimat disclosure informal ("dikirimin sama...")

Output per video:
  Very Likely Sponsored   → ≥2 sinyal eksplisit
  Likely Sponsored        → 1 eksplisit atau ≥2 implisit
  Organic Mention         → tidak ada sinyal komersial
  Unknown                 → tidak cukup sinyal
```

#### Brand Relationship Map

```
Wardah
  Disebutkan 12x · Likely Sponsored (confidence 83%)
  Pertama kali: 8 bulan lalu · Terakhir: 2 minggu lalu

Somethinc
  Disebutkan 4x · Organic Mention (confidence 71%)
  Hanya muncul dalam konteks review

Scarlett
  Disebutkan 2x · Unknown
```

#### Commercial Profile

```
Kategori utama:  Beauty, Finance, Lifestyle
Brand diversity: 12 brand unik (12 bulan)
Sponsored est.:  ~30% konten (6 dari 20 video terbaru)
Affiliate density: Low (0 kode diskon unik terdeteksi)
CTA frequency:   Medium (3x per 10 video)
```

#### Benchmark (per cohort)

```
Beauty creator nano Indonesia:
  Sponsored content rata-rata: 22%
  Creator ini: ~30% — di atas rata-rata

Brand diversity rata-rata: 8 brand
  Creator ini: 12 brand — lebih beragam dari 74% peers
```

---

### 1C. Content Observation

**Apa yang bisa diobservasi tanpa inferensi:**

```
Niche consistency   % video yang masuk kategori utama creator
Posting frequency   video per minggu (rata-rata)
Posting regularity  apakah ada gap panjang?
Caption language    Bahasa Indonesia / campuran / English
Caption avg length  karakter per caption
Hashtag behavior    branded vs generic vs niche
Video duration avg  pendek (<30s) vs menengah vs panjang
Creator entity type hasil dari 1A di atas
```

**Brand Safety Observation (bukan flag otomatis — ditampilkan sebagai informasi):**

```
Terdeteksi konten terkait:
  Politik:       2 video (6 bulan lalu)
  Kesehatan:     4 video (tip kesehatan umum)
  Finance:       8 video (financial literacy)
  Adult:         Tidak terdeteksi
  Gambling:      Tidak terdeteksi
  Crypto:        1 video (8 bulan lalu — informatif)

Ini disajikan sebagai data, bukan verdict.
Brand memutuskan sendiri relevansinya.
```

---

## Tier 2 — Statistical Signals

**Ini inferensi, bukan fakta.** Selalu ditampilkan dengan:
- Label "Sinyal Statistik"
- Confidence interval atau "Low / Medium / High confidence"
- Catatan tentang keterbatasannya

### 2A. Audience Authenticity Signals

Catatan metodologi yang jujur (untuk tim internal, bukan UI):
> Kita tidak bisa mengobservasi "follower dibeli". Yang kita observasi adalah anomali statistik yang *bisa jadi* indikasi — atau *bisa jadi* karakteristik audiens yang sah.

**Sinyal yang dipakai:**

| Sinyal | Formula | Keterbatasan yang jujur |
|---|---|---|
| Like/view ratio vs cohort | avg(likes/views) dibanding median tier×niche | Bervariasi per konten type |
| Share/view ratio vs cohort | avg(shares/views) dibanding median | Share rendah normal di niche tertentu |
| Heart-per-follower (normalized per account age) | total_hearts / follower / (account_age_months) | Masih proxy kasar |
| Follower/following ratio | followers / following | Brand account bisa sangat rendah |

**Apa yang TIDAK dipakai dan kenapa:**
- `avg_views / follower_count` sebagai "view authenticity" — TikTok FYP-driven, views tidak berkorelasi dengan follower. Sinyal ini tidak bermakna di TikTok.
- Username regex `user\d{9,}` — mendeteksi literasi digital rendah, bukan bot. Ini justru audiens akar rumput yang dicari brand UMKM.

---

### 2B. Growth Pattern Signals

**Catatan metodologi:**
> Spike pertumbuhan hanya bisa dideteksi dari snapshot yang sudah tersimpan. Tidak bisa retroaktif. Minimal butuh snapshot mingguan selama 3 bulan untuk Isolation Forest bekerja (minimum 12 titik). Dengan snapshot bulanan, kita hanya punya 3–6 titik — tidak cukup.

**Yang bisa dilakukan sekarang (Stage 0):**
```
Jika CreatorSnapshot tersedia (≥8 titik, interval ≤2 minggu):
  → Hitung rata-rata growth rate
  → Bandingkan dengan cohort
  → Flag jika growth > 5× median dalam satu periode

Jika tidak cukup snapshot:
  → Tampilkan "Insufficient history for growth analysis"
  → JANGAN interpolasi atau asumsikan
```

---

### 2C. Comment Pattern Signals (Versi yang Diperbaiki)

**Bug dari versi sebelumnya yang sudah diperbaiki:**

**❌ Versi lama (inverted logic):**
```python
# SALAH — ini mendeteksi video viral, bukan pod
def temporal_clustering_score(comments):
    intervals = [t[i+1] - t[i] for i in range(len(timestamps)-1)]
    return std_dev(intervals) / mean(intervals)
# Video viral = burst lalu ekor panjang = interval sangat bervariasi = CV tinggi
# Pod = burst seragam = interval relatif sama = CV RENDAH
# Docstring bilang "tinggi = pod" — terbalik.
```

**✅ Versi benar:**
```python
def first_hour_burst_ratio(
    comments: list[Comment],
    post_time: datetime,
    burst_window_minutes: int = 60
) -> float:
    """
    Organik: komentar tersebar sepanjang hari-hari setelah posting.
    Pod: 60–80%+ komentar masuk dalam 1 jam pertama.
    
    Butuh: post_time dari video.createTime (tersedia dari Apify).
    """
    if not comments:
        return 0.0
    burst = sum(
        1 for c in comments
        if (c.create_time - post_time).total_seconds() / 60 <= burst_window_minutes
    )
    return burst / len(comments)

# Confidence: MEDIUM
# Catatan: creator yang aktif reply di jam pertama juga menaikkan nilai ini.
# Perlu dikombinasikan dengan sinyal lain sebelum dijadikan flag.
```

**❌ Versi lama (dead code):**
```python
GENERIC_COMMENTS = {"bagus", "mantap", "keren", ...}  # semua 1 kata

def meaningfulness_score(comments):
    meaningful = sum(
        1 for c in comments
        if len(c.comment.split()) >= 4   # cek panjang
        and c.comment.lower() not in GENERIC_COMMENTS  # dead — sudah gugur di atas
    )
```

**✅ Versi benar + catatan keterbatasan:**
```python
def comment_length_distribution(comments: list[Comment]) -> dict:
    """
    Distribusi panjang komentar. BUKAN ukuran keaslian.
    
    Komentar pendek normal di TikTok Indonesia — terutama audiens
    tier 2–3. Hanya informatif, bukan sinyal fraud.
    
    Jangan jadikan threshold untuk flag.
    """
    lengths = [len(c.comment.split()) for c in comments]
    return {
        "median_words": statistics.median(lengths),
        "pct_under_3_words": sum(1 for l in lengths if l < 3) / len(lengths),
        "pct_over_10_words": sum(1 for l in lengths if l > 10) / len(lengths),
    }

def commenter_diversity_ratio(comments: list[Comment]) -> float:
    """
    Unique commenters / total comments.
    Low ratio = banyak orang sama komentar berulang = sinyal pod.
    Confidence: MEDIUM.
    """
    if not comments:
        return 1.0
    return len(set(c.username for c in comments)) / len(comments)

def creator_reply_rate(comments: list[Comment], creator_username: str) -> float:
    """
    Seberapa aktif creator membalas komentar.
    Ini sinyal profesionalisme dan engagement, bukan fraud.
    Confidence: HIGH (langsung terobservasi).
    """
    creator_replies = sum(
        1 for comment in comments
        for reply in (comment.replies or [])
        if reply.username == creator_username
    )
    return creator_replies / len(comments) if comments else 0.0
```

**Yang tidak diimplementasikan dan kenapa:**

Comment sentiment NLP: butuh model Bahasa Indonesia yang bagus, threshold ambigu, dan teks komentar mentah tidak boleh disimpan (UU PDP — lihat catatan privasi di bawah).

---

### 2D. Sinyal yang Belum Diimplementasikan tapi Lebih Kuat

Dicatat di sini agar tidak dilupakan dan tidak diabaikan tanpa alasan.

**Network overlap (paling kuat, paling sulit):**
Jika 40 creator berbagi 200 commenter yang sama, itu bukti pod jauh lebih kuat dari CV interval. Ini fenomena jaringan, tidak bisa dideteksi per-creator. Butuh DB commenter yang besar — bisa dibangun setelah kita punya banyak creator di sistem.

**Residual campaign performance:**
Prediksi ER dari profil vs realisasi aktual di campaign Buzzeryok. Selisih negatif konsisten = sinyal paling dekat ke ground truth. Data ini sudah ada di Buzzeryok — tinggal diekstrak dan dimodelkan.

**Dekopling like/view vs comment/view:**
View dan like murah dibeli; komentar mahal. Perbedaan besar antara like-rate dan comment-rate adalah sinyal lebih tahan gaming dari keduanya secara terpisah.

---

## Tier 3 — First-party Evidence

**Ini yang tidak bisa ditiru siapa pun.** Data dari 4 tahun Buzzeryok.

Ditampilkan terpisah dari Tier 1 dan 2. Tidak pernah digabungkan jadi satu score.

```
VERIFIED CAMPAIGN RECORD

8 kampanye melalui CariKOL / Buzzeryok
  7 selesai sesuai brief
  6 brand melakukan repeat hire
  0 ghosting tercatat
  0 late upload (>48 jam dari deadline)

Collaboration Quality (dari OutcomeReview):
  Content quality      4.7 / 5.0  (7 reviews)
  Communication        4.5 / 5.0
  Professionalism      4.8 / 5.0
  Would work again     6/7 brand (86%)

Catatan: Skor ini berdasarkan pengalaman langsung Buzzeryok.
Belum mencakup kampanye di platform lain.
```

**Catatan cold start yang jujur:**
Creator baru yang belum pernah bekerja via Buzzeryok tidak mendapat bintang di Tier 3. Ini tidak berarti mereka buruk — hanya belum ada data. UI harus menyampaikan ini tanpa membuat creator baru terkesan lebih buruk dari creator lama.

---

## Collaboration Intelligence (Tier 3 Detail)

Ini moat CariKOL. Data ini tidak dimiliki platform lain.

```
Response & Reliability
  Response time ke brief:   avg 4 jam (dari Decision timestamps)
  Ghosting rate:            0% (0 dari 8 confirmed campaigns)
  Cancellation rate:        0%
  Late upload rate:         0%

Deliverable Quality
  Brief compliance:         Sangat baik (dari notes OutcomeReview)
  Revision willingness:     Ya, tanpa biaya tambahan (3 kasus)

Financial Behavior
  Negotiation style:        Profesional
  Invoice accuracy:         100%

Commercial Track Record
  Niche yang berhasil:      Finance, UMKM, Lifestyle
  Niche belum dicoba:       Beauty, Gaming, F&B
  Best performing campaign: [dari residual performance data]
```

---

## Catatan Privasi & Legal

**Data komentar (UU PDP No. 27/2022):**

Komentar TikTok adalah data publik, tapi username dan teks komentar adalah data pribadi pihak ketiga yang bukan pengguna CariKOL. Menyimpan ini untuk memprofilkan creator lain posisinya lemah secara hukum.

**Yang boleh:**
- Hitung fitur agregat saat scraping (diversity ratio, burst ratio, dll)
- Simpan hasilnya (angka agregat)
- Buang teks mentah dan username setelah perhitungan

**Yang tidak boleh:**
- Simpan `commentsJson` mentah dengan username dan teks
- Tampilkan komentar individual dengan username ke pihak ketiga
- Gunakan komentar untuk memprofilkan commenter (bukan creator)

**Implikasi implementasi:**
```
Fetch comments → compute features → store only aggregates → discard raw
Jangan: store comments → display comments → compute later
```

**Label editorial (UU ITE Pasal 27A):**
Label seperti "buzzer politik" atau "blacklisted by agency" berdasarkan klaim pihak ketiga yang tidak terverifikasi punya eksposur hukum. Ini harus: (a) ada sumbernya yang jelas, (b) ada mekanisme keberatan, (c) ada waktu kedaluwarsa, (d) tidak tampil otomatis tanpa human review.

---

## Due Process

Sebelum flag negatif apa pun tampil ke agency, harus ada:

1. **Mekanisme keberatan creator** — creator bisa lihat mengapa dia di-flag dan mengajukan sanggahan
2. **Sumber yang transparan** — "flag ini dari data publik / dari laporan agency X / dari catatan Buzzeryok"
3. **Human sign-off** untuk label kelas tertentu (terutama Reputation)
4. **Masa kedaluwarsa** — flag lama tidak relevan selamanya
5. **Asymmetry yang jelas** — flag negatif butuh bukti lebih kuat daripada tidak punya flag

Dokumen sebelumnya menyebut "false positive merusak penghasilan orang" tapi tidak menyediakan satu pun mekanisme untuk mencegahnya. Due process bukan fitur v2 — ini fondasi.

---

## Data Sources

```
Stage 0 (sekarang):
  Apify clockworks/tiktok-profile-scraper
    → followers, following, hearts, videoCount, bio

  Apify clockworks/tiktok-scraper (video mode)
    → per video: views, likes, comments, shares,
      createTime, caption, hashtags, duration

  tiktok-comment-scrapper (RomySaputraSihananda)
    → per video: komentar dengan timestamp
    → Compute: burst_ratio, diversity_ratio, creator_reply_rate
    → Discard: username, teks mentah

  CariKOL DB (Buzzeryok 4yr data)
    → Decision table → response time, ghosting, cancellation
    → OutcomeReview → quality scores, repeat rate

Stage 1 (September 2026):
  Semua source di atas +
  Sentence transformer untuk caption NLP
  Brand NER model (Indonesian)
  Sponsored content classifier
```

---

## Implementation Roadmap

```
Agustus 2026 — Stage 0 (v0.1)
  ✦ Apify profile + video fetcher
  ✦ Commercial Footprint:
      Brand mentions (NER + brand dictionary Indonesia)
      Sponsored content detection (hashtag + keyword)
      Brand relationship map
  ✦ Comment signals (versi yang sudah diperbaiki):
      burst_ratio, commenter_diversity_ratio, creator_reply_rate
  ✦ Creator Classification (manual rules, bukan ML)
  ✦ Update UI: Creator Passport dengan 3 tier
  ✦ Migrasi data Buzzeryok → Decision + OutcomeReview

September 2026 — Stage 1 (v1.0)
  ✦ Residual campaign performance model
     (prediksi ER vs realisasi — sinyal paling kuat yang kita punya)
  ✦ Network commenter overlap (setelah ada 50+ creator di DB)
  ✦ Indonesian NER yang proper untuk brand detection
  ✦ Sponsored content classifier (ML, bukan hanya keyword)
  ✦ Like/view vs comment/view dekopling signal

Oktober 2026 — v1.1
  ✦ Due process flows: creator keberatan, human review queue
  ✦ Flag expiry dan audit trail
  ✦ Pilot: 20 kampanye internal
  ✦ Fairness check: apakah sistem menghukum niche/tier tertentu?

2027 — v2.0
  ✦ Network analysis (commenter overlap cross-creator)
  ✦ Opt-in OAuth: audience demographic nyata
  ✦ Reputation monitoring (web + social)
  ✦ API untuk agency query langsung
```

---

## Framing Produk yang Jujur

**Bukan:** "Kami mendeteksi fraud creator."

**Ya:** "Kami membantu brand memahami creator dari semua bukti yang tersedia — dengan jelas menyatakan apa yang diketahui, apa yang diduga, dan apa yang belum bisa dipastikan."

Posisi ini lebih kuat secara hukum, lebih jujur kepada creator, dan lebih bisa dipercaya oleh agency yang sophisticated. Agency yang baik sudah tahu bahwa tidak ada sistem yang bisa mengklaim mendeteksi fraud dengan pasti — mereka justru curiga dengan yang terlalu percaya diri.

**Value proposition yang sesungguhnya:**
> "Tahap 1: Kami memahami creator dari jejak digital publik mereka.
>  Tahap 2: Ketika creator pernah bekerja melalui ekosistem CariKOL,
>  profil tersebut diperkaya dengan Verified First-party Evidence
>  yang tidak dimiliki platform mana pun."
