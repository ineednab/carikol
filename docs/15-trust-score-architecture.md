# Trust Score Engine — Arsitektur Penilaian AI
CariKOL — BRIN AIDeaNation 2026
Last updated: 2026-07-31

---

## Gambaran Sistem

Trust Score Engine menilai kredibilitas creator berdasarkan **dua sumber pengetahuan** yang digabungkan:
1. **Sinyal publik** — apa yang terlihat di TikTok tanpa login
2. **Outcome kampanye nyata** — apa yang benar-benar terjadi saat creator dikerjakan

Sumber kedua inilah yang membedakan sistem ini dari tools global.

```
INPUT: TikTok username
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│                    TRUST SCORE ENGINE                          │
│                                                                │
│  [A] Public Signal Layer                                       │
│      Raw TikTok data (Apify)                                   │
│      → 17 fitur dari profil + video                            │
│                                                                │
│  [B] Campaign Outcome Layer                ← keunggulan utama  │
│      Decision + OutcomeReview DB (4 tahun)                     │
│      → 6 fitur dari rekam jejak kampanye                       │
│                                                                │
│  [C] Cohort Baseline Engine                                    │
│      → normalisasi per tier × niche                            │
│                                                                │
│  [Stage 0] Heuristic Scorer (sekarang)                         │
│  [Stage 1] Isolation Forest + XGBoost + SHAP (Sep 2026)        │
│                                                                │
│  [D] Business Rules Layer                                      │
│      → hard overrides, data sufficiency gates                  │
│                                                                │
│  [E] Explainability Layer                                      │
│      → SHAP values → template → narrative                      │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
OUTPUT:
  band: A | B | C | D | insufficient_data
  score: 0–100
  confidence_interval: [low, high]
  signals: [ { id, label, contribution%, direction, detail } ]
  explanation: string (bahasa natural, berbasis SHAP)
  flags: string[]           (requires_human_review, etc.)
  requires_human_review: boolean
```

---

## Bagian 1 — Feature Engineering

### 1.1 Definisi Fitur Lengkap

Semua fitur dikelompokkan ke 4 dimensi. Total: **23 fitur** (17 publik + 6 kampanye).

---

#### Dimensi A — Kualitas Engagement (bobot 35%)

**F01 — Engagement Rate vs Kohort (z-score)**
```
per_video_er = (likes + comments + shares) / views  untuk tiap video
mean_er      = average(per_video_er)
F01          = (mean_er - cohort_median_er) / cohort_std_er

Interpretasi:
  F01 > 2.0  → engagement sangat tinggi (suspicious atau sangat organik)
  F01 > 0.5  → di atas rata-rata (positif)
  F01 ∈ [-0.5, 0.5] → rata-rata (netral)
  F01 < -0.5 → di bawah rata-rata (negatif)
  F01 < -2.0 → sangat rendah (merah)

Catatan: F01 sangat tinggi (>3.0) tidak selalu positif —
dikombinasikan dengan F02 tinggi, ini menjadi flag.
```

**F02 — Konsistensi Engagement (Coefficient of Variation)**
```
F02 = std_dev(per_video_er) / mean(per_video_er)

Interpretasi:
  F02 < 0.30 → konsisten (positif)
  F02 ∈ [0.30, 0.60] → moderat (netral)
  F02 > 0.60 → tidak konsisten (negatif — beberapa video outlier)
  F02 > 1.0  → sangat tidak stabil (flag)

Kenapa penting: engagement pod dari WhatsApp group menghasilkan
beberapa video dengan ER sangat tinggi, sisanya rendah → CV tinggi.
```

**F03 — Rasio Like:Komentar:Share (Mahalanobis Distance)**
```
lcs_vector = [avg_likes/avg_comments, avg_shares/avg_comments]
F03        = mahalanobis(lcs_vector, cohort_lcs_mean, cohort_lcs_cov)

Interpretasi:
  F03 < 2.0 → dalam rentang normal kohort (positif)
  F03 ∈ [2.0, 3.5] → agak menyimpang (perlu perhatian)
  F03 > 3.5 → sangat menyimpang dari pola kohort (flag)

Referensi: Pola normal nano×business Indonesia:
  likes:comments ≈ 15–30:1
  shares:comments ≈ 0.05–0.15:1
Pola engagement pod: comments terlalu tinggi relatif terhadap likes.
```

