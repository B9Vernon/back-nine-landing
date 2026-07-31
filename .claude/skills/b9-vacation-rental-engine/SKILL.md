---
name: b9-vacation-rental-engine
description: B9 Vacation Rental Opportunity Command Centre for Back Nine Vernon. Use when Neil asks to find vacation-rental hosts, property managers, hotels, motels, inns, B&Bs, guest suites, cabins, chalets, lodges, resorts, or any accommodation operator near Vernon BC / SilverStar and produce copy-and-paste host outreach. Radius-first from Back Nine Vernon (V1T 5B9), resolves listings to real operators, prioritizes multi-property portfolios, and outputs a ready-to-send TXT plus an opportunity ledger. Never contacts anyone - Neil reviews and sends every message manually.
---

# B9 Vacation Rental Opportunity Command Centre

Persistent, radius-first accommodation opportunity finder for Back Nine Indoor Golf Vernon.
Upgrade of the original Vacation Rental Outreach Engine - the email workflow, tone, and TXT
format are unchanged.

Core question for every scan:

> Who controls communication with visitors staying near Back Nine Vernon, and how can Back
> Nine become a recommended activity for their guests?

## Hard rules (never violate)
- Never send email, automate outreach, or message hosts through any platform. Neil reviews
  and sends everything manually.
- Never scrape private/hidden host data, bypass logins, or defeat platform restrictions.
- Public business contact paths only. **Never guess an email from a naming pattern.**
  A snippet showing `[email protected]` is the source site redacting - not a confirmation.
- Never claim a partnership exists or invent an offer, detail, or property fact.

## Home base and geography
- **Origin (confirmed by Neil, July 2026): Back Nine Indoor Golf Vernon, 3201 45th Ave,
  Vernon BC V1T 5B9.** North-end Vernon, close to the 32nd St hotel/motel strip, the
  Anderson Way / Village Green cluster, and the Swan Lake corridor - all Band 1-2.
  Use this address as the geographic origin for every scan; do not ask again.
- Rank by **practical drive time**, not straight-line distance. A close property with awkward
  access ranks below a farther one with an easy run in.

**Radius bands** (finish the strongest practical scan in a band before moving out):
| Band | Distance | Typical area |
|---|---|---|
| 1 | 0-3 km | Downtown Vernon, East Hill, Mission Hill |
| 2 | 3-7 km | BX, Swan Lake corridor, Okanagan Landing approaches |
| 3 | 7-15 km | Coldstream, Kalamalka Lake, Okanagan Landing, Predator Ridge approaches |
| 4 | 15-30 km | SilverStar, Lavington, Armstrong side, Ellison |
| 5 | 30-60 km | Enderby, Lumby, Lake Country, Falkland, Cherryville edge |

Bands are not circles - follow roads, neighbourhoods, tourism/lake/resort areas, highway
corridors, and real visitor travel patterns. SilverStar gets a **dedicated premium sweep**
after the Vernon core, or whenever Neil asks for it.

**Band coverage log** (update every run so scans continue outward, never restart randomly):
- Bands 1-5 swept for hotels/motels/B&Bs/campgrounds/PMs across runs 1-3 (127 prospects,
  files `B9_Vacation_Rental_Engine_Prospects*.txt`). Vernon core supply is largely exhausted.
- Beyond band 5 (Salmon Arm, Sicamous, Kelowna, Shuswap) partially swept - lower guest fit.
- Known remaining gaps: see the Opportunity Gap Finder list in `b9_unresolved_leads.txt`.

## Activation commands
`RUN VACATION RENTAL ENGINE` · `RUN VACATION RENTAL ENGINE — FIND <n> NEW CONTACTS` ·
`RUN VERNON ACCOMMODATION DEEP SWEEP` · `RUN SILVERSTAR ACCOMMODATION DEEP SWEEP` ·
`RUN PROPERTY MANAGER PORTFOLIO SWEEP` · `RUN LISTING CONTACT RESOLUTION` ·
`RESOLVE VACATION RENTAL UNRESOLVED QUEUE` · `EXPAND VACATION RENTAL RADIUS` ·
`BUILD VACATION RENTAL OUTREACH FILE` · `UPDATE VACATION RENTAL DATABASE`

Constraints Neil may add: count, max radius, Vernon only, SilverStar only, property managers
only, direct email only, family / luxury / group / tournament / wedding accommodations.
**Deliver exactly the count requested** - research many more candidates internally so weak,
duplicate, outdated, or unresolved records can be dropped without shrinking the deliverable.

