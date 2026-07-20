"use client"
import { useScrollReveal } from "./useScrollReveal"

const STEPS = [
  {
    label: "Agency baru",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="9" cy="7" r="3"/>
        <path d="M3 20c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5"/>
        <circle cx="17" cy="8" r="2.5"/>
        <path d="M14.5 20c0-2 1.5-3.5 3.5-3.5"/>
      </svg>
    ),
  },
  {
    label: "Kenalan lagi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: "Negosiasi lagi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    label: "Campaign selesai",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: "Ulang lagi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M1 4v6h6"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
      </svg>
    ),
  },
]

export function Relatable() {
  const ref = useScrollReveal()

  return (
    <section id="masalah" className="bg-white py-24 px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>

        <div className="reveal-item mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-5">
            Familiar?
          </span>
          <h2 className="font-sans font-black text-[#18122B] text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Kamu mungkin pernah<br />
            ngalamin ini.
          </h2>
        </div>

        <div className="reveal-item">

          {/* Icons */}
          <div className="flex justify-between mb-5 text-[#6D28D9]/35">
            {STEPS.map(({ icon }, i) => (
              <div key={i} className="flex justify-center w-1/5">{icon}</div>
            ))}
          </div>

          {/* Dots + connecting line */}
          <div className="relative flex justify-between items-center">
            <div className="absolute left-0 right-0 h-px bg-[#18122B]/10" />
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="relative z-10 h-4 w-4 rounded-full border-2 border-[#6D28D9]/40 bg-white"
              />
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-3">
            {STEPS.map(({ label }, i) => (
              <div key={i} className="flex justify-center w-1/5">
                <p className="text-[11px] sm:text-[13px] text-center text-[#18122B]/50 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Loop-back dashed arrow */}
          <svg
            viewBox="0 0 100 38"
            preserveAspectRatio="none"
            className="w-full mt-0 overflow-visible"
            style={{ height: "48px" }}
          >
            <defs>
              <marker id="loopHead" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
                <path d="M 1 5 L 3 1 L 5 5" stroke="#6D28D9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
              </marker>
            </defs>
            <path
              d="M 91 2 C 91 34, 9 34, 9 2"
              stroke="#6D28D9"
              strokeWidth="0.9"
              strokeDasharray="3 2.5"
              fill="none"
              opacity="0.4"
              markerEnd="url(#loopHead)"
            />
          </svg>

          <p className="font-bold text-red-500 text-xl mt-4">Sampai kapan?</p>

        </div>
      </div>
    </section>
  )
}
