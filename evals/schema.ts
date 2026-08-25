// Golden dataset untuk evaluation harness creator-brief.
// Prinsip (lihat catatan produk): kita TIDAK menyimpan expected JSON, tapi
// expected HUMAN JUDGEMENT. Dua lapis kebenaran:
//   - fullIdentity        : kebenaran creator seutuhnya (untuk tier deep/connected)
//   - derivableFromRecent : yang WAJAR disimpulkan dari ~4 post publik (tier snapshot)
// mustNotInclude = hard-negative: kalau muncul di output AI → langsung FAIL.
export interface GoldenCreator {
  username: string

  /** Kebenaran menyeluruh — dinilai penuh hanya saat sample besar (deep/connected). */
  fullIdentity: string
  /** Yang wajar terbaca dari ~4 post terbaru — untuk menilai tier snapshot. */
  derivableFromRecent: string

  audience:        string[]
  tone:            string[]
  commercialStyle: string[]
  brandFit:        string[]

  /** Term yang TIDAK BOLEH muncul di brief manapun. Kemunculan = FAIL keras. */
  mustNotInclude: string[]
}
