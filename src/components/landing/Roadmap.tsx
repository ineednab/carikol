"use client"
import { useScrollReveal } from "./useScrollReveal"

const STEPS = [
  {
    phase: "Sekarang",
    title: "Creator Profile",
    desc:  "Satu tempat untuk semua identitasmu — niche, platform, rate card, dan cara terbaik menghubungimu.",
    active: true,
  },
  {
    phase: "Berikutnya",
    title: "Verified Portfolio",
    desc:  "Portfolio yang ter-update otomatis setiap campaign selesai. Satu link. Selalu relevan.",
    active: false,
  },
  {
    phase: "Segera",
    title: "Campaign History",
    desc:  "Riwayat kerja sama yang terverifikasi. Brand bisa lihat track record nyata, bukan sekadar klaim.",
    active: false,
  },
  {
    phase: "Nanti",
    title: "Creator Passport",
    desc:  "Reputasimu tiba sebelum kamu. Setiap agency baru sudah tahu siapa kamu sebelum percakapan pertama.",
    active: false,
  },
]

export function Roadmap() {
  const ref = useScrollReveal()

  return (
    <section id="roadmap" className="bg-white py-24 px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>

        <div className="reveal-item mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-5">
            Roadmap
          </span>
          <h2 className="font-sans font-black text-[#18122B] text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Ini perjalanan<br />
            yang sedang kita bangun.
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#18122B]/8 hidden sm:block" />

          <div className="space-y-2">
            {STEPS.map(({ phase, title, desc, active }) => (
              <div
                key={title}
                className={`reveal-item flex gap-6 items-start rounded-2xl p-6 transition-colors ${
                  active ? "bg-[#6D28D9]/5 border border-[#6D28D9]/15" : "bg-[#FAF8F5]"
                }`}
              >
                <div className="shrink-0 relative z-10 mt-1">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      active
                        ? "bg-[#6D28D9] border-[#6D28D9]"
                        : "bg-white border-[#18122B]/20"
                    }`}
                  >
                    {active && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className={`font-black text-base ${active ? "text-[#6D28D9]" : "text-[#18122B]"}`}>
                      {title}
                    </p>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      active
                        ? "bg-[#6D28D9]/15 text-[#6D28D9]"
                        : "bg-[#18122B]/6 text-[#18122B]/35"
                    }`}>
                      {phase}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-[#18122B]/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
