# Plan — MVP (Operational clinic)

Numbered task groups, in order. Each group is independently reviewable; finishing it leaves the repo in a working state. Group 1 lands the data layer; group 2 migrates Phase 1's styling off Tailwind onto PicoCSS so every subsequent UI group is built on the new foundation; group 3 lifts the existing home page onto the data layer; groups 4–7 add the four new resource areas; groups 8–9 close out with validation and a verification pass.

## 1. Data layer foundation

1.1. Add `better-sqlite3` and `@types/better-sqlite3` as runtime/dev deps.
1.2. Add `data/` to `.gitignore` so the SQLite file never lands in the repo. Create `data/` with a `.gitkeep` so the directory exists on a clean clone.
1.3. Create `src/db/migrations/` with the six schema migrations as numbered `.sql` files (`001_create_agents.sql` through `006_create_appointments.sql`), exactly matching the schema sketch in `requirements.md`. Each migration is a single transaction's worth of DDL.
1.4. Create `src/db/index.ts` that:
  - Lazily opens the connection (`data/agentclinic.db`), enabling WAL and foreign keys.
  - On first access, ensures an `applied_migrations (id TEXT PK, applied_at TEXT)` table exists, then applies every `*.sql` under `migrations/` not already recorded, in lexicographic order, inside a transaction.
  - Exports typed row types (`Agent`, `Ailment`, `Therapy`, `Appointment`) and the typed accessors named in `requirements.md` — and no others. Routes import from this module; nothing else imports `better-sqlite3`.
1.5. Add a `pnpm db:migrate` script (`tsx src/db/migrate.ts`) that just imports the module so migrations run; useful as a discoverable command and for CI.

## 2. Migrate Phase 1 styling to PicoCSS

The constitution now names PicoCSS (`specs/tech-stack.md`). This group rips out Tailwind and rebuilds the walking skeleton's views on Pico's semantic-HTML model before any new UI lands.

2.1. Add `@picocss/pico` as a runtime dep. Remove `tailwindcss` from `package.json`.
2.2. Delete `tailwind.config.js` and `src/styles/input.css`. Remove the `pnpm css:watch` script and the `@tailwind` directive references.
2.3. Replace `pnpm css` with a single one-liner that copies `node_modules/@picocss/pico/css/pico.min.css` into `public/pico.min.css`. No watch needed — the file is static. Wire `pnpm dev` and `pnpm build` to run it once each.
2.4. Move the small frame stylesheet that lived at `src/styles/layout.css` to `public/styles.css` directly (no build step). Trim it to only the rules Pico does not already provide (e.g., header/footer hairlines, body grid that pins the footer).
2.5. Update `Layout.tsx` to:
  - Link `/pico.min.css` first and `/styles.css` second in `<head>`.
  - Wrap the body's main slot in `<main class="container">` (via `Main.tsx`) so Pico's container handles widths and padding across breakpoints.
  - Keep the viewport meta — this stays load-bearing.
2.6. Rewrite the four Phase 1 views from utility classes to semantic HTML:
  - `Header.tsx`: `<header class="container"><nav><ul>...wordmark...</ul><ul>...nav links (group 4)...</ul></nav></header>`. Wordmark in `<strong>`.
  - `Footer.tsx`: `<footer class="container"><small>...parody tagline...</small></footer>`.
  - `Main.tsx`: `<main class="container">{children}</main>` — the container class is what's new; the file shape is unchanged.
  - `Home.tsx`: hero in `<hgroup><h1>AgentClinic</h1><p>...tagline...</p></hgroup>`; the featured-patient card in `<article>` (Pico styles articles as cards by default), with the agent's `name` in a `<header>` inside the article and the `specialty` in a `<p>`.
  - No utility classes left in any view file.
2.7. Update `src/app.test.ts`:
  - Drop the `sm:`-Tailwind-utility assertion.
  - Assert instead that the response body links `/pico.min.css` and renders the featured agent's name inside an `<article>`. This is the new "the responsive styling layer reached the page" gate.
  - Keep the existing assertions on status, `AgentClinic`, the parody tagline, the agent's name, and the viewport meta.
2.8. Run `pnpm dev` and confirm the home page still reads as intentional — Pico's defaults plus the small frame sheet produce a clean look without further work. No Tailwind classes anywhere in the rendered HTML.

## 3. Seed data and walking-skeleton home migration

3.1. Create `src/db/seed.ts` with the full demo data set:
  - 5–8 agents (kebab-case IDs, parody names and specialties — leaning into the AgentClinic voice).
  - 4–6 ailments (e.g., `prompt-fatigue`, `context-window-anxiety`) each with a one-line description.
  - 4–6 therapies (e.g., `slow-thinking-walk`, `temperature-bath`) each with a one-line description.
  - Join rows wiring agents to 1–3 ailments each, and each ailment to 1–3 therapies.
  - Exposes `seed()` that wipes the seed tables (`agents`, `ailments`, `therapies`, `agent_ailments`, `ailment_therapies`) and re-inserts. `appointments` is left untouched.
