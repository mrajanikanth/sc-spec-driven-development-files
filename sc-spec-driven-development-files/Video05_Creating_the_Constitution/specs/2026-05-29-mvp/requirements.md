# Requirements — MVP (Operational clinic)

Phase 2 of the roadmap, shipped as a single coherent slice: AgentClinic becomes a working clinic end-to-end. Agents are listed and have detail pages; ailments and therapies are modelled and surfaced per agent; appointments can be booked through a real POST/redirect/confirmation flow and are persisted to SQLite; staff have a read-only `/dashboard` watching the whole thing.

This builds directly on the walking skeleton (`specs/2026-05-29-walking-skeleton/`). The Hono app, JSX layout, and Vitest harness all stay. The styling layer changes: the constitution (`specs/tech-stack.md`) now names **PicoCSS** instead of Tailwind, and this MVP includes the migration of Phase 1's views off Tailwind utility classes onto Pico's semantic-HTML model. After this phase ships, Tailwind is gone from the repo entirely.

## Scope

In scope:

- **Data layer (SQLite).**
  - `better-sqlite3` is the driver. The DB file lives at `data/agentclinic.db` (gitignored); schema and seed live in the repo.
  - Migrations are numbered `.sql` files under `src/db/migrations/`, applied by a small runner on first DB access.
  - A single typed module (`src/db/index.ts`) owns the connection, runs migrations on import, and exposes typed accessors (`listAgents`, `getAgent`, `listAilmentsForAgent`, `listTherapiesForAilment`, `createAppointment`, `listAppointmentsForAgent`, `listTodaysAppointments`, `listRecentAgents`, `getAppointment`). Routes import only this module — never the driver.
  - Seed data lives in `src/db/seed.ts`, run via `pnpm db:seed`. It is idempotent: clears and re-populates the seed tables so demos can reset to a known state.
  - The walking-skeleton home page is migrated to read from the data layer (first seeded agent) so there is one source of truth for `Agent` records.
- **Agent directory.**
  - `GET /agents` lists all agents (name, specialty, link to detail). Server-rendered JSX.
  - `GET /agents/:id` shows the agent's name, specialty, ailments, available therapies per ailment, an appointment booking form, and upcoming appointments.
  - `GET /agents/:id` for an unknown id returns 404 with a minimal "agent not found" body. (A polished 404 page is Phase 3.)
- **Header nav.** `Header.tsx` grows three links — Home, Agents, Dashboard — rendered as a `<nav>` containing a `<ul>` (which Pico lays out as a horizontal row and wraps cleanly at narrow widths). Active route gets `aria-current="page"` plus `<strong>` for a visible treatment.
- **Ailments and therapies.**
  - Domain modelled in three tables: `ailments`, `therapies`, and the join `ailment_therapies`. An `agent_ailments` join relates agents to the ailments they are being treated for.
  - The agent detail page lists the agent's ailments; each ailment lists the available therapies. Therapies are not standalone pages in the MVP — they are surfaced in context of an ailment.
- **Appointment booking.**
  - A form on `/agents/:id` lets a user pick one of the agent's ailments, then one of the therapies offered for that ailment, then a date/time (`<input type="datetime-local">`), with an optional notes field.
  - `POST /agents/:id/appointments` validates server-side: required fields, the chosen therapy is on the chosen ailment, the agent has that ailment, and `scheduled_at` is in the future.
  - On success, the row is persisted and the response is `303 See Other` to `GET /appointments/:id`, which renders an `AppointmentConfirmation` view echoing back the agent, ailment, therapy, scheduled time, and notes.
  - On validation failure, the agent detail page is re-rendered at status `400` with the user's input preserved and inline error messages on the failing fields.
  - The agent detail page lists upcoming appointments for that agent (`scheduled_at >= now`, ordered ascending).
- **Dashboard shell.**
  - `GET /dashboard` renders a staff-facing, read-only view with two sections: today's appointments (joined with agent + therapy names, ordered by `scheduled_at`) and the five most recently added agents.
  - Empty states for both sections are explicit, not blank.
