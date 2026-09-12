import fallback from './fallback.json'

type Source = { title: string; url: string; snippet?: string; content?: string; provider: 'exa' | 'firecrawl' }

export const researchFallback = (title: string) =>
  Object.entries(fallback.research).find(([key]) => title.toLowerCase().includes(key))?.[1] as
    | { result: unknown; sources: Source[] }
    | undefined

export const briefFallback = fallback.brief as { content: unknown }

export const fallbackMessage = (e: unknown) =>
  `Live providers failed (${String(e instanceof Error ? e.message : e).slice(0, 80)}) — showing cached results from an earlier run.`
