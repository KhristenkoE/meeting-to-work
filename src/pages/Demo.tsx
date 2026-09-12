import { useQuery } from 'convex/react'
import { useState } from 'react'
import { ListChecks, MessageSquareText, RotateCcw } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import StartDemoButton from '../components/StartDemoButton.tsx'
import Transcript from '../components/Transcript.tsx'
import WorkCard from '../components/WorkCard.tsx'
import WorkDetails from '../components/WorkDetails.tsx'
import { Wordmark } from '../components/landing/Nav.tsx'
import Results from '../components/Results.tsx'
import { STATUS } from '../lib/status.ts'

export default function Demo() {
  const meetingId = useParams().meetingId as Id<'meetings'>
  const meeting = useQuery(api.demo.getMeeting, { meetingId })
  const chunks = useQuery(api.demo.listChunks, { meetingId })
  const items = useQuery(api.work.listWorkItems, { meetingId })
  const artifacts = useQuery(api.work.listArtifacts, { meetingId })
  const briefReady = (artifacts?.length ?? 0) > 0
  const showResults = meeting?.status === 'completed' && !!items?.length && !items.some((i) => STATUS[i.status].active)
  const [selectedId, setSelectedId] = useState<Id<'workItems'> | null>(null)
  const selected = items?.find((i) => i._id === selectedId)

  return (
    <div className="min-h-screen bg-base-100">
      <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/70 backdrop-blur-md">
        <nav className="navbar mx-auto max-w-7xl gap-4 px-6">
          <Wordmark />
          <div className="flex flex-1 items-center gap-3 border-l border-base-300/60 pl-4">
            {meeting === undefined ? (
              <div className="skeleton h-5 w-56" />
            ) : meeting ? (
              <>
                <h1 className="font-semibold">{meeting.title}</h1>
                {meeting.status === 'running' ? (
                  <span className="badge badge-error badge-outline badge-sm gap-1.5">
                    <span className="size-1.5 animate-pulse rounded-full bg-error" /> Live
                  </span>
                ) : (
                  <span className="badge badge-success badge-outline badge-sm">Completed</span>
                )}
              </>
            ) : null}
          </div>
          <StartDemoButton className="btn btn-ghost btn-sm">
            <RotateCcw size={14} /> Replay
          </StartDemoButton>
        </nav>
      </header>
      {meeting === null ? (
        <main className="mx-auto max-w-md p-16 text-center">
          <h2 className="text-2xl font-semibold">Meeting not found</h2>
          <p className="mt-2 text-base-content/55">This meeting doesn't exist or was removed.</p>
          <Link to="/" className="btn btn-primary mt-6">Back home</Link>
        </main>
      ) : (
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-5">
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
          <section className="card border border-base-300/60 bg-base-200 lg:col-span-3">
            <div className="card-body">
              <h2 className="card-title text-base-content/80">
                <ListChecks size={18} className="text-primary" /> Work items
                {items && items.length > 0 && (
                  <span className="badge badge-primary badge-outline badge-sm ml-auto">{items.length} work items</span>
                )}
              </h2>
              {items === undefined ? (
                <div className="space-y-3">
                  <div className="skeleton h-24 w-full" />
                  <div className="skeleton h-24 w-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="flex items-center gap-2 text-base-content/55">
                  {meeting?.status === 'running' ? (
                    <>
                      Listening for work… <span className="loading loading-dots loading-sm text-primary" />
                    </>
                  ) : (
                    'No work items were detected.'
                  )}
                </p>
              ) : (
                <div className="space-y-3">
                  {showResults && <Results items={items} />}
                  {items.map((item) => (
                    <WorkCard key={item._id} item={item} briefReady={briefReady} onSelect={(i) => setSelectedId(i._id)} />
                  ))}
                </div>
              )}
              {selected && <WorkDetails item={selected} onClose={() => setSelectedId(null)} />}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