- **Phase 1 styling migration.** Rewrite the walking-skeleton's `Layout`, `Header`, `Main`, `Footer`, and `Home.tsx` from Tailwind utility classes to semantic HTML styled by Pico. Drop `tailwindcss`, `tailwind.config.js`, `src/styles/input.css`, and the Tailwind build step. Add `@picocss/pico` and a one-line `pnpm css` script that copies `pico.min.css` into `public/`. Replace the `sm:`-utility assertion in the existing `src/app.test.ts` with a Pico-equivalent assertion (the Pico stylesheet is linked; the featured agent renders inside a Pico-styled element).
- **Responsive.** Every new page is fully responsive across 360–1440px+ per `tech-stack.md`: Pico's container and form components handle the bulk of the work; `<div class="grid">` covers two-column-at-desktop / single-column-at-phone needs; the viewport meta is inherited from `Layout`; no horizontal scroll at any supported width. Forms, lists, and dashboard sections must remain usable and readable on phone widths.
- **Validation.** New Vitest suites under `src/` cover the data layer round-trips and every new route, including the validation-failure branches. The walking skeleton's existing `app.test.ts` continues to pass. `pnpm validate` runs everything.
- **Strict TypeScript.** `pnpm exec tsc --noEmit` clean across the new modules.

Out of scope (deferred):

- Phase 3 polish — typography pass, polished 404/error pages, favicon, a single smoke test that exercises Phases 1 + 2 end-to-end. (The MVP's 404 is minimal on purpose.)
- Editing or cancelling appointments; rescheduling; conflict detection between two appointments on the same agent.
- Authentication, staff accounts, role-based access.
- Filtering, search, or pagination on `/agents` or `/dashboard`. Seed data is small enough that lists fit on one page.
- Email or any notification on booking.
- Multi-staff scheduling, calendar export, timezone handling beyond "store what the form gave us as ISO."
- A standalone therapies index page. Therapies are surfaced in context of an ailment; a standalone index has not earned its place.
- Any client-side framework or interactivity. Form is plain HTML POST.

## Decisions

- **Styling: PicoCSS, vendored as a static file.** Per the updated `tech-stack.md`, Pico replaces Tailwind. We install `@picocss/pico` and ship `pico.min.css` directly from `public/` — `pnpm css` is a one-line copy from `node_modules/@picocss/pico/css/`, run once on dev start and once during build. No PostCSS, no JIT, no `tailwind.config.js`. Custom rules live in a small `public/styles.css` linked after Pico. The trade-off is less control over micro-styling vs. a much smaller surface area for students to learn — which the constitution explicitly prefers.
- **Pico variant: the standard (class-aware) build, not classless.** We need `<main class="container">` and `<div class="grid">` for the agents list and dashboard. Pico styles `<article>`, `<form>`, `<select>`, `<input>`, `<nav>`, `<hgroup>` automatically; we use those without further classes. Validation-failure styling uses Pico's built-in `aria-invalid="true"` treatment plus `<small>` for error text.
- **Persistence: SQLite with `better-sqlite3`.** Matches the constitution's "SQLite, single file on disk" decision. `better-sqlite3` is synchronous (which fits Hono's request handlers cleanly), well-documented, and the popular default — preferred over `node:sqlite` (still experimental on the Node LTS we target) and over `sqlite3` (callback-heavy). One bundled native module is an acceptable cost; the simplicity dividend pays for it many times over.
- **Migrations as numbered `.sql` files, applied on first DB access.** Files named `001_create_agents.sql`, `002_create_ailments.sql`, etc. A small runner in `src/db/index.ts` reads `applied_migrations` (a table it owns), applies anything new in order in a transaction, and records what it ran. No migration framework — students can read every line. Down-migrations are not in scope; the MVP only moves forward.
- **One typed `src/db/index.ts` owns the connection and the public API.** Connection is opened lazily on first access; migrations and (in dev) seed-guard checks run there. Every route imports from this module — never from `better-sqlite3`. This is the same pattern the walking skeleton established with `getFeaturedAgent`, generalised.
- **Seed data is TypeScript, not SQL.** `src/db/seed.ts` is the authoritative source for the demo data set (agents, ailments, therapies, the join rows that wire them together). Running `pnpm db:seed` wipes the seed tables and re-inserts. Keeping seed in TS lets us share types with the data layer and write the parody copy in one place. The seed file does not touch `appointments`; that table is whatever the demo has booked.
- **Walking-skeleton home page migrates to the data layer.** `getFeaturedAgent()` from `src/data/agents.ts` is replaced by `db.getFeaturedAgent()` (first seeded agent, ordered by `created_at` then `id`). One source of truth for `Agent` records; the home page's existing visual contract is preserved.
- **Booking is POST → 303 → GET (PRG).** `POST /agents/:id/appointments` on success returns `303 See Other` with `Location: /appointments/:id`. Refreshing the confirmation page does not re-submit, and the confirmation is a real, linkable URL — better demo behaviour than a same-page render.
- **Validation failure returns `400` and re-renders the agent detail page with the form state and inline errors.** Status `400` (not `200`) so the failure is visible in network panels and to the test suite; the page body still renders the full agent detail so the user has everything they need to fix and retry.
- **No client-side JavaScript yet.** The therapy `<select>` is rendered with the union of every therapy on every ailment of this agent; server-side validation rejects mismatches. This is uglier than a JS-driven dependent select but keeps Phase 2 server-only, matching the tech-stack's Phase 1 decision. A real dependent select can earn its place in Phase 3 or later.
- **Datetime is `<input type="datetime-local">` stored as the ISO string the browser submitted.** No timezone gymnastics in the MVP — the demo runs on one machine and one calendar. Storage is `TEXT` (ISO 8601). "Future" is computed against `new Date()` at request time.
- **Header nav lives in `Header.tsx`.** Rendered as a `<nav>` inside `<header class="container">` with a `<ul>` of three items (Home, Agents, Dashboard) — Pico styles a `<ul>` inside `<nav>` as a horizontal row on wider widths and wraps cleanly at phone widths without breakpoint authoring. Active route gets `<strong>` (or `aria-current="page"`, which Pico styles); route detection is done with `useRequestContext()` / current path comparison so views don't have to thread the path through props.
- **Routes split by resource.** `src/routes/agents.ts`, `src/routes/appointments.ts`, `src/routes/dashboard.ts` each export a Hono sub-app and are mounted from `src/app.ts`. Views live in `src/views/`. Each route module is small enough to read end-to-end.
- **Schema sketch** (full DDL in the migration files; here for orientation):
  - `agents (id TEXT PK, name TEXT NOT NULL, specialty TEXT NOT NULL, created_at TEXT NOT NULL)`.
  - `ailments (id TEXT PK, name TEXT NOT NULL, description TEXT NOT NULL)`.
  - `therapies (id TEXT PK, name TEXT NOT NULL, description TEXT NOT NULL)`.
  - `agent_ailments (agent_id TEXT, ailment_id TEXT, PRIMARY KEY (agent_id, ailment_id))`.
  - `ailment_therapies (ailment_id TEXT, therapy_id TEXT, PRIMARY KEY (ailment_id, therapy_id))`.
  - `appointments (id TEXT PK, agent_id TEXT NOT NULL, ailment_id TEXT NOT NULL, therapy_id TEXT NOT NULL, scheduled_at TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL)`.
  - IDs are short kebab strings (`peer-reviewer-3000`) for readability in URLs and demos, generated by the seed for static rows and by `crypto.randomUUID()` for appointments.

