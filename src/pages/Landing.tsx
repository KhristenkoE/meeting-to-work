import { ArrowRight, Bot, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

export default function Landing() {
  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold">Meeting2Work</h1>
          <p className="py-6 text-xl">
            Most meeting assistants tell you what happened. Meeting2Work starts doing what happens next.
          </p>
          <div className="flex items-center justify-center gap-3 pb-8 text-base-content/70">
            <span className="badge badge-lg badge-ghost gap-1"><Bot size={16} />Talk</span>
            <ArrowRight size={16} />
            <span className="badge badge-lg badge-ghost gap-1"><CheckCircle2 size={16} />Detect work</span>
            <ArrowRight size={16} />
            <span className="badge badge-lg badge-ghost gap-1"><ShieldCheck size={16} />Execute / Assign / Ask approval</span>
          </div>
          <Link to="/demo/placeholder" className="btn btn-primary btn-lg">
            Experience sample meeting <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </main>
  )
}
