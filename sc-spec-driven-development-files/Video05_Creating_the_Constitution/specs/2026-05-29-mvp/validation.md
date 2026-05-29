# Validation — MVP (Operational clinic)

The MVP is mergeable when every check below passes from a clean clone. Per `tech-stack.md`, Vitest is both our unit-test runner and our feature-validation runner — every automated check here lands as a Vitest assertion run by `pnpm validate`.

## Automated checks

- `pnpm install` completes without errors or peer-dep warnings worth flagging. `better-sqlite3`'s native binding builds. `tailwindcss` is no longer in `node_modules`.
- `pnpm db:migrate` runs migrations against a fresh `data/agentclinic.db` and exits 0. Re-running is a no-op (idempotent).
- `pnpm db:seed` populates the seed tables and exits 0. Re-running wipes and re-populates; the appointments table is untouched.
- `pnpm css` produces `public/pico.min.css` byte-identical to `node_modules/@picocss/pico/css/pico.min.css`.
- `pnpm exec tsc --noEmit` exits 0 with `strict` on across the new modules.
- `pnpm validate` runs the full Vitest suite and it passes:
  - **Walking skeleton regression (after styling migration).** `GET /` returns 200; body still contains `AgentClinic`, the parody tagline, the featured agent's name, and the viewport meta tag. The response links `/pico.min.css`, and the featured agent's name appears inside an `<article>` element — proving the responsive styling layer from `tech-stack.md` reached the page. No `class="..."` attribute in the body contains a Tailwind-style utility token (e.g. no `text-`, `px-`, `py-`, `sm:`, `md:` substrings).
  - **Data layer round-trip.** Inserting an `Agent`, an `Ailment`, an `Appointment`, and the relevant join rows is readable back via the typed accessors with the same field values. `listAilmentsWithTherapiesForAgent` returns ailments paired with their therapies (no N+1 — one row per ailment in the result). `listTodaysAppointments` filters to the local day. `listRecentAgents(5)` returns agents in `created_at desc` order, capped at 5. `listAppointmentsForAgent` filters to `scheduled_at >= now` and orders ascending.
  - **Agent directory.** `GET /agents` returns 200; body contains every seeded agent name, each rendered inside an `<article>`, and a link to their detail page. `GET /agents/:id` for a seeded agent returns 200; body contains the agent's specialty, each of their ailments (name + description), each ailment's therapies (name + description), the booking form (`<form method="post" action="/agents/.../appointments">` with `<select>`, `<input type="datetime-local">`, and `<button type="submit">` children), and an "Upcoming appointments" section. `GET /agents/unknown-id` returns 404 with "Agent not found." Each `/agents` page links `/pico.min.css` and includes the viewport meta.
  - **Header nav.** Every new page renders the Home/Agents/Dashboard links inside `<nav>`, and the link matching the current path carries `aria-current="page"`.
  - **Appointment booking — success path.** `POST /agents/:id/appointments` with a valid body (`ailmentId` on the agent, `therapyId` on that ailment, `scheduledAt` in the future) returns `303` with a `Location: /appointments/:id` header pointing at a real id. `db.getAppointment(id)` reads back the inserted row with matching fields. Following the `Location` (`GET /appointments/:id`) returns 200 with confirmation copy (e.g. "Appointment booked"), the agent's name, the ailment's name, the therapy's name, and a human-readable scheduled time, all inside an `<article>`. `GET /appointments/unknown-id` returns 404.
  - **Appointment booking — validation failures.** Each of the following POSTs returns `400` and re-renders the agent detail page with the user's input preserved in the form (`value="..."` / selected option), `aria-invalid="true"` on the failing field, and an inline `<small>` error message rendered beneath it:
    - Missing `ailmentId`.
    - Missing `therapyId`.
    - Missing `scheduledAt`.
    - `therapyId` not on the chosen `ailmentId`.
    - `ailmentId` not on the agent.
    - `scheduledAt` parses to a time in the past.
  - **Dashboard.** With a seeded today-appointment, `GET /dashboard` returns 200; body contains the agent's name, the therapy's name, and a time for that appointment in the "Today's appointments" section, plus the names of the five most-recently-added agents in the "Recently added agents" section. The two sections are wrapped in a `<div class="grid">`. With today's appointments table empty, `GET /dashboard` still returns 200 and renders the explicit empty-state copy ("No appointments today.") rather than a blank section.
- `pnpm build` exits 0 and produces a `dist/` containing the runnable server alongside:
  - `public/pico.min.css` matching `@picocss/pico`'s shipped file.
  - A small `public/styles.css` carrying the hand-authored frame rules.
  - No `tailwind.config.js`, no `src/styles/input.css`, no `@tailwind` directives anywhere in the build output.

## Manual checks

Run `pnpm install && pnpm db:seed && pnpm dev`, open `http://localhost:3000` in a current evergreen browser, and confirm the full flow:

