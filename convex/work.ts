import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, internalQuery, query } from './_generated/server'
import { overlap } from './policy'
import { workStatus } from './schema'

export const listWorkItems = query({
  args: { meetingId: v.id('meetings') },
  handler: (ctx, { meetingId }) =>
    ctx.db
      .query('workItems')
      .withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
      .collect(),
})

export const listEvents = query({
  args: { workItemId: v.id('workItems') },
  handler: (ctx, { workItemId }) =>
    ctx.db
      .query('workEvents')
      .withIndex('by_workItem', (q) => q.eq('workItemId', workItemId))
      .collect(),
})

export const listSources = query({
  args: { workItemId: v.id('workItems') },
  handler: (ctx, { workItemId }) =>
    ctx.db
      .query('sources')
      .withIndex('by_workItem', (q) => q.eq('workItemId', workItemId))
      .collect(),
})

export const getWorkItem = internalQuery({
  args: { workItemId: v.id('workItems') },
  handler: (ctx, { workItemId }) => ctx.db.get(workItemId),
})

export const insertSources = internalMutation({
  args: {
    sources: v.array(
      v.object({
        workItemId: v.id('workItems'),
        title: v.string(),
        url: v.string(),
        snippet: v.optional(v.string()),
        content: v.optional(v.string()),
        provider: v.union(v.literal('exa'), v.literal('firecrawl')),
      }),
    ),
  },
  handler: (ctx, { sources }) => Promise.all(sources.map((s) => ctx.db.insert('sources', s))),
})

export const updateSource = internalMutation({
  args: { sourceId: v.id('sources'), content: v.string(), provider: v.union(v.literal('exa'), v.literal('firecrawl')) },
  handler: (ctx, { sourceId, ...patch }) => ctx.db.patch(sourceId, patch),
})

export const completeItem = internalMutation({
  args: { workItemId: v.id('workItems'), result: v.any(), message: v.string() },
  handler: async (ctx, { workItemId, result, message }) => {
    await ctx.db.patch(workItemId, { result, status: 'completed' })
    await ctx.db.insert('workEvents', { workItemId, type: 'completed', message, createdAt: Date.now() })
  },
})

export const detectionContext = internalQuery({
  args: { meetingId: v.id('meetings') },
  handler: async (ctx, { meetingId }) => ({
    meeting: await ctx.db.get(meetingId),
    chunks: await ctx.db
      .query('transcriptChunks')
      .withIndex('by_meeting_seq', (q) => q.eq('meetingId', meetingId))
      .collect(),
    items: await ctx.db
      .query('workItems')
      .withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
      .collect(),
  }),
})

export const setStatus = internalMutation({
  args: { workItemId: v.id('workItems'), status: workStatus, message: v.optional(v.string()) },
  handler: async (ctx, { workItemId, status, message }) => {
    await ctx.db.patch(workItemId, { status })
    await ctx.db.insert('workEvents', { workItemId, type: status, message: message ?? status, createdAt: Date.now() })
  },
})

export const insertWorkItems = internalMutation({
  args: {
    meetingId: v.id('meetings'),
    items: v.array(
      v.object({
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
        owner: v.optional(v.string()),
        dueAt: v.optional(v.number()),
        confidence: v.number(),
        reason: v.string(),
        evidenceQuotes: v.array(v.string()),
        dependsOnTitles: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { meetingId, items }) => {
    const existing = await ctx.db
      .query('workItems')
      .withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
      .collect()
    const known = [...existing]
    for (const { dependsOnTitles, ...item } of items) {
      if (known.some((k) => k.fingerprint === item.fingerprint)) continue
      const deps = known.filter((k) => dependsOnTitles.some((t) => overlap(t, k.title) >= 0.5))
      const unmet = deps.some((d) => d.status !== 'completed')
      const status =
        item.executorType === 'human'
          ? 'assigned'
          : item.executorType === 'approval_required'
            ? 'waiting_approval'
            : item.executorType === 'clarification_required'
              ? 'detected'
              : unmet
                ? 'waiting_dependency'
                : 'queued'
      const workItemId = await ctx.db.insert('workItems', {
        ...item,
        meetingId,
        status: 'detected',
        dependencyIds: deps.map((d) => d._id),
      })
      const now = Date.now()
      await ctx.db.insert('workEvents', { workItemId, type: 'detected', message: item.reason, createdAt: now })
      if (status !== 'detected') {
        await ctx.db.patch(workItemId, { status })
        await ctx.db.insert('workEvents', {
          workItemId,
          type: status,
          message: statusMessage(status, item.owner, deps.map((d) => d.title)),
          createdAt: now + 1,
        })
      }
      if (status === 'queued' && item.kind === 'research') await ctx.scheduler.runAfter(0, internal.research.runResearch, { workItemId })
      known.push((await ctx.db.get(workItemId))!)
    }
  },
})

function statusMessage(status: string, owner: string | undefined, deps: string[]) {
  if (status === 'assigned') return `Assigned to ${owner ?? 'a participant'}`
  if (status === 'waiting_approval') return 'External action — waiting for human approval'
  if (status === 'waiting_dependency') return `Waiting for: ${deps.join(', ')}`
  return 'Queued for AI execution'
}

