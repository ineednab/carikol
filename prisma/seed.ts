import {
  PrismaClient,
  UserRole,
  SyncType,
  CapturedBy,
  ApplicationStatus,
  CampaignType,
  CampaignStatus,
  WouldWorkAgain,
  NoteVisibility,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding CariKOL database...")

  // ─── Platforms ────────────────────────────────────────────────────────────
  await prisma.platform.createMany({
    data: [
      { id: "tiktok",    name: "TikTok",    supportsAutoSync: true,  supportsLogin: true  },
      { id: "instagram", name: "Instagram", supportsAutoSync: false, supportsLogin: false },
      { id: "youtube",   name: "YouTube",   supportsAutoSync: false, supportsLogin: false },
      { id: "threads",   name: "Threads",   supportsAutoSync: false, supportsLogin: false },
      { id: "linkedin",  name: "LinkedIn",  supportsAutoSync: false, supportsLogin: false },
      { id: "other",     name: "Other",     supportsAutoSync: false, supportsLogin: false },
    ],
    skipDuplicates: true,
  })
  console.log("Platforms created")

  // ─── Users ────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10)

  const [nabila, cao] = await Promise.all([
    prisma.user.upsert({
      where:  { email: "satepacdang@gmail.com" },
      update: {},
      create: {
        name:     "Nabila",
        email:    "satepacdang@gmail.com",
        password: hashedPassword,
        role:     UserRole.admin,
      },
    }),
    prisma.user.upsert({
      where:  { email: "kerjaancao@gmail.com" },
      update: {},
      create: {
        name:     "Cao",
        email:    "kerjaancao@gmail.com",
        password: hashedPassword,
        role:     UserRole.campaign_manager,
      },
    }),
  ])
  console.log("Users created")

  // ─── Brands ───────────────────────────────────────────────────────────────
  const [wardah, scarlett, somethinc, emina] = await Promise.all([
    prisma.brand.create({
      data: { name: "Wardah Cosmetics",  industry: "Beauty & Skincare", accountManagerId: nabila.id, notes: "Halal beauty brand. Prefer family-friendly content." },
    }),
    prisma.brand.create({
      data: { name: "Scarlett Whitening", industry: "Beauty & Skincare", accountManagerId: nabila.id, notes: "Body care & skincare. Target: wanita 20-35 tahun." },
    }),
    prisma.brand.create({
      data: { name: "SOMETHINC",          industry: "Skincare",          accountManagerId: cao.id, notes: "Science-based skincare. Prefer educational content." },
    }),
    prisma.brand.create({
      data: { name: "Emina Cosmetics",    industry: "Beauty",            accountManagerId: cao.id, notes: "Youth-oriented brand. Playful, colorful aesthetic." },
    }),
  ])
  console.log("Brands created")

  // ─── Creators ─────────────────────────────────────────────────────────────
  const now = new Date()
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Creator 1: Aurel Santika
  const creator1 = await prisma.creator.create({ data: { name: "Aurel Santika", contact: "+62811000001", city: "Jakarta" } })
  await prisma.creatorCategory.createMany({ data: [{ creatorId: creator1.id, category: "Beauty" }, { creatorId: creator1.id, category: "Skincare" }] })
  const acc1 = await prisma.socialAccount.create({
    data: {
      creatorId:   creator1.id,
      platformId:  "tiktok",
      username:    "aurelsantika",
      displayName: "Aurel Santika",
      syncType:    SyncType.AUTO,
      connectedAt: sevenDaysAgo,
      lastSyncAt:  now,
      nextSyncAt:  sevenDaysOut,
    },
  })
  await prisma.socialSnapshot.createMany({
    data: [
      { accountId: acc1.id, followerCount: 1_200_000, followingCount: 420, postCount: 380, engagementRate: 4.2, capturedBy: CapturedBy.AUTO, capturedAt: sevenDaysAgo },
      { accountId: acc1.id, followerCount: 1_240_000, followingCount: 422, postCount: 392, engagementRate: 4.4, capturedBy: CapturedBy.AUTO, capturedAt: now },
    ],
  })

  // Creator 2: Reni Anggraini
  const creator2 = await prisma.creator.create({ data: { name: "Reni Anggraini", contact: "+62811000002", city: "Bandung" } })
  await prisma.creatorCategory.createMany({ data: [{ creatorId: creator2.id, category: "Lifestyle" }, { creatorId: creator2.id, category: "Beauty" }] })
  const acc2 = await prisma.socialAccount.create({
    data: { creatorId: creator2.id, platformId: "instagram", username: "renianggraini", displayName: "Reni Anggraini", syncType: SyncType.MANUAL },
  })
  await prisma.socialSnapshot.create({
    data: { accountId: acc2.id, followerCount: 85_000, followingCount: 1_200, postCount: 210, engagementRate: 6.8, capturedBy: CapturedBy.MANUAL, capturedAt: now },
  })

  // Creator 3: Tika Wulandari
  const creator3 = await prisma.creator.create({ data: { name: "Tika Wulandari", contact: "+62811000003", city: "Surabaya" } })
  await prisma.creatorCategory.createMany({ data: [{ creatorId: creator3.id, category: "Food" }, { creatorId: creator3.id, category: "Lifestyle" }] })
  const acc3 = await prisma.socialAccount.create({
    data: { creatorId: creator3.id, platformId: "tiktok", username: "tikawulandari", displayName: "Tika Wulandari", syncType: SyncType.MANUAL },
  })
  await prisma.socialSnapshot.createMany({
    data: [
      { accountId: acc3.id, followerCount: 2_250_000, postCount: 520, engagementRate: 5.0, capturedBy: CapturedBy.MANUAL, capturedAt: fourteenDaysAgo },
      { accountId: acc3.id, followerCount: 2_300_000, postCount: 535, engagementRate: 5.1, capturedBy: CapturedBy.MANUAL, capturedAt: now },
    ],
  })

  // Creator 4: Nadia Putri
  const creator4 = await prisma.creator.create({ data: { name: "Nadia Putri", contact: "+62811000005", city: "Jakarta" } })
  await prisma.creatorCategory.createMany({ data: [{ creatorId: creator4.id, category: "Skincare" }, { creatorId: creator4.id, category: "Beauty" }] })
  const acc4 = await prisma.socialAccount.create({
    data: { creatorId: creator4.id, platformId: "instagram", username: "nadiaputriskincare", displayName: "Nadia Putri", syncType: SyncType.MANUAL },
  })
  await prisma.socialSnapshot.create({
    data: { accountId: acc4.id, followerCount: 210_000, followingCount: 980, postCount: 340, engagementRate: 7.3, capturedBy: CapturedBy.MANUAL, capturedAt: now },
  })

  // Creator 5: Karina Lestari
  const creator5 = await prisma.creator.create({ data: { name: "Karina Lestari", contact: "+62811000008", city: "Yogyakarta" } })
  await prisma.creatorCategory.createMany({ data: [{ creatorId: creator5.id, category: "Fashion" }, { creatorId: creator5.id, category: "Beauty" }] })
  const acc5 = await prisma.socialAccount.create({
    data: { creatorId: creator5.id, platformId: "tiktok", username: "karinalestariofficial", displayName: "Karina Lestari", syncType: SyncType.MANUAL },
  })
  await prisma.socialSnapshot.create({
    data: { accountId: acc5.id, followerCount: 890_000, postCount: 410, engagementRate: 5.6, capturedBy: CapturedBy.MANUAL, capturedAt: now },
  })

  console.log("5 creators created")

  // ─── Campaign 1: Wardah — PAID, closed ────────────────────────────────────
  const campaign1 = await prisma.campaign.create({
    data: {
      name:         "Wardah Lightening Series Q2 2026",
      brandId:      wardah.id,
      type:         CampaignType.PAID,
      rewardAmount: 2_000_000,
      status:       CampaignStatus.closed,
      createdById:  nabila.id,
      closedAt:     new Date("2026-06-20"),
    },
  })
  await prisma.brief.create({
    data: {
      campaignId:      campaign1.id,
      platforms:       "Instagram",
      objective:       "Meningkatkan awareness Wardah Lightening Series melalui konten review dan tutorial",
      creatorCriteria: "Female beauty creator, 18-35 tahun, niche skincare/beauty, engagement rate min 5%",
      budgetMin:       15_000_000,
      budgetMax:       25_000_000,
      deliverables:    "1 feed post + 3 story (24 jam) + 1 reel per creator",
      startDate:       new Date("2026-05-01"),
      contentDeadline: new Date("2026-05-25"),
      postingDate:     new Date("2026-06-01"),
    },
  })

  // Applications for Campaign 1
  const app1Nadia = await prisma.application.create({
    data: { campaignId: campaign1.id, creatorId: creator4.id, status: ApplicationStatus.COMPLETED, appliedAt: new Date("2026-05-10") },
  })
  await prisma.application.create({
    data: { campaignId: campaign1.id, creatorId: creator2.id, status: ApplicationStatus.REJECTED, appliedAt: new Date("2026-05-02") },
  })
  await prisma.application.create({
    data: { campaignId: campaign1.id, creatorId: creator5.id, status: ApplicationStatus.REJECTED, appliedAt: new Date("2026-05-02") },
  })

  // Outcome for campaign 1
  await prisma.outcomeReview.create({
    data: {
      applicationId:  app1Nadia.id,
      campaignId:     campaign1.id,
      creatorId:      creator4.id,
      contentQuality: 5,
      communication:  4,
      professionalism: 5,
      wouldWorkAgain: WouldWorkAgain.yes,
      notes:          "Konten sangat bagus, sesuai brief, posting on time.",
      completedById:  nabila.id,
      completedAt:    new Date("2026-06-18"),
    },
  })

  console.log("Campaign 1 (Wardah closed) created")

  // ─── Campaign 2: Scarlett — BARTER, active ────────────────────────────────
  const campaign2 = await prisma.campaign.create({
    data: {
      name:        "Scarlett Body Lotion Ramadan Edition",
      brandId:     scarlett.id,
      type:        CampaignType.BARTER,
      status:      CampaignStatus.active,
      createdById: nabila.id,
    },
  })
  await prisma.brief.create({
    data: {
      campaignId:      campaign2.id,
      platforms:       "TikTok",
      objective:       "Promote Scarlett Ramadan Edition body lotion dengan angle self-care selama Ramadan",
      creatorCriteria: "Female creator, beauty/lifestyle niche, min 50K followers TikTok, engagement min 4%",
      budgetMin:       20_000_000,
      budgetMax:       35_000_000,
      deliverables:    "1 TikTok video (45-60 detik) per creator, mention promo code",
      startDate:       new Date("2026-07-15"),
      contentDeadline: new Date("2026-07-30"),
      postingDate:     new Date("2026-08-01"),
    },
  })
  await prisma.application.create({
    data: { campaignId: campaign2.id, creatorId: creator1.id, status: ApplicationStatus.CONTENT_SUBMITTED, appliedAt: new Date("2026-07-14") },
  })
  await prisma.application.create({
    data: { campaignId: campaign2.id, creatorId: creator3.id, status: ApplicationStatus.SELECTED, appliedAt: new Date("2026-07-15") },
  })

  console.log("Campaign 2 (Scarlett active) created")

  // ─── Campaign 3 & 4: Drafts ───────────────────────────────────────────────
  await prisma.campaign.create({
    data: {
      name:        "SOMETHINC Niacinamide Launch",
      brandId:     somethinc.id,
      type:        CampaignType.PAID,
      status:      CampaignStatus.draft,
      createdById: cao.id,
    },
  })
  await prisma.campaign.create({
    data: {
      name:        "Emina Summer Glow 2026",
      brandId:     emina.id,
      type:        CampaignType.BARTER,
      status:      CampaignStatus.draft,
      createdById: cao.id,
    },
  })
  console.log("Campaigns 3 & 4 (drafts) created")

  // ─── Internal Notes ───────────────────────────────────────────────────────
  await prisma.internalNote.createMany({
    data: [
      { creatorId: creator1.id, content: "Aurel sangat profesional dan responsif. Cocok untuk campaign premium.", authorId: nabila.id, visibility: NoteVisibility.TEAM },
      { creatorId: creator1.id, content: "Perlu lead time minimal 2 minggu untuk konten yang butuh props.", authorId: cao.id, visibility: NoteVisibility.TEAM },
      { creatorId: creator4.id, content: "Konten Nadia selalu on-brand, sangat direkomendasikan untuk Wardah dan Scarlett.", authorId: nabila.id, visibility: NoteVisibility.TEAM },
    ],
  })
  console.log("Internal notes created")

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { event: "campaign.created",   entityType: "campaign", entityId: campaign1.id, userId: nabila.id },
      { event: "campaign.activated", entityType: "campaign", entityId: campaign1.id, userId: nabila.id },
      { event: "campaign.closed",    entityType: "campaign", entityId: campaign1.id, userId: nabila.id },
      { event: "campaign.created",   entityType: "campaign", entityId: campaign2.id, userId: nabila.id },
      { event: "campaign.activated", entityType: "campaign", entityId: campaign2.id, userId: nabila.id },
    ],
  })

  console.log("\nSeeding complete!")
  console.log("\nLogin credentials (password: password123):")
  console.log("  satepacdang@gmail.com  — Admin")
  console.log("  kerjaancao@gmail.com   — Campaign Manager")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
