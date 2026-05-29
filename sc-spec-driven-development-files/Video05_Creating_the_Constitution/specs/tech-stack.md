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

## Responsive design

The product is responsive by contract, not as an afterthought.

- **Mobile-first.** Base utility classes target the smallest supported width (360px); larger screens are progressive enhancements layered via Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
- **Supported widths:** 360px → 1440px+. Phones, tablets, and desktops are all first-class; a page that breaks at any width in that range is broken, per `mission.md`.
- **Every page ships with `<meta name="viewport" content="width=device-width, initial-scale=1" />`** in its `<head>`. The shared `Layout` component owns this so individual pages cannot forget it.
- **No horizontal scroll** on any supported width. Containers use fluid widths with capped max-widths; padding scales with the breakpoint.
- **Type, spacing, and component density scale with the breakpoint** — e.g. card padding and heading sizes step up at `sm:` and above rather than rendering desktop-grade chrome on a phone.
- **Validation includes responsive checks** at three widths: 375px (phone), 768px (tablet), 1280px (desktop). See each feature's `validation.md`.

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

- Latest two versions of evergreen browsers (Chrome, Edge, Firefox, Safari) — on both desktop and mobile form factors. No IE, no legacy shims.
