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

- **[PicoCSS](https://picocss.com/)** as the styling layer — a minimal semantic CSS framework that styles standard HTML elements (forms, articles, nav, tables) attractively without a utility-class vocabulary. Supports Steve's "attractive in a modern browser" pillar without a design system buildout, and keeps the templates readable to students because the HTML stays semantic.
- Pico ships as a single static CSS file (`pico.min.css`); we vendor it into `public/` via a one-line `pnpm css` script that copies it out of `node_modules/@picocss/pico/css/`. No build pipeline, no PostCSS step, no JIT compilation.
- A small hand-authored `public/styles.css` ships beside it for frame rules and overrides that don't earn a Pico component (header layout, footer pinning, occasional page-specific tweaks). Pico is linked first; the custom sheet second so its rules win.

Alternatives considered: Tailwind (great utility-first model, but the build pipeline and class soup cost more than they save at this scale); Bootstrap (heavier and more opinionated than we need); plain hand-rolled CSS (more work, less polished default look — Steve's pillar suffers).

## Responsive design

The product is responsive by contract, not as an afterthought.

- **Pico is mobile-first and responsive by default.** Its container, typography, and form components fluidly adapt across the supported widths without us authoring breakpoint-specific rules. Where a page needs more than Pico provides (e.g., a dashboard's two-column-at-desktop / single-column-at-phone split), we use `<div class="grid">` (Pico's auto-balanced grid) or a small `@media (min-width: ...)` block in `public/styles.css`.
- **Supported widths:** 360px → 1440px+. Phones, tablets, and desktops are all first-class; a page that breaks at any width in that range is broken, per `mission.md`.
- **Every page ships with `<meta name="viewport" content="width=device-width, initial-scale=1" />`** in its `<head>`. The shared `Layout` component owns this so individual pages cannot forget it.
- **No horizontal scroll** on any supported width. Pages wrap their primary content in `<main class="container">` so Pico's fluid container handles widths and padding.
- **Component density follows Pico's defaults.** Card padding (`<article>`), form input sizing, and heading scale come from Pico; we override only when a page genuinely needs it.
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
