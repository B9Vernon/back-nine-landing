# Email-First Discovery (the method that actually works)

Read this before any prospect run. It replaces the count-first sweep that
produced runs 6 through 11.

## The bug this fixes

Runs 6-11 searched by CATEGORY ("top 10 barbers in Vernon BC"), collected
the names those queries returned, and only afterwards went looking for
email addresses in bulk. Category queries return names and almost never
return an address, so the email hit rate collapsed:

| Run | Method | Email hit rate |
|---|---|---|
| batch-200 | per-business | 200/200 (100%) |
| run-2, run-3 | mostly per-business | ~25% |
| run-6 | category-first | 5% |
| run-7 | category-first | 3% |
| run-8 | category-first | 1% |
| run-11 | category-first | 1.6% |

This was misread at the time as "the Vernon market is saturated". It was
not. It was the method. Vernon has thousands of businesses and the ones
already logged were selected by whichever query happened to name them, not
by whether they were reachable.

## The method

**One targeted query per business. That query is the whole job.**

```
"<Exact Business Name>" Vernon BC contact email
```

Verified live: this returns a usable address roughly half to three-quarters
of the time, against ~1-5% for a category query. It works because the
snippet for a business's own contact page usually contains the address,
while a "top 10" listicle never does.

Procedure:

1. **Name harvest (cheap) — sweep DIRECTORIES, not categories.** This is
   the run-14 correction and it matters as much as the per-business query.
   A category query ("Vernon BC fencing contractor") returns whichever
   businesses rank, and the same ones rank every time — by run 13 that was
   producing 80-100% duplicates and the false conclusion that Vernon was
   running out of businesses. Directory listing pages return the long tail
   that never ranks. Use `WebSearch` with `allowed_domains` set to one of:

   - `members.downtownvernon.com` — Downtown Vernon Association members
   - `business.vernonchamber.ca` — Greater Vernon Chamber members
   - `okanagan-local.ca` — category pages, e.g. "Vernon BC auto parts
     businesses list"
   - `shopvernon.com` — listing pages, many with a contact sub-page

   Measured on run 14, first pass, no cherry-picking:

   | Vein | Fresh / checked |
   |---|---|
   | auto parts | 7 / 7 |
   | medical supply | 3 / 3 |
   | pawnbrokers | 4 / 4 |
   | trades supply | 7 / 8 |
   | towing + tire dealers | 8 / 12 |
   | downtown DVA members | 7 / 8 |

   Category queries are now the FALLBACK, used only when a directory has
   no page for the vein you want. Names only either way — do not try to
   pull emails from harvest results.
2. **Dedup immediately.** `tools/dedup_check.py` before spending a single
   query on a business already in the log.
3. **Email query per surviving candidate.** One search each, using the
   pattern above. Budget one search per business and expect to keep about
   half.
4. **Email found → keep. No email → drop it and move on.** Do not fall back
   to a contact form or a phone number (see `storefront-contact-finder.md`).
   Do not pattern-guess an address from the domain, ever, even when a
   search result helpfully shows you the format.
5. Stop when the requested count of email-verified businesses is reached.

## Sizing a run honestly

At one query per business and roughly half converting, **plan on about two
searches per delivered prospect**, plus one name-harvest query per 20-30
candidates. A 30-business run is about 35-70 searches. A 250-business run
is not a single-session job and should not be promised as one.

If Neil asks for a number that does not fit, say so before starting and
propose the number that does.

## What still will not work

`WebFetch` returns HTTP 403 for every host through the session proxy, and
raw outbound HTTP is blocked, so contact pages cannot be read directly.
Everything above depends on the address appearing in a search snippet. That
is a real ceiling, but it sits far above where runs 6-11 landed.
