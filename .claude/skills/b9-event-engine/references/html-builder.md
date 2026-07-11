# Portal HTML Builder — Tournament Details Field

Every complete build includes FULL HTML for the Tournament Details field. Never deliver
only a screenshot, preview, design advice, partial HTML, summary, or fragments.

## Hard requirements

- Complete and copy-paste ready (one contiguous block).
- **Inline styles only** — the portal renders the fragment inside its own page; no
  `<style>` blocks guaranteed to survive, no external CSS, **no JavaScript**.
- Fragment, not a document: no `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` — start from
  a single wrapper `<div>`.
- Responsive: `max-width` wrappers, percentage/auto widths, flexible stacks
  (`display:block` cards or simple flex with `flex-wrap:wrap`), `max-width:100%` on
  every image, generous tap targets. Assume most readers are on phones.
- Colourful and engaging — NEVER a plain, mostly white, text-heavy page. Alternate
  distinct coloured section backgrounds.
- Accessible: real heading hierarchy, alt text on every image, contrast-safe text
  (light text on navy/charcoal, dark text on green/white), minimum ~16px body size.
- Public HTTPS image URLs only (or `{{...}}` placeholders listed for replacement).
- Working CTA links (verified URLs or placeholders listed for replacement).
- No broken placeholders: every `{{...}}` in the HTML must appear in the Image or Link
  Replacement List.
- Structured to reduce unnecessary internal scrolling: tight sections, scannable cards,
  no dead space.

## Required structure (top to bottom)

1. Bold hero area (event name, one-line hook, dates strip)
2. Persuasive opening
3. Competition highlights (feature cards)
4. Image-and-copy block(s)
5. Prize section (dedicated coloured block)
6. Important event information (facts strip/table)
7. Three-step registration (numbered, three big buttons)
8. Golf Canada Record & Reward block
9. Membership section (quiet, secondary)
10. Final CTA area (most prominent button on the page)
11. Branded footer

`../templates/tournament-details.html` is the canonical skeleton — restyle it per event
theme; do not flatten it.

## Back Nine visual system

Palette (from brand reference + live landing pages):

| Token | Hex | Use |
|---|---|---|
| Back Nine green | `#96CB39` | primary accent, CTA buttons, highlights |
| deep navy | `#10171F` | dominant dark backgrounds |
| page dark | `#07090D` / `#0D1520` | deepest background bands |
| soft white | `#F2F2F2` | light text, light sections |
| charcoal | `#333333` | dark text on light sections |
| accent gold | `#D4AF57` | prize/premium accents, trophies |
| accent blue | `#39B8DE` | secondary accent, Golf Canada / info blocks |
| accent peach-copper | `#F0A57A` | warm accent, sparingly |

Dark, premium, modern is the default feel — navy/charcoal dominate, green as the
controlled signature accent, gold reserved for prize/championship moments. Never cheap,
cluttered, arcade-like, or neon-flooded. System font stack
(`-apple-system, 'Segoe UI', Roboto, sans-serif`) for reliability inside the portal.
Seasonal/thematic colour shifts are welcome as accents layered onto this system, not
replacements for it.

All CTA buttons: high contrast, bold, large padding (min ~14px 28px), rounded, full
tap-target on mobile.
