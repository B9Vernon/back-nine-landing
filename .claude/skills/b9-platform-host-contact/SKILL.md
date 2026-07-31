---
name: b9-platform-host-contact
description: Find a contact path for VRBO / Airbnb hosts near Vernon BC for the B9 Vacation Rental Engine. Use when a good prospect only exists as a platform listing. Cross-references the listing to the host's public business identity to find an off-platform email or website, and drafts short "Message Host" notes that NEIL SENDS MANUALLY through the platform's own button. Never automates platform messaging, never poses as a guest, never scrapes hidden host data.
---

# B9 Platform Host Contact Finder

Goal: turn a VRBO or Airbnb listing into a usable contact path for Neil's manual outreach.

## Hard rules
- The engine NEVER sends platform messages, automates the Message Host button, logs into
  platforms, bypasses CAPTCHAs, or scrapes non-public host data. Neil presses the button
  and pastes the text himself, one host at a time.
- Messages must be transparent: Neil identifies himself as the owner of Back Nine Vernon
  making a local-partnership suggestion. Never pose as a guest or fake a booking inquiry.
- Respect platform rules: keep manual platform messages short, low-volume, and offer to
  move to the host's public business channel. If a host says no, they are removed from
  all future lists.

This skill is the **last resort** in the B9 Vacation Rental Opportunity Command Centre.
Reach it only after `b9-vacation-listing-intelligence-resolver` has run its full ladder -
query mutation, portfolio mining, the 10-tier contact escalation, and the no-excuse failure
recovery routes - and found no public off-platform path at all.

## Step 1 - Listing-to-owner cross-reference (preferred path)
For the full deep-research version of this step (multi-source entity matching,
portfolio discovery, 1-100 confidence scoring, unresolved queue), use the companion
`b9-vacation-listing-intelligence-resolver` skill. The quick version below covers the
basics; only fall through to Step 2 after the resolver has exhausted public paths.

Work from public data visible on or around the listing:
1. Host name / host profile blurb (e.g. "Hosted by Sandy & Mike", "Managed by Silver
   Star Stays") - property managers named on listings almost always have public websites.
2. Listing title and photos - search the exact property name ("Grandview Chalet Silver
   Star") across Google, tourism directories, and Facebook; direct-booking sites for the
   same property usually rank.
3. Cross-listing check - the same property on VRBO, Airbnb, OwnerDirect, cozycozy, or a
   tourism directory often exposes a direct site on one of them.
4. Business registries and chamber/tourism member directories for the host's name.
If a public email or contact form is found, score it with the confidence scorer from
`b9-vacation-rental-engine` and add the prospect to the main TXT.

## Step 2 - Manual "Message Host" fallback (only when Step 1 fails)
When a strong prospect has no public off-platform path, output a MESSAGE HOST entry so
Neil can copy-paste it into the platform's Message Host / Contact Host button himself:

```
PROSPECT ###

NAME: (host or listing name)
EMAIL: MESSAGE HOST: [public listing URL]
EMAIL SUBJECT: (not used on platforms - keep for file consistency)
EMAIL BODY: (short platform note, rules below)
```

Platform note rules (differs from the email format):
- 60-90 words max - platform messages are read on mobile.
- Opens exactly: `Hey, I'm Neil.`
- One sentence: who he is (owner of Back Nine Vernon, premium indoor golf in town).
- One sentence: the guest perk idea for THEIR listing (use one real listing detail).
- Close by moving off-platform: "If you have a business email, I'm happy to send over a
  short guest-invitation blurb you could drop into your guest guide - what's the best
  way to reach you?"
- No links pushing bookings, no discounts quoted, no signature.

## What this skill does NOT do
- No bulk platform messaging, no automation, no scheduling of platform sends.
- No harvesting of host phone numbers/emails that platforms mask.
- If asked to automate any of the above, decline and point back to this file.
