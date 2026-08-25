import { notFound }          from "next/navigation"
import { ArrowLeft }          from "lucide-react"
import Link                   from "next/link"
import type { Metadata }      from "next"
import { creatorRepository }  from "@/modules/creator/repository/creator.repository"
import { buildDecisionIntel } from "@/lib/decision-intel"
import { IdentitySection }    from "./_components/IdentitySection"
import { OperationalIntel }   from "./_components/OperationalIntel"
import { PlatformIntel }      from "./_components/PlatformIntel"
import { PricingSection }     from "./_components/PricingSection"
import { CampaignHistoryTable }    from "./_components/CampaignHistoryTable"
import { OutcomeReviewsSection }   from "./_components/OutcomeReviewsSection"
import { KnowledgeBase }           from "./_components/KnowledgeBase"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const creator = await creatorRepository.getProfile(id)
  if (!creator) return { title: "Creator — CariKOL" }
  return { title: `${creator.name} — CariKOL` }
}

export default async function CreatorDecisionPage({ params }: Props) {
  const { id } = await params
  const creator = await creatorRepository.getProfile(id)
  if (!creator) notFound()

  const intel = buildDecisionIntel({
    socialAccounts: creator.socialAccounts,
    applications:   creator.applications,
    outcomeReviews: creator.outcomeReviews,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <Link
        href="/creators"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-700"
      >
        <ArrowLeft size={12} /> Semua Creator
      </Link>

      {/* 1 — Identity */}
      <IdentitySection
        name={creator.name}
        city={creator.city}
        contact={creator.contact}
        isActive={creator.isActive}
        acceptsBarter={creator.acceptsBarter}
        minimumFee={creator.minimumFee}
        feeNotes={creator.feeNotes}
        categories={creator.categories}
        socialAccounts={creator.socialAccounts}
      />

      {/* 2 — Operational Intelligence (hero) */}
      <OperationalIntel data={intel.operational} />

      {/* 3 — Platform Intelligence */}
      <PlatformIntel accounts={intel.platforms} />

      {/* 4 — Pricing Intelligence */}
      <PricingSection
        acceptsBarter={creator.acceptsBarter}
        minimumFee={creator.minimumFee}
        feeNotes={creator.feeNotes}
        evidence={intel.pricing}
      />

      {/* 5 — Campaign History */}
      <CampaignHistoryTable applications={creator.applications} />

      {/* 6 — Outcome Reviews */}
      <OutcomeReviewsSection outcomeReviews={creator.outcomeReviews} />

      {/* 7 — Knowledge Base */}
      <KnowledgeBase creatorId={creator.id} notes={creator.internalNotes} />
    </div>
  )
}
