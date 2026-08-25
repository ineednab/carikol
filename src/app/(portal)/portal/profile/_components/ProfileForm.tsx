"use client"
import { useState } from "react"
import { Check, RefreshCw } from "lucide-react"
import { updateProfileAction } from "@/modules/creator/actions/update-profile"

const CATEGORIES = [
  "Beauty", "Skincare", "Lifestyle", "Fashion", "Food",
  "Fitness", "Tech", "Gaming", "Travel", "Parenting",
  "Education", "Finance", "Entertainment", "Other",
]

interface Props {
  initial: { name: string; city: string; contact: string; categories: string[] }
}

export function ProfileForm({ initial }: Props) {
  const [name, setName]         = useState(initial.name)
  const [city, setCity]         = useState(initial.city)
  const [contact, setContact]   = useState(initial.contact)
  const [categories, setCategories] = useState<string[]>(initial.categories)
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const toggleCategory = (c: string) =>
    setCategories(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : prev.length < 5 ? [...prev, c] : prev
    )

  const handleSave = async () => {
    if (!name.trim()) { setError("Nama wajib diisi"); return }
    if (!city.trim()) { setError("Kota wajib diisi"); return }
    if (!contact.trim()) { setError("Kontak wajib diisi"); return }
    if (categories.length === 0) { setError("Pilih minimal satu kategori"); return }

    setLoading(true)
    setError(null)
    const res = await updateProfileAction({ name, city, contact, categories })
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
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-500">Nama</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama tampilmu"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
        />
      </div>

      {/* City */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-500">Kota</label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Jakarta, Surabaya, Bandung..."
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-500">Kontak (WA / Email)</label>
        <input
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder="WhatsApp atau email"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-zinc-500">
          Kategori Konten <span className="text-zinc-400">(maks. 5, dipilih {categories.length})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                categories.includes(c)
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              } ${!categories.includes(c) && categories.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {categories.includes(c) && "✓ "}{c}
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
