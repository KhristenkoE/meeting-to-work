import { RotateCcw } from 'lucide-react'
import type { Doc } from '../../../convex/_generated/dataModel'
import StartDemoButton from '../StartDemoButton.tsx'
import { Wordmark } from '../landing/Nav.tsx'

type Props = {
  meeting: Doc<'meetings'> | null | undefined
  speakers: string[]
}

export default function DemoHeader({ meeting, speakers }: Props) {
  return (
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
  )
}
