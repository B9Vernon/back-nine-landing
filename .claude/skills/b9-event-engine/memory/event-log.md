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
- THE BIRDIE LEAGUE (Women's Six-Round Indoor Series) — league

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
- Vibrant Coral (Spectacle layer): warm coral+gold+green+blue on white/navy, bright panels, 6-round colour-chip season strip (THE BIRDIE LEAGUE) — first warm/bright identity
- Brass & Ember (Spectacle layer): DARK espresso/charcoal page, brass-gold lead + peach-copper ember, green secondary, single icy-blue frost note, metallic emblem, 10-tile season rail (THE LONG GAME) — first warm-dark identity

## Seasonal themes already used

- Summer: short single-round, flexible completion window, smoke-season-proof framing (LAST CALL SHOOTOUT)
- Summer: smoke-season two-player scramble escape (CLEAR AIR CLASSIC)
- Winter: long 10-round two-player scramble season, fire-inside/frost-outside framing (THE LONG GAME)
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
- Vernon's second feedback (2026-07-18): needed a directly testable in-chat version, three additional holes, strict increasing difficulty through black and double-black terrain, more visual pop, more pictures and heavier snow treatment.
- Second upgrade applied: nine-run ascent — Far Out, Milky Way, Big Dipper, Roller Coaster, Christmas Bowl, Attridge Face, Headwall, Freefall, Kirkenheimer; green/blue opening, black-diamond middle, double-black final two; added official SilverStar powder image panel, Back Nine facility image panel, additional snow layers, and an interactive ChatGPT tester with run selection, previous/next controls, difficulty meter, prize reveal, registration preview and crew-invite test.
- Outcome: nine-run interactive build awaiting Vernon's review.

- Vernon's third feedback (2026-07-18): confirmed the creative direction; asked whether the portal could support falling snow and clickable difficulty runs, required every call-to-action to lead somewhere, and supplied new SilverStar sunrise and fireworks photos.
- Third upgrade applied: embedded a portal-safe animated snowfall GIF that requires no JavaScript; preserved native clickable run accordions; added both supplied photos as premium gallery panels; changed the crew invite to nine-run language; added safe external-link handling; audited every CTA destination; and refreshed the in-chat tester with the new imagery plus live Back Nine, Beyond the Grass, FS Compete and email links.
- Capability note: clickable runs rely on native HTML details/summary. The animated GIF is the safest no-script snow treatment, subject to the destination portal preserving animated data images.

### THE BIRDIE LEAGUE — Women's Six-Round Indoor Series — 2026-07-19 — league
- Vernon's request: women-only league, 6 rounds, vibrant/colourful/high-action, made to make women want to join.
- Concept: six-round individual season on the simulator, live standings, one season champion; flexible per-round
  booking windows; inclusive framing (every level can win their week — exact scoring stays Vernon-controlled).
- First build to run the B9 SPECTACLE EVENT DESIGNER layer. New "Vibrant Coral" identity (warm coral #F0A57A +
  gold + green + blue on white/navy) — deliberately unlike the dark slate. Added a signature "6 Rounds" season
  strip: navy band with six colourful ROUND chips (visual structure, not a fake progress bar). In-page anchor
  jump links (hero -> #season, CTAs -> #register), no JavaScript.
- Standard approved blocks intact: opening hook, stacked (non-flex) highlight cards, image story, coral community
  block, gold prize block (approved fallback + {{PRIZE_DETAILS}}), 3-step registration (verified links +
  {{FULL_SWING_EVENT_CODE}}), Golf Canada, membership outline button, CLAIM MY SPOT NOW final CTA, footer.
- Imagery: women-only integrity — avoided the male-golfer/mixed-group stock (ph_streak/ph_vernon_data/
  ph_events_corp). Embedded interim NEUTRAL visuals only (white B9 wordmark hero; 24/7 app-in-lounge; sunset
  silhouette). Delivered women-specific photo PROMPTS + Image Replacement List so Vernon swaps in real women's
  hero/action/social/prize photography. Higgsfield MCP was disconnected at build time, so prompts (not
  generations) were provided per the Spectacle rule.
- Outcome / Vernon's feedback: pending.
- Keep next time: warm bright identity reads premium and energetic; colour-chip season strip communicates round
  count instantly; women-only pages need women-forward imagery — never default to the male-golfer stock.
- Change next time: source/generate real women golfer photos for B9 Vernon to replace the neutral interim images.

### THE LONG GAME — Winter Doubles Scramble Series — 2026-08-24 — league
- Vernon's request: 2-person scramble league, long, running over the winter, 10 rounds.
- Concept: a full winter season for two-player teams — ten scramble rounds booked in the team's own windows,
  team standings across the season, one winning pair. Endurance/partnership framing ("play the long game").
- Differentiated on purpose from prior builds: CLEAR AIR CLASSIC is also a 2-player scramble but SUMMER and
  short; TWO BALL SOCIAL is partners but ALTERNATE SHOT; FIRST FROST (Ice Blue) and MOUNTAIN CREW CUP (Alpine
  Black Diamond) already own the cold/alpine looks. So this one took a warm-dark "Brass & Ember" identity —
  fire inside vs frost outside — with icy blue used exactly once, in the "courses close" block.
- New visual devices (not reused from THE BIRDIE LEAGUE): a scramble "How A Scramble Works" 3-step explainer,
  a 10-tile season rail with the final round in solid brass, and a metallic-emblem hero. On phones the rail
  wraps 3-3-3-1 so FINAL 10 lands alone — reads as a climax, keep this.
- Standard approved blocks intact: opening hook, stacked (non-flex) highlight cards, image story, partner/social
  block, gold prize block (approved fallback + {{PRIZE_DETAILS}}), 3-step registration (verified links +
  {{FULL_SWING_EVENT_CODE}}), Golf Canada, membership, CLAIM MY SPOT NOW final CTA, footer. Hero CTA is
  BUILD YOUR TEAM (approved wording, fits a pairs league).
- Container was recycled mid-session: scratchpad + logo_uris.json were lost and the local clone was stale.
  Recovered all 21 brand images by extracting the embedded base64 data URIs from the committed builds/*.html.
  Worth remembering: the committed pages ARE the asset backup.
- Outcome / Vernon's feedback: pending.
- Keep next time: warm-dark premium look reads expensive; format explainers help for anything but stroke play.
- Change next time: no real 2-player/partner action photography yet — the social block reuses the couples/lounge
  photo. Worth shooting or generating a genuine doubles-in-a-bay image.
