// Side-effect: muat .env.local & .env ke process.env SEBELUM modul lain
// (mis. lib/ai/client) dievaluasi. WAJIB di-import paling atas di run.ts.
import { readFileSync } from "node:fs"
import { resolve }      from "node:path"

function loadEnvFile(file: string): void {
  let content: string
  try {
    content = readFileSync(resolve(process.cwd(), file), "utf8")
  } catch {
    return
  }
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    if (key in process.env) continue // jangan timpa env yang sudah ada
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")
