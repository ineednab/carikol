"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { onboardingAction } from "@/modules/creator/actions/onboarding"
import { generateAIStudioAction } from "@/modules/creator/actions/generate-ai-studio"

const PLATFORMS = [
  { value: "tiktok",    label: "TikTok",    emoji: "🎵" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "youtube",   label: "YouTube",   emoji: "▶️" },
  { value: "other",     label: "Lainnya",   emoji: "🌐" },
]

const TIERS = [
  { value: "nano",  label: "Nano",  range: "Di bawah 10K",   emoji: "🌱" },
  { value: "micro", label: "Micro", range: "10K – 100K",     emoji: "⚡" },
  { value: "macro", label: "Macro", range: "100K – 1 Juta",  emoji: "🚀" },
  { value: "mega",  label: "Mega",  range: "Di atas 1 Juta", emoji: "🌟" },
]

const NICHES = [
  "Beauty & Skincare", "Fashion", "Food & Kuliner", "Lifestyle",
  "Fitness & Health", "Tech & Gadgets", "Gaming", "Travel",
  "Comedy", "Education", "Music", "Finance", "Business", "Lainnya",
]

const BUILDING_STEPS = [
  "Understanding your niche",
  "Analyzing your creator profile",
  "Estimating commercial positioning",
  "Matching suitable brand categories",
  "Preparing your Digital Passport",
]

interface Props {
  prefill: { name: string; email: string; avatarUrl: string }
}

