import { Bot, CircleHelp, ShieldAlert, User, type LucideIcon } from 'lucide-react'
import type { Doc } from '../../convex/_generated/dataModel'

export type WorkItem = Doc<'workItems'>
export type WorkStatus = WorkItem['status']

export const STATUS: Record<WorkStatus, { label: string; badgeClass: string; active: boolean }> = {
  detected: { label: 'Detected', badgeClass: 'badge-neutral', active: false },
  queued: { label: 'Queued', badgeClass: 'badge-info', active: true },
  searching: { label: 'Searching', badgeClass: 'badge-info', active: true },
  reading_sources: { label: 'Reading sources', badgeClass: 'badge-info', active: true },
  synthesizing: { label: 'Synthesizing', badgeClass: 'badge-info', active: true },
  waiting_dependency: { label: 'Waiting on dependency', badgeClass: 'badge-neutral', active: true },
  waiting_approval: { label: 'Waiting for approval', badgeClass: 'badge-warning', active: false },
  approved: { label: 'Approved', badgeClass: 'badge-success', active: false },
  rejected: { label: 'Rejected', badgeClass: 'badge-error', active: false },
  assigned: { label: 'Assigned', badgeClass: 'badge-secondary', active: false },
  completed: { label: 'Completed', badgeClass: 'badge-success', active: false },
  failed: { label: 'Failed', badgeClass: 'badge-error', active: false },
  fallback_used: { label: 'Fallback used', badgeClass: 'badge-warning', active: false },
}

export const EXECUTOR: Record<WorkItem['executorType'], { label: string; badgeClass: string; Icon: LucideIcon }> = {
  agent_auto: { label: 'AI · Auto', badgeClass: 'badge-primary', Icon: Bot },
  human: { label: 'Human', badgeClass: 'badge-secondary', Icon: User },
  approval_required: { label: 'Needs approval', badgeClass: 'badge-warning', Icon: ShieldAlert },
  clarification_required: { label: 'Needs clarification', badgeClass: 'badge-info', Icon: CircleHelp },
}

export const KIND: Record<WorkItem['kind'], string> = {
  research: 'Research',
  artifact: 'Artifact',
  task: 'Task',
  external_action: 'External action',
  code_execution: 'Code execution',
}

export function dotClass(badgeClass: string) {
  return badgeClass.replace('badge-', 'bg-')
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeDay(at: number) {
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  return rtf.format(days, 'day')
}
