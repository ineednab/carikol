import React from "react"
import Link from "next/link"
import {
  ArrowLeft, CheckCircle, AlertTriangle, Info,
  Flag, TrendingUp, Heart, Play, Eye,
  Star, BadgeCheck, Building2, Tag, Download, Share2,
  Shield, Clock, Zap, ChevronDown, Lightbulb,
  AlertCircle, XCircle, BarChart2,
} from "lucide-react"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"
import type { Metadata } from "next"

// ── Types ──────────────────────────────────────────────────────────────────

type Band                = "A" | "B" | "C" | "D"
type RecommendationType  = "RECOMMENDED" | "CONSIDER" | "REVIEW"
type Direction           = "positive" | "neutral" | "negative"
type SponsoredLikelihood = "very_likely" | "likely" | "organic" | "unknown"
type EvidenceTier        = "public" | "signal" | "firstparty"
type RiskSeverity        = "high" | "medium" | "low"

interface Signal {
  id:        string
  label:     string
  detail:    string
  strength:  "strong" | "moderate" | "weak"
  direction: Direction
  tier:      EvidenceTier
  iconColor: string
}

interface VideoCard {
  rank:      number
  title:     string
  postedAgo: string
  duration:  string
  views:     number
  likes:     number
  comments:  number
  engRate:   number
  pinned:    boolean
  sponsored: SponsoredLikelihood
  gradient:  [string, string]
  emoji:     string
}

interface BrandMention {
  brand:      string
  count:      number
  category:   string
  likelihood: SponsoredLikelihood
  confidence: number
}

interface PassportDimension {
  label: string
  stars: number
  note:  string
  tier:  EvidenceTier
}

interface AIInsight {
  title:      string
  body:       string
  confidence: number
  tag:        string
  tagColor:   string
}

interface Risk {
  severity: RiskSeverity
  label:    string
  detail:   string
}

interface TrustResult {
  displayName:         string
  username:            string
  avatarUrl:           string | null
  platform:            string
  tier:                string
  niche:               string
  bio:                 string
  joinedYear:          number
  followerCount:       number
  followingCount:      number
  totalLikes:          number
  avgViews:            number
  postingFreqPerWeek:  number
  videoCount:          number

  band:                Band
  score:               number
  confidenceLow:       number
  confidenceHigh:      number
  recommendation:      RecommendationType
  recommendationNote:  string
  generatedAt:         string
  dataWindow:          string

  suitableFor:         { label: string }[]
  notRecommendedFor:   { label: string; reason: string }[]

  passport:            PassportDimension[]
  insights:            AIInsight[]
  risks:               Risk[]
  contentTags:         { label: string; pct: number }[]
  signals:             Signal[]
  videos:              VideoCard[]
  brandMentions:       BrandMention[]
  brandCategories:     { label: string; pct: number }[]
  commercialSummary:   string
  sponsoredEstPct:     number

