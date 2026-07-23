"use client"
import { useEffect, useRef, useState, useTransition } from "react"
import { joinWaitlistAction } from "@/modules/waitlist/actions/join-waitlist"

const STORAGE_KEY    = "carikol_quiz_v3"
const COMPLETED_KEY  = "carikol_quiz_done"

type PersonaKey = "creator" | "brand" | "agency"

const PERSONAS: { key: PersonaKey; symbol: string; label: string; desc: string }[] = [
  { key: "creator", symbol: "✦", label: "Creator",      desc: "Aku bikin konten" },
  { key: "brand",   symbol: "◈", label: "Brand / UMKM", desc: "Aku cari creator" },
  { key: "agency",  symbol: "◉", label: "Agency",       desc: "Aku handle keduanya" },
]

const Q1: Record<PersonaKey, { q: string; opts: readonly string[] }> = {
  creator: {
    q: "Pekerjaan apa yang paling sering kamu ulang?",
    opts: [
      "Kirim portfolio lagi",
      "Kirim rate card lagi",
      "Jelasin performa akun lagi",
      "Cari link konten lama",
      "Update info di banyak tempat",
      "Negosiasi dari awal lagi",
    ],
  },
  agency: {
    q: "Hal apa yang paling sulit saat memilih creator?",
    opts: [
      "Sulit membandingkan creator",
      "Data performa tidak lengkap",
      "Rate tidak jelas",
      "Portfolio tersebar",
      "Sulit tahu creator masih aktif",
      "Riwayat kerja sama tidak ada",
    ],
  },
  brand: {
    q: "Apa yang paling bikin kamu ragu memilih creator?",
    opts: [
      "Takut engagement palsu",
      "Sulit tahu kualitas konten",
      "Tidak tahu audience creator",
      "Sulit membandingkan creator",
      "Tidak punya waktu screening",
    ],
  },
}

const Q2_OPTS = [
  "Portfolio",
  "Rate Card",
  "Audience Insight",
  "Data Performa",
  "Brand Experience",
  "Testimonial",
  "Social Accounts",
  "Kontak",
  "Availability",
  "AI Summary",
  "Verified Metrics",
]

const Q3: Record<PersonaKey, { opts: readonly string[] }> = {
  creator: {
    opts: [
      "Nggak mau kirim PDF lagi",
      "Nggak mau update portfolio manual",
      "Nggak mau jelasin diri ke setiap brand",
      "Nggak mau isi form yang sama berkali-kali",
    ],
  },
  agency: {
    opts: [
      "Nggak mau buka spreadsheet lagi",
      "Nggak mau cari data creator satu-satu",
      "Nggak mau pindah-pindah WhatsApp",
      "Nggak mau minta media kit satu-satu",
    ],
  },
  brand: {
    opts: [
      "Nggak mau screening creator manual",
      "Nggak mau minta media kit satu-satu",
      "Nggak mau pusing soal fake engagement",
      "Nggak mau kontak creator yang nggak relevan",
    ],
  },
}

type StepId = "intro" | "persona" | "q1" | "q2" | "q3" | "email" | "done"

const PROGRESS: Record<StepId, number> = {
  intro:   0,
  persona: 12,
  q1:      32,
  q2:      54,
  q3:      76,
  email:   92,
  done:    100,
}

