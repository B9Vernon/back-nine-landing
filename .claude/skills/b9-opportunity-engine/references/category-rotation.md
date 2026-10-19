# Category Rotation

Do not keep returning restaurants, hotels and the same obvious categories.
Track coverage across runs and rotate.

## The wheel

1. accommodation, tourism, tours, resorts, campgrounds, vacation rentals
2. restaurants, cafés, wineries, cideries, breweries, zero-proof brands
3. employers, trades, construction, automotive, professional services,
   manufacturing, industrial
4. health, wellness, dental, chiropractic, physiotherapy, clinics, seniors
5. schools, colleges, preschools, youth programs, sports clubs, hockey,
   arts, science, recreation
6. nonprofits, charities, service clubs, cultural groups, chambers,
   business associations, community organizations
7. wedding, conference, event, catering, entertainment, transportation,
   hospitality suppliers
8. real estate, property management, strata, relocation, homebuilding,
   accommodation hosts
9. retail, personal care, fitness, barbers, salons, lifestyle
10. seasonal employers, and businesses whose staff or customers need winter
    entertainment
11. event organizers, audience holders, media, visitor channels, businesses
    with customer databases or memberships

## Rules

- No single run may take more than a third of its prospects from one wheel
  segment.
- Record each category worked with `tools/coverage_ledger.py --category`.
  The audit needs five or more before a short run can be reported.
- Prefer the segment that has been worked least recently. The ledger's
  `category` field answers that: group `state/ledger.jsonl` by category and
  by run.
- Actively look for unusual but credible connections — a bottle depot, a
  reforestation nursery, a bailiff, a medical-supply retailer have all
  scored well. Creativity has to be grounded in a real audience, not in
  novelty for its own sake.

## Categories currently thin in the ledger

Run 14's directory sweep opened these and they are nowhere near worked out:
auto parts and truck parts, industrial and machine shops, medical supply and
mobility, pawnbrokers and second-hand, towing and car wash, bottle depots
and recycling, nurseries and agriculture supply, bailiffs and collections,
sign and apparel shops, window covering and flooring.
