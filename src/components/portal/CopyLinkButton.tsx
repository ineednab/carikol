"use client"
import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
        copied
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-zinc-900 text-white hover:bg-zinc-700 active:scale-[.98]"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Link tersalin!" : "Salin Link Media Kit"}
    </button>
  )
}
