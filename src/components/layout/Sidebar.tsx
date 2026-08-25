"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Megaphone, Users, Building2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "./UserMenu"

const navItems = [
  { href: "/dashboard", label: "Dashboard",         icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns",          icon: Megaphone },
  { href: "/creators",  label: "Creator Workspace",  icon: Users },
  { href: "/brands",           label: "Brands",              icon: Building2   },
  { href: "/social-accounts", label: "Verify Accounts",     icon: ShieldCheck },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; role?: string | null }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="border-b border-zinc-100 px-4 py-4">
        <span className="text-sm font-semibold text-zinc-900">CariKOL</span>
        <span className="ml-1.5 text-xs text-zinc-400">by Buzzeryok</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-100 px-2 py-3">
        <UserMenu user={user} />
      </div>
    </aside>
  )
}
