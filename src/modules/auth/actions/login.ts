"use server"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function loginAction(email: string, password: string): Promise<string | null> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" })
    return null
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email atau password salah."
    }
    throw error // re-throw NEXT_REDIRECT so Next.js handles navigation
  }
}
