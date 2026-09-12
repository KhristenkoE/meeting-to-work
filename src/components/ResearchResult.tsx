import type { ResearchResult as Result } from '../../convex/schemas'
import type { Source } from './SourceList.tsx'

export default function ResearchResult({ result, sources }: { result: Result; sources: Source[] }) {
  const columns = [...new Set(result.findings.flatMap((f) => Object.keys(f.values)))]
  const index = new Map(sources.map((s, i) => [s._id as string, i]))
  return (
    <div>
      <p className="mb-3 text-sm text-base-content/80">{result.summary}</p>
      <div className="overflow-x-auto rounded-lg border border-base-300/60">
        <table className="table table-sm">
          <thead className="bg-base-200">
            <tr>
              <th>Entity</th>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {result.findings.map((f) => (
              <tr key={f.entity}>
                <td className="font-medium">{f.entity}</td>
                {columns.map((c) => (
                  <td key={c} className={f.values[c] ? '' : 'text-base-content/40'}>
                    {f.values[c] ?? 'not found'}
                  </td>
                ))}
                <td className="whitespace-nowrap">
                  {f.sourceIds.map((id) => {
                    const i = index.get(id)
                    return i === undefined ? null : (
                      <a key={id} href={sources[i].url} target="_blank" rel="noreferrer" className="badge badge-ghost badge-xs mr-1 font-mono">
                        {i + 1}
                      </a>
                    )
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.caveats.length > 0 && (
        <div className="collapse collapse-arrow mt-3 border border-base-300/60 bg-base-200/40">
          <input type="checkbox" />
          <div className="collapse-title min-h-0 py-2 text-xs font-medium text-base-content/60">Caveats ({result.caveats.length})</div>
          <div className="collapse-content">
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-base-content/60">
              {result.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
