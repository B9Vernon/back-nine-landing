# I. Research Recovery Agent

A blocked, thin, missing or outdated source means **change method**, not
stop. Tool difficulty is never a reason to return weak, duplicate, distant,
invented or under-researched results.

## The recovery ladder

Work down it. Each step is a different method, not a retry of the same one.

1. **Search the official domain another way** — different page, different
   phrasing, cached listing, the site's own contact or about page.
2. **Map / Google Business Profile listing** for the business.
3. **Social and professional profiles** — public Facebook "about" pane,
   Instagram bio, LinkedIn company page.
4. **Directories and member lists** — Downtown Vernon Association, Greater
   Vernon Chamber, okanagan-local.ca, shopvernon.com, YellowPages,
   Alignable, industry association rosters.
5. **Local news and event pages** — Vernon Morning Star, Castanet, iNFOTEL,
   municipal notices, sponsor and vendor lists.
6. **Another query phrasing or a category synonym** — "auto parts" also
   lives under "truck parts", "parts and accessories", "automotive supply".
7. **Mark only the unavailable field as unverified.** Not the whole
   prospect. A business with a verified name, address and audience but no
   findable email is dropped for *this* run and left unlogged so it stays
   available later — it is not recorded as researched.
8. **Continue discovering replacements** until the requested count is met.

## Environment limitations that are real, and their recovery path

- **`WebFetch` returns HTTP 403 for every host through the agent proxy, and
  raw `curl` cannot connect.** Pages cannot be read directly. Recovery:
  `WebSearch` surfaces contact-page content inside result snippets, which is
  where nearly every verified address in runs 12-14 came from. This is a
  genuine limitation and it is stated, not worked around by guessing.
- **Contact forms cannot be submitted.** A contact page therefore never
  belongs in a `To:` line — see `storefront-contact-finder.md`.
- **Gmail MCP tools are not always connected.** When they are absent, draft
  creation is reported as unavailable and the drafts are delivered as a TXT
  file for manual paste. Never claim a Gmail draft exists that was not
  actually created.

## What may be reported as a limitation

Only after the ladder has been walked, and only with the attempted path
documented. "Search results were limited" is not a finding. "Six queries
across the official site, GBP, Facebook, the Chamber listing, okanagan-local
and two category synonyms returned no published address for this business,
so it was dropped and replaced" is.
