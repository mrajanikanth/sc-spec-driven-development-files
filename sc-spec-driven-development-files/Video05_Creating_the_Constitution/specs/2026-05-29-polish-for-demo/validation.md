# Validation — Polish for demo

Phase 3 is done when both automated gates pass. No separate browser checklist; the smoke test's viewport + container assertions are the agreed responsive proxy.

## Gate 1 — `pnpm validate` exits 0

All Vitest suites pass:
- `src/app.test.ts` — unchanged walking-skeleton assertions.
- `src/db/db.test.ts` — unchanged data-layer round-trips.
- `src/routes/agents.test.tsx` — updated 404 assertion (ghosted-us copy replaces old inline body).
- `src/routes/appointments.test.tsx` — unchanged.
- `src/routes/dashboard.test.tsx` — unchanged.
- `src/smoke.test.ts` — new; the six-step happy flow plus viewport + container assertions on every HTML response.

## Gate 2 — `pnpm exec tsc --noEmit` exits 0

Strict TypeScript clean across all new and modified modules:
- `src/views/NotFound.tsx`
- `src/views/ServerError.tsx`
- `src/views/Layout.tsx` (updated `LayoutProps`)
- `src/smoke.test.ts`
- `src/db/index.ts` (env-var path change)

## Merge criteria

Both gates pass on the `2026-05-29-polish-for-demo` branch. The CHANGELOG is updated. The branch is merged into `main`.
