import { CariKOLLogo } from "@/components/shared/CariKOLLogo"
import { PlannerForm } from "./_components/PlannerForm"

export const metadata = { title: "AI Campaign Planner — CariKOL" }

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center px-5 py-3">
          <CariKOLLogo size="sm" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            ✨ AI Powered
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">AI Campaign Planner</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Ceritakan produk dan target kamu — AI akan bantu susun strategi campaign KOL yang tepat
          </p>
        </div>

        <PlannerForm />
      </div>
    </div>
  )
}
