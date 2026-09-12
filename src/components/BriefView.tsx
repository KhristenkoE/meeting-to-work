import { useQuery } from 'convex/react'
import { FileText, Lightbulb, Link, Table } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import type { CompetitorBrief } from '../../convex/schemas'
import type { WorkItem } from '../lib/status.ts'
import Section from './Section.tsx'
import SourceList from './SourceList.tsx'

export default function BriefView({ item, artifact }: { item: WorkItem; artifact: Doc<'artifacts'> }) {
  const brief = artifact.content as CompetitorBrief
  const [depA, depB] = item.dependencyIds
  const a = useQuery(api.work.listSources, depA ? { workItemId: depA } : 'skip')
  const b = useQuery(api.work.listSources, depB ? { workItemId: depB } : 'skip')
  const sources = [...(a ?? []), ...(b ?? [])].filter((s) => brief.sourceIds.includes(s._id))
  return (
    <>
      <Section
        title="Brief"
        icon={FileText}
        aside={<span className="font-mono text-xs text-base-content/50">{new Date(artifact.createdAt).toLocaleString('en-GB')}</span>}
      >
        <h3 className="text-lg font-semibold">{brief.headline}</h3>
        <p className="mt-2 text-sm text-base-content/80">{brief.executiveSummary}</p>
      </Section>
      <Section title="Comparison" icon={Table}>
        <div className="overflow-x-auto rounded-lg border border-base-300/60">
          <table className="table table-sm">
            <thead className="bg-base-200">
              <tr>
                <th>Competitor</th>
                <th>Entry plan</th>
                <th>Price</th>
                <th>SSO</th>
              </tr>
            </thead>
            <tbody>
              {brief.comparison.map((row) => (
                <tr key={row.competitor}>
                  <td className="font-medium">{row.competitor}</td>
                  <td>{row.entryPlan}</td>
                  <td>{row.price}</td>
                  <td>{row.sso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Recommendation" icon={Lightbulb}>
        <div className="rounded-r-box border-l-4 border-primary bg-primary/10 p-3 text-sm">{brief.recommendation}</div>
      </Section>
      <Section title="Sources" icon={Link}>
        <SourceList sources={a === undefined && b === undefined ? undefined : sources} />
      </Section>
    </>
  )
}
