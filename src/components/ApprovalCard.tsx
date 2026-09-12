import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { WorkItem } from '../lib/status.ts'

export default function ApprovalCard({ item, briefReady, compact = false }: { item: WorkItem; briefReady: boolean; compact?: boolean }) {
  const approve = useMutation(api.work.approve)
  const reject = useMutation(api.work.reject)
  if (item.status === 'approved')
    return (
      <div role="alert" className="alert alert-success alert-soft text-sm">
        Approved by you — execution would be handed to the connected messaging integration.
      </div>
    )
  if (item.status === 'rejected') return <p className="text-sm text-base-content/50">Rejected by you.</p>
  return (
    <div className="space-y-3 rounded-r-box border-l-4 border-warning bg-warning/10 p-3" onClick={(e) => e.stopPropagation()}>
      {!compact && (
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">Proposed action:</span> {item.description}
          </p>
          <p className="text-base-content/70">
            <span className="font-semibold">Why approval:</span> {item.reason}
          </p>
        </div>
      )}
      <div className={`flex items-center gap-2 ${briefReady ? '' : 'tooltip tooltip-right'}`} data-tip="Waiting for the brief">
        <button type="button" className="btn btn-primary btn-sm" disabled={!briefReady} onClick={() => approve({ workItemId: item._id })}>
          Approve
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!briefReady} onClick={() => reject({ workItemId: item._id })}>
          Reject
        </button>
        {compact && <span className="text-xs text-base-content/60">{briefReady ? 'Brief is ready to send' : 'Waiting for the brief'}</span>}
      </div>
    </div>
  )
}
