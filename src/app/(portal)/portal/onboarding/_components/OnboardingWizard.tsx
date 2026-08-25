"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Check, ChevronDown, ChevronUp, Loader2, Plus, X } from "lucide-react"
import { onboardingAction } from "@/modules/creator/actions/onboarding"
import { PortalSidebar } from "@/components/portal/PortalSidebar"

const INPUT = "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
const LABEL = "block text-[11px] font-semibold text-zinc-600"
const HINT  = "text-[10px] text-zinc-400"
const CARD  = "rounded-2xl border border-zinc-200/70 bg-white p-4"
const SECTION = "text-[10px] font-semibold uppercase tracking-widest text-zinc-400"
const chip = (active: boolean, disabled = false) =>
  `rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
    active
      ? "border-violet-400 bg-violet-50 text-violet-700"
      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
  } ${disabled ? "cursor-not-allowed opacity-40" : ""}`

const CATEGORIES = [
  "Beauty", "Skincare", "Lifestyle", "Fashion", "Food",
  "Fitness", "Tech", "Gaming", "Travel", "Parenting",
  "Education", "Finance", "Entertainment", "Other",
]
const POPULAR_CATEGORIES = CATEGORIES.slice(0, 6)
const REST_CATEGORIES = CATEGORIES.slice(6)

// Deskripsi hanya sebagai tooltip (title) — tidak dirender agar onboarding ringan.
const TALENT_TYPES = [
  { id: "CREATOR",   label: "Creator / Influencer", desc: "Bikin konten reguler di akun sendiri — edukasi, hiburan, atau review." },
  { id: "KOL",       label: "KOL",                  desc: "Punya otoritas di niche tertentu; rekomendasinya dipercaya audiens. Min. 10.000 followers." },
  { id: "AFFILIATE", label: "Affiliate",            desc: "Promosi produk lewat link/kode — pendapatan dari komisi penjualan." },
  { id: "OTHER",     label: "Lainnya",              desc: "Tipe lain yang belum tercakup di atas." },
] as const
type TalentType = typeof TALENT_TYPES[number]["id"]

// Provinsi Indonesia (38, termasuk 4 provinsi baru di Papua)
const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan",
  "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta",
  "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah",
  "Papua Pegunungan", "Papua Barat Daya",
]

// Apa yang terjadi setelah submit (form-nya sendiri = "kirim", jadi tak diulang di sini).
const STEPS = ["Kami verifikasi", "Profil aktif", "Kamu bisa lihat job"]

const BIO_MAX = 200
const MAX_SOCIALS = 6

let ROW_SEQ = 0
const newRow = (): SocialRow => ({ uid: ROW_SEQ++, platformId: "", profileUrl: "" })

type SocialRow = { uid: number; platformId: string; profileUrl: string; oauthDone?: boolean }

