import { z } from 'zod'

export const executorType = z.enum(['agent_auto', 'human', 'approval_required', 'clarification_required'])
export const workKind = z.enum(['research', 'artifact', 'task', 'external_action', 'code_execution'])

export const CandidateWorkItem = z.object({
  title: z.string().describe('Short imperative title, e.g. "Research competitor pricing"'),
  description: z.string(),
  executorType,
  kind: workKind,
  owner: z.string().optional().describe('Person name only when someone explicitly commits'),
  dueDateText: z.string().optional().describe('Due date exactly as spoken, e.g. "tomorrow"'),
  dependsOnTitles: z.array(z.string()).describe('Titles of items this one needs finished first'),
  evidenceQuotes: z.array(z.string()).describe('Verbatim transcript quotes that triggered this item'),
  reason: z.string().describe('One sentence: why this class'),
  confidence: z.number().min(0).max(1),
})
export type CandidateWorkItem = z.infer<typeof CandidateWorkItem>

export const ResearchResult = z.object({
  summary: z.string(),
  findings: z.array(
    z.object({ entity: z.string(), values: z.record(z.string(), z.string()), sourceIds: z.array(z.string()) }),
  ),
  caveats: z.array(z.string()),
})
export type ResearchResult = z.infer<typeof ResearchResult>

export const CompetitorBrief = z.object({
  headline: z.string(),
  executiveSummary: z.string(),
  comparison: z.array(z.object({ competitor: z.string(), entryPlan: z.string(), price: z.string(), sso: z.string() })),
  recommendation: z.string(),
  sourceIds: z.array(z.string()),
})
export type CompetitorBrief = z.infer<typeof CompetitorBrief>
