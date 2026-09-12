import { useMutation } from 'convex/react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../../convex/_generated/api'

export default function StartDemoButton({ className, children }: { className: string; children: ReactNode }) {
  const startDemo = useMutation(api.demo.startDemo)
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function start() {
    setPending(true)
    setError(false)
    try {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10_000))
      const id = await Promise.race([startDemo({}), timeout])
      navigate(`/demo/${id}`)
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button type="button" onClick={start} disabled={pending} className={className}>
        {pending ? <span className="loading loading-spinner" /> : children}
      </button>
      {error && (
        <div className="toast toast-end z-50">
          <div role="alert" className="alert alert-error">
            <span>Could not start the demo</span>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setError(false)}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  )
}
