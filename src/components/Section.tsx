import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export default function Section({ title, icon: Icon, aside, children }: { title: string; icon?: LucideIcon; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-box border border-base-300/60 bg-base-100/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-base-content/60" />}
        <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">{title}</h4>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </section>
  )
}
