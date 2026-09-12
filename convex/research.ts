'use node'
import { xai } from '@ai-sdk/xai'
import Firecrawl from '@mendable/firecrawl-js'
import { generateObject } from 'ai'
import { v } from 'convex/values'
import Exa from 'exa-js'
import { api, internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { MODEL } from './detect'
import { ResearchResult } from './schemas'

const TIMEOUT = 20000
const withTimeout = <T>(p: Promise<T>, label: string) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), TIMEOUT))])

const STRIP = /\b(and|or|if|whether|the|of|for|what|they|their|do|does)\b|[,.?]/gi

function buildQueries(title: string) {
  const words = title.split(/\s+/)
  const entities = [...new Set(words.slice(1).filter((w) => /^[A-Z][a-z]+,?$/.test(w)).map((w) => w.replace(',', '')))]
  const topic = words
    .slice(1)
    .filter((w) => !entities.includes(w.replace(',', '')))
    .join(' ')
    .replace(STRIP, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return entities.length ? entities.slice(0, 4).map((e) => ({ entity: e, query: `${e} ${topic}` })) : [{ entity: '', query: title }]
}

export const runResearch = internalAction({
  args: { workItemId: v.id('workItems') },
  handler: async (ctx, { workItemId }) => {
    const item = await ctx.runQuery(internal.work.getWorkItem, { workItemId })
    if (!item) return
    try {
      await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'searching', message: 'Searching the web with Exa' })
      const exa = new Exa()
      const queries = buildQueries(item.title)
      const found = await Promise.all(
        queries.map(({ entity, query }) =>
          withTimeout(
            exa.search(query, { numResults: 3, type: 'auto', contents: { text: { maxCharacters: 2500 } } }),
            `Exa "${query}"`,
          ).then((r) =>
            r.results
              .map((s) => ({ ...s, official: new URL(s.url).hostname.includes(entity.toLowerCase()) }))
              .sort((a, b) => Number(b.official) - Number(a.official))
              .slice(0, 2),
          ),
        ),
      )
      const seen = new Set<string>()
      const picked = found.flat().filter((s) => !seen.has(s.url) && seen.add(s.url)).slice(0, 6)
      if (!picked.length) throw new Error('Exa returned no results')
      const sourceIds = await ctx.runMutation(internal.work.insertSources, {
        sources: picked.map((s) => ({
          workItemId,
          title: s.title ?? s.url,
          url: s.url,
          snippet: s.text?.slice(0, 300),
          content: s.text,
          provider: 'exa' as const,
        })),
      })
      const thin = picked.map((s, i) => ({ ...s, id: sourceIds[i] })).filter((s) => s.official && (s.text?.length ?? 0) < 800).slice(0, 3)
      if (thin.length) {
        await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'reading_sources', message: 'Reading official pages with Firecrawl' })
        const app = new Firecrawl()
        await Promise.all(
          thin.map(async (s) => {
            const doc = await withTimeout(app.scrape(s.url, { formats: ['markdown'], onlyMainContent: true, timeout: TIMEOUT }), `Firecrawl ${s.url}`).catch(
              (e) => (console.error('firecrawl failed', s.url, e), null),
            )
            if (doc?.markdown) await ctx.runMutation(internal.work.updateSource, { sourceId: s.id, content: doc.markdown.slice(0, 6000), provider: 'firecrawl' })
          }),
        )
      }
      await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'synthesizing', message: 'Synthesizing findings' })
      const sources = await ctx.runQuery(api.work.listSources, { workItemId })
      const corpus = sources.map((s) => `[${s._id}] ${s.title} (${s.url})\n${(s.content ?? '').slice(0, 4000)}`).join('\n\n').slice(0, 15000)
      const { object } = await generateObject({
        model: xai(MODEL),
        schema: ResearchResult,
        system: `You synthesize research findings strictly from the provided sources. Never invent values; write "not found" for anything the sources do not state. Every finding must cite the source ids (the bracketed ids) it came from. One finding per entity; values keys are the dimensions asked for.`,
        prompt: `Task: ${item.title}\n${item.description}\n\nSources:\n${corpus}`,
        abortSignal: AbortSignal.timeout(TIMEOUT),
      })
      await ctx.runMutation(internal.work.completeItem, { workItemId, result: object, message: object.summary.slice(0, 200) })
    } catch (e) {
      console.error('runResearch failed', e)
      await ctx.runMutation(internal.work.setStatus, { workItemId, status: 'failed', message: String(e instanceof Error ? e.message : e).slice(0, 200) })
    }
  },
})
