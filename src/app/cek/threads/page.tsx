import {
  AlertTriangle, ArrowRight, BadgeCheck, CheckCircle2, Eye, ExternalLink, Heart,
  Lightbulb, Lock, MessageCircle, ShieldCheck, TrendingUp, Users,
} from "lucide-react"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"
import {
  scrapeThreadsPost, scrapeThreadsCreator, analyzePost, parseThreadsUrl,
} from "@/lib/threads"
import type { ThreadPost, ThreadsProfile } from "@/lib/threads"
import { ThreadsCekForm } from "./_components/ThreadsCekForm"

export const metadata = { title: "Cek Threads - CariKOL" }

const nf = new Intl.NumberFormat("id-ID")
const fmt = (n: number | null) => (n === null ? "-" : nf.format(n))

function formatWibTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date)
}

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d)
}

// Link permalink asli ke Threads (buka tab baru → user verifikasi sendiri).
function threadsPostUrl(post: ThreadPost): string {
  if (post.raw.url) return post.raw.url
  return `https://www.threads.com/@${post.raw.username}/post/${post.raw.code}`
}

// Gambar CDN Threads/IG di-relay lewat origin kita (lihat api/threads/image).
function proxiedImage(url: string | null | undefined): string | null {
  return url ? `/api/threads/image?u=${encodeURIComponent(url)}` : null
}

// Rank mentah: views desc (null paling belakang), tie-break engagement.
function rankByEngagement(posts: ThreadPost[]): ThreadPost[] {
  return [...posts].sort((a, b) => {
    const va = a.raw.engagement.views
    const vb = b.raw.engagement.views
    if (va !== vb) {
      if (va === null) return 1
      if (vb === null) return -1
      return vb - va
    }
    return b.computed.engagement - a.computed.engagement
  })
}

const MEDIA_LABEL: Record<string, string> = {
  text: "Teks", image: "Gambar", carousel: "Carousel", video: "Video",
}

function formatBreakdown(posts: ThreadPost[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of posts) {
    const key = p.raw.media.type
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ label: MEDIA_LABEL[type] ?? type, count }))
}

