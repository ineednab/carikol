"use client"
import { useScrollReveal } from "./useScrollReveal"

const OUTCOMES = [
  "Satu Creator Profile. Tidak perlu jelasin diri lagi ke setiap agency.",
  "Track record kamu berbicara sebelum kamu ngomong.",
  "Setiap campaign memperkuat reputasimu secara otomatis.",
]

export function Vision() {
  const ref = useScrollReveal()

  return (
    <section id="cara-kerja" className="bg-white py-24 px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>

        <div className="reveal-item mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-5">
            Cara Kerja
          </span>
          <h2 className="font-sans font-black text-[#18122B] text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Ini yang berubah<br />
            kalau kamu pakai CariKOL.
          </h2>
        </div>

        <div className="space-y-4">
          {OUTCOMES.map((text, i) => (
            <div
              key={i}
              className="reveal-item flex items-center gap-6 bg-[#FAF8F5] rounded-2xl px-7 py-6"
            >
              <span className="font-black text-3xl text-[#6D28D9]/15 tabular-nums w-8 shrink-0">
                {i + 1}
              </span>
              <p className="font-bold text-[#18122B] text-[17px] sm:text-xl leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Pull quote */}
        <div className="reveal-item mt-8 rounded-2xl bg-[#18122B] px-8 py-7">
          <p className="font-black text-white text-xl sm:text-2xl leading-snug">
            &ldquo;Stop proving yourself from zero every campaign.&rdquo;
          </p>
          <p className="mt-3 text-[13px] text-white/30">Ini yang lagi kita bangun.</p>
        </div>

      </div>
    </section>
  )
}
