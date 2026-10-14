import type { Metadata } from "next"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { Check, Info, Maximize2 } from "lucide-react"
import { CARD, DeckShell, Eyebrow, PersonaBadge } from "../_components/DeckUI"
import { SURVEY_PERIOD, TOTAL, pct, persona, problemOf, type PersonaKey } from "../_lib/survey"
import landingShot   from "./_assets/landing.webp"
import cekShot       from "./_assets/cek-kredibilitas.webp"
import workspaceShot from "./_assets/creator-workspace.webp"

export const metadata: Metadata = {
  title: "Product Evidence — CariKOL.id",
  description:
    "Lampiran 01: tiga layar CariKOL.id yang menjawab masalah utama creator, brand, dan agency dari survei waitlist.",
  robots: { index: false, follow: false },
}

// Setiap layar dipasangkan dengan dua masalah teratas persona-nya di survei
// (lihat A2). Label masalah harus sama persis dengan data di `_lib/survey`.
const SCREENS: {
  persona: PersonaKey
  title:   string
  status:  "live" | "sample"
  shot:    StaticImageData
  alt:     string
  desc:    string
  points:  string[]
  answers: string[]
}[] = [
  {
    persona: "creator",
    title:   "Profil Creator",
    status:  "live",
    shot:    landingShot,
    alt:     "Landing page CariKOL.id: file media kit dan rate card PDF diganti satu profil creator dengan riwayat campaign",
    desc:    "Media kit, rate card, dan portfolio yang biasa dikirim berulang diganti satu link profil yang terupdate otomatis.",
    points: [
      "Dari file PDF manual ke satu link profil",
      "Statistik campaign, avg reach, dan brand returning",
      "Riwayat campaign terverifikasi",
    ],
    answers: ["Kirim portfolio berulang kali", "Update informasi di banyak tempat"],
  },
  {
    persona: "brand",
    title:   "Cek Kredibilitas",
    status:  "sample",
    shot:    cekShot,
    alt:     "Halaman Cek Kredibilitas: trust score creator, empat skor sinyal, grafik pertumbuhan follower, dan kualitas audiens",
    desc:    "Cukup masukkan username untuk melihat trust score creator sebelum mengajak kerja sama.",
    points: [
      "Trust score dari 4 sinyal kredibilitas",
      "Menandai lonjakan follower dan audiens mencurigakan",
      "TikTok, Instagram, dan Threads",
    ],
    answers: ["Proses screening manual", "Khawatir dengan engagement palsu"],
  },
  {
    persona: "agency",
    title:   "Creator Workspace",
    status:  "sample",
    shot:    workspaceShot,
    alt:     "Creator Workspace: filter positioning brand, daftar creator dengan skor kecocokan, dan peta positioning",
    desc:    "Atur positioning brand sekali, lalu semua creator diurutkan berdasarkan skor kecocokan.",
    points: [
      "Filter karakter, kategori, audiens, platform, dan budget",
      "Skor kecocokan per creator beserta alasannya",
      "Peta positioning dan shortlist dalam satu layar",
    ],
    answers: ["Sulit membandingkan creator", "Rate tidak jelas"],
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductEvidencePage() {
  return (
    <DeckShell>
      <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_540px] xl:items-end xl:gap-10">
        <div>
          <Eyebrow code="Lampiran 01">Product Evidence</Eyebrow>
          <h1 className="mt-3 text-[36px] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-[44px] xl:text-[46px]">
            Tiga masalah utama,{" "}
            <br className="hidden xl:block" />
            <span className="bg-gradient-to-r from-[#6D28D9] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
              tiga layar yang menjawabnya.
            </span>
          </h1>
        </div>
        <p className="text-[16px] leading-[1.5] text-[#6B6880] xl:pb-1.5">
          Setiap layar dirancang dari masalah teratas tiap tipe responden di survei waitlist (n = {TOTAL}):
          creator berhenti mengirim ulang media kit, brand bisa menyaring creator berisiko, dan agency bisa
          membandingkan creator di satu tempat.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {SCREENS.map((screen, i) => (
          <ScreenCard key={screen.persona} index={i + 1} {...screen} />
        ))}
      </div>

      <SourceNote />
    </DeckShell>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function ScreenCard({ index, persona: key, title, status, shot, alt, desc, points, answers }: (typeof SCREENS)[number] & { index: number }) {
  const { label, n } = persona(key)
  return (
    <article className={`${CARD} flex flex-col px-5 pb-4 pt-4`}>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] font-extrabold tracking-[0.06em] text-[#7C3AED]">
          {String(index).padStart(2, "0")}
        </span>
        <span className="h-4 w-px bg-[#E4DFF0]" />
        <PersonaBadge persona={key} size="sm" />
        <span className="text-[13px] font-semibold text-[#3B3852]">Untuk {label}</span>
        <StatusPill status={status} />
      </div>

      <h2 className="mt-3 text-[20px] font-bold leading-tight tracking-[-0.015em]">{title}</h2>
      <p className="mt-1 text-[13px] leading-[1.45] text-[#6B6880]">{desc}</p>

      <a
        href={shot.src}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-3 block overflow-hidden rounded-xl border border-[#E9E5F3] bg-white shadow-[0_6px_20px_-10px_rgba(76,29,149,0.25)]"
        aria-label={`Buka screenshot ${title} ukuran penuh`}
      >
        <div className="flex h-[22px] items-center gap-1.5 border-b border-[#EEEAF6] bg-[#F8F7FC] px-2.5">
          <span className="h-[7px] w-[7px] rounded-full bg-[#F2B8C6]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#F6DA9C]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#BFE3C8]" />
        </div>
        <Image
          src={shot}
          alt={alt}
          placeholder="blur"
          sizes="(min-width: 1456px) 440px, (min-width: 1024px) 31vw, 100vw"
          className="aspect-video h-auto w-full object-cover object-top"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-[#14112B]/80 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 size={11} /> Ukuran penuh
        </span>
      </a>

      <ul className="mt-3 flex flex-col gap-1.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-[13px] leading-snug text-[#3B3852]">
            <Check size={14} strokeWidth={2.5} className="mt-[2px] shrink-0 text-[#7C3AED]" />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-3">
        <div className="rounded-xl bg-[#F7F4FE] px-3.5 py-2.5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#7C3AED]">
            Menjawab masalah {label} <span className="font-semibold text-[#9C94B8]">· n = {n}</span>
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {answers.map((answer) => {
              const { count } = problemOf(key, answer)
              return (
                <li key={answer} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                  <span className="text-[#3B3852]">{answer}</span>
                  <span className="whitespace-nowrap">
                    <strong className="font-bold">{count}</strong>{" "}
                    <span className="text-[11px] text-[#6B6880]">({pct(count, n)})</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </article>
  )
}

function StatusPill({ status }: { status: "live" | "sample" }) {
  return status === "live" ? (
    <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E9F8EF] px-2.5 py-1 text-[11px] font-semibold text-[#15803D]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Live
    </span>
  ) : (
    <span className="ml-auto whitespace-nowrap rounded-full border border-[#E4DFF0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6B6880]">
      Data contoh
    </span>
  )
}

function SourceNote() {
  return (
    <p className="flex items-start gap-3 rounded-xl bg-white/60 px-4 py-1.5 text-[12.5px] leading-relaxed text-[#3B3852] sm:items-center">
      <Info size={20} strokeWidth={1.8} className="shrink-0 text-[#7C3AED]" />
      <span>
        <strong className="font-bold">Sumber:</strong> Screenshot produk CariKOL.id. Layar 02 dan 03 memakai data
        contoh, bukan data creator sungguhan.{" "}
        <span className="text-[#7C3AED]">
          Angka masalah dari survei waitlist {SURVEY_PERIOD} (n = {TOTAL}), lihat{" "}
          <Link href="/deck/market-validation" className="font-semibold underline underline-offset-2">
            A2 · Market Validation
          </Link>
          .
        </span>
      </span>
    </p>
  )
}
