# Roadmap

High-level order of work, broken into deliberately small phases. Each phase is shippable and observable; nothing in a later phase is required for an earlier phase to be "done."

## Phase 1 — Walking skeleton ✅ Complete

A vertical slice that proves the stack works end to end.

- Hono app boots, serves one `/` route, returns a JSX page that says "AgentClinic."
- One typed data record (e.g., a hard-coded "Agent") flows from the server into the rendered page.
- Tailwind is wired up and visibly styling the page.
- `pnpm dev` and `pnpm build` both work.

Shipped on branch `2026-05-29-walking-skeleton`. See `specs/2026-05-29-walking-skeleton/` for requirements, plan, and validation.

## Phase 2 — Agent directory

- Static list of agents on a `/agents` page, rendered from the data layer.
- Agent detail page at `/agents/:id`.
- Navigation between home, agent list, and detail.

## Phase 3 — Ailments and therapies

- Model ailments and therapies; relate them to agents.
- Show an agent's ailments on their detail page.
- Show available therapies per ailment.

## Phase 4 — Appointments

- Book an appointment for an agent with a therapy.
- List upcoming appointments on the agent's detail page.
- Minimal form validation; no auth yet.

## Phase 5 — Dashboard shell

- Staff-facing `/dashboard` route listing today's appointments and recently added agents.
- Read-only at first; built on the same data layer as the public pages.

## Phase 6 — Polish for demo

- Visual pass for Steve: typography, spacing, empty states, hero copy that sells the parody.
- 404 page, basic error page, and a sensible favicon.
- Smoke test that exercises Phases 1–5 in a single run.

## Deferred (post-roadmap)

- Authentication and accounts.
- Multi-staff scheduling and conflicts.
- Notifications, email, exports.
- Anything not earning its place against the mission pillars.