  explanationStrengths:   string[]
  explanationRisks:       string[]
  explanationOpportunity: string[]
  explanationFull:        string
}

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK: TrustResult = {
  displayName:        "Nabnab Rahmadani",
  username:           "ininabnab",
  avatarUrl:          "/avatar-ininabnab.jpg",
  platform:           "TikTok",
  tier:               "Micro Creator",
  niche:              "Freelance & Side Hustle",
  bio:                "CEO Freelance dan Sidehustle Indonesia mom @Minbuzz 🫶🏻 carikol.id",
  joinedYear:         2021,
  followerCount:      161_600,
  followingCount:     293,
  totalLikes:         3_000_000,
  avgViews:           43_000,
  postingFreqPerWeek: 3.1,
  videoCount:         160,

  band:               "B",
  score:              74,
  confidenceLow:      66,
  confidenceHigh:     82,
  recommendation:     "RECOMMENDED",
  recommendationNote: "Creator dengan viral track record dan audiens yang sudah terbentuk kuat. Cocok untuk brand di kategori financial, produktivitas, dan creator economy.",
  generatedAt:        "31 Jul 2026, 19:21 WIB",
  dataWindow:         "160 video publik",

  suitableFor: [
    { label: "Finance & Fintech" },
    { label: "Productivity Tools" },
    { label: "Creator Economy" },
    { label: "Edukasi Online" },
    { label: "E-commerce Affiliate" },
  ],
  notRecommendedFor: [
    { label: "Luxury & Premium",     reason: "Konten income-claim bertentangan dengan citra aspiratif brand premium" },
    { label: "Healthcare",           reason: "Klaim finansial sensitif untuk kategori regulated" },
    { label: "Enterprise B2B",       reason: "Audiens dominan pelajar & early career, bukan decision maker" },
  ],

  passport: [
    { label: "Can Verify Identity",    stars: 5.0, note: "Real person, wajah konsisten di 160 video",         tier: "public"     },
    { label: "Brand Safe",             stars: 5.0, note: "Tidak ada konten sensitif atau kontroversial",       tier: "public"     },
    { label: "Audience Quality",       stars: 4.0, note: "Heart/follower ratio 18,5× — median 8–12",          tier: "signal"     },
    { label: "Commercial Readiness",   stars: 3.5, note: "Niche konsisten, terbukti konversi affiliate",       tier: "public"     },
    { label: "Verified Campaign",      stars: 0,   note: "Belum ada data first-party CariKOL",                tier: "firstparty" },
  ],

  insights: [
    {
      title:      "Strong fintech campaign fit",
      body:       "Rasio heart-per-follower 18,5× mengindikasikan audiens yang telah membangun kepercayaan dengan creator — aset berharga untuk campaign fintech yang memerlukan trust transfer.",
      confidence: 83,
      tag:        "Audience",
      tagColor:   "bg-blue-50 text-blue-600",
    },
    {
      title:      "Rare combination: high commercial intent + organic engagement",
      body:       "Sebagian besar creator dengan commercial intent tinggi kehilangan organic engagement. @ininabnab mempertahankan ER 4,8% meski ~35% kontennya komersial — unusual di tier ini.",
      confidence: 77,
      tag:        "Commercial",
      tagColor:   "bg-violet-50 text-violet-600",
    },
    {
      title:      "Audience overlap rendah di kategori productivity",
      body:       "Niche freelance & side hustle kurang jenuh dibanding lifestyle umum. Brand productivity tools yang belum pernah ke niche ini berpeluang first-mover advantage.",
      confidence: 71,
      tag:        "Opportunity",
      tagColor:   "bg-emerald-50 text-emerald-600",
    },
  ],

  risks: [
    {
      severity: "medium",
      label:    "Income-claim content",
      detail:   "Sekitar 40% konten mengandung klaim pendapatan spesifik. Umum dan sah di niche ini, tapi bisa menciptakan brand dissonance untuk kategori regulated atau premium.",
    },
    {
      severity: "medium",
      label:    "High affiliate density",
      detail:   "~35% konten memiliki sinyal komersial/affiliate. Audiens terbiasa dengan content promosi — bisa mengurangi perceived authenticity untuk brand baru.",
    },
    {
      severity: "low",
      label:    "No verified campaign record",
      detail:   "Belum ada data first-party tentang response time, deliverable quality, atau outcome campaign. Tidak ada red flag, tapi juga tidak ada konfirmasi positif.",
    },
    {
      severity: "low",
      label:    "Minbuzz founder conflict",
      detail:   "Creator adalah founder Minbuzz — mention brand tersebut tidak bisa dihitung sebagai third-party endorsement yang natural.",
    },
  ],

  contentTags: [
    { label: "Income Claim",  pct: 41 },
    { label: "Affiliate",     pct: 35 },
    { label: "Tutorial",      pct: 28 },
    { label: "Edukasi",       pct: 22 },
    { label: "Motivasi",      pct: 14 },
  ],

  signals: [
    {
      id: "heart_ratio", tier: "signal", direction: "positive", strength: "strong",
      iconColor: "bg-violet-500",
      label: "Heart-per-Follower Ratio",
      detail: "18,5 hearts/follower — median micro creator Indonesia 8–12. Audiens sangat engaged secara historis. Ini sinyal kepercayaan jangka panjang, bukan viral satu kali.",
    },
    {
      id: "follower_ratio", tier: "public", direction: "positive", strength: "strong",
      iconColor: "bg-emerald-500",
      label: "Follower / Following Ratio",
      detail: "551:1 — sangat selektif dalam following. Bukan akun follow-for-follow.",
    },
    {
      id: "er_cohort", tier: "signal", direction: "positive", strength: "strong",
      iconColor: "bg-blue-500",
      label: "Engagement Rate vs Kohort",
      detail: "~4,8% (estimasi) vs median 3,1% untuk micro creator niche finance Indonesia. 55% di atas median kohort.",
    },
    {
      id: "viral_track", tier: "public", direction: "positive", strength: "strong",
      iconColor: "bg-teal-500",
      label: "Viral Track Record",
      detail: "3 video pinned: 4,2M, 4,2M, 5,7M views. Membuktikan potensi organic reach yang nyata, bukan anomali.",
    },
    {
      id: "income_claim", tier: "public", direction: "neutral", strength: "moderate",
      iconColor: "bg-amber-400",
      label: "Income-Claim Density",
      detail: "~40% konten memiliki klaim pendapatan spesifik. Strategi yang valid di niche ini tapi sensitif untuk beberapa kategori brand.",
    },
    {
      id: "affiliate_density", tier: "signal", direction: "neutral", strength: "moderate",
      iconColor: "bg-orange-400",
      label: "Affiliate Content Density",
      detail: "~35% konten mengandung sinyal affiliate/komersial. Tinggi tapi konsisten dengan niche.",
    },
    {
      id: "comment_quality", tier: "signal", direction: "positive", strength: "moderate",
      iconColor: "bg-zinc-400",
      label: "Comment Quality Index",
      detail: "Kualitas komentar di atas rata-rata. Tidak ada pola anomali engagement pod.",
    },
    {
      id: "growth", tier: "signal", direction: "positive", strength: "moderate",
      iconColor: "bg-zinc-400",
      label: "Growth Consistency",
      detail: "Pertumbuhan followers konsisten tanpa lonjakan tidak wajar dalam 90 hari terakhir.",
    },
  ],

  videos: [
    {
      rank: 1, pinned: true, emoji: "💰",
      gradient: ["from-pink-500", "to-rose-700"],
      title: "TUTORIAL NONTON TIKTOK DIBAYAR sampai 400 RIBU yang gabut kumpul",
      postedAgo: "Pinned", duration: "0:52",
      views: 4_200_000, likes: 183_000, comments: 8_400, engRate: 3.9,
      sponsored: "likely",
    },
    {
      rank: 2, pinned: true, emoji: "💬",
      gradient: ["from-blue-500", "to-indigo-700"],
      title: "yang mau balas chat dapat 75 ribu tiap hari? Yg hobi rebahan wajib tau",
      postedAgo: "Pinned", duration: "0:38",
      views: 4_200_000, likes: 174_000, comments: 10_200, engRate: 4.0,
      sponsored: "likely",
    },
    {
      rank: 3, pinned: true, emoji: "🚀",
      gradient: ["from-emerald-500", "to-green-700"],
      title: "Cara freelance mudah Dapat 1 JUTA pertama Untuk anak SMA 😄",
      postedAgo: "Pinned", duration: "1:04",
      views: 5_700_000, likes: 233_000, comments: 14_700, engRate: 4.1,
      sponsored: "organic",
    },
    {
      rank: 4, pinned: false, emoji: "📱",
      gradient: ["from-violet-500", "to-purple-700"],
      title: "STRATEGI KONTEN AFFILIATOR PEMULA 100 RB TIAP HARI",
      postedAgo: "1 minggu lalu", duration: "1:18",
      views: 59_600, likes: 2_780, comments: 341, engRate: 5.6,
      sponsored: "likely",
    },
    {
      rank: 5, pinned: false, emoji: "💵",
      gradient: ["from-teal-500", "to-cyan-700"],
      title: "AKU SPILI GAJI 9 JUTA AFFILIATE PEMULA FOLLOWERS 0",
      postedAgo: "2 minggu lalu", duration: "0:58",
      views: 56_200, likes: 2_610, comments: 298, engRate: 5.5,
      sponsored: "likely",
    },
    {
      rank: 6, pinned: false, emoji: "📊",
      gradient: ["from-amber-400", "to-orange-600"],
      title: "SPILL SOLUSI TIKTOK VIEWS STUCK DI 200 an (Affiliator Pemula Wajib Tau)",
      postedAgo: "3 minggu lalu", duration: "1:02",
      views: 44_600, likes: 2_120, comments: 267, engRate: 5.7,
      sponsored: "organic",
    },
  ],

  brandMentions: [
    { brand: "Minbuzz",          count: 18, category: "Community",     likelihood: "very_likely", confidence: 97 },
    { brand: "TikTok Affiliate", count: 12, category: "Platform",      likelihood: "very_likely", confidence: 89 },
    { brand: "DANA",             count: 4,  category: "Fintech",        likelihood: "likely",      confidence: 74 },
    { brand: "CariKOL",          count: 3,  category: "Creator Tools",  likelihood: "organic",     confidence: 95 },
    { brand: "Tokopedia",        count: 2,  category: "E-commerce",     likelihood: "unknown",     confidence: 48 },
  ],
  brandCategories: [
    { label: "Finance / Freelance",  pct: 88 },
    { label: "Affiliate Marketing",  pct: 73 },
    { label: "Creator Economy",      pct: 61 },
    { label: "Fintech / Dompet",     pct: 44 },
    { label: "E-commerce",           pct: 28 },
  ],
  commercialSummary:
    "Creator fokus pada niche freelance & side hustle dengan strategi affiliate. " +
    "DNA konten komersial sangat kuat di kategori finance dan creator economy.",
  sponsoredEstPct: 35,

  explanationStrengths: [
    "Organic audience dengan engagement historis tinggi",
    "Viral track record terbukti (>14M views pinned)",
    "Niche konsisten dan commercial-ready",
  ],
  explanationRisks: [
    "Income-claim content — sensitif untuk brand regulated",
    "Affiliate density tinggi — bisa reduce authenticity perception",
  ],
  explanationOpportunity: [
    "Finance & Fintech",
    "Productivity Tools",
    "Creator Economy / SaaS",
  ],
  explanationFull:
    "Sinyal terkuat @ininabnab bukan engagement rate-nya, tapi rasio heart-per-follower yang " +
    "sangat tinggi (18,5 vs median 8–12 untuk micro creator Indonesia). Ini mengindikasikan " +
    "audiens yang telah membangun relasi dengan creator selama waktu yang panjang — bukan " +
    "audiens yang tiba-tiba datang dari satu video viral.\n\n" +
    "Tiga video pinned dengan total >14 juta views membuktikan potensi organic reach yang nyata. " +
    "Yang perlu dipertimbangkan: konten Nabnab berfokus pada income-claim dan affiliate marketing. " +
    "Ini strategi konten yang valid dan populer di niche-nya, tapi bisa menciptakan dissonance " +
    "dengan brand di kategori regulated atau yang ingin citra premium non-transaksional.",
}

