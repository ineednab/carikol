"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useTransition, useRef } from "react"
import { Search } from "lucide-react"

export function CreatorFilters() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeQ = searchParams.get("q") ?? ""

  const push = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }, [searchParams, pathname, router])

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => push({ q: e.target.value || null }), 350)
  }

  return (
    <div className="relative">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        placeholder="Cari nama creator..."
        defaultValue={activeQ}
        onChange={handleSearch}
        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0"
      />
    </div>
  )
}
