// ─── Data survei waitlist ────────────────────────────────────────────────────
// Sumber: survei waitlist di landing page (Agustus 2026). Dipakai bersama oleh
// semua halaman deck. Cukup ubah angka di sini — persentase dan panjang bar
// dihitung otomatis dari `count / n`.

export const SURVEY_PERIOD = "Agustus 2026"

export type PersonaKey = "creator" | "brand" | "agency"
export type Problem    = { label: string; count: number }
export type Persona    = {
  key:      PersonaKey
  label:    string
  n:        number
  problems: Problem[]
  meaning:  string
}

export const PERSONAS: Persona[] = [
  {
    key:   "creator",
    label: "Creator",
    n:     99,
    problems: [
      { label: "Kirim portfolio berulang kali",     count: 35 },
      { label: "Update informasi di banyak tempat", count: 23 },
      { label: "Kirim rate card berulang kali",     count: 11 },
    ],
    meaning: "Menghabiskan waktu untuk mengirim ulang portfolio dan memperbarui informasi di banyak platform.",
  },
  {
    key:   "brand",
    label: "Brand / UMKM",
    n:     12,
    problems: [
      { label: "Proses screening manual",            count: 4 },
      { label: "Khawatir dengan engagement palsu",   count: 4 },
      { label: "Sulit menemukan creator yang sesuai", count: 2 },
    ],
    meaning: "Membutuhkan data yang lebih jelas dan sinyal kepercayaan saat mencari creator.",
  },
  {
    key:   "agency",
    label: "Agency",
    n:     26,
    problems: [
      { label: "Sulit membandingkan creator",       count: 11 },
      { label: "Rate tidak jelas",                  count: 5 },
      { label: "Data dan performa tidak konsisten", count: 4 },
    ],
    meaning: "Kesulitan membandingkan creator dan mengelola data campaign secara efisien.",
  },
]

export const TOTAL = PERSONAS.reduce((sum, p) => sum + p.n, 0)

export const TOP_PROBLEMS: Problem[] = [
  { label: "Kirim portfolio berulang kali",          count: 35 },
  { label: "Update informasi di banyak tempat",      count: 23 },
  { label: "Kirim rate card berulang kali",          count: 15 },
  { label: "Menjelaskan performa akun berulang kali", count: 12 },
  { label: "Sulit membandingkan creator",            count: 12 },
]

export function persona(key: PersonaKey): Persona {
  return PERSONAS.find((p) => p.key === key)!
}

/** Masalah milik satu persona berdasarkan label — gagal saat render kalau labelnya berubah. */
export function problemOf(key: PersonaKey, label: string): Problem {
  const found = persona(key).problems.find((p) => p.label === label)
  if (!found) throw new Error(`Masalah "${label}" tidak ada di data survei ${key}`)
  return found
}

const pctFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function pct(count: number, n: number): string {
  return `${pctFormat.format((count / n) * 100)}%`
}