export function OnboardingWizard({ prefill }: Props) {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [platform, setPlatform]   = useState("")
  const [username, setUsername]   = useState("")
  const [tier, setTier]           = useState("")
  const [niches, setNiches]       = useState<string[]>([])
  const [city, setCity]           = useState("")
  const [contact, setContact]     = useState(prefill.email)
  const [error, setError]         = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [buildingStep, setBuildingStep] = useState(0)
  const [creatorUsername, setCreatorUsername] = useState("")

  const progress = step <= 4 ? step * 20 : 100

  const toggleNiche = (n: string) =>
    setNiches((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])

  const handleBuild = async () => {
    if (niches.length === 0) { setFieldError("Pilih minimal satu niche"); return }
    if (!city.trim()) { setFieldError("Kota wajib diisi"); return }
    if (!contact.trim()) { setFieldError("Kontak wajib diisi"); return }

    setFieldError(null)
    setStep(5)

    const slug = username.toLowerCase().replace(/\s/g, "")
    setCreatorUsername(slug)

    // Step 1: save creator to DB
    const result = await onboardingAction({
      name:         prefill.name || username,
      username:     slug,
      platform:     platform as "tiktok" | "instagram" | "youtube" | "other",
      followerTier: tier as "nano" | "micro" | "macro" | "mega",
      niche:        niches.join(", "),
      city,
      contact,
    })

    if (!result.success) {
      setStep(4)
      setError(result.errors._root ?? Object.values(result.errors)[0] ?? "Terjadi kesalahan.")
      return
    }

    // Animate building steps
    for (let i = 0; i < BUILDING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 900))
      setBuildingStep(i + 1)
    }

    // Step 2: generate Creator Identity
    const aiResult = await generateAIStudioAction()

    if (aiResult.success) {
      setStep(6) // success screen
    } else {
      router.push("/portal/studio") // let them generate manually
    }
  }

  // ── Step 6: Success ───────────────────────────────────────────────────────
  if (step === 6) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-zinc-900">Your Creator Identity is ready.</h2>
          <p className="mt-3 text-sm text-zinc-500">You&apos;re now discoverable by brands.</p>

          {platform === "tiktok" && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white text-lg">
                  𝕋
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Connect TikTok</p>
                  <p className="text-xs text-zinc-400">Auto-import followers, stats & videos</p>
                </div>
              </div>
              <Link
                href="/auth/tiktok"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-95"
              >
                Connect TikTok Account
              </Link>
            </div>
          )}

          <Link
            href={`/k/${creatorUsername}`}
            target="_blank"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90"
          >
            <Sparkles size={15} />
            View My Digital Passport
          </Link>
          <p className="mt-4">
            <Link href="/portal/studio" className="text-xs text-zinc-400 hover:text-violet-500">
              Or view full Creator Identity →
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Step 5: Building ──────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F5] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
            <Sparkles size={32} className="text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Creating your Creator Identity...</h2>
          <p className="mt-2 text-sm text-zinc-500">This takes about 15 seconds</p>

          <div className="mt-8 space-y-3 text-left">
            {BUILDING_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                  buildingStep > i ? "bg-green-500" : buildingStep === i ? "bg-violet-200" : "bg-zinc-100"
                }`}>
                  {buildingStep > i
                    ? <Check size={11} className="text-white" />
                    : buildingStep === i
                      ? <RefreshCw size={10} className="text-violet-500 animate-spin" />
                      : null}
                </div>
                <span className={`text-sm transition-colors ${
                  buildingStep > i ? "text-zinc-500 line-through" : buildingStep === i ? "font-medium text-zinc-900" : "text-zinc-300"
                }`}>{s}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
              style={{ width: `${(buildingStep / BUILDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F5] px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 rounded-full bg-zinc-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Step 1: Platform ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Profile from Google */}
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white p-4">
              {prefill.avatarUrl ? (
                <img src={prefill.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                  {prefill.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-zinc-900">{prefill.name || "Creator"}</p>
                <p className="text-xs text-zinc-400">{prefill.email}</p>
              </div>
              <div className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                Google ✓
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-zinc-900">Where do you create?</h1>
              <p className="mt-1 text-sm text-zinc-500">Pick your primary platform</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setPlatform(p.value); setStep(2) }}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white p-5 text-sm font-medium text-zinc-700 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 active:scale-95"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Username ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <button onClick={() => setStep(1)} className="text-xs text-zinc-400 hover:text-zinc-600">← Back</button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                {PLATFORMS.find((p) => p.value === platform)?.emoji} {PLATFORMS.find((p) => p.value === platform)?.label}
              </p>
              <h1 className="mt-1 text-xl font-bold text-zinc-900">What's your handle?</h1>
              <p className="mt-1 text-sm text-zinc-500">The username brands will see</p>
            </div>

            <div className="flex items-center rounded-2xl border-2 border-zinc-200 bg-white px-4 focus-within:border-violet-400">
              <span className="text-lg text-zinc-400">@</span>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                placeholder="yourhandle"
                className="flex-1 py-4 pl-2 text-base font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none bg-transparent"
              />
            </div>
            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}

            <button
              onClick={() => {
                if (!username.trim()) { setFieldError("Username wajib diisi"); return }
                setFieldError(null)
                setStep(3)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-95"
            >
              Continue <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 3: Audience tier ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <button onClick={() => setStep(2)} className="text-xs text-zinc-400 hover:text-zinc-600">← Back</button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">How big is your following?</h1>
              <p className="mt-1 text-sm text-zinc-500">Approximate is fine</p>
            </div>

            <div className="space-y-2.5">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTier(t.value); setStep(4) }}
                  className="flex w-full items-center gap-4 rounded-2xl border-2 border-zinc-200 bg-white p-4 text-left transition hover:border-violet-400 hover:bg-violet-50 active:scale-[0.98]"
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="font-semibold text-zinc-900">{t.label}</p>
                    <p className="text-xs text-zinc-400">{t.range}</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-zinc-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Niche + City + Contact ─────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <button onClick={() => setStep(3)} className="text-xs text-zinc-400 hover:text-zinc-600">← Back</button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Almost there.</h1>
              <p className="mt-1 text-sm text-zinc-500">Help AI understand your content</p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>
            )}

            {/* Niche tags */}
            <div>
              <p className="mb-2.5 text-xs font-semibold text-zinc-500">What do you create?</p>
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

            {/* City */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-500">Based in</p>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta, Surabaya, Bandung..."
                className="h-11 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
              />
            </div>

            {/* Contact */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-500">How can brands reach you?</p>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="WhatsApp atau email"
                className="h-11 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-violet-400 focus:outline-none"
              />
            </div>

            {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}

            <button
              onClick={handleBuild}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 active:scale-95"
            >
              <Sparkles size={15} />
              Build My Creator Identity
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
