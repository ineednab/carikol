"use client"
import { useEffect, useState } from "react"

const NOTIFICATIONS = [
  "Campaign otomatis ditambahkan ✓",
  "Campaign terverifikasi ✓",
  "Portfolio ter-update ✓",
  "Link siap dibagikan ✓",
]

const CAMPAIGNS = [
  { label: "Beauty Campaign",   month: "Nov 2024", reach: "45K reach" },
  { label: "Lifestyle UGC",     month: "Mar 2025", reach: "28K reach" },
  { label: "Product Review #3", month: "Jun 2025", reach: "61K reach" },
]

export function CreatorCardPreview() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % NOTIFICATIONS.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative select-none">
      {/* Shadow card */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-[#6D28D9]/8 rounded-[20px]" />

      {/* Main card */}
      <div className="relative bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-6 w-72 max-w-full">

        {/* Profile */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#6D28D9]/15 flex items-center justify-center text-[#6D28D9] font-bold text-sm shrink-0">
            A
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[#18122B] text-sm">Andi Pratama</div>
            <div className="text-[11px] text-[#18122B]/40">@andipratama · TikTok</div>
          </div>
        </div>

        {/* Track-record stats — not vanity metrics */}
        <div className="grid grid-cols-3 bg-[#FAF8F5] rounded-xl mb-5">
          {[
            { val: "12",   lbl: "Campaign" },
            { val: "48K",  lbl: "Avg Reach" },
            { val: "9",    lbl: "Returning" },
          ].map(({ val, lbl }, i) => (
            <div
              key={lbl}
              className={`py-3 text-center ${i < 2 ? "border-r border-[#18122B]/8" : ""}`}
            >
              <div className="font-bold text-[#18122B] text-sm">{val}</div>
              <div className="text-[10px] text-[#18122B]/35 mt-0.5">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Campaign history — generic names, no brand names */}
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#18122B]/25 mb-3">
            Riwayat Campaign
          </p>
          <div className="space-y-2.5">
            {CAMPAIGNS.map(({ label, month, reach }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6D28D9]/40 shrink-0" />
                <span className="text-[12px] text-[#18122B]/65 flex-1">{label}</span>
                <span className="text-[10px] text-[#18122B]/30">{month}</span>
                <span className="text-[10px] font-medium text-[#6D28D9]">{reach}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live status */}
        <div className="mt-5 pt-4 border-t border-[#18122B]/6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-[#18122B]/35">Profil ini terupdate otomatis</span>
        </div>
      </div>

      {/* Rotating notification pill — inside card on mobile, floating on sm+ */}
      <div
        className={`absolute top-3 right-3 sm:-top-3 sm:-right-4 bg-[#18122B] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        {NOTIFICATIONS[idx]}
      </div>
    </div>
  )
}
