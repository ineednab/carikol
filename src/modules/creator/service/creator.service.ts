import { creatorRepository } from "../repository/creator.repository"

export const creatorService = {
  count: () => creatorRepository.count(),
}
