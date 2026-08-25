import { redirect } from "next/navigation"
import { Lock } from "lucide-react"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { PortalShell } from "@/components/portal/PortalShell"
import { ProfileForm } from "./_components/ProfileForm"

export const metadata = { title: "Profil — CariKOL" }

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ threads?: string }>
}) {
  const { threads } = await searchParams
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.user.creatorId) redirect("/portal/onboarding")

  const creator = await prisma.creator.findUnique({
    where:   { id: session.user.creatorId },
    include: { categories: true },
  })
  if (!creator) redirect("/portal/onboarding")

  return (
    <PortalShell user={{ name: session.user.name, email: creator.contact }}>
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Profil</h1>
          <p className="mt-1 text-sm text-zinc-500">Informasi yang ditampilkan ke brand</p>
        </div>

        {threads === "connected" && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Threads berhasil terhubung.
          </div>
        )}
        {threads === "failed" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Gagal menghubungkan Threads. Coba lagi.
          </div>
        )}
        {threads === "state" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            State OAuth tidak valid. Silakan ulangi proses connect Threads.
          </div>
        )}
        {threads === "denied" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Otorisasi Threads dibatalkan oleh pengguna.
          </div>
        )}
        {threads === "missing_config" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Konfigurasi Threads OAuth belum lengkap di environment.
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-zinc-200/60 bg-white p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <Lock size={11} className="text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Identitas</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-400">Nama</p>
              <p className="mt-0.5 text-sm font-medium text-zinc-900">{creator.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Status</p>
              <p className="mt-0.5 text-sm font-medium text-zinc-900">{creator.isActive ? "Aktif" : "Tidak Aktif"}</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-400">Nama bisa diubah di form di bawah.</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">Edit Profil</p>
          <ProfileForm
            initial={{
              name:       creator.name,
              city:       creator.city ?? "",
              contact:    creator.contact,
              categories: creator.categories.map(c => c.category),
            }}
          />
        </div>
      </div>
    </PortalShell>
  )
}
