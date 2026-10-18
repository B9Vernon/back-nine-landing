# Zone Coverage Ledger

Which ground the engine has actually swept, and when. Created run 23, after a
ledger audit found the engine had **no spatial memory at all**:

    addresses held      75 of 1,892   (3%)
    ring recorded        0 of 1,892   (0%)
    distance recorded    0 of 1,892   (0%)
    distinct streets    22

`references/map-grid-discovery.md` has listed the Vernon zones since the early
runs. Not one had ever been executed as a street sweep. Discovery ran on
category queries ("Vernon roofing companies") and on directory *ranking*, both
of which return the same top businesses every time — so the duplicate rate
climbed, and runs 18-20 read that as the town being exhausted. It was the
engine re-finding its own footprints.

**Read this file before harvesting. Sweep an UNSWEPT or STALE zone first.**
Append a row after every prospecting run. A zone is stale after ~6 months.

## Status key

| Status | Meaning |
|---|---|
| SWEPT | worked street by street, yield recorded |
| PARTIAL | touched incidentally by a category or directory query, never swept |
| UNSWEPT | never worked |

## Vernon and area

| Zone | Status | Last | New found | Notes |
|---|---|---|---|---|
| 5000 Silver Star Rd business park | SWEPT | 2026-08-16 | 4 of 4 | one building, four tenants, none previously contacted |
| Coldstream — Kalamalka Rd corridor | SWEPT | 2026-10-16 | 3 + run 29 | Meier's, Coldstream Market, Kal Lake Store. Run 29, by trade on Facebook (no storefront walk): BMS Electric, Wise Wildlife (10203 Kalamalka Rd), plus Coldstream crews with no street listed: BTE, Blue Collar Junk, Coldstream Garage Door, Nokomis, Restoration Lands (9622 Hill Dr), Blue Rhino Fence, Talon Tree, Stirling Peters (Postill Dr), MVE Plumbing. |
| Coldstream Valley — rural/agricultural | SWEPT | 2026-08-16 | 2 | Zelaney Farms, Tony's Craft Cidery |
| Swan Lake / Old Kamloops Rd corridor | SWEPT | 2026-08-16 | 4 | campground, market, Castle hotel, Bright Angel |
| Downtown — 30th Ave core | SWEPT | 2026-10-18 | 6 + run 27 + 7 (run 31) | DVA directory by category; storefronts not walked. Run 27 (year-end): 3005-3334 30th Ave offices (Direct Travel, Teach and Learn, Lake City Law, Compass Law, Sun Valley Dentistry, Bamboo Beach, Anytime Fitness). Most were July batch-200 drafts; Gmail decided warm vs cold. Run 31, both sides by directory and Facebook: Fort Asian Food and Rich Tea (3334), Corbett Office Plus (3306), Freedom Body Piercing (3212), Record City (3127), RAKU (3318), Local Losers (3222); about 20 already logged; OH KIM (3112) caught in Gmail Sent (Jul 17). Ebenezer's (3110 29 Ave) nearby. |
| Downtown — 29th/31st/32nd St cross-blocks | PARTIAL | 2026-10-16 | 4 new + run 28 | Run 27 worked the office blocks by directory, not on foot: 32nd Ave 2903-3401 (Lighthouse, Culos, Museum, NOYFSS, John Howard, Accent PM, Diamond Dental), 32nd St 2901-3205 (Coldwell Banker, Sproing, Urban Systems), 30th St 3201 (NexusBC), 28th/29th/27th Ave (CMHA, NOFC, Hamlets, Monashee Optometry, ILV, Okanagan Spring). Retail storefronts not walked. |
| Industrial park — 29th-31st St, 43rd-45th Ave | SWEPT | 2026-10-15 | 14 | Run 26 walked 45th (2700-2900), 43rd (2700-3009), 44th (2800s) and 29th St (4500-4700). Emails found for 14; no email anywhere for Backyard Pleasures, CMQ, Mark IV, OBC, Bushpro. 3201 45 Ave itself: Rise Gymnastics (#10). Run 29, from Facebook pages: Progress Machine (104-4404 29 St), Horizon Detailing and IC's Mobile Detailing (4316 29 St), Okanagan Tree Service (4210 29 St), The Metal Garden (4700 31 St). The walk missed back-unit tenants. |
| 27th Street corridor (Hwy 97) | SWEPT | 2026-10-18 | 3 + 1 (run 31) | 3600-4900 block: dealerships (Hilltop, Dodge, Bannister GM, Watkin, Hyundai), dental/physio cluster at 4005-4412, World Health. Mostly already logged — run 26 confirmed which were actually emailed. Run 31: FACTS First Aid (4007 27 St); about 14 already logged. |
| 32nd Street corridor | SWEPT | 2026-10-18 | 2 + 3 (run 31) | 3900-4411: hotels (Sandman, Super 8 closed, Prestige), Vernon Square, insurance (Bracken, Johnston Meier), Interior Savings/United Way at 4301. Run 31, with Hwy 97 N: Canada's Best Value Inn (4006), The Cracked Pot (2101, at VJH), Cowboys Choice (7851 Hwy 97 N); about 18 already logged. |
| 43rd / 48th Ave + Anderson Way | SWEPT | 2026-10-15 | 2 new | 48th 2100-3401 (Toyota, Brandt, Genier's, Helmut's, Mediterranean, End of the Roll); Anderson Way 4800-5240 (Westland, Siwoski, Family First, NOMC). |
| Village Green Centre + 27th St north | PARTIAL | 2026-10-16 | 0 | Run 30: mall tenants are chains (Save-On, Hudson's Bay, CIBC, Browns) and a brow studio. Nothing on brief. |
| Polson Place / Hwy 6 East | SWEPT | 2026-10-18 | 0 | mall tenants are national chains; low yield. Run 31, Hwy 6 end to end: 0 new; about 3 already logged, the rest chains or non-profits; Hot Spot on Six could not be identified. |
| Fruit Union Plaza / Hwy 6 | SWEPT | 2026-10-18 | 0 | Run 30, Polson/Hwy 6: grocery, salon, pet stores, science centre. Nothing on brief. Run 31: covered by the Hwy 6 scan, nothing new. |
| 24th-25th St industrial/service | PARTIAL | 2026-10-18 | 2 + run 28 + 2 (run 31) | 5000-5400 block: E.B. Horsman, Torbram, Nedco, A J Machine, Solar Roofing (25 St). First #28 draft (never sent): Okanagan Spirits (5204 24 St), Flooring Hub and Monument (26 St), Vernon Truck Center (4700 23 St). Run 29, 25th Ave 4215-5301: Wrap A Tac and Unity MMA (4215), Paradise Dock & Lift (4311A), Air Tech Mechanical (4315), E & L Building (5301); Jetty Marine (4403 25 St), Mike V's (5401A 26 St). Run 31, 25th Ave end to end: Excellent Edge Pro Shop (5101 25 Ave); about 8 already logged. Vantastic Rentals (3208 24 St). |
| 34th St / Alexis Park Drive | PARTIAL | 2026-10-15 | 2 new | 34th St 3008-4790: Pacific Inn, HIE, Color Room, Monarch, Vernon Physio; run 27 added Flow Physio (3203 34 St). Alexis Park: only Venture Living (4240) so far. |
| Waddington Drive | PARTIAL | 2026-10-16 | 3 | Run 28 redo: ProSew (740), Combined Mechanical (920). Run 29: M&K Ready Mix (650). No email found for Fox & Sons (740), Clark Freightways, Trican, Bell Lumber & Pole, BC Fasteners (in log). |
| Okanagan Landing Road | SWEPT | 2026-10-18 | 2 + 4 (run 31) | Run 28 redo, by directory: Rotech Motor (6235). Run 29: Chapman Sand & Gravel. Okanagan Recreational Rentals and Creekside Landing already in log; the rest are a church, museum and florist. Run 31: Cruise Okanagan (7883), Outboard Waterfront Pub (7673), Vernon Kung Fu (7815), Okanagan Fixwings (6300 Tronson Rd, airport); 5 already logged; Nirvana Cabanas too small. |
| Bella Vista / Westside Rd | PARTIAL | 2026-10-18 | 1 + 0 (run 31) | Run 29, from Facebook: Full Throttle Tree Service (Westside Rd). Not walked. Run 31, Bella Vista Rd: 0 new; 3 already logged (e.g. Ringo-En Orchards, Planet Bee Honey Farm), the rest clubs, a church and a society. Westside Rd not walked. |
| Pleasant Valley Rd / 20th St | PARTIAL | 2026-10-18 | 3 + 2 (run 31) | First #28 draft (never sent), by trade directory: Evolution Mechanical (6216), NOR Renovations (6230), Valley Marine (7238), Performance Marine (4801 20 St). Run 29: Metal Roofing & Siding Experts plant (7092 Pleasant Valley Rd). Not walked. Run 31, Pleasant Valley Rd from Vernon to Armstrong: Blue Mountain Nursery (1871, Armstrong), RE/MAX North Valley (6-3495, Armstrong); about 10 already logged (e.g. Armstrong General Store, The Wild Oak Cafe); Vanspen (7092) and Exell Power (6252) have no email. |
| BX / Silver Star Road foothills | SWEPT | 2026-07-25 | run-7 | worked heavily; likely stale by 2027 |
| L&A Cross Road | PARTIAL | 2026-10-16 | 0 | Run 28 redo: Great West Equipment and Donald's in log; Gilmay RV is now at 8129 Highland Pl. No emails published. |
| 58th Ave / north end | PARTIAL | 2026-10-16 | 0 | Run 30: RONA, Walmart, Mary Brown's: chains only, no emails. |

## Ring 10-30 km

| Zone | Status | Last | New found | Notes |
|---|---|---|---|---|
| Armstrong core | PARTIAL | 2026-10-16 | 10 | Run 28 redo, by directory: Hancon, North Valley Contracting, Armstrong Auto Recycling, Ironwood Landscaping, Reimer Bros; then Blackwell Building Movers, Eagle Rock Plumbing, Dynasty West, Monashee Outdoors, Maddocks. TNJ Plumbing was already emailed Aug 13 (backfilled). No email: Quality First Motors, DHW, Armstrong Crane, Tristar (Alberta-based). aschamber.com/directory lists 127 members but masks emails. |
| Enderby core | PARTIAL | 2026-10-16 | 3 | Run 28 additions, by okanagan-local.ca: Burton Tree, Veach's Septic, Deep Creek Pools. Good Neighbour Fencing held as spare (old telus address). Starlight Drive-In and a school skipped. |
| Lumby core | PARTIAL | 2026-10-16 | 2 | Run 28 redo, from 411.ca: Rocky Mountain Concrete, Galaxie Powder Coating. Names only: Ivan's Imports, Nagy Cylinder, Coldstream Valley Stucco, Lumby Truck & Car Wash. |
| Lake Country (Main/Woodsdale/Berry) | PARTIAL | 2026-10-16 | 10 | Run 28 redo: 31 of 32 names were new to the log, the freshest ground left. Emails for Lake Country Crane, Staxon, Max Electric, Lake Country Landscaping, Kapiti, Deano's, ENCO, Pipe Piper, Hewitson, Danish. Still to look up: R&R Hoe, AppleGate, Adrenalin, Home Ready, Immaculate, Venetian, Steve's Plumbing, Viper Electric, Five Star, Virtue, Sierra, Quality Floor, Jennifer Fleming, Emax, BC Surveyors. |
| Falkland / Cherryville | UNSWEPT | — | — | |

## Method note — what actually worked in run 23

Directories that **enumerate** beat directories that **rank**:

- `members.downtownvernon.com/business-directory/Details/<slug>` — names sit
  in the URL slug, so a category-scoped search returns 8-10 named businesses
  per query
- `business.vernonchamber.ca/list/searchalpha/<letter>` — alphabetical index,
  exhaustive rather than rank-ordered
- Business-park and plaza tenant lists (leasing sites, LoopNet, developer
  pages) — surface clusters that share nothing but a postcode
- Geo-indexed directories: `vernon-bc.canada-bd.com/establishment/?page=N`,
  `vernon.infoisinfo-ca.com`, `okanagan-local.ca`, `n49.com`

- **City of Vernon business licence register** —
  `vernon.ca/business/business-licences-permits/search` — about 3,276
  licensed businesses, searchable by street address. Found run 24. This is
  the closest thing to a complete street-by-street list of the city; WebFetch
  cannot read it from this session, so it needs WebSearch-indexed pages or a
  human with a browser. Licensing: 250-550-3634.

Run 23 harvested 74 names this way and 33 were new — a 55% duplicate rate,
against run 20's 66% on a sample less than half the size.

Run 24 (Christmas-party targets, 2026-10-13): 62 harvested across the Chamber
category pages, 27th/32nd St and the industrial park; 34 new; 10 cleared the
65 fit floor. Every one of the 10 publishes a phone number and no email —
consistent with the log-wide ~26% email rate.

## Method note — run 26 (2026-10-15): finding the EMAIL is a search-mode problem

- WebFetch could not reach ANY host from this session (DNS failure on every
  site, including backninegolf.ca), and the vernon.ca licence register is
  blocked at the proxy. Discovery and email lookup ran on WebSearch alone.
- **Standard-mode WebSearch hides email addresses.** Twenty-four
  per-business lookups in standard mode returned one address; the summarizer
  said "no email found" even for businesses whose own contact page lists one
  (Courtview Dental, End of the Roll). **Extended mode** returned the address
  from the business's own site on ~60% of tries. Use `mode: "extended"` for
  the per-business email query; keep standard mode for cheap name harvests.
- Directory searches with `allowed_domains` set to yellowpages.ca,
  canpages.ca, n49.com, okanagan-local.ca and canada-bd.com enumerate a
  street well: "Vernon BC "45 Ave" business" returned eight named tenants
  with unit numbers. Searching a street name without a domain filter returns
  house listings.
- **Check Gmail Sent before deciding "new".** Run 26 found a business the
  engine had logged only by phone (Prestige Collision & Glass) that Neil
  had in fact emailed, and two the engine thought were single contacts that
  had been emailed twice (Sandman, Holiday Inn Express).


## Method note — run 28 (2026-10-16): harvest by TRADE, not by street

- Neil's rule from #27 (golfer-type, mostly men, about 30 staff or fewer,
  no non-profits or seniors) maps onto trade categories better than onto
  streets. One standard-mode directory search per trade ("electrical
  contractors Vernon BC", with the five directory domains allowed) returns
  8-15 named businesses with street addresses. Run 28 used about 25 trades
  and got 214 names. Addresses cover the main streets: 27th St/Hwy 97,
  25th Ave, 43rd-48th Ave, Anderson Way, Kalamalka Lake Rd and Pleasant
  Valley.
- **One extended search per trade category** ("Vernon BC roofing company
  email contact") returns 3-8 published addresses at once, mostly from the
  businesses' own sites. That beats one lookup per business (about 1 email
  per call). Use per-business extended lookups only to fill gaps.
  Multi-name OR queries ("A OR B OR C email") return almost nothing.
- **Check Gmail Sent by DOMAIN and by every address the log ever held**,
  not just the address being used now. Run 28 found three already-emailed
  businesses that way (Bertelsen at an old shawbiz.ca address, Valley Marine
  at ryan@, Richbuilt at darren@), plus June sends the log never recorded
  (DuMoulin Boskovich, Pro-Tow).
- Check #24's PHONE list too. screen_candidates matched neither "Sladen Moore
  CPA" nor "Sladen Moore LLP" (a run-24 phone row), so grep the run-24 rows
  by hand.

## Method note — run 28 redo (2026-10-16): Vernon trade listings are used up

- Neil rejected the first #28 draft because 63 of its 100 businesses had
  already been emailed or logged. The redo had to be all-new businesses.
- **Vernon's directory trades are saturated.** About 70% of the
  okanagan-local.ca category results were already in the log (roofing 3 of 3,
  bikes 3 of 5, marine 4 of 4, barbers 4 of 4). Expect about 2 new per
  category query now, against 5-8 a month ago.
- **Lake Country is nearly untouched**: 31 of 32 names were new. Armstrong
  and Lumby are close behind. Go there first next time, then Enderby.
- Names-only listings: one extended lookup per business finds an email about
  half the time when the business has its own site, and rarely when it
  doesn't.
- **Search budget:** WebSearch stops at 200 calls per session. The redo
  reached 108 new businesses before hitting it. Plan for about 1.5 searches
  per business found.
- **Screen-input bug:** rows with a blank address field (`Name | | email`)
  split wrongly on `' | '`, so the email landed in the wrong column and the
  email/domain checks never ran. Name checks still caught most matches.
  Split on `'|'` and strip each field.

## Method note — run 29 (2026-10-16): Vernon directories are used up; go to Facebook

- Neil: "Stay with Vernon area for now." Run 29 is Vernon and Coldstream
  only: 146 first contacts.
- Directory and own-site queries for Vernon trades now return mostly logged
  businesses. About 125 of run 29's finds were already in the log or an
  earlier file, and okanagan-local.ca has nothing new for Vernon.
- **The best source left is Facebook pages.** A standard search restricted
  to facebook.com ("Vernon BC [trade] email") surfaces small crews that
  never list on directories, and the page snippet usually shows the email.
  78 of run 29's 146 came that way. Own-site queries ("Vernon BC [trade]
  contact email", okanagan-local.ca blocked) gave 59.
- About 140 Vernon businesses turned up with no email anywhere (names in
  the run-29 scratch list, e.g. Artistic Ceramics, Stellar Craft
  Cabinetry, Black Velvet Chimney Sweeps, Hill & Son Machining).
- Gmail Sent caught four sends the log never had: Agar Schneider & Lett,
  Links Lawn & Yard (a different domain from the run-2 "Links Lawn &
  Landscaping" row), Window & Door Project Solutions, Sage Environmental.
  All are backfilled. Keep checking Sent by domain AND by the free-mail
  address before calling anything new.
- The 200-search cap per session stopped the run at 146 of the ~200 asked
  for. Continue as #147 onward in a new session.

## Method note — run 30 (2026-10-16): Vernon is close to saturated; the outer towns are not

- Neil: "Stay in Vernon... Scan all the main streets. Once that is done you
  can scan this side of Armstrong and lumby, lavington and coldstream."
- 194 searches gave 33 new fits. In Vernon, about 40 finds were already
  logged and most others were chains or off-brief retail. Street queries
  with facebook.com return storefront retail. Own-site queries by
  industrial road ("Waddington Drive Vernon BC company contact email") give
  1-2 emails each, but mostly for businesses already logged.
- Name lookups for the run-29 names-only list failed (0 of 8 unrestricted;
  about 1 in 4 restricted to facebook.com). Those businesses have no
  published email; drop the list.
- Lumby, Armstrong and Spallumcheen trade queries on facebook.com gave 1-2
  new emails each, nearly all unlogged. Own-site "contact us" queries for
  Armstrong, Spallumcheen and Coldstream also worked (Shapter, Gambrinus,
  North Valley Equipment, Coldstream Lumber, Rouck Bros).
- lumby.ca/major-employers lists Lumby firms with 10+ staff (Gudeit Bros,
  RJ Schunter, Castle Cheese, D&M Auto Recycling). None has a findable
  email.
- Next: continue the Armstrong side (Otter Lake Cross Rd, Larkin, Grandview
  Flats), Lumby (Mabel Lake Rd, Dure Meadow, Shields), Lavington and
  Coldstream by trade. Vernon only through new trade terms.

## Method note — run 31 (2026-10-18): Neil's eight main streets are about 80% contacted

- Neil: "Scan these streets in order. 30th Avenue * 32nd Street (Highway
  97) * 27th Street * Highway 6 * 25th Avenue * Okanagan Landing Road *
  Bella Vista Road * Pleasant Valley Road. Do not make up emails."
- About 155 searches gave 32 new fits: 18 on the eight streets, 11 found
  elsewhere in Vernon while scanning, 3 in Armstrong and Lumby. On the
  eight streets about 80 of the businesses that publish an email were
  already logged (64 caught by the screen, the rest by eye). Gmail Sent
  caught one more the log had missed (OH KIM Sushi & Grill, Jul 17).
- Best source for a single street: the Tourism Vernon directory
  (vernonbd.esolutionsgroup.ca) with "email" in the query; it prints the
  address and the email together. Next best: the same street restricted
  to facebook.com. n49 and Cylex show the odd email, but some listings are
  years old.
- Dead ends: chamber directories mask emails, Alignable gives names only,
  name lookups for small businesses come back empty, and goldbook.ca is
  not reachable from the search tool.
- Highway 6 and Bella Vista Road gave nothing new: Highway 6 is chains and
  non-profits; Bella Vista is orchards, clubs, a church and a society.
- Next: the main streets are done. What's left in Vernon is side streets
  and home-based crews on Facebook. The Armstrong side, Lumby, Lavington
  and Coldstream are still fresher.
