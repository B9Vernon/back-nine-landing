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

## Run 2026-08-15 — scope: opportunity modules 1/3/4 (first opportunity run since 2026-07-10)

Context: runs 12-20 ran module 2 (partnerships) only. This log went five weeks
without an entry and three dated windows closed unactioned — Crankworx
SilverStar (Aug 6-9), GVC Business Excellence Awards nominations (late July),
Downtown Days (Aug 8). Recorded so the gap is visible in history.

- [ACT NOW] Corporate holiday-party season — buyers choose venues late Aug-Oct
  for Nov-Dec; B9 absent from every venue directory the search surfaces
  (Eventective, Tourism Vernon) — package + listings needed this month
- [ACT NOW] VJH Foundation Charity Classic (17th) — 2025 ran Aug 24 at Predator
  Ridge, raised $500K; 2026 date unpublished — call 250-558-1362 to confirm,
  may already have passed
- [ACT NOW] IPE & Stampede 125th, Armstrong — Sept 2-6 2026 (unverified) — too
  late for a booth; play is exhibitor/volunteer wind-ups the week after
- [COMING SOON] Vernon Hiring & Education Expo — Oct 8 2026 (confirmed),
  Prestige Vernon Lodge — every hiring employer in one room
- [COMING SOON] Vernon Vipers home opener — Sept 26 2026 (unverified) — Kal
  Tire Place is <1km away; second contact, already in outreach log
- [COMING SOON] SilverStar winter season opening — late Nov — weather-day
  partnership; carried from 2026-07-10 log and still unactioned
- [COMING SOON] Curling / minor hockey / youth soccer season starts Oct-Dec —
  wind-up and fundraiser planning begins now; all three already in outreach log
- [MONITOR] Vernon Active Living Centre — opening fall 2026, date unconfirmed
- [MONITOR] Vernon Ribfest revival — unconfirmed
- [MONITOR] Via District (Arrowleaf) — phase 1 ~2027
- [MONITOR] Okanagan Fall Wine Festival — 2026 dates unconfirmed
- [MONITOR] VDPAC shows — Queen tribute Sept 13, Raine Maida Sept 16, Crash
  Test Dummies Nov 10 (confirmed) — context only, low direct value

Source health: WebFetch still HTTP 403 for every host including
calendar.tourismvernon.com, vernon.ca and vjhfoundation.org. All items above
derived from search-result text; [UNVERIFIED] items carried from the July run.

## Run 2026-08-16 — scope: opportunity modules 1/3/4 (verification pass on run 21 + new calendar depth)

Context: run 21 was written one day earlier and carried three [UNVERIFIED] and
two [LIKELY] items. This run verified them rather than re-sweeping the
calendar. Two run-21 statements were wrong; both are corrected below.

CORRECTIONS TO RUN 21
- GVC Business Excellence Awards nominations are OPEN until Sept 15 2026 (42nd
  annual), not "CLOSED late July" as runs 21 and the July log both stated. The
  July claim was carried forward twice without being checked.
- SilverStar 2026-27 alpine season opens Dec 11 2026 (to Apr 25 2027), not
  "late Nov" — three weeks later than assumed.
- Vernon Active Living Centre completion pushed to Oct 30 2026; registration
  late 2026; first programs Jan 2027. Leaves MONITOR.

- [ACT NOW] GVC Business Excellence Awards (42nd) — nominate Back Nine, 19
  categories — nominations close Sept 15 2026; 41st gala was Oct 23 2025 at
  VDPAC, 42nd date unpublished
- [ACT NOW] Corporate holiday-party season — now with verified market pricing:
  Predator Ridge from $75/person + venue fee; Vernon Yacht Club runs a shared
  "Small Business Christmas Party" (format B9 should copy); B9 still absent
  from Eventective's 112 Vernon party venues
- [ACT NOW] VJH Foundation Charity Classic — 2026 date STILL unpublished after
  two runs of searching; 16th ran Aug 24 2025 at Predator Ridge ($500K) —
  phone 250-558-1362
