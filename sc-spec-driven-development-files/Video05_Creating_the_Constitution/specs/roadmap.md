# Roadmap

High-level order of work, broken into deliberately small phases. Each phase is shippable and observable; nothing in a later phase is required for an earlier phase to be "done."

**Cross-cutting requirement, every phase:** every page shipped in every phase is fully responsive across 360–1440px+, per `tech-stack.md`. Responsive design is not a Phase 3 polish item — it is a definition-of-done condition that travels with every feature.

## Phase 1 — Walking skeleton ✅ Complete

A vertical slice that proves the stack works end to end.

- Hono app boots, serves one `/` route, returns a JSX page that says "AgentClinic."
- One typed data record (e.g., a hard-coded "Agent") flows from the server into the rendered page.
- Tailwind is wired up and visibly styling the page.
- `pnpm dev` and `pnpm build` both work.

Shipped on branch `2026-05-29-walking-skeleton`. See `specs/2026-05-29-walking-skeleton/` for requirements, plan, and validation.

## Phase 2 — Operational clinic

The product becomes a working clinic, end to end: agents, the ailments they're being treated for, the therapies on offer, the appointments that schedule the two together, and the staff dashboard that watches it all. This phase is large by design — the prior split into four phases over-fragmented work that only makes sense as one coherent slice (an appointment without therapies is meaningless; a dashboard without appointments has nothing to show).

### Agent directory

- Static list of agents on an `/agents` page, rendered from the data layer.
- Agent detail page at `/agents/:id`.
- Navigation between home, agent list, and detail.

### Ailments and therapies

- Model ailments and therapies; relate them to agents.
- Show an agent's ailments on their detail page.
- Show available therapies per ailment.

### Appointments

- Book an appointment for an agent with a therapy.
- List upcoming appointments on the agent's detail page.
- Minimal form validation; no auth yet.

### Dashboard shell

- Staff-facing `/dashboard` route listing today's appointments and recently added agents.
- Read-only at first; built on the same data layer as the public pages.

## Phase 3 — Polish for demo

- Visual pass for Steve: typography, spacing, empty states, hero copy that sells the parody.
- Responsive polish pass: targeted tweaks at the awkward in-between widths surfaced during Phases 1–2 (responsive correctness itself is already a per-phase requirement, not deferred here).
- 404 page, basic error page, and a sensible favicon.
- Smoke test that exercises Phases 1–2 in a single run.

## Deferred (post-roadmap)

- Authentication and accounts.
- Multi-staff scheduling and conflicts.
- Notifications, email, exports.
- Anything not earning its place against the mission pillars.
