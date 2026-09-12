import { Zap } from 'lucide-react'
import { Link } from 'react-router'

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
        <Zap size={16} className="text-white" fill="currentColor" />
      </span>
      Meeting2Work
    </Link>
  )
}

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/70 backdrop-blur-md">
      <nav className="navbar mx-auto max-w-6xl px-6">
        <div className="flex-1">
          <Wordmark />
        </div>
        <div className="flex items-center gap-2">
          <a href="https://github.com/KhristenkoE/meeting-to-work" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            GitHub
          </a>
          <Link to="/demo/placeholder" className="btn btn-primary btn-sm">Try the demo</Link>
        </div>
      </nav>
    </header>
  )
}