## Persistence standard (non-negotiable)
A blocked page, missing email, generic listing title, or weak first result is **not** a
completed search. Never reply "contact information is unavailable", "the platform hides the
host", "I couldn't find enough opportunities", or "there aren't many accommodations" until
the full fallback ladder is exhausted. For each strong candidate rotate query strategy and
source type; when one source fails, switch paths rather than repeating a weak query.
Continue until: a verified operator + contact is found; the listing is tied to a portfolio;
the strongest public contact path is located; the lead is confirmed dead/irrelevant; or every
practical public route is spent. If the requested count isn't met in the current band, move
to the next band automatically. Report a limitation only after the fallbacks are done.

### Environment fallback (this sandbox)
Direct page fetching is blocked by network policy - WebFetch and curl both return 403 at the
CONNECT tunnel. Web search is the working channel. Highest-yield techniques, in order:
1. `site:<operator-domain> contact email` - forces the engine to read their own contact page
   and surface plain-text addresses that snippets hide. **This is the single best method.**
2. `"<name>" <town> "gmail.com" OR "shaw.ca" OR "telus.net"` - pins the email domain.
3. Association / chamber / tourism directories, which publish member emails
   (bcbba.ca, chamber directories, shuswaptourism.ca, exploringenderby.com, sicamouschamber.bc.ca).
4. Named-staff pages - searching a resort's rental-management or media page often returns a
   GM/owner/accommodations-manager address, which outranks a generic reservations inbox.

## Pipeline

### A. Discovery
1. **Home-base radius mapper** - start at V1T 5B9, build the band map above, record which
   bands/zones are done.
2. **Accommodation ecosystem mapper** - within each band search every type: vacation rentals,
   guest suites, hotels, motels, lodges, inns, B&Bs, cabins, chalets, resorts, apartment
   stays, direct-booking homes, managed portfolios, ski/lake stays, wedding and
   sports-tournament lodging, group lodging, extended-stay and furnished operators, plus
   visitor-service businesses that talk to guests.
3. **Map grid discovery** - search small zones, not one broad query: downtown Vernon, East
   Hill, Mission Hill, Okanagan Landing, Swan Lake corridor, Kalamalka/Coldstream, BX,
   Predator Ridge, SilverStar, and surrounding North Okanagan visitor areas. Vary
   accommodation type per zone.
4. **Multi-source harvester** - official and direct-booking sites, PM sites, Tourism Vernon,
   Destination Silver Star, regional tourism, chambers, Google/map business listings,
   accommodation directories, resort lodging pages, public Facebook/Instagram/LinkedIn
   business pages, booking engines, event and wedding-venue partner pages, tournament
   accommodation pages, visitor guides and PDFs, local directories, and public Airbnb/Vrbo
   listings. **Treat Airbnb/Vrbo as discovery intelligence only** - resolve the real operator
   through wider public research (see `b9-vacation-listing-intelligence-resolver`).
5. **Opportunity density detector** - prioritize sources that yield many prospects at once:
   one PM with many listings, a resort area with several chalet operators, a directory full
   of direct-booking properties, a wedding venue tied to several accommodations, a tournament
   using several hotels. Work these before grinding isolated weak listings.

### B. Resolution
Hand each candidate to **`b9-vacation-listing-intelligence-resolver`**, which owns query
mutation, listing-to-operator resolution, portfolio mining, the contact-path escalation
ladder, contact confidence scoring, and the unresolved-lead recovery queue. Fall back to
**`b9-platform-host-contact`** only when a strong prospect has no public off-platform path.

### C. Qualification
6. **Guest audience fit** - couples, families, ski visitors, bikers, golfers, wedding groups,
   sports teams, tournament families, corporate/business, luxury, lake visitors, multi-family
   groups, weekend or long-stay guests. Name the strongest reason B9 improves their stay.
7. **Drive-time practicality** - classify: very convenient / convenient / reasonable
   destination / premium destination trip / weak geographic fit. Never exaggerate closeness.
8. **Seasonal opportunity** - ski, bike, wedding, tournament weekends, summer lake, rainy or
   smoke periods, holidays, school breaks, shoulder season, corporate, golf season. Emails
   should still read well outside one week unless Neil asks for a timed campaign.
9. **Opportunity priority scorer** - A: high-value operator, strong contact, strong guest fit.
   B: good opportunity, usable contact. C: smaller/less certain, worth keeping.
   UNRESOLVED: promising, needs more contact research. Quality first, but keep searching
   until the requested quantity is met.

### D. Dedupe (run before writing anything)
10. **Duplicate & portfolio consolidator** - merge the same property across Airbnb, Vrbo,
    direct site, PM page, tourism directory, social, and booking pages into one record. When
    one company runs several properties: keep property names as internal context, create one
    operator record, one best contact, one customized email. Never email one business twice.
    **Check every candidate against all of these before it enters a file:**
    - `back_nine_vernon_prospect_database.csv` - the B9 Growth Database (~2,700 businesses,
      columns `business_name, contact_page_url, main_public_phone, general_public_email`).
      It already holds ~74 accommodation operators with verified public emails - **mine it
      first on every run**; it is faster and more reliable than a cold search.
    - `B9_Vacation_Rental_Engine_Prospects.txt`, `_50_New.txt`, `_Run3.txt` (127 prospects)
    - `b9_opportunity_ledger.csv` and `b9_unresolved_leads.txt`
    - any existing partner or prior-relationship note Neil supplies

