import type { Metadata } from "next"
import { FileText, Info } from "lucide-react"
import { CARD, DeckShell, Eyebrow, PersonaBadge, PERSONA_THEME } from "../_components/DeckUI"
import { PERSONAS, SURVEY_PERIOD, TOP_PROBLEMS, TOTAL, pct } from "../_lib/survey"

export const metadata: Metadata = {
  title: "Market Validation — CariKOL.id",
  description:
    "137 creator, brand, dan agency mengalami masalah yang sama. Hasil survei waitlist CariKOL.id, Agustus 2026.",
  robots: { index: false, follow: false },
}

const QUOTE = {
  text:   "Aku harus kirim portfolio, rate card, dan statistik yang sama berkali-kali ke brand yang berbeda.",
  author: "Responden Creator",
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MarketValidationPage() {
  return (
    <DeckShell>
        {/* ── Row 1: headline + stats │ quote + overall ──────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_476px] xl:gap-8">

          <section className="flex flex-col">
            <Eyebrow code="A2">Market Validation</Eyebrow>

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
    </DeckShell>
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
          <PersonaBadge persona={key} />
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
          const theme = PERSONA_THEME[key]
          return (
            <article key={key} className="rounded-2xl border border-[#EEEAF6] bg-white px-3 py-3">
              <header className="flex items-center gap-3.5">
                <PersonaBadge persona={key} size="md" />
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
            <PersonaBadge persona={key} />
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

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 36" fill="currentColor" aria-hidden className={className}>
      <path d="M0 22.5C0 10.6 6.4 3 17.4 0l1.9 4.3C13.6 6.6 10.6 10.6 10.2 15H18v21H0zM24.7 22.5C24.7 10.6 31.1 3 42.1 0L44 4.3c-5.7 2.3-8.7 6.3-9.1 10.7h7.8v21h-18z" />
    </svg>
  )
}
