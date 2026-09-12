import type { CandidateWorkItem } from './schemas'

const RULES: [RegExp, CandidateWorkItem['executorType'], CandidateWorkItem['kind']][] = [
  [/\b(send|publish|email|pay|post|share|deploy|delete)\b/i, 'approval_required', 'external_action'],
  [/\b(I'll|I will|\w+ will)\b/, 'human', 'task'],
  [/\b(research|check|compare|find out|look up)\b/i, 'agent_auto', 'research'],
  [/\b(brief|summary|summarize|draft|prepare)\b/i, 'agent_auto', 'artifact'],
]

const DEPENDENT_KINDS = new Set<CandidateWorkItem['kind']>(['artifact', 'external_action'])

export function classify(c: CandidateWorkItem): CandidateWorkItem {
  const text = `${c.title} ${c.evidenceQuotes.join(' ')}`
  const rule = RULES.find(([re]) => re.test(text))
  const r: CandidateWorkItem = c.owner
    ? { ...c, executorType: 'human', kind: 'task' }
    : rule
      ? { ...c, executorType: rule[1], kind: rule[2] }
      : c
  return DEPENDENT_KINDS.has(r.kind) ? r : { ...r, dependsOnTitles: [] }
}

export function normalize(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

export function fingerprint(kind: string, title: string) {
  return `${kind}-${normalize(title).join('-')}`
}

export function overlap(a: string, b: string) {
  const wa = new Set(normalize(a))
  const wb = normalize(b)
  if (!wa.size || !wb.length) return 0
  return wb.filter((w) => wa.has(w)).length / Math.max(wa.size, wb.length)
}

const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'they', 'their', 'our', 'also', 'whether', 'that', 'this'])
