type CampaignPlanInput = {
  product:   string
  budget:    string
  target:    string
  platform:  string
  objective: string
}

type CreatorRow = {
  name:           string
  username:       string | null
  niche:          string | null
  followerCount:  number | null
  engagementRate: number | string | null
}

export function buildCampaignPlanPrompt(input: CampaignPlanInput): string {
  return `Kamu adalah konsultan KOL marketing Indonesia. Buat campaign plan untuk UMKM berikut.

Data Campaign:
- Produk/Bisnis: ${input.product}
- Budget total: Rp ${input.budget}
- Target audience: ${input.target}
- Platform: ${input.platform}
- Tujuan (jika ada): ${input.objective || "tidak disebutkan"}

Return JSON ONLY:
{
  "objective": "tujuan campaign 1 kalimat",
  "creatorType": "tipe creator yang ideal (tier, niche, karakteristik)",
  "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"],
  "timeline": "estimasi waktu campaign",
  "estimatedKPI": {
    "reach": "estimasi reach",
    "impressions": "estimasi impressions",
    "engagement": "estimasi total engagement"
  },
  "brief": "campaign brief singkat 2-3 kalimat yang bisa langsung dikirim ke creator",
  "budgetBreakdown": {
    "creatorFee": "alokasi untuk creator fee",
    "production": "alokasi untuk produksi konten",
    "note": "saran penggunaan budget"
  }
}`
}

export function buildCreatorMatchPrompt(product: string, target: string, creators: CreatorRow[]): string {
  return `Kamu adalah analis KOL marketing. Untuk campaign "${product}" yang menargetkan "${target}", berikan match score (0-100) dan alasan singkat (max 12 kata) untuk setiap creator.

Creators:
${creators.map((c, i) => `${i + 1}. ${c.name} (@${c.username ?? "unknown"}) - ${c.niche ?? "general"}, ${c.followerCount ?? 0} follower, ER ${c.engagementRate ?? 0}%`).join("\n")}

Return JSON array ONLY:
[{"score": 95, "reason": "alasan singkat max 12 kata"}, ...]`
}
