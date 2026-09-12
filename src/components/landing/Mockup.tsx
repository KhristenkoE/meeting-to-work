import { Bot, Check, ShieldAlert, UserRound } from 'lucide-react'

const lines = [
  ['Maya', "We're launching in Germany next month.", '[--kf:l1]', '[--kf:d1]'],
  ['Noah', 'Can we check what Linear, Asana and Monday charge?', '[--kf:l2]', '[--kf:d2]'],
  ['Maya', "I'll review pricing tomorrow.", '[--kf:l3]', '[--kf:d3]'],
  ['Noah', 'Send the summary to the product team.', '[--kf:l4]', '[--kf:d4]'],
]

export default function Mockup() {
  return (
    <section className="relative mx-auto max-w-5xl px-6">
      <div className="pointer-events-none absolute inset-x-20 top-10 h-full rounded-full bg-primary/15 blur-[100px]" />
      <div className="mockup-browser relative border border-base-300/60 bg-base-200 shadow-2xl shadow-black/40">
        <div className="mockup-browser-toolbar">
          <div className="input input-sm border-base-300 bg-base-100 text-base-content/50">meeting2work.app/demo</div>
        </div>
        <div className="grid min-h-80 grid-cols-5 gap-4 border-t border-base-300/60 bg-base-100 p-5">
          <div className="col-span-2 rounded-box border border-base-300/60 bg-base-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
              <span className="size-2 animate-pulse rounded-full bg-error" /> Live transcript
            </div>
            <ul className="space-y-3 text-sm">
              {lines.map(([who, text, kf, dot], i) => (
                <li key={kf} className={`m2w-anim ${kf} flex items-start gap-2`}>
                  <span className={`m2w-anim ${dot} mt-1.5 shrink-0 ${i < lines.length - 1 ? 'motion-reduce:hidden' : ''}`}>
                    <span className="block size-2 animate-pulse rounded-full bg-secondary" />
                  </span>
                  <span>
                    <span className="font-semibold text-secondary">{who}</span>
                    <span className="text-base-content/70"> — {text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-3 space-y-3">
            <div className="m2w-anim [--kf:c1] card border border-primary/30 bg-base-200">
              <div className="card-body gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm gap-1"><Bot size={12} />AI · Auto</span>
                  <span className="grid *:[grid-area:1/1]">
                    <span className="m2w-anim [--kf:s1] badge badge-ghost badge-sm motion-reduce:hidden">Detected</span>
                    <span className="m2w-anim [--kf:s2] badge badge-outline badge-primary badge-sm gap-1 motion-reduce:hidden">
                      Searching<span className="loading loading-dots loading-xs" />
                    </span>
                    <span className="m2w-anim [--kf:s3] badge badge-success badge-sm gap-1"><Check size={12} />Completed</span>
                  </span>
                </div>
                <h3 className="font-semibold">Research competitor pricing</h3>
                <p className="text-sm text-base-content/60">Reading linear.app, asana.com, monday.com — cheapest paid plan per seat.</p>
              </div>
            </div>
            <div className="m2w-anim [--kf:c2] card border border-base-300/60 bg-base-200">
              <div className="card-body gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="badge badge-secondary badge-sm gap-1"><UserRound size={12} />Human · Maya · tomorrow</span>
                  <span className="badge badge-ghost badge-sm">Assigned</span>
                </div>
                <h3 className="font-semibold">Review pricing</h3>
                <p className="text-sm text-base-content/60">Personal commitment captured from the transcript and assigned.</p>
              </div>
            </div>
            <div className="m2w-anim [--kf:c3] card border border-warning/30 bg-base-200">
              <div className="card-body gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning badge-sm gap-1"><ShieldAlert size={12} />Needs approval</span>
                  <span className="badge badge-outline badge-warning badge-sm">Waiting for approval</span>
                </div>
                <h3 className="font-semibold">Send summary to product team</h3>
                <p className="text-sm text-base-content/60">External side effect — prepared by AI, waiting for a human to approve.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-base-content/50">Someone says it. Meeting2Work starts the work.</p>
    </section>
  )
}
