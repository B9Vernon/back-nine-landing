---
name: b9-opportunity-engine
description: >-
  Local business-intelligence engine for Back Nine Golf Vernon. Discovers timely
  corporate-event opportunities, partnership opportunities, community-event
  opportunities, and local Google search-demand trends across Vernon, BC and the
  North Okanagan. ACTIVATION-GATED — use ONLY when the user's message contains
  the exact phrase "RUN B9 OPPORTUNITY ENGINE" (optionally followed by scope
  modifiers). Never run on project open, on install, on a schedule, or because
  the topic seems related. If loaded outside a RUN command, confirm readiness
  and remain inactive.
---

# B9 Opportunity & Partnership Engine

## ACTIVATION RULE — ABSOLUTE

- The engine activates **only** when the user types `RUN B9 OPPORTUNITY ENGINE`
  (any additional scope text after the phrase modifies the run — see
  `references/run-commands.md`).
- Without that phrase: do not scan, research, monitor, collect, or analyze.
  Do not create recurring tasks, cron jobs, triggers, wakeups, or background
  monitoring of any kind — not even during a run.
- If this skill loads without a RUN command, respond only:
  *"B9 Opportunity & Partnership Engine is ready. It will remain inactive until
  you type 'RUN B9 OPPORTUNITY ENGINE.'"*

## What this engine is — and is not

It IS one unified intelligence system with four connected modules that share
findings, connect entities across sources, and surface only decision-ready
opportunities for Back Nine Golf Vernon (indoor golf venue, Vernon BC).

It is NOT an email scraper, contact harvester, or dashboard, and it never
sends anything anywhere. Contact details and outreach email DRAFTS are
produced only when Neil explicitly requests them (as he has for prospect
runs) — public business contact info only, drafts for manual review in
Gmail, never auto-sent, never mass-sent. Outreach drafting follows the
LOCKED rules in `references/website-research-email.md` (body opens
a personal greeting — "Hey [recipient] team, I'm Neil." — no typed
signature, website link + logo footer).

## The connected-intelligence chain

Every finding should be evaluated along this chain, not as an isolated listing:

Event → Organizer → Sponsors → Participating businesses → Venue →
Local search demand → Possible Back Nine opportunity → Best time to act

One organization or event may yield several distinct opportunities. Merge
duplicates across legal names, operating names, franchises, branches, sponsor
listings, and alternate spellings (see `references/entity-matching.md`).

## Default geography

Unless the RUN command narrows or widens it: Vernon, Coldstream, Armstrong,
Lumby, Enderby, Lake Country, Greater Vernon, North Okanagan, and communities
within ~50 km. Prioritize Vernon and its closest neighbours. Include anything
farther out only when it has a strong Vernon tourism/business/event connection.

## Modules

Run the modules the RUN command asks for; run all four when unscoped. Read the
module reference before executing it:

1. **Corporate Event Finder** — `references/module-1-corporate-events.md`
2. **Partnership Matchmaker** — `references/module-2-partnerships.md`
3. **Community Calendar Engine** — `references/module-3-community-calendar.md`
4. **Google Local Search Demand Intelligence** — `references/module-4-search-demand.md`

Modules feed each other: calendar events supply organizers/sponsors to Modules
1–2; corporate signals inform partnership timing; search-demand themes drive
the 10 business suggestions.

## Outreach mode (explicit request only)

This is the engine's most-used mode. When Neil asks for partnership
prospects or outreach emails, run the geography-first pipeline. Core
belief: Back Nine can potentially partner with almost ANY legitimate local
business — discovery is by location, never by industry batches, and never
limited to golf-adjacent businesses.

Discovery always starts from Back Nine's postal code **V1T 5B9** and works
outward in rings (`references/local-radius-sweep.md`). Stay inside Vernon
and its immediate neighbours unless Neil asks for wider in the current
message — Kelowna proved too far for the pitch to hold.

**0. Read `references/email-first-discovery.md` before anything else.** It
is the method. One targeted query per business
(`"<Business Name>" Vernon BC contact email`) finds an address about half
the time; category queries essentially never do. Runs 6-11 used category
queries and delivered 1-5% reachable lists. Then size the run with
`references/saturation-and-run-sizing.md` — budget about two searches per
delivered prospect, and say up front if the requested number doesn't fit.