// Median (nilai tengah) — lebih tahan outlier daripada rata-rata untuk sampel kecil.
function median(values: number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

// Badge per-post: sorotan mekanikal supaya mata cepat menangkap yang menonjol.
const BADGE_STYLE: Record<string, string> = {
  "Top Reach":    "border-violet-200 bg-violet-50 text-violet-700",
  "Most Replies": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Terbaru":      "border-emerald-200 bg-emerald-50 text-emerald-700",
}
function computeBadges(posts: ThreadPost[]): Map<string, string[]> {
  const badges = new Map<string, string[]>()
  const add = (code: string, b: string) => badges.set(code, [...(badges.get(code) ?? []), b])

  const topViews = [...posts]
    .filter((p) => (p.raw.engagement.views ?? 0) > 0)
    .sort((a, b) => (b.raw.engagement.views ?? 0) - (a.raw.engagement.views ?? 0))[0]
  if (topViews) add(topViews.raw.code, "Top Reach")

  const topReplies = [...posts]
    .filter((p) => (p.raw.engagement.replies ?? 0) > 0)
    .sort((a, b) => (b.raw.engagement.replies ?? 0) - (a.raw.engagement.replies ?? 0))[0]
  if (topReplies) add(topReplies.raw.code, "Most Replies")

  const newest = [...posts]
    .filter((p) => Number.isFinite(new Date(p.raw.createdAt).getTime()))
    .sort((a, b) => new Date(b.raw.createdAt).getTime() - new Date(a.raw.createdAt).getTime())[0]
  if (newest) add(newest.raw.code, "Terbaru")

  return badges
}

// Ringkasan keputusan — kalimat DECISION-oriented (bukan angka), deterministik.
// Menjawab "apa artinya buat gue?", bukan "berapa angkanya".
function buildDecisionSummary(totalSample: number): string[] {
  return [
    `Snapshot ini cukup representatif untuk melihat **pola aktivitas terbaru**, tetapi belum cukup untuk ` +
      `mengevaluasi **kecocokan brand atau audience** karena hanya menggunakan **${totalSample} posting publik**.`,
    `Semua posting dapat dibuka kembali sehingga tim bisa **memverifikasi setiap angka** tanpa bergantung pada AI.`,
  ]
}

// Tingkat keyakinan snapshot — DETERMINISTIK dari coverage & sampel, BUKAN AI.
// Snapshot tier tak pernah "Tinggi": secara struktural cuma aktivitas terbaru.
function buildConfidence(totalSample: number, validViewSample: number): {
  level: "Rendah" | "Sedang"; reasons: string[]
} {
  const complete = validViewSample === totalSample && totalSample > 0
  const reasons: string[] = []
  if (!complete) {
    reasons.push(`${totalSample - validViewSample} dari ${totalSample} posting belum memiliki data views.`)
  }
  reasons.push(`Snapshot hanya mencakup ${totalSample} aktivitas terbaru, bukan histori penuh.`)
  return { level: complete ? "Sedang" : "Rendah", reasons }
}

// Decision Notes — next action, bukan insight. Inilah yang bikin ini "decision
// intelligence", bukan sekadar analytics. Sepenuhnya deterministik.
type NoteTone = "ok" | "warn" | "next"
function buildDecisionNotes(totalSample: number): Array<{ tone: NoteTone; text: string }> {
  return [
    { tone: "ok",   text: `Snapshot ini cukup untuk menilai aktivitas terbaru creator (${totalSample} post publik).` },
    { tone: "warn", text: "Belum cukup untuk mengevaluasi kecocokan campaign, audience, atau brand fit." },
    { tone: "next", text: "Jika creator masuk shortlist, minta mereka menghubungkan akun untuk membuka histori lengkap." },
  ]
}

// Render **bold** inline (mini-markdown) untuk kalimat ringkasan.
function renderEmphasis(text: string): React.ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-zinc-900">{chunk}</strong> : chunk,
  )
}

// Frekuensi kata mentah — bukan klasifikasi topik, cuma hitung kemunculan.
const WORD_STOPWORDS = new Set(
  ("yang di ke dari dan atau tapi untuk dengan pada dalam adalah itu ini aku saya kamu kita mereka dia " +
    "gak nggak ga tidak juga bisa akan sudah udah lagi aja saja kalau kalo karena biar buat sama ada " +
    "jadi kok sih nih deh dong yaa iya kan gitu gini banget bgt gue gua lo lu kamu nya para satu dua " +
    "the and for you with что are was this that have not but من في على")
    .split(/\s+/),
)

