# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Deeper context lives in `docs/`: [PRODUCT.md](docs/PRODUCT.md) (what this is for and who it is for),
[SIMULATION.md](docs/SIMULATION.md) (the model, its formulas, and its known defects),
[DESIGN.md](docs/DESIGN.md) (visual and interaction language), and
[DECISIONS.md](docs/DECISIONS.md) (why things are the way they are). This file carries the rules
that must hold on every change; the docs carry the reasoning and the detail.

## Product

This started as a "Q-Day Simulator" and has been reframed as a **Crypto Agility Stress Test**.
The product does not predict when Q-Day arrives and must never imply it does. It shows what
happens when an enterprise's cryptographic assumptions change, and how five factors move the
outcome: visibility/discovery, crypto agility, vendor readiness, migration capacity, and
architecture.

The teaching goal: **installing PQC once is not the same as becoming crypto-agile.**

### Intended flow

choose industry → see industry-specific architecture → choose PQC/crypto adoption state →
trigger a cryptographic stress event → watch consequences propagate → see recommended
response → adjust assumptions and re-run

The current four-screen wizard is a compressed version of this. "See industry-specific
architecture" and "watch consequences propagate" are the two steps that exist as static
markup rather than as real stages (see Known gaps).

### Industries

Financial services, healthcare, government. Language, asset names, and consequences should be
industry-specific throughout — not one generic model with the industry name swapped in.

### Stress events

- **Q-Day / CRQC breaks RSA and ECC** — confidentiality, authenticity, and signatures under stress
- **Protocol or compliance deprecation** — e.g. TLS 1.2 prohibited; a deadline, not a break
- **ML-KEM implementation vulnerability** — systems that already migrated to PQC must patch or swap
- **Certificate / trust-chain failure** — a shared trust anchor is distrusted

The last two exist specifically to make the point that crypto agility is about *change*, not
about arriving at one algorithm.

### Standing product feedback (from Meg)

These are durable requirements, not a one-time changelog. Treat them as acceptance criteria
for new work:

1. Broaden beyond Q-Day to crypto agility generally.
2. Model **partial adoption** — a public edge (e.g. a CDN) can be PQ-ready while the internal
   enterprise is not. Edge readiness is a false-confidence signal, and the model should show that.
3. Use industry-specific language everywhere.
4. Include realistic compliance and deprecation triggers, not only cryptographic breaks.
5. Define technical terms inline for nontechnical readers.
6. Animate the stress event.
7. Assume some users do not know what cryptography is when they arrive.
8. Move toward a polished 3D/isometric enterprise visual style, in the spirit of QuSecure's
   presentation and admin UI.

## Commands

```bash
npm run dev     # static server on :3000 (PORT env overrides); serves the repo root, not dist/
npm test        # node --test tests/*.test.mjs
npm run build   # copies index.html -> dist/
npm run check   # test + build (what CI/Vercel-equivalent verification looks like)

node --test tests/smoke.test.mjs                          # single test file
node --test --test-name-pattern "industry" tests/*.test.mjs  # single test
```

There are no dependencies, no bundler, no lint config, and no `node_modules`. Node >= 18 (uses
`import.meta.dirname`, so 20.11+ in practice) and the built-in `node:test` runner are the whole
toolchain. Because `npm run dev` serves the repo root, edits to `index.html` are live on reload
without a build step.

## Architecture

**The entire application is `index.html`.** Markup, CSS, and JS are inlined in that one file;
`scripts/build.mjs` only copies it into `dist/`. Any behavior or styling change is an edit to
`index.html` — do not add a framework, split into modules, or introduce a build pipeline unless
explicitly asked.

The file is written in a deliberately dense style: the whole stylesheet is one long line inside
`<style>`, and the whole application script is one long line inside `<script>`. Edits must match
that style. Locate code with `Grep -o` on a distinctive selector or identifier rather than
reading by line number.

**Four-screen wizard.** `<section class="screen" data-screen="0..3">` = Industry → Adoption →
Stress event → Results. Exactly one carries `.active`. Any element with `data-go="n"` (nav rail
buttons, back/next buttons) routes through `go(n)`, which toggles `.active` on both the screen
and the matching nav button. New navigation should reuse `data-go` rather than adding handlers.

**Selection state.** A module-level `state = {industry, adoption, event}` holds the scenario.
`select(rootSelector, stateKey)` installs one delegated click handler on a container; every
`[data-value]` child inside becomes an option, gets `.selected` + `aria-pressed` toggled, and
writes its `data-value` into `state[stateKey]`. Adding an option means adding a button with
`data-value` — no JS change — but its display label must also be added to the `names` map used
on the results screen.

**The model is `calc()`.** Deterministic, no randomness, no network. Inputs: four sliders
(`#inventory`, `#teams`, `#vendor`, `#orch`) plus lookup weights for the selected adoption state
and stress event. It derives resilience score (clamped 12–96), exposure-days, an "agile"
exposure figure (`exp * (1 - .55*orch/100)`), and manual-change count, then writes them into the
metric/bar elements by id. All tuning of simulation outcomes happens inside this one function
and its two weight tables. Slider ids are mapped to their output-label ids by a chain of
`.replace()` calls (`inventory`→`inv`, `teams`→`team`), so a new slider id must fit that mapping
or the mapping must be extended. Every change to `calc()` must satisfy the Modeling rules below;
`docs/SIMULATION.md` documents the current formulas line by line and the places where they
already violate those rules.

