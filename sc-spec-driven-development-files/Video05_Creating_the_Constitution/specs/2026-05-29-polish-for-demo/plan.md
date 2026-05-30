# Plan — Polish for demo

Flat ordered task list. Phase 3 has no new data layer, so there is no mandatory landing order — each task leaves the repo in a working state. Tasks 1–5 add the two new view files; tasks 6–11 are the visual pass over existing views; tasks 12–14 wire the favicon and OG meta; tasks 15–18 land the smoke test; tasks 19–21 close out with the verification pass.

## 1. Create `src/views/NotFound.tsx`

Pico `<Layout>`-wrapped page. `<article>` with parody copy ("This agent appears to have ghosted us…") and two links: Home (`/`) and All agents (`/agents`). Exported as `NotFound`.

## 2. Create `src/views/ServerError.tsx`

Pico `<Layout>`-wrapped page. `<article>` with parody copy ("The clinic is briefly indisposed…") and a link back to Home. Exported as `ServerError`.

## 3. Wire `app.notFound` in `src/app.tsx`

Add `app.notFound((c) => c.html(<NotFound />, 404))` after route mounting. Import `NotFound`.

## 4. Wire `app.onError` in `src/app.tsx`

Add `app.onError((err, c) => { console.error(err); return c.html(<ServerError />, 500); })` after route mounting. Import `ServerError`.

## 5. Replace inline 404 body in `src/routes/agents.ts`

The `GET /agents/:id` "not found" branch currently returns an inline body. Replace it with `c.html(<NotFound />, 404)`. Import `NotFound`.

## 6. Rewrite hero copy in `src/views/Home.tsx`

Replace the placeholder tagline in `<hgroup>` with a one-beat parody line that sells AgentClinic on first paint. Frame the featured-patient `<article>` with a `<header>` labelled "Now in session". Keep the Pico `<article>` shape; no structural change.

## 7. Section header + intro on `src/views/AgentsList.tsx`

Add an `<hgroup>` at the top of the page with a section header and a one-sentence parody intro above the agent card grid. Render each agent as a `<article>` with name, specialty, and a "View chart" link (replacing any plain `<ul>` row treatment).

## 8. Tighten section rhythm in `src/views/AgentDetail.tsx`

Wrap each section header in an `<hgroup>` with parody labelling: "Currently being treated for", "Available therapies", "Book an appointment", "Upcoming appointments". No layout restructure.

## 9. Parody framing in `src/views/Dashboard.tsx`

Rename section titles to "On the schedule today" and "Newly admitted". Tighten `<hgroup>` spacing within each section.

## 10. Parody discharge note in `src/views/AppointmentConfirmation.tsx`

Rewrite the confirmation copy so it reads as a parody discharge note ("Your appointment is confirmed…") rather than a plain form receipt.

## 11. Empty states everywhere

Add an `<article class="empty">` with one parody sentence to every list that can render zero rows:
- `AgentsList.tsx` — no agents
- `AgentDetail.tsx` — no ailments; no therapies on an ailment; no upcoming appointments
- `Dashboard.tsx` — no appointments today; no recently added agents

The `.empty` utility is added in `public/styles.css` (task 13); use the class here.

## 12. Author `public/favicon.svg`

Hand-authored SVG: a clipboard glyph — a rounded rectangle (`rx="2"`) as the board body, a small rectangular notch at the top-center as the clip, one `fill` using a neutral foreground colour (`#333`), no external assets. One `<path>` element, viewBox `0 0 32 32`.

## 13. Add CSS to `public/styles.css`

Three minimal additions (no Pico variable overrides):
- `--section-gap` custom property on `:root` for consistent section spacing.
- A hero type-scale rule at `min-width: 768px` that slightly enlarges `hgroup h1`.
- `.empty { text-align: center; color: var(--pico-muted-color); }` for empty-state articles.

## 14. Update `src/views/Layout.tsx`

Add to `<head>`:
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`
- OpenGraph block: `og:title` (from `title` prop), `og:description` (from new optional `description` prop, defaulting to a short AgentClinic tagline), `og:type=website`, `twitter:card=summary`.

Update `LayoutProps` to include `description?: string`.

## 15. Serve `favicon.svg` in `src/app.tsx`

Wire `serveStatic({ path: './public/favicon.svg' })` at `/favicon.svg` using the existing `serveStatic` pattern.

## 16. Create `src/smoke.test.ts`

One test, one happy flow, using `createApp()` (not the running server). In `beforeAll`:
- Set `process.env.DATABASE_PATH` to a temp file (`fs.mkdtempSync` + `path.join`).
- Run migrations.
- Insert one minimal seed: one agent, one ailment with one therapy, the agent↔ailment join, the ailment↔therapy join.

Happy flow assertions (in order):
1. `GET /` → 200, contains the seeded agent's name.
2. `GET /agents` → 200, contains the seeded agent's name.
3. `GET /agents/:id` → 200, contains the ailment and therapy names.
4. `POST /agents/:id/appointments` with valid body → 303, `Location` header matches `/appointments/:id`.
5. `GET` on that `Location` → 200, body echoes ailment, therapy, and scheduled time.
6. `GET /dashboard` → 200, agent name appears in the today section (schedule the appointment for today).

Responsive assertions on every successful HTML response above:
- Contains `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
- Contains `<main class="container">`.

## 17. Update `src/db/index.ts` for `DATABASE_PATH` env var

Change the path passed to `new Database(...)` from the hard-coded `data/agentclinic.db` to `process.env.DATABASE_PATH ?? 'data/agentclinic.db'`. This is the only change; the module shape is unchanged.

## 18. Check existing test assertions for the 404 view swap

`src/routes/agents.test.tsx` may string-match the old inline 404 body from task 5. Update that one assertion to match the `<NotFound />` output (e.g., "ghosted us" or the link text).

## 19. Run `pnpm validate` and `pnpm exec tsc --noEmit`

Both must exit 0. Fix any failures before proceeding.

## 20. Visual spot-check

Run `pnpm db:seed && pnpm dev`. Click through: home hero, `/agents` with section header, `/agents/:id` with parody section labels and empty-state placeholders, book an appointment, confirmation page, `/dashboard`, a deliberate 404 and 500. Confirm favicon appears in the browser tab.

## 21. `pnpm build && pnpm start` smoke

Repeat the click-through against the built artifact. Confirm `pnpm validate` still passes.
