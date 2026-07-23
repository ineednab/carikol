type RateCardCreatorInput = {
  name:           string
  platform:       string
  username:       string
  niche:          string
  followerCount:  number
  tier:           string
  engagementRate: number | string
  notes:          string | null
}

export function buildRateCardPrompt(creator: RateCardCreatorInput): string {
  return `Kamu adalah ahli KOL marketing Indonesia. Berdasarkan data creator berikut, buat rate card yang realistis dan kompetitif untuk pasar Indonesia.

Data Creator:
- Nama: ${creator.name}
- Platform: ${creator.platform}
- Username: @${creator.username}
- Niche: ${creator.niche}
- Follower: ${creator.followerCount.toLocaleString("id")}
- Tier: ${creator.tier}
- Engagement Rate: ${creator.engagementRate}%
${creator.notes ? `- Bio: ${creator.notes}` : ""}

Buat rate card dalam format JSON dengan struktur berikut (HANYA return JSON, tidak ada teks lain):
{
  "items": [
    {
      "type": "nama jenis konten",
      "description": "deskripsi singkat apa yang didapat brand",
      "price": angka_dalam_rupiah,
      "priceFormatted": "Rp X.XXX.XXX",
      "notes": "catatan penting atau include apa",
      "reasons": ["alasan 1 kenapa harga ini wajar", "alasan 2", "alasan 3"]
    }
  ],
  "summary": "1-2 kalimat positioning creator ini di pasar",
  "positioning": "kata kunci positioning (contoh: 'Beauty Micro-Influencer TikTok')"
}

Sesuaikan jenis konten dengan platform (${creator.platform}):
- TikTok: Video TikTok, TikTok Live, Duet/Stitch, Story TikTok
- Instagram: Feed Post, Reels, Story (1 frame), Story (3-5 frame), IG Live
- YouTube: Dedicated Video, Mention/Integration, YouTube Shorts, Community Post

Harga harus realistis untuk pasar Indonesia berdasarkan tier dan follower count. Buat 4-6 item.`
}
