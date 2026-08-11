# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Deeper context lives in `docs/`: [PRODUCT.md](docs/PRODUCT.md) (what this is for and who it is for),
[SIMULATION.md](docs/SIMULATION.md) (the model, its formulas, and its deliberate simplifications),
[DESIGN.md](docs/DESIGN.md) (visual and interaction language), and
[DECISIONS.md](docs/DECISIONS.md) (why things are the way they are). This file carries the rules
that must hold on every change; the docs carry the reasoning and the detail.

## Product

This started as a "Q-Day Simulator" and is now a **Crypto Agility Stress Test**. It does not predict
when Q-Day arrives and must never imply it does. It shows what happens when an enterprise's
cryptographic assumptions change, and how five factors move the outcome: visibility/discovery,
crypto agility, vendor readiness, migration capacity, and architecture.

The teaching goal: **installing PQC once is not the same as becoming crypto-agile.**

### The journey

Seven screens, `s0`–`s7`: intro → industry → readiness → event → trigger → result → explore, plus
`s7` **Method**, reachable from the result screen and the footer. The user-facing progress indicator
shows only four steps (Industry → Readiness → Event → Result).

The experience is a guided presentation, not a dashboard: light background, large type, one major
choice per screen, few controls, minimal chrome. Sliders are hidden behind a disclosure until the
explore screen. Do not reintroduce a sidebar, a metric-card grid, or a dark admin aesthetic.

### Industries

Financial services, healthcare, government, critical infrastructure. Each has an isometric
illustration in `assets/industry/` (from Meg Gleason at QuSecure) and an entry in `SCENES` with
9–11 named systems: hotspot coordinates as percentages of the image, band, cryptographic
dependencies, and plain-language copy. Industry selects the estate; it does not otherwise weight
the model yet.

### Stress events

- **Q-Day** — public-key cryptography stops being trustworthy
- **Protocol deprecation** — a compliance deadline, nothing cryptographically broken
- **PQC implementation flaw** — hits *only* systems that already migrated
- **Trust-chain failure** — certificates fail regardless of migration

The last two exist to make the point that agility is about *change*, not about arriving at one
algorithm. A new event must probe a capability the existing four do not.

### Standing product feedback (from Meg)

Durable acceptance criteria: broaden beyond Q-Day; model partial adoption (public edge PQ-ready
while the enterprise is not); industry-specific language throughout; realistic compliance triggers;
define technical terms inline; animate the stress event; assume readers may not know what
cryptography is; polished 3D/isometric visuals in the spirit of QuSecure's UI.

## Commands

```bash
npm run dev     # static server on :3000 (PORT env overrides); serves the repo root, not dist/
npm test        # node --test tests/*.test.mjs
npm run build   # copies index.html + assets/ into dist/
npm run check   # test + build

node --test tests/smoke.test.mjs                              # single file
node --test --test-name-pattern "vendor" tests/*.test.mjs      # single test
```

No dependencies, no bundler, no lint config, no `node_modules`. Node 20.11+ (uses
`import.meta.dirname`) and the built-in `node:test` runner are the whole toolchain. `npm run dev`
serves the repo root, so edits to `index.html` are live on reload.

## Architecture

**The entire application is `index.html`** — markup, CSS, and JS inline. `scripts/build.mjs` copies
it and `assets/` into `dist/`. Do not add a framework, split into modules, or introduce a build
pipeline unless explicitly asked. No external fonts, CDN assets, analytics, or network calls at
runtime: the UI promises nothing leaves the browser, and `vercel.json` enforces it with
`connect-src 'none'`.

Unlike the original dense one-line style, the file is now written readably (multi-line CSS and JS).
Match that.

**Screens.** `<section class="screen" id="s0…s7">`, exactly one carrying `.on`. Any element with
`data-go="n"` routes through `go(n)`, which paints the progress indicator, calls the screen's
enter-hook (`paintStack`, `enterTrigger`, `paintResult`, `enterExplore`), scrolls to top, and moves
focus to the screen heading for keyboard and screen-reader users. Reuse `data-go` rather than adding
handlers.

**Scene component.** `renderScene(host, interactive)` builds an aspect-locked box (1122/1402, so
hotspot percentages always align), an `<img>` plate, an SVG link overlay (`viewBox 0 0 100 100`,
`preserveAspectRatio="none"`, `vector-effect="non-scaling-stroke"`), and `.spot` buttons.
`paintStates(host, states)` applies `data-s` per system. If an illustration fails to load the host
gets `.noart` and the map stays usable.

