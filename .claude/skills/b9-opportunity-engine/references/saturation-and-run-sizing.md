# Run Sizing

## Correction: Vernon is NOT saturated

An earlier version of this file concluded that the North Okanagan market was
worked out, on the evidence that the email hit rate fell from 25% to 1%
between runs 2 and 8. **That conclusion was wrong and it steered three runs
in the wrong direction** — first to padding lists with unreachable
businesses, then to Kelowna, which Neil correctly called too much of a
stretch.

The hit rate fell because the discovery method changed, not because the
market ran out. Runs 6-11 searched by category and harvested names; category
queries return names and essentially never return an email. See
`email-first-discovery.md` for the diagnosis and the fix.

Vernon has thousands of businesses. The ~1,760 in the log were selected by
whichever query happened to name them — that is not the same as having swept
the town. Trades, sole operators, home-based businesses, professional
practices and service companies are heavily under-represented, and those are
exactly the ones that publish a `@gmail.com` or `@shaw.ca` address.

## Geography — stay close unless told otherwise

Default and preferred: **Vernon first**, then Coldstream, Lavington, BX,
Okanagan Landing, Silver Star. Then Lumby, Armstrong, Enderby, Spallumcheen.

Lake Country, Kelowna and West Kelowna are 45-60 minutes out. The
partnership pitch weakens badly at that distance and Neil has said so.
**Do not go there unless he asks for it in the current message**, and say
plainly what the trade-off is when he does.

Salmon Arm, Sicamous and beyond: don't, unless explicitly instructed.

## Sizing the ask

Budget roughly **two searches per delivered prospect** — one to find the
email, plus the failures — with a name-harvest query for every 20-30
candidates.

| Ask | Realistic effort |
|---|---|
| 30 | 35-70 searches — a comfortable single session |
| 50 | 60-120 searches — a full session |
| 100+ | multi-session, or needs a directory export |

If the requested number does not fit, say so up front and propose one that
does. Never pad a list to hit a number, and never substitute an unreachable
business for a reachable one just to reach a count.

## When a category really is worked out

Check by dedup rate, not by feel: harvest 20 names in a category and run
`tools/dedup_check.py`. Over 60% duplicates means move to a different
category or a different part of town — not a different city.

**And before concluding anything, re-harvest that vein from a directory.**
Run 13 reported Vernon as "getting genuinely thin" on the evidence that
most categories came back 80-100% duplicate. Neil's response was that he
drives past hundreds of unlogged businesses every day, and he was right.
The dedup rate was measuring the search index, not the town: category
queries surface the same ranking businesses every time, so of course they
were already logged. Run 14 swept the same town from directory listings
and returned 7-of-7 fresh in auto parts, 3-of-3 in medical supply, 4-of-4
in pawnbrokers.

A high dedup rate means **the harvest source is exhausted**, never that
Vernon is. Change the source before you change the geography, and never
report the town as thin on category-query evidence alone.
