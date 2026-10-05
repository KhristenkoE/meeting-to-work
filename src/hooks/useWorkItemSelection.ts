import { useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import type { WorkItem } from '../lib/status.ts'

export function useWorkItemSelection(items: WorkItem[] | undefined) {
  const [selectedId, setSelectedId] = useState<Id<'workItems'> | null>(null)
  // Resolve the ID from each subscription update so an open modal stays live.
  const selectedItem = items?.find((item) => item._id === selectedId)

  function selectItem(item: WorkItem) {
    setSelectedId(item._id)
  }

  function closeDetails() {
    setSelectedId(null)
  }

  return { selectedItem, selectItem, closeDetails }
}
