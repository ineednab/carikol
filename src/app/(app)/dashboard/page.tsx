import type { Metadata } from "next"
import Link from "next/link"
import dayjs from "dayjs"
import { getSession } from "@/lib/session"
import { campaignService } from "@/modules/campaign/service/campaign.service"
import { creatorService } from "@/modules/creator/service/creator.service"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Users, AlertCircle, Clock } from "lucide-react"

const statusLabel: Record<string, string> = {
  draft:         "Draft",
  active:        "Active",
  pending_close: "Pending Close",
  closed:        "Closed",
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft:         "secondary",
  active:        "default",
  pending_close: "destructive",
  closed:        "outline",
}

export const metadata: Metadata = { title: "Dashboard — CariKOL.id" }

export default async function DashboardPage() {
  const [session, stats, recentCampaigns, totalCreators] = await Promise.all([
    getSession(),
    campaignService.getDashboardStats(),
    campaignService.getRecentCampaigns(5),
    creatorService.count(),
  ])

  const firstName = session?.user?.name?.split(" ")[0] ?? "Kamu"

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageHeader
        title={`Halo, ${firstName}`}
        description="Ini yang butuh perhatianmu hari ini."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Campaign Aktif",   value: stats.activeCampaigns,   icon: Megaphone },
          { label: "Total Creator",    value: totalCreators,           icon: Users },
          { label: "Pending Close",    value: stats.pendingClose,      icon: AlertCircle },
          { label: "Baru Minggu Ini",  value: stats.campaignsThisWeek, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pb-4 pt-4">
              <div className="mb-1 flex items-center gap-1.5 text-zinc-400">
                <Icon size={13} />
                <span className="text-xs">{label}</span>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent campaigns */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-zinc-600">Campaign Berjalan</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {recentCampaigns.length === 0 ? (
            <EmptyState
              title="Belum ada campaign aktif"
              description="Buat campaign pertama untuk mulai melacak KOL."
            />
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-400">{c.brand.name}</p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <span className="text-xs text-zinc-400">{dayjs(c.createdAt).format("D MMM")}</span>
                    <Badge variant={statusVariant[c.status] ?? "outline"}>
                      {statusLabel[c.status] ?? c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
