import { RotateCcw } from 'lucide-react'
import type { WorkItem } from '../lib/status.ts'
import StartDemoButton from './StartDemoButton.tsx'

export default function Results({ items }: { items: WorkItem[] }) {
  const done = (i: WorkItem) => i.status === 'completed' || i.status === 'fallback_used'
  const research = items.filter((i) => i.kind === 'research' && done(i)).length
  const briefs = items.filter((i) => i.kind === 'artifact' && done(i)).length
  const human = items.filter((i) => i.executorType === 'human').length
  const actions = items.filter((i) => i.executorType === 'approval_required')
  const approved = actions.filter((i) => i.status === 'approved').length
  const rejected = actions.filter((i) => i.status === 'rejected').length
  const actionLabel = approved ? 'approved' : rejected ? 'rejected' : 'awaiting approval'
  const actionCount = approved || rejected || actions.length
  return (
    <div className="rounded-box border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold">During this meeting</h3>
        <StartDemoButton className="btn btn-primary btn-sm">
          <RotateCcw size={14} /> Replay
        </StartDemoButton>
      </div>
      <div className="stats stats-vertical mt-3 w-full bg-transparent sm:stats-horizontal">
        <div className="stat">
          <div className="stat-value text-primary">{research}</div>
          <div className="stat-desc">research task{research === 1 ? '' : 's'} completed by AI</div>
        </div>
        <div className="stat">
          <div className="stat-value text-primary">{briefs}</div>
          <div className="stat-desc">brief{briefs === 1 ? '' : 's'} created</div>
        </div>
        <div className="stat">
          <div className="stat-value text-secondary">{human}</div>
          <div className="stat-desc">human task{human === 1 ? '' : 's'} assigned</div>
        </div>
        <div className="stat">
          <div className="stat-value text-warning">{actionCount}</div>
          <div className="stat-desc">action{actionCount === 1 ? '' : 's'} {actionLabel}</div>
        </div>
      </div>
    </div>
  )
}