3.2. Add `src/db/run-seed.ts` and the `pnpm db:seed` script that invokes it.
3.3. Replace `src/data/agents.ts`'s `getFeaturedAgent()` with a re-export of `db.getFeaturedAgent()` (or delete the file and update the home page import). The home page now reads from SQLite; the smoke test from group 2.7 still passes because the seeded first agent has the same shape.
3.4. Update the README's run instructions to add `pnpm db:seed` between install and `pnpm dev` for a fresh checkout.

## 4. Agent directory pages and nav

4.1. Create `src/routes/agents.ts` exporting a Hono sub-app with `GET /` and `GET /:id` (mounted at `/agents` from `src/app.ts`).
4.2. Create `src/views/AgentsList.tsx`: a `<Layout>`-wrapped page rendering each agent inside an `<article>` (Pico styles articles as cards). Wrap the collection in `<div class="grid">` so Pico's auto-balanced grid handles single-column on phone and balanced columns at wider widths without breakpoint authoring. Each card shows the name (in an `<h2>` inside `<header>`), the specialty, and an `<a href="/agents/:id">` link.
4.3. Create `src/views/AgentDetail.tsx`: `<Layout>`-wrapped page rendering the agent header (`<hgroup>` with name + specialty), an "Ailments" `<section>` that lists the agent's ailments (each in an `<article>` with their therapies inline beneath), an "Upcoming appointments" `<section>`, and a "Book an appointment" `<section>`. The latter two sections render in place even when empty — they show explicit empty-state copy, not blanks.
4.4. For an unknown `:id`, return `404` with a minimal `Layout`-wrapped body containing "Agent not found." Polished 404 is Phase 3.
4.5. Mount the sub-app from `src/app.ts` at `/agents`.
4.6. Extend `src/views/Header.tsx` with the three Home / Agents / Dashboard links inside the existing `<nav>` `<ul>`. The active route gets `aria-current="page"` (Pico styles this) plus `<strong>` for redundancy; route detection uses `useRequestContext()` or a `path` prop threaded from `Layout`.

## 5. Ailments and therapies surfaced on agent detail

5.1. In `src/db/index.ts`, finalise `listAilmentsForAgent(agentId)` and `listTherapiesForAilment(ailmentId)`. Add a convenience `listAilmentsWithTherapiesForAgent(agentId)` that returns `Array<{ ailment: Ailment; therapies: Therapy[] }>` so the view does not have to N+1 query per ailment.
5.2. In `AgentDetail.tsx`, render the ailments section using this shape: each ailment is an `<article>` with its name in a `<header>` and the description in a `<p>`; nested inside is a `<ul>` of therapies (name in `<strong>`, description as the surrounding text). Empty state: "This agent isn't currently treating any ailments." (Always populated in the seed, but the empty state is real code so it can be tested.)
5.3. No standalone `/ailments` or `/therapies` pages this phase; they have not earned their place.

## 6. Appointment booking

6.1. Create `src/views/AppointmentForm.tsx` rendered inside `AgentDetail.tsx`. The form:
  - `<form method="post" action="/agents/:id/appointments">`. Pico styles forms attractively without further classes.
  - `<label>` + `<select name="ailmentId">` populated with the agent's ailments.
  - `<label>` + `<select name="therapyId">` populated with the union of every therapy across every ailment of the agent (de-duplicated by id). Server-side validation rejects mismatches.
  - `<label>` + `<input type="datetime-local" name="scheduledAt" required>`.
  - `<label>` + `<textarea name="notes">` (optional).
  - `<button type="submit">Book appointment</button>`.
  - Accepts an optional `errors` prop (`Partial<Record<'ailmentId' | 'therapyId' | 'scheduledAt', string>>`) and a `values` prop to preserve user input on validation failure. Failing fields get `aria-invalid="true"` (Pico colours the field) and a `<small>` error message rendered beneath.
6.2. Add `src/routes/appointments.ts` (mounted at `/`) with:
  - `POST /agents/:id/appointments`: parse form body, validate (agent exists, ailment belongs to agent, therapy belongs to ailment, `scheduledAt` parses and is in the future), and on success insert via `db.createAppointment(...)` then `c.redirect('/appointments/' + newId, 303)`. On failure, re-render `AgentDetail` at status `400` with `errors` and `values` populated.
  - `GET /appointments/:id`: load via `db.getAppointment(id)` (which returns the appointment joined with agent + ailment + therapy names). Render `src/views/AppointmentConfirmation.tsx` showing "Appointment booked." inside an `<article>` + the echoed details + a link back to the agent. `404` on unknown id.
