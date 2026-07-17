# B9 Opportunity & Partnership Engine

A reusable local business-intelligence skill for Back Nine Golf Vernon that
discovers timely corporate-event opportunities, partnership opportunities,
community-event opportunities, and local Google search-demand trends across
Vernon, BC and the North Okanagan.

**Inactive by default.** It runs only when you type:

```
RUN B9 OPPORTUNITY ENGINE
```

optionally with scope, e.g.:

- `RUN B9 OPPORTUNITY ENGINE — Vernon and 50 km, next 90 days`
- `RUN B9 OPPORTUNITY ENGINE — partnerships only`
- `RUN B9 OPPORTUNITY ENGINE — corporate events and community opportunities`
- `RUN B9 OPPORTUNITY ENGINE — Google search demand and 10 business suggestions`

## Layout

```
SKILL.md                          Activation gate + run procedure
references/
  run-commands.md                 How RUN modifiers are parsed
  module-1-corporate-events.md    Corporate Event Finder
  module-2-partnerships.md        Partnership Matchmaker
  module-3-community-calendar.md  Community Calendar Engine
  module-4-search-demand.md       Google Local Search Demand Intelligence
  sources.md                      Primary source network + source health
  research-rules.md               Public-only access, verification, boundaries
  entity-matching.md              Name normalization, duplicate suppression
  timing-and-output.md            Tier definitions + quality checklist
  local-radius-sweep.md           Geography-first ring discovery (outreach)
  map-grid-discovery.md           Zone-by-zone local search grid (outreach)
  local-directory-discovery.md    Public directory mining rules (outreach)
  storefront-contact-finder.md    Best-public-contact-path finder (outreach)
  dedup-status-memory.md          Duplicate + status tracking (outreach)
  partnership-fit-scorer.md       1-10 prioritization scoring (outreach)
  partnership-angle-matcher.md    One custom angle per business (outreach)
  website-research-email.md       LOCKED email rules ("Hey, I'm Neil.", no signature)
templates/
  run-report.md                   The only output format for intelligence runs
state/
  opportunity-log.md              Cross-run memory for deduplication
  outreach-log.md                 Outreach dedup + status memory
```

## Outreach mode

When Neil explicitly asks for partnership prospects, the engine runs a
geography-first discovery (radius rings + map grid + public directories — no
industry batches), finds each business's best public contact path, scores
fit 1–10, picks one custom partnership angle, and writes one Gmail-ready
email per business. Locked rules: body opens "Hey, I'm Neil.", no signature
block, drafts only — Neil sends manually.

## Related support skill

`b9-audience-holder-finder` (sibling skill folder) layers onto outreach step
6: for every business found, also checks whether it controls an audience
(members, clients, staff, customers) worth reaching, and finds the specific
person/role who can move that audience. It never runs on its own and never
changes this engine's format, files, or locked email rules.

## What it will never do

No private-data harvesting, no auto-sending or mass-sending, no dashboards,
no recurring tasks or background monitoring, no bypassing of logins/paywalls/
anti-bot protections. Public business contact information only.
