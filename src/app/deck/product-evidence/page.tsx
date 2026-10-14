import type { Metadata } from "next"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { Accent, NumberedCard, Slide } from "../_components/DeckUI"
import { SURVEY_PERIOD, TOTAL, pct, persona, problemOf, type PersonaKey } from "../_lib/survey"
import landingShot   from "./_assets/landing.webp"
import cekShot       from "./_assets/cek-kredibilitas.webp"
import workspaceShot from "./_assets/creator-workspace.webp"

export const metadata: Metadata = {
  title: "Lampiran 01 · Product Evidence — CariKOL.id",
  description:
    "Tiga layar CariKOL.id yang menjawab masalah utama kreator, brand, dan agensi dari survei waitlist.",
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
  answers: [string, string]
}[] = [
  {
    persona: "creator",
    title:   "Profil Creator",
    status:  "live",
    shot:    landingShot,
    alt:     "Landing page CariKOL.id: file media kit dan rate card PDF diganti satu profil creator dengan riwayat campaign",
    desc:    "Media kit, rate card, dan portfolio PDF diganti satu link profil berisi statistik dan riwayat campaign terverifikasi yang terupdate otomatis.",
    answers: ["Kirim portfolio berulang kali", "Update informasi di banyak tempat"],
  },
  {
    persona: "brand",
    title:   "Cek Kredibilitas",
    status:  "sample",
    shot:    cekShot,
    alt:     "Halaman Cek Kredibilitas: trust score creator, empat skor sinyal, grafik pertumbuhan follower, dan kualitas audiens",
    desc:    "Masukkan username TikTok, Instagram, atau Threads untuk melihat trust score dari 4 sinyal, lonjakan follower tidak wajar, dan komposisi audiens.",
    answers: ["Proses screening manual", "Khawatir dengan engagement palsu"],
  },
  {
    persona: "agency",
    title:   "Creator Workspace",
    status:  "sample",
    shot:    workspaceShot,
    alt:     "Creator Workspace: filter positioning brand, daftar creator dengan skor kecocokan, dan peta positioning",
    desc:    "Atur positioning brand sekali (karakter, kategori, audiens, platform, budget), lalu creator diurutkan berdasarkan skor kecocokan beserta alasannya.",
    answers: ["Sulit membandingkan creator", "Rate tidak jelas"],
  },
]

export default function ProductEvidencePage() {
  return (
    <Slide
      code="Lampiran 01"
      label="Product Evidence"
      title={<><Accent>Bukti produk</Accent> dan masalah yang dijawab.</>}
      subtitle="Tiga layar CariKOL.id, masing-masing dipetakan ke masalah teratas satu tipe responden survei waitlist."
      page="Lampiran 01"
    >
      <div className="grid gap-16 lg:grid-cols-3">
        {SCREENS.map((screen, i) => (
          <ScreenCard key={screen.persona} n={i + 1} {...screen} />
        ))}
      </div>

      <p className="mt-16 fs-20 leading-[1.4] text-[#7B7B8C]">
        Layar 02 dan 03 memakai data contoh, bukan data creator nyata. Angka masalah: survei waitlist CariKOL.id,{" "}
        {SURVEY_PERIOD} (n = {TOTAL}), lihat{" "}
        <Link href="/deck/market-validation" className="font-semibold text-[#EE1D62] underline-offset-4 hover:underline">
          A2 · Market Validation
        </Link>
        .
      </p>
    </Slide>
  )
}

function ScreenCard({ n, persona: key, title, status, shot, alt, desc, answers }: (typeof SCREENS)[number] & { n: number }) {
  const { noun, n: respondents } = persona(key)
  const [first, second] = answers.map((label) => ({ label, count: problemOf(key, label).count }))

  return (
    <NumberedCard n={n} title={title} meta={<StatusPill status={status} />}>
      <p>{desc}</p>

      <a
        href={shot.src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Buka screenshot ${title} ukuran penuh`}
        className="group relative mt-18 block overflow-hidden rounded-[calc(var(--spacing)*8)] border border-[#F0E4E9]"
      >
        <Image
          src={shot}
          alt={alt}
          placeholder="blur"
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="aspect-video h-auto w-full object-cover object-top"
        />
        <span className="pointer-events-none absolute bottom-10 right-10 rounded-full bg-[#14123A]/85 px-12 py-4 fs-15 font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Ukuran penuh ↗
        </span>
      </a>

      <p className="mt-18">
        Menjawab 2 masalah teratas dari {respondents} {noun}: {lowerFirst(first.label)}{" "}
        <b>{first.count} ({pct(first.count, respondents)})</b> dan {lowerFirst(second.label)}{" "}
        <b>{second.count} ({pct(second.count, respondents)})</b>.
      </p>
    </NumberedCard>
  )
}

function StatusPill({ status }: { status: "live" | "sample" }) {
  return status === "live" ? (
    <span className="mt-4 flex shrink-0 items-center gap-8 rounded-full bg-[#FDE8EF] px-14 py-5 fs-16 font-semibold text-[#EE1D62]">
      <span className="size-8 rounded-full bg-[#EE1D62]" /> Live
    </span>
  ) : (
    <span className="mt-4 shrink-0 rounded-full border border-[#F0E4E9] px-14 py-5 fs-16 font-medium text-[#7B7B8C]">
      Data contoh
    </span>
  )
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}
