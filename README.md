# Crypto Agility Stress Test

A self-contained interactive tabletop model for exploring how an enterprise responds to a cryptographic change event.

## What it includes

- Healthcare, financial-services, and government environments
- Isometric 3D industry scenes and enterprise graphics
- Four adoption states, including public-edge-only PQC
- Four stress events: Q-Day, TLS policy prohibition, ML-KEM implementation flaw, and certificate-authority distrust
- Deterministic consequence and migration model
- Fragmented-versus-crypto-agile comparison
- Interactive enterprise map, recommendations, live controls, timeline, and JSON export
- Keyboard navigation, reduced-motion support, and mobile layouts

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test and build

```bash
npm run check
```

The static production files are written to `dist/`.

## Deploy on Vercel

1. Import this GitHub repository in Vercel.
2. Vercel will read `vercel.json` and run `npm run build`.
3. The output directory is `dist`.
4. No environment variables or backend services are required.

## Modeling note

This is a deterministic tabletop tool. Its severity indicators are not breach probabilities, and it does not predict when Q-Day will occur. It is designed to compare discovery, governance, migration, vendor, and orchestration assumptions transparently.
