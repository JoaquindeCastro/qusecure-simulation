# Design

The product is an interactive presentation: a guided simulation with large whitespace, large
typography, one major choice per screen, and minimal chrome. The QuSecure/WEF influence belongs in
the **illustrations and dimensionality**, not in the interface furniture.

It should not read as a security dashboard, a SOC console, an analytics product, or a control panel.

## Principles

### Enterprise architecture is the primary visual object

The reader should spend most of their time looking at a *system*. Meg Gleason's isometric
illustrations in `assets/industry/` are the spatial environment, not decoration:

- shown **whole and uncropped**, aspect ratio preserved
- never buried in small cards, never covered in dense UI
- used as the canvas for hotspots, links, and propagation states
- never competed with by CSS-drawn buildings

The one place the interface draws its own dimensional object is the readiness stack, which is a
diagram rather than a scene.

### Animation carries meaning

Every animation serves one of four beats: **event → impact → propagation → response.** Anything
else is decoration and should be cut.

The trigger sequence is the reference implementation: a burst at the centre, directly affected
systems lighting in a stagger, dependents taking on reduced assurance, the response sweeping what it
can reach, and blocked and uncatalogued systems staying flagged at the end. Where propagation stops
is as informative as where it spreads.

### Progressive disclosure

Lead with a plain-language claim; put mechanism, algorithm names, and arithmetic one interaction
deeper. Define terms inline at first use — assume a reader who does not know what cryptography is,
and never make them feel it. Sliders stay behind a disclosure until the explore screen; the full
method lives on its own screen.

### Accessibility

- Real buttons and inputs throughout; `aria-pressed` on every option group.
- Focus moves to the screen heading on navigation, so keyboard and screen-reader users land where
  sighted users look.
- The result headline is `aria-live`.
- Every animation needs a `prefers-reduced-motion` path. The global block collapses durations, and
  the trigger sequence skips straight to its end state rather than making those users wait.
- Colour is never the only signal: system states differ in border colour **and** border style
  (solid, dashed, dotted).

## Tokens

Defined on `:root` in `index.html`.

```
--paper   #fcfcfc   --surface #ffffff   --raise #f3f5f6
--ink     #0e1c26   --body    #3d4f5c   --muted #6b7c88   --faint #93a1ab
--line    #e5e9eb   --line-2  #d3dade
--teal    #0d97a4   --teal-deep #06707c   --teal-wash #e7f6f7
--slate   #33475a   --navy    #16303f
--stop    #c1483d   --warn    #b3711a    --good  #1a8a63
```

Teal is the accent and the "protection reaches here" signal, used selectively. Navy is the primary
button. The state colours carry fixed meanings and must stay consistent:

| Colour | State |
|---|---|
| `--stop` red | Exposed — the response can act, but the system is affected now |
| `--warn` amber, dashed | Blocked by vendor or hardware |
| grey, dotted | Not in the inventory |
| amber-orange | Reduced assurance (a dependent system) |
| `--good` green | Protected, or resolved by the response |

The page background is deliberately near-white (`#fcfcfc`) rather than a warmer off-white: the
illustrations have pure white backgrounds, and a warmer paper made their bounding boxes visible.

> `mix-blend-mode: multiply` looks like the obvious fix for that and does not work here — the slide
> and scene containers create stacking contexts with transparent backdrops, and the images render
> blank. This was tried and reverted; do not reach for it again.

Type is the system sans stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", …`) at 17px
base. No external fonts — the CSP forbids them and the offline promise depends on it.

## Layout

- Single centred column, `max-width: 1180px`, generous padding. No sidebar.
- Progress is a small four-step indicator at the top, hidden on the intro and the method screen.
- Screens are `<section class="screen">` with one `.on`; entry is a short rise-and-fade.
- Cards are large, with subtle borders, generous radius (`--r-lg: 26px`), and soft shadows.
- Below 940px every multi-column grid collapses to one column. Any new grid needs an entry in that
  breakpoint. Verified: no horizontal overflow at 486px.
- The scene is aspect-locked to `1122/1402` so hotspot percentages always align with the artwork,
  and capped at `min(455px, 52vh)` so the trigger button stays on screen with it.

## Style constraints

All CSS lives in the single `<style>` block in `index.html`, written readably. No external assets of
any kind: the UI promises nothing leaves the browser, and `vercel.json` enforces it.
