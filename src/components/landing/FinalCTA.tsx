"use client"
import { useScrollReveal } from "./useScrollReveal"

function openQuiz() {
  window.dispatchEvent(new CustomEvent("carikol:open-quiz"))
}

export function FinalCTA() {
  const ref = useScrollReveal()

  return (
    <section className="bg-[#18122B] py-28 px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <div className="reveal-item max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-6">
            Kalau kamu ngerasa sama
          </span>
          <h2 className="font-sans font-black text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.0] tracking-tight mb-10">
            Creator nggak seharusnya mulai dari nol lagi.
          </h2>
          <button
            onClick={openQuiz}
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-[14px] font-bold text-[#18122B] hover:bg-[#FAF8F5] active:scale-[.98] transition-all"
          >
            Jadi Early Creator
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p className="mt-5 text-[12px] text-white/25">
            Kamu bukan cuma daftar. Kamu ikut membentuk produknya.
          </p>
        </div>
      </div>
    </section>
  )
}
