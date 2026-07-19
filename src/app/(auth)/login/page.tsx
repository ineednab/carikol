import { LoginForm } from "./_components/LoginForm"

export const metadata = { title: "Masuk — CariKOL" }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">CariKOL</h1>
        <p className="mt-1 text-sm text-zinc-500">Internal tool Buzzeryok</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-zinc-700">Masuk ke akun kamu</h2>
        <LoginForm />
      </div>
    </div>
  )
}
