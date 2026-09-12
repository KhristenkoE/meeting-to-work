import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const workStatus = v.union(
  v.literal('detected'),
  v.literal('queued'),
  v.literal('searching'),
  v.literal('reading_sources'),
  v.literal('synthesizing'),
  v.literal('waiting_dependency'),
  v.literal('waiting_approval'),
  v.literal('approved'),
  v.literal('rejected'),
  v.literal('assigned'),
  v.literal('completed'),
  v.literal('failed'),
  v.literal('fallback_used'),
)

export default defineSchema({
  meetings: defineTable({
    title: v.string(),
    mode: v.union(v.literal('demo'), v.literal('live')),
    status: v.union(v.literal('running'), v.literal('completed')),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  }),
  transcriptChunks: defineTable({
    meetingId: v.id('meetings'),
    speaker: v.optional(v.string()),
    text: v.string(),
    atMs: v.number(),
    seq: v.number(),
  }).index('by_meeting_seq', ['meetingId', 'seq']),
  workItems: defineTable({
    meetingId: v.id('meetings'),
    fingerprint: v.string(),
    title: v.string(),
    description: v.string(),
    executorType: v.union(
      v.literal('agent_auto'),
      v.literal('human'),
      v.literal('approval_required'),
      v.literal('clarification_required'),
    ),
    kind: v.union(
      v.literal('research'),
      v.literal('artifact'),
      v.literal('task'),
      v.literal('external_action'),
      v.literal('code_execution'),
    ),
    status: workStatus,
    owner: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    confidence: v.number(),
    reason: v.string(),
    evidenceQuotes: v.array(v.string()),
    dependencyIds: v.array(v.id('workItems')),
    result: v.optional(v.any()),
  })
    .index('by_meeting', ['meetingId'])
    .index('by_meeting_fingerprint', ['meetingId', 'fingerprint']),
  workEvents: defineTable({
    workItemId: v.id('workItems'),
    type: workStatus,
    message: v.string(),
    createdAt: v.number(),
  }).index('by_workItem', ['workItemId']),
  sources: defineTable({
    workItemId: v.id('workItems'),
    title: v.string(),
    url: v.string(),
    snippet: v.optional(v.string()),
    content: v.optional(v.string()),
    provider: v.union(v.literal('exa'), v.literal('firecrawl')),
  }).index('by_workItem', ['workItemId']),
  artifacts: defineTable({
    meetingId: v.id('meetings'),
    workItemId: v.id('workItems'),
    type: v.literal('brief'),
    title: v.string(),
    content: v.any(),
    createdAt: v.number(),
  }).index('by_meeting', ['meetingId']),
})
