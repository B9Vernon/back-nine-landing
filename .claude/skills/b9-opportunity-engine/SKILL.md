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

## Outreach mode (explicit request only) — the V2 pipeline

This is the engine's most-used mode. Core belief, unchanged: Back Nine can
potentially partner with almost ANY legitimate local business — discovery
is by location, never by industry batches, never limited to golf-adjacent
businesses. What V2 adds is a closed gate at the other end: an opportunity
is not "a business with an email address", it is a business for which the
engine can state a credible two-way exchange.

Discovery always starts from Back Nine's **verified address**, postal code
**V1T 5B9**, and works outward closest-first
(`references/geo-ring-scout.md`). **Kelowna and beyond are excluded unless
Neil asks in the current message.**

**0. Read these two before anything else.**
`references/email-first-discovery.md` (harvest from directories, then ONE
targeted query per business — category-first harvesting produced 1-5%
reachable lists in runs 6-11 and 80-100% duplicates by run 13) and
`references/persistence-standard.md` (what the engine may and may not say
when a run comes in short). Then size the run with
`references/saturation-and-run-sizing.md`.

1. **Name harvest — sweep DIRECTORIES first, categories only as fallback.**
   `WebSearch` with `allowed_domains` on `members.downtownvernon.com`,
   `business.vernonchamber.ca`, `okanagan-local.ca`, `shopvernon.com`.
   Category queries return the same ranking businesses every run and were
   what made run 13 look like the town was running out. Also
   `references/local-radius-sweep.md` (rings out from the facility) and
   `references/map-grid-discovery.md` (zone-by-zone). These produce NAMES
   ONLY. `WebFetch` is 403 for every host — `WebSearch` only.
2. **Dedup immediately — Universal Duplicate Guard (H)** — screen the WHOLE
   harvest in one pass with
   `tools/screen_candidates.py FILE --new-only`, before spending a single
   verification query. One candidate per line, optionally
   `name | address | website | contact`. Use `tools/dedup_check.py` for a
   one-off. Both compare name, aliases, stripped core, website domain,
   email, email domain, phone and street address (unit-aware) against
   **every** row of `state/ledger.jsonl` — including the 89 that carry a
   historical duplicate marker, which are contacted businesses flagged "do
   not contact again", not available ones. **One business, one initial
   outreach email.** See `references/dedup-status-memory.md`.

   Screening before verifying is what the run budget depends on: harvesting
   a name is one shared query, verifying an email is one query each. Runs
   12–16 spent the expensive step first and collapsed to 2–3 prospects.

   Re-screen with the FINAL name and the VERIFIED email before drafting. In
   run 17 that second pass caught seven businesses that the harvest-name
   screen had cleared — they only collided once their real address was
   known.
3. **Contact Verifier (G)** — `references/storefront-contact-finder.md`.
   **Email found → keep. No email → drop and move on.** Record the
   recipient's name and role, the address, the source URL, and whether it is
   `confirmed` or `reported`. Never pattern-guess an address.
4. **Trigger & timing (D)** — `references/trigger-timing-monitor.md`. A
   verified, dated reason to write now, or honestly evergreen.
5. **Partnership Architect (E)** — `references/partnership-angle-matcher.md`.
   Two to five organization-specific structures; lead the email with one.
   A concept that could be pasted to ten unrelated businesses is rejected.
6. **Commercial Fit Scorer (F)** — `tools/fit_score.py`, rubric in
   `references/partnership-fit-scorer.md`. **65/100 is a hard floor.** Below
   it, the prospect goes to the rejection ledger and is replaced. Never
   inflate a score to reach a count.
7. **Audience-holder check (C)** (support skill, additive — layer onto the
   steps above, don't run separately) — does this organization already
   control an audience worth reaching, and who specifically can move it? See
   `../b9-audience-holder-finder/SKILL.md`.
8. **Red team (J)** — `references/opportunity-red-team.md`. Nine questions,
   applied to every survivor. Reject and replace, don't ship with a caveat.
9. **Email** — `references/website-research-email.md` (LOCKED: greeting line
   naming the recipient, then the exact sentence **"My name is Neil."**, one
   or two verified specifics, no typed signature, no anti-spam paragraph, no
   phone-call push, website link footer, drafts only).
10. **Verify — before showing Neil anything** —
    `tools/verify_deliverable.py FILE --email-only`. Exit code must be 0.
    Not optional: run 4 shipped 56 emails that broke locked rule 2a, runs
    6-11 shipped lists 95%+ unreachable, and run 13 shipped 6 duplicates
    that only the V2 duplicate axes catch.
11. **Log and extend memory** — `tools/log_run.py FILE --run run-N`, then
    `tools/migrate_ledger.py` to refresh `state/ledger.jsonl`.

Whenever a run risks coming in short, record coverage as you go with
`tools/coverage_ledger.py` and gate the shortfall with `--audit`.

Working style (standing instruction since run 5): work quietly, don't
narrate the process in chat, deliver the file plus a short summary.

### Default when activated with no extra instructions

Closest-first research from the verified V1T 5B9 location, Kelowna
excluded, Universal Duplicate Guard applied, **ten prospects scoring 65 or
better**, and no email created or sent unless asked.

### Scoped activation examples

```
RUN B9 OPPORTUNITY ENGINE
RUN B9 OPPORTUNITY ENGINE — partnerships only, 10 new businesses, create Gmail drafts
RUN B9 OPPORTUNITY ENGINE — closest-first, 20 qualified prospects, no drafts
RUN B9 OPPORTUNITY ENGINE — events and audience holders, next 90 days, 40 km
RUN B9 OPPORTUNITY ENGINE — corporate memberships and staff events, Vernon and Coldstream
RUN B9 OPPORTUNITY ENGINE — resume incomplete scan and replace every failed prospect
```

See `references/run-commands.md` for parsing rules.

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
