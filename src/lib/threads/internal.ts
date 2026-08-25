// Helper bersama untuk scraper Threads (post & profile).
// Lihat docs/16-threads-intelligence-pipeline.md

export interface JsonObj { [k: string]: unknown }
export const isObj = (v: unknown): v is JsonObj => typeof v === "object" && v !== null
export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null)

// Recipe fetch tervalidasi 2026-08-10: cookie dummy + header browser membalik
// consent-shell (tanpa data) → halaman berdata (blob Relay lengkap).
export const THREADS_HEADERS: Record<string, string> = {
  "User-Agent":       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept":           "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":  "en-US,en;q=0.9",
  "Sec-Fetch-Dest":   "document",
  "Sec-Fetch-Mode":   "navigate",
  "Sec-Fetch-Site":   "none",
  "Cookie":           "ig_did=1; csrftoken=abc; mid=xyz",   // dummy — cukup lolos consent-gate
}

export async function fetchThreadsHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: THREADS_HEADERS })
  if (!res.ok) throw new Error(`Fetch gagal (HTTP ${res.status}) untuk ${url}`)
  const html = await res.text()
  if (!html.includes("RelayPrefetchedStreamCache")) {
    throw new Error("Dapat consent-shell tanpa data (blob Relay hilang) — cek header/cookie.")
  }
  return html
}

// Ambil semua payload <script type="application/json" ... data-sjs> lalu JSON.parse aman.
export function extractSjsBlobs(html: string): unknown[] {
  const out: unknown[] = []
  const re = /<script type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
  for (const m of html.matchAll(re)) {
    try { out.push(JSON.parse(m[1])) } catch { /* skip blob rusak */ }
  }
  return out
}

// Traversal generik: kumpulkan semua node yang lolos predikat.
export function collect(root: unknown, pred: (o: JsonObj) => boolean, acc: JsonObj[] = []): JsonObj[] {
  if (Array.isArray(root)) { for (const v of root) collect(v, pred, acc); return acc }
  if (isObj(root)) {
    if (pred(root)) acc.push(root)
    for (const v of Object.values(root)) collect(v, pred, acc)
  }
  return acc
}

// Unescape URL ber-slash-escape di JSON Threads (https:\/\/ → https://).
export const unesc = (u: string | null | undefined): string | null =>
  u ? u.replace(/\\\//g, "/") : null
