# B9 Event Memory Log

Append-only record. Update after every IDEAS batch Vernon reacts to, every BUILD, every
UPDATE, and every piece of Vernon feedback (e.g. "this filled quickly", "description
too long", "poster too plain", "keep the structure, change the theme"). Check this file
BEFORE proposing names or themes. Preserve what works; improve what doesn't.

## Names already used

- LAST CALL SHOOTOUT (Major Week Edition) — tournament
- THE OKANAGAN INDOOR OPEN — tournament
- FIRST FROST MATCH PLAY — tournament
- CLEAR AIR CLASSIC — tournament
- HARVEST CUP — tournament
- PLAYOFF PUSH — tournament
- AFTER DARK SKINS — league
- BIG STICK CHAMPIONSHIP — tournament
- BOARDROOM CUP — league
- TWO BALL SOCIAL — league

## Visual themes already used

- Dark navy/charcoal base, green primary CTA, gold "on the line" prize block, blue Golf Canada block (LAST CALL SHOOTOUT)
- Gold Standard: black + gold championship framing (OKANAGAN INDOOR OPEN)
- Ice Blue: blue chrome over deep navy (FIRST FROST MATCH PLAY)
- Card Deck: floating section cards on black (CLEAR AIR CLASSIC)
- Badge Ceremony: circular badge hero, gold hairlines, centered (HARVEST CUP)
- Scoreboard: colored header strips + numbered cards (PLAYOFF PUSH)
- Neon Rail: left-aligned, colored side rails (AFTER DARK SKINS)
- Fairway Dusk: green-tinted gradients, tee-marker dot headers (BIG STICK CHAMPIONSHIP)
- Clean Sheet: LIGHT white/green corporate look (BOARDROOM CUP)
- Daylight Fairway: LIGHT solid-green hero band (TWO BALL SOCIAL)

## Seasonal themes already used

- Summer: short single-round, flexible completion window, smoke-season-proof framing (LAST CALL SHOOTOUT)
- Summer: smoke-season two-player scramble escape (CLEAR AIR CLASSIC)
- Summer: late-night weekly skins for packed summer schedules (AFTER DARK SKINS)
- Late summer: playoff-race points + finals night (PLAYOFF PUSH)
- Fall: outdoor-to-indoor transition knockout (FIRST FROST MATCH PLAY)
- Fall: team cup capturing summer rivalries as courses close (HARVEST CUP)
- Fall/indoor-season launch: corporate league (BOARDROOM CUP)
- Flagship/any season: 36-hole valley championship (OKANAGAN INDOOR OPEN)
- Year-round social: couples/partners league (TWO BALL SOCIAL); one-night skills party (BIG STICK CHAMPIONSHIP)

## Professional-golf themes already used

- "Final major of the year" / major-week framing, no protected names used (LAST CALL SHOOTOUT, built for the week of the year's closing men's major, mid-July 2026)
- August playoff points-race framing, generic "the pros are chasing points" — no protected names (PLAYOFF PUSH; pro playoff finale verified Aug 27-30 2026)
- Fall "golf's biggest team showdown" framing, generic — no protected names (HARVEST CUP; international team event verified Sep 22-27 2026)

## Strong concepts (worked — reuse the principle, not the name)

_(none yet — awaiting Vernon's feedback on LAST CALL SHOOTOUT)_

## Weak concepts / repeats to avoid

_(none yet)_

## Portal HTML issues discovered

_(none yet — record stripped tags, width limits, style quirks here)_

## Event records

<!-- Template for each entry:
### [EVENT NAME] — [BUILD date] — [league|tournament]
- Season / theme:
- Pro-golf tie-in:
- Format (Vernon-supplied):
- Outcome / registrations (if shared):
- Vernon's feedback:
- Keep next time:
- Change next time:
-->

### LAST CALL SHOOTOUT — Major Week Edition — 2026-07-11 — tournament
- Season / theme: Summer; single-round shootout + bonus skills hole; flexible completion window; smoke-season-proof framing
- Pro-golf tie-in: Week of the year's closing men's major (links championship, July 16-19 2026) — original name/branding only, no protected marks used
- Format (Vernon-supplied): pending — placeholder used (individual shootout recommended in concept, not finalized)
- Outcome / registrations: pending
- Vernon's feedback (2026-07-11): **liked the style — "simple and to the point."** Fixes
  requested & applied: wire all CTA buttons to real links; embed Back Nine emblem as hero;
  add clickable Golf Canada logo/badge; remove "registration closes" line; no black text
  on dark navy; deliver both a download and copy-paste HTML. Built HTML saved at
  `builds/last-call-shootout.html`.
- Keep next time: dark premium look; embedded emblem hero; verified real CTA links;
  tight copy; self-contained embedded images.
- Change next time: source the official Golf Canada logo image (badge used as interim);
  fill Vernon-controlled placeholders (dates/deadline/format/limit/fees/prize/event code)
  and the per-event Beyond the Grass link.

### 10-EVENT SLATE — 2026-07-11 — 9 new builds alongside LAST CALL SHOOTOUT
- Vernon's request: 10 different tournaments/leagues (not 10 designs of one event), varied designs,
  B9 colors/fonts, different photos, plus copy-paste HTML (.txt) for every event.
- Events built: OKANAGAN INDOOR OPEN (36-hole flagship, Gold Standard), FIRST FROST MATCH PLAY
  (knockout bracket, Ice Blue), CLEAR AIR CLASSIC (2-player smoke-season scramble, Card Deck),
  HARVEST CUP (2-player team match play cup, Badge Ceremony), PLAYOFF PUSH (3-round points race +
  finals night, Scoreboard), AFTER DARK SKINS (weekly evening skins league, Neon Rail),
  BIG STICK CHAMPIONSHIP (long drive & skills night, Fairway Dusk), BOARDROOM CUP (company-team
  league, Clean Sheet light), TWO BALL SOCIAL (couples/partners alternate-shot league, Daylight
  Fairway light). All in `builds/<slug>.html`.
- Structure per page (Vernon-approved via LAST CALL SHOOTOUT): hero / opening / 3 highlight cards
  (stacked blocks — flex removed after mobile stretching complaint) / photo block / gold prize
  block with approved fallback + {{PRIZE_DETAILS}} / 3-step registration with verified links +
  {{FULL_SWING_EVENT_CODE}} / Golf Canada block / membership outline button / CLAIM MY SPOT NOW
  final CTA / branded footer. No Event Information table, no dates (Vernon removed both).
- Photos: distinct per event from `landing-page-files/assets` (embedded base64, ≤64KB each).
  Logos: 5 Vernon-uploaded marks rotated across heroes.
- Outcome / Vernon's feedback: pending — Vernon will pick keepers and cull the rest.


### MOUNTAIN CREW CUP — 2026-07-18 — league
- Audience / theme: SilverStar Mountain Resort staff; Summit Signal visual system blending SilverStar cyan/white with Back Nine navy/green.
- League hook: private staff competition with crew pride and flexible playing windows designed around rotating resort shifts.
- Format (Vernon-supplied): pending — build avoids inventing team size, round count, dates, fees, limits, or scoring rules.
- Official-source grounding: SilverStar's official site reviewed at build time; current mountain positioning and cyan/white visual cues informed the concept. No SilverStar logo asset was copied or embedded.
- Build: portal-ready inline HTML saved at `builds/mountain-crew-cup.html`.
- Owner-controlled replacements: `{{PRIZE_DETAILS}}` and `{{FULL_SWING_EVENT_CODE}}`; verified default registration links used.
- Vernon's feedback (2026-07-18): first version was only a start; requested a much more clickable, high-end luxury presentation with SilverStar and Back Nine logos, snowflakes, named ski-run rounds, and many interactions.
- Upgrade applied: Alpine Black Diamond visual system; official SilverStar winter hero photography; current SilverStar logo + embedded Back Nine Vernon logo; interactive anchor navigation; six expandable run cards named Milky Way, Big Dipper, Roller Coaster, Christmas Bowl, Headwall, and Eldorado; crew-invite mail action; luxury prize block; four-step league explainer; three-lift registration path; 12 working interactions/links. Portal-safe inline HTML, no JavaScript.
- Outcome: upgraded build awaiting Vernon's review.
