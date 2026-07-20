"use client"
import { useState } from "react"
import { Check, Copy, MapPin, Users, TrendingUp, Sparkles, MessageCircle } from "lucide-react"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"
import type { AIStudioResult } from "@/modules/creator/actions/generate-ai-studio"

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", other: "Other",
}
const PLATFORM_EMOJI: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", youtube: "▶️", other: "🌐",
}
const TIER_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  nano:  { bg: "bg-zinc-100",   text: "text-zinc-700",   label: "Nano" },
  micro: { bg: "bg-blue-50",    text: "text-blue-700",   label: "Micro" },
  macro: { bg: "bg-violet-100", text: "text-violet-700", label: "Macro" },
  mega:  { bg: "bg-amber-100",  text: "text-amber-700",  label: "Mega" },
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}
function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

interface Props {
  creator: {
    name: string
    username: string
    platform: string
    niche: string
    tier: string
    followerCount: number
    engagementRate: number
    city: string | null
    bio: string | null
    contact: string
    typicalRateMin: number | null
    typicalRateMax: number | null
  }
  studioData: AIStudioResult | null
}

export function MediaKitView({ creator, studioData }: Props) {
  const [copied, setCopied] = useState(false)
  const tier = TIER_COLOR[creator.tier] ?? TIER_COLOR.nano

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Top bar */}
      <div className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <CariKOLLogo size="sm" />
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-5 py-8">

        {/* Hero */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tier.bg} ${tier.text}`}>
                  {tier.label} Creator
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {PLATFORM_EMOJI[creator.platform]} {PLATFORM_LABEL[creator.platform]}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-zinc-900">{creator.name}</h1>
              <p className="text-sm font-medium text-zinc-400">@{creator.username}</p>
              {creator.city && (
                <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin size={12} /> {creator.city}
                </p>
              )}
              {studioData?.ai?.activitySummary ? (
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{studioData.ai.activitySummary}</p>
              ) : creator.bio ? (
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{creator.bio}</p>
              ) : null}
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-bold text-white">
              {creator.name[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center">
            <Users size={15} className="mx-auto mb-1.5 text-zinc-400" />
            <p className="text-xl font-bold text-zinc-900">{formatFollower(creator.followerCount)}</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center">
            <TrendingUp size={15} className="mx-auto mb-1.5 text-violet-400" />
            <p className="text-xl font-bold text-zinc-900">{creator.engagementRate}%</p>
            <p className="text-xs text-zinc-500">Eng. Rate</p>
          </div>
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center">
            <Sparkles size={15} className="mx-auto mb-1.5 text-amber-400" />
            <p className="text-xl font-bold text-zinc-900">{creator.niche.split(" ")[0]}</p>
            <p className="text-xs text-zinc-500">Niche</p>
          </div>
        </div>

        {studioData ? (
          <>
            {/* AI Observations */}
            {studioData.ai.observations.length > 0 && (
              <div className="rounded-2xl bg-[#1B1B2E] p-6 text-white">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={13} className="text-violet-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">AI Observations</span>
                </div>
                <div className="space-y-3">
                  {studioData.ai.observations.map((obs, i) => (
                    <div key={i} className="rounded-xl bg-white/5 p-3">
                      <p className="text-sm text-zinc-200">{obs.text}</p>
                      <p className="mt-1 text-[10px] text-zinc-500">Evidence: {obs.evidence}</p>
                    </div>
                  ))}
                </div>
                {studioData.ai.strengths.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studioData.ai.strengths.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">
                        <span className="text-green-400">✓</span> {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Brand Fit (deterministic) */}
            {studioData.facts.brandFit.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">Brand Fit</p>
                <div className="space-y-3">
                  {studioData.facts.brandFit.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-700">{item.category}</span>
                        <span className="text-xs font-bold text-zinc-500">{item.score}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.score}%` }} />
                      </div>
                      <p className="mt-0.5 text-[10px] text-zinc-400">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Card */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Creator Pricing</p>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-xl font-bold text-zinc-900">
                  {formatIDR(studioData.facts.rateCard.basePriceMin)}
                </span>
                <span className="text-zinc-400">–</span>
                <span className="text-xl font-bold text-zinc-900">
                  {formatIDR(studioData.facts.rateCard.basePriceMax)}
                </span>
              </div>
              {studioData.ai.rateCardExplanation && (
                <p className="text-xs text-zinc-500">{studioData.ai.rateCardExplanation}</p>
              )}
              <p className="mt-2 text-[10px] text-zinc-400">
                Based on {fmt(studioData.facts.performance.avgViews)} avg views × CPV benchmark for {studioData.facts.profile.tier} tier.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
            <Sparkles size={20} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">AI Studio belum di-generate</p>
            <p className="mt-1 text-xs text-zinc-400">Creator perlu generate AI Studio di portal mereka</p>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-center">
          <MessageCircle size={20} className="mx-auto mb-2 text-violet-500" />
          <p className="mb-1 font-semibold text-zinc-900">Tertarik kolaborasi?</p>
          <p className="mb-4 text-sm text-zinc-500">Hubungi {creator.name} langsung</p>
          <a
            href={
              creator.contact.startsWith("+") || creator.contact.startsWith("08")
                ? `https://wa.me/${creator.contact.replace(/\D/g, "")}`
                : `mailto:${creator.contact}`
            }
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <MessageCircle size={14} />
            Hubungi Sekarang
          </a>
        </div>

        {/* Footer */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 text-center">
          <p className="text-sm font-medium text-zinc-700">Looking for creators?</p>
          <p className="mt-1 text-xs text-zinc-400">Find the right KOL for your brand on CariKOL.</p>
          <a
            href="https://carikol.id"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Explore CariKOL →
          </a>
          <p className="mt-4 text-[10px] text-zinc-300">
            Digital Passport powered by CariKOL — Identity & Intelligence for Creators
          </p>
        </div>
      </div>
    </div>
  )
}
