"use client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

const roleLabel: Record<string, string> = {
  campaign_manager: "Campaign Manager",
  kol_specialist:   "KOL Specialist",
  admin:            "Admin",
  talent:           "Talent",
}

interface UserMenuProps {
  user: { name?: string | null; email?: string | null; role?: string | null }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  const initials = user.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-50">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-zinc-200 text-xs text-zinc-700">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">
            {user.role ? (roleLabel[user.role] ?? user.role) : ""}
          </p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start">
        <div className="px-1.5 py-1">
          <p className="text-sm font-medium text-zinc-900">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut size={14} />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