**F04 — Share Rate (normalized)**
```
F04 = (avg_shares / avg_views) / cohort_median_share_rate

Interpretasi:
  F04 > 1.0 → share rate di atas median (positif — konten dipercaya)
  F04 < 0.3 → share rate sangat rendah (negatif)
```

**F05 — Comment-to-View Rate (normalized)**
```
F05 = (avg_comments / avg_views) / cohort_median_ctv_rate
```

---

#### Dimensi B — Keaslian Audiens (bobot 30%)

**F06 — Engagement Spike Score (Isolation Forest)**
```
Input ke IF: [er_per_video[i], hours_since_post[i], cumulative_engagement_at_t]
             untuk setiap video dalam 30 hari terakhir

F06 = isolation_forest_anomaly_score(engagement_temporal_pattern)
      ∈ [-1.0, 1.0]  (negatif = lebih anomalous)

Interpretasi:
  F06 > -0.3 → pola normal (positif)
  F06 ∈ [-0.5, -0.3] → sedikit anomali (netral)
  F06 < -0.5 → anomali signifikan → flag requires_human_review
  F06 < -0.8 → anomali kuat → downgrade otomatis minimum 1 band

Kenapa IF? Engagement pod Indonesia punya temporal signature unik:
  - Spike terjadi dalam 30–60 menit pertama setelah post
  - Lalu drop mendadak → halflife <1 jam
  - Organik: halflife 4–24 jam, decay gradual
```

**F07 — Engagement Decay Half-life (jam)**
```
Untuk tiap video: fit exponential decay ke engagement per jam
  engagement(t) = A × e^(-λt)
  half_life_hours = ln(2) / λ

F07 = median(half_life_hours across recent videos)

Interpretasi:
  F07 > 12h → sangat organik (positif)
  F07 ∈ [4h, 12h] → normal (positif)
  F07 ∈ [1h, 4h] → cepat (netral)
  F07 < 1h → sangat cepat → indikasi pod (flag)

Data yang dibutuhkan: timestamp engagement per video
→ tidak tersedia dari Apify standar, butuh video comments API
→ di Stage 0: F07 dihitung dari agregat, bukan per-timestamp
→ di Stage 1: F07 tersedia penuh via extended Apify scraper
```

**F08 — Follower:Following Ratio**
```
F08 = follower_count / following_count

Interpretasi:
  F08 > 3.0 → sehat (positif)
  F08 ∈ [1.0, 3.0] → normal
  F08 < 0.5 → terbalik (negatif — follow-for-follow pattern)
  Perlu dinormalisasi per tier karena nano creator naturally lebih rendah
```

**F09 — Heart-per-Follower Ratio (proxy historical engagement)**
```
F09 = total_hearts / follower_count / cohort_median_hpf

Interpretasi:
  F09 > 1.5 → historical engagement kuat (positif)
  F09 ∈ [0.7, 1.5] → normal
  F09 < 0.3 → sangat rendah → indikasi bought followers (flag)

Kenapa: bought followers tidak memberikan likes pada konten lama.
Ratio rendah berarti follower tidak engage dengan konten historis.
```

**F10 — Video View Authenticity Score**
```
views_per_follower = avg_views / follower_count
F10 = views_per_follower / cohort_median_vpf

Interpretasi:
  Nano creator Indonesia normal: views ≈ 30–150% follower count
  Jika views >> follower (misal 500%+): organic viral atau bought views
  Dikombinasikan dengan F06 untuk disambiguasi
```

---

#### Dimensi C — Konsistensi Konten (bobot 20%)

**F11 — Posting Frequency (video per minggu)**
```
aktif_days = (last_post_timestamp - first_post_timestamp) / 86400
F11 = video_count / (aktif_days / 7)

Interpretasi (normalisasi per kohort):
  Nano×business Indonesia median ≈ 3–4 video/minggu
  F11 > 7/week → terlalu agresif (perhatikan bersamaan dengan F12)
  F11 < 1/week → tidak aktif (negatif untuk brand)
```