function recurringWords(posts: ThreadPost[], limit = 12): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of posts) {
    const text = (p.raw.text ?? "").toLowerCase().replace(/https?:\/\/\S+/g, " ")
    const tokens = text.match(/[a-z0-9]{3,}/g) ?? []
    const seen = new Set<string>()
    for (const t of tokens) {
      if (WORD_STOPWORDS.has(t)) continue
      // hitung sekali per post agar 1 post spam kata tak mendominasi
      if (seen.has(t)) continue
      seen.add(t)
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}

// ── deteksi jenis link ────────────────────────────────────────────
type Target =
  | { kind: "post"; url: string }
  | { kind: "account"; username: string }

type TargetMode = "auto" | "post" | "account"

function detectTarget(input: string, mode: TargetMode): Target | null {
  const s = input.trim()
  if (!s) return null

  if (mode === "post") {
    if (/threads\.(?:com|net)\/@[^/]+\/post\//.test(s)) return { kind: "post", url: s }
    return null
  }

  if (mode === "account") {
    const accFromUrl = s.match(/threads\.(?:com|net)\/@([A-Za-z0-9._]+)/)
    if (accFromUrl) return { kind: "account", username: accFromUrl[1] }
    const bare = s.replace(/^@/, "").split(/[/?]/)[0]
    if (/^[A-Za-z0-9._]+$/.test(bare)) return { kind: "account", username: bare }
    return null
  }

  // permalink post: .../@user/post/CODE
  if (/threads\.(?:com|net)\/@[^/]+\/post\//.test(s)) return { kind: "post", url: s }
  // url akun
  const acc = s.match(/threads\.(?:com|net)\/@([A-Za-z0-9._]+)/)
  if (acc) return { kind: "account", username: acc[1] }
  // @username atau kata polos
  const bare = s.replace(/^@/, "").split(/[/?]/)[0]
  if (/^[A-Za-z0-9._]+$/.test(bare)) return { kind: "account", username: bare }
  return null
}

// ── UI atoms ──────────────────────────────────────────────────────
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-violet-500/80 via-fuchsia-500/70 to-cyan-500/75" />
      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">{label}</div>
      <div className="mt-1 break-words text-2xl font-bold leading-tight tabular-nums text-zinc-900">{value}</div>
    </div>
  )
}

// Metric "manusiawi": ikon + label kategori + angka + hint kecil.
function StatCard({
  icon: Icon, label, value, hint,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string; value: string; hint?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
        <Icon size={13} className="text-zinc-400" /> {label}
      </div>
      <div className="mt-1.5 break-words text-2xl font-bold leading-tight tabular-nums text-zinc-900">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-zinc-400">{hint}</div>}
    </div>
  )
}

function Chip({ label, value, conf }: { label: string; value: string; conf?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700">
      {label && <span className="text-zinc-500">{label}</span>}
      <span className="font-semibold text-zinc-900">{value}</span>
      {typeof conf === "number" && <span className="text-zinc-500">{Math.round(conf * 100)}%</span>}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)] md:p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-zinc-600">{title}</h3>
      {children}
    </div>
  )
}

