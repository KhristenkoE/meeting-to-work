import { xai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { v } from 'convex/values'
import { api, internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { MODEL } from './detect'
import { CompetitorBrief, type ResearchResult } from './schemas'

export const buildBrief = internalAction({
  args: { workItemId: v.id('workItems') },
  handler: async (ctx, { workItemId }) => {
    const item = await ctx.runQuery(internal.work.getWorkItem, { workItemId })
    if (!item) return
    try {
      await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'synthesizing', message: 'Writing the brief from research results' })
      const deps = await Promise.all(item.dependencyIds.map((id) => ctx.runQuery(internal.work.getWorkItem, { workItemId: id })))
      const results = deps.filter((d) => d?.status === 'completed' && d.result)
      if (!results.length) throw new Error('No completed research results to build the brief from')
      const sources = (await Promise.all(results.map((d) => ctx.runQuery(api.work.listSources, { workItemId: d!._id })))).flat()
      const research = results.map((d) => `## ${d!.title}\n${JSON.stringify(d!.result as ResearchResult)}`).join('\n\n')
      const sourceList = sources.map((s) => `[${s._id}] ${s.title} (${s.url})`).join('\n')
      const { object } = await generateObject({
        model: xai(MODEL),
        schema: CompetitorBrief,
        system: `You write a short competitor brief strictly from the provided research results. Never invent values; write "not found" for anything the research does not state. comparison has exactly one row per competitor: Linear, Asana, Monday — entryPlan is the cheapest paid plan name, price its price, sso whether SSO is offered and on which plan. sourceIds lists the bracketed source ids the brief relies on.`,
        prompt: `Task: ${item.title}\n${item.description}\n\nResearch results:\n${research}\n\nSources:\n${sourceList}`,
        abortSignal: AbortSignal.timeout(20000),
      })
      await ctx.runMutation(internal.work.insertArtifact, { meetingId: item.meetingId, workItemId, title: object.headline, content: object })
      await ctx.runMutation(internal.work.completeItem, { workItemId, result: object, message: object.headline.slice(0, 200) })
    } catch (e) {
      console.error('buildBrief failed', e)
      await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'failed', message: String(e instanceof Error ? e.message : e).slice(0, 200) })
    }
  },
})
