import { EXECUTOR, KIND, STATUS, dotClass, relativeDay, type WorkItem } from '../lib/status.ts'

export default function WorkCard({ item, onSelect }: { item: WorkItem; onSelect: (item: WorkItem) => void }) {
  const exec = EXECUTOR[item.executorType]
  const status = STATUS[item.status]
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="card w-full cursor-pointer border border-base-300/60 bg-base-200 text-left transition-colors hover:border-primary/50"
    >
      <div className="card-body gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className={`badge badge-sm gap-1 ${exec.badgeClass}`}>
            <exec.Icon size={12} /> {exec.label}
          </span>
          <span className="text-xs text-base-content/50">{KIND[item.kind]}</span>
        </div>
        <h3 className="font-semibold leading-snug">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-base-content/60">{item.description}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-base-content/70">
          {status.active ? (
            <span className="loading loading-dots loading-xs text-info" />
          ) : (
            <span className={`size-2 rounded-full ${dotClass(status.badgeClass)}`} />
          )}
          <span>{status.label}</span>
          {item.executorType === 'human' && item.owner && (
            <span className="ml-auto font-medium text-secondary">
              {item.owner}
              {item.dueAt !== undefined && ` · ${relativeDay(item.dueAt)}`}
            </span>
          )}
          {item.executorType === 'approval_required' && (
            <span className="ml-auto text-warning">Awaiting approval</span>
          )}
        </div>
      </div>
    </button>
  )
}
