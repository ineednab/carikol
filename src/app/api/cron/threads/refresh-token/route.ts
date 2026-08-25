import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { decryptToken, encryptToken } from "@/lib/oauth/token-crypto"

const THREADS_REFRESH_URL = "https://graph.threads.com/refresh_access_token"

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const tokens = await prisma.socialAuthToken.findMany({
    where: {
      provider: "threads",
      socialAccount: { platformId: "threads" },
      OR: [{ tokenExpiresAt: null }, { tokenExpiresAt: { lte: soon } }],
    },
    include: {
      socialAccount: { select: { id: true, username: true, platformId: true } },
    },
    orderBy: { updatedAt: "asc" },
  })

  let refreshed = 0
  let skipped = 0
  const failures: Array<{ accountId: string; reason: string }> = []

  for (const tokenRow of tokens) {
    // Threads API only allows refresh once token is at least 24h old.
    const ageMs = now.getTime() - tokenRow.updatedAt.getTime()
    if (ageMs < 24 * 60 * 60 * 1000) {
      skipped += 1
      continue
    }

    try {
      const accessToken = decryptToken(tokenRow.accessTokenEnc)
      const refreshUrl = new URL(THREADS_REFRESH_URL)
      refreshUrl.searchParams.set("grant_type", "th_refresh_token")
      refreshUrl.searchParams.set("access_token", accessToken)

      const res = await fetch(refreshUrl)
      const body = await res.json()
      if (!res.ok || body.error || !body.access_token) {
        throw new Error(body.error?.message ?? "Refresh response invalid")
      }

      const expiresIn = Number(body.expires_in ?? 0)
      const tokenExpiresAt =
        Number.isFinite(expiresIn) && expiresIn > 0
          ? new Date(now.getTime() + expiresIn * 1000)
          : null

      await prisma.socialAuthToken.update({
        where: { id: tokenRow.id },
        data: {
          accessTokenEnc: encryptToken(body.access_token as string),
          tokenExpiresAt,
        },
      })
      refreshed += 1
    } catch (err) {
      failures.push({
        accountId: tokenRow.socialAccountId,
        reason: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    ok: true,
    processed: tokens.length,
    refreshed,
    skipped,
    failed: failures.length,
    failures,
  })
}