type TikTokProfile = {
  openId: string; username: string; displayName: string
  avatarUrl: string | null; profileUrl: string; followerCount: number
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

interface Props {
  prefill: { name: string; email: string; avatarUrl: string }
  platforms: { id: string; name: string }[]
  tiktokProfile?: TikTokProfile | null
}

export function OnboardingWizard({ prefill, platforms, tiktokProfile }: Props) {
  const router = useRouter()

  const [name, setName]           = useState(prefill.name)
  const [bio, setBio]             = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [showAllCats, setShowAllCats] = useState(false)
  const [province, setProvince]   = useState("")
  const [city, setCity]           = useState("")
  const [whatsapp, setWhatsapp]   = useState("")
  const [talentTypes, setTalentTypes] = useState<TalentType[]>([])
  const [socials, setSocials]     = useState<SocialRow[]>(() => [newRow(), newRow()])
  const [agreeTos, setAgreeTos]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  // Restore form state after TikTok OAuth redirect
  useEffect(() => {
    if (!tiktokProfile) return
    const tiktokRow: SocialRow = {
      uid: ROW_SEQ++, platformId: "tiktok",
      profileUrl: tiktokProfile.profileUrl, oauthDone: true,
    }
    const raw = sessionStorage.getItem("carikol_onboarding_draft")
    if (raw) {
      try {
        const d = JSON.parse(raw)
        if (d.name)        setName(d.name)
        if (d.bio)         setBio(d.bio)
        if (d.categories)  setCategories(d.categories)
        if (d.province)    setProvince(d.province)
        if (d.city)        setCity(d.city)
        if (d.whatsapp)    setWhatsapp(d.whatsapp)
        if (d.talentTypes) setTalentTypes(d.talentTypes)
        const others = (d.socials ?? []).filter((s: SocialRow) => s.platformId !== "tiktok")
        setSocials([tiktokRow, ...others.length ? others : [newRow()]])
        sessionStorage.removeItem("carikol_onboarding_draft")
      } catch { setSocials([tiktokRow, newRow()]) }
    } else {
      setSocials([tiktokRow, newRow()])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTikTokOAuth = () => {
    sessionStorage.setItem("carikol_onboarding_draft", JSON.stringify({
      name, bio, categories, province, city, whatsapp, talentTypes, socials,
    }))
    window.location.href = "/auth/tiktok?mode=onboarding"
  }

  const toggleCategory = (c: string) =>
    setCategories(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : prev.length < 5 ? [...prev, c] : prev
    )

  const toggleTalentType = (t: TalentType) =>
    setTalentTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))

  const renderCategoryChip = (c: string) => {
    const on = categories.includes(c)
    return (
      <button key={c} type="button" onClick={() => toggleCategory(c)} className={chip(on, !on && categories.length >= 5)}>
        {on && <Check size={10} className="mr-1 inline" />}{c}
      </button>
    )
  }

  const updateSocial = (i: number, patch: Partial<SocialRow>) =>
    setSocials(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const addSocial = () =>
    setSocials(prev => (prev.length < MAX_SOCIALS ? [...prev, newRow()] : prev))
  const removeSocial = (i: number) =>
    setSocials(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev))

  const handleSubmit = async () => {
    if (!name.trim()) { setFieldError("Nama wajib diisi"); return }
    if (talentTypes.length === 0) { setFieldError("Pilih minimal satu tipe talent"); return }
    if (categories.length === 0) { setFieldError("Pilih minimal satu kategori"); return }
    if (!whatsapp.trim()) { setFieldError("Nomor WhatsApp wajib diisi"); return }

    const filledSocials = socials.filter(s => s.platformId && (s.oauthDone || s.profileUrl.trim()))
    if (filledSocials.length < 2) { setFieldError("Tambahkan minimal 2 akun sosial (platform + link)"); return }
    if (new Set(filledSocials.map(s => s.platformId)).size !== filledSocials.length) {
      setFieldError("Pilih platform berbeda untuk tiap akun"); return
    }
    if (!agreeTos) { setFieldError("Setujui Syarat & Kebijakan Privasi untuk melanjutkan"); return }

    setFieldError(null)
    setError(null)
    setLoading(true)

    const result = await onboardingAction({
      name: name.trim(),
      bio: bio.trim() || undefined,
      categories,
      province: province || undefined,
      city: city.trim() || undefined,
      contact: whatsapp.trim(),
      talentTypes,
      socials: filledSocials.map(s => ({
        platformId: s.platformId,
        profileUrl: s.oauthDone ? s.profileUrl : s.profileUrl.trim(),
      })),
      agreeTos: true,
    })
    setLoading(false)

    if (result.success) {
      router.push("/portal")
    } else {
      const firstErr = Object.values(result.errors)[0]
      setError(firstErr ?? "Terjadi kesalahan.")
    }
  }

  const socialCount = socials.filter(s => s.platformId && (s.oauthDone || s.profileUrl.trim())).length

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      <PortalSidebar locked user={{ name: prefill.name, email: prefill.email, avatarUrl: prefill.avatarUrl }} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lengkapi profil kreatormu</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Isi sekali. Tempel link sosialmu — kami yang verifikasi dan melengkapi datanya.
            </p>
          </div>
          <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-500 lg:block">
            {prefill.email}
          </span>
        </header>

        {/* Body — the only scrollable region */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {/* What happens after you submit */}
          <div className="mx-auto mb-3 max-w-6xl">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-2.5 text-[11px] text-zinc-500">
              <span className="mr-1 font-semibold text-violet-700">Setelah kamu kirim</span>
              {STEPS.map((s, i) => (
                <span key={s} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight size={11} className="text-violet-300" />}
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">{i + 1}</span>
                    {s}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">

            {/* Col 1 — Data diri: siapa kamu */}
            <section className={`${CARD} space-y-3`}>
              <p className={SECTION}>Data diri</p>

              <div>
                <label className={LABEL}>Nama / Display Name</label>
                <p className={HINT}>Nama yang dilihat brand — boleh nama panggung.</p>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="cth. Nabnab" className={`mt-1 ${INPUT}`} />
              </div>

              <div>
                <label className={LABEL}>WhatsApp</label>
                <p className={HINT}>Nomor yang dapat dihubungi untuk campaign.</p>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+62 8xx xxxx xxxx" inputMode="tel" className={`mt-1 ${INPUT}`} />
              </div>

              <div>
                <label className={LABEL}>Email <span className="font-normal text-zinc-400">(dari akun Google)</span></label>
                <input value={prefill.email} readOnly disabled className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400" />
              </div>

              <div>
                <label className={LABEL}>Domisili <span className="font-normal text-zinc-400">(opsional)</span></label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="h-10 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                    >
                      <option value="">Provinsi</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Kota" className={INPUT} />
                </div>
                <p className={`mt-1 ${HINT}`}>Digunakan untuk campaign yang membutuhkan lokasi.</p>
              </div>
            </section>

            {/* Col 2 — Tipe & konten: kamu bikin apa */}
            <section className={`${CARD} space-y-3`}>
              <p className={SECTION}>Tipe &amp; konten</p>

              <div>
                <label className={LABEL}>Tipe talent</label>
                <p className={`mb-2 mt-0.5 ${HINT}`}>Bisa pilih lebih dari satu.</p>
                <div className="space-y-1">
                  {TALENT_TYPES.map(t => {
                    const on = talentTypes.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTalentType(t.id)}
                        className={`flex w-full items-start gap-2 rounded-lg border px-2.5 py-1 text-left transition ${
                          on ? "border-violet-400 bg-violet-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                          on ? "border-violet-500 bg-violet-500 text-white" : "border-zinc-300 bg-white"
                        }`}>
                          {on && <Check size={9} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-xs font-semibold ${on ? "text-violet-800" : "text-zinc-700"}`}>{t.label}</span>
                          <span className="block text-[10px] leading-snug text-zinc-400">{t.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className={LABEL}>Kategori konten</label>
                <p className={`mb-2 mt-0.5 ${HINT}`}>
                  Pilih hingga 5 ·{" "}
                  <span className="font-semibold text-zinc-500">{categories.length}/5</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CATEGORIES.map(renderCategoryChip)}
                  {/* Kategori terpilih tetap tampil walau panel tertutup */}
                  {(showAllCats ? REST_CATEGORIES : REST_CATEGORIES.filter(c => categories.includes(c))).map(renderCategoryChip)}
                  {REST_CATEGORIES.some(c => !categories.includes(c)) && (
                    <button
                      type="button"
                      onClick={() => setShowAllCats(v => !v)}
                      className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-zinc-300 px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700"
                    >
                      {showAllCats
                        ? <>Sembunyikan <ChevronUp size={11} /></>
                        : <>+ {REST_CATEGORIES.filter(c => !categories.includes(c)).length} lainnya <ChevronDown size={11} /></>}
                    </button>
                  )}
                </div>
              </div>

            </section>

            {/* Col 3 — Akun sosial + status: di mana kamu aktif */}
            <section className={`${CARD} space-y-3`}>
              <p className={SECTION}>Akun sosial</p>

              <div>
                <label className={LABEL}>Hubungkan akun sosial</label>
                <p className={`mb-2 mt-0.5 ${HINT}`}>
                  Minimal 2 platform berbeda. Cukup tempel link profil — kami akan memverifikasi akun dan melengkapi data publikmu.
                </p>
                <div className="space-y-2">
                  {socials.map((s, i) => (
                    <div key={s.uid} className="flex items-center gap-1.5">
                      {s.oauthDone && s.platformId === "tiktok" ? (
                        // TikTok OAuth — connected state
                        <>
                          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3">
                            <Check size={12} className="shrink-0 text-emerald-500" />
                            <span className="text-[11px] font-semibold text-emerald-700">TikTok</span>
                            <span className="text-[11px] text-zinc-600">@{tiktokProfile?.username}</span>
                            {(tiktokProfile?.followerCount ?? 0) > 0 && (
                              <span className="text-[10px] text-zinc-400">{fmtNum(tiktokProfile!.followerCount)} followers</span>
                            )}
                          </div>
                          {socials.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeSocial(i)}
                              aria-label="Hapus akun"
                              className="flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        // Normal row
                        <>
                          <select
                            value={s.platformId}
                            onChange={e => updateSocial(i, { platformId: e.target.value, profileUrl: "" })}
                            className="h-9 w-28 shrink-0 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-900 focus:border-violet-400 focus:outline-none"
                          >
                            <option value="">Pilih platform</option>
                            {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          {s.platformId === "tiktok" ? (
                            <button
                              type="button"
                              onClick={handleTikTokOAuth}
                              className="h-9 flex-1 rounded-lg border border-zinc-900 bg-zinc-900 px-3 text-[11px] font-semibold text-white transition hover:bg-zinc-700"
                            >
                              Hubungkan via TikTok →
                            </button>
                          ) : (
                            <input
                              value={s.profileUrl}
                              onChange={e => updateSocial(i, { profileUrl: e.target.value })}
                              placeholder="Tempel link profil"
                              inputMode="url"
                              className="h-9 w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                            />
                          )}
                          {socials.length > 2 && (
                            <button type="button" onClick={() => removeSocial(i)} aria-label="Hapus akun" className="flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                              <X size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {socials.length < MAX_SOCIALS ? (
                    <button type="button" onClick={addSocial} className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-700">
                      <Plus size={12} /> Tambah akun
                    </button>
                  ) : <span />}
                  {socialCount >= 2 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Check size={12} /> {socialCount} akun ditambahkan
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-400">{socialCount}/2 akun</span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <label className={LABEL}>Tentang kamu <span className="font-normal text-zinc-400">(opsional)</span></label>
                <p className={HINT}>Sedikit konteks tentang konten atau positioning-mu.</p>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
                  rows={3}
                  placeholder="Beauty creator, fokus honest review & makeup tutorial..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                />
                <p className={`mt-0.5 text-right ${HINT}`}>{bio.length}/{BIO_MAX}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Sticky footer — consent + submit always visible */}
        <footer className="border-t border-zinc-200 bg-white px-8 py-3">
          {(error || fieldError) && (
            <div className="mx-auto mb-2 flex max-w-6xl items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              <AlertCircle size={14} className="shrink-0" />
              {fieldError ?? error}
            </div>
          )}
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <label className="flex items-start gap-2 text-[11px] leading-snug text-zinc-500">
              <input
                type="checkbox"
                checked={agreeTos}
                onChange={e => setAgreeTos(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 accent-violet-600"
              />
              <span className="max-w-md">
                Saya menyetujui{" "}
                <Link href="/terms" target="_blank" className="font-medium text-violet-600 underline underline-offset-2">Syarat &amp; Ketentuan</Link>
                {" "}&amp;{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-violet-600 underline underline-offset-2">Kebijakan Privasi</Link>.
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={loading || !agreeTos}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:hover:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? "Mengirim..." : "Kirim Profil untuk Verifikasi"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}
