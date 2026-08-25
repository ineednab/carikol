import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { creatorId } = await request.json()

  if (session.user.creatorId !== creatorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.socialAccount.deleteMany({
    where: { creatorId, platformId: "tiktok" },
  })

  return NextResponse.json({ ok: true })
}
