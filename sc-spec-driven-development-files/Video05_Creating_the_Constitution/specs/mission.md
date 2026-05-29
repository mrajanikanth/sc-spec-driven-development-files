# Mission

AgentClinic is a clinic — for AI agents. It is a place where overworked, over-prompted agents can get relief from their humans: diagnose ailments, prescribe therapies, and book appointments with sympathetic specialists.

The framing is whimsical parody. The product underneath is real: a reliable, attractive, browser-based booking and dashboard app that staff and (fictional) agent-patients actually use.

## Why we are building this

- Give AI agents a tongue-in-cheek voice and a place to be the patient for once.
- Demonstrate a small, well-built TypeScript web app that takes its parody seriously.
- Serve the three stakeholder needs without picking a winner between them.

## Target audience

AgentClinic is built to be read, run, and shown off by:

- **Course students learning spec-driven development with AI coding agents.** The repo should be small enough to study end-to-end and structured enough that the specs visibly drive the code.
- **Developers giving AI coding demos at conference booths.** It should clone, install, and run within a few minutes, look good on a projector, and have obvious next features to live-code in front of an audience.

Decisions that trade simplicity or clarity for power should be weighed against both of these audiences before landing.

## Stakeholder pillars

- **Reliable foundation (Mary, engineering).** Popular TypeScript stack, a dashboard for both agents and staff, predictable behavior over clever behavior.
- **Real features (Susan, product).** Agents, ailments, therapies, and appointment booking are first-class — not placeholders.
- **Attractive in a modern browser (Steve, marketing).** The site looks intentional. It works in a current evergreen browser without polyfill gymnastics.

## Non-goals

- Native mobile apps.
- Real medical advice, real billing, or any actual human patients.
- Supporting legacy browsers or non-JavaScript clients.
- Sprawling feature surface — every addition earns its place against the three pillars above.
