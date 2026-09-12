import { useEffect, useRef } from 'react'

type Chunk = { _id: string; speaker?: string; text: string; atMs: number; seq: number }

export default function Transcript({
  chunks,
  status,
  expectedTotal,
}: {
  chunks: Chunk[]
  status: 'running' | 'completed'
  expectedTotal?: number
}) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [chunks.length])

  const total = status === 'completed' ? chunks.length : expectedTotal
  const last = chunks[chunks.length - 1]

  return (
    <div className="flex flex-col gap-4">
      <progress className="progress progress-primary w-full" value={total ? chunks.length : undefined} max={total} />
      {chunks.length === 0 ? (
        <p className="flex items-center gap-2 text-base-content/55">
          Waiting for the meeting to start… <span className="loading loading-dots loading-sm text-primary" />
        </p>
      ) : (
        <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {chunks.map((c) => {
            const active = status === 'running' && c._id === last?._id
            return (
              <li
                key={c._id}
                className={`rounded-field border-l-2 px-3 py-2 text-sm transition-colors ${
                  active ? 'border-primary bg-base-300/60' : 'border-transparent'
                }`}
              >
                <span className="font-semibold text-primary">{c.speaker}</span>
                <span className="ml-2 font-mono text-xs text-base-content/40">{formatMs(c.atMs)}</span>
                <p className="mt-0.5 text-base-content/80">{c.text}</p>
              </li>
            )
          })}
          <div ref={endRef} />
        </ul>
      )}
    </div>
  )
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
