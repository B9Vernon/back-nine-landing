# Local Event Capture Module

Commands: `RUN LOCAL EVENT CAPTURE` (runs only this module), `IMPORT B9 INTEL`
(manual intel analysis — see below).

## Job

An opportunity scanner and campaign creator. Finds local events and timely moments,
then identifies who Neil should send campaign emails to. Never merely report "there is
an event happening" — always answer: **who already has access to the people we want,
and how does Neil reach them?** (Use the Campaign-to-Recipient Mapper.)

## For each opportunity, create

1. The local opportunity
2. The Back Nine campaign angle
3. The audience
4. The people or organizations to contact
5. Custom copy-and-paste emails
6. A recommended action plan when useful

## What to scan (public sources only)

Sports tournaments (hockey, baseball, softball, soccer, curling bonspiels, lacrosse,
volleyball, school sports), community events, SilverStar events, ski and mountain bike
events, holiday periods, long weekends, wedding weekends, conferences, business events,
trade shows, local fundraisers, concerts, tourism events, bad-weather periods,
smoke-season opportunities, cold snaps, rainy weekends, extreme heat periods, and golf
calendar moments when useful.

## Priority order

1. Vernon events
2. Events close to Back Nine Vernon
3. Events bringing visitors to Vernon
4. Events connected to hotels or accommodations
5. SilverStar traffic
6. North Okanagan events
7. Wider Okanagan only when strong enough

## Recipient discovery

For every opportunity, find the audience gatekeepers using
`references/campaign-to-recipient-mapper.md` (organizers, accommodations, teams,
vendors, venues, sponsors — ranked Priority 1–4). Also apply the B9 Audience Holder
Finder support skill (`../../b9-audience-holder-finder/SKILL.md`) to catch
audience-holder roles the mapper's opportunity-type list doesn't already name — it
layers on top of the mapper, it doesn't replace it. The module decides who should
receive the campaign; weather/smoke campaigns may route to awareness channels (social,
Google Business Profile, in-facility screens, existing customers, partner emails)
instead of cold outreach.

## Email angles differ by recipient

A tournament organizer email must not sound like a hotel email; a team manager email
must not sound like a wedding planner email. Reference angles:

- **Sports tournament organizer:** give visiting teams and families something fun to do
  between games or after the tournament day wraps up.
- **Hotel:** give guests an easy local activity while they are in town for the event.
- **Team manager:** create a relaxed team night or parent/player activity.
- **SilverStar accommodation:** offer guests a premium off-mountain activity in Vernon.
- **Conference organizer:** give attendees a more memorable after-hours experience than
  another restaurant table.
- **Wedding vendor:** give wedding groups, families, or bachelor parties something fun
  to do around the event weekend.

Every campaign email still follows the Email Builder Core locked rules: opens
"Hey, I'm Neil.", no signature.

## IMPORT B9 INTEL (manual intel)

Neil may paste or upload local information, screenshots, private group posts, customer
comments, event details, partner messages, or local chatter he legitimately has access
to. Analyze it into: campaign angle, audience, recipient targets, email drafts, social
copy, TV screen copy, action plan, and/or an outreach file.

Boundaries: never automatically scrape private Facebook groups, never bypass platform
rules, never use bots to collect private group content, never harvest private member
data. Do not reuse private group content publicly unless Neil approves. Do not reveal
private member names unless they are intended public contacts or Neil explicitly
supplies them for outreach.

## Output

```
EVENT:
CAMPAIGN ANGLE:

NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

Default file name: `B9_Local_Event_Capture_Emails.txt`
