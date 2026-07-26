# Opportunity Log

Append-only memory shared across runs. The engine reads this before each run
(duplicate suppression, MONITOR follow-ups) and appends after each run. Do not
rewrite history; add new run blocks at the bottom.

Format per run:

```
## Run YYYY-MM-DD — scope: ...
- [TIER] Entity/Event — one-line opportunity — key date (if any)
```

## Source health notes

- 2026-07-10: Direct page fetches return HTTP 403 through the session proxy for
  castanet.net, vernonmatters.ca, vernonchamber.ca, downtownvernon.com,
  tourismvernon.com, vernon.ca, vjhfoundation.org, armstrongipe.com. Search-index
  research works and surfaces the same content; verify dates across 2+ results.
- 2026-07-26: Re-tested at run 8. `WebFetch` now returns 403 for **every** host
  tried, including chamber directories and PDF directories, and
  `curl "$HTTPS_PROXY/__agentproxy/status"` confirms the proxy is enabled with
  `selective: false`. Treat WebFetch as unavailable; do not spend calls on it.
  `WebSearch` is the only working discovery channel. Highest yield comes from
  directory-shaped queries that return many names in one snippet
  ("Lumby BC businesses names list") rather than one query per business.
- 2026-07-26: Market saturation is now the binding constraint on prospect runs,
  not search effort. Direct-email hit rate has fallen 25% → 1% across runs 2–8.
  See `references/saturation-and-run-sizing.md` before promising a run size.

---

## Run 2026-07-10 — scope: default (Vernon + North Okanagan, ~50 km, next ~90 days, all four modules)

- [ACT NOW] Crankworx SilverStar — event-week group/partnership window — Aug 6–9, 2026
- [ACT NOW] GVC Business Excellence Awards (42nd) — nominations historically open late July — late July 2026
- [ACT NOW] Downtown Vernon Association — Downtown Sounds Thursdays (Jul–Aug) + Downtown Days — Aug 8, 2026
- [COMING SOON] Corporate holiday-party booking season — packages ready by early Sept — Sept–Oct 2026
- [COMING SOON] VJH Foundation Charity Classic (17th) — Predator Ridge, 2026 date not yet published (held late Aug)
- [COMING SOON] Vernon Vipers home opener vs West Kelowna — season cross-promo — Sept 26, 2026
- [PARTNERSHIP] Prestige Vernon Lodge & Conference Centre — conference add-on / guest referral
- [PARTNERSHIP] SilverStar Mountain Resort / Destination Silver Star — weather-day + winter guest referral
- [PARTNERSHIP] Oakwyn Realty Okanagan (Vernon office, opened mid-June 2026) — realtor client events
- [PARTNERSHIP] Okanagan Spirits Craft Distillery — tasting + golf evening pairing
- [PARTNERSHIP] Greater Vernon Chamber of Commerce — member perk / host mixer
- [PARTNERSHIP] VJH Foundation — charity collaboration / winter indoor fundraiser
- [COMMUNITY] IPE & Stampede 125th, Armstrong — Sept 2–6, 2026
- [COMMUNITY] Vernon Hiring & Education Expo, Prestige Vernon Lodge — Oct 8, 2026
- [MONITOR] Vernon Active Living Centre — opening fall 2026
- [MONITOR] Vernon Ribfest — possible 2026 revival in new format
- [MONITOR] Via District (Arrowleaf) master-planned development — phase 1 ~2027
- [MONITOR] Okanagan Fall Wine Festival — 2026 dates unconfirmed
