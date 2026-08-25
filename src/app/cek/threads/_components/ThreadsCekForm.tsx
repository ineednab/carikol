"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

type TargetMode = "auto" | "post" | "account"

// Input link Threads bebas: permalink post ATAU URL akun ATAU @username.
// Deteksi jenis dilakukan di server (page.tsx). Di sini cuma navigasi + ?u=.
export function ThreadsCekForm({
  defaultValue = "",
  defaultMode = "auto",
}: {
  defaultValue?: string
  defaultMode?: TargetMode
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<TargetMode>(defaultMode)
  const [pending, start] = useTransition()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const singleValue = value.trim()
    if (!singleValue) return
    start(() => router.push(`/cek/threads?u=${encodeURIComponent(singleValue)}&m=${mode}`))
  }

  const helper =
    mode === "auto"
      ? "Auto detect aktif — kami kenali sendiri apakah itu akun atau 1 post."
      : mode === "account"
        ? "Snapshot aktivitas publik terbaru dari sebuah akun."
        : "Analisis AI mendalam untuk 1 postingan."

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-zinc-200/90 bg-white/95 p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur md:p-5">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@username atau link post Threads"
          className="h-12 w-full rounded-2xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs">
          {[
            { id: "auto", label: "Auto" },
            { id: "account", label: "Akun" },
            { id: "post", label: "Post" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id as TargetMode)}
              className={`rounded-lg px-3 py-1.5 transition ${
                mode === opt.id
                  ? "bg-zinc-900 font-semibold text-white shadow-sm"
                  : "text-zinc-600 hover:bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="hidden text-[11px] text-zinc-400 sm:block">{helper}</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Membuat snapshot…" : "Buat Snapshot"}
      </button>
      <p className="text-[11px] text-zinc-400 sm:hidden">{helper}</p>
    </form>
  )
}
