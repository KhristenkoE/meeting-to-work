import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import type { CompetitorBrief } from '../../convex/schemas'
import type { WorkItem } from '../lib/status.ts'
import SourceList from './SourceList.tsx'

export default function BriefView({ item, artifact }: { item: WorkItem; artifact: Doc<'artifacts'> }) {
  const brief = artifact.content as CompetitorBrief
  const [depA, depB] = item.dependencyIds
  const a = useQuery(api.work.listSources, depA ? { workItemId: depA } : 'skip')
  const b = useQuery(api.work.listSources, depB ? { workItemId: depB } : 'skip')
  const sources = [...(a ?? []), ...(b ?? [])].filter((s) => brief.sourceIds.includes(s._id))
  return (
    <div className="mt-2 space-y-4">
      <h3 className="text-lg font-semibold">{brief.headline}</h3>
      <p className="text-sm text-base-content/80">{brief.executiveSummary}</p>
      <div className="overflow-x-auto rounded-box border border-base-300/60">
        <table className="table table-sm">
          <thead>
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
      <div className="rounded-r-box border-l-4 border-primary bg-primary/10 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">Recommendation</h4>
        <p className="mt-1 text-sm">{brief.recommendation}</p>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Sources</h4>
        <SourceList sources={a === undefined && b === undefined ? undefined : sources} />
      </div>
      <p className="text-xs text-base-content/50">
        Generated {new Date(artifact.createdAt).toLocaleString('en-GB')}
      </p>
    </div>
  )
}
