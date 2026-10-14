import type { Metadata } from "next"
import type { ReactNode } from "react"
import { FileText, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Market Validation — CariKOL.id",
  description:
    "137 creator, brand, dan agency mengalami masalah yang sama. Hasil survei waitlist CariKOL.id, Agustus 2026.",
  robots: { index: false, follow: false },
}

// ─── Data survei ─────────────────────────────────────────────────────────────
// Sumber: survei waitlist di landing page (Agustus 2026). Cukup ubah angka di
// sini — persentase dan panjang bar dihitung otomatis dari `count / n`.

const SURVEY_PERIOD = "Agustus 2026"

type PersonaKey = "creator" | "brand" | "agency"
type Problem    = { label: string; count: number }

const PERSONAS: {
  key:      PersonaKey
  label:    string
  n:        number
  problems: Problem[]
  meaning:  string
}[] = [
  {
    key:   "creator",
    label: "Creator",
    n:     99,
    problems: [
      { label: "Kirim portfolio berulang kali",     count: 35 },
      { label: "Update informasi di banyak tempat", count: 23 },
      { label: "Kirim rate card berulang kali",     count: 11 },
    ],
    meaning: "Menghabiskan waktu untuk mengirim ulang portfolio dan memperbarui informasi di banyak platform.",
  },
  {
    key:   "brand",
    label: "Brand / UMKM",
    n:     12,
    problems: [
      { label: "Proses screening manual",            count: 4 },
      { label: "Khawatir dengan engagement palsu",   count: 4 },
      { label: "Sulit menemukan creator yang sesuai", count: 2 },
    ],
    meaning: "Membutuhkan data yang lebih jelas dan sinyal kepercayaan saat mencari creator.",
  },
  {
    key:   "agency",
    label: "Agency",
    n:     26,
    problems: [
      { label: "Sulit membandingkan creator",       count: 11 },
      { label: "Rate tidak jelas",                  count: 5 },
      { label: "Data dan performa tidak konsisten", count: 4 },
    ],
    meaning: "Kesulitan membandingkan creator dan mengelola data campaign secara efisien.",
  },
]

const TOTAL = PERSONAS.reduce((sum, p) => sum + p.n, 0)

const TOP_PROBLEMS: Problem[] = [
  { label: "Kirim portfolio berulang kali",          count: 35 },
  { label: "Update informasi di banyak tempat",      count: 23 },
  { label: "Kirim rate card berulang kali",          count: 15 },
  { label: "Menjelaskan performa akun berulang kali", count: 12 },
  { label: "Sulit membandingkan creator",            count: 12 },
]

const QUOTE = {
  text:   "Aku harus kirim portfolio, rate card, dan statistik yang sama berkali-kali ke brand yang berbeda.",
  author: "Responden Creator",
}

// ─── Tema per persona ────────────────────────────────────────────────────────

const THEME: Record<PersonaKey, { icon: ReactNode; chip: string; bar: string; track: string; num: string }> = {
  creator: {
    icon:  <PersonIcon />,
    chip:  "bg-[#F1ECFE] text-[#7C3AED]",
    bar:   "bg-gradient-to-r from-[#6D28D9] to-[#A855F7]",
    track: "bg-[#EEE9FB]",
    num:   "bg-[#F4F1FB] text-[#7C3AED]",
  },
  brand: {
    icon:  <BuildingIcon />,
    chip:  "bg-[#FDECF4] text-[#EC4899]",
    bar:   "bg-gradient-to-r from-[#DB2777] to-[#F472B6]",
    track: "bg-[#FCE7F1]",
    num:   "bg-[#FDF0F6] text-[#DB2777]",
  },
  agency: {
    icon:  <GroupIcon />,
    chip:  "bg-[#F1ECFE] text-[#7C3AED]",
    bar:   "bg-gradient-to-r from-[#6D28D9] to-[#A855F7]",
    track: "bg-[#EEE9FB]",
    num:   "bg-[#F4F1FB] text-[#7C3AED]",
  },
}

const pctFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function pct(count: number, n: number): string {
  return `${pctFormat.format((count / n) * 100)}%`
}

