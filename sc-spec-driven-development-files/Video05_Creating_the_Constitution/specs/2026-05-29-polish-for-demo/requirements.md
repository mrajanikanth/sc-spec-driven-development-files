# Requirements — Polish for demo

Phase 3 of the roadmap. The walking skeleton (`specs/2026-05-29-walking-skeleton/`) proved the stack; the operational clinic MVP (`specs/2026-05-29-mvp/`) made it a real product. This phase is what turns the working clinic into a *demoable* MVP: the parody lands on first paint, every page reads as intentional at 375 / 768 / 1280px, missing routes and thrown errors produce themed pages instead of stack traces, and a single Vitest run exercises Phases 1 + 2 end to end.

Nothing in this phase changes domain behavior. No new tables, no new routes that take user input, no new data shapes. The visible surface area moves; the model underneath does not.

## Scope

In scope:

- **Medium visual pass — copy, hero, empty states, rhythm.**
  - `Home.tsx`: rewrite the hero `<hgroup>` so the tagline sells the parody in one beat (not the placeholder line from the skeleton). The "Featured patient" card stays a Pico `<article>` but gains a labelled "Now in session" framing.
  - `AgentsList.tsx`: section header + intro sentence above the list; each agent rendered as a `<article>` with name, specialty, and a "View chart" link (replaces the bare `<ul>` row treatment from the MVP).
  - `AgentDetail.tsx`: tighter section rhythm via `<hgroup>` per section ("Currently being treated for", "Available therapies", "Book an appointment", "Upcoming appointments"); no layout restructure.
  - `Dashboard.tsx`: section titles get parody framing ("On the schedule today", "Newly admitted"); section spacing tightened.
  - `AppointmentConfirmation.tsx`: confirmation reads as a parody discharge note, not a form receipt.
  - **Empty states everywhere.** Every list that can render zero rows ships a Pico `<article>` with one parody sentence: no agents, no ailments on an agent, no therapies on an ailment, no upcoming appointments on an agent, no appointments today, no recently added agents. The current "the waiting room is empty" copy on `/` is the tone reference.
  - **`public/styles.css` additions** are minimal and scoped: section spacing variable, slightly tightened hero type scale at `min-width: 768px`, and a `.empty` utility for the empty-state articles. No design-system buildout; no Pico variable overrides beyond what these rules need.
- **Themed 404, 500, and a centrally-wired error path.**
  - New `src/views/NotFound.tsx` rendering a Pico `<article>` with parody copy ("This agent appears to have ghosted us…") and links back to Home and `/agents`. Returned with status `404`.
  - New `src/views/ServerError.tsx` with parody copy ("The clinic is briefly indisposed…") and a link back to Home. Returned with status `500`.
  - `app.notFound((c) => c.html(<NotFound />, 404))` wired in `src/app.tsx` so any unmatched route — including the MVP's existing `GET /agents/:id` "not found" branch — flows through the themed view. The MVP's inline 404 body is replaced by a call to the same view (still status `404`).
  - `app.onError((err, c) => c.html(<ServerError />, 500))` wired in `src/app.tsx` so a thrown route handler returns the themed 500 page. `err` is `console.error`'d but not surfaced to the user.
- **Favicon + OpenGraph meta.**
  - A small hand-authored SVG favicon shipped at `public/favicon.svg` (a stylised clipboard or stethoscope glyph; one path, no external assets). A 32×32 PNG fallback is **not** in scope — every supported browser handles SVG favicons.
  - `Layout.tsx` adds `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` and a small OpenGraph + Twitter card block (`og:title`, `og:description`, `og:type=website`, `twitter:card=summary`). `og:title` and `og:description` come from `LayoutProps` (`title` plus a new optional `description` with a sensible AgentClinic default).
  - `src/app.tsx` serves `public/favicon.svg` via the existing `serveStatic` pattern.
- **Phase 1 + 2 smoke test (happy path + responsive checks).**
  - New `src/smoke.test.ts` runs as part of `pnpm validate`. One test boots the app via `createApp()` and drives a single happy flow:
    1. `GET /` returns 200 and contains the featured agent's name.
    2. `GET /agents` returns 200 and lists the seeded agents.
    3. `GET /agents/:id` for the first seeded agent returns 200 and shows at least one ailment and one therapy.
    4. `POST /agents/:id/appointments` with valid form data returns 303 with a `Location: /appointments/:id`.
    5. `GET` on that `Location` returns 200 and echoes the chosen ailment, therapy, and scheduled time.
    6. `GET /dashboard` returns 200 and the new appointment's agent name appears in today's section (when scheduled for today) or the test schedules for today specifically.
  - **Responsive assertions** in the same suite, run against the same responses: every successful HTML response above contains `<meta name="viewport" content="width=device-width, initial-scale=1" />` and wraps primary content in `<main class="container">`. This is the cheap, deterministic proxy for "no horizontal scroll at 375/768/1280" without spinning up a headless browser.
  - The smoke test uses an isolated SQLite file (a temp path via `DATABASE_PATH` env var, see decision below) and runs migrations + a minimal seed in `beforeAll`. It does not depend on or mutate `data/agentclinic.db`.
- **Strict TypeScript stays clean.** `pnpm exec tsc --noEmit` passes across new modules.
- **Existing tests keep passing.** `app.test.ts`, `db.test.ts`, and the three `routes/*.test.tsx` suites are not rewritten; the 404 view swap on `agents/:id` may require a one-line assertion update if a test was string-matching the old inline body.

