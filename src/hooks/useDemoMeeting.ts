import { useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { STATUS } from '../lib/status.ts'

export function useDemoMeeting(meetingId: Id<'meetings'>) {
  const meeting = useQuery(api.demo.getMeeting, { meetingId })
  const chunks = useQuery(api.demo.listChunks, { meetingId })
  const items = useQuery(api.work.listWorkItems, { meetingId })
  const artifacts = useQuery(api.work.listArtifacts, { meetingId })
  // Artifacts can arrive later without blocking the transcript or work items.
  const loading = meeting === undefined || chunks === undefined || items === undefined
  const timedOut = useLoadingTimeout(loading)
  const speakers = [...new Set(chunks?.map((chunk) => chunk.speaker).filter((speaker): speaker is string => !!speaker))]
  const showResults = meeting?.status === 'completed' && !!items?.length && !items.some((item) => STATUS[item.status].active)

  return {
    meeting,
    chunks,
    items,
    speakers,
    briefReady: (artifacts?.length ?? 0) > 0,
    showResults,
    connectionFailed: loading && timedOut,
  }
}

function useLoadingTimeout(loading: boolean) {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) return
    const timeout = setTimeout(() => setTimedOut(true), 10_000)
    return () => clearTimeout(timeout)
  }, [loading])

  return timedOut
}
