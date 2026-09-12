import type { Doc } from '../../convex/_generated/dataModel'

export type Source = Doc<'sources'>

export default function SourceList({ sources }: { sources: Source[] | undefined }) {
  if (sources === undefined || sources.length === 0)
    return (
      <div className="mt-2 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-5 w-full" />
        ))}
      </div>
    )
  return (
    <ul className="mt-2 space-y-1.5">
      {sources.map((s, i) => {
        const host = new URL(s.url).hostname
        return (
          <li key={s._id} className="flex items-center gap-2 text-sm">
            <span className="w-4 font-mono text-xs text-base-content/40">{i + 1}</span>
            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`} alt="" className="size-4 rounded-sm" />
            <a href={s.url} target="_blank" rel="noreferrer" className="link link-hover truncate font-medium">
              {s.title}
            </a>
            <span className="truncate font-mono text-xs text-base-content/50">{host}</span>
            <span className="badge badge-ghost badge-xs ml-auto shrink-0">{s.provider}</span>
          </li>
        )
      })}
    </ul>
  )
}
