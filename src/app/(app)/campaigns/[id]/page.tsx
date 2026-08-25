import type { Metadata } from "next"
import Link from "next/link"
import dayjs from "dayjs"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { campaignService } from "@/modules/campaign/service/campaign.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const appStatusLabel: Record<string, string> = {
  APPLIED: "Applied",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  CONTENT_SUBMITTED: "Content Submitted",
  CONTENT_APPROVED: "Content Approved",
  COMPLETED: "Completed",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const campaign = await campaignService.getById(id)
  return { title: campaign ? `${campaign.name} — Campaign` : "Campaign Detail — CariKOL" }
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await campaignService.getById(id)
  if (!campaign) notFound()

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft size={12} /> Kembali ke Campaigns
      </Link>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
          <p className="text-sm text-zinc-500">
            {campaign.brand.name}
            {" · "}
            Dibuat {dayjs(campaign.createdAt).format("D MMM YYYY")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Jenis</p>
            <p className="mt-1 font-medium">{campaign.type}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Status</p>
            <Badge variant="outline" className="mt-1">
              {campaign.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Content Deadline</p>
            <p className="mt-1 font-medium">
              {campaign.brief?.contentDeadline
                ? dayjs(campaign.brief.contentDeadline).format("D MMM YYYY")
                : "Belum diatur"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Posting Date</p>
            <p className="mt-1 font-medium">
              {campaign.brief?.postingDate
                ? dayjs(campaign.brief.postingDate).format("D MMM YYYY")
                : "Belum diatur"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Creator Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.applications.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada creator yang apply.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {campaign.applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {application.creator.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {application.creator.city ?? "Kota belum diisi"}
                      {" · "}
                      Apply {dayjs(application.appliedAt).format("D MMM YYYY")}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {appStatusLabel[application.status] ?? application.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
