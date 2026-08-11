# Decisions

Durable decisions and the reasoning behind them, so future work can tell a deliberate choice from
an accident. All entries were recorded on 2026-08-10, when this log was created; the decisions
themselves were made earlier and their original dates are not recovered here.

Format: decision, why, and what it forbids.

---

## D1 — Reframe from "Q-Day Simulator" to "Crypto Agility Stress Test"

**Decision.** The product's subject is the enterprise's capacity to absorb cryptographic change.
Q-Day is one probe among several, not the frame.

**Why.** The old name invited "when is Q-Day?" — unanswerable, and any implied answer would have
been the most memorable and least defensible thing in the tool. It also reduced a recurring
enterprise problem to a single event.

**Forbids.** Countdowns, dates, "years until" framing presented as forecast. Copy or model
behavior that treats Q-Day as the default or privileged event.

---

## D2 — Deterministic tabletop model, never probability

**Decision.** Same inputs produce the same outputs. No randomness, no sampling. No figure is
labeled as a breach probability, likelihood, or expected loss.

**Why.** The tool's parameters are reader-chosen assumptions, not measurements. A probability
framing would claim knowledge the model does not have, and it is the claim a skeptical security
architect would attack first — correctly.

**Forbids.** Monte Carlo framing, percentage-of-breach language, and any export that could be
read as an assessment of a real organization.

---

## D3 — Four events chosen to probe different capabilities

**Decision.** Q-Day/CRQC, protocol-or-compliance deprecation, ML-KEM implementation flaw, and
certificate/trust-chain failure.

**Why.** Two of the four exist specifically to defeat the conclusion "adopt PQC, done." The ML-KEM
flaw hits an organization *because* it already migrated; the deprecation deadline breaks nothing
cryptographically yet still forces change. Together they make the point that agility is about
change, not about arriving at one algorithm.

**Forbids.** Adding events that only vary magnitude. A new event must probe a capability the
existing four do not.

---

## D4 — "Edge protected, enterprise unchanged" is the default adoption state

**Decision.** The first adoption option is public-edge PQC with a classical enterprise behind it,
and it contributes **zero** to the resilience score.

**Why.** This is the most important false-confidence pattern in the space: a CDN or load balancer
advertises post-quantum TLS while everything behind it is unchanged. Making it the default means
most readers start in the situation they are actually in.

**Forbids.** Giving edge adoption partial credit in the score.

---

## D5 — Crypto agility has a hard floor it cannot cross

**Decision.** Agility improves discovery, configuration, policy enforcement, rotation, and
migration of eligible assets. It does not fix vendor timelines, hardware replacement, unsupported
legacy devices, or undiscovered assets — and that blocked floor is identical on both sides of the
fragmented-vs-agile comparison.

**Why.** Without the floor, the tool becomes an advertisement: turn one slider up, watch risk
vanish. The floor is also the actual argument for inventory coverage, since it is the part agility
cannot reach until discovery reaches it.

**Forbids.** Any parameter path that drives exposure toward zero. The current flat agility
multiplier violates this; see defect 2 in `SIMULATION.md`.

---

## D6 — Comparisons hold external assumptions constant

**Decision.** Fragmented and agile runs share industry, event, vendor readiness, migration
capacity, and horizon. Only orchestration/agility differs.

**Why.** A comparison that improves several things at once produces a bigger gap and proves
nothing about agility specifically.

**Forbids.** Convenience adjustments on the agile side. The current implementation already
violates this by double-counting orchestration; see defect 1 in `SIMULATION.md`.

---

## D7 — Not an advertisement

**Decision.** The advantage of crypto agility must emerge from mechanics the reader can inspect
and argue with. If the mechanics do not produce the advantage, that is information.

**Why.** The audience includes people whose job is detecting vendor framing. A reader who
concludes the tool was built to reach a predetermined conclusion is lost, and would be right.

**Forbids.** Asserting the conclusion in copy when the model does not support it; tuning weights
to reach a desired result rather than to reflect a stated assumption.

---

## D8 — Isometric enterprise visuals, not SaaS cards

**Decision.** Architecture is the primary visual object, rendered dimensionally. Animation must
communicate event → impact → propagation → response.

**Why.** The product is teaching how change moves through a system. A system has to be visible for
propagation to mean anything, and generic dashboard cards cannot show it.

**Forbids.** Replacing the isometric primitives with flat components; animation that is decoration
only. See `DESIGN.md`.

---

## D9 — Single self-contained `index.html`, no dependencies

**Decision.** All markup, CSS, and JS in one file. The build copies it to `dist/`. No framework,
no bundler, no runtime network requests.

**Why.** The deployment target is a static Vercel site with no backend, and the UI promises that
no data leaves the browser — an empty asset graph and empty dependency tree make that promise
verifiable rather than merely stated. It also keeps the whole product legible in one place.

**Forbids.** Adding a framework, splitting into modules, or introducing a build pipeline without
an explicit decision to revisit this. Adding external fonts, CDN assets, or analytics.

---

## D10 — Static results markup accepted as temporary debt

**Decision.** The impact-propagation map and recommendation list on the results screen are
hardcoded and do not respond to industry, event, or sliders. This shipped knowingly.

**Why.** It made the full four-step flow demonstrable before the propagation model existed.

**Consequence.** Anyone planning results-screen work should know these are not wired to anything —
the fix is building the model behind them, not adjusting the markup. Tracked with the other gaps
in `CLAUDE.md` and `SIMULATION.md`.
