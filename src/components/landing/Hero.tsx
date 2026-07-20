"use client"
import { useEffect, useRef, useState } from "react"
import { CreatorCardPreview } from "./CreatorCardPreview"

function openQuiz() {
  window.dispatchEvent(new CustomEvent("carikol:open-quiz"))
}

const ROTATING_WORDS = ["Brand", "Agency", "Creator"]

function RotatingWord() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 280)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  return (
    <span
      className={`inline-block transition-all duration-280 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {ROTATING_WORDS[idx]}
    </span>
  )
}

const MESSY_FILES = [
  "Media Kit v3.pdf",
  "MediaKit_Final.pdf",
  "RateCard_New.pdf",
]

function DariIniCard() {
  return (
    <div className="bg-[#F4F4F5] rounded-2xl border border-[#E4E4E7] p-4 w-52">
      {/* IG handle */}
      <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#E4E4E7]">
        <div className="h-8 w-8 rounded-full bg-[#E4E4E7] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#A1A1AA]">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#52525B]">@andipratama</div>
          <div className="text-[9px] text-[#A1A1AA]">12.4K followers</div>
        </div>
      </div>

      {/* Messy files */}
      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#A1A1AA] mb-2">
        File dikirim manual
      </p>
      <div className="space-y-1.5">
        {MESSY_FILES.map((name) => (
          <div key={name} className="flex items-center gap-1.5 bg-white/60 rounded-lg px-2.5 py-1.5 border border-[#E4E4E7]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-[#A1A1AA]">
              <rect x="5" y="3" width="14" height="18" rx="2"/>
              <path d="M9 7h6M9 11h6M9 15h4"/>
            </svg>
            <span className="text-[9px] font-medium text-[#71717A] truncate">{name}</span>
          </div>
        ))}
        <div className="px-2.5 py-1">
          <span className="text-[9px] text-[#A1A1AA] italic">… dan 4 file lainnya</span>
        </div>
      </div>

      {/* Warning badge */}
      <div className="mt-2 flex items-start gap-1.5 bg-[#FEF9C3]/60 border border-amber-200/60 rounded-lg px-2.5 py-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span className="text-[9px] text-amber-700/60 leading-relaxed">
          Dikirim ke banyak brand<br />Berulang setiap campaign
        </span>
      </div>
    </div>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const t = setTimeout(() => el.classList.add("opacity-100", "translate-y-0"), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="min-h-screen bg-[#FAF8F5] pt-14 flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-14 items-center">

          {/* Left: copy + CTA */}
          <div
            ref={ref}
            className="opacity-0 translate-y-4 transition-all duration-500 ease-out"
          >
            <h1 className="font-sans font-black text-[#18122B] text-5xl sm:text-6xl leading-[1.0] tracking-tight mb-6">
              <RotatingWord /> baru.<br />
              Jelasin diri lagi.<br />
              <span className="text-[#6D28D9]">Dari nol lagi.</span>
            </h1>

            <p className="text-[#18122B]/50 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Berapa kali kamu kirim media kit yang sama ke brand yang berbeda?
            </p>

            <button
              onClick={openQuiz}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#6D28D9] px-7 py-4 text-[14px] font-bold text-white hover:bg-[#5b21b6] active:scale-[.98] transition-all"
            >
              Cari tahu apakah kamu ngalamin ini
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>

          {/* Right: before → after */}
          <div className="flex justify-center lg:justify-end">
            <div className="flex items-center gap-3 lg:gap-4">

              {/* DARI INI */}
              <div className="hidden sm:block shrink-0">
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#18122B]/30 block mb-2.5">
                  Dari ini
                </span>
                <DariIniCard />
              </div>

              {/* Arrow + emotional payoff */}
              <div className="hidden sm:flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[9px] font-semibold text-[#6D28D9] text-center leading-snug mt-1">
                  Sekali setup.<br />Selamanya<br />terpakai.
                </span>
              </div>

              {/* JADI INI */}
              <div className="shrink-0">
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9] block mb-2.5">
                  Jadi ini ✦
                </span>
                <div className="pt-5 animate-[float_4s_ease-in-out_infinite]">
                  <CreatorCardPreview />
                </div>
                <div className="mt-3 flex items-start gap-1">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0 text-[#6D28D9]/40 mt-0.5">
                    <path d="M4 4 C 4 13, 11 13, 13 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                    <path d="M13 10 L10 9 M13 10 L12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[10px] italic text-[#6D28D9]/60 leading-relaxed">
                    Satu link untuk semua<br />info profesionalmu
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
