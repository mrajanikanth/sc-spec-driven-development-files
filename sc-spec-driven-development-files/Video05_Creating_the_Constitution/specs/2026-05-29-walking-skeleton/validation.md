# Validation — Walking skeleton

The phase is mergeable when every check below passes from a clean clone.

## Automated checks

- `pnpm install` completes without errors or peer-dep warnings worth flagging.
- `pnpm exec tsc --noEmit` exits 0 with `strict` on.
- `pnpm test` runs the Vitest smoke test and it passes:
  - `GET /` returns HTTP 200.
  - Response body contains the string `AgentClinic`.
  - Response body contains the parody tagline rendered in the hero.
  - Response body contains the featured agent's `name`.
- `pnpm build` exits 0 and produces a `dist/` containing the runnable server and a `public/styles.css` populated by Tailwind (non-empty, contains real utility classes used on the page).

## Manual checks

Run `pnpm dev`, open `http://localhost:3000` in a current evergreen browser, and confirm:

- The `<h1>` reads "AgentClinic" and the parody tagline appears directly beneath it.
- A "Featured patient" card renders below the hero, showing the agent's `name` and `specialty` with parody-flavored labels — not just plain text dumped on the page.
- The layout is centered with a sensible max width; the hero and the card are visually distinct sections.
- Tailwind is visibly applied: typography scale, spacing, and a card treatment are present. Disabling `/styles.css` in devtools makes the page collapse to unstyled HTML — proof the CSS is doing the work.
- No console errors in the browser; no unhandled exceptions in the server log.

Then run `pnpm build && pnpm start` and confirm the same page in the same browser, served from the built artifact.

## Stakeholder pillar check

A quick read against the constitution before opening the PR:

- **Mary (reliable foundation):** scripts behave the same on a teammate's machine; no clever build steps; strict TS clean.
- **Susan (real features):** the `Agent` shape, however minimal, looks like a real domain record — not a placeholder string.
- **Steve (attractive in a modern browser):** the page looks intentional on first paint in Chrome and Safari. A reasonable person would not call it "unstyled."

## Out of scope for this validation

- Performance, accessibility audits beyond "no obvious regressions."
- Cross-browser matrices beyond the latest Chrome and Safari spot-checks.
- Any behavior on routes other than `/` — they don't exist yet.
