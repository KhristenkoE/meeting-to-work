import { ListChecks } from 'lucide-react'
import type { Doc } from '../../../convex/_generated/dataModel'
import type { WorkItem } from '../../lib/status.ts'
import Results from '../Results.tsx'
import WorkCard from '../WorkCard.tsx'
import WorkDetails from '../WorkDetails.tsx'

type Props = {
  meeting: Doc<'meetings'> | undefined
  items: WorkItem[] | undefined
  briefReady: boolean
  showResults: boolean
  selectedItem: WorkItem | undefined
  onSelect: (item: WorkItem) => void
  onCloseDetails: () => void
}

export default function WorkItemsPanel({ meeting, items, briefReady, showResults, selectedItem, onSelect, onCloseDetails }: Props) {
  return (
    <section className="card border border-base-300/60 bg-base-200 lg:col-span-3">
      <div className="card-body">
        <h2 className="card-title text-base-content/80">
          <ListChecks size={18} className="text-primary" /> Work items
          {items && items.length > 0 && (
            <span className="badge badge-primary badge-outline badge-sm ml-auto">{items.length} work items</span>
          )}
        </h2>
        <WorkItemsContent meeting={meeting} items={items} briefReady={briefReady} showResults={showResults} onSelect={onSelect} />
        {selectedItem && <WorkDetails item={selectedItem} onClose={onCloseDetails} />}
      </div>
    </section>
  )
}

function WorkItemsContent({ meeting, items, briefReady, showResults, onSelect }: Omit<Props, 'selectedItem' | 'onCloseDetails'>) {
  if (items === undefined) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-base-content/55">
        <EmptyWorkItems meeting={meeting} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {showResults && <Results items={items} />}
      {items.map((item) => (
        <WorkCard key={item._id} item={item} briefReady={briefReady} onSelect={onSelect} />
      ))}
    </div>
  )
}

function EmptyWorkItems({ meeting }: { meeting: Props['meeting'] }) {
  if (meeting?.lastError) {
    return (
      <div role="alert" className="alert alert-warning alert-soft">
        Work detection is failing: {meeting.lastError}. Replay to try again.
      </div>
    )
  }

  if (meeting?.status === 'running') {
    return (
      <>
        <p className="flex items-center gap-2">
          Listening for work… <span className="loading loading-dots loading-sm text-primary" />
        </p>
        <p className="mt-1 text-sm text-base-content/40">First items usually appear within ~10 seconds.</p>
      </>
    )
  }

  return <p>No work items were detected.</p>
}
