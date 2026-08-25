"use client"
import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, User, Sparkles, Tag, Briefcase, FileText,
  Lock, LogOut, ClipboardCheck, PanelLeftClose, PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  soon?: boolean
}

const NAV: NavItem[] = [
  { href: "/portal",          label: "Dashboard",        icon: LayoutDashboard },
  { href: "/portal/profile",  label: "Profil Saya",      icon: User },
  { href: "/portal/studio",   label: "Creator Identity", icon: Sparkles },
  { href: "/portal/rate-card",label: "Rate Card",        icon: Tag },
  { href: "/portal/jobs",     label: "Jobs",             icon: Briefcase, soon: true },
  { href: "/portal/applications", label: "Lamaran",      icon: FileText, soon: true },
]

interface Props {
  user: { name?: string | null; email?: string | null; avatarUrl?: string | null }
  /** Onboarding mode: nav locked until profile is complete. */
  locked?: boolean
}

export function PortalSidebar({ user, locked = false }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Header: logo + collapse toggle */}
      <div className={cn(
        "flex h-14 items-center border-b border-zinc-100",
        collapsed ? "justify-center px-0" : "justify-between px-5",
      )}>
        {!collapsed && (
          <Link href={locked ? "#" : "/portal"} className="flex items-center gap-1.5">
            <CariKOLLogo size="sm" />
            <span className="text-[10px] font-medium text-zinc-400">talent</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? "Perlebar menu" : "Perkecil menu"}
          title={collapsed ? "Perlebar menu" : "Perkecil menu"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {locked && (
          <div className="mb-3">
            {!collapsed && (
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Onboarding</p>
            )}
            <span
              title="Lengkapi Profil"
              className={cn(
                "flex items-center rounded-lg bg-violet-50 text-sm font-medium text-violet-700",
                collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
              )}
            >
              <ClipboardCheck size={15} className="shrink-0" />
              {!collapsed && "Lengkapi Profil"}
            </span>
          </div>
        )}

        {locked && !collapsed && (
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Menu</p>
        )}

        {NAV.map(({ href, label, icon: Icon, soon }) => {
          const disabled = locked || soon
          const isActive = !locked && (pathname === href || pathname.startsWith(`${href}/`))

          if (disabled) {
            return (
              <span
                key={href}
                className={cn(
                  "flex items-center rounded-lg text-sm text-zinc-300",
                  collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                )}
                title={soon ? `${label} — segera hadir` : `${label} — selesaikan profil dulu`}
              >
                <Icon size={15} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {soon ? (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">Segera</span>
                    ) : (
                      <Lock size={12} className="shrink-0 text-zinc-300" />
                    )}
                  </>
                )}
              </span>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center rounded-lg text-sm transition-colors",
                collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2",
                isActive
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <div className={cn(
          "flex items-center rounded-lg",
          collapsed ? "justify-center px-0 py-1.5" : "gap-2.5 px-2 py-1.5",
        )}>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" title={user.name ?? undefined} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div title={user.name ?? undefined} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
              {(user.name?.[0] ?? "?").toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-800">{user.name || "Creator"}</p>
                <p className="truncate text-[10px] text-zinc-400">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                aria-label="Keluar"
                title="Keluar"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            onClick={signOut}
            aria-label="Keluar"
            title="Keluar"
            className="mt-1 flex h-8 w-full items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  )
}
