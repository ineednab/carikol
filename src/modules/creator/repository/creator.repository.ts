import { prisma } from "@/lib/prisma"

export const creatorRepository = {
  count: () => prisma.creator.count({ where: { isActive: true } }),

  list: (filters?: { search?: string; category?: string; platformId?: string }) =>
    prisma.creator.findMany({
      where: {
        isActive: true,
        ...(filters?.search && {
          name: { contains: filters.search, mode: "insensitive" },
        }),
        ...(filters?.category && {
          categories: { some: { category: { equals: filters.category, mode: "insensitive" } } },
        }),
        ...(filters?.platformId && {
          socialAccounts: { some: { platformId: filters.platformId } },
        }),
      },
      select: {
        id:       true,
        name:     true,
        city:     true,
        contact:  true,
        isActive: true,
        categories: { select: { category: true } },
        socialAccounts: {
          take:    1,
          orderBy: { snapshots: { _count: "desc" } },
          include: {
            platform:  true,
            snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
          },
        },
        applications: {
          select: { status: true, campaignId: true },
        },
        outcomeReviews: {
          select: { wouldWorkAgain: true },
        },
      },
      orderBy: { name: "asc" },
    }),

  getProfile: (id: string) =>
    prisma.creator.findUnique({
      where: { id },
      include: {
        categories: true,
        socialAccounts: {
          include: {
            platform:  true,
            snapshots: { orderBy: { capturedAt: "desc" }, take: 6 },
          },
          orderBy: { createdAt: "asc" },
        },
        applications: {
          include: {
            campaign: {
              include: {
                brand: { select: { name: true } },
                brief: { select: { contentDeadline: true, postingDate: true } },
              },
            },
            outcome: true,
          },
          orderBy: { appliedAt: "desc" },
        },
        outcomeReviews: {
          include: {
            campaign: { include: { brand: { select: { name: true } } } },
            completedBy: { select: { name: true } },
          },
          orderBy: { completedAt: "desc" },
        },
        internalNotes: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
}
