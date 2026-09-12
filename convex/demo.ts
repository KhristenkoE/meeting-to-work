import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, mutation, query } from './_generated/server'

export const FIXTURE = {
  title: 'Product launch planning — Germany',
  chunks: [
    { speaker: 'Maya', text: "We're launching in Germany next month.", atMs: 0, seq: 0 },
    {
      speaker: 'Noah',
      text: 'Can we check what Linear, Asana and Monday charge, especially the cheapest paid plan?',
      atMs: 6000,
      seq: 1,
    },
    { speaker: 'Maya', text: 'Also check whether they offer SSO.', atMs: 15000, seq: 2 },
    { speaker: 'Noah', text: 'Once we have that, prepare a short competitor brief.', atMs: 24000, seq: 3 },
    { speaker: 'Maya', text: "I'll review pricing tomorrow.", atMs: 34000, seq: 4 },
    { speaker: 'Noah', text: 'Send the summary to the product team.', atMs: 43000, seq: 5 },
  ],
}

export const startDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const meetingId = await ctx.db.insert('meetings', {
      title: FIXTURE.title,
      mode: 'demo',
      status: 'running',
      startedAt: Date.now(),
    })
    for (const chunk of FIXTURE.chunks) {
      await ctx.scheduler.runAfter(chunk.atMs, internal.demo.appendChunk, { meetingId, ...chunk })
    }
    const lastAtMs = FIXTURE.chunks[FIXTURE.chunks.length - 1].atMs
    await ctx.scheduler.runAfter(lastAtMs + 5000, internal.demo.finishMeeting, { meetingId })
    return meetingId
  },
})

export const appendChunk = internalMutation({
  args: {
    meetingId: v.id('meetings'),
    speaker: v.optional(v.string()),
    text: v.string(),
    atMs: v.number(),
    seq: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('transcriptChunks', args)
    await ctx.scheduler.runAfter(0, internal.detect.detectWork, { meetingId: args.meetingId })
  },
})

export const finishMeeting = internalMutation({
  args: { meetingId: v.id('meetings') },
  handler: async (ctx, { meetingId }) => {
    await ctx.db.patch(meetingId, { status: 'completed', endedAt: Date.now() })
  },
})

export const getMeeting = query({
  args: { meetingId: v.id('meetings') },
  handler: (ctx, { meetingId }) => ctx.db.get(meetingId),
})

export const listChunks = query({
  args: { meetingId: v.id('meetings') },
  handler: (ctx, { meetingId }) =>
    ctx.db
      .query('transcriptChunks')
      .withIndex('by_meeting_seq', (q) => q.eq('meetingId', meetingId))
      .collect(),
})
