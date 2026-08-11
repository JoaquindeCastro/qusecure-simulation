# Simulation model

The rules here are correctness requirements. A number that overclaims is the fastest way to lose
the skeptical reader described in `PRODUCT.md`.

The model lives in `index.html` between the `/*MODEL-START*/` and `/*MODEL-END*/` markers. That
block is **pure** — no DOM, no network, no storage — so `tests/smoke.test.mjs` extracts and
evaluates it directly. A test asserts it stays DOM-free; keep it that way.

The user-facing version of this document is the **Method** screen in the app (screen `s7`). If you
change the model, change that screen too, or the app starts lying about itself.

## Principles

### Never claim more than the model knows

Deterministic: same inputs, same outputs, always. No randomness, no sampling, no distributions.

No output may be presented as a breach probability, likelihood, expected loss, or forecast. The
figures compare assumptions the reader chose against each other. Copy, labels, and any future
export must respect this.

### The four security properties stay separate

`PROPERTY_OF` maps each kind of cryptography to what it actually provides:

| Dependency | Provides |
|---|---|
| `pk` — key agreement | confidentiality |
| `sym` — bulk encryption at rest | confidentiality |
| `sig` — signatures | authenticity, integrity |
| `cert` — certificates | authenticity, availability |

Each event declares what it `stresses`. An affected system counts against a property only when its
cryptography provides that property **and** the event stresses it. That intersection is why a
trust-chain failure reports authenticity and availability but never confidentiality, and why a
deprecation deadline reports availability and compliance but never a cryptographic break.

### Vulnerability, compliance failure, and outage are different

| `kind` | Meaning | Event |
|---|---|---|
| `vulnerability` | The math or implementation no longer protects | Q-Day, ML-KEM flaw |
| `compliance` | Sound, but no longer permitted | Protocol deprecation |
| `outage` | Identity fails across a boundary you do not control | Trust-chain failure |

A compliance event can cause an outage with nothing broken cryptographically.

### What crypto agility may improve

Discovery *within what is already catalogued*, configuration, policy enforcement, certificate and
key rotation, and the migration of eligible systems. In the model this is one dial — `orch` — and
it only ever reduces effort.

### What crypto agility must not fix

Vendor release timelines, hardware replacement, unsupported equipment, and anything not yet
catalogued. Enforced structurally, not by convention:

- Blocked systems are removed from the work set entirely, so no multiplier can touch them.
- `orch` is not an input to the visibility calculation at all.
- The residual figure is computed from vendor readiness alone; `orch` does not appear in it.

Three tests hold this line: orchestration must not change `blockedVendor`, must not change
`unknown`, and must not change `residual`.

### Comparisons hold external assumptions constant

`fragmented` is the same estate with orchestration at zero. Industry, event, vendor readiness,
inventory, team capacity, and horizon are identical on both sides, so the gap is attributable to
orchestration alone.

## How a run works

1. **Estate.** Each industry in `SCENES` is 9–11 named systems. Each has a `band` (`edge`, `app`,
   `net`, `keys`, `legacy`), a `dep` list, and optional `legacy` / `vendor` / `proto` flags.
2. **Coverage.** `ADOPTION[level].coverage` gives a share per band. The `legacy` band never exceeds
   `0.15`.
3. **Visibility.** `input.inventory` gives a share per band, multiplied by `LEGACY_VISIBILITY`
   (0.85) for the `legacy` band.
4. **Selection.** Both use `within(j, n, share, band)` → `(j + BAND_PHASE[band]) / n < share`. The
   per-band phase exists so bands do not all cross their threshold at the same slider value; without
   it, one slider point moved three systems at once. A test caps the step at 2 systems and asserts
   monotonicity.
5. **Event.** `EVENTS[key].hits(asset, ctx)` decides direct impact. Note `mlkem` hits **only**
   covered systems, and `ca` ignores coverage entirely.
6. **Classification**, in this order — the order is the model's argument:
   `unknown` → `blocked` (hardware/legacy) → `blocked` (vendor below its gate) → `exposed`.
7. **Dependents.** Neighbours in `scene.links` get `dependent` — reduced assurance, exactly one hop,
   never automatic failure.
8. **Effort.**
   ```
   load       = Σ BAND_EFFORT[band] over exposed systems
   capacity   = teams ^ 0.85
   fragmented = ceil(load × (22 + 14) / capacity)
   agile      = ceil(load × (22×(1 − 0.55×orch/100) + 14×(1 − 0.85×orch/100)) / capacity)
   residual   = blockedVendor ? round(45 + (100 − vendor) × 0.9) : 0
   reach      = affected ? round(100 × exposed / affected) : 100
   ```
   Coordination (14 days) is discounted harder than change work (22 days) because coordination is
   what crypto agility is actually for.
9. **Harvest now, decrypt later.** For events stressing confidentiality, systems in the `keys` band
   that depend on `pk` are counted in `counts.retro`. `input.horizon` is the assumed capture window
   and is reported as years of traffic — not a prediction of when anything happens. Systems holding
   data under symmetric encryption alone are excluded: AES-256 is weakened, not opened.

### Supplier gates

`vendorGate(i) = min(92, 58 + 17i)`. The *i*-th vendor-dependent affected system clears at that
readiness level, so raising vendor readiness unblocks suppliers one at a time. This replaced a
single 60% cliff where every vendor-blocked system flipped at once.

## Deliberate simplifications

Documented on the Method screen too, because a reader deserves them:

- The estate is 9–11 systems standing in for classes of system. Ratios matter, counts do not.
- Effort constants, agility ceilings, and supplier gates are stated assumptions, not measurements.
- Assurance spreads exactly one hop along a small hand-authored graph.
- Industry does not yet change the model — only the estate it runs against.
- `residual` is a single figure derived from vendor readiness, not a per-supplier schedule.

## History

The original model produced a scalar `exposure-days` from a hand-tuned formula, plus a 0–100
resilience score. Both were removed:

- The old comparison **double-counted orchestration** — `orch` lowered the shared exposure figure
  and then a second multiplier was applied on top, so the "fragmented" number was itself
  agility-adjusted.
- The old agility multiplier was **flat across all exposure**, including vendor-blocked and
  undiscovered systems, which is precisely what agility cannot reach.
- The 0–100 score was a weighting of the *inputs*, so it could disagree with the systems on the
  map. It is replaced by `reach`, derived from the outcome.

## Adding to the model

- Keep it inside the markers, pure, and deterministic.
- New outputs need a plain-language sentence a nontechnical reader can follow, and a line on the
  Method screen.
- Add the invariant to `tests/smoke.test.mjs` in the same change. The suite already encodes the
  principles above; a new mechanic that cannot be expressed as an invariant is probably not ready.
