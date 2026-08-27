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
| Coldstream — Kalamalka Rd corridor | SWEPT | 2026-08-16 | 3 | Meier's, Coldstream Market, Kal Lake Store |
| Coldstream Valley — rural/agricultural | SWEPT | 2026-08-16 | 2 | Zelaney Farms, Tony's Craft Cidery |
| Swan Lake / Old Kamloops Rd corridor | SWEPT | 2026-08-16 | 4 | campground, market, Castle hotel, Bright Angel |
| Downtown — 30th Ave core | PARTIAL | 2026-08-16 | 6 | DVA directory by category; storefronts not walked |
| Downtown — 29th/31st/32nd St cross-blocks | UNSWEPT | — | — | |
| **Industrial park — 29th-31st St, 43rd-45th Ave** | **UNSWEPT** | — | — | **Back Nine sits inside this zone. Closest ring, least worked.** |
| 27th Street corridor (Hwy 97) | UNSWEPT | — | — | main commercial spine |
| 32nd Street corridor | UNSWEPT | — | — | main commercial spine |
| 43rd / 48th Ave + Anderson Way | PARTIAL | — | — | 3 addresses in ledger, never swept |
| Village Green Centre + 27th St north | UNSWEPT | — | — | |
| Polson Place / Hwy 6 East | PARTIAL | 2026-08-16 | 0 | mall tenants are national chains; low yield |
| Fruit Union Plaza / Hwy 6 | UNSWEPT | — | — | |
| 24th-25th St industrial/service | UNSWEPT | — | — | |
| 34th St / Alexis Park Drive | UNSWEPT | — | — | |
| Waddington Drive | PARTIAL | — | — | 2 addresses in ledger |
| Okanagan Landing Road | UNSWEPT | — | — | |
| Bella Vista / Westside Rd | UNSWEPT | — | — | |
| Pleasant Valley Rd / 20th St | UNSWEPT | — | — | |
| BX / Silver Star Road foothills | SWEPT | 2026-07-25 | run-7 | worked heavily; likely stale by 2027 |
| L&A Cross Road | PARTIAL | — | — | |
| 58th Ave / north end | UNSWEPT | — | — | |

## Ring 10-30 km

| Zone | Status | Last | New found | Notes |
|---|---|---|---|---|
| Armstrong core | PARTIAL | — | — | chamber contacted; storefronts not swept |
| Enderby core | PARTIAL | — | — | chamber contacted only |
| Lumby core | PARTIAL | — | — | chamber contacted only |
| Lake Country (Main/Woodsdale/Berry) | UNSWEPT | — | — | |
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

Run 23 harvested 74 names this way and 33 were new — a 55% duplicate rate,
against run 20's 66% on a sample less than half the size.
