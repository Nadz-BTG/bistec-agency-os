# Agency OS

A client/agency management dashboard prototype for BISTEC — built from the "Agency OS Explorations" design concept (light UI, brief pinned left, BISTEC navy/orange/saffron palette).

## Views

- **Home** — portfolio overview: stat tiles (due this week, overdue, waiting on client, shipped) and client cards sorted by what needs attention.
- **Client workspace** — brief, ICPs, positioning and contacts pinned left; engagement narrative, projects and "needs attention" on the right. Tabs for Projects / Tasks / Check-ins / Files.
- **My tasks** — dense, filterable table of every open task across clients.
- **Waiting on client** — the chase queue, sorted by how long something has been sitting with a client, with a bundle-chase callout.
- **Project board** — a kanban board (drag and drop) per project: Backlog → Drafting → With client → Scheduled → Live.
- **Ask Claude** — a slide-over assistant drawer with client context chips and a handful of canned response types (risk summary, chase drafts, next actions, LinkedIn post drafts).
- **New client** — a 3-step wizard: basics, paste-a-brief-and-extract, proposed project structure.
- **Check-ins** — a weekly four-box check-in (went out / came in / outstanding / next priority) per client.

## Data

All client, project, task and check-in data is fictional sample content (`src/data.js`) modeled on the original design exploration. State is persisted to `localStorage` (key `agency-os-state-v1`) — there is no backend.

The "Ask Claude" drawer and the client-onboarding "extract" step use lightweight rule-based mocks, not a real LLM call.

## Running locally

```
npm install
npm run dev
```

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import it into Vercel — it auto-detects Vite, no configuration needed.
3. Deploy.

## Next steps

- Wire the "Ask Claude" drawer and onboarding extraction to a real model.
- Add a backend (Supabase or similar) so state is shared across users instead of per-browser `localStorage`.
- Build out the dark/AI-rail workspace layout (1c in the original exploration) as a selectable theme.
