"use client"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const [loading, setLoading] = useState<"google" | "tiktok" | null>(null)

  const handleGoogle = async () => {
    setLoading("google")
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleTikTok = () => {
    setLoading("tiktok")
    window.location.href = "/auth/tiktok"
  }

  return (
    <div className="space-y-3">

      {/* TikTok — primary for creators */}
      <button
        type="button"
        onClick={handleTikTok}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
        </svg>
        {loading === "tiktok" ? "Menghubungkan..." : "Masuk dengan TikTok"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[11px] text-zinc-400">atau</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {/* Google — for brands & agencies */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-[0.99] disabled:opacity-50"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading === "google" ? "Menghubungkan..." : "Masuk dengan Google"}
      </button>

      <p className="pt-1 text-center text-[11px] text-zinc-400">
        Dengan masuk, kamu setuju dengan{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-600">Syarat & Ketentuan</Link>
        {" "}dan{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-600">Kebijakan Privasi</Link>
        {" "}CariKOL.
      </p>
    </div>
  )
}
