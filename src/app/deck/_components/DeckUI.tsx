import type { ReactNode } from "react"

// Shared visual system for the /deck slides, matching the pitch deck's
// appendix slides: white 1920×1080 canvas, pink (#EE1D62) + navy (#14123A),
// hairline-bordered cards (#F0E4E9) and pink-tinted number dots (#FDE8EF).
//
// From `lg` up the slide is a fixed 16:9 canvas scaled to fit the viewport:
// --spacing is one design pixel (1/1920 of the slide width), so `px-64`,
// `size-52` and `fs-24` are measured straight off the 1920px design. Below
// `lg` the same markup reflows as a normal page at 0.7 scale.

export const DECK_FOOTER = "CariKOL.id · DSC Season 17"

export const CARD = "rounded-[calc(var(--spacing)*14)] border border-[#F0E4E9] bg-white"

export function Slide({
  code,
  label,
  title,
  subtitle,
  page,
  children,
}: {
  code:     string
  label:    string
  title:    ReactNode
  subtitle: ReactNode
  page:     string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white text-[#14123A]">
      <div className="w-full lg:w-[min(100vw,calc(100svh*16/9))] lg:[container-type:inline-size]">
        <div className="flex flex-col px-24 pb-28 pt-40 [--spacing:0.7px] lg:aspect-video lg:overflow-hidden lg:px-64 lg:pb-20 lg:pt-49 lg:[--spacing:calc(100cqw/1920)]">
          <header>
            <p className="fs-18 font-bold uppercase leading-[1.2] tracking-[0.25em] text-[#EE1D62]">
              {code} · {label}
            </p>
            <h1 className="mt-16 fs-52 font-extrabold leading-[1.02] tracking-[-0.05em] lg:mt-11 lg:fs-68">{title}</h1>
            <p className="mt-10 fs-24 leading-[1.35] text-[#7B7B8C] lg:mt-9 lg:fs-26">{subtitle}</p>
          </header>

          <div className="mt-28 flex flex-1 flex-col lg:mt-29">{children}</div>

          <footer className="mt-28 flex items-baseline justify-between fs-18 font-medium text-[#7B7B8C] lg:mt-16">
            <span>{DECK_FOOTER}</span>
            <span>{page}</span>
          </footer>
        </div>
      </div>
    </div>
  )
}

/** The pink lead words of a slide title. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[#EE1D62]">{children}</span>
}

export function NumberDot({ n, size = "lg" }: { n: number; size?: "sm" | "lg" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#FDE8EF] font-bold text-[#EE1D62] ${
        size === "lg" ? "size-53 fs-24" : "size-26 fs-14"
      }`}
    >
      {n}
    </span>
  )
}

/** Appendix card: number dot on the left, title and body to its right. */
export function NumberedCard({
  n,
  title,
  meta,
  children,
  className = "",
}: {
  n:          number
  title:      ReactNode
  meta?:      ReactNode
  children:   ReactNode
  className?: string
}) {
  return (
    <article className={`${CARD} flex gap-19 px-23 pb-24 pt-19 ${className}`}>
      <NumberDot n={n} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-12">
          <h2 className="pt-1 fs-28 font-bold leading-[1.2] tracking-[-0.02em]">{title}</h2>
          {meta}
        </div>
        <div className="mt-3 flex flex-1 flex-col fs-23 leading-[1.41] text-[#4A4A5E] [&_b]:font-bold [&_b]:text-[#14123A]">
          {children}
        </div>
      </div>
    </article>
  )
}

// ─── Persona icons ───────────────────────────────────────────────────────────

const PERSONA_ICON = {
  creator: <PersonIcon />,
  brand:   <BuildingIcon />,
  agency:  <GroupIcon />,
}

/** Persona icon in a pink-tinted circle. */
export function PersonaBadge({ persona, size = 52 }: { persona: keyof typeof PERSONA_ICON; size?: 40 | 52 | 64 }) {
  const box  = { 40: "size-40", 52: "size-52", 64: "size-64" }[size]
  const icon = { 40: "size-20", 52: "size-24", 64: "size-30" }[size]
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-[#FDE8EF] text-[#EE1D62]`}>
      <span className={icon}>{PERSONA_ICON[persona]}</span>
    </span>
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
