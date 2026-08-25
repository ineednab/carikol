import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { creatorService } from "@/modules/creator/service/creator.service"
import { CreatorFilters }  from "./_components/CreatorFilters"
import { CreatorListRow }  from "./_components/CreatorListRow"

export const metadata: Metadata = { title: "Creator Workspace — CariKOL" }

interface Props {
  searchParams: Promise<{ q?: string; category?: string; platformId?: string }>
}

export default async function CreatorsPage({ searchParams }: Props) {
  const { q, category, platformId } = await searchParams
  const creators = await creatorService.list({ search: q, category, platformId })

  const activeFilters = [q, category, platformId].filter(Boolean).length

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-zinc-400" />
            <h1 className="text-lg font-bold text-zinc-900">Creator Workspace</h1>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {creators.length} creator{activeFilters > 0 ? " (difilter)" : " aktif"}
          </p>
        </div>
      </div>

      <Suspense>
        <CreatorFilters />
      </Suspense>

      <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden">
        {creators.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-zinc-500">
              {activeFilters > 0 ? "Tidak ada creator yang cocok dengan filter ini." : "Belum ada creator."}
            </p>
            {activeFilters > 0 && (
              <Link href="/creators" className="mt-2 inline-block text-xs text-zinc-400 underline hover:text-zinc-700">
                Hapus semua filter
              </Link>
            )}
          </div>
        ) : (
          <div>
            <div className="hidden border-b border-zinc-100 px-5 py-2.5 sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <div className="flex-1">Creator</div>
              <div className="w-32">Kategori</div>
              <div className="w-36">Platform Utama</div>
              <div className="w-24 text-right">Followers</div>
              <div className="w-20 text-right">Kampanye</div>
            </div>
            {creators.map(c => (
              <CreatorListRow key={c.id} creator={c} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
