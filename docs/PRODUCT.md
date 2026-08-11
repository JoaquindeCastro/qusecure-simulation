# Product

What this is, who it is for, and what it must not become. Rules that constrain code live in
`CLAUDE.md`; this file holds the reasoning behind them.

## The reframe

The project began as a **Q-Day Simulator**. That framing had two problems:

1. It invited the question "when is Q-Day?", which nobody can answer, and any answer the tool
   implied would be the most memorable and least defensible thing about it.
2. It made the product about a single event, when the actual enterprise problem is that
   cryptographic assumptions change repeatedly — algorithms, protocols, policies, and trust
   anchors all shift, on their own schedules.

It is now a **Crypto Agility Stress Test**. The subject is the enterprise's *capacity to
absorb cryptographic change*, and Q-Day is one of several events used to probe it.

## The claim the product is trying to make

**Installing PQC once is not the same as becoming crypto-agile.**

An organization can adopt a post-quantum algorithm, announce it, and remain almost as brittle
as before — because the hard parts are knowing what you have, changing it under policy, and
changing it *again* when the next thing shifts. The simulation exists to make that difference
visible through mechanics rather than assertion.

Five factors move every outcome:

| Factor | What it governs |
|---|---|
| Visibility / discovery | Whether an asset can be acted on at all |
| Crypto agility | Cost and speed of changing a cryptographic decision |
| Vendor readiness | Whether a change is even available to install |
| Migration capacity | How much parallel work the organization can sustain |
| Architecture | How far a failure propagates from where it starts |

## Audience

Two readers, at once:

- **Nontechnical.** Some arrive not knowing what cryptography is, let alone what a KEM is. They
  need a plain-language path from "there is an invisible trust layer" to "here is why change is
  hard." Terms get defined inline at first use.
- **Technical / skeptical.** Security architects who will immediately ask what the model assumes.
  They need the mechanics exposed — behind progressive disclosure, but reachable, and honest
  enough to survive being checked.

Failing either reader fails the product. The first drop-off is the nontechnical reader hitting an
undefined acronym; the second is the technical reader catching a number that overclaims.

## Intended flow

```
choose industry
  → see industry-specific architecture
    → choose PQC / crypto adoption state
      → trigger a cryptographic stress event
        → watch consequences propagate
          → see recommended response
            → adjust assumptions and re-run
```

Two properties of this flow matter more than the step list:

- **The architecture is seen before the event.** The reader must have a mental model of the
  system before anything happens to it, or propagation means nothing.
- **The loop closes.** "Adjust assumptions and re-run" is where the learning happens — a
  one-shot result is a verdict, and a verdict invites argument rather than understanding.

The shipped wizard compresses this into four screens. "See industry-specific architecture" and
"watch consequences propagate" are currently static markup rather than real stages.

## Industries

Financial services, healthcare, government, critical infrastructure.

Industry is not a skin. Each should carry its own asset vocabulary, its own regulatory pressure,
and its own consequence language:

- **Financial services** — payments, core banking, trading, identity, vendor trust chains;
  transaction integrity and settlement continuity.
- **Healthcare** — patient records, clinical systems, connected and embedded devices, hospital
  networks; long-lived confidentiality of records and device fleets that cannot be patched.
- **Government** — citizen services, agency identity, critical infrastructure, archives;
  decades-long data sensitivity and procurement-bound replacement cycles.
- **Critical infrastructure** — generation, substations, refineries, water treatment, pipelines and
  the SCADA that runs them; operational technology where a forged instruction is a physical event,
  and where embedded equipment cannot be patched on any software schedule.

If a screen reads the same with the industry name swapped out, it is not finished.

## Stress events

Four events, chosen so that no single mitigation answers all of them.

**Q-Day / CRQC breaks RSA and ECC.** A cryptographically relevant quantum computer makes
classical public-key cryptography untrustworthy. Hits confidentiality (including data harvested
years earlier) and authenticity (signatures, identity). The event the product is named after —
but not the only one, and deliberately not the one that gets special treatment.

**Protocol or compliance deprecation.** A deadline prohibits something still in use — TLS 1.2 is
the worked example. Nothing is cryptographically broken. The failure mode is compliance
violation and, if you flip the switch without knowing your inventory, outage. Included because
this is the change enterprises actually face on a known date, and it exercises discovery and
policy enforcement rather than algorithm choice.

**ML-KEM implementation vulnerability.** A flaw in a specific implementation of an algorithm the
organization already migrated to. The reader who concluded "adopt PQC, done" meets the case where
having adopted PQC is not protective — what matters is whether you can find and change every
place you deployed it.

**Certificate / trust-chain failure.** A widely trusted CA is distrusted. Identity and signed
software break across boundaries the organization does not control, including vendors'.

The last two exist specifically to make the point that crypto agility is about *change*, not
about arriving at one algorithm. Any future event should be evaluated the same way: does it
probe a capability the existing four do not?

## Standing product feedback (from Meg)

Durable acceptance criteria, not a one-time changelog:

1. **Broaden beyond Q-Day to crypto agility.** Done at the framing level; still incomplete
   wherever copy or model treats Q-Day as the default case.
2. **Model partial adoption.** A public edge — Cloudflare, a CDN, a load balancer — can be
   PQ-ready while everything behind it is classical. This is the single most important false-
   confidence pattern in the product, and it is why "edge protected, enterprise unchanged" is
   the *default* adoption state rather than an edge case.
3. **Use industry-specific language throughout.**
4. **Include realistic compliance and deprecation triggers**, not only cryptographic breaks.
5. **Define technical terms inline** for nontechnical users.
6. **Animate the stress event**, so cause and consequence are experienced rather than reported.
7. **Assume some users do not know what cryptography is** when they arrive.
8. **Move toward a polished 3D/isometric enterprise visual style**, in the spirit of QuSecure's
   presentation and admin UI. See `DESIGN.md`.

## Non-goals

- **Predicting Q-Day.** No dates, no countdowns, no "years remaining" framed as a forecast.
- **Producing a risk score anyone could put in a board deck as a probability.** See the modeling
  rules in `CLAUDE.md` and `SIMULATION.md`.
- **Being a QuSecure advertisement.** The advantage of crypto agility has to fall out of
  transparent mechanics the reader can inspect and argue with. A reader who concludes "the tool
  was built to reach that conclusion" has been lost, and they will be right. If the mechanics do
  not produce the advantage, that is information — fix the mechanics or lower the claim.
- **Assessing the reader's actual organization.** This is a tabletop model with invented
  parameters, not an audit.

## What success looks like

A reader who did not know what cryptography was can explain, afterward, why an enterprise that
"already did PQC" could still be in trouble — and a security architect who watched over their
shoulder does not object to how the tool got there.
