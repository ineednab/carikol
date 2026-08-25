"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Send, Loader2 } from "lucide-react"
import { addInternalNoteAction } from "@/modules/creator/actions/update-notes"
import dayjs from "dayjs"

interface Note {
  id:         string
  content:    string
  visibility: string
  createdAt:  Date
  author:     { name: string }
}

interface Props {
  creatorId: string
  notes:     Note[]
}

export function KnowledgeBase({ creatorId, notes }: Props) {
  const [value, setValue]            = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit() {
    if (!value.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addInternalNoteAction({ creatorId, content: value.trim() })
      if (result.success) { setValue(""); router.refresh() }
      else setError(result.error)
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen size={13} className="text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Knowledge Base</p>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-500">
          {notes.length}
        </span>
      </div>

      {notes.length === 0 ? (
        <p className="mb-4 text-xs text-zinc-400">
          Belum ada catatan. Tambahkan pengamatan tim tentang kreator ini.
        </p>
      ) : (
        <div className="mb-4 space-y-2.5">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl bg-zinc-50 px-3.5 py-3">
              <p className="text-[11px] leading-relaxed text-zinc-700">{n.content}</p>
              <p className="mt-1.5 text-[9px] text-zinc-400">
                {n.author.name}
                {n.visibility === "PRIVATE" && (
                  <span className="ml-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-zinc-500">Private</span>
                )}
                {" · "}
                {dayjs(n.createdAt).format("D MMM YYYY")}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Tambah catatan tim..."
          rows={2}
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:bg-white placeholder:text-zinc-300"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending || !value.trim()}
          className="flex items-center gap-1 self-end rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
