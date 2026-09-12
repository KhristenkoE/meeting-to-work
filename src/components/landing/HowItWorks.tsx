import { Ear, GitBranch, ListChecks } from 'lucide-react'

const steps = [
  { icon: Ear, title: 'Listen', text: 'Follows the conversation as it happens, line by line.' },
  { icon: ListChecks, title: 'Detect work', text: 'Spots decisions and commitments and turns them into concrete work items.' },
  { icon: GitBranch, title: 'Route & execute', text: 'AI does the safe work now, humans get tasks, sensitive actions wait for approval.' },
]

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-28">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-secondary">How it works</p>
      <h2 className="mt-3 text-center text-4xl font-bold tracking-tight">Talk. Detect work. Execute.</h2>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="card border border-base-300/60 bg-base-200">
            <div className="card-body gap-4">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 text-accent">
                  <Icon size={22} />
                </span>
                <span className="font-mono text-sm text-base-content/40">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-base-content/65">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
