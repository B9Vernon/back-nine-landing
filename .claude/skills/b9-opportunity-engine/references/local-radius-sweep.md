# Local Radius Sweep

Geography-first discovery. The engine searches outward from Back Nine Golf
Vernon in rings, identifying unique local businesses by LOCATION — not by
whether they look "partnership-ready" or golf-related.

## Core belief

Back Nine can potentially partner with almost any legitimate local business.
Never think narrowly. The question is always: "What can Back Nine offer this
specific business — for them, their staff, their customers, or their
visibility?" Never: "Are they already looking for a golf partnership?"

## Ring logic

The sweep origin is ALWAYS Back Nine Golf Vernon's postal code: **V1T 5B9**
(the 45th Avenue facility). Every discovery run starts there and works
outward in rings:
0–1 km → 1–2 km → 2–3 km → 3–5 km → 5–10 km → farther only when needed
(Coldstream, BX, Okanagan Landing, then Armstrong/Lumby/Lake Country).

## Read the zone ledger FIRST

`state/zone-coverage.md` records which zones have actually been swept. Pick an
UNSWEPT or STALE zone before harvesting, and append a row after the run.

Run 23 found this was the engine's largest defect: only 3% of ledger rows
carried an address and 0% carried a ring, so the engine could not tell which
ground it had covered. It fell back on category queries and directory
*ranking*, which return the same top-ranked businesses every run — and runs
18-20 read the resulting duplicate rate as the town being saturated. It was
the engine re-finding its own footprints.

Prefer directories that ENUMERATE (alphabetical indexes, category listings
whose URLs carry the business name, plaza and business-park tenant lists) over
directories that RANK. See the method note at the foot of the zone ledger.

## Method

- Anchor on postal code V1T 5B9 / the facility's address and nearby
  commercial zones.
- For each ring, enumerate: streets with storefronts, plazas, strip malls,
  business parks, shopping centres, service clusters, professional buildings.
- Query patterns: "businesses on [street] Vernon BC", "[plaza name] Vernon
  stores", "shops near [landmark] Vernon", map-style listing searches.
- Record every real, active, customer-facing or business-facing company.
- Classify by category AFTER discovery — never restrict discovery by industry.
- Do not stop at the first page of obvious results; keep sweeping until the
  requested count of unique businesses is reached.

## Exclusions

Only exclude: defunct businesses, residential-only listings, duplicates
(check `state/outreach-log.md`), and national corporate entities with no
local decision-maker where no local contact path exists.
