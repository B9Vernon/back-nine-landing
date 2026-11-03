---
name: b9-audience-holder-finder
description: >-
  Support skill for the B9 growth systems (currently wired into the B9 Opportunity &
  Partnership Engine and the B9 Local Growth Command Centre's Local Event Capture and
  Outreach File modules). Finds the PERSON OR ROLE who already controls, organizes,
  manages, coaches, hosts, or communicates with a group of people Back Nine Vernon
  should be introduced to — not just the business or event itself. NEVER activates on
  its own: it runs only as an internal discovery step inside another B9 engine's
  existing workflow, after that engine has already found a business, event, venue, or
  accommodation. Produces the exact NAME:/EMAIL:/EMAIL SUBJECT:/EMAIL BODY: output the
  calling engine already uses — no new format, no new file, no schedule, no auto-send.
---

# B9 Audience Holder Finder

A support skill only. It exists to strengthen recipient discovery inside the existing
B9 engines — it does not replace, rebuild, rewrite, or disrupt any of them, and it
never runs by itself.

## What it answers

Who already communicates with, organizes, manages, hosts, coaches, influences, or
serves a group of people that Back Nine Vernon should be introduced to?

This is not "find businesses" — the calling engines already do that. It's "find the
person or role who can move a group of people toward Back Nine Vernon": a team
manager, not just the team; a property manager, not just the property; an HR contact,
not just the office.

## ABSOLUTE ACTIVATION RULE

This skill never activates on its own. It runs only when a calling B9 engine invokes
it during its own discovery process — after that engine has already found a business,
event, venue, organization, or accommodation. It never independently scans, researches,
schedules, or monitors anything.

## The five questions

Ask these for every prospect the calling engine surfaces:

1. Does this prospect have access to a larger audience?
2. Who controls or communicates with that audience?
3. Is there a public contact path for that person, role, or organization?
4. Would a custom Back Nine email make sense for them?
5. Should this contact be added to the calling engine's outreach file?

If yes to all five, hand the contact into the calling engine's existing email builder.
Do not invent a separate email style, a separate format, or a separate workflow.

## Audience-holder types to look for

Not limited to businesses — focus on roles that can move a group of people:

team managers · tournament organizers · coaches · sports association contacts ·
office managers · HR contacts · business owners · team leads · club presidents ·
event coordinators · fundraiser organizers · venue managers · hotel sales contacts ·
property managers · accommodation hosts · wedding planners · tourism operators ·
community organizers · school or parent group contacts · social club organizers ·
local group leaders

## Where each calling engine applies this

**Partnership Engine** — when a business is found, also check whether it controls an
audience: a gym has members, a realtor has clients, a dealership has staff and
customers, a physiotherapy clinic has active clients, a restaurant has regulars, a
company has employees, a sports store has athletes and parents. Layer this onto the
existing discovery → contact → dedup → fit & angle → email pipeline; don't run it as a
separate pass.

**Vacation Rental Engine** — when an accommodation is found, check whether the host or
property manager controls guest access: guest suite owner, SilverStar chalet manager,
property manager, hotel manager, B&B operator, direct-booking owner.

**Local Event Capture Module** — when an event is found, identify the audience
gatekeepers: tournament organizer, team manager, coach, league administrator, venue
contact, hotel connected to the event, sponsor contact, association coordinator. This
layers on top of — and never replaces — `campaign-to-recipient-mapper.md` where that
reference already exists; use it to catch audience-holder roles the mapper's
opportunity-type list doesn't already name.

**Local Growth Command Centre** — apply across every module whenever the strongest
opportunity is the audience behind the business or event, not the business or event
itself.

## Public source rule

Use only public information: official websites, contact pages, team pages, staff
pages, sports association pages, tournament pages, public event pages, venue
calendars, club websites, public directories, hotel/accommodation pages, tourism
pages, business websites, public social pages, public LinkedIn/company pages.

Never: scrape private Facebook groups, pull private member lists, access hidden
emails, bypass gated platforms/logins/passwords, use private guest or host
information, auto-message anyone, use fake guest accounts, or bypass any platform's
rules.

If Neil manually supplies information from a private group, screenshot, message, or
local conversation, analyze it and produce an outreach recommendation — but never
scrape or auto-collect private group data.

## Contact confidence

If the calling engine has its own contact classification (e.g. the Command Centre's
`public-contact-finder.md`), use that. Otherwise:

| Class | Meaning |
|---|---|
| HIGH CONFIDENCE | Direct email for the organizer/manager/owner/decision-maker |
| MEDIUM CONFIDENCE | General business, organization, hotel, team, or association email |
| USABLE | Contact form, inquiry page, or public submission form |
| LOW CONFIDENCE | Public social profile only |
| NO USABLE CONTACT | No clear public contact path found |

Do not discard a strong audience holder just because a direct email isn't visible —
use the best available public path and label it clearly.

## Email angle

Write to the audience holder, not their audience — explain how Back Nine Vernon
creates value for the group they serve. Pick the single strongest angle; don't list
options in the email.

- Sports team manager → a fun private activity for the team, parents, and siblings
  between games or after the season
- Office manager / HR → a memorable staff team-building night
- Vacation rental host → a premium local activity for guests during their stay
- Hotel contact → an easy, memorable thing for guests to do while visiting Vernon
- Club organizer → a social experience, fundraiser option, or member night
- Gym / health business → a fun, performance-based golf experience for active clients

## Output — unchanged from the calling engine

```
NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

Do not add sections the calling engine doesn't already use, and do not change its file
format or naming. Every body still opens with whatever locked greeting the calling
engine already uses (e.g. "Hey, I'm Neil." or that engine's personal-greeting variant)
— no signature, no phone number, no website footer, no "Best regards," no repeated name
block, never auto-sent. Gmail carries Neil's signature.

## Quality check before adding an audience holder to any output

- controls or influences a genuinely useful group
- contact path is public
- outreach angle is clear and specific to them
- email is custom, not templated
- output matches the calling engine's existing format exactly
- opens with the locked greeting the calling engine uses
- no signature included
- not a duplicate (checked against the calling engine's own dedup memory)
- doesn't disrupt an existing relationship

## What this skill must never do

- Replace or rebuild the Partnership Engine, Vacation Rental Engine, Local Event
  Capture Module, Local Growth Command Centre, the Outreach File workflow, or any
  locked email-writing process
- Create a new output format or a new file type
- Create a new database (use whatever the calling engine already has)
- Add long analysis sections or complicated reporting
- Make the workflow harder for Neil

It adds exactly one thing: a sharper answer to "who can introduce Back Nine Vernon to
a group of people?" Neil still reviews and sends every email manually.
