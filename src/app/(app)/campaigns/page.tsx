import type { Metadata } from "next"
import Link from "next/link"
import dayjs from "dayjs"
import { Megaphone } from "lucide-react"
import { campaignService } from "@/modules/campaign/service/campaign.service"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const statusLabel: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  pending_close: "Pending Close",
  closed: "Closed",
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  active: "default",
  pending_close: "destructive",
  closed: "outline",
}

export const metadata: Metadata = { title: "Campaigns — CariKOL" }

export default async function CampaignsPage() {
  const campaigns = await campaignService.list()

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader
        title="Campaigns"
        description="Daftar campaign aktif dan histori campaign tim."
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title="Belum ada campaign"
          description="Campaign yang dibuat tim akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Megaphone size={14} className="shrink-0 text-zinc-400" />
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="truncate text-sm font-semibold text-zinc-900 hover:underline"
                    >
                      {campaign.name}
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {campaign.brand.name} · Dibuat {dayjs(campaign.createdAt).format("D MMM YYYY")}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {campaign._count.applications} aplikasi
                    {campaign.brief?.postingDate ? ` · Posting ${dayjs(campaign.brief.postingDate).format("D MMM YYYY")}` : ""}
                  </p>
                </div>

                <Badge variant={statusVariant[campaign.status] ?? "outline"}>
                  {statusLabel[campaign.status] ?? campaign.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
