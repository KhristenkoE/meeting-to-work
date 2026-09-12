import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { EXECUTOR, STATUS, type WorkItem } from '../lib/status.ts'

export default function WorkDetails({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const events = useQuery(api.work.listEvents, { workItemId: item._id })
  const exec = EXECUTOR[item.executorType]
  const status = STATUS[item.status]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl border border-base-300/60 bg-base-200">
        <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3" aria-label="Close">
          ✕
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge badge-sm gap-1 ${exec.badgeClass}`}>
            <exec.Icon size={12} /> {exec.label}
          </span>
          <span className={`badge badge-sm badge-outline ${status.badgeClass}`}>{status.label}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
        <p className="text-sm text-base-content/60">{item.description}</p>

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-base-content/50">Trigger</h4>
        {item.evidenceQuotes.map((q) => (
          <blockquote key={q} className="mt-2 border-l-2 border-secondary pl-3 text-sm italic text-base-content/80">
            “{q}”
          </blockquote>
        ))}

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-base-content/50">Why this route</h4>
        <p className="mt-2 text-sm text-base-content/80">{item.reason}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-base-content/60">
          <progress className="progress progress-primary w-40" value={item.confidence} max={1} />
          {Math.round(item.confidence * 100)}% confidence
        </div>

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-base-content/50">Timeline</h4>
        {events === undefined ? (
          <div className="skeleton mt-2 h-16 w-full" />
        ) : (
          <ul className="timeline timeline-vertical timeline-compact mt-2">
            {events.map((e, i) => (
              <li key={e._id}>
                {i > 0 && <hr />}
                <div className="timeline-start font-mono text-xs text-base-content/40">
                  {new Date(e.createdAt).toLocaleTimeString('en-GB')}
                </div>
                <div className="timeline-middle">
                  <span className="block size-2.5 rounded-full bg-primary" />
                </div>
                <div className="timeline-end pb-3 text-sm">
                  <span className="font-medium">{STATUS[e.type].label}</span>
                  <span className="ml-2 text-base-content/60">{e.message}</span>
                </div>
                {i < events.length - 1 && <hr />}
              </li>
            ))}
          </ul>
        )}

        {item.result !== undefined && (
          <div className="collapse-arrow collapse mt-5 border border-base-300/60 bg-base-300/40">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-medium">Result</div>
            <div className="collapse-content">
              <pre className="overflow-x-auto text-xs">{JSON.stringify(item.result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
