import type { Metadata } from "next"
import { Building2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = { title: "Brands — CariKOL" }

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      accountManager: { select: { name: true } },
      _count: { select: { campaigns: true } },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader
        title="Brands"
        description="Daftar brand dan owner campaign di workspace internal."
      />

      {brands.length === 0 ? (
        <EmptyState
          title="Belum ada brand"
          description="Brand baru akan tampil di sini setelah ditambahkan tim."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-zinc-400" />
                  <p className="text-sm font-semibold text-zinc-900">{brand.name}</p>
                </div>
                <p className="text-xs text-zinc-500">
                  Industry: {brand.industry ?? "Belum diisi"}
                </p>
                <p className="text-xs text-zinc-500">
                  Account Manager: {brand.accountManager?.name ?? "Belum ditetapkan"}
                </p>
                <p className="text-xs text-zinc-400">{brand._count.campaigns} campaign</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
