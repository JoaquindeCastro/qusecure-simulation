# Simulation model

The rules in this file are correctness requirements. A number that overclaims is the fastest way
to lose the skeptical reader described in `PRODUCT.md`.

Everything the model does today lives in one function, `calc()`, inside `index.html`.

## Principles

### Never claim more than the model knows

The output is a **deterministic tabletop comparison**: same inputs, same numbers, every time.
There is no randomness, no sampling, no distribution behind any figure.

Therefore no output may be presented as a **breach probability**, a likelihood, an expected loss,
or a forecast. "Resilience score 54" is a comparative index produced by assumptions the reader
chose; it is not a 54% anything. Copy, labels, tooltips, and any exported data must respect this.
The phrase "deterministic tabletop model" already appears in the UI — keep that promise.

### Separate the four security properties

**Confidentiality, integrity, authenticity, availability** fail differently and are remediated
differently. Collapsing them into one severity bar destroys the product's main teaching value.

- Harvest-now-decrypt-later is a *confidentiality* loss, retroactive and unfixable after the fact —
  migration limits future exposure, not past captures.
- A forged signature is an *authenticity* loss, forward-looking and fixable by rotation.
- A protocol switch-off is an *availability* event.

Q-Day hits confidentiality and authenticity. A CA distrust hits authenticity and availability. A
deprecation deadline hits availability and compliance standing. These profiles should be visible
to the reader, not averaged away.

### Separate vulnerability, compliance failure, and outage

Three distinct failure modes that the current single-severity presentation blurs:

| Mode | Meaning | Example |
|---|---|---|
| Cryptographic vulnerability | The math or implementation no longer protects | Q-Day; ML-KEM flaw |
| Compliance failure | Still cryptographically sound, but no longer permitted | TLS 1.2 after the deadline |
| Outage | The system stops working | Flipping off TLS 1.2 without knowing who used it |

A compliance event can cause an outage with nothing broken cryptographically. That is a real and
common enterprise experience and the model should be able to express it.

### What crypto agility may improve

- Discovery and inventory coverage
- Configuration and policy enforcement
- Certificate and key rotation
- Migration of **eligible** assets

### What crypto agility must not fix

- **Vendor release timelines.** If the vendor has not shipped it, orchestration cannot install it.
- **Hardware replacement.** Physical devices need physical work.
- **Unsupported legacy devices.** Some assets will never support the new primitive.
- **Undiscovered assets.** You cannot orchestrate what you have not found.

If any parameter change drives exposure toward zero, the model is wrong. There must be a floor
composed of vendor-blocked, hardware-blocked, and undiscovered exposure — and that floor must be
**identical on both sides** of the fragmented-vs-agile comparison. That identical floor *is* the
argument for inventory coverage: it is the part agility cannot reach until discovery reaches it.

### Comparisons hold external assumptions constant

Fragmented and crypto-agile runs must share industry, event, vendor readiness, migration capacity,
and horizon. **Only orchestration/agility differs.** Silently improving vendor readiness on the
agile side would produce a bigger gap and a dishonest one.

## Current implementation

Read directly from `calc()` in `index.html`. All figures are unitless model quantities.

### Inputs

| Control | Element | Range | Default |
|---|---|---|---|
| Inventory coverage | `#inventory` | 20–100 | 65 |
| Migration teams | `#teams` | 1–10 | 3 |
| Vendor readiness | `#vendor` | 10–100 | 55 |
| Orchestration coverage | `#orch` | 0–100 | 15 |
| Event horizon | `#horizon` | 1–20 | 7 |

Adoption weights (added to score): `edge 0`, `pilot 12`, `orchestrated 33`, `native 44`.
Edge is zero on purpose — public-edge PQC contributes nothing to enterprise resilience, which is
the false-confidence point from `PRODUCT.md`.

Event weights (subtracted from score): `qday 18`, `ca 15`, `mlkem 13`, `tls 10`.

### Formulas

```
score  = clamp(12, 96, round(20 + inv*0.28 + teams*2 + vendor*0.12 + orch*0.22
                             + adoptionWeight - eventWeight))
exp    = round(980 - score*9 + max(0, 60 - vendor) * 3)      // "fragmented" exposure-days
agile  = round(exp * (1 - 0.55 * orch/100))                  // "crypto-agile" exposure-days
manual = max(3, round(24 - orch*0.12 - teams*0.7))           // manual changes
```

Bar widths are `min(100, exp/9)%` and `min(100, agile/9)%`.

The `max(0, 60 - vendor) * 3` term is the one place vendor readiness resists everything else:
below 60, poor vendor readiness adds exposure that no other slider removes.

## Known modeling defects

These are live violations of the principles above, verified against the current `calc()`. Fix
them before adding model surface area, since each new metric inherits the same flaws.

**1. Orchestration is double-counted, and the "fragmented" side is not fragmented.**
`orch` raises `score`, which lowers `exp` — and then `agile` applies a *second* reduction to that
already-reduced `exp`. So the number labeled "fragmented cryptography" is itself agility-adjusted,
and the comparison does not hold assumptions constant. The two sides should be computed from one
shared set of external assumptions, with agility applied to exactly one of them.

**2. The agility multiplier discounts exposure it must not touch.**
`exp * (1 - 0.55*orch/100)` is a flat multiplier over *all* exposure, including the portion
attributable to vendor-blocked assets, unsupported hardware, and undiscovered inventory.
Orchestration currently makes undiscovered assets safer, which is precisely the thing crypto
agility cannot do. Exposure needs to be decomposed into an agility-reachable part and a blocked
floor, with the multiplier applied only to the former.

**3. The horizon slider is inert.** `#horizon` updates its own label and is never read by
`calc()`. Either wire it into the model (longer horizon → more harvest-now-decrypt-later
confidentiality exposure, more vendor timelines that resolve on their own) or remove it. A
control that visibly does nothing costs credibility with the skeptical reader.

**4. "Vendor-blocked assets: 2" is hardcoded** in the results markup with no id and no update
path. It is the exact quantity that should be derived from vendor readiness and shared as the
comparison's floor.

**5. One severity dimension.** Exposure-days is a single scalar, so the confidentiality /
integrity / authenticity / availability distinction and the vulnerability / compliance / outage
distinction cannot currently be expressed at all, regardless of event selected.

**6. Event weights are undifferentiated.** Each event is a single scalar penalty. A TLS
deprecation and a Q-Day event differ in *kind*, not in magnitude, and modeling them as 10 vs 18 on
one axis asserts they are the same thing at different volumes.

## Adding to the model

- Keep everything in `calc()` and its weight tables. Determinism, no network, no storage.
- New sliders must fit the `#id` → `#idout` label mapping in `index.html` (the `.replace()` chain)
  or extend it.
- State the unit and the meaning of any new metric in the UI. If it cannot be explained in one
  plain-language sentence to the nontechnical reader, it is not ready.
- Any new mechanic should be checkable: a reader who disagrees with an assumption should be able
  to find the control that expresses it.
