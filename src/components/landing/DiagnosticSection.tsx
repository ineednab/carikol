"use client"
import { useEffect, useRef, useState } from "react"
import { useScrollReveal } from "./useScrollReveal"

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return val
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  icon,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
  icon: React.ReactNode
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex gap-3.5 items-start">
      <div className="shrink-0 h-9 w-9 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center text-[#6D28D9]">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-2.5">
          <label className="text-[13px] text-[#18122B]/55 leading-snug">{label}</label>
          <span className="font-black text-[#18122B] text-base tabular-nums ml-3 shrink-0">
            {value} <span className="text-xs font-normal text-[#18122B]/40">{unit}</span>
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[#18122B]/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#6D28D9] transition-none"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            style={{ margin: 0 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-[#6D28D9] shadow-sm pointer-events-none transition-none"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function PDFStack() {
  return (
    <div className="relative w-48 h-28 select-none">
      {/* Stacked shadow cards */}
      <div className="absolute top-3 left-3 w-40 h-20 bg-[#6D28D9]/6 rounded-lg border border-[#6D28D9]/10" />
      <div className="absolute top-1.5 left-1.5 w-40 h-20 bg-[#6D28D9]/10 rounded-lg border border-[#6D28D9]/15" />
      {/* Main card */}
      <div className="absolute top-0 left-0 w-40 h-20 bg-white rounded-lg border border-[#18122B]/12 shadow-md flex flex-col justify-center px-4 gap-1.5">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <rect x="5" y="3" width="14" height="18" rx="2"/>
            <path d="M9 7h6M9 11h6M9 15h4"/>
          </svg>
          <span className="text-[12px] font-semibold text-[#18122B]">Media Kit.pdf</span>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-10 rounded bg-[#18122B]/10" />
          <div className="h-1 w-6 rounded bg-[#18122B]/10" />
          <div className="h-1 w-8 rounded bg-[#18122B]/10" />
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-8 rounded bg-[#18122B]/10" />
          <div className="h-1 w-10 rounded bg-[#18122B]/10" />
        </div>
      </div>
      {/* Annotation */}
      <div className="absolute -bottom-1 right-0 flex items-center gap-1">
        <svg viewBox="0 0 24 20" fill="none" className="w-6 h-5 text-[#6D28D9]/50">
          <path d="M2 2 C 6 2, 10 10, 18 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          <path d="M18 10 L15 7 M18 10 L15 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="text-[11px] italic text-[#18122B]/40">Isinya hampir sama.</span>
      </div>
    </div>
  )
}

export function DiagnosticSection() {
  const containerRef = useScrollReveal()
  const [campaigns,      setCampaigns]      = useState(12)
  const [kitsPerCampaign, setKitsPerCampaign] = useState(3)
  const [minutesPerKit,  setMinutesPerKit]  = useState(25)
  const [revealed,       setRevealed]       = useState(false)

  const totalKits    = campaigns * kitsPerCampaign
  const totalMinutes = totalKits * minutesPerKit
  const totalHours   = Math.round(totalMinutes / 60)
  const workDays     = Math.round(totalHours / 8)

  const displayKits  = useCountUp(revealed ? totalKits : 0, 900)
  const displayHours = useCountUp(revealed ? totalHours : 0, 1100)

  function handleReveal() {
    setRevealed(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)))
  }

  const workContext =
    workDays >= 2
      ? `atau ${workDays} hari kerja penuh.`
      : `atau hampir 1 hari kerja penuh.`

  return (
    <section className="bg-[#FAF8F5] py-24 px-6">
      <div className="mx-auto max-w-5xl" ref={containerRef}>

        <div className="reveal-item mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-5">
            Coba hitung
          </span>
          <h2 className="font-sans font-black text-[#18122B] text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Berapa jam setahun
            <br />
            yang kamu buang?
          </h2>
        </div>

        <div className="reveal-item grid lg:grid-cols-2 gap-8 items-start">

          {/* Left: Sliders */}
          <div className="bg-white rounded-2xl p-8 space-y-7">
            <Slider
              label="Campaign yang kamu kerjakan tahun lalu"
              value={campaigns}
              min={1}
              max={60}
              unit="campaign"
              onChange={(v) => { setCampaigns(v); setRevealed(false) }}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              }
            />
            <Slider
              label="Rata-rata kali kirim media kit per campaign"
              value={kitsPerCampaign}
              min={1}
              max={10}
              unit="kali"
              onChange={(v) => { setKitsPerCampaign(v); setRevealed(false) }}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="5" y="3" width="14" height="18" rx="2"/>
                  <path d="M9 7h6M9 11h6M9 15h4"/>
                </svg>
              }
            />
            <Slider
              label="Menit untuk prepare dan kirim satu media kit"
              value={minutesPerKit}
              min={5}
              max={90}
              unit="menit"
              onChange={(v) => { setMinutesPerKit(v); setRevealed(false) }}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              }
            />

            <button
              onClick={handleReveal}
              className="w-full rounded-xl bg-[#18122B] py-3.5 text-[14px] font-bold text-white hover:bg-[#2a2a2a] active:scale-[.98] transition-all"
            >
              Hitung waktu yang terbuang →
            </button>

            <p className="text-[11px] text-[#18122B]/30 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Perhitunganmu aman dan tidak disimpan.
            </p>
          </div>

          {/* Right: Result */}
          <div
            className={`rounded-2xl p-8 transition-all duration-500 ${
              revealed
                ? "bg-white opacity-100 translate-y-0"
                : "bg-[#18122B]/4 opacity-50 translate-y-2"
            }`}
          >
            {!revealed ? (
              <div className="flex items-center justify-center h-full min-h-48">
                <p className="text-[13px] text-[#18122B]/25 text-center">
                  Atur slider di sebelah kiri,<br />lalu klik hitung.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Big number */}
                <div>
                  <p className="text-[13px] text-[#18122B]/40 mb-2">
                    Kamu kirim PDF yang sama
                  </p>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="font-black tabular-nums leading-none text-[#6D28D9] text-7xl sm:text-8xl">
                      {displayKits}
                    </span>
                    <span className="text-[#18122B] text-xl font-bold mb-1.5">kali.</span>
                  </div>
                  <p className="text-[13px] text-[#18122B]/40">Setiap tahunnya.</p>
                </div>

                {/* PDF Stack */}
                <PDFStack />

                {/* Hours card */}
                <div className="bg-[#6D28D9]/6 rounded-xl p-4 flex items-start gap-3">
                  <div className="shrink-0 h-8 w-8 rounded-lg bg-[#6D28D9]/12 flex items-center justify-center text-[#6D28D9]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2 5.5-3 7H8c-1-1.5-3-3.5-3-7a7 7 0 0 1 7-7z"/>
                      <path d="M8 18v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1"/>
                      <path d="M12 7v3l2 1"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#18122B]/50 mb-0.5">Itu setara dengan</p>
                    <p className="font-black text-[#6D28D9] text-2xl tabular-nums leading-tight">
                      ±{displayHours} jam
                    </p>
                    <p className="text-[12px] text-[#18122B]/50 mt-0.5">{workContext}</p>
                  </div>
                </div>

                {/* Annotation */}
                <div className="flex items-start gap-1.5">
                  <svg viewBox="0 0 16 24" fill="none" className="w-4 h-5 shrink-0 text-[#6D28D9]/40 mt-0.5">
                    <path d="M8 2 C 4 6, 4 14, 8 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                    <path d="M8 18 L5 15 M8 18 L11 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[12px] italic text-[#18122B]/35 leading-relaxed">
                    Waktu yang bisa kamu pakai untuk hal yang lebih penting.
                  </p>
                </div>

                <a
                  href="#waitlist"
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#5b21b6] active:scale-[.98] transition-all"
                >
                  Gabung 500 Creator Pertama →
                </a>

              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
