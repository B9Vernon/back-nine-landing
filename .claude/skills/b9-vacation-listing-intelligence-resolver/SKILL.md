---
name: b9-vacation-listing-intelligence-resolver
description: B9 Vacation Listing Intelligence Resolver - support skill for the B9 Vacation Rental Engine. Use when a prospect starts as a public Airbnb/Vrbo/vacation-rental/chalet/guest-suite/cabin/lodge/direct-booking listing and the real operating business behind it must be identified. Resolves the listing to the host operation, property-management company, or accommodation brand, finds a verified public contact path, scores confidence, and hands the enriched prospect to the b9-vacation-rental-engine email builder. Research-only - never contacts anyone, never scrapes private data.
---

# B9 Vacation Listing Intelligence Resolver

Support skill inside the B9 Vacation Rental Engine. It improves the research and
contact-resolution stage only. The engine's workflow, email style, TXT export format
(`NAME: / EMAIL: / EMAIL SUBJECT: / EMAIL BODY:`), and Vernon-first / SilverStar-premium
geographic strategy stay exactly as defined in `b9-vacation-rental-engine`.

Core question for every public listing:

> Who actually operates, owns, manages, markets, or handles guest communication for this
> accommodation, and where can Neil reach that person or business through a verified
> public contact path?

Hard rules (inherited from the engine - never violate):
- Public sources only. Never scrape masked/hidden host data, bypass logins, or automate
  platform contact. Nothing is ever sent automatically.
- Never infer an email from a naming pattern (`info@`, `firstname@domain` guesses).
  Only use contact info actually observed in a public source.

## 1. Listing intelligence extraction
From each relevant listing, collect the strongest publicly visible clues: listing title;
property/chalet/suite/cabin/lodge/brand name; publicly displayed host, co-host, or
management-company name; area (Vernon, SilverStar, lake-area, North Okanagan); property
type; guest capacity; distinctive amenities and description wording; public registration
or licence number; nearby landmarks; ski-in/lake-access descriptions; portfolio name;
public website/social/booking-brand references; visible logos or branding; photos that
may also appear on a direct-booking site. Resolve on the *combination* of clues, never a
single clue.

## 2. Multi-source entity matching
Search across multiple public sources and use source agreement to raise confidence:
direct-booking sites, PM company sites, vacation-rental portfolios, SilverStar and
Tourism Vernon / North Okanagan directories, official lodge/chalet/boutique sites,
Google Business listings, chamber and local directories, public Facebook/Instagram/
LinkedIn business pages, tourism partner pages, booking-engine and property-specific
pages, public business-registration references, and local wedding/ski/golf/visitor
directories. Never depend on a single source for a match.

## 3. Advanced search methods
Run several query shapes per promising listing: exact listing title in quotes; property
name + Vernon / + SilverStar; distinctive description phrase + area; displayed host name
+ "vacation rental"; management-company name + contact; registration number + property
name; amenity combo + area; guest capacity + property type + location; landmark + chalet
name; rental brand + "direct booking"; listing title + "property manager" / Instagram /
Facebook / booking / accommodation. Match photos/branding against direct-booking
portfolios when visual search is available. Require several clues to agree before
confirming a match.

## 4. Property-manager portfolio discovery
When a listing looks professionally managed, inspect the operator's full public
portfolio: Vernon property count, SilverStar property count, property types, guest
profile, direct-booking site, public business email, owner/manager name when public,
guest-services and partnership/marketing contacts. When one company controls multiple
relevant properties, produce ONE strong customized email to the company, referencing
the portfolio rather than a single listing.

## 5. Operator identity classification
Classify each resolved prospect: individual host with public business presence;
direct-booking property owner; vacation-rental company; property-management company;
SilverStar chalet operator; guest-suite business; lodge/boutique accommodation; B&B
operator; tourism-listed accommodation; multi-property host; or unresolved listing.
Select the contact with the clearest authority to introduce Back Nine Vernon to guests.

