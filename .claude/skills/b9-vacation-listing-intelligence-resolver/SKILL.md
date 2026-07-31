---
name: b9-vacation-listing-intelligence-resolver
description: Resolution engine for the B9 Vacation Rental Opportunity Command Centre. Use when a candidate accommodation needs to be turned into a verified operator with a real contact - public Airbnb/Vrbo/chalet/guest-suite/lodge listings, thin directory entries, or any lead whose email is not obvious. Owns query mutation, listing-to-operator resolution, property-manager portfolio mining, the 10-tier contact escalation ladder, 1-100 confidence scoring, and the unresolved-lead recovery queue. Research-only - never contacts anyone.
---

# B9 Listing Intelligence Resolver

Resolution stage of the Command Centre. The orchestration, geography, email writing, and TXT
format stay in `b9-vacation-rental-engine`; this skill turns a candidate into a verified
operator with the strongest public contact path.

## Hard rules
- Public sources only. Never scrape masked host data, bypass logins, or automate contact.
- **Never infer an email from a naming pattern** (`info@`, `firstname@domain`). Only addresses
  actually observed in a public source. `[email protected]` in a snippet = source redaction.
- Never invent a property fact, portfolio size, or operator relationship to fill a gap.

## 1. Listing intelligence extraction
Collect every publicly visible clue: property/chalet/suite/cabin/lodge/brand name; listing
title; public host and co-host names; management company; registration or licence number;
neighbourhood and nearby landmarks; capacity; distinctive amenities and description wording;
visible branding; external booking references; public social identity; photos that may also
appear on a direct-booking site. **Resolve on several agreeing clues, never one.**

## 2. Advanced query mutation
For every promising lead, rotate query shapes - never repeat a weak query:
exact property name in quotes · listing title in quotes · name + Vernon · name + SilverStar ·
name + contact · name + "direct booking" · name + "property manager" · name + reservations ·
name + "guest services" · name + email · name + Facebook · name + Instagram · host name +
"vacation rental" · management company + Vernon/SilverStar · distinctive description phrase ·
licence/registration number · amenity combination + area · landmark + property type ·
image/logo matching where visual search exists.

**Highest-yield first** (this sandbox blocks direct fetching; search is the only channel):
1. `site:<operator-domain> contact email` - reads their own contact page and exposes
   plain-text addresses that snippets hide. Try this before anything else once a domain is known.
2. `"<name>" <town> "gmail.com" OR "shaw.ca" OR "telus.net"` - pins the email domain.
3. Association/chamber/tourism directories that publish member emails.
4. Named-staff, media, or rental-management pages - these surface GM/owner/manager addresses
   that beat a generic reservations inbox.

## 3. Listing-to-operator resolution
Determine who actually owns, operates, manages, markets, books, services, and communicates
with guests. Cross-reference across direct-booking sites, PM portfolios, tourism and chamber
directories, business registries, map/business listings, and public social profiles. Classify:
individual host with public business presence · direct-booking owner · vacation-rental company ·
property-management company · SilverStar chalet operator · guest-suite business · lodge or
boutique accommodation · B&B operator · tourism-listed accommodation · multi-property host ·
hotel/motel/inn · campground or RV resort with cabins · unresolved.

## 4. Property-manager portfolio miner
When a lead ties to a manager or rental company, mine the whole public portfolio: property
count, Vernon count, SilverStar count, property types, typical group size, guest profile,
direct-booking site, decision-maker, and reservations / guest-services / marketing /
partnership contacts. **One manager with 20 properties beats 20 single-property contacts** -
consolidate into one prospect and write the email around the portfolio, not one listing.

## 5. Contact path escalation ladder
Search in this priority order and stop at the highest tier actually verified:
1. Owner or operator email → 2. General manager → 3. Property manager → 4. Marketing or
partnership → 5. Guest services → 6. Reservations → 7. General accommodation email →
8. Official contact form → 9. Official business social profile → 10. Public business phone
for manual follow-up.

Hunt those paths through: contact, team, about, and staff pages · website footers · booking
pages · privacy/terms pages · public business profiles · tourism listings · public PDF
brochures and visitor guides · event and wedding-partner pages · association directories ·
public social biographies · structured page data · public `mailto:` links.

## 6. Contact confidence scorer (1-100)
Score on: exact property / company / location match · current live website and listing ·
matching photos, description, registration number · multiple independent sources · direct
decision-maker · portfolio authority · quality of the public email · likelihood this contact
controls guest communication.
- **90-100** confirmed operator, strong direct contact
- **75-89** strong match, useful business contact
- **60-74** probable match, usable public path
- **under 60** keep researching or send to the unresolved queue

Map to the file labels: HIGH (direct owner/manager email) · MEDIUM (general business email) ·
USABLE (`CONTACT FORM: url`) · LOW (social only) · NO USABLE CONTACT (exclude).
Only 60+ with a usable path enters the outreach file.

## 7. No-excuse failure recovery
A failed source triggers another path - it never ends the lead. When one route fails: change
the query · change the source · search the property name · the host name · the management
company · the registration number · a distinctive description phrase · tourism directories ·
map results · public business profiles · public social profiles · portfolio pages · booking
pages · public brochures · look for a parent company · look for related properties · move
from the individual listing up to the portfolio operator.

## 8. Unresolved lead recovery queue
Promising leads without a contact go to `b9_unresolved_leads.txt` - **never** into the
outreach file. Record: public listing/business name · listing URL · location · strongest
clues · likely operator · contact paths attempted · sources checked · what is missing · next
search method · priority. On `RESOLVE VACATION RENTAL UNRESOLVED QUEUE`, restart each lead
with new query combinations, new sources, portfolio research, and the escalation ladder.

## 9. Handoff
Pass to `b9-vacation-rental-engine`: operator name · contact name when verified · email or
contact path · confidence · property names and count · location, radius band, drive time ·
accommodation type · guest profile · strongest B9 angle · distinctive website detail ·
seasonal relevance · confirmed source URLs · duplicate status. The engine writes the email
(opening exactly `Hey, I'm Neil.`, no signature) and builds the TXT and ledger.

## QC before handoff
Operator credible and current · contact verified from a real public source and relevant to
guest communication · location accurate · not a duplicate of the Growth Database or any prior
prospect file · portfolio consolidated · guest angle specific · personalization details true ·
confidence scored · anything under 60 routed to the unresolved queue.

## Companion skills
- `b9-vacation-rental-engine` - orchestration, geography, writing, QC, deliverables.
- `b9-platform-host-contact` - last-resort manual Message-Host note when a strong prospect has
  no public off-platform path at all.
