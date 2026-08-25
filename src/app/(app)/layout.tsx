import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.user.role === "talent") redirect("/portal")

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