- **Home (`/`).** Hero + featured-patient card; the featured agent renders inside a Pico-styled `<article>`; Tailwind utility classes are gone from the markup. Header now shows Home/Agents/Dashboard nav with Home marked as the current page. No console errors.
- **Agents list (`/agents`).** Every seeded agent appears as a Pico-styled card, each linking to their detail page. The `<div class="grid">` collapses to a single column on phone and lays out as balanced columns at wider widths. Header shows Agents as the current page.
- **Agent detail (`/agents/:id`).** Agent name + specialty render in an `<hgroup>` header. Ailments are listed as articles; each ailment's therapies render beneath with their name and description. "Upcoming appointments" renders its empty state on first visit. The booking form is present with Pico-styled selects for ailment and therapy, a datetime field, an optional notes field, and a submit button.
- **Booking — happy path.** Pick an ailment, pick a matching therapy, pick a future datetime, submit. The browser lands on `/appointments/:id` (URL bar changes; refresh does not re-submit) showing the confirmation `<article>` with the agent, ailment, therapy, and scheduled time echoed back, plus a link back to the agent. Following that link, the new appointment appears under "Upcoming appointments."
- **Booking — validation failures.** Try each: submit with no ailment, with a therapy that does not belong to the chosen ailment, with a past datetime. Each lands back on `/agents/:id` (URL unchanged via the POST handler); the form still has the user's other inputs filled; the failing field shows Pico's `aria-invalid` styling (typically a red border) with an inline error message beneath. No browser console errors.
- **Dashboard (`/dashboard`).** Today's appointment from the previous step is listed with the agent and therapy named. The recently-added agents section lists up to five seeded agents. The two sections sit side-by-side on a wide window and stack on a narrow one. Header shows Dashboard as the current page.
- **404.** `GET /agents/does-not-exist` and `GET /appointments/does-not-exist` both render a "not found" body and return 404 (visible in devtools network).
- **Styling source-of-truth check.** In devtools, the page links `/pico.min.css` (200) and `/styles.css` (200). Disabling `/pico.min.css` in devtools makes the page collapse to mostly-unstyled semantic HTML — proof Pico is doing the visible work; the custom sheet handles only frame rules.
- No console errors in the browser; no unhandled exceptions in the server log throughout.

### Responsive checks (required)

Per `tech-stack.md`, every new page is validated at three widths. Use Chrome devtools device mode (or resize the window) on `/`, `/agents`, `/agents/:id`, `/appointments/:id`, and `/dashboard` and confirm at each width:

- **375px (phone).** No horizontal scroll. Pico's container handles page padding. The agent list and dashboard `<div class="grid">` collapse to a single column. The booking form fields stack full-width; the datetime input is reachable and editable with a phone-style keyboard. Header nav wraps cleanly. Type size sits at Pico's mobile defaults.
- **768px (tablet).** Layout is centered with breathing room on both sides. The agent list and dashboard grid begin to balance; the agent detail page allows the form and the ailments to sit comfortably. Pico's type and form scales adapt automatically.
- **1280px (desktop).** Page is centered within Pico's container max-width; whitespace on either side is intentional, not a broken layout. Dashboard's two sections sit side-by-side; agent cards lay out as balanced columns.

The pages must look intentional — not just "not broken" — at all three widths. Pico does most of the work; the custom `public/styles.css` should be touching this only where the framework genuinely falls short.

Then run `pnpm build && pnpm start` and confirm the same flow in the same browser, served from the built artifact.

## Stakeholder pillar check

A quick read against the constitution before opening the PR:

- **Mary (reliable foundation).** SQLite, numbered SQL migrations, a single typed data layer; no ORM, no migration framework. PicoCSS shipped as a static file via a one-line copy script — no PostCSS, no JIT, no `tailwind.config.js`. Scripts (`pnpm db:migrate`, `pnpm db:seed`, `pnpm css`, `pnpm dev`, `pnpm build`, `pnpm validate`) behave the same on a teammate's machine. Strict TS clean. Validation suite covers both happy and failure paths.
- **Susan (real features).** Agents, ailments, therapies, and appointments are all first-class. Booking is a real POST → persist → redirect flow with server-side validation — not a placeholder. The dashboard reads real rows.
- **Steve (attractive in a modern browser).** Every new page is responsive at 375 / 768 / 1280 px courtesy of Pico's defaults. Header nav, forms (with `aria-invalid` styling), and articles all read as intentional on first paint. The walking skeleton's visual contract is preserved across the Tailwind → Pico migration.

## Out of scope for this validation

- Phase 3 polish: typography pass, polished 404/error pages, favicon, an end-to-end smoke test spanning Phases 1 + 2 in one run.
- Editing, cancelling, or rescheduling appointments; conflict detection.
- Authentication, accounts, role-based access.
- Performance, accessibility audits beyond "no obvious regressions" (Pico already covers a lot of the a11y baseline).
- Cross-browser matrices beyond the latest Chrome and Safari spot-checks.
- Timezone handling beyond "store what the browser submitted as ISO."
