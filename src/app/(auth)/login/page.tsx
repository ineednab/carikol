import { LoginForm } from "./_components/LoginForm"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"

export const metadata = { title: "Masuk — CariKOL" }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-[380px]">

        {/* Wordmark */}
        <div className="mb-10 text-center">
          <CariKOLLogo size="lg" className="block" />
          <p className="mt-2 text-sm text-zinc-500">Get discovered by the right brands.</p>
          <p className="mt-1 text-xs text-zinc-400">Build your Creator Identity in under 2 minutes.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm shadow-zinc-200/60">
          <h2 className="mb-1.5 text-center text-base font-semibold text-zinc-900">Daftar atau Masuk</h2>
          <p className="mb-6 text-center text-sm text-zinc-400">Gunakan akun media sosial kamu</p>
          <LoginForm />
        </div>

      </div>
    </div>
  )
}
