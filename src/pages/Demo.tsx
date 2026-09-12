import { useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
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
  const speakers = [...new Set(chunks?.map((c) => c.speaker).filter((s): s is string => !!s))]
  const showResults = meeting?.status === 'completed' && !!items?.length && !items.some((i) => STATUS[i.status].active)
  const [selectedId, setSelectedId] = useState<Id<'workItems'> | null>(null)
  const selected = items?.find((i) => i._id === selectedId)
  const loading = meeting === undefined || chunks === undefined || items === undefined
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setTimedOut(true), 10000)
    return () => clearTimeout(t)
  }, [loading])

  return (
    <div className="min-h-screen bg-base-100">
      <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/70 backdrop-blur-md">
        <nav className="navbar mx-auto max-w-7xl gap-4 px-6">
          <Wordmark />
          <div className="flex flex-1 items-center gap-3 border-l border-base-300/60 pl-4">
            {meeting === undefined ? (
              <div className="skeleton h-5 w-56" />
            ) : meeting ? (
              <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="font-semibold">{meeting.title}</h1>
                {meeting.status === 'running' ? (
                  <span className="badge badge-error badge-outline badge-sm gap-1.5">
                    <span className="size-1.5 animate-pulse rounded-full bg-error" /> Live
                  </span>
                ) : (
                  <span className="badge badge-success badge-outline badge-sm">Completed</span>
                )}
                {speakers.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1.5 text-sm text-base-content/70">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold leading-none text-primary">
                      {name[0]}
                    </span>
                    {name}
                  </span>
                ))}
                <p className="basis-full text-xs text-base-content/50">
                  {meeting.status === 'completed'
                    ? 'This meeting has finished. Every item below was detected and handled during the call.'
                    : 'Replay of a recorded meeting. Work is detected and executed live by AI as the conversation unfolds.'}
                </p>
              </div>
            ) : null}
          </div>
          <StartDemoButton className="btn btn-ghost btn-sm">
            <RotateCcw size={14} /> Replay
          </StartDemoButton>
        </nav>
      </header>
      {loading && timedOut ? (
        <main className="mx-auto max-w-md p-16">
          <div role="alert" className="alert alert-error">
            <span>Could not connect to the backend.</span>
            <Link to="/" className="btn btn-sm">Back home</Link>
          </div>
        </main>
      ) : meeting === null ? (
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
                <div className="text-base-content/55">
                  {meeting?.lastError ? (
                    <div role="alert" className="alert alert-warning alert-soft">
                      Work detection is failing: {meeting.lastError}. Replay to try again.
                    </div>
                  ) : meeting?.status === 'running' ? (
                    <>
                      <p className="flex items-center gap-2">
                        Listening for work… <span className="loading loading-dots loading-sm text-primary" />
                      </p>
                      <p className="mt-1 text-sm text-base-content/40">First items usually appear within ~10 seconds.</p>
                    </>
                  ) : (
                    <p>No work items were detected.</p>
                  )}
                </div>
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
