# B. Deep Local Discovery

Finds the prospects that are not on the first page of a search. This is the
engine's PRIMARY harvest, not a supplement — run 14 proved that category
searches return the same ranking businesses every time while directory
sweeps return the long tail (auto parts 7 fresh of 7; medical supply 3 of 3;
pawnbrokers 4 of 4).

## Method — sweep a directory, don't query a category

Use `WebSearch` with `allowed_domains` pinned to one directory at a time,
and vary the query across categories and letters rather than across
adjectives:

```
WebSearch(query="Vernon BC auto parts businesses list",
          allowed_domains=["okanagan-local.ca"])
WebSearch(query="retail health beauty personal services member",
          allowed_domains=["business.vernonchamber.ca"])
WebSearch(query="business directory member details Vernon downtown",
          allowed_domains=["members.downtownvernon.com"])
```

Highest-yield domains, in the order they have actually produced fresh names:

1. `members.downtownvernon.com` — Downtown Vernon Association members
2. `okanagan-local.ca` — dense per-category Vernon pages
3. `business.vernonchamber.ca` — Chamber members, including B2B and
   industrial firms that never rank publicly
4. `shopvernon.com` — listing pages, many with a contact sub-page
5. Plaza and mall tenant lists, business-park directories
6. Sponsor, vendor, exhibitor, tenant and member lists on event pages

## Also mine, for names a directory will not have

- event vendor and sponsor lists, club and association rosters
- school, youth-program, recreation and nonprofit directories
- local news: openings, expansions, anniversaries, hiring notices
- category **synonyms and adjacent categories** — "auto parts" also lives
  under "truck parts", "automotive supply", "parts and accessories"
- businesses with no polished website, via verified public map listings,
  Facebook business pages and directory records

## Mine legitimate public directories for verification too

## Approved sources

- Official company websites
- Public map listings and Google-Business-style public listings
- Chamber of Commerce directories (Greater Vernon, Armstrong-Spallumcheen,
  Lumby, Enderby)
- Tourism directories (Tourism Vernon, tourism association listings)
- Shopping-centre directories (Village Green Centre, plaza tenant lists)
- Downtown Vernon Association business directory
- Local business association pages
- Professional directories (law society, CPA, realtor, health colleges)
- Local event sponsor pages (sponsor lists reveal partnership-active firms)
- Public social profiles (Facebook/Instagram/LinkedIn company pages)

## Hard rules

- Public sources only. Never scrape private, gated, paid, or
  password-protected sources.
- Never bypass logins, CAPTCHAs, rate limits, or security systems.
- Business contact info only — never collect private personal data.
- If a directory page is blocked (e.g., HTTP 403 via proxy), use search-index
  results that surface the same public content, and verify across 2+ results.
