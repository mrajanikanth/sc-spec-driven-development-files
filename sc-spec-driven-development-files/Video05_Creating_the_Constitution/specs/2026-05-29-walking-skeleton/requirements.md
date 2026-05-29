# Requirements — Walking skeleton

Phase 1 of the roadmap. A vertical slice that proves the stack works end to end: Hono serves a single JSX page, a typed `Agent` record flows from server to render, Tailwind styles the page, and both `pnpm dev` and `pnpm build` work.

## Scope

In scope:

- A single `/` route on a Hono app that returns server-rendered JSX.
- One hard-coded `Agent` record defined in a typed module and imported by the route.
- A minimal AgentClinic home page rendered at `/` with three pieces:
  - A reusable layout shell (`<html>`/`<head>`/`<body>`) that future pages can inherit, composed of a `Header`, `Main`, and `Footer` subcomponent — each in its own file under `src/views/`.
  - A hero section with an `<h1>` reading "AgentClinic" and a one-line parody tagline drawn from the mission.
  - A "Featured patient" card displaying the agent's `name` and `specialty` with parody-flavored labels.
- Tailwind CSS wired into the build and visibly styling the page.
- The page is **fully responsive across 360–1440px+**, per the tech-stack constitution: mobile-first utilities, viewport meta tag, no horizontal scroll, type and spacing that scale at the `sm:` breakpoint.
- `pnpm dev` runs the app locally with reload-on-save.
- `pnpm build` produces a runnable production artifact.
- A Vitest smoke test that hits `/` and asserts the agent's name appears in the response. This same suite is the feature's validation surface — runnable via `pnpm validate` per the tech-stack constitution.
- `tsc --noEmit` is clean in `strict` mode across server code.

Out of scope (deferred to later phases):

- The `/agents` list and `/agents/:id` detail pages (Phase 2).
- Any persistent data layer or SQLite wiring (Phase 2+).
- Navigation between pages, footer, 404/error pages (Phase 3).
- Polish-grade typography, hero imagery, or copywriting beyond the one parody tagline.
- Client-side interactivity or any framework on the client.

## Decisions

- **Agent record shape: minimal `{ id, name, specialty }`.** Three fields, all `string`. Enough to demonstrate typed data flow without prejudging the Phase 2 agent model. The record lives in a single typed module that the route imports — no data layer yet, but the shape of one.
- **Tailwind via the Tailwind CLI to a static CSS file.** `tailwindcss` watches/builds into `public/styles.css`; Hono serves the file via static middleware. This matches the tech-stack pillar of "predictable behavior over clever behavior" and avoids pulling Vite plugins into Phase 1. Vite-driven asset processing is a Phase 2+ decision if it earns its place.
- **Home page shape: hero + one featured-agent card, no nav.** The page commits to the parody on first paint without bringing forward any Phase 2+ surface area. A reusable `Layout` component owns the document shell so later phases inherit it instead of reinventing it.
- **Layout split into one component per file.** `Layout` only owns the document scaffold; `Header`, `Main`, and `Footer` each live in their own file under `src/views/` (`Header.tsx`, `Main.tsx`, `Footer.tsx`) and `Layout.tsx` composes them. Phase 1 already has more than one region worth naming, and the per-file split sets the precedent before later phases add real content to any of them — so growth happens by editing one small file, not by hunting through a big one.
- **`tsx` for dev, `tsc` for build.** Smallest toolchain that satisfies the roadmap's `pnpm dev` / `pnpm build` requirement. No Vite yet; introducing it now would violate the "earn its place" rule.
- **Responsive defaults live in the Layout shell and the page itself.** Mobile-first base utilities (`px-4`, `py-10`, `text-4xl`) with `sm:` upscales (`sm:px-6`, `sm:py-16`, `sm:text-5xl`). The viewport meta tag lives in `Layout.tsx` so future pages cannot forget it. This establishes the responsive pattern Phase 2+ inherits.
- **One Vitest smoke test, not a full suite.** Establishes the testing pattern early so Phase 2 inherits it, but does not over-invest before there's surface area to test. The same suite doubles as the feature's validation run (`pnpm validate`) — one runner for unit tests and feature acceptance, per the constitution.

## Context

This is the first feature branch off the constitution. There is no existing application code in `src/` beyond the placeholder. Everything wired here sets a precedent for how later phases will look, so the bias is toward boringly conventional choices — students reading the repo end-to-end should not have to learn anything exotic to understand Phase 1.

The three stakeholder pillars apply even at this size:

- **Mary (reliable foundation):** strict TypeScript, predictable scripts, no clever build steps.
- **Susan (real features):** the agent record, however minimal, is shaped like a real domain object — not "Hello, world."
- **Steve (attractive in a modern browser):** Tailwind is visibly doing work on the page; the skeleton looks intentional even before Phase 3 polishes it.
