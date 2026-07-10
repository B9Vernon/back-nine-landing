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
templates/
  run-report.md                   The only output format the engine uses
state/
  opportunity-log.md              Cross-run memory for deduplication
```

## What it will never do

No contact harvesting, no outreach or marketing copy, no dashboards, no
recurring tasks or background monitoring, no bypassing of logins/paywalls/
anti-bot protections. Contact information is handled separately by the owner.