`#run` shows the `#overlay` scan animation on a fixed ~1900ms timer, then commits the result
labels, calls `calc()`, and jumps to screen 3. The impact-propagation map and recommendation
list on the results screen are static markup, not model output.

## Modeling rules

These constrain `calc()` and any copy that reports its output. They are correctness
requirements, not preferences.

**Never claim more than the model knows.**
- Output is a deterministic tabletop comparison. Do not label any number a breach probability,
  a likelihood, or a forecast. No randomness, no Monte Carlo framing.
- Keep distinct: **confidentiality, integrity, authenticity, availability.** A harvest-now-
  decrypt-later exposure is not a signature-forgery risk is not an outage.
- Keep distinct: **cryptographic vulnerability**, **compliance failure**, and **outage.** A TLS
  1.2 prohibition is a compliance event that can cause an outage without anything being broken
  cryptographically. Do not collapse these into one severity bar.

**What crypto agility is allowed to improve:**
discovery/inventory, configuration, policy enforcement, certificate and key rotation, and the
migration of *eligible* assets.

**What crypto agility must NOT fix:**
vendor release timelines, hardware replacement, unsupported legacy devices, and anything not
yet discovered. If agility ever drives exposure toward zero, the model is wrong. Undiscovered
assets in particular must stay undiscovered on both sides of the comparison — that is the
entire argument for inventory coverage.

**Fragmented vs crypto-agile comparisons hold external assumptions constant.** Same industry,
same event, same vendor readiness, same horizon. The only thing that varies is orchestration/
agility. A comparison that quietly improves vendor readiness on the agile side is dishonest and
defeats the purpose.

The advantage of agility must emerge from transparent mechanics that a skeptical reader can
follow. This is not a disguised QuSecure advertisement; if the mechanics don't produce the
advantage, fix the mechanics or lower the claim — do not assert the conclusion in copy.

## UX rules

- **Enterprise architecture is the primary visual object.** Not charts, not stat cards. The
  reader should be looking at a system.
- **Prefer dimensional/isometric visuals over generic SaaS cards.** The existing `.island`,
  `.land`, `.building`, `.layer`, and `.ring` CSS is the seed of this style; extend it rather
  than replacing it with flat components.
- **Animation carries meaning:** event → impact → propagation → response. Animation that does
  not communicate one of those four beats is decoration and should be cut.
- **Progressive disclosure for technical material.** Surface a plain-language claim first;
  put mechanism, algorithm names, and math behind a reveal. Define terms inline at first use.
- **Accessibility is not optional.** Keyboard-operable controls, `aria-pressed` on option
  buttons (the `select()` helper already does this), and a working `prefers-reduced-motion`
  path for every animation added.

## Tests are string-presence checks

`tests/smoke.test.mjs` reads `index.html` as text and asserts that literal substrings appear.
This means **renaming user-facing copy breaks tests**: step names (`Industry`, `Adoption`,
`Stress event`, `Results`), industry names (`Healthcare`, `Financial services`, `Government`),
event names (`Q-Day`, `TLS 1.2`, `ML-KEM`, `Certificate authority`), and CSS/identifier tokens
(`inventory`, `Orchestration`, `island`, `building`, `layer` — case-sensitive). Update the assertions alongside
any such rename.

## Known gaps (intended product vs. what is built)

Useful to know before planning work; each is a real gap, not a bug:

- The impact-propagation map and the recommendation list on the results screen are **static
  markup**, not model output. They do not respond to industry, event, or sliders.
- The `#horizon` slider ("Event horizon", 1–20 years) updates its own label and nothing else —
  `calc()` never reads it. The "Vendor-blocked assets" metric is a hardcoded `2`.
- Step 2's layer stack is generic; only step 1's island art varies by industry. Industry-
  specific *architecture* does not exist yet.
- There is no `prefers-reduced-motion` handling, no propagation animation, and no inline
  definitions of technical terms.
- Nothing in the UI separates confidentiality / integrity / authenticity / availability, or
  separates compliance failure from cryptographic break.
- The current fragmented-vs-agile comparison does **not** hold assumptions constant, and the
  agility multiplier discounts vendor-blocked and undiscovered exposure. Both violate the
  Modeling rules above; see `docs/SIMULATION.md` for the specifics.
- `README.md` advertises features not present in `index.html` (JSON export, timeline,
  reduced-motion support). Treat the README as aspirational.

## Repository notes

- `source/index.html.000.b64` is a base64 blob of an earlier, shorter draft of the page. Nothing
  reads it; it is not part of the build. Ignore it unless asked about it.
- `.vercel-trigger` exists only to produce a commit that triggers a Vercel deploy.
- Deployment is Vercel reading `vercel.json` (`npm run build`, output `dist`, clean URLs). No env
  vars, no backend, no external requests at runtime — keep it that way; the UI states that no
  data leaves the browser.
