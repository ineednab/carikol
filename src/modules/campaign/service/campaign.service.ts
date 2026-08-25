import { campaignRepository } from "../repository/campaign.repository"

export const campaignService = {
  getDashboardStats: () => campaignRepository.getDashboardStats(),
  getRecentCampaigns: (limit?: number) => campaignRepository.getRecentCampaigns(limit),
  list: () => campaignRepository.list(),
  getById: (id: string) => campaignRepository.getById(id),
}
