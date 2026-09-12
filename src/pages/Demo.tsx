import { Link, useParams } from 'react-router'

export default function Demo() {
  const { meetingId } = useParams()
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">Meeting2Work</Link>
        </div>
        <span className="text-xs text-base-content/50">meeting {meetingId}</span>
      </div>
      <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-5">
        <section className="card bg-base-100 shadow-sm lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title">Transcript</h2>
            <p className="text-base-content/60">Transcript lines will appear here as the meeting plays.</p>
          </div>
        </section>
        <section className="card bg-base-100 shadow-sm lg:col-span-3">
          <div className="card-body">
            <h2 className="card-title">Work items</h2>
            <p className="text-base-content/60">Detected work will appear here and update live.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
