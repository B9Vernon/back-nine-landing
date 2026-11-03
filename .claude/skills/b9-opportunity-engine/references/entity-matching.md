# Entity Matching & Duplicate Suppression

The same organization appears under many labels across sources. Before
reporting, normalize and merge.

## Match the same entity across

- legal company name vs. operating name ("1234567 BC Ltd" vs. "Okanagan
  Spirits")
- shortened names ("Vernon Chamber" = "Greater Vernon Chamber of Commerce")
- franchise vs. local branch ("Boston Pizza" vs. "Boston Pizza Vernon")
- sponsor-page renderings (logos, all-caps, abbreviations)
- alternate spellings/punctuation ("Kal Tire" / "KalTire")

## Normalization procedure

1. Lowercase; strip legal suffixes (Ltd, Inc, Corp, LLP, Society), punctuation,
   and location qualifiers ("— Vernon").
2. Compare on the distinctive token(s) that remain.
3. When two candidates plausibly match, confirm via official website domain —
   same domain = same entity; different domains = keep separate.
4. Franchises: treat the *local* branch as the entity (the opportunity is
   local), but note the parent brand.

## Duplicate suppression

- One entity, several genuine opportunities → keep them, but group under the
  entity once; never list the entity twice as if it were two findings.
- One opportunity discovered via several sources → report once, backed by the
  most official source.
- Check `state/opportunity-log.md` from prior runs: re-report an item only if
  its status materially changed (new date, new signal, moved tiers) and say
  what changed.
