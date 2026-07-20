"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/modules/auth/actions/login"

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})
type FormValues = z.infer<typeof schema>

export default function InternalLoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    const error = await loginAction(data.email, data.password)
    if (error) setServerError(error)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900">CariKOL — Internal</h1>
          <p className="mt-1 text-sm text-zinc-400">Khusus tim Buzzeryok</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}

            {serverError && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              {isSubmitting ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
