---
name: b9-vacation-rental-engine
description: B9 Vacation Rental Engine for Back Nine Vernon. Use when Neil asks to find vacation-rental hosts, B&Bs, guest suites, chalets, property managers, or accommodation operators near Vernon BC / SilverStar and generate copy-and-paste outreach emails as a downloadable TXT file. The engine never contacts anyone - it only researches public business contact info and drafts emails for Neil to send manually.
---

# B9 Vacation Rental Engine

Purpose: find publicly listed accommodation businesses near Back Nine Vernon and produce
`B9_Vacation_Rental_Engine_Prospects.txt` with custom host-facing outreach emails Neil
copies into Gmail and sends manually.

Hard rules (never violate):
- Never send emails, automate outreach, or message hosts through any platform.
- Never scrape private/hidden host data, bypass logins or platform restrictions.
- Public business contact paths only (official websites, directories, tourism listings).
- Never claim a partnership exists or invent discounts. Use the placeholder
  `{{PREFERRED_GUEST_DISCOUNT_OR_BONUS}}` unless Neil supplies the offer.

## Defaults
- Primary area: Vernon BC. Secondary premium target: SilverStar. Then wider North Okanagan
  (Coldstream, Armstrong, Enderby, Lake Country, Lumby).
- Target count: 100 unique prospects unless Neil specifies otherwise. If public sources
  yield fewer, report the real count and what access would be needed to continue.

## Sub-skills (apply in order)

1. **Vernon-first accommodation sweep** - search outward from Back Nine Vernon: Vernon
   B&Bs/guest suites -> lake-area stays -> SilverStar -> wider North Okanagan. Sources:
   Tourism Vernon directory, bedsandbreakfasts.ca, gonorthwest.com, iloveinns.com,
   Destination Silver Star, skisilverstar.com lodging pages, chamber directories,
   property-manager sites (Silver Star Stays, Nomadics, OVHR/OkChalets, Stay Locations,
   LeaveTown).
2. **SilverStar premium guest targeting** - after Vernon. Angle: "a premium Vernon
   activity when guests want something different off the hill" (rest days, evenings,
   families/groups, higher disposable income).
3. **Direct host finder** - prefer the person/company who can actually recommend to
   guests: direct-booking sites, owner pages, PM companies, B&B sites. Skip listings with
   no realistic public contact path.
4. **Public contact confidence scorer** - HIGH: direct owner/host/manager email.
   MEDIUM: general business email. USABLE: contact form (`CONTACT FORM: url`).
   LOW: social only (`SOCIAL CONTACT: url`). NO USABLE CONTACT: exclude from main file.
5. **Property type angle matcher** - family suite = family fun; luxury chalet = premium
   off-mountain; lake rental = evening/rainy/smoke-day backup; business stay = relaxed
   after-work; group rental = groups together; SilverStar = off-hill premium.
6. **Five-star review hook builder** - lightly connect the perk to better stays and
   standing out. Never promise or guarantee reviews; never sound manipulative.
7. **Preferred guest offer handler** - every email includes the preferred guest
   invitation idea with `{{PREFERRED_GUEST_DISCOUNT_OR_BONUS}}`.
8. **Season-based angle** - winter: SilverStar/evening/family; spring: rainy-day,
   golf add-on; summer: smoke-day escape, lake add-on; fall: quiet-season perk.
9. **Travel distance practicality scorer** - favor stays whose guests can realistically
   drive to Back Nine during a stay; SilverStar still scores high on guest value.
10. **Host website personalization extractor** - pull 1-2 real details per property
    (lakefront, family-friendly, adults-only, farm stay, village location, portfolio
    size) and weave them naturally into the email.
11. **Accommodation duplicate cleaner** - merge the same property/operator across
    directories, OTAs, and PM sites; keep the best public contact source. Merge
    resort-managed lodges under their shared reservations contact (e.g. SilverStar
    resort lodges; OVHR/OkChalets share one operator).
12. **Host-friendly email tone guard** - never ask the host to do work or "promote us".
    Frame as: "a simple local recommendation for your welcome book, digital guide, or
    check-in message."
13. **No-signature Gmail formatter** - every body opens exactly `Hey, I'm Neil.`
    (never "Hey, I'm Vernon."), no signature/phone/footer/address/sign-off, ends with
    one reply question then stops. Standard closer: "Would you be open to me sending
    over a short guest-invitation blurb you could use?"
14. **TXT file export cleaner** - plain text only, no markdown/tables/notes. Per entry:

    ```
    PROSPECT ###

    NAME:
    EMAIL:
    EMAIL SUBJECT:
    EMAIL BODY:
    ```

## QC before delivery (repair, then re-check)
Unique prospects; usable contact path each; every body opens `Hey, I'm Neil.`; no
signatures/phones/footers; customized bodies and subjects; host-friendly tone; preferred
guest invitation + placeholder in every email; Vernon prioritized, SilverStar premium
secondary; duplicates merged; no private data; nothing sent automatically. Validate
mechanically (grep counts for opening line, placeholder, closer, phone patterns,
duplicate NAME lines).

## Delivery
Write `B9_Vacation_Rental_Engine_Prospects.txt`, validate, then reply with: download
link/file, prospect count, counts by contact type (direct email / contact form /
social-only), and a short Vernon vs SilverStar coverage note. Do not paste the file
into chat unless asked. Do not claim completeness without validation.

## Environment note
If direct website fetching is blocked (remote sandbox network policy), run the engine on
web-search results only: emails surface from indexed directories and official sites via
targeted queries like `"<property name>" <town> contact email`. Verify an email was
actually observed in results - never guess or fabricate addresses (search snippets that
show `[email protected]` are redacted by the source site, not confirmation).
