import { ClipboardCheck, Star } from "lucide-react"
import dayjs from "dayjs"

const WYA_CFG: Record<string, { label: string; cls: string }> = {
  yes:         { label: "Ya, kerja lagi",   cls: "bg-emerald-50 text-emerald-700" },
  no:          { label: "Tidak",            cls: "bg-red-50 text-red-600" },
  conditional: { label: "Kondisional",      cls: "bg-amber-50 text-amber-700" },
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < value ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-200"}
        />
      ))}
    </div>
  )
}

interface Review {
  id:              string
  contentQuality:  number
  communication:   number
  professionalism: number
  wouldWorkAgain:  string
  notes:           string | null
  completedAt:     Date
  campaign:        { name: string; brand: { name: string } }
  completedBy:     { name: string }
}

interface Props {
  outcomeReviews: Review[]
}

export function OutcomeReviewsSection({ outcomeReviews }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardCheck size={13} className="text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Outcome Reviews</p>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500">
          {outcomeReviews.length}
        </span>
      </div>

      {outcomeReviews.length === 0 ? (
        <p className="text-xs text-zinc-400">Belum ada review kampanye selesai.</p>
      ) : (
        <div className="space-y-5">
          {outcomeReviews.map(r => {
            const wya = WYA_CFG[r.wouldWorkAgain] ?? { label: r.wouldWorkAgain, cls: "bg-zinc-100 text-zinc-600" }
            return (
              <div key={r.id} className="border-b border-zinc-50 pb-5 last:border-0 last:pb-0">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-800">{r.campaign.brand.name}</p>
                    <p className="text-[11px] text-zinc-400">{r.campaign.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${wya.cls}`}>
                    {wya.label}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: "Konten",      value: r.contentQuality },
                    { label: "Komunikasi",  value: r.communication },
                    { label: "Profesional", value: r.professionalism },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-[10px] text-zinc-400">{label}</span>
                      <Stars value={value} />
                      <span className="text-[10px] font-bold text-zinc-500">{value}/5</span>
                    </div>
                  ))}
                </div>

                {r.notes && (
                  <p className="mt-3 rounded-xl bg-zinc-50 px-3 py-2.5 text-[11px] leading-relaxed italic text-zinc-600">
                    &ldquo;{r.notes}&rdquo;
                  </p>
                )}

                <p className="mt-2 text-[9px] text-zinc-400">
                  {r.completedBy.name} · {dayjs(r.completedAt).format("D MMM YYYY")}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
