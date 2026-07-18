import { PrismaClient, UserRole, Platform, CreatorTier, CampaignStatus, DecisionType, DecisionOwner, Confidence, WouldWorkAgain } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CariKOL database...");

  // ─── Users ────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const [admin, cm1, cm2, ks1, ks2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@buzzeryok.com" },
      update: {},
      create: { name: "Admin Buzzeryok", email: "admin@buzzeryok.com", password: hashedPassword, role: UserRole.admin },
    }),
    prisma.user.upsert({
      where: { email: "dina@buzzeryok.com" },
      update: {},
      create: { name: "Dina Rahayu", email: "dina@buzzeryok.com", password: hashedPassword, role: UserRole.campaign_manager },
    }),
    prisma.user.upsert({
      where: { email: "reza@buzzeryok.com" },
      update: {},
      create: { name: "Reza Firmansyah", email: "reza@buzzeryok.com", password: hashedPassword, role: UserRole.campaign_manager },
    }),
    prisma.user.upsert({
      where: { email: "sari@buzzeryok.com" },
      update: {},
      create: { name: "Sari Dewi", email: "sari@buzzeryok.com", password: hashedPassword, role: UserRole.kol_specialist },
    }),
    prisma.user.upsert({
      where: { email: "andi@buzzeryok.com" },
      update: {},
      create: { name: "Andi Pratama", email: "andi@buzzeryok.com", password: hashedPassword, role: UserRole.kol_specialist },
    }),
  ]);

  console.log("✅ Users created");

  // ─── Brands ───────────────────────────────
  const [wardah, scarlett, , somethinc] = await Promise.all([
    prisma.brand.create({ data: { name: "Wardah Cosmetics", industry: "Beauty & Skincare", accountManagerId: cm1.id, notes: "Halal beauty brand. Prefer family-friendly content." } }),
    prisma.brand.create({ data: { name: "Scarlett Whitening", industry: "Beauty & Skincare", accountManagerId: cm1.id, notes: "Body care & skincare. Target: wanita 20-35 tahun." } }),
    prisma.brand.create({ data: { name: "Emina Cosmetics", industry: "Beauty", accountManagerId: cm2.id, notes: "Youth-oriented brand. Playful, colorful aesthetic." } }),
    prisma.brand.create({ data: { name: "SOMETHINC", industry: "Skincare", accountManagerId: cm2.id, notes: "Science-based skincare. Prefer educational content." } }),
    prisma.brand.create({ data: { name: "MS Glow", industry: "Beauty & Wellness", accountManagerId: cm1.id } }),
  ]);

  console.log("✅ Brands created");

  // ─── Creators (20) ────────────────────────
  const creatorData = [
    { name: "Aurel Santika", username: "@aurelsantika", platform: Platform.tiktok, niche: "Beauty & Skincare", tier: CreatorTier.macro, followerCount: 1_200_000, engagementRate: 4.2, typicalRateMin: 3_000_000, typicalRateMax: 5_000_000, contact: "+62811000001" },
    { name: "Reni Anggraini", username: "@renianggraini", platform: Platform.instagram, niche: "Lifestyle & Beauty", tier: CreatorTier.micro, followerCount: 85_000, engagementRate: 6.8, typicalRateMin: 800_000, typicalRateMax: 1_500_000, contact: "+62811000002" },
    { name: "Tika Wulandari", username: "@tikawulandari", platform: Platform.tiktok, niche: "Food & Lifestyle", tier: CreatorTier.macro, followerCount: 2_300_000, engagementRate: 5.1, typicalRateMin: 5_000_000, typicalRateMax: 8_000_000, contact: "+62811000003" },
    { name: "Bowo Kusuma", username: "@bowokusuma", platform: Platform.youtube, niche: "Tech & Gadgets", tier: CreatorTier.micro, followerCount: 150_000, engagementRate: 3.5, typicalRateMin: 2_000_000, typicalRateMax: 3_500_000, contact: "+62811000004" },
    { name: "Nadia Putri", username: "@nadiaputriskincare", platform: Platform.instagram, niche: "Skincare & Beauty", tier: CreatorTier.micro, followerCount: 210_000, engagementRate: 7.3, typicalRateMin: 1_500_000, typicalRateMax: 2_500_000, contact: "+62811000005" },
    { name: "Farah Salma", username: "@farahsalmabeauty", platform: Platform.tiktok, niche: "Beauty & Makeup", tier: CreatorTier.mega, followerCount: 5_400_000, engagementRate: 3.8, typicalRateMin: 10_000_000, typicalRateMax: 18_000_000, contact: "+62811000006", notes: "Butuh lead time 3 minggu minimal." },
    { name: "Hendra Wijaya", username: "@hendrawijayafit", platform: Platform.instagram, niche: "Fitness & Health", tier: CreatorTier.micro, followerCount: 95_000, engagementRate: 8.2, typicalRateMin: 700_000, typicalRateMax: 1_200_000, contact: "+62811000007" },
    { name: "Karina Lestari", username: "@karinalestariofficial", platform: Platform.tiktok, niche: "Beauty & Fashion", tier: CreatorTier.macro, followerCount: 890_000, engagementRate: 5.6, typicalRateMin: 2_500_000, typicalRateMax: 4_000_000, contact: "+62811000008" },
    { name: "Bagas Hermawan", username: "@bagashermawanvlog", platform: Platform.youtube, niche: "Lifestyle & Travel", tier: CreatorTier.micro, followerCount: 320_000, engagementRate: 4.1, typicalRateMin: 3_000_000, typicalRateMax: 5_000_000, contact: "+62811000009" },
    { name: "Mega Pratiwi", username: "@megapratiwiskincare", platform: Platform.instagram, niche: "Skincare & Wellness", tier: CreatorTier.micro, followerCount: 175_000, engagementRate: 6.5, typicalRateMin: 1_200_000, typicalRateMax: 2_000_000, contact: "+62811000010" },
    { name: "Rizky Amelia", username: "@rizkyamelia_", platform: Platform.tiktok, niche: "Beauty & Skincare", tier: CreatorTier.nano, followerCount: 45_000, engagementRate: 9.1, typicalRateMin: 300_000, typicalRateMax: 600_000, contact: "+62811000011" },
    { name: "Dian Permata", username: "@dianpermatabeauty", platform: Platform.instagram, niche: "Beauty & Parenting", tier: CreatorTier.micro, followerCount: 130_000, engagementRate: 7.8, typicalRateMin: 900_000, typicalRateMax: 1_600_000, contact: "+62811000012" },
    { name: "Yudha Saputra", username: "@yudhasaputraofficial", platform: Platform.tiktok, niche: "Comedy & Entertainment", tier: CreatorTier.macro, followerCount: 3_100_000, engagementRate: 6.2, typicalRateMin: 6_000_000, typicalRateMax: 10_000_000, contact: "+62811000013" },
    { name: "Anisa Rahma", username: "@anisarahmaskincare", platform: Platform.instagram, niche: "Skincare & Beauty", tier: CreatorTier.micro, followerCount: 250_000, engagementRate: 5.9, typicalRateMin: 1_800_000, typicalRateMax: 3_000_000, contact: "+62811000014" },
    { name: "Citra Dewi", username: "@citradewi_beauty", platform: Platform.tiktok, niche: "Beauty & Makeup Tutorial", tier: CreatorTier.micro, followerCount: 420_000, engagementRate: 7.1, typicalRateMin: 1_500_000, typicalRateMax: 2_800_000, contact: "+62811000015" },
    { name: "Fitri Handayani", username: "@fitrihandayanivlog", platform: Platform.youtube, niche: "Lifestyle & Beauty", tier: CreatorTier.micro, followerCount: 195_000, engagementRate: 4.8, typicalRateMin: 2_000_000, typicalRateMax: 3_500_000, contact: "+62811000016" },
    { name: "Gilang Ramadhan", username: "@gilangramadhanfit", platform: Platform.instagram, niche: "Fitness & Wellness", tier: CreatorTier.nano, followerCount: 38_000, engagementRate: 10.2, typicalRateMin: 250_000, typicalRateMax: 500_000, contact: "+62811000017" },
    { name: "Helena Wijaya", username: "@helenawijayabeauty", platform: Platform.tiktok, niche: "Beauty & Skincare", tier: CreatorTier.micro, followerCount: 560_000, engagementRate: 6.4, typicalRateMin: 2_000_000, typicalRateMax: 3_500_000, contact: "+62811000018" },
    { name: "Irfan Hidayat", username: "@irfanhidayatofficial", platform: Platform.youtube, niche: "Tech & Review", tier: CreatorTier.micro, followerCount: 280_000, engagementRate: 3.9, typicalRateMin: 2_500_000, typicalRateMax: 4_000_000, contact: "+62811000019", isActive: false, notes: "Sementara tidak aktif menerima endorsement." },
    { name: "Jessica Tanaka", username: "@jessicatanakaid", platform: Platform.instagram, niche: "Beauty & Korean Culture", tier: CreatorTier.micro, followerCount: 310_000, engagementRate: 8.6, typicalRateMin: 2_200_000, typicalRateMax: 3_800_000, contact: "+62811000020" },
  ];

  const creators = await Promise.all(creatorData.map(data => prisma.creator.create({ data })));
  const [aurel, reni, , , nadia, , , karina, , , , , , anisa, citra] = creators;

  console.log(`✅ ${creators.length} creators created`);

  // ─── Campaign 1: Wardah — Closed ──────────
  const campaign1 = await prisma.campaign.create({
    data: { name: "Wardah Lightening Series Q2 2026", brandId: wardah.id, status: CampaignStatus.closed, createdById: cm1.id, closedAt: new Date("2026-06-20") },
  });
  await prisma.brief.create({
    data: {
      campaignId: campaign1.id, platform: Platform.instagram,
      objective: "Meningkatkan awareness Wardah Lightening Series melalui konten review dan tutorial",
      creatorCriteria: "Female beauty creator, 18-35 tahun, niche skincare/beauty, engagement rate min 5%",
      budgetMin: 15_000_000, budgetMax: 25_000_000,
      deliverables: "1 feed post + 3 story (24 jam) + 1 reel per creator",
      startDate: new Date("2026-05-01"), contentDeadline: new Date("2026-05-25"), postingDate: new Date("2026-06-01"),
    },
  });

  // Nadia: proposed → internal approved → client approved → confirmed
  for (const [type, owner, extra] of [
    [DecisionType.creator_proposed, DecisionOwner.system, {}],
    [DecisionType.internal_approved, DecisionOwner.campaign_manager, {}],
    [DecisionType.client_approved, DecisionOwner.client, {}],
    [DecisionType.creator_confirmed, DecisionOwner.creator, { confirmedRate: 2_000_000 }],
  ] as const) {
    await prisma.decision.create({
      data: { campaignId: campaign1.id, creatorId: nadia.id, type, owner, confidence: Confidence.explicit, recordedById: type === DecisionType.creator_proposed || type === DecisionType.creator_confirmed ? ks1.id : cm1.id, decidedAt: new Date("2026-05-10"), ...extra },
    });
  }

  // Reni: proposed → internal approved → client rejected
  await prisma.decision.create({ data: { campaignId: campaign1.id, creatorId: reni.id, type: DecisionType.creator_proposed, owner: DecisionOwner.system, confidence: Confidence.explicit, recordedById: ks1.id, decidedAt: new Date("2026-05-02") } });
  await prisma.decision.create({ data: { campaignId: campaign1.id, creatorId: reni.id, type: DecisionType.internal_approved, owner: DecisionOwner.campaign_manager, confidence: Confidence.explicit, recordedById: cm1.id, decidedAt: new Date("2026-05-04") } });
  const reniClientRejected = await prisma.decision.create({ data: { campaignId: campaign1.id, creatorId: reni.id, type: DecisionType.client_rejected, owner: DecisionOwner.client, confidence: Confidence.explicit, recordedById: cm1.id, decidedAt: new Date("2026-05-08") } });
  await prisma.decisionReason.create({ data: { decisionId: reniClientRejected.id, category: "tidak_sesuai_brand_image", freeText: "Klien merasa estetika konten tidak cocok dengan brand Wardah yang natural" } });

  // Karina: proposed → internal rejected (budget)
  await prisma.decision.create({ data: { campaignId: campaign1.id, creatorId: karina.id, type: DecisionType.creator_proposed, owner: DecisionOwner.system, confidence: Confidence.explicit, recordedById: ks1.id, decidedAt: new Date("2026-05-02") } });
  const karinaRejected = await prisma.decision.create({ data: { campaignId: campaign1.id, creatorId: karina.id, type: DecisionType.internal_rejected, owner: DecisionOwner.campaign_manager, confidence: Confidence.explicit, recordedById: cm1.id, decidedAt: new Date("2026-05-04") } });
  await prisma.decisionReason.create({ data: { decisionId: karinaRejected.id, category: "budget_tidak_sesuai", freeText: "Rate Karina di atas budget campaign ini" } });

  // Anisa: proposed → confirmed
  for (const [type, owner, extra] of [
    [DecisionType.creator_proposed, DecisionOwner.system, {}],
    [DecisionType.internal_approved, DecisionOwner.campaign_manager, {}],
    [DecisionType.client_approved, DecisionOwner.client, {}],
    [DecisionType.creator_confirmed, DecisionOwner.creator, { confirmedRate: 2_200_000 }],
  ] as const) {
    await prisma.decision.create({
      data: { campaignId: campaign1.id, creatorId: anisa.id, type, owner, confidence: Confidence.explicit, recordedById: type === DecisionType.creator_proposed || type === DecisionType.creator_confirmed ? ks1.id : cm1.id, decidedAt: new Date("2026-05-14"), ...extra },
    });
  }

  // Outcome reviews for campaign 1
  await prisma.outcomeReview.create({ data: { campaignId: campaign1.id, creatorId: nadia.id, contentQuality: 5, communication: 4, professionalism: 5, wouldWorkAgain: WouldWorkAgain.yes, notes: "Konten sangat bagus, sesuai brief, posting on time.", completedById: cm1.id, completedAt: new Date("2026-06-18") } });
  await prisma.outcomeReview.create({ data: { campaignId: campaign1.id, creatorId: anisa.id, contentQuality: 4, communication: 5, professionalism: 4, wouldWorkAgain: WouldWorkAgain.yes, notes: "Komunikasi sangat responsif, konten sesuai guidelines.", completedById: cm1.id, completedAt: new Date("2026-06-18") } });

  console.log("✅ Campaign 1 (Wardah — Closed) created");

  // ─── Campaign 2: Scarlett — Active ────────
  const campaign2 = await prisma.campaign.create({
    data: { name: "Scarlett Body Lotion Ramadan Edition", brandId: scarlett.id, status: CampaignStatus.active, createdById: cm1.id },
  });
  await prisma.brief.create({
    data: {
      campaignId: campaign2.id, platform: Platform.tiktok,
      objective: "Promote Scarlett Ramadan Edition body lotion dengan angle self-care selama Ramadan",
      creatorCriteria: "Female creator, beauty/lifestyle niche, min 50K followers TikTok, engagement min 4%",
      budgetMin: 20_000_000, budgetMax: 35_000_000,
      deliverables: "1 TikTok video (45-60 detik) per creator, mention promo code",
      startDate: new Date("2026-07-15"), contentDeadline: new Date("2026-07-30"), postingDate: new Date("2026-08-01"),
    },
  });

  // Aurel: proposed → confirmed
  for (const [type, owner, extra] of [
    [DecisionType.creator_proposed, DecisionOwner.system, {}],
    [DecisionType.internal_approved, DecisionOwner.campaign_manager, {}],
    [DecisionType.client_approved, DecisionOwner.client, {}],
    [DecisionType.creator_confirmed, DecisionOwner.creator, { confirmedRate: 4_500_000 }],
  ] as const) {
    await prisma.decision.create({
      data: { campaignId: campaign2.id, creatorId: aurel.id, type, owner, confidence: Confidence.explicit, recordedById: type === DecisionType.creator_proposed || type === DecisionType.creator_confirmed ? ks2.id : cm1.id, decidedAt: new Date("2026-07-14"), ...extra },
    });
  }

  // Citra: proposed → confirmed
  for (const [type, owner, extra] of [
    [DecisionType.creator_proposed, DecisionOwner.system, {}],
    [DecisionType.internal_approved, DecisionOwner.campaign_manager, {}],
    [DecisionType.client_approved, DecisionOwner.client, { confidence: Confidence.inferred }],
    [DecisionType.creator_confirmed, DecisionOwner.creator, { confirmedRate: 2_500_000 }],
  ] as const) {
    await prisma.decision.create({
      data: { campaignId: campaign2.id, creatorId: citra.id, type, owner, confidence: Confidence.explicit, recordedById: type === DecisionType.creator_proposed || type === DecisionType.creator_confirmed ? ks2.id : cm1.id, decidedAt: new Date("2026-07-15"), ...extra },
    });
  }

  console.log("✅ Campaign 2 (Scarlett — Active) created");

  // ─── Campaign 3: SOMETHINC — Draft ────────
  const campaign3 = await prisma.campaign.create({
    data: { name: "SOMETHINC Niacinamide Launch", brandId: somethinc.id, status: CampaignStatus.draft, createdById: cm2.id },
  });
  await prisma.brief.create({
    data: {
      campaignId: campaign3.id, platform: Platform.instagram,
      objective: "Edukasi audience tentang manfaat Niacinamide dan positioning produk baru SOMETHINC",
      creatorCriteria: "Skincare enthusiast, konten edukatif, min 100K followers, science-friendly content",
      budgetMin: 30_000_000, budgetMax: 50_000_000,
      deliverables: "1 carousel post (min 5 slides) + 1 reels review + 5 stories per creator",
      startDate: new Date("2026-08-01"), contentDeadline: new Date("2026-08-20"), postingDate: new Date("2026-08-25"),
      specialRequirements: "Wajib mention key ingredients: Niacinamide 10%, Zinc 1%. Tidak boleh bandingkan dengan brand lain.",
    },
  });

  console.log("✅ Campaign 3 (SOMETHINC — Draft) created");

  // ─── Audit Logs ───────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { event: "campaign.created", entityType: "campaign", entityId: campaign1.id, userId: cm1.id },
      { event: "campaign.activated", entityType: "campaign", entityId: campaign1.id, userId: cm1.id },
      { event: "campaign.closed", entityType: "campaign", entityId: campaign1.id, userId: cm1.id },
      { event: "campaign.created", entityType: "campaign", entityId: campaign2.id, userId: cm1.id },
      { event: "campaign.activated", entityType: "campaign", entityId: campaign2.id, userId: cm1.id },
      { event: "campaign.created", entityType: "campaign", entityId: campaign3.id, userId: cm2.id },
    ],
  });

  console.log("✅ Audit logs created");
  console.log("\n🎉 Seeding complete!");
  console.log("\nLogin credentials (password: password123):");
  console.log("  admin@buzzeryok.com  — Admin");
  console.log("  dina@buzzeryok.com   — Campaign Manager");
  console.log("  reza@buzzeryok.com   — Campaign Manager");
  console.log("  sari@buzzeryok.com   — KOL Specialist");
  console.log("  andi@buzzeryok.com   — KOL Specialist");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
