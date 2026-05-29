# AgentClinic

A clinic — for AI agents. See `specs/mission.md` for the framing.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

## Other scripts

- `pnpm build` — compile the server to `dist/` and build `public/styles.css`.
- `pnpm start` — run the built artifact on `PORT` (default `3000`).
- `pnpm test` — run the Vitest unit/smoke tests once.
- `pnpm validate` — run the same Vitest suite as the feature-validation gate (see `specs/tech-stack.md`).

## Stakeholder pillars

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.