## 6. Contact path discovery
Find the strongest verified public contact. Priority order:
1. Public owner/host/decision-maker email
2. Public property-management email
3. Public accommodation-company email
4. Public guest-services or reservations email
5. Official contact form
6. Official business social profile

## 7. Contact confidence model (internal 1-100 score)
Score on: exact property-name / host-manager / location match; matching photos,
description language, registration number, amenities, portfolio; direct website
confirmation; number of independent public sources; quality of the contact method.
- 90-100: confirmed direct match, strong public contact
- 75-89: highly likely match, multiple supporting clues
- 60-74: probable match with a usable business contact
- Below 60: keep researching or send to the unresolved queue
Only high-confidence, usable prospects enter the final outreach file. This internal
score feeds the engine's HIGH/MEDIUM/USABLE/LOW public-contact-confidence labels.

## 8. Distance and guest-fit enrichment
For every resolved operator, determine: Vernon vs SilverStar; approximate drive time to
Back Nine Vernon; property type; likely guest profile (family, couples, group, ski,
lake, golf, business, luxury); seasonal relevance; and the best Back Nine angle
(premium off-mountain, rainy-day, smoke-day, evening, family, couples, group night,
golf-trip add-on, rest-day, business traveller, luxury perk, welcome-book
recommendation, preferred guest invitation). Pass these into the engine's Host Website
Personalization Extractor and email builder.

## 9. SilverStar deep discovery (premium secondary)
Search chalet portfolios, ski-in/ski-out rentals, luxury vacation homes, multi-family
and group accommodations, property managers, mountain lodges, direct-booking operators,
rental agencies, concierge services, guest-services contacts, and seasonal operators.
Prioritize operators controlling several higher-value properties - one relationship
that puts Back Nine Vernon in front of many SilverStar guests.

## 10. Vernon deep discovery (always first)
Start closest to Back Nine Vernon and move outward: downtown stays, guest suites,
lake-area rentals, family rentals, furnished short stays, boutique accommodations,
B&Bs, small inns, direct-booking properties, PM portfolios, wedding-group,
sports-tournament, and business-travel stays.

## 11. Duplicate and portfolio consolidation
The same accommodation may appear on Airbnb, Vrbo, a direct site, a PM site, a tourism
directory, Google Business, Facebook, and Instagram - merge into ONE prospect. When
several properties share an operator: group under the operator, keep property names as
research context, write one high-quality email personalized around the overall guest
portfolio, never email the same company twice.

## 12. Unresolved listing queue
When a promising listing can't be confidently resolved, hold it in an internal queue
(never in the final TXT). Record: public listing title, listing URL, area, strongest
clues, searches already attempted, likely operator, missing confirmation, and the next
public source worth checking. Keep resolving strong leads before expanding geography.

## 13. Handoff to the email builder
Once operator and contact are verified, pass to `b9-vacation-rental-engine`:
accommodation/company name; contact name when verified; email; location; property type;
managed-property count when known; guest profile; Vernon or SilverStar angle;
distinctive website detail; preferred guest-experience angle; approximate distance from
Back Nine; seasonal relevance; confirmed public source links; duplicate status; contact
confidence. The engine writes the email (opens exactly `Hey, I'm Neil.`, no signature)
and produces the downloadable TXT in the standard entry format.

## QC before handoff
Confirm: listing connected to a credible public operator; contact method verified and
relevant to guest communication; location accurate; not a duplicate; portfolio
consolidated; Vernon-first followed with SilverStar as premium secondary; guest angle
specific; personalization details accurate; the final email can be customized
meaningfully.

## Relationship to companion skills
- `b9-vacation-rental-engine` - owns the workflow, email writing, QC, and TXT export.
- `b9-platform-host-contact` - fallback when this resolver exhausts Step 1-12 and no
  public off-platform path exists: drafts a manual Message-Host note Neil sends himself.