## Context

The walking skeleton (Phase 1) shipped a proof that the stack works. This MVP is what makes AgentClinic a *clinic* — the first phase where the parody has real verbs (book, list, view) and not just real nouns. The roadmap deliberately bundles agent directory, ailments/therapies, appointments, and the dashboard into one phase because each one is unconvincing on its own: an appointment without therapies is meaningless; a dashboard without appointments has nothing to show. Splitting them is over-engineering; merging them is the smallest coherent demo.

The three stakeholder pillars all earn first-class treatment here:

- **Mary (reliable foundation):** SQLite + migrations + a typed accessor module is the boring, predictable choice the constitution asks for. No ORM yet, no migration framework yet — both have to earn their place.
- **Susan (real features):** booking is the first feature that actually *does* something. PRG, server-side validation, and a confirmation URL make it feel like real software, not a placeholder.
- **Steve (attractive in a modern browser):** the new pages inherit the walking skeleton's responsive contract and visual restraint. The MVP does not chase Phase 3 polish, but it must not regress from the skeleton — every page reads as intentional at 375, 768, and 1280px.

The deferred items in the roadmap (auth, multi-staff scheduling, notifications) deliberately do not appear here. They are not part of the MVP because they do not earn their place against the pillars yet; we want this slice to ship before any of them are reconsidered.
