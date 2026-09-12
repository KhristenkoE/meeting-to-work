import { ArrowRight, Sparkles } from 'lucide-react'
import StartDemoButton from '../StartDemoButton.tsx'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
      <div className="pointer-events-none absolute left-[60%] top-[6rem] h-[20rem] w-[30rem] -translate-x-1/2 rounded-full bg-secondary/15 blur-[120px]" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-24 text-center">
        <span className="badge badge-outline badge-primary gap-1.5 border-primary/40 bg-primary/10 py-3 text-primary-content/90">
          <Sparkles size={14} className="text-secondary" />
          AI execution layer for meetings
        </span>
        <h1 className="mt-8 text-6xl font-extrabold leading-[1.02] tracking-tight lg:text-7xl">
          Research, briefs and tasks,{' '}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            done before the meeting ends.
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-xl leading-relaxed text-base-content/65">
          During the meeting it finds what was agreed, does the research and briefs itself, assigns human tasks, and asks before sending anything.
        </p>
        <StartDemoButton className="btn btn-primary btn-lg mt-10 shadow-lg shadow-primary/30">
          Experience sample meeting <ArrowRight size={20} />
        </StartDemoButton>
      </div>
    </section>
  )
}
