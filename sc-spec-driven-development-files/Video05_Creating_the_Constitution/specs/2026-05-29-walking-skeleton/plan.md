# Plan — Walking skeleton

Numbered task groups, in order. Each group is independently reviewable; finishing it leaves the repo in a working state.

## 1. Project scaffolding

1.1. Add `hono`, `@hono/node-server` as runtime deps.
1.2. Add `typescript`, `tsx`, `@types/node`, `vitest` as dev deps.
1.3. Update `tsconfig.json` for `strict`, `jsx: "react-jsx"`, `jsxImportSource: "hono/jsx"`, `module`/`target` aligned with current Node LTS.
1.4. Wire `pnpm dev` (tsx watch on `src/index.ts`) and `pnpm build` (tsc emit to `dist/`) in `package.json`. Add `pnpm start` for the built artifact.

## 2. Typed agent record

2.1. Create `src/data/agents.ts` exporting an `Agent` type `{ id: string; name: string; specialty: string }` and a single hard-coded record.
2.2. Export a `getFeaturedAgent(): Agent` accessor so the route never reaches into the module's internals — sets the shape of the future data layer.

## 3. Hono app and `/` route

3.1. Create `src/app.ts` that builds and exports the Hono app (no listener — keeps it testable).
3.2. Add `src/index.ts` that imports the app and starts `@hono/node-server` on a configurable port (default 3000).
3.3. Add a placeholder `src/views/Home.tsx` that returns a valid JSX document containing the string "AgentClinic" — enough to prove the route renders end-to-end. Real content lands in group 5.
3.4. Wire `GET /` to render `Home` with the agent from group 2.

## 4. Tailwind wiring

4.1. Add `tailwindcss` as a dev dep; init `tailwind.config.js` scanning `src/**/*.{ts,tsx}`.
4.2. Create `src/styles/input.css` with the three `@tailwind` directives.
4.3. Add `pnpm css` / `pnpm css:watch` scripts that build `public/styles.css` from the input.
4.4. Have `pnpm dev` and `pnpm build` invoke the CSS build (concurrently in dev, sequentially in build).
4.5. Serve `public/` via Hono's `serveStatic`, and link `/styles.css` from the JSX document head.

## 5. Minimal AgentClinic home page

Flesh out `Home.tsx` into a single intentional landing page. No navigation, no extra routes — just one page that earns the name. The page is composed inside a `Layout` shell with three subcomponents (`Header`, `Main`, `Footer`) so future pages inherit a complete frame, not just `<html>`.

5.1. Add a `Layout` JSX component at `src/views/Layout.tsx` that owns `<html>`, `<head>` (title, charset, viewport, `/styles.css` link), and `<body>`. The body composes three subcomponents in order: `<Header />`, `<Main>{children}</Main>`, `<Footer />`. Layout itself does not render any other content — the three subcomponents own their slots.
5.2. Add `src/views/Header.tsx`, `src/views/Main.tsx`, and `src/views/Footer.tsx`:
  - `Header` renders a `<header>` with the AgentClinic wordmark. No nav yet.
  - `Main` is a one-prop wrapper that renders `<main>{children}</main>` and owns the page-content width/spacing rules so individual pages don't redeclare them.
  - `Footer` renders a `<footer>` with a single parody-flavored line. Minimal on purpose — Phase 6 will polish it.
5.3. Add a hand-authored `src/styles/layout.css` for layout-frame rules that don't belong in Tailwind utility classes (e.g., a body grid that pins the footer to the bottom, hairline borders on header/footer). Import it from `src/styles/input.css` via `@import './layout.css';` ahead of the `@tailwind` directives so it ships in the same `public/styles.css` bundle that the Layout already `<link>`s.
5.4. Build a hero section inside `Home.tsx`: an `<h1>` reading "AgentClinic" and a one-line parody tagline drawn from `mission.md` (e.g., "A clinic for overworked AI agents.").
5.5. Build a "Featured patient" section in `Home.tsx`: a card displaying the featured agent's `name` and `specialty`, with labels that make the parody legible (e.g., "Currently in session" / "Specialty").
5.6. Apply Tailwind utilities throughout — typography scale, spacing, a centered max-width container, a card treatment for the agent section — so the page reads as intentional in a current evergreen browser. Not a polish pass; just visible intent.
5.7. Confirm there are no client-side scripts and no images required for the page to look right — Phase 1 stays server-only.

## 6. Smoke test / validation suite

Per `specs/tech-stack.md`, Vitest is both our unit-test runner and our feature-validation runner. The Phase 1 smoke test below is also Phase 1's validation suite.

6.1. Add `vitest.config.ts` with the Node environment.
6.2. Add `src/app.test.ts` that imports the app, calls `app.request('/')`, asserts status 200, and asserts the response HTML contains "AgentClinic", the parody tagline, and the featured agent's name.
6.3. Wire `pnpm test` (Vitest once) and `pnpm test:watch` (watch mode) in `package.json`. Also wire `pnpm validate` as an alias for `vitest run` — this is the entrypoint `validation.md` will call.

## 7. Verification pass

7.1. Run `pnpm install` clean and confirm the lockfile is sane.
7.2. Run `pnpm dev`, open the page in a browser, confirm the hero, the agent card, and Tailwind styling are all present.
7.3. Run `pnpm build` then `pnpm start`, confirm the built artifact serves the same page with styles.
7.4. Run `pnpm validate` (Vitest, per the constitution's validation contract) and `pnpm exec tsc --noEmit` — both clean.
7.5. Update `README.md` with the two commands a student needs: install and dev.
