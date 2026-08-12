# Healthcare exploded-layer prototype

This directory contains the visual decomposition for the assembled-to-exploded transition on the migration-depth screen.

## Source of truth

The master illustration remains `../healthcare.png`. Do not redraw the scene or replace it with CSS buildings. The prototype works by rendering the same master image multiple times through semantic SVG clip paths.

## Why SVG regions instead of regenerated PNG pieces

The illustration is mostly white architecture on a white background. Automatic raster background removal destroys building surfaces and introduces halos. SVG clip regions preserve the original pixels, perspective, lighting, and composition exactly while still allowing each semantic plane to move independently in CSS.

Recommended browser structure:

```html
<div class="exploded-enterprise">
  <svg class="enterprise-layer layer-public" viewBox="0 0 1122 1402">...</svg>
  <svg class="enterprise-layer layer-apps" viewBox="0 0 1122 1402">...</svg>
  <svg class="enterprise-layer layer-core" viewBox="0 0 1122 1402">...</svg>
  <svg class="enterprise-layer layer-vendor" viewBox="0 0 1122 1402">...</svg>
</div>
```

Each layer should show `../healthcare.png` clipped by the corresponding `layer-*` clipPath from `regions.svg`. Keep every SVG on the same 1122×1402 coordinate system so the assembled state reproduces the original image.

## Transition concept

1. Begin with the normal assembled healthcare illustration.
2. Briefly illuminate communication paths and the major systems to establish that cryptography exists throughout the environment.
3. Cross-fade to the layered rendering without changing apparent geometry.
4. Add perspective and separate the four semantic planes along Z plus a small Y offset so depth is legible.
5. Introduce the migration-depth selector only after the separation completes.
6. Migration states control saturation, opacity, accent glow, and connection activity on each layer.
7. Vendor/embedded systems must remain visibly incomplete even at broad migration.

Suggested depth offsets from `architecture.json` are a starting point, not a mandate. Tune them visually.

## Semantic planes

- **Public & external services** — external/admin access and ambulance/mobile care.
- **Enterprise applications** — clinician workstation, pharmacy/lab, outpatient clinic.
- **Core trust & infrastructure** — data center plus main hospital/internal infrastructure.
- **Suppliers & embedded systems** — MRI/imaging and connected clinical devices.

These planes represent *migration reach*, not a formal OSI/network stack. Do not label them as PQC Layer 1/2/3/4.

## Important modeling constraint

The visual layer assignment must not override the simulator model. If an asset is vendor-blocked, unknown, or otherwise unreachable in the model, its visual state must reflect that. Crypto agility may improve discovery and coordinated migration, but it cannot eliminate supplier release schedules, unsupported hardware, or physical replacement.

## Tuning notes

The region shapes are intentionally generous prototype masks derived from the current 1122×1402 healthcare image. They should be tuned in-browser after seeing the actual exploded animation. Preserve semantic grouping when adjusting geometry.