const CARD = "rounded-[22px] border border-white/70 bg-white/90 shadow-[0_10px_40px_-12px_rgba(76,29,149,0.14)] backdrop-blur-sm"

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MarketValidationPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#FBFAFF] text-[#14112B]">
      {/* Soft background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full bg-[#FBCFE8]/55 blur-[120px]" />
        <div className="absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#EDE9FE]/70 blur-[120px]" />
        <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-[#FCE7F3]/60 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex max-w-[1456px] flex-col gap-5 xl:gap-4 px-4 py-8 sm:px-8 sm:py-10 xl:px-[46px] xl:pb-5 xl:pt-8">

        {/* ── Row 1: headline + stats │ quote + overall ──────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_476px] xl:gap-8">

          <section className="flex flex-col">
            <p className="text-[13px] font-bold uppercase leading-none tracking-[0.2em] text-[#7C3AED]">
              A2 <span className="mx-1.5">•</span> Market Validation
            </p>

            <h1 className="mt-4 text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[48px] xl:text-[54px]">
              {TOTAL} creator, brand, dan agency mengalami{" "}
              <span className="bg-gradient-to-r from-[#6D28D9] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                masalah yang sama.
              </span>
            </h1>

            <p className="mt-2.5 max-w-[820px] text-[16px] leading-[1.5] text-[#6B6880] sm:text-[17px]">
              Dari hasil survei di landing page CariKOL.id ({SURVEY_PERIOD}), responden dari berbagai peran di
              industri creator economy mengonfirmasi bahwa proses pengelolaan data talent dan campaign masih
              repetitif, manual, dan tidak efisien.
            </p>

            <RespondentStats />
          </section>

          <aside className="flex flex-col gap-5">
            <QuoteCard />
            <TopProblemsCard />
          </aside>
        </div>

        {/* ── Row 2: per-persona breakdown │ implications ────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="flex flex-col gap-2.5">
            <PerPersonaCard />
            <SourceNote />
          </div>
          <ImplicationsCard />
        </div>
      </main>
    </div>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function RespondentStats() {
  return (
    <div className={`${CARD} mt-5 grid grid-cols-3 gap-y-6 px-5 py-5 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-3.5`}>
      {/* Total */}
      <div className="col-span-3 flex items-center justify-center gap-5 lg:col-span-1 lg:border-r lg:border-[#EEEAF6] lg:pr-6">
        <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full bg-[#F1ECFE] text-[#7C3AED]">
          <FileText size={28} strokeWidth={1.8} />
        </div>
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-br from-[#6D28D9] to-[#C026D3] bg-clip-text text-[58px] font-extrabold leading-[0.95] tracking-[-0.04em] text-transparent">
            {TOTAL}
          </span>
          <span className="mt-0.5 whitespace-nowrap text-[19px] font-medium text-[#14112B]">Total responden</span>
          <span className="mt-1.5 rounded-lg bg-[#F1ECFE] px-3.5 py-0.5 text-center text-[12.5px] leading-snug text-[#7C3AED]">
            {SURVEY_PERIOD}
            <br />({TOTAL} email unik)
          </span>
        </div>
      </div>

      {/* Per persona */}
      {PERSONAS.map(({ key, label, n }, i) => (
        <div
          key={key}
          className={`flex flex-col items-center text-center ${i < PERSONAS.length - 1 ? "border-r border-[#EEEAF6]" : ""}`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${THEME[key].chip}`}>
            <span className="h-5 w-5">{THEME[key].icon}</span>
          </span>
          <span className="mt-2.5 text-[32px] font-extrabold leading-none tracking-[-0.02em]">{n}</span>
          <span className="mt-1.5 text-[15px] leading-snug text-[#3B3852] sm:text-[17px]">{label}</span>
          <span className="text-[15px] leading-snug text-[#6B6880] sm:text-[17px]">({pct(n, TOTAL)})</span>
        </div>
      ))}
    </div>
  )
}

function QuoteCard() {
  return (
    <figure className={`${CARD} flex gap-5 bg-gradient-to-br from-white/90 to-[#FBF5FF]/90 px-6 py-5`}>
      <QuoteMark className="mt-1 h-9 w-11 shrink-0 text-[#7C3AED]" />
      <div>
        <blockquote className="text-[17px] italic leading-[1.5] text-[#14112B]">
          &ldquo;{QUOTE.text}&rdquo;
        </blockquote>
        <figcaption className="mt-2 text-[14px] text-[#6B6880]">— {QUOTE.author}</figcaption>
      </div>
    </figure>
  )
}

function TopProblemsCard() {
  return (
    <section className={`${CARD} flex-1 px-6 py-4`}>
      <h2 className="text-[18px] font-bold tracking-[-0.01em]">Masalah Utama (Semua Responden)</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {TOP_PROBLEMS.map(({ label, count }) => (
          <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_104px_76px]">
            <span className="text-[13px] leading-snug text-[#3B3852]">{label}</span>
            <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              <Bar value={count / TOTAL} fill="bg-gradient-to-r from-[#7C3AED] to-[#A855F7]" track="bg-[#EEE9FB]" />
            </div>
            <span className="col-start-2 row-start-1 whitespace-nowrap text-[13px] sm:col-start-3">
              <strong className="font-bold">{count}</strong>{" "}
              <span className="text-[12px] text-[#6B6880]">({pct(count, TOTAL)})</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PerPersonaCard() {
  return (
    <section className={`${CARD} px-4 py-3.5 sm:px-5 xl:px-4`}>
      <h2 className="text-[18px] font-bold tracking-[-0.01em]">Masalah Utama per Tipe Responden</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3 xl:gap-2.5">
        {PERSONAS.map(({ key, label, n, problems }) => {
          const theme = THEME[key]
          return (
            <article key={key} className="rounded-2xl border border-[#EEEAF6] bg-white px-3 py-3">
              <header className="flex items-center gap-3.5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.chip}`}>
                  <span className="h-5 w-5">{theme.icon}</span>
                </span>
                <div>
                  <h3 className="text-[17px] font-bold leading-tight tracking-[-0.01em]">{label}</h3>
                  <p className="text-[13px] text-[#6B6880]">n = {n}</p>
                </div>
              </header>

              <ol className="mt-2.5 flex flex-col gap-2">
                {problems.map(({ label: problem, count }, i) => (
                  <li key={problem}>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${theme.num}`}>
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-[12px] leading-snug tracking-[-0.005em] text-[#3B3852]">{problem}</span>
                      <span className="whitespace-nowrap text-[12px]">
                        <strong className="font-bold">{count}</strong>{" "}
                        <span className="text-[10.5px] text-[#6B6880]">({pct(count, n)})</span>
                      </span>
                    </div>
                    <div className="mt-1 pl-[26px]">
                      <Bar value={count / n} fill={theme.bar} track={theme.track} />
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SourceNote() {
  return (
    <p className="flex items-start gap-3 rounded-xl bg-white/60 px-4 py-1.5 text-[12.5px] leading-relaxed text-[#3B3852] sm:items-center">
      <Info size={20} strokeWidth={1.8} className="shrink-0 text-[#7C3AED]" />
      <span>
        <strong className="font-bold">Sumber:</strong> Hasil survei waitlist CariKOL.id, {SURVEY_PERIOD} ({TOTAL} email
        unik).{" "}
        <span className="text-[#7C3AED]">
          Persentase dihitung dari total responden (n = {TOTAL}) dan dari n tiap tipe responden.
        </span>
      </span>
    </p>
  )
}

function ImplicationsCard() {
  return (
    <section className={`${CARD} px-4 pb-3 pt-3.5 sm:px-5`}>
      <h2 className="text-[18px] font-bold tracking-[-0.01em]">Apa Artinya?</h2>
      <ul className="mt-1 divide-y divide-[#EEEAF6]">
        {PERSONAS.map(({ key, label, meaning }) => (
          <li key={key} className="flex gap-3 py-2 last:pb-0">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${THEME[key].chip}`}>
              <span className="h-5 w-5">{THEME[key].icon}</span>
            </span>
            <div>
              <h3 className="text-[15px] font-bold leading-tight">{label}</h3>
              <p className="mt-0.5 text-[13px] leading-[1.4] text-[#3B3852]">{meaning}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function Bar({ value, fill, track }: { value: number; fill: string; track: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(value, 1) * 100}%` }} />
    </div>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 19.2c0-3.1 3.6-5.2 8-5.2s8 2.1 8 5.2V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <path
        fillRule="evenodd"
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V9h3.5A1.5 1.5 0 0 1 20 10.5V21H4zM7 6h2v2H7zm4 0h2v2h-2zM7 10h2v2H7zm4 0h2v2h-2zm4 2h2v2h-2zM7 14h2v2H7zm4 0h2v2h-2zm4 2h2v2h-2zm-5 2v3h-1.5v-3z"
      />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
      <circle cx="9" cy="8" r="3.4" />
      <circle cx="16.8" cy="9" r="2.6" />
      <path d="M2.5 18.4c0-2.7 2.9-4.6 6.5-4.6s6.5 1.9 6.5 4.6V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />
      <path d="M16.6 13.3c2.8.1 4.9 1.7 4.9 3.9V20a1 1 0 0 1-1 1h-3.3v-2.6c0-2-.6-3.7-1.9-5z" />
    </svg>
  )
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 36" fill="currentColor" aria-hidden className={className}>
      <path d="M0 22.5C0 10.6 6.4 3 17.4 0l1.9 4.3C13.6 6.6 10.6 10.6 10.2 15H18v21H0zM24.7 22.5C24.7 10.6 31.1 3 42.1 0L44 4.3c-5.7 2.3-8.7 6.3-9.1 10.7h7.8v21h-18z" />
    </svg>
  )
}