export function EarlyCreatorsPopup() {
  const [open, setOpen]             = useState(false)
  const [visible, setVisible]       = useState(false)
  const [step, setStep]             = useState<StepId>("intro")
  const [persona, setPersona]       = useState<PersonaKey | null>(null)
  const [painAnswer, setPainAnswer] = useState("")
  const [mustHaves, setMustHaves]   = useState<string[]>([])
  const [jobAnswer, setJobAnswer]   = useState("")
  const [selected, setSelected]     = useState<string | null>(null)
  const [sliding, setSliding]       = useState(false)
  const [wishText, setWishText]     = useState("")
  const [emailVal, setEmailVal]     = useState("")
  const [emailError, setEmailError] = useState("")
  const [isPending, startTx]        = useTransition()
  const triggered                   = useRef(false)

  function show() {
    if (triggered.current) return
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v && Date.now() < Number(v)) return
    } catch {}
    triggered.current = true
    setOpen(true)
  }

  function forceOpen() {
    try {
      if (localStorage.getItem(COMPLETED_KEY)) {
        setStep("done")
        setOpen(true)
        return
      }
    } catch {}
    setStep("intro")
    setPersona(null)
    setPainAnswer("")
    setMustHaves([])
    setJobAnswer("")
    setWishText("")
    setEmailVal("")
    setEmailError("")
    setSelected(null)
    setOpen(true)
  }

  useEffect(() => {
    function onScroll() {
      const pct = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)
      if (pct >= 0.40) show()
    }
    const timer = setTimeout(show, 35_000)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("carikol:open-quiz", forceOpen)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("carikol:open-quiz", forceOpen)
    }
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    else requestAnimationFrame(() => setVisible(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now() + 7 * 86_400_000)) } catch {}
    setVisible(false)
    setTimeout(() => setOpen(false), 280)
  }

  function slide(nextStep: StepId) {
    setSliding(true)
    setSelected(null)
    setTimeout(() => { setStep(nextStep); setSliding(false) }, 220)
  }

  function pickOption(answer: string, nextStep: StepId, setter: (v: string) => void) {
    if (selected || sliding) return
    setSelected(answer)
    setTimeout(() => { setter(answer); slide(nextStep) }, 380)
  }

  function toggleMustHave(item: string) {
    setMustHaves(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item)
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError("")
    const fd = new FormData()
    fd.set("email",       emailVal)
    fd.set("type",        persona ?? "creator")
    fd.set("pain",        painAnswer)
    fd.set("workflow",    mustHaves.join(", "))
    fd.set("demographic", jobAnswer)
    fd.set("wish",        wishText)
    startTx(async () => {
      const res = await joinWaitlistAction(fd)
      if (res.success) {
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now() + 365 * 86_400_000))
          localStorage.setItem(COMPLETED_KEY, "1")
        } catch {}
        slide("done")
      } else {
        setEmailError(res.error)
      }
    })
  }

  if (!open) return null

  const qs = persona ? Q1[persona] : null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6 transition-opacity duration-[280ms] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-[#18122B]/30 backdrop-blur-[4px]" />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-[400px] max-h-[90vh] flex flex-col bg-[#FAFAF8] rounded-t-[28px] sm:rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.16)] overflow-hidden transition-all duration-[280ms] ${
          visible ? "translate-y-0 scale-100" : "translate-y-4 sm:scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="h-[3px] bg-[#18122B]/6 shrink-0">
          <div
            className="h-full bg-[#6D28D9] transition-all duration-500 ease-out"
            style={{ width: `${PROGRESS[step]}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Tutup"
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-[#18122B]/6 hover:bg-[#18122B]/12 flex items-center justify-center text-[#18122B]/25 hover:text-[#18122B]/55 transition-colors z-10"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Content */}
        <div className={`overflow-y-auto flex-1 transition-all duration-[220ms] ${sliding ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>

          {/* ── INTRO ─────────────────────────────────────────── */}
          {step === "intro" && (
            <div className="px-6 sm:px-8 pt-10 pb-8">
              <p className="font-sans font-black text-[#18122B] text-[22px] leading-snug mb-5">
                Pekerjaan yang sama.<br />
                Diulang lagi.<br />
                Setiap campaign.
              </p>
              <p className="text-[14px] text-[#18122B]/60 leading-relaxed mb-4">
                Padahal setiap campaign seharusnya membuat pekerjaan berikutnya jadi lebih mudah.
              </p>
              <p className="text-[12px] text-[#18122B]/30 mb-8">Jawab 4 pertanyaan singkat. Bantu kami membangun CariKOL yang benar-benar berguna.</p>
              <button
                autoFocus
                onClick={() => slide("persona")}
                className="w-full rounded-[14px] bg-[#6D28D9] py-[14px] text-[14px] font-bold text-white hover:bg-[#5b21b6] active:scale-[.98] transition-all"
              >
                Mulai
              </button>
              <button
                onClick={dismiss}
                className="mt-3 w-full py-2 text-[11px] text-[#18122B]/25 hover:text-[#18122B]/50 transition-colors"
              >
                Nanti aja
              </button>
            </div>
          )}

          {/* ── PERSONA ───────────────────────────────────────── */}
          {step === "persona" && (
            <div className="px-6 sm:px-8 pt-8 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9] mb-4">1 / 4</p>
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-6">
                Kamu adalah seorang...
              </p>
              <div className="space-y-2.5">
                {PERSONAS.map(({ key, symbol, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => { setPersona(key); slide("q1") }}
                    className="w-full flex items-center gap-4 rounded-2xl border border-[#18122B]/8 bg-white px-5 py-4 text-left hover:border-[#6D28D9]/40 hover:bg-[#6D28D9]/3 active:scale-[.98] transition-all"
                  >
                    <span className="text-lg text-[#6D28D9]/60 w-5 text-center shrink-0">{symbol}</span>
                    <div>
                      <p className="font-bold text-[#18122B] text-[14px]">{label}</p>
                      <p className="text-[12px] text-[#18122B]/40 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Q1: Pain ──────────────────────────────────────── */}
          {step === "q1" && qs && (
            <div className="px-6 sm:px-8 pt-8 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9] mb-4">2 / 4</p>
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-6">
                {qs.q}
              </p>
              <div className="space-y-2.5">
                {qs.opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pickOption(opt, "q2", setPainAnswer)}
                    disabled={!!selected || sliding}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left text-[14px] transition-all active:scale-[.98] ${
                      selected === opt
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white"
                        : "border-[#18122B]/8 bg-white text-[#18122B]/70 hover:border-[#6D28D9]/40 hover:bg-[#6D28D9]/3"
                    } disabled:opacity-50`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Q2: Must-haves (multi-select max 3) ───────────── */}
          {step === "q2" && (
            <div className="px-6 sm:px-8 pt-8 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9] mb-4">3 / 4</p>
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-1">
                Kalau semua informasi creator ada dalam satu link...
              </p>
              <p className="text-[14px] text-[#18122B]/50 mb-5">apa yang <strong className="text-[#18122B]">HARUS</strong> ada? Pilih 3.</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {Q2_OPTS.map((opt) => {
                  const isSelected = mustHaves.includes(opt)
                  const isDisabled = !isSelected && mustHaves.length >= 3
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMustHave(opt)}
                      disabled={isDisabled}
                      className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition-all active:scale-[.97] ${
                        isSelected
                          ? "bg-[#6D28D9] border-[#6D28D9] text-white"
                          : isDisabled
                            ? "bg-white border-[#18122B]/8 text-[#18122B]/25 cursor-not-allowed"
                            : "bg-white border-[#18122B]/12 text-[#18122B]/70 hover:border-[#6D28D9]/40"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#18122B]/30">
                  {mustHaves.length}/3 dipilih
                </span>
                <button
                  onClick={() => slide("q3")}
                  disabled={mustHaves.length === 0}
                  className="rounded-xl bg-[#6D28D9] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#5b21b6] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[.98]"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* ── Q3: Job to be done ────────────────────────────── */}
          {step === "q3" && persona && (
            <div className="px-6 sm:px-8 pt-8 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9] mb-4">4 / 4</p>
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-1">
                Kalau CariKOL berhasil...
              </p>
              <p className="text-[14px] text-[#18122B]/50 mb-6">pekerjaan apa yang paling ingin kamu hilangkan?</p>
              <div className="space-y-2.5">
                {Q3[persona].opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pickOption(opt, "email", setJobAnswer)}
                    disabled={!!selected || sliding}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left text-[14px] transition-all active:scale-[.98] ${
                      selected === opt
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white"
                        : "border-[#18122B]/8 bg-white text-[#18122B]/70 hover:border-[#6D28D9]/40 hover:bg-[#6D28D9]/3"
                    } disabled:opacity-50`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── EMAIL ─────────────────────────────────────────── */}
          {step === "email" && (
            <div className="px-6 sm:px-8 pt-8 pb-8">
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-2">
                Kalau kami berhasil ngilangin itu...
              </p>
              <p className="text-[14px] text-[#18122B]/55 leading-relaxed mb-6">
                Mau kami kabarin? Jawaban kamu langsung pengaruhi apa yang kami bangun duluan.
              </p>

              {/* Wish — open-ended, optional */}
              <div className="mb-5">
                <p className="text-[12px] text-[#18122B]/40 mb-2">
                  {persona === "creator"
                    ? "Kalau bisa minta satu fitur untuk bantu karir kreator kamu — apa itu?"
                    : persona === "brand"
                      ? "Kalau bisa minta satu fitur untuk bantu kamu cari creator — apa itu?"
                      : "Kalau bisa minta satu fitur untuk bantu agency kamu — apa itu?"}
                </p>
                <textarea
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Tulis apa pun. Nggak ada jawaban yang salah."
                  rows={3}
                  className="w-full rounded-2xl border border-[#18122B]/12 bg-white px-4 py-3 text-[13px] text-[#18122B] placeholder:text-[#18122B]/25 focus:outline-none focus:border-[#6D28D9]/50 transition-colors resize-none"
                />
              </div>

              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  placeholder="emailmu@email.com"
                  autoFocus
                  required
                  className="w-full rounded-2xl border border-[#18122B]/12 bg-white px-4 py-3.5 text-[14px] text-[#18122B] placeholder:text-[#18122B]/25 focus:outline-none focus:border-[#6D28D9]/50 transition-colors"
                />
                {emailError && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-600">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-[14px] bg-[#6D28D9] py-[14px] text-[14px] font-bold text-white hover:bg-[#5b21b6] disabled:opacity-60 active:scale-[.98] transition-all"
                >
                  {isPending ? "Menyimpan..." : "Kabarin Aku →"}
                </button>
              </form>
              <button
                onClick={dismiss}
                className="mt-3 w-full py-2 text-[12px] text-[#18122B]/25 hover:text-[#18122B]/50 transition-colors"
              >
                Urungkan, nanti aja
              </button>
            </div>
          )}

          {/* ── DONE ──────────────────────────────────────────── */}
          {step === "done" && (
            <div className="px-6 sm:px-8 pt-10 pb-10 text-center">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#6D28D9]/10 text-2xl">
                ✦
              </div>
              <p className="font-sans font-black text-[#18122B] text-[20px] leading-snug mb-3">
                Terima kasih!
              </p>
              <p className="text-[14px] text-[#18122B]/55 leading-relaxed mb-8">
                Jawabanmu langsung masuk ke roadmap kami. Kami akan kabarkan saat CariKOL siap.
              </p>
              <button
                onClick={dismiss}
                className="w-full rounded-[14px] bg-[#18122B] py-[14px] text-[14px] font-bold text-white hover:bg-[#2a2a2a] active:scale-[.98] transition-all"
              >
                Tutup
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
