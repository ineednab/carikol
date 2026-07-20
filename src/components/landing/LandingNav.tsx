"use client"
import Link from "next/link"
import { useState } from "react"

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#18122B]/6">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 500 500" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <defs>
              <linearGradient id="ckNavGrad" x1="60" y1="40" x2="450" y2="470" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6D28D9"/>
                <stop offset="0.55" stopColor="#9333EA"/>
                <stop offset="1" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="500" height="500" rx="128" fill="url(#ckNavGrad)"/>
            <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              <line x1="291" y1="291" x2="372" y2="372" strokeWidth="46"/>
              <circle cx="208" cy="208" r="112" strokeWidth="38"/>
            </g>
            <path d="M208 150 L222 194 L266 208 L222 222 L208 266 L194 222 L150 208 L194 194 Z" fill="#ffffff"/>
          </svg>
          <span className="font-bold tracking-tight text-sm">
            <span className="text-[#18122B]">Cari</span><span className="text-[#6D28D9]">KOL</span><span className="text-[#EC4899]">.</span><span className="text-[#18122B]">id</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-7 text-[13px] text-[#18122B]/45">
          <Link href="#masalah" className="hover:text-[#18122B] transition-colors">Masalah</Link>
          <Link href="#cara-kerja" className="hover:text-[#18122B] transition-colors">Cara Kerja</Link>
          <Link href="#roadmap" className="hover:text-[#18122B] transition-colors">Roadmap</Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("carikol:open-quiz"))}
            className="rounded-full bg-[#6D28D9] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#5b21b6] transition-colors"
          >
            Gabung
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block h-px w-5 bg-[#18122B] transition-all ${open ? "rotate-45 translate-y-[5px]" : ""}`} />
          <span className={`block h-px w-5 bg-[#18122B] transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-[#18122B] transition-all ${open ? "-rotate-45 -translate-y-[5px]" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="sm:hidden bg-[#FAF8F5] border-t border-[#18122B]/6 px-6 py-5 flex flex-col gap-4 text-[14px] text-[#18122B]/60">
          <Link href="#masalah" onClick={() => setOpen(false)}>Masalah</Link>
          <Link href="#cara-kerja" onClick={() => setOpen(false)}>Cara Kerja</Link>
          <Link href="#roadmap" onClick={() => setOpen(false)}>Roadmap</Link>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            className="font-semibold text-[#18122B]"
          >
            Gabung Early →
          </Link>
        </div>
      )}
    </nav>
  )
}
