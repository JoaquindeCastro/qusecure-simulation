# Design

Visual and interaction language. The target is a polished 3D/isometric enterprise style in the
spirit of QuSecure's presentation and admin UI — not a generic SaaS dashboard.

## Principles

### Enterprise architecture is the primary visual object

The reader should spend most of their time looking at a *system*: islands, layers, buildings,
links, and the paths between them. Charts and stat tiles are supporting evidence, never the main
event. When a new screen is designed, the first question is "what does the architecture look like
here," not "which cards do we need."

### Dimensional over flat

Prefer isometric and perspective forms to rectangular cards. The existing CSS is the seed of this
language and should be extended rather than replaced:

| Primitive | Role |
|---|---|
| `.island` | An industry environment; the perspective stage |
| `.land` | The isometric ground plane (`rotateX(60deg) rotateZ(-35deg)`) |
| `.building` | The enterprise itself; industry glyph via `.health` / `.finance` / `.gov` |
| `.ring` | Orbital boundary, drawn as a flattened ellipse (`rotateX(66deg)`) |
| `.layer` | A stacked architectural tier (public edge → network/identity → applications → data/keys) |
| `.node` / `.line` | Dependency graph elements, with `.bad` / `.good` / `.unknown` states |

`.unknown` (dashed border) is worth preserving and using more: the undiscovered asset is a
first-class idea in this product, and it should look different from both safe and compromised.

### Animation carries meaning

Every animation should serve one of four beats:

**event → impact → propagation → response**

An animation that does not communicate one of those is decoration and should be cut. The scan
overlay is currently a fixed ~1900ms progress bar — a placeholder for the propagation sequence,
which is where the real animation work belongs.

Propagation should read as *sequence*, not simultaneity: the event lands somewhere, spreads along
dependency edges, and stops where something holds. Where it stops is as informative as where it
spreads.

### Progressive disclosure

Lead with a plain-language claim; put mechanism, algorithm names, and math one interaction deeper.
Define technical terms inline at first use — assume a reader who does not know what cryptography
is, and never make that reader feel it. The technical reader must still be able to reach the
mechanics; hidden is fine, unavailable is not.

### Accessibility

Not optional, and not a later pass:

- Controls stay real buttons and inputs; keyboard operability is preserved. The `select()` helper
  already maintains `aria-pressed` on option buttons — keep that contract for new option groups.
- **Every animation added needs a `prefers-reduced-motion` path.** There is currently no such
  handling anywhere in `index.html`, which is a gap, and the animation work planned above will
  make it a serious one.
- Color must not be the only carrier of meaning. `.bad` / `.good` / `.unknown` differ in border
  color and border *style*; keep a non-color signal on any new state.
- Maintain contrast against the dark ground, especially for muted text (`--muted`) on panels.

## Tokens

Defined on `:root` in `index.html`:

```
--bg    #071019    --panel #0d1823    --line #203446
--ink   #eff8ff    --muted #8ea5b6
--cyan  #69e4ff    --lime  #abff91    --amber #ffc866    --red #ff7185
```

Cyan is the product's accent and the "active/agile" signal; lime reads as protected, amber as
policy/compliance pressure, red as compromised. Keep that mapping consistent — amber for the
deprecation event and red for cryptographic break is a meaningful distinction, not a palette
choice.

Body type is Inter / system-ui at 15px; `ui-monospace` is used for the small step numerals in the
nav rail.

## Layout

- Two-column shell: a sticky 230px `.rail` with the four-step nav, and `.main` capped at 1500px.
- Below 900px the rail is hidden and every multi-column grid collapses to one column. Any new
  grid needs a matching entry in that breakpoint.
- Screens are `<section class="screen">` with a single `.active`; transitions are a short fade and
  translate on entry.

## Style constraints

All CSS lives in the single `<style>` block in `index.html`, written as one dense line. Match that
style rather than reformatting the block — see `CLAUDE.md`. No external fonts, no external assets,
no network requests; the UI promises that no data leaves the browser and the asset graph should
back that up.
