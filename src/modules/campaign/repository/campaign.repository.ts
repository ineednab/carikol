import { prisma } from "@/lib/prisma"
import { CampaignStatus } from "@prisma/client"

export const campaignRepository = {
  async getDashboardStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const [activeCampaigns, pendingClose, campaignsThisWeek] = await Promise.all([
      prisma.campaign.count({ where: { status: { in: [CampaignStatus.active, CampaignStatus.draft] } } }),
      prisma.campaign.count({ where: { status: CampaignStatus.pending_close } }),
      prisma.campaign.count({ where: { createdAt: { gte: weekAgo } } }),
    ])
    return { activeCampaigns, pendingClose, campaignsThisWeek }
  },

  async getRecentCampaigns(limit = 5) {
    return prisma.campaign.findMany({
      where: { status: { not: CampaignStatus.closed } },
      include: { brand: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },
}