- [COMING SOON] Vernon Winter Carnival — HOST AN OFFICIAL EVENT; event and
  sponsorship applications close Oct 31 2026; 66th ran Feb 6-15 2026, 67th
  expected early Feb 2027 — best new find this run, missed by runs on
  2026-07-10 and 2026-08-15
- [COMING SOON] Vernon Hiring & Education Expo — Oct 8 2026 CONFIRMED, 11am,
  Prestige Vernon Lodge, organizer Black Press Media, 35+ exhibitors
- [COMING SOON] Vernon Vipers home opener — Sept 26 2026 6pm vs West Kelowna
  CONFIRMED; new signal: club launched a new brand July 20 2026, so sponsor
  inventory is being rebuilt now
- [COMING SOON] Vernon Active Living Centre — opens Oct 30 2026; not a
  competitor (aquatics/fitness); staff party + Active Living Guide angles
- [COMING SOON] SilverStar — opens Dec 11 2026; the Oct 1-Dec 10 pre-season
  gap is a new angle the "late Nov" assumption hid
- [COMING SOON] Club season wind-ups — carried; Vernon Curling Club schedule
  is behind a member login, so phone rather than search
- [COMMUNITY] IPE & Stampede Armstrong — Sept 2-6 2026 CONFIRMED (125th,
  "Shutters Up") — play is the post-event wind-ups
- [COMMUNITY] Okanagan Fall Wine Festival — Oct 26-27 2026 (upgraded from
  "dates unconfirmed", MONITOR since July)
- [COMMUNITY] BC Small Business Week — third full week of October
- [COMMUNITY] Artsolutely Holiday Market, Vernon Community Arts Centre —
  daily Nov 29 to Dec 24
- [COMMUNITY] A Victorian Christmas, Historic O'Keefe Ranch — December
- [COMMUNITY] Downtown Vernon Association December — free Saturday parking,
  gift cards at ~100 businesses; check whether B9 is on the gift-card list
- [SEARCH DEMAND] B9 ranks #1 for "indoor golf simulator Vernon BC" but is
  absent from Tourism Vernon's "Top Indoor Activities", TripAdvisor's rainy-day
  list, Okanagan Family Fun's 70+ list and Off Track Travel's 24+ list — same
  structural gap as the venue directories, second location
- [SEARCH DEMAND] Local sim competitors: Dante's Golf Lounge at The Rise (2
  Foresight bays); Vernon Golf & Country Club Trackman runs JAN-MAR ONLY, so
  VGCC members have no indoor option Oct-Dec
- [MONITOR] 42nd BEA gala date — late Oct expected, unpublished
- [MONITOR] Vernon Winter Carnival 2027 dates and theme — unannounced
- [MONITOR] Via District (Arrowleaf) — phase 1 ~2027
- [DROPPED] Vernon Ribfest — unconfirmed across three runs with no movement

Module 2 deliberately not run: run 20's coverage audit failed at 66%
duplicate rate and run 21 recommended pausing cold prospecting; one day is not
a change in conditions.

OUTREACH HALF ADDED SAME DAY — #22-B9-Opportunity-Emails.txt. Runs 21 and 22
initially shipped ZERO emails, against 11/4/10/6 for runs 17-20, because the
opportunity modules' output standard (timing-and-output.md) forbids contact
details and outreach copy. That rule is right for a scanning report and wrong
for a brief whose every item is "contact this organization" — it turned ten
verified dated hooks into homework. Ten second-contact emails written; all ten
screened as already in the outreach log, so this is follow-up, not
prospecting, and each row is marked `| follow-up 2026-08-16`.

Tooling change: verify_deliverable.py gains `--second-contact`, which INVERTS
the duplicate gate instead of skipping it — in follow-up mode every entry must
already be in the log, and an entry with no prior contact fails the run as
cold-prospecting drift. Verified by fixture: a fictional uncontacted business
is rejected.

Source health 2026-08-16: WebFetch now fails with EGRESS_BLOCKED from the
network egress proxy rather than HTTP 403 — different mechanism, same result.
Confirmed blocked: vjhfoundation.org, vernonwintercarnival.com,
okanaganedge.net. WebSearch remains the only working channel; every asserted
date was cross-checked across two or more results.
