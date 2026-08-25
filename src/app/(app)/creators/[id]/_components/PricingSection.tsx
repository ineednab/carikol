import { Coins, CheckCircle2, XCircle } from "lucide-react"
import { formatIDR } from "@/lib/format"
import type { PricingEvidence } from "@/lib/decision-intel"

interface Props {
  acceptsBarter: boolean
  minimumFee:    unknown  // Decimal from Prisma
  feeNotes:      string | null
  evidence:      PricingEvidence
}

export function PricingSection({ acceptsBarter, minimumFee, feeNotes, evidence }: Props) {
  const minFeeNum = minimumFee ? Number(minimumFee.toString()) : null

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <Coins size={13} className="text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pricing Intelligence</p>
      </div>

      {/* Stated preference */}
      <div className="mb-4">
        <p className="mb-2.5 text-xs font-semibold text-zinc-600">Stated Preference</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-50 px-3 py-2">
            {acceptsBarter
              ? <CheckCircle2 size={12} className="text-emerald-600" />
              : <XCircle      size={12} className="text-zinc-400" />}
            <span className="text-xs font-semibold text-zinc-700">
              {acceptsBarter ? "Nerima Barter" : "Tidak Nerima Barter"}
            </span>
          </div>

          {minFeeNum ? (
            <div className="rounded-xl bg-zinc-50 px-3 py-2">
              <p className="text-[10px] text-zinc-400">Minimum Fee</p>
              <p className="text-xs font-bold text-zinc-900">{formatIDR(minFeeNum)}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-zinc-50 px-3 py-2 opacity-40">
              <p className="text-[10px] text-zinc-400">Minimum Fee</p>
              <p className="text-xs text-zinc-400">Belum diset</p>
            </div>
          )}
        </div>

        {feeNotes && (
          <p className="mt-2 text-xs italic text-zinc-400">&ldquo;{feeNotes}&rdquo;</p>
        )}
      </div>

      {/* Evidence from completed campaigns */}
      <div className="border-t border-zinc-50 pt-4">
        <p className="mb-2.5 text-xs font-semibold text-zinc-600">Evidence dari Kampanye Selesai</p>

        {evidence.dealCount === 0 && evidence.barterCount === 0 ? (
          <p className="text-xs text-zinc-400">
            Belum ada kampanye selesai — fee range akan muncul setelah kolaborasi pertama.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] text-zinc-400">Paid Deals</p>
              <p className="text-lg font-bold text-zinc-900">{evidence.dealCount}</p>
            </div>

            {evidence.feeMin !== null && evidence.feeMax !== null && (
              <div className="rounded-xl bg-zinc-50 p-3 sm:col-span-2">
                <p className="text-[10px] text-zinc-400">Fee Range Diterima</p>
                <p className="text-sm font-bold text-zinc-900">
                  {formatIDR(evidence.feeMin)} – {formatIDR(evidence.feeMax)}
                </p>
                {evidence.feeMedian !== null && (
                  <p className="text-[10px] text-zinc-400">
                    Median {formatIDR(evidence.feeMedian)}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] text-zinc-400">Barter Selesai</p>
              <p className="text-lg font-bold text-zinc-900">{evidence.barterCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