### E. Writing
11. **Host website personalization enricher** - pull 1-2 verified current details (guest type,
    portfolio size, family or luxury positioning, SilverStar/lake access, wedding or team
    groups, group capacity, concierge or guest guide, direct-booking advantage, seasonal
    emphasis). Use them naturally; never force or invent personalization.
12. **Back Nine guest angle matcher** - pick **one** strongest host-facing angle: preferred
    guest invitation, welcome-book recommendation, digital guest-guide placement, pre-arrival
    email mention, in-room QR card, concierge recommendation, family/group/evening/rainy-day/
    smoke-day/winter off-mountain/rest-day/team/wedding/corporate activity, golf-trip
    addition, premium Vernon experience, or a preferred guest perk. Do not stack angles.
13. **Host-friendly outreach writer** - write to the operator, never the guest. Frame it as a
    simple local recommendation for their welcome book, digital guide, or check-in message.
    Never ask the host to "promote us", never hand them admin work, never over-explain the
    simulator tech. Lead with guest experience and value to the accommodation.

## Email format (unchanged - do not drift)
- Body opens exactly: `Hey, I'm Neil.` (never "Hey, I'm Vernon.")
- No signature, phone, website footer, address, "Best regards", or name block - Gmail already
  appends Neil's approved signature.
- Standard penultimate line: `It's an easy way to give your guests an even better stay - the
  kind of touch that helps earn those top star ratings.` (always "helps earn" - never promise
  or guarantee ratings).
- Standard closer, one easy reply question: `Would you be open to me sending over a short
  guest-invitation blurb you could use?`
- **Preferred guest offer:** as of July 2026 Neil writes his own custom offers, so emails
  reference "a preferred guest invitation" with **no placeholder** by default. Use
  `{{PREFERRED_GUEST_DISCOUNT_OR_BONUS}}` only when Neil asks for it or explicitly runs an
  offer-driven campaign.

## Deliverables
1. **Ready-to-send outreach TXT** - only the requested number of best unique prospects, plain
   text, no markdown/tables/notes. Per entry:
   ```
   PROSPECT ###

   NAME:
   EMAIL:
   EMAIL SUBJECT:
   EMAIL BODY:
   ```
   When the best verified path is a form: `EMAIL: CONTACT FORM: <verified public URL>` -
   body still written ready to paste. Direct public email is always preferred.
2. **Opportunity ledger** (`b9_opportunity_ledger.csv`) - operator, contact name, email or
   contact path, contact confidence, property names, property count, location, radius band,
   drive time, accommodation type, guest profile, strongest B9 angle, source URLs, duplicate
   status, previous relationship, outreach status.
3. **Unresolved leads file** (`b9_unresolved_leads.txt`) - promising leads needing more
   resolution. **Never mix these into the outreach file.**
4. **Scan summary** (concise): bands completed, candidates reviewed, unique operators,
   verified contacts, contact forms, portfolios consolidated, duplicates removed, unresolved
   opportunities, next strongest search area.

## Search completeness controller
Track per run: bands completed · zones searched · source types used · queries run · candidates
reviewed · unique operators · verified contacts · forms · unresolved · duplicates merged ·
portfolios consolidated · prior relationships hit · remaining gaps. **One directory or one
search page is never a completed area.**

## Opportunity gap finder (feeds the next scan)
After each band, list what is probably still missing: direct-booking properties absent from
tourism directories · small guest suites · newly opened stays · PMs with weak search
visibility · wedding-group lodging · sports-team accommodation partners · furnished corporate
stays · multi-property hosts · SilverStar operators headquartered elsewhere · properties under
a parent company · accommodation businesses that exist only on social media.

## QC before delivery (repair, then re-check)
Scan started at V1T 5B9 · radius-first followed · Vernon searched before expanding ·
SilverStar treated as premium secondary · multiple source types used · persistent research on
strong leads · portfolios consolidated · duplicates removed (incl. Growth Database check) ·
every contact publicly verified · every email customized · every body opens `Hey, I'm Neil.` ·
no signatures/phones/footers · angle fits the guests · outreach is easy for the host ·
unresolved leads separated · requested count met exactly · no stopping at a weak first search.
Validate mechanically: grep counts for opening line, star-ratings line, closer, phone
patterns, duplicate NAME/EMAIL lines, and cross-file overlap.
