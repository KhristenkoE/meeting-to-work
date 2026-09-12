# Meeting2Work

**Most meeting assistants tell you what happened. Meeting2Work starts doing what happens next.**

An AI execution layer for meetings: it listens to a conversation, detects work, routes each item to AI, a human, or an approval gate, and starts safe AI work immediately.

## Local setup

```bash
npm install
npx convex dev            # or without an account: CONVEX_AGENT_MODE=anonymous npx convex dev
npm run dev
```

`npx convex dev` writes `.env.local` with `VITE_CONVEX_URL` (the only variable the browser sees).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run typecheck` — app, node and convex tsconfigs

## Env

- Convex deployment: `XAI_API_KEY`, `EXA_API_KEY`, `FIRECRAWL_API_KEY`
- Frontend: `VITE_CONVEX_URL`
- Render build command: `npx convex deploy --cmd 'npm run build'` with `CONVEX_DEPLOY_KEY`; publish dir `dist`; SPA rewrite `/* → /index.html`

## Stack

Vite + React + TypeScript · Tailwind v4 + daisyUI v5 · react-router · Convex · Vercel AI SDK (`@ai-sdk/xai`) · exa-js · Firecrawl · Render