**F12 — Posting Consistency (inter-post interval CV)**
```
intervals = [days_between_post[i] for i in consecutive_posts]
F12 = std_dev(intervals) / mean(intervals)

Interpretasi:
  F12 < 0.5 → konsisten (positif)
  F12 ∈ [0.5, 1.0] → moderat
  F12 > 1.0 → burst posting then silence (negatif)

Kenapa penting: brand ingin creator yang reliably konsisten,
bukan yang posting 10 hari lalu lalu hilang.
```

**F13 — Caption Vocabulary Diversity (Type-Token Ratio)**
```
all_captions = concatenate(video.desc for all videos)
tokens = tokenize(all_captions, language="id")
F13 = len(unique_tokens) / len(total_tokens)

Interpretasi:
  F13 > 0.6 → kosa kata beragam (organik)
  F13 ∈ [0.3, 0.6] → normal
  F13 < 0.2 → kosa kata sangat repetitif (indikasi template/AI)

Threshold ini perlu dikalibrasi per niche karena niche tertentu
(misal: kuliner) naturally lebih repetitif dalam vocabulary.
```

**F14 — Caption Semantic Similarity (AI-generated content proxy)**
```
embeddings = [sentence_embedding(caption) for caption in recent_captions]
pairwise_similarities = cosine_similarity(embeddings[i], embeddings[j])
F14 = mean(pairwise_similarities)

Interpretasi:
  F14 < 0.4 → konten beragam (positif)
  F14 ∈ [0.4, 0.7] → normal, ada topik yang konsisten
  F14 > 0.8 → sangat mirip satu sama lain → indikasi template/AI

Model embedding: paraphrase-multilingual-MiniLM-L12-v2 (mendukung Bahasa Indonesia)
Catatan: threshold lebih tinggi untuk lifestyle creator yang intentionally on-brand.
```

**F15 — Video Duration Consistency**
```
durations = [video.duration for video in recent_videos]
F15 = std_dev(durations) / mean(durations)

Interpretasi:
  F15 < 0.4 → sangat konsisten (normal untuk niche tertentu)
  F15 > 1.5 → sangat bervariasi (tidak tentu positif atau negatif)
  Dikombinasikan dengan niche untuk interpretasi:
    Gaming: natural untuk vary duration
    Tutorial: konsistensi lebih diharapkan
```

---

#### Dimensi D — Pola Pertumbuhan (bobot 15%)

**F16 — Follower Growth Rate (per bulan)**
```
F16 = (current_followers - estimated_followers_90d_ago) / 3
    = dihitung dari snapshot history (CreatorSnapshot table)
    Fallback: estimate dari total_likes growth proxy

Interpretasi (normalisasi per kohort):
  Nano Indonesia median ≈ 200–500/bulan
  F16 >> median → possible viral burst atau bought (dikombinasikan dengan F17)
  F16 << median → lambat tapi stabil bisa tetap organik
```

**F17 — Growth Spike Anomaly (Isolation Forest pada time series)**
```
growth_series = [snapshot.follower_count for snapshot in chronological_order]
F17 = isolation_forest_anomaly_score(growth_series)

Interpretasi:
  F17 < -0.5 → ada spike pertumbuhan tidak wajar
  Kombinasi F17 < -0.5 DAN F09 rendah = strong bought followers signal
```

---

#### Dimensi E — Campaign Outcome Layer (aktif jika creator ada di DB Buzzeryok)

**F18 — Campaign Fulfillment Rate**
```
confirmed_campaigns = count(decisions WHERE type = 'creator_confirmed' AND creator_id = X)
met_projection = count(campaigns WHERE post-campaign ER ≥ projected ER × 0.8)
F18 = met_projection / confirmed_campaigns

Interpretasi:
  F18 ≥ 0.80 → reliable (sangat positif)
  F18 ∈ [0.60, 0.80] → acceptable
  F18 < 0.60 → tidak reliable (merah)
```

**F19 — Repeat Client Rate**
```
F19 = count(brands yang re-hire creator) / count(unique brands yang pernah confirmed)

Interpretasi:
  F19 > 0.4 → brand mau kembali (sangat positif)
  F19 < 0.1 → tidak ada repeat (perlu investigasi)
```

