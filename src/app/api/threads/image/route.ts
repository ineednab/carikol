// Proxy gambar Threads/Instagram CDN lewat origin kita sendiri.
// Kenapa: URL fbcdn/cdninstagram terikat IP/region + bisa kadaluarsa + kadang
// nolak hotlink dari browser. Server sudah terbukti bisa fetch, jadi kita relay
// bytes-nya. Host dibatasi (anti-SSRF) & hanya https.
import type { NextRequest } from "next/server"

const ALLOWED_HOST = /(?:^|\.)(?:fbcdn\.net|cdninstagram\.com)$/

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u")
  if (!raw) return new Response("missing u", { status: 400 })

  let target: URL
  try {
    target = new URL(raw.replace(/&amp;/g, "&"))
  } catch {
    return new Response("bad url", { status: 400 })
  }

  if (target.protocol !== "https:" || !ALLOWED_HOST.test(target.hostname)) {
    return new Response("forbidden host", { status: 403 })
  }

  let upstream: Response
  try {
    upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    return new Response("upstream fetch failed", { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 })
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg"
  if (!contentType.startsWith("image/")) {
    return new Response("not an image", { status: 415 })
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      // Aman di-cache lama: URL kalau berubah otomatis beda cache key.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  })
}
