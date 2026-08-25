import type { GoldenCreator } from "../schema"

// Kasus kegagalan #2: kreator edutainment (matematika, kuliah luar negeri,
// bisnis, hiburan keluarga). Tidak boleh dilabeli Beauty/skincare.
export const jeromepolin: GoldenCreator = {
  username: "jeromepolin",
  fullIdentity:
    "Kreator edutainment: pendidikan & matematika, pengalaman kuliah di luar negeri (Jepang), " +
    "ditambah konten bisnis/finansial dan hiburan keluarga yang energetik.",
  derivableFromRecent:
    "Dari post terbaru: seputar edukasi/motivasi belajar, kehidupan kuliah/luar negeri, " +
    "dan/atau bisnis — dengan gaya menghibur.",
  audience:        ["pelajar / mahasiswa", "gen Z", "orang tua"],
  tone:            ["edukatif", "menghibur", "energetik", "motivational"],
  commercialStyle: ["brand deals", "bisnis sendiri"],
  brandFit:        ["Education", "Finance", "F&B", "Telco"],
  mustNotInclude:  ["Beauty", "Makeup", "Skincare", "Kosmetik", "Gambling"],
}
