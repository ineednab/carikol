import { prisma } from "@/lib/prisma"

export const creatorRepository = {
  count: () => prisma.creator.count({ where: { isActive: true } }),
}
