import { PortalSidebar } from "@/components/portal/PortalSidebar"

/**
 * Shell konsisten untuk semua halaman portal talent: sidebar kiri (sama seperti
 * onboarding) + area konten yang bisa di-scroll. Menggantikan top-nav lama.
 */
export function PortalShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; avatarUrl?: string | null }
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      <PortalSidebar user={user} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
