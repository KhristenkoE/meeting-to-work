import { Bot, ShieldAlert, UserRound } from 'lucide-react'

const lines = [
  ['Maya', "We're launching in Germany next month."],
  ['Noah', 'Can we check what Linear, Asana and Monday charge, especially the cheapest paid plan?'],
  ['Maya', 'Also check whether they offer SSO.'],
  ['Maya', "I'll review pricing tomorrow."],
]

export default function Mockup() {
  return (
    <section className="relative mx-auto max-w-5xl px-6">
      <div className="pointer-events-none absolute inset-x-20 top-10 h-full rounded-full bg-primary/15 blur-[100px]" />
      <div className="mockup-browser relative border border-base-300/60 bg-base-200 shadow-2xl shadow-black/40">
        <div className="mockup-browser-toolbar">
          <div className="input input-sm border-base-300 bg-base-100 text-base-content/50">meeting2work.app/demo</div>
        </div>
        <div className="grid grid-cols-5 gap-4 border-t border-base-300/60 bg-base-100 p-5">
          <div className="col-span-2 rounded-box border border-base-300/60 bg-base-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
              <span className="size-2 rounded-full bg-error animate-pulse" /> Live transcript
            </div>
            <ul className="space-y-3 text-sm">
              {lines.map(([who, text], i) => (
                <li key={i} className={i === lines.length - 1 ? 'rounded-field bg-primary/10 p-2 -m-2 ring-1 ring-primary/30' : ''}>
                  <span className="font-semibold text-secondary">{who}</span>
                  <span className="text-base-content/70"> — {text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-3 space-y-3">
            <div className="card border border-primary/30 bg-base-200">
              <div className="card-body gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm gap-1"><Bot size={12} />AI · Researching</span>
                  <span className="loading loading-dots loading-xs text-primary" />
                </div>
                <h3 className="font-semibold">Research competitor pricing</h3>
                <p className="text-sm text-base-content/60">Reading linear.app, asana.com, monday.com — cheapest paid plan per seat.</p>
              </div>
            </div>
            <div className="card border border-base-300/60 bg-base-200">
              <div className="card-body gap-2 p-4">
                <span className="badge badge-secondary badge-sm w-fit gap-1"><UserRound size={12} />Human · Maya · due tomorrow</span>
                <h3 className="font-semibold">Review pricing</h3>
                <p className="text-sm text-base-content/60">Personal commitment captured from the transcript and assigned.</p>
              </div>
            </div>
            <div className="card border border-warning/30 bg-base-200">
              <div className="card-body gap-2 p-4">
                <span className="badge badge-warning badge-sm w-fit gap-1"><ShieldAlert size={12} />Approval needed</span>
                <h3 className="font-semibold">Send competitor brief to product team</h3>
                <p className="text-sm text-base-content/60">External side effect — prepared by AI, waiting for a human to approve.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
