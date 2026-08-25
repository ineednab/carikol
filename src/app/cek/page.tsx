"use client"

import { useState, type FormEvent } from "react"
import { useRouter }                from "next/navigation"
import { Search, ShieldCheck,
         Heart, Users, Calendar, TrendingUp } from "lucide-react"
import { CariKOLLogo }              from "@/components/shared/CariKOLLogo"

const SIGNALS = [
  { icon: <Heart size={14} />,      label: "Kualitas Engagement",  desc: "ER vs median kohort, rasio like:komentar:share, konsistensi" },
  { icon: <Users size={14} />,      label: "Keaslian Audiens",     desc: "Pola engagement, dispersi waktu, deteksi engagement pod" },
  { icon: <Calendar size={14} />,   label: "Konsistensi Konten",   desc: "Frekuensi posting, burst vs konsistensi, variabilitas performa" },
  { icon: <TrendingUp size={14} />, label: "Pola Pertumbuhan",     desc: "Tren follower, kecepatan, tidak ada spike mendadak" },
]

export default function CekPage() {
  const router  = useRouter()
  const [value, setValue] = useState("")

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const input = value.trim()
    if (input) router.push(`/cek/threads?u=${encodeURIComponent(input)}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Nav */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <CariKOLLogo size="sm" />
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500">
          Verifikasi Creator
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Icon + heading */}
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
                <ShieldCheck size={30} className="text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900">
              Verifikasi Kredibilitas Creator
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              Cek performa akun atau postingan Threads sebelum memutuskan kolaborasi.
              <br />
              Metrik post · ringkasan akun · analisis AI yang explainable
            </p>
          </div>

          {/* Search */}
          <form onSubmit={onSubmit} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Link post Threads, link akun, atau @username"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
                />
              </div>
              <button
                type="submit"
                disabled={!value.trim()}
                className="h-12 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cek →
              </button>
            </div>
          </form>

          {/* What gets analyzed */}
          <div className="mb-8 rounded-2xl border border-zinc-200/60 bg-white p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Yang Dianalisis
            </p>
            <div className="space-y-3">
              {SIGNALS.map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">{label}</p>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Band reference — kecil dan tidak dominan */}
          <div className="mb-6 flex items-center justify-center gap-3">
            {(["A","B","C","D"] as const).map((band, i) => {
              const colors = [
                "bg-emerald-100 text-emerald-700",
                "bg-violet-100 text-violet-700",
                "bg-amber-100 text-amber-700",
                "bg-red-100 text-red-700",
              ]
              const labels = ["Tinggi","Baik","Perhatian","Risiko"]
              return (
                <div key={band} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${colors[i]}`}>
                  <span className="text-xs font-black">{band}</span>
                  <span className="text-[10px] font-medium">{labels[i]}</span>
                </div>
              )
            })}
          </div>

          {/* Fine print */}
          <p className="text-center text-[11px] leading-relaxed text-zinc-400">
            Untuk brand, UMKM, dan agensi · Data diambil dari sumber publik Threads
            <br />
            Sesuai UU PDP No. 27/2022 · Mekanisme sanggahan tersedia
          </p>
        </div>
      </main>
    </div>
  )
}
