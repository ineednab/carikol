"use client"
import { useScrollReveal } from "./useScrollReveal"

const STORIES = [
  {
    theme: "Media Kit",
    quote: "Aku pernah kirim PDF media kit yang sama ke 19 brand berbeda. Di tahun yang sama. Padahal isinya nggak pernah berubah.",
    name:  "Aldan",
    handle:"@aldanfood",
    niche: "Food · Instagram · 8K",
  },
  {
    theme: "Negosiasi",
    quote: "Rate card aku dinegosiasi 3× dalam satu deal. Padahal kalau mereka bisa lihat track record aku, mereka nggak akan tanya lagi.",
    name:  "Sheila",
    handle:"@sheilaliving",
    niche: "Lifestyle · YouTube · 45K",
  },
  {
    theme: "Portfolio",
    quote: "Campaign selesai, brand senang, tapi aku nggak punya apa-apa yang bisa aku tunjukin ke brand berikutnya. Cuma screenshot seadanya.",
    name:  "Rizkita",
    handle:"@rizkitabeauty",
    niche: "Beauty · TikTok · 22K",
  },
]

export function Testimonials() {
  const ref = useScrollReveal()

  return (
    <section id="creators" className="bg-[#FAF8F5] py-24 px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>

        <div className="reveal-item mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6D28D9] block mb-5">
            Creator Stories
          </span>
          <h2 className="font-sans font-black text-[#18122B] text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Bukan cuma kamu<br />
            yang ngerasain ini.
          </h2>
          <p className="mt-4 text-[12px] text-[#18122B]/30 italic">
            Berdasarkan wawancara dengan creator Indonesia.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {STORIES.map(({ theme, quote, name, handle, niche }) => (
            <div
              key={handle}
              className="reveal-item bg-white rounded-2xl p-6 flex flex-col gap-4"
            >
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6D28D9]/60">
                {theme}
              </span>
              <p className="text-[14px] text-[#18122B]/65 leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="pt-3 border-t border-[#18122B]/6">
                <p className="font-bold text-[#18122B] text-sm">{name}</p>
                <p className="text-[11px] text-[#18122B]/35 mt-0.5">{handle}</p>
                <p className="text-[10px] text-[#6D28D9] mt-1 font-medium">{niche}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
