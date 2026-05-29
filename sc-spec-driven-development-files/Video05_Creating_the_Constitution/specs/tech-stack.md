# Tech Stack

Server-side TypeScript, end to end. We prefer popular, well-documented tools over novel ones.

## Runtime & language

- **Node.js** (LTS) as the runtime.
- **TypeScript** in `strict` mode for both server and any client-side scripts.

## Web framework — Hono (recommended)

We will use **[Hono](https://hono.dev/)** as the server framework.

- Tiny, fast, TypeScript-first; routes are fully typed.
- Server-rendered HTML via JSX is built in — good fit for a dashboard-shaped app that does not need a heavy SPA.
- Runs on Node today, and on edge runtimes later if we ever want to move.
- Small enough that students reading the code can follow it end-to-end.

Alternatives considered: Express (mature but untyped routing), Fastify (great, but more ceremony), NestJS (overkill for this scope).

## Rendering

- **Server-rendered JSX** via Hono for pages and the dashboard.
- A light sprinkle of vanilla TypeScript on the client for interactivity. No SPA framework in Phase 1.
- We can graduate to HTMX or islands later if a screen actually needs it.

## Styling

- **Tailwind CSS** for utility-first styling that still looks intentional — supports Steve's "attractive in a modern browser" pillar without a design system buildout.

## Data

- **SQLite** as the database. A single file on disk — zero setup for students, trivial to ship in a demo, and more than enough for AgentClinic's scale.
- Access goes through a single typed data layer so the rest of the app never imports the driver directly.
- The SQLite file lives outside the repo (gitignored); schema and seed data live in the repo.

## Tooling

- **pnpm** for package management.
- **Vite** or **tsx** for dev-time TypeScript execution and bundling client assets.
- **ESLint + Prettier** with the project's defaults; no bespoke rules until we have a reason.
- **Vitest** for unit tests.

## Validation

- **Vitest** is also our validation tool. Every feature's `validation.md` is realized as a Vitest suite — the same runner powers both unit tests and feature-level acceptance checks, so contributors only learn one tool.
- Validation suites live alongside the code they exercise (`*.test.ts`) and must pass before a feature is considered done.
- Run validation with `pnpm validate` (wired in `package.json`), which executes `vitest run` in CI-friendly, non-watch mode.

## Browser support

- Latest two versions of evergreen browsers (Chrome, Edge, Firefox, Safari). No IE, no legacy shims.
