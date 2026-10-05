import { MessageSquareText } from 'lucide-react'
import type { Doc } from '../../../convex/_generated/dataModel'
import Transcript from '../Transcript.tsx'

type Props = {
  meeting: Doc<'meetings'> | undefined
  chunks: Doc<'transcriptChunks'>[] | undefined
}

export default function TranscriptPanel({ meeting, chunks }: Props) {
  return (
    <section className="card border border-base-300/60 bg-base-200 lg:col-span-2">
      <div className="card-body">
        <h2 className="card-title text-base-content/80">
          <MessageSquareText size={18} className="text-secondary" /> Transcript
        </h2>
        {meeting === undefined || chunks === undefined ? (
          <div className="space-y-3">
            <div className="skeleton h-2 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-3/4" />
          </div>
        ) : (
          <Transcript chunks={chunks} status={meeting.status} />
        )}
      </div>
    </section>
  )
}