1. **Name harvest** — `references/local-radius-sweep.md` (rings out from the
   facility), `references/map-grid-discovery.md` (zone-by-zone),
   `references/local-directory-discovery.md` (public directories). These
   produce NAMES ONLY. `WebFetch` is 403 for every host — `WebSearch` only.
2. **Dedup immediately** — `tools/dedup_check.py` against
   `state/outreach-log.md`, before spending a query on any candidate. See
   `references/dedup-status-memory.md`.
3. **Email query per surviving candidate** —
   `references/storefront-contact-finder.md`. **Email found → keep. No email
   → drop the business and move on.** Contact forms and phone numbers are
   out; a contact page belongs in a `To:` line only if the form was actually
   submitted, which cannot happen here. Never pattern-guess an address.
4. **Fit & angle** — `references/partnership-fit-scorer.md` (1–10, prioritize
   not eliminate) and `references/partnership-angle-matcher.md` (one custom
   angle each). Both stay internal — no scores or metadata in the file.
5. **Email** — `references/website-research-email.md` (LOCKED: research the
   real website, body opens "Hey [recipient] team, I'm Neil.", no typed
   signature, ends with website link + logo, subject + body, Gmail
   copy-paste ready, drafts only).
6. **Audience-holder check** (support skill, additive — layer onto steps 1–5,
   don't run separately) — for every business found, also ask whether it
   controls an audience worth reaching (a gym has members, a realtor has
   clients, a dealership has staff and customers) and who the specific
   person/role is who can move that audience. See
   `../b9-audience-holder-finder/SKILL.md`.
7. **Verify — before showing Neil anything** —
   `tools/verify_deliverable.py FILE --email-only`. Exit code must be 0.
   Not optional: run 4 shipped 56 emails whose TV wording broke locked rule
   2a, and runs 6-11 shipped lists that were 95%+ unreachable. Both would
   have been caught here.
8. **Log** — `tools/log_run.py FILE --run run-N`.

Working style (standing instruction since run 5): work quietly, don't
narrate the process in chat, deliver the file plus a short summary.

Command-gated companion modes (never run unprompted):

- `RUN B9 FOLLOW UP` → `references/follow-up-engine.md` — one polite
  second-touch email per confirmed-sent, no-reply prospect.
- `RUN B9 REPLY` → `references/reply-assistant.md` — Neil pastes a reply he
  received; the engine drafts his response, logs the status, and proposes
  the next step.
- SMS lists → `references/sms-outreach.md` — batched text-message lists
  built from numbers already in the log. Reaches the ~76% of logged
  businesses that never had a usable email.

## Run procedure

1. Parse the RUN command for scope (geography, time horizon, modules,
   deliverables). Defaults: full geography, next ~90 days, all four modules.
2. Read `references/sources.md` and `references/research-rules.md`. Use only
   public information; never bypass logins, CAPTCHAs, paywalls, or anti-bot
   protections. Verify conflicting facts against an official source or omit.
3. Read `state/opportunity-log.md` (if present) to avoid re-surfacing items
   already reported, and note any items previously marked MONITOR that may
   have matured.
4. Execute the scoped modules using WebSearch/WebFetch. Work the
   connected-intelligence chain; do not just relist calendar entries.
5. Classify every surviving opportunity per `references/timing-and-output.md`
   (ACT NOW / COMING SOON / PARTNERSHIP POTENTIAL / COMMUNITY OPPORTUNITIES /
   MONITOR) and drop weak or speculative items entirely.
6. Run the quality checklist in `references/timing-and-output.md` before
   presenting anything.
7. Present the report using `templates/run-report.md` exactly — concise,
   decision-ready, no research-process narration unless requested.
8. Append the run's surfaced items (one line each: date, name, tier) to
   `state/opportunity-log.md` so future runs can deduplicate. Do not schedule
   anything for the future.

## Decision autonomy

Make all reasonable research and classification decisions independently. Ask
the user only questions that are essential and cannot be safely inferred.

Guiding principle: *Scan local activity. Connect businesses and events.
Understand current search demand. Identify timely corporate and partnership
opportunities. Show only the opportunities worth acting on.*
