"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Sparkles, User, LogOut, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"

const navItems = [
  { href: "/portal",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/studio",   label: "My Identity", icon: Sparkles },
  { href: "/portal/profile",  label: "Profil",    icon: User },
]

interface Props {
  creator: { name: string; username: string; tier: string }
}



const tierColor: Record<string, string> = {
  nano:  "bg-zinc-100 text-zinc-600",
  micro: "bg-blue-50 text-blue-600",
  macro: "bg-violet-50 text-violet-600",
  mega:  "bg-amber-50 text-amber-600",
}

export function PortalNav({ creator }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/portal">
          <CariKOLLogo size="sm" />
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {[
            ...navItems,
            { href: `/k/${creator.username}`, label: "Media Kit", icon: Globe },
          ].map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Creator info + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-zinc-900">{creator.name}</p>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs text-zinc-400">@{creator.username}</span>
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase", tierColor[creator.tier] ?? tierColor.nano)}>
                {creator.tier}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
