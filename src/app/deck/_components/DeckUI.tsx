import type { ReactNode } from "react"
import type { PersonaKey } from "../_lib/survey"

// Shared visual primitives for the /deck slides (16:9, designed at 1456×816).

export const CARD = "rounded-[22px] border border-white/70 bg-white/90 shadow-[0_10px_40px_-12px_rgba(76,29,149,0.14)] backdrop-blur-sm"

export const PERSONA_THEME: Record<PersonaKey, { icon: ReactNode; chip: string; bar: string; track: string; num: string }> = {
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

export function DeckShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#FBFAFF] text-[#14112B]">
      {/* Soft background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full bg-[#FBCFE8]/55 blur-[120px]" />
        <div className="absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#EDE9FE]/70 blur-[120px]" />
        <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-[#FCE7F3]/60 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex max-w-[1456px] flex-col gap-5 xl:gap-4 px-4 py-8 sm:px-8 sm:py-10 xl:px-[46px] xl:pb-5 xl:pt-8">
        {children}
      </main>
    </div>
  )
}

export function Eyebrow({ code, children }: { code: string; children: ReactNode }) {
  return (
    <p className="text-[13px] font-bold uppercase leading-none tracking-[0.2em] text-[#7C3AED]">
      {code} <span className="mx-1.5">•</span> {children}
    </p>
  )
}

const BADGE_SIZE = {
  sm: { box: "h-8 w-8",   icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-11 w-11", icon: "h-5 w-5" },
}

/** Persona icon in a tinted circle. */
export function PersonaBadge({ persona, size = "lg" }: { persona: PersonaKey; size?: keyof typeof BADGE_SIZE }) {
  const { box, icon } = BADGE_SIZE[size]
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full ${PERSONA_THEME[persona].chip}`}>
      <span className={icon}>{PERSONA_THEME[persona].icon}</span>
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
