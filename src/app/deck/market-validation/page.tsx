import type { Metadata } from "next"
import type { ReactNode } from "react"
import { FileText } from "lucide-react"
import { Accent, CARD, NumberDot, PersonaBadge, Slide } from "../_components/DeckUI"
import { PERSONAS, SURVEY_PERIOD, TOP_PROBLEMS, TOTAL, pct, type Problem } from "../_lib/survey"

export const metadata: Metadata = {
  title: "A2 · Market Validation — CariKOL.id",
  description:
    "137 creator, brand, dan agency mengalami masalah yang sama. Hasil survei waitlist CariKOL.id, Agustus 2026.",
  robots: { index: false, follow: false },
}

const QUOTE = {
  text:   "Aku harus kirim portfolio, rate card, dan statistik yang sama berkali-kali ke brand yang berbeda.",
  author: "Responden Creator",
}

export default function MarketValidationPage() {
  return (
    <Slide
      code="A2"
      label="Market Validation"
      title={
        <>
          <Accent>{TOTAL} creator, brand, dan agency</Accent> <br className="hidden lg:block" />
          mengalami masalah yang sama.
        </>
      }
      subtitle={
        <>
          Dari hasil survei di landing page CariKOL.id ({SURVEY_PERIOD}), responden dari berbagai peran di industri
          creator economy mengonfirmasi bahwa proses pengelolaan data talent dan campaign masih repetitif, manual,
          dan tidak efisien.
        </>
      }
      page="A2"
    >
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_600px]">
        <RespondentStats />
        <QuoteCard />
      </div>

      <div className="mt-16 grid gap-16 sm:grid-cols-2 lg:flex-1 lg:grid-cols-4">
        <ProblemCard
          badge={<IconDot><FileText className="size-24" strokeWidth={2} /></IconDot>}
          title="Semua responden"
          n={TOTAL}
          problems={TOP_PROBLEMS}
        />
        {PERSONAS.map(({ key, label, n, problems, meaning }) => (
          <ProblemCard key={key} badge={<PersonaBadge persona={key} />} title={label} n={n} problems={problems}>
            <b>Artinya:</b> {meaning}
          </ProblemCard>
        ))}
      </div>

    </Slide>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function RespondentStats() {
  return (
    <section className={`${CARD} grid grid-cols-3 gap-y-24 px-24 py-18 lg:grid-cols-[1.5fr_1fr_1fr_1fr]`}>
      <div className="col-span-3 flex items-center justify-center gap-20 lg:col-span-1 lg:border-r lg:border-[#F0E4E9] lg:pr-20">
        <IconDot size={64}><FileText className="size-30" strokeWidth={2} /></IconDot>
        <div>
          <p className="fs-80 font-extrabold leading-[0.95] tracking-[-0.05em] text-[#EE1D62]">{TOTAL}</p>
          <p className="mt-4 whitespace-nowrap fs-24 font-semibold tracking-[-0.01em]">Total responden</p>
          <p className="mt-2 whitespace-nowrap fs-18 text-[#7B7B8C]">Survei waitlist {SURVEY_PERIOD}</p>
          <p className="whitespace-nowrap fs-18 text-[#7B7B8C]">{TOTAL} email unik</p>
        </div>
      </div>

      {PERSONAS.map(({ key, label, n }, i) => (
        <div
          key={key}
          className={`flex flex-col items-center text-center ${i < PERSONAS.length - 1 ? "border-r border-[#F0E4E9]" : ""}`}
        >
          <PersonaBadge persona={key} />
          <p className="mt-10 fs-48 font-extrabold leading-none tracking-[-0.04em]">{n}</p>
          <p className="mt-8 fs-22 leading-tight text-[#4A4A5E]">{label}</p>
          <p className="mt-2 fs-20 text-[#7B7B8C]">({pct(n, TOTAL)})</p>
        </div>
      ))}
    </section>
  )
}

function QuoteCard() {
  return (
    <figure className={`${CARD} flex gap-20 px-28 py-24`}>
      <svg viewBox="0 0 44 36" fill="currentColor" aria-hidden className="mt-6 h-34 w-42 shrink-0 text-[#EE1D62]">
        <path d="M0 22.5C0 10.6 6.4 3 17.4 0l1.9 4.3C13.6 6.6 10.6 10.6 10.2 15H18v21H0zM24.7 22.5C24.7 10.6 31.1 3 42.1 0L44 4.3c-5.7 2.3-8.7 6.3-9.1 10.7h7.8v21h-18z" />
      </svg>
      <div className="flex flex-col justify-center">
        <blockquote className="fs-25 font-medium italic leading-[1.4] tracking-[-0.01em]">&ldquo;{QUOTE.text}&rdquo;</blockquote>
        <figcaption className="mt-10 fs-19 text-[#7B7B8C]">— {QUOTE.author}</figcaption>
      </div>
    </figure>
  )
}

function ProblemCard({
  badge,
  title,
  n,
  problems,
  children,
}: {
  badge:     ReactNode
  title:     string
  n:         number
  problems:  Problem[]
  children?: ReactNode
}) {
  return (
    <section className={`${CARD} flex flex-col px-22 pb-18 pt-18`}>
      <header className="flex items-center gap-14">
        {badge}
        <div>
          <h2 className="fs-25 font-bold leading-tight tracking-[-0.02em]">{title}</h2>
          <p className="fs-17 text-[#7B7B8C]">n = {n}</p>
        </div>
      </header>

      <ol className="mt-16 flex flex-col gap-9">
        {problems.map(({ label, count }, i) => (
          <li key={label}>
            <div className="flex items-start gap-10">
              <NumberDot n={i + 1} size="sm" />
              <span className="pt-1 fs-18 leading-[1.3] tracking-[-0.01em] text-[#4A4A5E]">{label}</span>
            </div>
            <div className="mt-4 flex items-center gap-12 pl-36">
              <div className="h-9 flex-1 overflow-hidden rounded-full bg-[#FCEEF3]">
                <div className="h-full rounded-full bg-[#EE1D62]" style={{ width: `${Math.min(count / n, 1) * 100}%` }} />
              </div>
              <span className="w-92 whitespace-nowrap text-right fs-18">
                <b className="font-bold">{count}</b> <span className="fs-15 text-[#7B7B8C]">({pct(count, n)})</span>
              </span>
            </div>
          </li>
        ))}
      </ol>

      {children && (
        <p className="mt-16 border-t border-[#F0E4E9] pt-14 fs-17 leading-[1.4] text-[#4A4A5E] [&_b]:font-bold [&_b]:text-[#14123A]">
          {children}
        </p>
      )}
    </section>
  )
}

function IconDot({ children, size = 52 }: { children: ReactNode; size?: 52 | 64 }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#FDE8EF] text-[#EE1D62] ${
        size === 64 ? "size-64" : "size-52"
      }`}
    >
      {children}
    </span>
  )
}