**F20 — Average Outcome Score**
```
F20 = mean((content_quality + communication + professionalism) / 3)
      across all outcome_reviews WHERE creator_id = X

Interpretasi:
  F20 ≥ 4.0 → excellent
  F20 ∈ [3.0, 4.0] → good
  F20 < 3.0 → concerning
```

**F21 — Would Work Again Rate**
```
F21 = count(would_work_again IN ('yes', 'conditional')) / count(outcome_reviews)

Interpretasi:
  F21 ≥ 0.80 → positif kuat
  F21 < 0.50 → red flag
```

**F22 — No Response Rate (behavioral signal)**
```
proposed_campaigns = count(decisions WHERE type = 'creator_proposed' AND creator_id = X)
no_response = count(decisions WHERE type = 'creator_no_response' AND creator_id = X)
F22 = no_response / proposed_campaigns

Interpretasi:
  F22 > 0.40 → creator sering tidak responsif (merah)
  F22 < 0.10 → sangat responsif (positif)
```

**F23 — Budget Rejection Rate**
```
F23 = count(creator_budget_rejected) / count(creator_confirmed + creator_budget_rejected)

Interpretasi: bukan flag negatif per se, tapi informatif untuk brand.
F23 > 0.6 → rate card creator consistently di atas market rate
```

---

### 1.2 Ringkasan Feature Vector

```python
features = {
  # Engagement Quality (F01–F05)
  "er_z_score":              float,   # F01
  "engagement_cv":           float,   # F02
  "lcs_mahalanobis":         float,   # F03
  "share_rate_norm":         float,   # F04
  "comment_view_rate_norm":  float,   # F05

  # Audience Authenticity (F06–F10)
  "temporal_anomaly_score":  float,   # F06 (Isolation Forest)
  "engagement_halflife_h":   float,   # F07
  "follower_following_ratio":float,   # F08
  "heart_per_follower_norm": float,   # F09
  "views_per_follower_norm": float,   # F10

  # Content Consistency (F11–F15)
  "posting_freq_per_week":   float,   # F11
  "posting_interval_cv":     float,   # F12
  "caption_ttr":             float,   # F13
  "caption_similarity_mean": float,   # F14
  "duration_cv":             float,   # F15

  # Growth Pattern (F16–F17)
  "follower_growth_rate":    float,   # F16
  "growth_spike_score":      float,   # F17 (Isolation Forest)

  # Campaign Outcomes (F18–F23, nullable — 0 jika tidak ada data)
  "fulfillment_rate":        float,   # F18
  "repeat_client_rate":      float,   # F19
  "avg_outcome_score":       float,   # F20
  "would_work_again_rate":   float,   # F21
  "no_response_rate":        float,   # F22
  "budget_rejection_rate":   float,   # F23

  # Metadata (bukan fitur model, tapi dipakai untuk cohort & rules)
  "platform":                str,
  "tier":                    str,     # nano | micro | macro | mega
  "niche":                   str,
  "video_count":             int,
  "account_age_days":        int,
  "has_campaign_data":       bool,
}
```

---

## Bagian 2 — Cohort System

Setiap creator dinilai relatif terhadap peer group-nya, bukan global average.

### 2.1 Definisi Kohort

```
Kohort Utama     = platform × tier × niche
                   contoh: tiktok × nano × business

Fallback Level 1 = platform × tier
                   contoh: tiktok × nano

Fallback Level 2 = platform
                   contoh: tiktok

Fallback Level 3 = global_indonesia
```

Kohort digunakan bila memiliki ≥ 30 creator. Di bawah itu, naik satu level.

### 2.2 Baseline per Kohort

Untuk tiap kohort, simpan:

```json
{
  "cohort_id": "tiktok_nano_business",
  "n_creators": 87,
  "baselines": {
    "median_er":              0.048,
    "std_er":                 0.021,
    "median_heart_per_follower": 12.4,
    "iqr_like_comment_ratio": [12.3, 28.7],
    "iqr_share_comment_ratio": [0.04, 0.13],
    "median_share_rate":      0.0082,
    "median_comment_view_rate": 0.031,
    "median_views_per_follower": 0.94,
    "median_posting_freq_per_week": 3.2,
    "p25_engagement_halflife_h": 4.1,
    "p75_engagement_halflife_h": 18.3
  },
  "computed_at": "2026-08-01",
  "source": "buzzeryok_4yr_db + apify_public"
}
```

Baselines ini dihitung pertama kali dari DB Buzzeryok (300 creator),
dan diperbarui setiap bulan seiring akumulasi data.

---

## Bagian 3 — Stage 0: Heuristic Scorer

Berlaku sebelum labeled dataset tersedia (Agustus 2026).
Tidak ada model, tidak ada training data. Pure rule-based.

### 3.1 Formula Scoring

```typescript
function computeHeuristicScore(features: FeatureVector, baselines: CohortBaselines): number {
  let score = 0

  // ── Engagement Quality (40 pts) ──────────────────────────────────────────
  // F01: er_z_score
  const erContrib = clamp(features.er_z_score, -2, 3) / 3 * 25  // max 25
  score += erContrib

  // F02: engagement_cv (lower = better)
  const cvContrib = Math.max(0, 1 - features.engagement_cv) * 15  // max 15
  score += cvContrib

  // ── Audience Authenticity (35 pts) ───────────────────────────────────────
  // F03: LCS within IQR of cohort
  const lcsNormal = features.lcs_mahalanobis < 2.0
  score += lcsNormal ? 15 : (features.lcs_mahalanobis < 3.5 ? 7 : 2)

  // F09: heart-per-follower ratio
  const hpfContrib = clamp(features.heart_per_follower_norm, 0, 2) / 2 * 10
  score += hpfContrib

  // F06: temporal anomaly (Isolation Forest score not available in Stage 0)
  // Proxy: if engagement_cv > 0.8 AND er_z_score > 2.0 → suspicious
  const suspiciousPattern = features.engagement_cv > 0.8 && features.er_z_score > 2.0
  score += suspiciousPattern ? 0 : 10

  // ── Content Consistency (15 pts) ─────────────────────────────────────────
  // F11: posting frequency (optimal: 2–5/week for nano)
  const freqScore = freqToScore(features.posting_freq_per_week, 2, 5)  // 0–8 pts
  score += freqScore

  // F12: posting consistency
  const consistencyScore = Math.max(0, 1 - features.posting_interval_cv) * 7
  score += consistencyScore

  // ── Growth (10 pts) ──────────────────────────────────────────────────────
  // F16: growth rate vs cohort median (stable = good, extreme spike = flag)
  const growthRatio = features.follower_growth_rate / baselines.median_follower_growth
  const growthScore = growthRatio > 0.3 && growthRatio < 5.0 ? 10 : 3
  score += growthScore

  return Math.round(clamp(score, 0, 100))
}

function heuristicBand(score: number): Band {
  if (score >= 80) return "A"
  if (score >= 60) return "B"
  if (score >= 40) return "C"
  return "D"
}
```

### 3.2 Stage 0 Confidence Interval

Tanpa model statistik, CI dihitung secara konservatif:
```
CI_half_width = 12 - (video_count / 5)  // lebih banyak data = CI lebih sempit
CI_half_width = clamp(CI_half_width, 5, 15)
CI = [score - CI_half_width, score + CI_half_width]
```

---

## Bagian 4 — Stage 1: ML Pipeline

Target mulai: September 2026, setelah dataset berlabel tersedia.

### 4.1 Pipeline Overview