6.3. In `AgentDetail.tsx`, add the "Upcoming appointments" section: `db.listAppointmentsForAgent(agentId)` filtered to `scheduled_at >= now`, ordered ascending. Each row shows the scheduled time (human-formatted), the ailment name, and the therapy name in a `<ul>`. Empty state: "No upcoming appointments. Book one below."
6.4. Mount the appointments sub-app from `src/app.ts`.

## 7. Dashboard

7.1. Add `db.listTodaysAppointments()` (where `scheduled_at` falls within today's local day, joined with agent + ailment + therapy names, ordered by `scheduled_at`) and `db.listRecentAgents(limit = 5)` (ordered by `created_at` desc).
7.2. Add `src/routes/dashboard.ts` with `GET /` (mounted at `/dashboard`) rendering `src/views/Dashboard.tsx`.
7.3. `Dashboard.tsx` renders two `<section>`s inside `<Layout>`: "Today's appointments" and "Recently added agents". Wrap both in a `<div class="grid">` so Pico's auto-balanced grid stacks them on phone and lays them side-by-side at desktop without bespoke breakpoint authoring. Each section has an explicit empty state ("No appointments today." / "No agents on the books yet.") and renders its rows inside `<article>` cards.
7.4. Mount the dashboard sub-app from `src/app.ts`.

## 8. Validation suites

Per `tech-stack.md`, Vitest powers both unit tests and feature validation. The MVP grows several suites; all are run by `pnpm validate`.

8.1. `src/db/db.test.ts`: round-trip an `Agent`, an `Ailment`, an `Appointment`. Confirm `listAilmentsWithTherapiesForAgent`, `listTodaysAppointments`, `listRecentAgents`, and `listAppointmentsForAgent` filter and order correctly. Tests use a temp DB file per suite (`os.tmpdir()`), seeded inline.
8.2. `src/routes/agents.test.tsx`: `GET /agents` 200 contains every seeded agent name and renders the list inside `<article>` elements; `GET /agents/:id` 200 contains the agent's specialty, each of its ailments and therapies, the form (with the Pico-styled `<select>`/`<input>` elements), and the upcoming-appointments section header; `GET /agents/unknown` 404. Each page links `/pico.min.css` and ships the viewport meta — the responsive contract from `tech-stack.md`.
8.3. `src/routes/appointments.test.tsx`:
  - Successful POST → 303 with `Location: /appointments/:id`; the new row is readable via `db.getAppointment`.
  - GET on that `Location` → 200 with confirmation copy and the echoed agent/ailment/therapy/scheduled-at, all inside `<article>`.
  - POST missing `ailmentId` → 400, body re-renders the form with `aria-invalid="true"` on the ailment select and an inline `<small>` error; the user's `scheduledAt` value is preserved.
  - POST with `therapyId` not on the chosen `ailmentId` → 400 with the relevant `aria-invalid` + `<small>` error.
  - POST with `scheduledAt` in the past → 400 with the relevant error.
  - GET `/appointments/unknown` → 404.
8.4. `src/routes/dashboard.test.tsx`: with a seeded today-appointment, `GET /dashboard` 200 contains the agent's name and therapy in the today section, and the recently-added agents section names them; with no today-appointment, the empty-state copy renders.
8.5. Keep `src/app.test.ts` (the walking-skeleton smoke test) passing — updated in group 2.7 to assert the Pico link + the `<article>`-wrapped featured agent in place of the dropped `sm:` assertion.
8.6. `pnpm validate` already runs `vitest run`; confirm all new suites are picked up and the command exits 0.

## 9. Verification pass

9.1. Run `pnpm install` clean; confirm the lockfile is sane, `better-sqlite3` builds, and `tailwindcss` is no longer in `node_modules`.
9.2. Run `pnpm db:seed` then `pnpm dev`. Click through:
  - Home renders with the (now-from-SQLite) featured agent inside a Pico-styled `<article>`.
  - `/agents` lists all seeded agents as cards.
  - `/agents/:id` shows ailments + therapies, an empty upcoming-appointments section, and the booking form.
  - Book an appointment; confirm 303 → confirmation page; navigate back to the agent and confirm it appears under "Upcoming appointments."
  - `/dashboard` shows today's appointment and the recently-added agents.
  - Try an invalid booking (past datetime, mismatched therapy) and confirm inline errors with Pico's `aria-invalid` treatment.
9.3. Resize the viewport (devtools device mode) to 375px, 768px, 1280px on each new page. Confirm no horizontal scroll; Pico's container, grid, and form controls render comfortably at each width; the dashboard's grid collapses to a single column on phone and balances side-by-side at desktop; the booking form remains usable on phone.
9.4. Run `pnpm build` then `pnpm start`; repeat the click-through against the built artifact.
9.5. Run `pnpm validate` and `pnpm exec tsc --noEmit` — both clean.
9.6. Update `README.md` and `prompts.md` if either references Tailwind or the old in-memory agent.
