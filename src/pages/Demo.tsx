import { ListChecks, MessageSquareText } from 'lucide-react'
import { useParams } from 'react-router'
import { Wordmark } from '../components/landing/Nav.tsx'

export default function Demo() {
  const { meetingId } = useParams()
  return (
    <div className="min-h-screen bg-base-100">
      <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/70 backdrop-blur-md">
        <nav className="navbar mx-auto max-w-7xl px-6">
          <div className="flex-1">
            <Wordmark />
          </div>
          <span className="badge badge-ghost badge-sm font-mono text-base-content/50">meeting {meetingId}</span>
        </nav>
      </header>
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-5">
        <section className="card border border-base-300/60 bg-base-200 lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-base-content/80">
              <MessageSquareText size={18} className="text-secondary" /> Transcript
            </h2>
            <p className="text-base-content/55">Transcript lines will appear here as the meeting plays.</p>
          </div>
        </section>
        <section className="card border border-base-300/60 bg-base-200 lg:col-span-3">
          <div className="card-body">
            <h2 className="card-title text-base-content/80">
              <ListChecks size={18} className="text-primary" /> Work items
            </h2>
            <p className="text-base-content/55">Detected work will appear here and update live.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