Out of scope (deferred post-roadmap):

- Heavy visual pass: custom CSS variable theming, micro-illustrations, hover/focus micro-treatments, themed iconography per page. The medium pass above is the line.
- Validation-failure assertions in the smoke test. The MVP's `routes/appointments.test.tsx` already covers those; duplicating them in the smoke suite is over-investing.
- A 32×32 PNG favicon fallback, an Apple touch icon, or a PWA manifest. SVG is enough for supported browsers (per `tech-stack.md`).
- A Hono request-id middleware, structured error logging, or any observability beyond `console.error` in the 500 handler.
- Editing or cancelling appointments; rescheduling; conflict detection; auth; notifications. Still deferred per the roadmap.
- A standalone therapies index page. Still not earning its place.
- Headless-browser responsive testing (Playwright/Puppeteer). The viewport + container assertions are the agreed proxy; a real browser pass earns its place if a future regression demands it.

## Decisions

- **Branch and spec slug: `2026-05-29-polish-for-demo`.** The `2026-05-29-mvp` slug is taken by Phase 2; using the roadmap's own Phase 3 wording keeps the connection explicit. Dated prefix mirrors the existing convention.
- **No new domain tables or routes that accept input.** Phase 3 is a polish phase. Adding a model now expands surface area the demo doesn't need and the smoke test would have to grow to cover. Anything that smells like a feature gets deferred.
- **Visual changes live in JSX semantics + a small `public/styles.css` addition, not Pico variable overrides.** Per `tech-stack.md`, Pico is the styling layer and overrides should be reluctant. The medium pass adds section rhythm, hero scale at `>=768px`, and an empty-state utility — nothing that re-theme the whole site. If a future polish round wants to repaint, it can earn that decision then.
- **Themed errors via `app.notFound` and `app.onError`, not per-route handling.** Centralising them in `src/app.tsx` means every current and future route inherits the behaviour; routes don't have to remember to render the themed view. The MVP's inline `agents/:id` 404 body collapses into a call to the same `<NotFound />` component so there's one source of truth for "this thing wasn't found."
- **500 page does not echo the error message.** Parody copy plus a link home. Surfacing exception text to the demo audience is a footgun (stack traces, internal paths, library names). `console.error(err)` is enough for the developer running it.
- **SVG favicon only.** Every browser in the support matrix (`tech-stack.md`: latest two evergreens) renders SVG favicons. Shipping a PNG fallback doubles the asset count for a browser that does not exist in our support matrix.
- **OpenGraph block lives in `Layout.tsx`, driven by props with sensible defaults.** Pages that want a specific description (`/agents`, `/agents/:id`, `/dashboard`) can pass one; pages that don't get the AgentClinic default. No per-page meta files, no helper indirection — the `Layout` already owns `<head>`.
- **Smoke test is one file, one flow, in `src/smoke.test.ts`.** Not co-located with a route because it spans routes. Booting through `createApp()` (not the running server) keeps it fast and deterministic and matches the existing route-test pattern.
- **Smoke test runs on an isolated SQLite file via `DATABASE_PATH` env var.** `src/db/index.ts` already opens lazily; the smoke test sets `process.env.DATABASE_PATH` in `beforeAll` to a temp path (`fs.mkdtempSync` + `path.join`), runs migrations, inserts a minimal known agent + ailment + therapy + join rows. A small change to `src/db/index.ts` reads the env var with `data/agentclinic.db` as the default. This pattern is also useful in CI; the test suite stops depending on whatever happens to be in the dev DB.
- **Responsive validation is HTML-level, not headless-browser.** The viewport meta tag and `<main class="container">` together are what `tech-stack.md` says delivers responsive behaviour; asserting both are present on every page is a deterministic proxy for the layout contract. A pixel-perfect responsive sweep belongs to a future tool decision (Playwright), not this phase.
- **Empty-state utility name is `.empty`, not `.empty-state` or `.placeholder`.** Short, used in exactly one role, only ever attached to `<article>`. Pico's `<article>` provides the padding and border; `.empty` only changes text alignment and de-emphasises the body slightly.
- **One smoke test, no parameterisation across the agent list.** Pick the first seeded agent, drive one booking, assert one dashboard appearance. Looping over agents adds noise without catching anything the single flow misses.

## Context

This phase exists to make AgentClinic *demoable*, not to make it more capable. The two stakeholder pillars that drive it:

- **Steve (attractive in a modern browser).** The skeleton and MVP both shipped responsively, but the copy is still placeholder-flavoured and several lists render bluntly on first paint. Steve's audience — conference-booth onlookers and projector demos — judges in the first three seconds. The medium pass is what those three seconds need: a hero that lands the parody, sections that read as intentional, and empty states that don't say "nothing here yet."
- **Mary (reliable foundation).** A demoable product needs a believable error surface. A 404 that returns a stack trace or a blank "agent not found" line is the kind of thing Mary's audience flags as amateur. The themed pages and the central wiring are the minimum that makes the foundation feel finished.

Susan (real features) is *not* the driver this phase. No new features are landing; the existing ones get the lighting they were always supposed to have. Anything that drifts into Susan territory (a new route that takes input, a new table) gets pushed back per the deferred list.

The smoke test is the seam between Phase 3 and any later work. Once it lands, every future change has a single command (`pnpm validate`) that exercises Phases 1 + 2 plus the new error pages — so the next phase, whatever it is, can land without re-discovering whether booking still works end to end.
