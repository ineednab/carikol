import { History } from "lucide-react"
import { formatIDR } from "@/lib/format"
import dayjs from "dayjs"

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  APPLIED:           { label: "Applied",       cls: "bg-blue-50 text-blue-700" },
  SELECTED:          { label: "Selected",       cls: "bg-violet-50 text-violet-700" },
  REJECTED:          { label: "Rejected",       cls: "bg-red-50 text-red-500" },
  CONTENT_SUBMITTED: { label: "Konten Masuk",   cls: "bg-amber-50 text-amber-700" },
  CONTENT_APPROVED:  { label: "Konten OK",      cls: "bg-emerald-50 text-emerald-700" },
  COMPLETED:         { label: "Selesai",         cls: "bg-zinc-900 text-white" },
}

const TYPE_CFG: Record<string, { label: string; cls: string }> = {
  PAID:   { label: "PAID",   cls: "bg-zinc-900 text-white" },
  BARTER: { label: "BARTER", cls: "bg-amber-100 text-amber-800" },
}

interface Application {
  id:        string
  status:    string
  appliedAt: Date
  campaign: {
    id:           string
    name:         string
    type:         string
    rewardAmount: number | null
    status:       string
    brand:        { name: string }
  }
  outcome: { contentQuality: number; communication: number; professionalism: number } | null
}

interface Props {
  applications: Application[]
}

export function CampaignHistoryTable({ applications }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <History size={13} className="text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Campaign History</p>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500">
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <p className="text-xs text-zinc-400">Belum ada riwayat kampanye.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50">
                {["Campaign", "Brand", "Type", "Fee", "Status", "Review", "Tanggal"].map(h => (
                  <th key={h} className="pb-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map(a => {
                const st  = STATUS_CFG[a.status] ?? { label: a.status, cls: "bg-zinc-100 text-zinc-600" }
                const tp  = TYPE_CFG[a.campaign.type] ?? { label: a.campaign.type, cls: "bg-zinc-100 text-zinc-600" }
                const avgReview = a.outcome
                  ? ((a.outcome.contentQuality + a.outcome.communication + a.outcome.professionalism) / 3).toFixed(1)
                  : null

                return (
                  <tr key={a.id} className="border-b border-zinc-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="text-xs font-semibold text-zinc-900 whitespace-nowrap max-w-[180px] truncate">
                        {a.campaign.name}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-zinc-600 whitespace-nowrap">{a.campaign.brand.name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tp.cls}`}>
                        {tp.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-semibold text-zinc-700 whitespace-nowrap">
                        {a.campaign.rewardAmount ? formatIDR(a.campaign.rewardAmount) : "—"}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {avgReview
                        ? <span className="text-xs font-semibold text-zinc-700">{avgReview}/5</span>
                        : <span className="text-xs text-zinc-300">—</span>}
                    </td>
                    <td className="py-3">
                      <p className="text-[10px] text-zinc-400 whitespace-nowrap">
                        {dayjs(a.appliedAt).format("D MMM YY")}
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