```
Feature Vector (F01–F23)
        │
        ▼
┌──────────────────────────────┐
│    Isolation Forest          │  ← dilatih per kohort
│    Input: F06, F09, F10,     │    pada creator yang diketahui "normal"
│           F16, F17 subset    │
│    Output: anomaly_score F24 │
└──────────────────────────────┘
        │ (F24 ditambahkan ke vector)
        ▼
┌──────────────────────────────┐
│    XGBoost Classifier        │  ← target: label ∈ {0: berisiko, 1: kredibel}
│    Input: F01–F24            │
│    Output: P(kredibel)       │
│                              │
│    Config:                   │
│      n_estimators: 300       │
│      max_depth: 5            │
│      learning_rate: 0.05     │
│      scale_pos_weight: auto  │  ← handle imbalance
│      subsample: 0.8          │
│      colsample_bytree: 0.8   │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│    Platt Scaling             │  ← kalibrasi probabilitas
│    Input: raw XGBoost output │
│    Output: calibrated P +    │
│            95% CI via        │
│            bootstrap (n=500) │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│    Business Rules Layer      │  ← lihat Bagian 6
│    (overrides model output)  │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│    SHAP TreeExplainer        │
│    Input: model + instance   │
│    Output: shap_values[F_i]  │
│    → contribution% per fitur │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│    Explanation Generator     │
│    Input: shap_values +      │
│           feature_values     │
│    Process:                  │
│      1. Sort by |shap_value| │
│      2. Map to template      │
│      3. Claude API:          │
│         template → paragraf  │
│    NOT: Claude membuat alasan│
│    YES: Claude menerjemahkan │
│         nilai ke bahasa alam │
└──────────────────────────────┘
```

### 4.2 Desain Label untuk Training

**Label yang digunakan:**

```
kredibel (1):
  - Creator dengan F18 ≥ 0.80 (fulfillment rate tinggi)
  - DAN F20 ≥ 3.5 (outcome score baik)
  - DAN F21 ≥ 0.75 (would work again)
  - DAN tidak ada flag manual dari tim Buzzeryok

berisiko (0):
  - Creator yang secara eksplisit ditolak karena engagement tidak wajar
  - Creator dengan F18 < 0.5 DAN F22 > 0.4
  - Creator yang di-flagged manual oleh tim saat screening

tidak_cukup_data (exclude):
  - Creator dengan < 3 kampanye di DB
  - Creator yang berhenti aktif sebelum outcome review
```

**Target label distribution:**
Dari estimasi 300 creator Buzzeryok:
- ~60% kredibel
- ~25% berisiko (sudah di-screen manual, rejected)
- ~15% tidak cukup data

**Validasi:**
- 3 anotator independen label subsample (n=60)
- Target κ ≥ 0.60
- Cross-validate pada creator, bukan kampanye (cegah data leakage)

### 4.3 Evaluation Metrics

```
Primary:
  Precision kelas "berisiko" ≥ 0.80
    (jangan salah flag creator kredibel — ini merusak penghasilan orang)

  Recall kelas "berisiko" ≥ 0.65
    (jangan miss terlalu banyak yang berisiko)

Secondary:
  Selisih vs baseline heuristik → signifikan (α = 0.05)
  AUC-PR ≥ 0.75 (pakai PR curve, bukan ROC — karena kelas tidak seimbang)
  Cohen's κ label ≥ 0.60

Fairness:
  Selisih precision antar-tier ≤ 0.10
  Selisih precision antar-niche ≤ 0.10
  (cegah model merugikan nano creator atau niche tertentu)
```

### 4.4 Band Thresholds (post-calibration)

Threshold awal, dikalibrasi berdasarkan precision target:

```
A: P(kredibel) ≥ 0.82   → tingkat keyakinan sangat tinggi
B: P(kredibel) ≥ 0.62   → cukup kredibel
C: P(kredibel) ≥ 0.40   → perlu perhatian
D: P(kredibel) < 0.40   → risiko tinggi

Desain threshold sengaja konservatif untuk band A:
Lebih mudah dapat B daripada A.
Lebih mudah dapat D daripada A yang salah.
```

---

## Bagian 5 — SHAP Explainability

### 5.1 Cara Kerja

```python
import shap

# Satu explainer per model (bukan per prediksi)
explainer = shap.TreeExplainer(xgboost_model)

# Per prediksi
shap_values = explainer.shap_values(feature_vector)  # shape: (n_features,)

# Contribution % per fitur
contributions = {}
total_abs_shap = sum(abs(s) for s in shap_values)
for i, feature_name in enumerate(feature_names):
    contributions[feature_name] = {
        "shap_value": shap_values[i],
        "contribution_pct": abs(shap_values[i]) / total_abs_shap * 100,
        "direction": "positive" if shap_values[i] > 0 else "negative"
    }

# Urutkan berdasarkan |SHAP|
ranked = sorted(contributions.items(), key=lambda x: abs(x[1]["shap_value"]), reverse=True)
```

