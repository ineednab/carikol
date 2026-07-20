"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Props { creatorId: string }

export function DisconnectTikTok({ creatorId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm("Putuskan koneksi TikTok dan keluar dari akun?")) return
    setLoading(true)
    await fetch("/api/tiktok/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId }),
    })
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-500 transition hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "..." : "Disconnect"}
    </button>
  )
}
