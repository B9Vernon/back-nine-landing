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
- **COLOUR-CONTRAST RULE (permanent, Vernon-mandated):** never put near-black text on
  a dark navy/charcoal background. On dark backgrounds, body text is `#F2F2F2` (or a
  bright accent — `#96CB39` / `#D4AF57` / `#39B8DE`). Near-black (`#07090D`, `#0a2b1a`)
  is allowed ONLY as text sitting **on a bright element** — a green/blue/gold/white
  button or badge. Set `color:#F2F2F2` explicitly on every dark-section paragraph and
  table cell; do not rely on inheritance.
- Public HTTPS image URLs **or embedded base64 data URIs** (see "Embedding logos &
  images" below) — or `{{...}}` placeholders listed for replacement.
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
theme; do not flatten it. It ships with the real Back Nine emblem embedded in the hero,
verified CTA links pre-filled, the Full Swing event-code line, a clickable Golf Canada
badge, and no default "registration closes" line (Vernon removed it — reintroduce a
deadline urgency line only if he asks).

## Verified default CTA links (permanent — pre-fill these, don't placeholder them)

| Button | URL |
|---|---|
| Back Nine registration + final "Claim my spot" | `https://backninegolf.ca/local/vernonbc/tournaments/` |
| Beyond the Grass (default) | `https://www.beyondthegrass.com/compete` — **but each event gets its own special link**; keep `{{BEYOND_THE_GRASS_URL}}` and ask Vernon for the per-event link |
| FS Compete | `https://auth.fullswingapps.com/` — players then enter the Full Swing event code (`{{FULL_SWING_EVENT_CODE}}`, which lives in the portal description) |
| Golf Canada iOS | `https://apps.apple.com/ca/app/golf-canada-mobile/id635386429` |
| Golf Canada Android | `https://play.google.com/store/apps/details?id=air.com.MobileApp.GolfNet.CanadaPro` |
| Memberships | `https://backninegolf.ca/local/vernonbc/memberships/` |

Never leave a CTA button pointing at a bare `#` or an unresolved placeholder — every
button must carry a real, working href before delivery.

## Embedding logos & images

External image hosts (including `backninegolf.ca`) are blocked from this environment,
and the portal needs images that are either public HTTPS or self-contained — so **embed
brand logos and key photos as optimized base64 data URIs** so they render in the portal
with zero hosting dependency. Method (uses Pillow; `pip install Pillow` — pypi is
reachable):

1. Source assets live in the repo: Back Nine emblem `NIB2/public/assets/b9-emblem.png`
   (premium 3D "THE BACK NINE / VERNON" mark — **default hero**); wordmark
   `landing-page-files/assets/logo.png`; facility photos in `landing-page-files/assets/`
   (`swing-b9wall.jpg`, `swing-hero.jpg`, etc.).
2. Crop transparent border, resize (~340px hero emblem, ~760px section photo), save
   PNG (logos, quantized ~48 colours) or progressive JPEG q≈76–82 (photos), base64-encode.
3. Keep each embed small (emblem ≈ 25 KB base64, photo ≈ 60 KB base64). Verify the
   render in a headless browser before delivery.

The Golf Canada logo image is NOT in Vernon's branding files and can't be fetched here —
use the clickable "Golf Canada — Open the App" badge (links to the iOS app) until Vernon
supplies the official logo file/URL, then embed it and wrap it in the same link.

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