### 5.2 Template → Narrative

LLM tidak membuat penjelasan sendiri. LLM hanya menyusun template menjadi paragraf kohesif.

**Template per fitur (bukan bebas):**

```python
SIGNAL_TEMPLATES = {
  "er_z_score": {
    "positive": "Engagement rate {value:.1f}% berada {ratio:.1f}× di atas median kohort ({cohort_median:.1f}%)",
    "negative": "Engagement rate {value:.1f}% berada {pct_below:.0f}% di bawah median kohort"
  },
  "engagement_cv": {
    "positive": "Performa video konsisten (koefisien variasi {value:.2f} — dalam batas normal)",
    "negative": "Variabilitas engagement antar-video tinggi (CV: {value:.2f}) — beberapa video outlier"
  },
  "temporal_anomaly_score": {
    "positive": "Pola waktu masuk engagement tidak menunjukkan anomali yang terdeteksi",
    "negative": "Pola temporal engagement menyimpang dari distribusi normal kohort"
  },
  # ... (satu template per fitur)
}
```

**Instruksi ke Claude (terkendali):**
```
Kamu menerima daftar kalimat faktual tentang performa creator.
Susun menjadi 2 paragraf kohesif dalam Bahasa Indonesia.
Paragraf 1: sinyal yang mendorong skor naik.
Paragraf 2: sinyal yang menahan skor (jika ada).
JANGAN tambahkan informasi di luar kalimat yang diberikan.
JANGAN berspekulasi tentang penyebab.
```

---

## Bagian 6 — Business Rules (Hard Overrides)

Business rules diterapkan SETELAH model, bukan menggantikannya.
Mereka mencerminkan pengetahuan domain yang tidak bisa sepenuhnya di-encode ke fitur.

```
BR-01 — Insufficient Data Gate
  IF video_count < 15
  OR account_age_days < 60
  → return band: "insufficient_data"
  → tidak ada scoring

BR-02 — Strong Temporal Anomaly
  IF F06 (temporal_anomaly_score) < -0.80
  → band tidak bisa A atau B (minimum C)
  → requires_human_review = true
  → tambahkan flag: "engagement_timing_anomaly"

BR-03 — Suspicious High Engagement Combination
  IF F01 (er_z_score) > 3.0
  AND F02 (engagement_cv) > 0.80
  → flag: "suspicious_high_variance_engagement"
  → requires_human_review = true
  (ER sangat tinggi tapi tidak konsisten = kemungkinan viral satu video + pod lainnya)

BR-04 — Bought Followers Signal
  IF F09 (heart_per_follower_norm) < 0.20
  AND F17 (growth_spike_score) < -0.60
  → band tidak bisa A (minimum B)
  → tambahkan flag: "follower_quality_concern"

BR-05 — Campaign Data Override (jika tersedia)
  IF has_campaign_data = true
  AND F18 (fulfillment_rate) < 0.40
  → band tidak bisa A atau B (minimum C)

BR-06 — Excellent Track Record Bonus
  IF has_campaign_data = true
  AND F18 ≥ 0.85
  AND F20 ≥ 4.0
  AND F21 ≥ 0.80
  → band bisa naik satu level (D→C, C→B, B→A)
  (campaign outcome yang kuat bisa mengangkat creator yang public signal-nya biasa)

BR-07 — Caption Uniformity Flag
  IF F14 (caption_similarity_mean) > 0.85
  → tambahkan flag: "possible_ai_generated_content"
  → bobot maksimal 10% terhadap skor (sesuai proposal BRIN)
  → TIDAK menurunkan band secara otomatis
  → ditampilkan ke user sebagai informasi, bukan penilaian
```

---

## Bagian 7 — Precision-Recall Design Philosophy

**Prinsip utama: false positive lebih merusak daripada false negative.**

False positive = creator kredibel di-flag sebagai berisiko
→ berdampak langsung pada penghasilan individu
→ merusak kepercayaan pada sistem
→ memicu sanggahan yang memakan waktu tim

