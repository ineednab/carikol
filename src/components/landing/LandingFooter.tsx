import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-[#18122B] border-t border-white/5 py-8 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-sm flex items-center gap-1.5">
          <svg viewBox="0 0 500 500" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-70">
            <defs>
              <linearGradient id="ckFootGrad" x1="60" y1="40" x2="450" y2="470" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6D28D9"/>
                <stop offset="0.55" stopColor="#9333EA"/>
                <stop offset="1" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="500" height="500" rx="128" fill="url(#ckFootGrad)"/>
            <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              <line x1="291" y1="291" x2="372" y2="372" strokeWidth="46"/>
              <circle cx="208" cy="208" r="112" strokeWidth="38"/>
            </g>
            <path d="M208 150 L222 194 L266 208 L222 222 L208 266 L194 222 L150 208 L194 194 Z" fill="#ffffff"/>
          </svg>
          <span className="text-white/50">Cari</span><span className="text-[#C4A6FF]">KOL</span><span className="text-[#EC4899]">.</span><span className="text-white/50">id</span>
        </span>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: "Cara Kerja", href: "#cara-kerja" },
            { label: "Creator",    href: "#creators" },
            { label: "Roadmap",    href: "#roadmap" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[12px] text-white/20 hover:text-white/45 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] text-white/15">
          © {new Date().getFullYear()} CariKOL.id
        </p>
      </div>
    </footer>
  )
}