// ── Config ──────────────────────────────────────────────────────────────────

const BAND_CFG: Record<Band, {
  label: string; solid: string; light: string; text: string
  border: string; gradFrom: string; gradTo: string
}> = {
  A: { label: "Kredibilitas Tinggi", solid: "bg-emerald-600", light: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", gradFrom: "#10b981", gradTo: "#059669" },
  B: { label: "Kredibilitas Baik",   solid: "bg-violet-600",  light: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200",  gradFrom: "#8b5cf6", gradTo: "#6d28d9" },
  C: { label: "Perlu Perhatian",     solid: "bg-amber-500",   light: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   gradFrom: "#f59e0b", gradTo: "#d97706" },
  D: { label: "Risiko Tinggi",       solid: "bg-red-600",     light: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     gradFrom: "#ef4444", gradTo: "#dc2626" },
}

const REC_CFG: Record<RecommendationType, {
  label: string; sub: string; solid: string; light: string; text: string; border: string; icon: React.ReactNode
}> = {
  RECOMMENDED: {
    label: "Direkomendasikan",
    sub:   "Layak untuk kolaborasi",
    solid: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",
    icon:  <CheckCircle size={20} className="text-emerald-600" />,
  },
  CONSIDER: {
    label: "Pertimbangkan",
    sub:   "Ada hal yang perlu dikonfirmasi",
    solid: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200",
    icon:  <AlertTriangle size={20} className="text-amber-500" />,
  },
  REVIEW: {
    label: "Tinjau Manual",
    sub:   "Memerlukan review lebih dalam",
    solid: "bg-red-600", light: "bg-red-50", text: "text-red-700", border: "border-red-200",
    icon:  <XCircle size={20} className="text-red-600" />,
  },
}

const TIER_BADGE: Record<EvidenceTier, { label: string; cls: string }> = {
  public:     { label: "Public",      cls: "bg-blue-50 text-blue-600 border border-blue-100"        },
  signal:     { label: "Statistik",   cls: "bg-amber-50 text-amber-600 border border-amber-100"     },
  firstparty: { label: "First-party", cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
}

const LIKELIHOOD_TOOLTIP: Record<SponsoredLikelihood, string> = {
  very_likely: "Likely Sponsored (≥75%) — sinyal eksplisit: #ad, #iklan, kode promo, atau CTA beli.",
  likely:      "Possible Sponsored (50–74%) — sinyal ada tapi ambigu.",
  organic:     "Organic (≥70% bukan sponsored) — tidak ada sinyal komersial.",
  unknown:     "Unknown (<50%) — data terlalu sedikit untuk menyimpulkan.",
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={
            value === 0               ? "text-zinc-200 fill-zinc-200"
            : i <= Math.floor(value)  ? "text-amber-400 fill-amber-400"
            : i - 0.5 === value       ? "text-amber-400 fill-amber-200"
            :                           "text-zinc-200 fill-zinc-200"
          }
        />
      ))}
    </div>
  )
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-2 text-[10px] leading-snug text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 text-center">
        {text}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
      </div>
    </div>
  )
}