**The model** is the block between `/*MODEL-START*/` and `/*MODEL-END*/`. It is **pure — no DOM,
no network, no storage** — so tests evaluate it directly; a test enforces this. `simulate(input)`
returns states, counts, per-property impact, effort days, and `reach`. All model tuning happens
there. See `docs/SIMULATION.md` for the formulas and the rules they must satisfy.

## Modeling rules

Correctness requirements, not preferences. `docs/SIMULATION.md` explains how each is enforced.

- **No output is a probability.** No likelihood, expected loss, or forecast language anywhere.
- **Keep confidentiality, integrity, authenticity and availability distinct**, and keep
  cryptographic vulnerability, compliance failure, and outage distinct.
- **Crypto agility may improve** discovery within what is catalogued, configuration, policy,
  rotation, and migration of eligible systems.
- **Crypto agility must not fix** vendor timelines, hardware replacement, unsupported equipment, or
  uncatalogued systems. Blocked systems are excluded from the work set structurally; `orch` is not
  an input to visibility or to the residual.
- **Fragmented vs agile holds every other assumption constant.**
- **RSA/ECC falling does not mean AES-256 is broken.** Symmetric-only storage is weakened, not
  opened, and is excluded from harvest-now-decrypt-later counts.
- **An affected system does not fail its neighbours.** Assurance spreads one hop, as `dependent`.

The advantage of agility must emerge from mechanics a skeptical reader can inspect. This is not a
disguised QuSecure advertisement: if the mechanics do not produce the advantage, fix the mechanics
or lower the claim.

**Whenever you change the model, update the Method screen (`s7`) in the same change.** It is the
app's own account of how it works, and it must not drift.

## UX rules

- Enterprise architecture is the primary visual object; illustrations are shown whole and
  uncropped, never buried in small cards or covered in UI.
- Animation carries meaning: event → impact → propagation → response. Anything else is decoration.
- Progressive disclosure: plain-language claim first, mechanism one interaction deeper.
- **Plain language is the default.** Prefer the ordinary word. Jargon is allowed only where a plain
  word would be inaccurate — and then it must be in `GLOSSARY`, which gives it a dashed underline
  and a definition on hover, focus or tap. `annotate(root)` marks the first mention of each defined
  term per block automatically, so new copy is covered without hand-marking; add the term to
  `GLOSSARY` and it will be picked up. Headings, buttons and option cards are excluded from marking
  (a marker inside a card is a hover-only span, never a nested button), so **jargon in a heading has
  nowhere to be defined — do not put it there.** A definition must not lean on another undefined
  acronym; a test enforces this.
- Accessibility is not optional: real buttons, `aria-pressed` on option groups, focus moved to the
  heading on screen change, `aria-live` on the result, and a `prefers-reduced-motion` path for every
  animation (the trigger sequence collapses to its end state).

## Tests

`tests/smoke.test.mjs` does two jobs.

**String checks** over `index.html`, so renaming user-facing copy breaks them: step names
(`Industry`, `Readiness`, `Event`, `Result`), industry names, event names (`Q-Day`,
`Protocol deprecation`, `PQC implementation flaw`, `Trust-chain failure`), `Start simulation`,
`Trigger stress event`, the Method headings, and the disclaimer phrase `not breach probabilities`.
They also check every referenced illustration exists on disk and every hotspot coordinate is 0–100.

**Model tests** evaluate the extracted model block and encode the modeling rules as invariants:
determinism, the agility floor, monotonicity of every control, property separation, harvest-now
scope, supplier gating, and `reach` being derived from the outcome. Add the invariant alongside any
new mechanic.

## Deployment

Vercel reads `vercel.json`: `npm run build`, output `dist`, clean URLs, plus a strict CSP
(`connect-src 'none'`, `frame-ancestors 'none'`), `nosniff`, `no-referrer`, HSTS, and immutable
one-year caching for `/assets/*`. No env vars, no backend.

## Known gaps

- The four illustrations are ~2MB each (7.9MB total) and the carousel loads all of them. There is no
  image tooling in this repo; WebP exports would cut this by roughly an order of magnitude.
- Hotspot coordinates were positioned by eye against the illustrations.
- Industry selects the estate but does not weight the model.
- `residual` is one figure from vendor readiness, not a per-supplier schedule.
- `prefers-reduced-motion` is implemented and tested for presence, but has not been verified by
  toggling the OS setting.

## Repository notes

- `source/index.html.000.b64` is a base64 blob of an early draft. Nothing reads it; ignore it.
- `.vercel-trigger` exists only to produce a commit that triggers a deploy.
