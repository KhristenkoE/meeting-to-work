# Meeting2Work

**Most meeting assistants tell you what happened. Meeting2Work starts doing what happens next.**

An AI execution layer for meetings: it listens to a conversation, detects work, routes each item to AI, a human, or an approval gate, and starts safe AI work immediately.

[Live demo](https://meeting2work.onrender.com/) · [Repo](https://github.com/KhristenkoE/meeting-to-work)

## What it does

- **Listens.** A meeting transcript arrives line by line (server-replayed sample meeting; the same path accepts live speech-to-text).
- **Detects work, not discussion.** After every line, Grok (x.ai) extracts new work items as structured output: title, class, kind, owner, due date, dependencies, verbatim trigger quotes, and a reason.
- **Routes each item.** Safe informational work goes to AI right away, personal commitments become human tasks with owner and due date, external side effects wait behind an approval gate. A deterministic policy overrides the model whenever it proposes something unsafe as auto-run.
- **Executes research with real sources.** Exa finds official pricing and security pages, Firecrawl extracts them, Grok synthesizes findings with source ids. Every source URL is kept and shown.
- **Builds a brief and gates the send.** Once both research items finish, a competitor brief (headline, comparison table, recommendation, sources) is generated. "Send the summary to the product team" is prepared but blocked until you click Approve or Reject. A results panel sums up what the meeting produced.

## Try it in 90 seconds

1. Open [meeting2work.onrender.com](https://meeting2work.onrender.com/) and click **Experience sample meeting**. No login, no microphone.
2. Watch the transcript of "Product launch planning — Germany" appear on the left and work cards appear on the right a few seconds after the line that triggered them.
3. Research cards move Detected → Searching → Reading sources → Synthesizing → Completed with live Exa and Firecrawl calls. The brief card waits on its two dependencies, then runs.
4. Click any card: trigger quote, why this class, execution timeline, sources with real URLs, result. Open the brief for the comparison table.
5. **Approve** or **Reject** the send once the brief exists. Read the results summary. Hit **Replay** to start a fresh meeting. Refreshing mid-run is safe; all state is server-side.

## The core idea: routing

| Class | Meaning | Example from the demo |
|---|---|---|
| `agent_auto` | Safe, reversible, informational. AI starts now. | "Check what Linear, Asana and Monday charge" → research runs immediately |
| `human` | Explicit personal commitment. Becomes a task. | "I'll review pricing tomorrow" → assigned to Maya, due date resolved against meeting date |
| `approval_required` | External side effect. AI prepares, a human approves. | "Send the summary to the product team" → waits for Approve / Reject |
| `clarification_required` | Unclear owner or target, low confidence. | Shown as a question, never guessed |

The model proposes a class; `convex/policy.ts` has the final say. Verbs like send, publish, email, pay, deploy, delete always force `approval_required`. "I'll…" / "X will…" always forces `human`. Items whose title and kind match an existing item are deduplicated by fingerprint before they are stored.

## How it works

```
Browser (React + daisyUI)  ── realtime subscriptions ──▶  Convex
  /                 landing                                 ├─ db + reactive queries
  /demo/:meetingId  transcript · work cards · brief         ├─ mutations: chunks, status, approve / reject
                                                            ├─ scheduler: replays fixture chunks server-side
                                                            └─ actions ("use node")
                                                                 ├─ x.ai  (Vercel AI SDK generateObject + zod)
                                                                 ├─ Exa   (exa-js search with page text)
                                                                 └─ Firecrawl (scrape official pages to markdown)
Render static site hosts the frontend. Convex hosts everything else. Secrets never reach the browser.
```

Pipeline, one Convex function per step:

1. `startDemo` inserts a meeting and schedules six `appendChunk` calls at the fixture's timestamps, plus `finishMeeting` five seconds after the last line.
2. `appendChunk` stores the transcript line and schedules `detectWork`.
3. `detectWork` sends the transcript so far plus the list of existing items to Grok (`generateObject`, array of `CandidateWorkItem`), runs each candidate through `policy.classify`, dedupes by fingerprint and title overlap, resolves `dueDateText` with chrono-node, then `insertWorkItems` decides the initial status: `queued`, `waiting_dependency`, `assigned`, `waiting_approval`, or `detected`.
4. `runResearch`: `searching` (Exa, one query per competitor, capped) → `reading_sources` (Firecrawl on the top pages) → `synthesizing` (`generateObject(ResearchResult)`) → `completed`. Every provider call has a 20 s timeout.
5. `completeItem` runs `resolveDependencies`: any item in `waiting_dependency` whose dependencies are all `completed` is queued and scheduled.
6. `buildBrief` turns both research results into a `CompetitorBrief`, stores it as an artifact, and completes the item.
7. `approve` / `reject` flip the approval item and log the decision.

Every state change is a `workEvent`; the timeline in each card is just that list. The status vocabulary lives in `convex/schema.ts` and `src/lib/status.ts` maps it to labels and badge colors.

## Stack

- Vite · React 19 · TypeScript
- Tailwind v4 · daisyUI v5 (one theme, no custom design system) · lucide-react
- react-router
- Convex: database, realtime queries, scheduler, Node actions
- Vercel AI SDK (`ai` + `@ai-sdk/xai`) with zod schemas, model `grok-4.20-non-reasoning`
- `exa-js` for search, `@mendable/firecrawl-js` for page extraction, `chrono-node` for due dates
- Render static hosting

## Run locally

```bash
npm install
npx convex dev            # or without an account: CONVEX_AGENT_MODE=anonymous npx convex dev
npm run dev
```

`npx convex dev` writes `.env.local` with `VITE_CONVEX_URL`, the only variable the browser sees.

Set provider keys on the Convex deployment (dashboard or `npx convex env set`):

| Variable | Where | Purpose |
|---|---|---|
| `XAI_API_KEY` | Convex | work detection, synthesis, brief |
| `EXA_API_KEY` | Convex | source discovery |
| `FIRECRAWL_API_KEY` | Convex | page extraction |
| `VITE_CONVEX_URL` | frontend | written by `npx convex dev` |

Scripts: `npm run dev` · `npm run build` · `npm run typecheck` (app, node and convex tsconfigs).

## Deploy

`render.yaml` is a Render Blueprint for a static site: build `npx convex deploy --cmd 'npm run build'`, publish `dist`, SPA rewrite `/* → /index.html`. Set `CONVEX_DEPLOY_KEY` (Convex production deploy key) in the Render dashboard; the same build pushes the Convex functions and the frontend.

## What's implemented

- Landing page and demo page with realtime transcript, work cards, card details, brief view, approval card, results summary and replay.
- Server-side replay of the sample meeting via the Convex scheduler; refresh-safe and safe for many simultaneous viewers.
- Structured work extraction with Grok through the Vercel AI SDK, deterministic safety policy, fingerprint and title-overlap dedupe.
- Live research: Exa search → Firecrawl extraction → structured synthesis, sources persisted and linked.
- Dependency resolution between items, competitor brief artifact, human task with resolved due date, approval gate.
- Per-item explainability: trigger quotes, reason, execution timeline.
- Public deploy on Render with Convex production backend.

## Fallbacks and stretch

- When a provider errors or hits the 20 s timeout, the item falls back to a cached snapshot from an earlier real run (`convex/fallback.json`) and is shown with status `fallback_used` and the message "Live providers failed … showing cached results from an earlier run". If no snapshot matches, the item shows `failed` with the error. Never an infinite spinner.
- Approving the send records the decision; no messaging integration is connected, and the card says so.
- Live microphone input (x.ai streaming STT feeding the same `appendChunk`) and a `code_execution` kind (sandboxed CSV → chart) are modeled in the schema but not implemented.
- No auth, workspaces, calendar, or meeting-platform bots.

## Vision

Meetings already produce the work; a person still has to carry it out of the room by hand. Meeting2Work is the execution layer that sits after any transcript source, live or recorded, and dispatches: research and drafting agents start during the call, personal commitments land as tasks in Linear, Jira or Asana, and messages, deploys and payments are prepared but stopped at an approval gate. Approvals are the trust boundary that lets agents act on real systems without anyone losing control. The same router can hand items to engineering, analytics or sales agents with the meeting context attached, so by the time the call ends, the first round of work is already done.