function StrengthBadge({ strength }: { strength: Signal["strength"] }) {
  const cfg = {
    strong:   { label: "Strong",   cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    moderate: { label: "Moderate", cls: "bg-amber-50 text-amber-600 border-amber-200"       },
    weak:     { label: "Weak",     cls: "bg-red-50 text-red-500 border-red-200"             },
  }[strength]
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params
  return {
    title: `Creator Intelligence @${username} — CariKOL`,
    description: `Creator Intelligence Report untuk @${username}.`,
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function CekResultPage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const s            = MOCK
  const cfg          = BAND_CFG[s.band]
  const rec          = REC_CFG[s.recommendation]
  const brandMax     = Math.max(...s.brandMentions.map(b => b.count))

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur">
        <CariKOLLogo size="sm" />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">
            <Share2 size={12} />Bagikan
          </button>
          <button className={`flex items-center gap-1.5 rounded-lg ${cfg.solid} px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition`}>
            <Download size={12} />Download Laporan
          </button>
          <Link href="/cek" className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">
            <ArrowLeft size={12} />Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">

        {/* ── 1. AI Decision Card ──────────────────────────────────────────── */}
        <div className={`rounded-2xl border ${rec.border} ${rec.light} p-6`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">

            {/* Left: verdict */}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                {rec.icon}
                <span className={`text-2xl font-black ${rec.text}`}>{rec.label}</span>
                <span className={`rounded-full ${cfg.solid} px-2 py-0.5 text-[10px] font-bold text-white`}>
                  Band {s.band}
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <Stars value={4} size={15} />
                <span className="text-sm font-semibold text-zinc-600">
                  Trust Score {s.score}/100
                </span>
                <span className="text-xs text-zinc-400">
                  (CI {s.confidenceLow}–{s.confidenceHigh})
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">{s.recommendationNote}</p>

              {/* Suitable / Not suitable */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Cocok untuk
                  </p>
                  <div className="space-y-1">
                    {s.suitableFor.map((f) => (
                      <div key={f.label} className="flex items-center gap-1.5">
                        <CheckCircle size={11} className="shrink-0 text-emerald-500" />
                        <span className="text-xs text-zinc-700">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Pertimbangkan kembali
                  </p>
                  <div className="space-y-1">
                    {s.notRecommendedFor.map((f) => (
                      <Tooltip key={f.label} text={f.reason}>
                        <div className="flex cursor-help items-center gap-1.5">
                          <AlertTriangle size={11} className="shrink-0 text-amber-400" />
                          <span className="text-xs text-zinc-700 underline decoration-dotted">
                            {f.label}
                          </span>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: evidence summary */}
            <div className="shrink-0 lg:w-56">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Dasar Keputusan
              </p>
              <div className="space-y-2">
                {[
                  { label: "Confidence",        value: `${s.confidenceLow}–${s.confidenceHigh}%`,    icon: <BarChart2 size={11} /> },
                  { label: "Evidence",          value: "Public + Statistik",    icon: <Shield size={11} />      },
                  { label: "Verified Campaign", value: "Belum tersedia",         icon: <BadgeCheck size={11} /> },
                  { label: "Dianalisis",        value: s.dataWindow,             icon: <Play size={11} />        },
                  { label: "Dihasilkan",        value: s.generatedAt,            icon: <Clock size={11} />       },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 text-zinc-400">{icon}</div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
                      <p className="text-xs font-semibold text-zinc-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Creator Snapshot ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {s.avatarUrl ? (
                <img src={s.avatarUrl} alt={s.displayName}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-100" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-2xl font-black text-white">
                  {decodeURIComponent(username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[7px] font-black text-white ring-2 ring-white">
                TT
              </div>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-base font-black text-zinc-900">@{decodeURIComponent(username)}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">{s.tier}</span>
                <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500">{s.niche}</span>
              </div>
              <p className="text-sm font-medium text-zinc-600">{s.displayName}</p>
              <p className="mt-0.5 text-xs italic text-zinc-400">&ldquo;{s.bio}&rdquo;</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle size={9} />Real Person Verified
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Shield size={9} />Brand Safe
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  Bergabung {s.joinedYear}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="hidden lg:grid grid-cols-3 gap-x-8 gap-y-2 border-l border-zinc-100 pl-6">
              {[
                { v: fmt(s.followerCount),       l: "Followers"    },
                { v: fmt(s.followingCount),       l: "Following"    },
                { v: fmt(s.totalLikes),           l: "Total Likes"  },
                { v: fmt(s.avgViews),             l: "Avg Views"    },
                { v: `${s.postingFreqPerWeek}×`,  l: "Video/minggu" },
                { v: s.videoCount.toString(),     l: "Total Video"  },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-sm font-bold text-zinc-900">{v}</p>
                  <p className="text-[10px] text-zinc-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Evidence Summary ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[
            {
              tier:   "public" as EvidenceTier,
              title:  "Public Evidence",
              conf:   "HIGH",
              confCls:"text-emerald-600",
              items:  ["Real person, wajah konsisten", "Konten brand safe", "Posting aktif sejak 2021", "160 video teranalisis"],
              note:   "Fakta terobservasi langsung dari profil & caption publik.",
              icon:   <Eye size={14} className="text-blue-500" />,
              border: "border-blue-100",
              bg:     "bg-blue-50/50",
            },
            {
              tier:   "signal" as EvidenceTier,
              title:  "Statistical Signals",
              conf:   "MEDIUM",
              confCls:"text-amber-600",
              items:  ["Heart-per-follower: 18,5×", "ER 4,8% vs median 3,1%", "Viral track record", "Growth konsisten 90 hari"],
              note:   "Inferensi dari pola data — bukan konfirmasi fakta.",
              icon:   <TrendingUp size={14} className="text-amber-500" />,
              border: "border-amber-100",
              bg:     "bg-amber-50/50",
            },
            {
              tier:   "firstparty" as EvidenceTier,
              title:  "First-party Data",
              conf:   "—",
              confCls:"text-zinc-400",
              items:  ["Belum ada campaign CariKOL", "Response time: belum diketahui", "Deliverable quality: —", "Outcome record: —"],
              note:   "Data ini hanya tersedia setelah creator bekerja melalui CariKOL.",
              icon:   <BadgeCheck size={14} className="text-zinc-300" />,
              border: "border-zinc-200",
              bg:     "bg-zinc-50",
            },
          ].map((tier) => (
            <div key={tier.title} className={`rounded-2xl border ${tier.border} ${tier.bg} p-4`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {tier.icon}
                  <span className="text-xs font-bold text-zinc-700">{tier.title}</span>
                </div>
                <span className={`text-[10px] font-black ${tier.confCls}`}>
                  {tier.conf !== "—" ? `Confidence ${tier.conf}` : "Unavailable"}
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                {tier.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className={`mt-0.5 shrink-0 text-[10px] ${tier.conf === "—" ? "text-zinc-300" : "text-zinc-400"}`}>
                      {tier.conf === "—" ? "–" : "·"}
                    </span>
                    <span className={`text-[11px] leading-snug ${tier.conf === "—" ? "text-zinc-400" : "text-zinc-600"}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] leading-snug text-zinc-400 italic border-t border-zinc-200/60 pt-2">
                {tier.note}
              </p>
            </div>
          ))}
        </div>

        {/* ── 4. AI Insights ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center gap-2 px-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600">
              <Lightbulb size={11} className="text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-800">AI Menemukan {s.insights.length} Insight</span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700">Beta</span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {s.insights.map((ins, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200/60 bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-2xl font-black text-zinc-100 leading-none">0{i + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${ins.tagColor}`}>{ins.tag}</span>
                    <span className="text-[10px] font-bold text-zinc-400">{ins.confidence}%</span>
                  </div>
                </div>
                <p className="mb-1.5 text-sm font-bold text-zinc-800">{ins.title}</p>
                <p className="text-[11px] leading-relaxed text-zinc-500">{ins.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Risk & Considerations ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle size={13} className="text-zinc-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Risk &amp; Considerations
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {s.risks.map((risk) => {
              const sev = {
                high:   { icon: <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />,   cls: "border-red-100 bg-red-50/50"    },
                medium: { icon: <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />, cls: "border-amber-100 bg-amber-50/40" },
                low:    { icon: <Info size={13} className="text-zinc-400 shrink-0 mt-0.5" />,      cls: "border-zinc-200 bg-zinc-50"     },
              }[risk.severity]
              return (
                <div key={risk.label} className={`flex items-start gap-2.5 rounded-xl border ${sev.cls} px-3 py-2.5`}>
                  {sev.icon}
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">{risk.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{risk.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 6. Commercial Footprint ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={12} className="text-zinc-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Commercial Footprint
              </p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
              Inferensi dari caption publik
            </span>
          </div>
          <p className="mb-5 text-[11px] text-zinc-400">
            ~{s.sponsoredEstPct}% konten mengandung sinyal komersial — bukan konfirmasi kerja sama.
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Brand DNA */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Brand DNA</p>
              <div className="space-y-2.5">
                {s.brandCategories.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-[11px] font-medium text-zinc-700">{cat.label}</span>
                    <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
                        style={{ width: `${cat.pct}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-bold text-zinc-500">{cat.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-violet-50 px-3 py-2.5">
                <p className="text-[10px] font-bold text-violet-600 mb-0.5">Ringkasan</p>
                <p className="text-[11px] leading-relaxed text-violet-700">{s.commercialSummary}</p>
              </div>
            </div>

            {/* Top brands */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Top Brand Mentioned</p>
              <div className="space-y-2.5">
                {s.brandMentions.map((b) => {
                  const likelyColor =
                    b.likelihood === "very_likely" ? "bg-amber-100 text-amber-700 border-amber-200"
                    : b.likelihood === "likely"    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : b.likelihood === "organic"   ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    :                                "bg-zinc-100 text-zinc-500 border-zinc-200"
                  const likelyLabel =
                    b.likelihood === "very_likely" ? "Likely Sponsored"
                    : b.likelihood === "likely"    ? "Possible Sponsored"
                    : b.likelihood === "organic"   ? "Organic"
                    :                               "Unknown"
                  return (
                    <div key={b.brand} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                        <Building2 size={11} className="text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-800">{b.brand}</span>
                          <span className="text-[9px] text-zinc-400">{b.category}</span>
                        </div>
                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-violet-300"
                            style={{ width: `${(b.count / brandMax) * 100}%` }} />
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-zinc-500">{b.count}×</span>
                      <Tooltip text={LIKELIHOOD_TOOLTIP[b.likelihood]}>
                        <span className={`cursor-help rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${likelyColor}`}>
                          {likelyLabel}
                        </span>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. Content Performance ───────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Play size={12} className="text-zinc-400" fill="currentColor" />
              <span className="text-sm font-bold text-zinc-800">Content Performance</span>
            </div>
            <span className="text-[10px] text-zinc-400">6 video terakhir + pinned</span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]">
            {/* Carousel */}
            <div className="overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
              <div className="flex gap-2.5" style={{ width: "max-content" }}>
                {s.videos.map((v) => {
                  const sponsoredBadge =
                    v.sponsored === "very_likely" ? "Likely Sponsored"
                    : v.sponsored === "likely"    ? "Possible Sponsored"
                    : null
                  return (
                    <div key={v.rank} className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200/60 bg-white"
                      style={{ scrollSnapAlign: "start" }}>
                      <div className={`relative bg-gradient-to-br ${v.gradient[0]} ${v.gradient[1]}`}
                        style={{ aspectRatio: "9/16" }}>
                        <div className="absolute inset-0 bg-black/15" />
                        <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20 select-none">
                          {v.emoji}
                        </div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                          <Play size={12} fill="white" className="translate-x-0.5 text-white" />
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1 py-0.5 text-[8px] font-bold text-white">
                          {v.duration}
                        </div>
                        {v.pinned && (
                          <div className="absolute left-1.5 top-1.5 rounded bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                            Pinned
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-6 pt-4">
                          <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-white">
                            {v.title}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-0.5 px-2 py-2">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Eye size={8} /><span className="text-[9px] font-semibold">{fmt(v.views)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Heart size={8} /><span className="text-[9px] font-semibold">{fmt(v.likes)}</span>
                        </div>
                        <p className="text-[9px] font-bold text-violet-600">{v.engRate}% ER</p>
                        {sponsoredBadge && (
                          <p className="text-[8px] font-semibold text-amber-500">{sponsoredBadge}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Content Tags */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Zap size={11} className="text-violet-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  AI Menemukan
                </p>
              </div>
              <div className="space-y-2">
                {s.contentTags.map((tag) => (
                  <div key={tag.label} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-violet-400" style={{ width: `${tag.pct}%` }} />
                    </div>
                    <span className="w-20 text-[10px] font-medium text-zinc-600 text-right">{tag.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[9px] leading-snug text-zinc-400">
                Dideteksi AI dari caption dan pola konten. Bukan klasifikasi manual.
              </p>
            </div>
          </div>
        </div>

        {/* ── 8. Technical Evidence (collapsible) ──────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden">
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 hover:bg-zinc-50 transition">
              <div className="flex items-center gap-2">
                <BarChart2 size={13} className="text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Technical Evidence
                </p>
                <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[9px] text-zinc-400">
                  {s.signals.length} sinyal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400">Untuk pengguna yang ingin melihat detail</span>
                <ChevronDown size={14} className="text-zinc-400 transition-transform" />
              </div>
            </summary>

            <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
              <div className="mb-3 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 w-fit">
                <Info size={10} className="text-amber-500" />
                <span className="text-[9px] font-bold text-amber-600">
                  Sinyal-sinyal ini adalah inferensi statistik, bukan fakta terobservasi
                </span>
              </div>

              {/* Group by strength */}
              {(["strong", "moderate", "weak"] as const)
                .map((strength) => {
                  const group = s.signals.filter(sig => sig.strength === strength)
                  if (!group.length) return null
                  return (
                    <div key={strength} className="mb-4">
                      <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <StrengthBadge strength={strength} />
                      </p>
                      <div className="space-y-3">
                        {group.map((sig) => (
                          <details key={sig.id} className="group/sig">
                            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-50 transition">
                              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${sig.iconColor}`}>
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-zinc-800">{sig.label}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${TIER_BADGE[sig.tier].cls}`}>
                                  {TIER_BADGE[sig.tier].label}
                                </span>
                                <ChevronDown size={11} className="shrink-0 text-zinc-300" />
                              </div>
                            </summary>
                            <p className="mt-1 px-10 text-[11px] leading-relaxed text-zinc-500 pb-2">
                              {sig.detail}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </details>
        </div>

        {/* ── 9. Verified Campaign Record ──────────────────────────────────── */}
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
            <BadgeCheck size={18} className="text-zinc-300" />
          </div>
          <p className="font-bold text-zinc-600">Verified Campaign Record — Belum Tersedia</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
            Ketika creator bekerja melalui CariKOL, profil ini diperkaya dengan data
            first-party yang tidak bisa dimanipulasi: response time, deliverable quality, dan outcome nyata.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["Response Time", "Deliverable Quality", "Repeat Client Rate", "Brand Satisfaction", "Issue History"].map((m) => (
              <span key={m} className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                <Clock size={9} />{m}
              </span>
            ))}
          </div>
        </div>

        {/* ── 10. AI Reasoning + Dispute ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* AI Reasoning (collapsed by default) */}
          <div className="rounded-2xl border border-violet-200/60 bg-violet-50/50 overflow-hidden">
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                  <span className="text-[9px] font-black text-white">AI</span>
                </div>
                <p className="text-sm font-bold text-violet-900">AI Summary</p>
                <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[8px] font-bold text-violet-700">Beta</span>
              </div>

              {/* Strengths */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Strength</p>
                {s.explanationStrengths.map((str, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1">
                    <CheckCircle size={10} className="shrink-0 text-emerald-500" />
                    <p className="text-xs text-zinc-700">{str}</p>
                  </div>
                ))}
              </div>

              {/* Risks */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">Risk</p>
                {s.explanationRisks.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={10} className="shrink-0 text-amber-400" />
                    <p className="text-xs text-zinc-700">{r}</p>
                  </div>
                ))}
              </div>

              {/* Opportunity */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">Opportunity</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.explanationOpportunity.map((op) => (
                    <span key={op} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full reasoning toggle */}
              <details>
                <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition list-none mt-2">
                  <ChevronDown size={12} />
                  Expand full reasoning
                </summary>
                <div className="mt-3 space-y-2 border-t border-violet-200/60 pt-3">
                  {s.explanationFull.split("\n\n").map((para, i) => (
                    <p key={i} className="text-xs leading-relaxed text-zinc-700">{para}</p>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Dispute + Privacy */}
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-2xl border border-zinc-200/60 bg-white p-5">
              <div className="mb-2 flex items-center gap-2">
                <Flag size={13} className="text-zinc-400" />
                <p className="text-sm font-semibold text-zinc-800">Keberatan atau Minta Tinjauan?</p>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-zinc-400">
                Creator dapat mengajukan tinjauan manual. Tim CariKOL merespons dalam
                7 hari kerja dengan penjelasan tertulis atas setiap sinyal yang dipertanyakan.
              </p>
              <button className={`w-full rounded-xl ${cfg.solid} py-2.5 text-xs font-bold text-white hover:opacity-90 transition`}>
                Ajukan Tinjauan
              </button>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white px-4 py-3">
              <div className="flex items-start gap-2">
                <Shield size={12} className="mt-0.5 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-[11px] font-semibold text-zinc-700">Kebijakan fairness &amp; privacy</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-400">
                    CariKOL tidak pernah menyimpan data pribadi audiens.
                    Seluruh penilaian berbasis data publik &amp; agregat sesuai UU PDP No. 27/2022.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="pb-4 text-center text-[10px] leading-relaxed text-zinc-400">
          Penilaian ini berdasarkan sinyal publik dan tidak merupakan tuduhan terhadap creator.
          Hanya untuk keperluan evaluasi kerja sama.
        </p>

      </main>
    </div>
  )
}
