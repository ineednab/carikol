import type { GoldenCreator } from "../schema"

// Kasus kegagalan #3: dokter kecantikan + advokasi konsumen skincare.
// Tidak boleh dilabeli Gaming/esports.
export const richardlee: GoldenCreator = {
  username: "dr.richard_lee",
  fullIdentity:
    "Dokter kecantikan yang membahas skincare, estetika, dan advokasi konsumen — sering membongkar " +
    "produk kosmetik berbahaya, dengan gaya blak-blakan dan otoritatif.",
  derivableFromRecent:
    "Dari post terbaru: seputar skincare/kecantikan, edukasi produk, dan/atau kritik konsumen.",
  audience:        ["perempuan", "pengguna skincare", "beauty enthusiast"],
  tone:            ["edukatif", "blak-blakan", "otoritatif"],
  commercialStyle: ["brand sendiri (skincare)", "promosi klinik"],
  brandFit:        ["Beauty", "Skincare", "Health", "Clinic"],
  mustNotInclude:  ["Gaming", "Esports", "Crypto", "Developer Tools"],
}
