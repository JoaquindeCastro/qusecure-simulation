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

**Decision.** The first adoption option is public-edge PQC with a classical enterprise behind it.
It gives the `edge` band full coverage and **zero** to every band behind it.

**Why.** This is the most important false-confidence pattern in the space: a CDN or load balancer
advertises post-quantum TLS while everything behind it is unchanged. Making it the default means
most readers start in the situation they are actually in.

**Forbids.** Giving edge adoption any credit for systems behind the edge.

---

## D5 — Crypto agility has a hard floor it cannot cross

**Decision.** Agility improves discovery, configuration, policy enforcement, rotation, and
migration of eligible assets. It does not fix vendor timelines, hardware replacement, unsupported
legacy devices, or undiscovered assets — and that blocked floor is identical on both sides of the
fragmented-vs-agile comparison.

**Why.** Without the floor, the tool becomes an advertisement: turn one slider up, watch risk
vanish. The floor is also the actual argument for inventory coverage, since it is the part agility
cannot reach until discovery reaches it.

**Forbids.** Any parameter path that drives exposure toward zero.

**Status.** Enforced structurally since [D13]: blocked and uncatalogued systems are removed from the
work set, so no multiplier can reach them, and orchestration is not an input to visibility or to the
residual. The earlier flat multiplier violated this.

---

## D6 — Comparisons hold external assumptions constant

**Decision.** Fragmented and agile runs share industry, event, vendor readiness, migration
capacity, and horizon. Only orchestration/agility differs.

**Why.** A comparison that improves several things at once produces a bigger gap and proves
nothing about agility specifically.

**Forbids.** Convenience adjustments on the agile side.

**Status.** Resolved by [D13]. The fragmented figure is now the same estate recomputed with
orchestration at zero; the earlier implementation double-counted it.

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

**Status.** Repaid. The propagation map is now the industry illustration painted with per-system
states from `simulate()`, and the recommendations are generated from the actual outcome — including
the named systems agility cannot reach.

---

## D11 — Critical infrastructure as a fourth industry

**Decision.** Added alongside healthcare, financial services and government.

**Why.** A dedicated illustration existed, and industry only selects the estate rather than
weighting the model, so the addition is presentational and carries no modelling risk. It is also the
best vehicle for the constraint in [D5]: thousands of inverters with embedded keys, and protection
relays speaking protocols that predate public-key cryptography.

**Forbids.** Treating it as a skin on the government estate. It has its own asset vocabulary.

---

## D12 — The interface is a guided presentation, not a dashboard

**Decision.** Seven screens on a light background, large type, one major choice per screen, few
visible controls, no persistent sidebar. Sliders stay hidden behind a disclosure until the reader
has seen a result. The isometric illustrations are shown whole and uncropped as the spatial
environment.

**Why.** The audience includes people who do not know what cryptography is. A dense control panel
asks them to configure something they do not yet understand, and buries the argument under widgets.
The story has to land before the parameters do.

**Forbids.** Reintroducing a sidebar, a metric-card grid, or a dark admin aesthetic. Putting
controls before comprehension. Cropping the illustrations to fit a layout.

---

## D13 — Asset-level outcomes replace scalar exposure-days

**Decision.** The model classifies every named system as exposed, blocked, uncatalogued, dependent
or protected, and the result screen leads with counts of systems in plain English. The old
`exposure-days` formulas were removed.

**Why.** The scalar model had two defects recorded in `SIMULATION.md`: it double-counted
orchestration, so the "fragmented" figure was itself agility-adjusted; and its agility multiplier
was flat across all exposure, including the vendor-blocked and undiscovered portions agility cannot
reach. Classifying systems individually fixes both structurally rather than by arithmetic — blocked
systems are removed from the work set, so no multiplier can reach them.

**Forbids.** Reintroducing a single severity number as the headline result.

---

## D14 — No score derived from the inputs

**Decision.** The 0–100 resilience index was deleted. The secondary figure is `reach` — the share of
affected systems the response can actually act on — computed from the outcome.

**Why.** The old score was a weighting of the input sliders, so it could report a healthy number
while the map showed most of the estate exposed. A figure that can contradict the thing it
summarises is worse than no figure.

**Forbids.** Any headline number that is a weighting of inputs rather than a consequence of the
simulated outcome.

---

## D15 — The product documents its own model

**Decision.** Screen `s7` (**Method**) states, in the product, how every number is produced and what
the model cannot tell you. It is linked from the result screen and the footer.

**Why.** The advantage of crypto agility only counts if a skeptical reader can inspect the
mechanics. Publishing the method inside the product — rather than only in a repository nobody
reading the page will see — is what makes [D7] real rather than aspirational.

**Forbids.** Changing the model without changing the Method screen in the same commit.

---

## D16 — The chosen industry and the takeaway stay visible

**Decision.** From readiness onward, the copy names the selected industry as the network being
examined. Selecting a system isolates that part of the supplied illustration without replacing or
redrawing the source art. The event and result screens also offer a short path to a 60-second
takeaway, and the ending separates learning, getting help, and continuing the simulation.

**Why.** A reader should never have to remember how an industry choice relates to the next screen,
or finish the full long-form journey to understand the core lesson. The simulator can support both
a five-minute visitor and a reader who wants to inspect the mechanics without turning into two
different products.

**Forbids.** Generic post-selection headings that discard the industry context; hiding the only
takeaway below the detailed analysis; or merging the educational, commercial, and exploratory exits
into one ambiguous action.
