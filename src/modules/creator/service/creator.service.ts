import { creatorRepository } from "../repository/creator.repository"

export const creatorService = {
  count:      () => creatorRepository.count(),
  list:       (filters?: { search?: string; category?: string; platformId?: string }) => creatorRepository.list(filters),
  getProfile: (id: string) => creatorRepository.getProfile(id),
}