False negative = creator berisiko lolos sebagai kredibel
→ brand rugi dari satu kampanye
→ tidak merusak creator yang salah
→ lebih mudah dipulihkan

**Konsekuensi desain:**
- Threshold A/B konservatif: lebih mudah dapat B dari A
- Flag requires_human_review untuk kasus ambiguous (jangan memutuskan sendiri)
- CI yang jujur: tampilkan ketidakpastian, jangan sembunyikan
- Band D hanya ketika evidence kuat, bukan sekedar di bawah median

---

## Bagian 8 — Failure Modes & Limitasi

| Skenario | Efek | Mitigasi |
|---|---|---|
| Creator baru (<30 video) | Signal tidak cukup → CI lebar | BR-01: return insufficient_data |
| Viral organik terdeteksi sebagai anomali | F06 terlalu rendah → flag tidak perlu | BR-03 butuh kombinasi, bukan satu sinyal |
| Niche underrepresented di DB | Cohort baseline tidak akurat | Fallback ke tier-level baseline |
| Bot canggih yang mimik pola organik | Model miss (false negative) | Campaign outcome layer sebagai second check |
| Creator sengaja adjust behavior setelah tahu sistem | Gaming the score | Longitudinal monitoring (v2) |
| Apify scraper berubah format | Feature extraction rusak | Schema validation + alerts |
| Bahasa Indonesia vs English caption mixing | F13/F14 tidak akurat | Preprocessing: detect language, normalize |

---

## Bagian 9 — Stack Teknis

```
Stage 0 (sekarang):
  Language:  TypeScript
  Runtime:   Next.js API routes (Vercel)
  Data:      Apify → CariKOL DB (Prisma/Supabase)
  Scoring:   Inline heuristic functions
  Caching:   TikTokAccount table (refresh interval: 7 hari)

Stage 1 (September 2026):
  ML:        Python 3.11
  Models:    scikit-learn (Isolation Forest), xgboost, shap
  API:       FastAPI (POST /score)
  Embedding: sentence-transformers (multilingual-MiniLM)
  Hosting:   Vercel Python runtime atau Railway
  Integration: Next.js API route → HTTP call ke Python service

Data pipeline:
  Collection: Apify TikTok scrapers (clockworks/*)
  Storage:    Supabase (PostgreSQL)
  Labels:     CSV → Supabase label table
  Baselines:  JSON file, diperbarui bulanan

Explainability:
  SHAP:       shap.TreeExplainer
  LLM:        Claude claude-sonnet-4-6 via @anthropic-ai/sdk (sudah terpasang)
  Template:   Controlled — bukan free generation
```

---

## Bagian 10 — Urutan Implementasi

```
Minggu 1 (Agustus)
  ✦ Setup Apify account
  ✦ Build fetch-profile.ts + fetch-videos.ts
  ✦ Compute F01, F02, F03, F08, F09, F11, F12 (semua dari Apify output)
  ✦ Heuristic scorer Stage 0 (F01–F12 saja)
  ✦ Wire ke /api/trust-score/[username]
  ✦ Update UI /cek/[username] dengan data nyata @ininabnabb

Minggu 2–3 (Agustus)
  ✦ Labeling: struktur kampanye Buzzeryok ke DB (Decision + OutcomeReview)
  ✦ Compute F18–F23 dari DB
  ✦ Hitung cohort baselines dari 300 creator yang ada
  ✦ Refine Stage 0 scorer dengan baselines yang akurat

Minggu 4 (Agustus)
  ✦ Annotation: 3 anotator, rubrik label, ukur κ
  ✦ Feature extraction pipeline (Python) untuk F01–F17

September
  ✦ Isolation Forest training per kohort
  ✦ XGBoost training + evaluation
  ✦ SHAP integration
  ✦ Replace Stage 0 scorer dengan Python service
  ✦ Fairness assessment (precision per tier, per niche)

Oktober
  ✦ Calibration (Platt Scaling)
  ✦ CI via bootstrap
  ✦ Pilot internal 20 kampanye
  ✦ Integration ke UI final
```
