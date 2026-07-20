"use client"
import Link from "next/link"
import { useState, useEffect } from "react"

export interface TocItem {
  id: string
  title: string
}

interface Props {
  title: string
  effectiveDate: string
  lastUpdated: string
  toc: TocItem[]
  children: React.ReactNode
}

export function LegalLayout({ title, effectiveDate, lastUpdated, toc, children }: Props) {
  const [active, setActive] = useState(toc[0]?.id ?? "")

  useEffect(() => {
    const els = toc.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [toc])

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#18122B]/6">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-[#18122B] text-[15px] tracking-tight">
            CariKOL
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-[#18122B]/40">
            <Link href="/terms" className="hover:text-[#18122B]/70 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#18122B]/70 transition-colors">Privacy</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {/* Page title */}
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] mb-3">
            Legal
          </p>
          <h1 className="font-black text-[#18122B] text-4xl sm:text-5xl leading-tight tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-[13px] text-[#18122B]/35">
            Effective Date: {effectiveDate} · Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* TOC — sticky sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#18122B]/30 mb-3">
                Contents
              </p>
              <ul className="space-y-1">
                {toc.map(({ id, title: t }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={`block text-[12px] py-1 border-l-2 pl-3 transition-all ${
                        active === id
                          ? "border-[#6D28D9] text-[#6D28D9] font-medium"
                          : "border-transparent text-[#18122B]/40 hover:text-[#18122B]/70 hover:border-[#18122B]/20"
                      }`}
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="prose-legal max-w-none">
            {children}
          </article>
        </div>
      </div>

      <footer className="border-t border-[#18122B]/6 py-8 px-6 text-center text-[12px] text-[#18122B]/30">
        © {new Date().getFullYear()} CariKOL · <a href="mailto:hello@carikol.id" className="hover:text-[#18122B]/60 transition-colors">hello@carikol.id</a>
      </footer>
    </div>
  )
}
