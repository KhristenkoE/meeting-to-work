import { Link, useParams } from 'react-router'
import type { Id } from '../../convex/_generated/dataModel'
import DemoHeader from '../components/demo/DemoHeader.tsx'
import TranscriptPanel from '../components/demo/TranscriptPanel.tsx'
import WorkItemsPanel from '../components/demo/WorkItemsPanel.tsx'
import { useDemoMeeting } from '../hooks/useDemoMeeting.ts'
import { useWorkItemSelection } from '../hooks/useWorkItemSelection.ts'

export default function Demo() {
  const meetingId = useParams().meetingId as Id<'meetings'>
  const demo = useDemoMeeting(meetingId)
  const selection = useWorkItemSelection(demo.items)

  return (
    <div className="min-h-screen bg-base-100">
      <DemoHeader meeting={demo.meeting} speakers={demo.speakers} />
      <DemoContent demo={demo} selection={selection} />
    </div>
  )
}

function DemoContent({ demo, selection }: {
  demo: ReturnType<typeof useDemoMeeting>
  selection: ReturnType<typeof useWorkItemSelection>
}) {
  if (demo.connectionFailed) {
    return (
      <main className="mx-auto max-w-md p-16">
        <div role="alert" className="alert alert-error">
          <span>Could not connect to the backend.</span>
          <Link to="/" className="btn btn-sm">Back home</Link>
        </div>
      </main>
    )
  }

  if (demo.meeting === null) {
    return (
      <main className="mx-auto max-w-md p-16 text-center">
        <h2 className="text-2xl font-semibold">Meeting not found</h2>
        <p className="mt-2 text-base-content/55">This meeting doesn't exist or was removed.</p>
        <Link to="/" className="btn btn-primary mt-6">Back home</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-5">
      <TranscriptPanel meeting={demo.meeting} chunks={demo.chunks} />
      <WorkItemsPanel
        meeting={demo.meeting}
        items={demo.items}
        briefReady={demo.briefReady}
        showResults={demo.showResults}
        selectedItem={selection.selectedItem}
        onSelect={selection.selectItem}
        onCloseDetails={selection.closeDetails}
      />
    </main>
  )
}
