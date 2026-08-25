# 17 — Talent Discovery MVP Roadmap

Tujuan: talent bisa **login (Google + email/password)**, **connect ≥2 akun social** (MVP: submit link,
admin scrape satu-satu), dan **cek + ikut job yang available**.

Fondasi sudah ada di schema — ini merangkai yang ada + isi gap kecil, bukan bikin dari nol.

## Pemetaan ke schema existing

| Kebutuhan | Model existing |
|---|---|
| Talent | `User{role: talent}` ↔ 1:1 `Creator` (via `creatorId`) |
| Connect social | `SocialAccount` (`profileUrl`, `platformId`, `syncType`) + `SocialSnapshot` |
| Jobs available | `Campaign{status: active}` + `Brief` |
| Ikut job | `Application` (unique `campaignId+creatorId`, default `APPLIED`) |
| Admin scrape | `scrapeThreadsCreator` / TikTok + pipeline snapshot (dari kerjaan `/cek`) |

Dua surface: **Talent Portal** (`/portal`, self-serve) vs **Ops internal** (`/(app)`).

## Keputusan yang sudah di-lock

1. **Gate apply = cukup ≥2 link tersubmit (status PENDING).** Talent tidak di-block nunggu admin.
   Verifikasi jalan paralel dan jadi lapisan trust untuk sisi Ops saat memilih `SELECTED`.
2. **Job board terbuka (open apply).** Semua talent yang lolos gate lihat semua `Campaign{active}`.
3. **Login: Google + email/password.** Google jalur utama talent; email/password tetap ada
   (internal team pakai login existing).

## Gap schema (satu migration di depan)

`SocialAccount` perlu status verifikasi:

```prisma
enum SocialAccountStatus {
  PENDING_REVIEW   // talent submit link, nunggu admin
  VERIFIED         // admin sudah scrape & konfirmasi
  REJECTED         // link salah/private/bukan punya dia
  @@map("social_account_status")
}

model SocialAccount {
  // ...existing...
  status       SocialAccountStatus @default(PENDING_REVIEW)
  reviewNote   String?   @map("review_note")
  verifiedById String?   @map("verified_by")
  verifiedAt   DateTime? @map("verified_at")
}
```

Tidak ada model baru lain — Application/Campaign/Brief sudah cukup.

---

## Phase 0 — Auth Google + role gating (fondasi)
**Goal:** talent login Google/email dan mendarat di portal.
- Google OAuth via Supabase (`@supabase/ssr`). Callback → cari/buat `User{role: talent}` + `Creator` kosong, link `creatorId`.
- Pertahankan login email/password existing (`modules/auth/actions/login.ts`).
- Guard: `/portal/*` = `talent`; `/(app)/*` = internal (`admin`/`campaign_manager`/`kol_specialist`).
- **Acceptance:** login Google sekali klik → portal; user+creator tercipta otomatis.

## Phase 1 — Onboarding + connect ≥2 social (link submission)
**Goal:** talent isi profil dasar & submit ≥2 link social.
- Extend `portal/onboarding`: profil (`name`, `city`, `contact`, `categories`) + connect social (pilih platform + paste `profileUrl`).
- Simpan `SocialAccount{status: PENDING_REVIEW, syncType: NONE}`.
- Gate: progress "0/2 akun tersubmit"; profil "complete" saat ≥2 link masuk.
- **Acceptance:** submit 2 link → state "Menunggu verifikasi admin".

## Phase 2 — Admin scrape & verify queue (internal)
**Goal:** admin verifikasi link satu-satu.
- Halaman internal: antrean `SocialAccount{status: PENDING_REVIEW}`.
- Tombol "Scrape" → `scrapeThreadsCreator`/TikTok → simpan `SocialSnapshot` → set `VERIFIED` (isi `username/avatarUrl/displayName`) atau `REJECTED` + `reviewNote`.
- Reuse confidence/snapshot mekanikal dari `/cek` — admin lihat bukti, bukan nebak.
- **Acceptance:** verify 1 akun → talent lihat badge VERIFIED + metrik dasar.

## Phase 3 — Job board + apply (inti "discovery")
**Goal:** talent lihat & ikut job.
- `/portal/jobs`: list `Campaign{active}` + ringkasan `Brief` (objective, platforms, budget range, deliverables, deadline, reward).
- Detail → **Apply** → `Application{APPLIED}` (unique guard cegah dobel).
- `/portal/applications`: status lamaran (APPLIED→SELECTED→…→COMPLETED).
- **Gate apply:** ≥2 `SocialAccount` tersubmit (PENDING ok) + profil terisi.
- **Acceptance:** apply → muncul di daftar pelamar campaign (internal).

## Phase 4 — Matching & polish
**Goal:** discovery terasa pintar, bukan list mentah.
- Filter/sort job (platform, PAID/BARTER, budget, kategori).
- Hint kelayakan ("cocok karena kategori X / platform Y"), evidence-based.
- Internal: daftar pelamar per campaign + data snapshot untuk `SELECTED`/`REJECTED`
  (di sinilah status VERIFIED memberi nilai).
- (Opsional) email notif saat status lamaran berubah.

Cross-cutting: `AuditLog` untuk aksi admin, empty states, authorization tiap server action.

---

## Saran urutan mulai
Vertical slice Phase 0 → 1 dulu (login Google + onboarding + submit link) supaya ada alur talent
end-to-end yang bisa dicoba, baru Phase 2 (admin verify) & Phase 3 (job board) paralel.
