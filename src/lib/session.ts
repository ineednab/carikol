import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

const SESSION_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

export async function getDbUser() {
  const authUser = await getAuthUser()
  if (!authUser?.email) return null

  return prisma.user.findUnique({
    where: { email: authUser.email },
  })
}

export async function getSession() {
  const authUser = await getAuthUser()
  if (!authUser?.email) return null

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
    select: SESSION_USER_SELECT,
  })
  if (!dbUser) return null

  return { user: dbUser }
}
