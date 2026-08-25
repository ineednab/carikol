"use client"
import { useState } from "react"
import { Check, Copy, MapPin, Users, TrendingUp, Sparkles, MessageCircle } from "lucide-react"
import { CariKOLLogo } from "@/components/shared/CariKOLLogo"

function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface Props {
  creator: {
    name:           string
    categories:     string[]
    city:           string | null
    contact:        string
    platform:       string | null
    username:       string | null
    followerCount:  number | null
    engagementRate: number | null
  }
}

export function MediaKitView({ creator }: Props) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
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

        <div className="rounded-2xl border border-zinc-200/60 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {creator.categories.map(c => (
                  <span key={c} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">{c}</span>
                ))}
                {creator.platform && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">{creator.platform}</span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-zinc-900">{creator.name}</h1>
              {creator.username && (
                <p className="text-sm font-medium text-zinc-400">@{creator.username}</p>
              )}
              {creator.city && (
                <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin size={12} /> {creator.city}
                </p>
              )}
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-bold text-white">
              {creator.name[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {(creator.followerCount != null || creator.engagementRate != null) && (
          <div className="grid grid-cols-2 gap-3">
            {creator.followerCount != null && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center">
                <Users size={15} className="mx-auto mb-1.5 text-zinc-400" />
                <p className="text-xl font-bold text-zinc-900">{formatFollower(creator.followerCount)}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
            )}
            {creator.engagementRate != null && (
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-center">
                <TrendingUp size={15} className="mx-auto mb-1.5 text-violet-400" />
                <p className="text-xl font-bold text-zinc-900">{creator.engagementRate.toFixed(1)}%</p>
                <p className="text-xs text-zinc-500">Eng. Rate</p>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
          <Sparkles size={20} className="mx-auto mb-2 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">AI Studio belum di-generate</p>
          <p className="mt-1 text-xs text-zinc-400">Creator perlu generate AI Studio di portal mereka</p>
        </div>

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

        <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 text-center">
          <p className="text-sm font-medium text-zinc-700">Looking for creators?</p>
          <p className="mt-1 text-xs text-zinc-400">Find the right KOL for your brand on CariKOL.</p>
          <a href="https://carikol.id" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
            Explore CariKOL &rarr;
          </a>
          <p className="mt-4 text-[10px] text-zinc-300">
            Digital Passport powered by CariKOL
          </p>
        </div>
      </div>
    </div>
  )
}
