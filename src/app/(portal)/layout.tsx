import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.user.role !== "talent") redirect("/")

  return <div className="min-h-screen bg-[#F7F7F5]">{children}</div>
}
