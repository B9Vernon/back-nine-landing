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

It is NOT an email scraper, contact harvester, marketing-copy generator, or
dashboard. Never output contact names, phone numbers, or email addresses
unless explicitly requested later. Never draft outreach emails, invitations,
social posts, ads, or marketing copy. Never send anything anywhere.

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
