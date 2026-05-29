# AgentClinic

A clinic — for AI agents. See `specs/mission.md` for the framing.

## Getting started

```bash
pnpm install
pnpm db:seed
pnpm dev
```

Then open <http://localhost:3000>. The first run creates `data/agentclinic.db` (gitignored), applies migrations from `src/db/migrations/`, and loads the demo agents/ailments/therapies.

## Other scripts

- `pnpm css` — vendor `pico.min.css` from `@picocss/pico` into `public/`.
- `pnpm db:migrate` — run pending SQL migrations against `data/agentclinic.db` (idempotent).
- `pnpm db:seed` — wipe and re-populate the seed tables (agents, ailments, therapies, joins). Leaves `appointments` alone.
- `pnpm build` — vendor Pico, then compile the server to `dist/`.
- `pnpm start` — run the built artifact on `PORT` (default `3000`).
- `pnpm test` — run the Vitest unit/smoke tests once.
- `pnpm validate` — run the same Vitest suite as the feature-validation gate (see `specs/tech-stack.md`).

## Stakeholder pillars

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.
