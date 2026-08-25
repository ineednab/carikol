import { Activity } from "lucide-react"
import type { OperationalIntel, Confidence } from "@/lib/decision-intel"

const CONFIDENCE_CFG: Record<Confidence, { cls: string; label: string }> = {
  HIGH:   { cls: "bg-emerald-50 text-emerald-700", label: "HIGH" },
  MEDIUM: { cls: "bg-amber-50 text-amber-700",    label: "MEDIUM" },
  LOW:    { cls: "bg-zinc-100 text-zinc-500",      label: "LOW" },
  NONE:   { cls: "bg-zinc-100 text-zinc-400",      label: "—" },
}

function Stat({
  label, value, sub, dim = false,
}: { label: string; value: string; sub?: string; dim?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${dim ? "opacity-40" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
    </div>
  )
}

interface Props {
  data: OperationalIntel
}

export function OperationalIntel({ data }: Props) {
  const conf = CONFIDENCE_CFG[data.confidence]

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-zinc-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Operational Intelligence</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${conf.cls}`}>
          Confidence {conf.label}
        </span>
      </div>

      {!data.hasCampaigns ? (
        <div className="rounded-xl bg-zinc-50 px-5 py-6 text-center">
          <p className="text-sm font-medium text-zinc-500">Belum ada riwayat kolaborasi</p>
          <p className="mt-1 text-xs text-zinc-400">
            Metrik muncul setelah kampanye pertama selesai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
          <Stat
            label="Completed"
            value={String(data.completedCampaigns)}
            sub={`${data.paidCompleted}P + ${data.barterCompleted}B`}
          />
          <Stat
            label="Outcome Rating"
            value={data.avgRating !== null ? `${data.avgRating}/5` : "—"}
            sub={data.ratingN > 0 ? `n=${data.ratingN}` : "Belum ada review"}
            dim={data.avgRating === null}
          />
          <Stat
            label="Work Again"
            value={data.wouldWorkAgainPct !== null ? `${data.wouldWorkAgainPct}%` : "—"}
            sub={data.wouldWorkAgainN > 0 ? `n=${data.wouldWorkAgainN}` : undefined}
            dim={data.wouldWorkAgainPct === null}
          />
          <Stat
            label="Paid vs Barter"
            value={`${data.paidCompleted} : ${data.barterCompleted}`}
            sub="completed"
          />
        </div>
      )}
    </div>
  )
}
