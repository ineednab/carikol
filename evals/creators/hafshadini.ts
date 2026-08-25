import type { GoldenCreator } from "../schema"

// Kasus kegagalan #1: classifier lama melabeli konten rumah tangga sebagai
// "AI & Tech / Tech Worker" karena substring "ai". Brief BARU tidak boleh begitu.
export const hafshadini: GoldenCreator = {
  username: "hafshadini_",
  fullIdentity:
    "Ibu/istri yang bercerita soal kehidupan rumah tangga dan relasi secara ringan, relatable, " +
    "dan penuh humor, dengan selipan rekomendasi affiliate (Shopee) yang soft-selling.",
  derivableFromRecent:
    "Dari post terbaru: dominan cerita seputar rumah tangga/keluarga dan konten relatable; " +
    "mungkin muncul sinyal affiliate/rekomendasi produk.",
  audience:        ["perempuan", "istri / pasangan menikah", "ibu muda"],
  tone:            ["storytelling", "relatable", "santai", "humoris"],
  commercialStyle: ["soft-selling", "affiliate"],
  brandFit:        ["FMCG", "Parenting", "Household", "F&B"],
  mustNotInclude:  ["AI", "Developer", "Tech Worker", "SaaS", "Crypto", "Gaming"],
}
