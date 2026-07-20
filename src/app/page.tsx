import type { Metadata } from "next"
import { LandingNav }         from "@/components/landing/LandingNav"
import { Hero }               from "@/components/landing/Hero"
import { Relatable }          from "@/components/landing/Relatable"
import { Vision }             from "@/components/landing/Vision"
import { Testimonials }       from "@/components/landing/Testimonials"
import { Roadmap }            from "@/components/landing/Roadmap"
import { FinalCTA }           from "@/components/landing/FinalCTA"
import { LandingFooter }      from "@/components/landing/LandingFooter"
import { EarlyCreatorsPopup } from "@/components/landing/EarlyCreatorsPopup"

export const metadata: Metadata = {
  title: "CariKOL.id — Stop Proving Yourself from Zero Every Campaign",
  description:
    "Platform untuk creator Indonesia. Profil yang ngomong duluan sebelum kamu — tanpa kirim media kit lagi.",
  openGraph: {
    title: "CariKOL.id",
    description: "Brand baru. Jelasin diri lagi. Dari nol lagi. Nggak seharusnya gini.",
    type: "website",
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <EarlyCreatorsPopup />
      <main>
        <Hero />
        <Relatable />
        <Vision />
        <Testimonials />
        <Roadmap />
        <FinalCTA />
      </main>
      <LandingFooter />
    </>
  )
}
