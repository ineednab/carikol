"use client"
import { useState } from "react"
import { Check, RefreshCw } from "lucide-react"
import { updateProfileAction } from "@/modules/creator/actions/update-profile"

const NICHES = [
  "Beauty & Skincare", "Fashion", "Food & Kuliner", "Lifestyle",
  "Fitness & Health", "Tech & Gadgets", "Gaming", "Travel",
  "Comedy", "Education", "Music", "Finance", "Business", "Lainnya",
]

interface Props {
  initial: { city: string; contact: string; niche: string }
}

export function ProfileForm({ initial }: Props) {
  const [city, setCity]       = useState(initial.city)
  const [contact, setContact] = useState(initial.contact)
  const [niches, setNiches]   = useState<string[]>(
    initial.niche.split(", ").filter(Boolean)
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const toggleNiche = (n: string) =>
    setNiches((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])

  const handleSave = async () => {
    if (!city.trim()) { setError("Kota wajib diisi"); return }
    if (!contact.trim()) { setError("Kontak wajib diisi"); return }
    if (niches.length === 0) { setError("Pilih minimal satu niche"); return }

    setLoading(true)
    setError(null)
    const res = await updateProfileAction({ city, contact, niche: niches.join(", ") })
    setLoading(false)

    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* City */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-500">Kota</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Jakarta, Surabaya, Bandung..."
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-500">Kontak (WA / Email)</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="WhatsApp atau email"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
        />
      </div>

      {/* Niche */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-zinc-500">Niche Konten</label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleNiche(n)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                niches.includes(n)
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {niches.includes(n) && "✓ "}{n}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? (
          <><RefreshCw size={13} className="animate-spin" /> Menyimpan...</>
        ) : saved ? (
          <><Check size={13} /> Tersimpan!</>
        ) : (
          "Simpan Perubahan"
        )}
      </button>
    </div>
  )
}
