import { xai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { parseDate } from 'chrono-node'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { classify, fingerprint, overlap } from './policy'
import { CandidateWorkItem } from './schemas'

export const MODEL = 'grok-4.20-non-reasoning'

const RULES = `You detect actionable work in a live meeting transcript. Detect work, not discussion.
- Return only NEW items not already covered by the existing items list. Return [] when nothing new.
- One item per coherent task. Group competitors named together into one item (e.g. "Research Linear, Asana and Monday pricing" is ONE item, never three).
- Personal commitments ("I'll…", "<Name> will…") → executorType human, kind task, owner = speaker or named person, dueDateText as spoken.
- Research, analysis, comparing, checking facts → agent_auto, kind research. Research items are independent: dependsOnTitles is always [] for them.
- Drafting, preparing a brief/summary/document → agent_auto, kind artifact; dependsOnTitles lists the research it needs.
- Sending, publishing, emailing, paying, posting → approval_required, kind external_action; dependsOnTitles lists what must exist first.
- Missing target/owner or conflicting → clarification_required.
- evidenceQuotes: verbatim transcript lines. Titles short and imperative.`

export const detectWork = internalAction({
  args: { meetingId: v.id('meetings') },
  handler: async (ctx, { meetingId }) => {
    const { meeting, chunks, items } = await ctx.runQuery(internal.work.detectionContext, { meetingId })
    if (!meeting || !chunks.length) return
    const transcript = chunks.map((c) => `${c.speaker ?? 'Speaker'}: ${c.text}`).join('\n')
    const existing = items.map((i) => `- [${i.kind}] ${i.title}`).join('\n') || '(none)'
    let candidates: CandidateWorkItem[]
    try {
      const { object } = await generateObject({
        model: xai(MODEL),
        output: 'array',
        schema: CandidateWorkItem,
        system: RULES,
        prompt: `Existing items:\n${existing}\n\nTranscript so far:\n${transcript}`,
        abortSignal: AbortSignal.timeout(20000),
      })
      candidates = object
      if (meeting.lastError) await ctx.runMutation(internal.work.setMeetingError, { meetingId })
    } catch (e) {
      console.error('detectWork failed', e)
      await ctx.runMutation(internal.work.setMeetingError, { meetingId, lastError: String(e instanceof Error ? e.message : e).slice(0, 200) })
      return
    }
    const seen = items.map((i) => ({ kind: i.kind, title: i.title, fingerprint: i.fingerprint }))
    const fresh = []
    for (const raw of candidates) {
      const c = classify(raw)
      const fp = fingerprint(c.kind, c.title)
      const dup = seen.some((s) => s.fingerprint === fp || (s.kind === c.kind && overlap(s.title, c.title) >= 0.6))
      if (dup) continue
      seen.push({ kind: c.kind, title: c.title, fingerprint: fp })
      const due = c.dueDateText ? parseDate(c.dueDateText, new Date(meeting.startedAt)) : null
      fresh.push({
        fingerprint: fp,
        title: c.title,
        description: c.description,
        executorType: c.executorType,
        kind: c.kind,
        owner: c.owner,
        dueAt: due?.getTime(),
        confidence: c.confidence,
        reason: c.reason,
        evidenceQuotes: c.evidenceQuotes,
        dependsOnTitles: c.dependsOnTitles,
      })
    }
    if (fresh.length) await ctx.runMutation(internal.work.insertWorkItems, { meetingId, items: fresh })
  },
})
