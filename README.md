# Crypto Agility Stress Test

A guided, self-contained simulation of how a cryptographic shock moves through an enterprise — and
how much of the response crypto agility can actually reach.

It does not predict Q-Day. It shows what happens when cryptographic assumptions change, and which
parts of the problem visibility, orchestration, vendor readiness and migration capacity do and do
not solve.

## What it includes

- Four industry environments — healthcare, financial services, government, critical infrastructure —
  each drawn as an isometric enterprise with 9–11 named systems
- A readiness stack showing protection penetrating from the public edge down to vendor and legacy
  equipment, which never fully covers
- Four stress events: Q-Day, protocol deprecation, a PQC implementation flaw, and trust-chain failure
- A propagation sequence animated across the selected industry's illustration
- A result that leads in plain English, separates confidentiality, authenticity, integrity and
  availability, and names what crypto agility cannot fix
- A fragmented-versus-crypto-agile comparison that holds every other assumption constant
- An explore screen where every assumption is adjustable and every number updates live
- A Method screen documenting the model and its limits in the product itself

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. `PORT` overrides the port.

## Test and build

```bash
npm run check     # tests, then the static build into dist/
```

The test suite does two things: string checks over the page, and invariant tests that evaluate the
simulation model directly — for example that orchestration can never shorten a supplier's schedule,
never discovers a system on its own, and never makes the response slower.

## Deploy

Import the repository in Vercel. It reads `vercel.json`, runs `npm run build`, and serves `dist`.
No environment variables, no backend, no runtime network access — a strict Content-Security-Policy
with `connect-src 'none'` enforces that nothing leaves the browser.

## Modeling note

This is a deterministic tabletop model. Its figures are not breach probabilities, loss estimates, or
a forecast of when Q-Day will occur — they compare assumptions you selected against each other. The
Method screen in the app, and [`docs/SIMULATION.md`](docs/SIMULATION.md), describe exactly how each
number is produced and what the model deliberately cannot tell you.
