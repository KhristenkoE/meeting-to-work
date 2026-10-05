// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getFunctionName } from 'convex/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Doc } from '../../convex/_generated/dataModel'
import Demo from './Demo.tsx'

const { queries } = vi.hoisted(() => ({ queries: new Map<string, unknown>() }))
vi.mock('convex/react', () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => queries.get(getFunctionName(reference)),
  useMutation: () => vi.fn(),
}))

const meeting: Doc<'meetings'> = {
  _id: 'meeting-1' as Doc<'meetings'>['_id'],
  _creationTime: 0,
  title: 'Launch planning',
  mode: 'demo',
  status: 'running',
  startedAt: 0,
}

const item: Doc<'workItems'> = {
  _id: 'item-1' as Doc<'workItems'>['_id'],
  _creationTime: 0,
  meetingId: meeting._id,
  fingerprint: 'research',
  title: 'Check pricing',
  description: 'Compare plans',
  executorType: 'agent_auto',
  kind: 'research',
  status: 'searching',
  confidence: 0.9,
  reason: 'Requested in the meeting',
  evidenceQuotes: ['Check pricing'],
  dependencyIds: [],
}

function page() {
  return (
    <MemoryRouter initialEntries={['/demo/meeting-1']}>
      <Routes>
        <Route path="/demo/:meetingId" element={<Demo />} />
      </Routes>
    </MemoryRouter>
  )
}

function loadMeeting(overrides: Partial<Doc<'meetings'>> = {}, items: Doc<'workItems'>[] = []) {
  queries.set('demo:getMeeting', { ...meeting, ...overrides })
  queries.set('demo:listChunks', [])
  queries.set('work:listWorkItems', items)
}

beforeEach(() => {
  queries.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// jsdom doesn't implement scrolling.
Element.prototype.scrollIntoView = () => {}

describe('Demo', () => {
  it('shows both panels while loading, then reports a connection failure after ten seconds', () => {
    render(page())
    expect(screen.getByRole('heading', { name: 'Transcript' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Work items' })).toBeDefined()
    act(() => vi.advanceTimersByTime(9_999))
    expect(screen.queryByRole('alert')).toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('alert').textContent).toContain('Could not connect to the backend.')
    expect(screen.getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe('/')
  })

  it('cancels the timeout when required data loads without waiting for artifacts', () => {
    const view = render(page())
    act(() => vi.advanceTimersByTime(5_000))
    loadMeeting()
    view.rerender(page())
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Listening for work…')).toBeDefined()
  })

  it('recovers when data arrives after the connection timeout', () => {
    const view = render(page())
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.getByRole('alert')).toBeDefined()
    loadMeeting()
    view.rerender(page())
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('heading', { name: meeting.title })).toBeDefined()
  })

  it('cleans up its timer when the page unmounts', () => {
    const view = render(page())
    expect(vi.getTimerCount()).toBe(1)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows a missing meeting immediately, with connection failure taking precedence after timeout', () => {
    queries.set('demo:getMeeting', null)
    render(page())
    expect(screen.getByRole('heading', { name: 'Meeting not found' })).toBeDefined()
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.queryByRole('heading', { name: 'Meeting not found' })).toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('Could not connect')
  })

  it('shows a detection error ahead of the listening state', () => {
    loadMeeting({ lastError: 'Provider unavailable' })
    render(page())
    expect(screen.getByRole('alert').textContent).toContain('Work detection is failing: Provider unavailable')
    expect(screen.queryByText('Listening for work…')).toBeNull()
  })

  it('shows the completed empty state', () => {
    loadMeeting({ status: 'completed' })
    render(page())
    expect(screen.getByText('No work items were detected.')).toBeDefined()
    expect(screen.queryByText('During this meeting')).toBeNull()
  })

  it('lists speakers once, in transcript order, and ignores missing names', () => {
    loadMeeting()
    queries.set('demo:listChunks', ['Maya', undefined, 'Noah', 'Maya', ''].map((speaker, seq) => ({
      _id: `chunk-${seq}`, speaker, text: `Line ${seq}`, atMs: seq * 1000, seq,
    })))
    render(page())
    const names = [...document.querySelectorAll('header nav span.inline-flex')]
      .filter((element) => element.className.includes('text-sm'))
      .map((element) => element.textContent)
    expect(names).toEqual(['MMaya', 'NNoah'])
  })

  it.each(['queued', 'searching', 'reading_sources', 'synthesizing', 'waiting_dependency'] as const)(
    'keeps results hidden for an active %s item in a completed meeting', (status) => {
      loadMeeting({ status: 'completed' }, [{ ...item, status }])
      render(page())
      expect(screen.queryByText('During this meeting')).toBeNull()
    },
  )

  it('shows results only after the meeting ends and every item becomes inactive', () => {
    loadMeeting({}, [{ ...item, status: 'completed' }])
    const view = render(page())
    expect(screen.queryByText('During this meeting')).toBeNull()
    loadMeeting({ status: 'completed' }, [
      { ...item, status: 'completed' },
      { ...item, _id: 'item-2' as typeof item._id, executorType: 'approval_required', status: 'waiting_approval' },
    ])
    view.rerender(page())
    expect(screen.getByText('During this meeting')).toBeDefined()
    expect(screen.getByText('2 work items')).toBeDefined()
  })

  it('keeps details live and supports closing with Escape, the close button, and the backdrop', () => {
    loadMeeting({}, [item])
    const view = render(page())
    fireEvent.click(screen.getByRole('button', { name: /Check pricing/ }))
    expect(screen.getByRole('dialog', { hidden: true })).toBeDefined()
    loadMeeting({}, [{ ...item, title: 'Updated pricing', status: 'completed' }])
    view.rerender(page())
    expect(screen.getByRole('dialog', { hidden: true }).textContent).toContain('Updated pricing')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Updated pricing/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Updated pricing/ }))
    fireEvent.click(document.querySelector('.modal-backdrop')!)
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })

  it('removes details when the selected item disappears', () => {
    loadMeeting({}, [item])
    const view = render(page())
    fireEvent.click(screen.getByRole('button', { name: /Check pricing/ }))
    loadMeeting()
    view.rerender(page())
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })

  it('enables approval only after an artifact arrives', () => {
    loadMeeting({}, [{ ...item, executorType: 'approval_required', status: 'waiting_approval' }])
    const view = render(page())
    expect((screen.getByRole('button', { name: 'Approve' }) as HTMLButtonElement).disabled).toBe(true)
    queries.set('work:listArtifacts', [{ workItemId: item._id }])
    view.rerender(page())
    expect((screen.getByRole('button', { name: 'Approve' }) as HTMLButtonElement).disabled).toBe(false)
  })
})
