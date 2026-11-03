# A. Geo-Ring Scout

Owns the origin, the ring order, and the proof that a ring was actually
worked. Replaces the loose "work outward" instruction that let runs 10-11
jump to Kelowna while Vernon streets were still unsearched.

## Origin — verify it, don't assume it

Coordinate zero is Back Nine Golf Vernon's **verified physical address**,
postal code **V1T 5B9** (45th Avenue). Before a scan, confirm the current
street address from the official site (`https://backninegolf.ca/local/vernonbc`)
or the Google Business Profile. Never substitute downtown Vernon, "Vernon
city centre", or a postal-code centroid when the real pin is available.

If the address cannot be confirmed this session, say so in the Scan Summary
and use V1T 5B9 explicitly labelled as the fallback anchor.

## Ring order — closest first, always

| Ring | Radius | Typical ground |
|---|---|---|
| 1 | 0–1 km | 45th Ave, 43rd–48th Ave, 27th St south, Anderson Way approach |
| 2 | 1–3 km | 27th/29th/32nd St corridors, downtown 30th Ave, Polson Park |
| 3 | 3–5 km | Village Green, 48th Ave/Silver Star Rd, 25th Ave industrial |
| 4 | 5–10 km | Okanagan Landing, BX, Kalamalka Lake Rd, Predator Ridge approach |
| 5 | 10–20 km | Coldstream, Lavington, Silver Star |
| 6 | 20–30 km | Armstrong, Spallumcheen, Lumby |
| 7 | 30–40 km | Enderby, Cherryville |
| 8 | 40–50 km | Lake Country and similar — **only** when the requested count is
  unmet after rings 1–7, or Neil asks for the wider area |

**Kelowna, West Kelowna and beyond are excluded by default.** Neil approved
Kelowna once (run 10) and then withdrew it: "that's just too much of a
stretch." Include it only when the current message asks for it.

A ring is finished when its streets, plazas, business parks, institutions
and commercial clusters have each been swept from at least three source
types (see `local-directory-discovery.md`). Do not open ring N+1 with ring N
unfinished, and never pad a run with distant prospects while closer ground
is unsearched.

## Recording distance

Record road distance where a routing source gives one. Otherwise give a
straight-line estimate and **label it as approximate**. Never state a
precise distance that was not measured.

## Proving coverage

Every pass is recorded with `tools/coverage_ledger.py`:

```
python3 tools/coverage_ledger.py --run run-15 --ring 0-1km \
    --source members.downtownvernon.com --category "auto parts" \
    --examined 14 --kept 6 --dup 8
```

An underfilled run then has to pass `--audit`, which refuses to accept
"nothing else found" without a completed closest ring, three or more source
types, five or more categories, at least five organizations examined per
prospect asked, and a populated rejection ledger.