// ── render: POST (deep + AI) ──────────────────────────────────────
async function PostView({ url }: { url: string }) {
  const fetchedAt = new Date()
  let post: ThreadPost
  try { post = await scrapeThreadsPost(url) }
  catch (e) { return <ErrorCard msg="Gagal ambil post ini (mungkin private/URL salah)." detail={String(e)} /> }

  const analyzed = await analyzePost(post)
  const { raw, computed } = post
  const it = analyzed.intelligence
  const fetchedLabel = formatWibTimestamp(fetchedAt)

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
        <p className="font-semibold">Analisis AI dari 1 postingan publik yang kamu pilih.</p>
        <p className="mt-0.5">Diambil pada {fetchedLabel} WIB.</p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-zinc-900">
          @{raw.username}
          <span className="text-zinc-400">· {new Date(raw.createdAt).toLocaleDateString("id-ID")}</span>
          <a
            href={threadsPostUrl(post)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-700"
          >
            {raw.media.type} <ExternalLink size={11} />
          </a>
        </div>
        <p className="whitespace-pre-wrap text-sm text-zinc-700">{raw.text || <em className="text-zinc-400">(tanpa caption)</em>}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Views" value={fmt(raw.engagement.views)} />
        <Metric label="Likes" value={fmt(raw.engagement.likes)} />
        <Metric label="Replies" value={fmt(raw.engagement.replies)} />
        <Metric label="Reposts" value={fmt(raw.engagement.reposts)} />
        <Metric label="Quotes" value={fmt(raw.engagement.quotes)} />
        <Metric label="Eng.Rate" value={computed.engagementRate === null ? "-" : `${(computed.engagementRate * 100).toFixed(1)}%`} />
      </div>

      {analyzed.analysis.status !== "SUCCESS" || !it ? (
        <ErrorCard msg="Analisis AI gagal untuk post ini." detail={analyzed.analysis.error ?? ""} />
      ) : (
        <>
          <Section title="Konten">
            <div className="mb-2 text-sm font-semibold text-zinc-800">
              {it.content.topic.value.topic}
              {it.content.topic.value.subtopic && <span className="text-zinc-400"> › {it.content.topic.value.subtopic}</span>}
              {it.content.topic.value.microtopic && <span className="text-zinc-400"> › {it.content.topic.value.microtopic}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="tone" value={it.content.tone.value} conf={it.content.tone.confidence} />
              <Chip label="intent" value={it.content.intent.value} conf={it.content.intent.confidence} />
              <Chip label="hook" value={it.content.hookType.value} conf={it.content.hookType.confidence} />
              <Chip label="cta" value={it.content.ctaType.value} conf={it.content.ctaType.confidence} />
              <Chip label="sentimen" value={it.content.sentiment.value} conf={it.content.sentiment.confidence} />
              <Chip label="bahasa" value={it.content.language.value} />
            </div>
            {it.content.keywords.length > 0 && (
              <div className="mt-2 text-xs text-zinc-500">Kata kunci: {it.content.keywords.join(", ")}</div>
            )}
          </Section>

          <Section title="Brand Safety & Afinitas">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className={it.brand.safety.score >= 70 ? "text-emerald-500" : it.brand.safety.score >= 40 ? "text-amber-500" : "text-rose-500"} />
              <span className="text-2xl font-bold tabular-nums text-zinc-900">{it.brand.safety.score}</span>
              <span className="text-xs text-zinc-400">/100 · {it.brand.safety.severity}</span>
              {it.brand.safety.labels.length > 0 && (
                <span className="ml-auto text-xs text-zinc-500">{it.brand.safety.labels.join(", ")}</span>
              )}
            </div>
            {Object.keys(it.brand.affinity.value).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(it.brand.affinity.value).map(([k, v]) => <Chip key={k} label={k} value={`${Math.round(v * 100)}%`} />)}
              </div>
            )}
          </Section>

          <Section title="Audiens (dari sampel reply - bias top)">
            <div className="text-xs text-zinc-600">
              Positif {Math.round(it.audience.replyQuality.value.positiveRatio * 100)}% ·
              Negatif {Math.round(it.audience.replyQuality.value.negativeRatio * 100)}% ·
              Spam {Math.round(it.audience.replyQuality.value.spamRatio * 100)}% ·
              Tanya {Math.round(it.audience.replyQuality.value.questionRatio * 100)}%
            </div>
            {it.audience.persona.value.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {it.audience.persona.value.map((p, i) => <Chip key={i} label="" value={p} />)}
              </div>
            )}
          </Section>

          <Section title="Kenapa perform begini">
            <p className="text-sm text-zinc-700">{it.performance.reason.summary}</p>
            {it.performance.reason.drivers.length > 0 && (
              <ul className="mt-2 space-y-1">
                {it.performance.reason.drivers.map((d, i) => (
                  <li key={i} className="text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-700">{d.type}</span> ·{Math.round(d.confidence * 100)}% - {d.evidence}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

// ── render: ACCOUNT (snapshot publik mekanikal — TANPA klaim AI) ──
// Prinsip: 4 post publik = sampel acak & tanpa consent → hanya tampilkan
// FAKTA yang benar-benar terlihat (metrik, ranking, format). Tidak ada
// inferensi identity/audience/brand. Profil AI dibuka setelah creator connect.
async function AccountView({ username }: { username: string }) {
  const fetchedAt = new Date()
  let profile: ThreadsProfile, posts: ThreadPost[]
  try { ({ profile, posts } = await scrapeThreadsCreator(username)) }
  catch (e) { return <ErrorCard msg={`Gagal ambil akun @${username} (mungkin private/tidak ada).`} detail={String(e)} /> }

  const withViews = posts.filter((p) => (p.raw.engagement.views ?? 0) > 0)
  const totalSample = posts.length
  const validViewSample = withViews.length
  const medianViews = median(withViews.map((p) => p.raw.engagement.views!))
  const medianEng = median(
    withViews.map((p) => p.computed.engagementRate).filter((r): r is number => typeof r === "number"),
  )
  const ranked = rankByEngagement(posts)
  const formats = formatBreakdown(posts)
  const words = recurringWords(posts)
  const badges = computeBadges(posts)
  const summary = buildDecisionSummary(totalSample)
  const confidence = buildConfidence(totalSample, validViewSample)
  const notes = buildDecisionNotes(totalSample)
  const coverageComplete = validViewSample === totalSample && totalSample > 0
  const fetchedLabel = formatWibTimestamp(fetchedAt)

  const LOCKED = ["Audience Pattern", "Content Pillars", "Communication Style", "Brand Match", "Pricing Confidence"]
  const STEPS = [
    "Ambil postingan publik terbaru (tanpa login).",
    "Hitung metrik apa adanya — tanpa AI.",
    "Urutkan berdasarkan engagement.",
    "Hubungkan setiap angka ke post aslinya.",
  ]

  return (
    <div className="space-y-10">
      {/* ── QUICK SUMMARY: profil + decision summary ── */}
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.45)]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-100 blur-2xl" />
          <div className="absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-cyan-100 blur-2xl" />
          <div className="relative flex flex-wrap items-center gap-4">
            {proxiedImage(profile.avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxiedImage(profile.avatarUrl)!}
                alt={`Foto profil @${profile.username}`}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-lg font-bold text-zinc-700">
                {profile.displayName?.[0]?.toUpperCase() ?? profile.username[0]?.toUpperCase() ?? "C"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-lg font-bold text-zinc-900">
                {profile.displayName}
                {profile.isVerified && <BadgeCheck size={16} className="text-sky-500" />}
              </div>
              <div className="text-sm text-zinc-500">@{profile.username}</div>
              {profile.biography && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{profile.biography}</p>}
            </div>
            <div className="text-right text-[11px] text-zinc-400">
              <div>Snapshot dibuat</div>
              <div className="font-semibold text-zinc-600">{fetchedLabel} WIB</div>
              <div className="mt-1">{totalSample} postingan publik terbaru</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)] md:p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-800">
            <Lightbulb size={16} className="text-amber-500" /> Snapshot Summary
          </div>
          <ul className="space-y-2">
            {summary.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                <span>{renderEmphasis(line)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SNAPSHOT CONFIDENCE (signature: kami tunjukkan seberapa yakin) ── */}
      <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)] md:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-800">
          <ShieldCheck size={16} className="text-zinc-500" /> Tingkat Keyakinan Snapshot
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 px-4 py-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${coverageComplete ? "bg-emerald-500" : "bg-amber-500"}`} />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Data Coverage</div>
              <div className="text-sm font-semibold text-zinc-700">{validViewSample} dari {totalSample} posting punya data lengkap</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 px-4 py-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${confidence.level === "Sedang" ? "bg-amber-500" : "bg-rose-500"}`} />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Tingkat Keyakinan</div>
              <div className="text-sm font-semibold text-zinc-700">{confidence.level}</div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Alasan</div>
          <ul className="mt-1.5 space-y-1">
            {confidence.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-zinc-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />{r}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 border-t border-zinc-200/70 pt-3 text-[13px] text-zinc-500">
          Kami tidak hanya memberi insight — kami tunjukkan{" "}
          <span className="font-semibold text-zinc-700">seberapa yakin</span> insight itu, beserta alasannya.
        </p>
      </section>

      {/* ── SNAPSHOT OVERVIEW (metrik + subtitle manusiawi) ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Apa yang kami temukan</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatCard icon={Users} label="Audience" value={fmt(profile.followerCount)} hint="Ukuran komunitas" />
          <StatCard icon={Eye} label="Reach" value={fmt(medianViews)} hint="Median views/post" />
          <StatCard icon={TrendingUp} label="Engagement" value={medianEng === null ? "-" : `${(medianEng * 100).toFixed(1)}%`} hint="Interaksi median antar-post" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
          <span className="font-semibold text-zinc-500">Format:</span>
          {formats.map((f) => (
            <span key={f.label} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600">{f.label} ({f.count})</span>
          ))}
        </div>
      </section>

      {/* ── RECENT POSTS (buktinya) ── */}
      <section className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Recent Posts</h2>
            <span className="text-[11px] text-zinc-400">urut engagement</span>
          </div>
          <p className="mt-1 text-[13px] text-zinc-500">
            Semua angka di atas berasal dari posting-posting berikut. Klik untuk memverifikasi sendiri.
          </p>
        </div>
        <div className="space-y-2.5">
          {ranked.map((p, i) => (
            <a
              key={p.raw.code}
              href={threadsPostUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3.5 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3.5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] transition hover:border-violet-300 hover:bg-violet-50/40"
            >
              {proxiedImage(p.raw.media.thumbnail) ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxiedImage(p.raw.media.thumbnail)!}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {p.raw.media.hasVideo && (
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] font-semibold text-white">▶</span>
                  )}
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-[10px] text-zinc-400">
                  {MEDIA_LABEL[p.raw.media.type] ?? p.raw.media.type}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold text-white">#{i + 1}</span>
                  {(badges.get(p.raw.code) ?? []).map((b) => (
                    <span key={b} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLE[b] ?? "border-zinc-200 bg-zinc-50 text-zinc-600"}`}>
                      {b}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-zinc-400 transition group-hover:text-violet-600">
                    Lihat di Threads <ExternalLink size={11} />
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-zinc-700">{p.raw.text || "(tanpa caption)"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums text-zinc-500">
                  <span className="inline-flex items-center gap-1"><Eye size={12} className="text-zinc-400" /> {fmt(p.raw.engagement.views)}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={12} className="text-zinc-400" /> {fmt(p.raw.engagement.likes)}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle size={12} className="text-zinc-400" /> {fmt(p.raw.engagement.replies)}</span>
                  <span className="text-[11px] text-zinc-300">{shortDate(p.raw.createdAt)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        {words.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Kata yang sering muncul</div>
            <div className="flex flex-wrap gap-1.5">
              {words.map((w) => (
                <span key={w.word} className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">
                  {w.word} <span className="text-zinc-400">{w.count}×</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-zinc-400">
              Hitungan kata mentah (muncul di ≥2 post) — bukan klasifikasi topik.
            </p>
          </div>
        )}
      </section>

      {/* ── DECISION NOTES (signature: next action, bukan insight) ── */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)]">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          Decision Notes — apa yang bisa dilakukan sekarang
        </h2>
        <ul className="mt-4 space-y-3">
          {notes.map((n, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-700">
              {n.tone === "ok" && <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" />}
              {n.tone === "warn" && <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-500" />}
              {n.tone === "next" && <ArrowRight size={17} className="mt-0.5 shrink-0 text-violet-500" />}
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LOCKED: yang butuh histori penuh ── */}
      <section className="rounded-3xl border border-violet-200 bg-violet-50/60 p-6">
        <div className="flex items-center gap-2 text-base font-bold text-zinc-900">
          <Lock size={17} className="text-violet-600" /> Yang membutuhkan histori penuh
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Snapshot publik memang cukup untuk melihat aktivitas terbaru. Namun kami belum menyimpulkan hal-hal
          berikut karena membutuhkan histori posting yang lebih panjang.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {LOCKED.map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-2xl border border-violet-200/70 bg-white px-3 py-3 text-sm font-medium text-zinc-500">
              <Lock size={13} className="shrink-0 text-violet-400" /> {f}
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE (signature positioning) ── */}
      <section className="rounded-3xl border border-zinc-900 bg-zinc-900 p-6 md:p-8">
        <blockquote className="text-lg font-semibold leading-snug text-white md:text-xl">
          &ldquo;Lebih baik mengatakan &lsquo;belum tahu&rsquo; daripada memberikan analisis yang tidak bisa dibuktikan.&rdquo;
        </blockquote>
        <p className="mt-3 text-sm text-zinc-400">Snapshot ini hanya menggunakan data publik terbaru.</p>
      </section>

      {/* ── CTA (next action ke connected tier) ── */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-600 sm:flex">
            <ArrowRight size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-zinc-900">Siap melihat profil lengkap?</p>
            <p className="mt-1 text-sm text-zinc-600">Hubungkan akun Threads creator untuk membuka:</p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              {["Audience Pattern", "Content Pillars", "Brand Match", "Pricing Confidence"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-zinc-700">
                  <CheckCircle2 size={14} className="shrink-0 text-violet-500" /> {f}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/auth/threads"
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Buka Profil Lengkap <ArrowRight size={15} />
              </a>
              <span className="text-[13px] text-zinc-500">
                Bukan akunmu? Minta creator ini menghubungkan akunnya untuk membuka histori penuh.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (visual bertingkat) ── */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Cara snapshot ini dibuat</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={i} className="relative rounded-2xl border border-zinc-200 bg-white px-4 py-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">{i + 1}</div>
              <p className="mt-2 text-sm text-zinc-600">{step}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-[13px] text-zinc-500">
          <CheckCircle2 size={15} className="text-emerald-500" />
          Untuk cek 1 post secara mendalam (topik/tone/brand-safety/persona), tempel link post-nya di kolom pencarian.
        </p>
      </section>
    </div>
  )
}

function ErrorCard({ msg, detail }: { msg: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-700">{msg}</p>
      {detail && <p className="mt-1 text-xs text-rose-500">{detail}</p>}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────
export default async function CekThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; m?: string }>
}) {
  const { u, m } = await searchParams
  const mode: TargetMode = m === "post" || m === "account" ? m : "auto"
  const target = u ? detectTarget(u, mode) : null

  return (
    <div className="min-h-screen bg-[#FAFAFC]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 backdrop-blur">
        <CariKOLLogo size="sm" />
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-500">Cek Threads</span>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── HERO (gradient) ── */}
        <div className="relative mb-12 overflow-hidden rounded-[28px] border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-5 shadow-[0_20px_46px_-34px_rgba(15,23,42,0.45)] md:p-7">
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-100 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-cyan-100 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className="inline-flex items-center rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                Public Creator Snapshot
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-4xl">
                Evaluasi creator Threads pakai data yang bisa diverifikasi, bukan opini AI.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-600">
                Ambil snapshot aktivitas publik creator dalam hitungan detik — semua insight selalu bisa
                ditelusuri kembali ke postingan aslinya.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-4 backdrop-blur">
              <ul className="space-y-2.5 text-sm font-medium text-zinc-700">
                {[
                  "Data publik terbaru",
                  "Ranking postingan",
                  "Analisis AI per post",
                  "Semua insight bisa dicek sumbernya",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative mt-5">
            <ThreadsCekForm defaultValue={u ?? ""} defaultMode={mode} />
          </div>
        </div>

        {u && !target && (
          <ErrorCard
            msg={
              mode === "post"
                ? "Format post tidak valid. Gunakan link post Threads: .../@user/post/CODE"
                : mode === "account"
                  ? "Format akun tidak valid. Gunakan link akun Threads atau @username."
                  : "Link tidak dikenali. Contoh: https://www.threads.com/@user atau .../post/CODE"
            }
          />
        )}
        {target?.kind === "post" && <PostView url={parseAndRebuild(target.url)} />}
        {target?.kind === "account" && <AccountView username={target.username} />}
      </main>
    </div>
  )
}

// normalisasi permalink (buang query, pastikan valid) sebelum di-scrape
function parseAndRebuild(url: string): string {
  try {
    const { username, code } = parseThreadsUrl(url)
    return `https://www.threads.com/@${username}/post/${code}`
  } catch { return url }
}
