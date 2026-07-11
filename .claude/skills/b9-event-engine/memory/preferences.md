# Vernon's Preferences

Standing preferences learned from feedback. Update whenever Vernon expresses a like,
dislike, or correction. These override defaults in the references.

## Copy

- **Likes simple, to-the-point copy** (approved the LAST CALL SHOOTOUT style, 2026-07-11).
  Keep sections tight and scannable; don't over-write.

## Formats & concepts

- _(none rejected yet)_

## Prize approaches

- _(none recorded yet — "to be announced" fallback used and accepted so far)_

## Golf Canada reward approaches

- _(none recorded yet)_

## CTA treatments (permanent rules from 2026-07-11 feedback)

- **Every CTA button must be a real, working link — never a bare `#` or unresolved
  placeholder.** Verified defaults (in `references/html-builder.md`): Back Nine
  registration + final CTA → tournaments page; Beyond the Grass → /compete (per-event
  link replaces it); FS Compete → auth.fullswingapps.com (+ event code); Golf Canada
  iOS/Android app links.
- **Remove "Registration closes …" deadline-urgency lines** from the final CTA by
  default. Field-limit scarcity is fine; reintroduce a deadline line only if Vernon asks.
- **Golf Canada section needs a clickable Golf Canada logo** (badge until the official
  logo image is supplied, then embed it).

## Visual / poster styles (permanent)

- Approved baseline: premium, dark, modern (navy/charcoal base, green accent, gold for
  prize moments) — confirmed via LAST CALL SHOOTOUT.
- **Back Nine logo must appear as the hero.** Default hero mark = the 3D emblem
  (`NIB2/public/assets/b9-emblem.png`), embedded as base64.
- **Colour-contrast rule (mandatory):** no near-black text on dark navy backgrounds
  unless it sits on a bright element (button/badge). Dark-section text = `#F2F2F2` or a
  bright accent.

## Deliverable format (permanent)

- Provide BOTH a downloadable/inspectable file AND the copy-paste-ready HTML for the
  portal Tournament Details field. Images embedded (self-contained) so nothing is broken
  on paste. Be economical — don't dump giant base64 blobs into chat.
- **Copy-paste HTML = a `.txt` copy of each build** that opens in Notepad (requested
  2026-07-11). Never paste full page code into chat.
- Batch requests ("10 different ones") mean distinct EVENTS — different concepts, copy,
  and photos — not visual variants of one event (clarified 2026-07-11).
- Highlight/feature cards must be stacked blocks, never `display:flex` — flex cards
  stretched on phones in Vernon's portal (fixed permanently in template, 2026-07-11).
