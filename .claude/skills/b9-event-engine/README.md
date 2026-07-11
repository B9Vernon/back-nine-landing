# B9 League & Tournament Engine

Command-activated skill that designs original, revenue-generating indoor golf leagues
and tournaments for **Back Nine Vernon** and produces complete, portal-ready event
presentations. It does NOT replace registration, handicapping, scoring, scheduling,
or publishing systems — Vernon controls all event parameters and all final publishing.

## Commands

| Command | Result |
|---|---|
| `IDEAS B9 LEAGUE` | Several distinct league concepts (concise) |
| `IDEAS B9 TOURNAMENT` | Several distinct tournament concepts (concise) |
| `BUILD B9 LEAGUE` | Complete 17-item Portal Build Pack |
| `BUILD B9 TOURNAMENT` | Complete 17-item Portal Build Pack |
| `UPDATE B9 EVENT` | Revise an existing build, preserving approvals |
| `FILL B9 PORTAL` | Fill portal fields via approved browser session; stops before Save |
| `UPGRADE B9 EVENT ENGINE` | Self-inspect, improve, test, return to idle |

Commands may carry extra instructions, e.g. `IDEAS B9 LEAGUE — winter team competition`.
Outside these commands the engine stays completely inactive: no background work, no
monitoring, no research, no publishing.

## Layout

```
SKILL.md                     entry point: activation rule, commands, workflow
references/
  concept-engine.md          league/tournament directions + originality rules
  vernon-seasons.md          four-season strategy for Vernon, BC
  pro-golf-intelligence.md   at-command-time research + IP guardrails
  sales-copy.md              11-section persuasive description framework
  prize-copy.md              prize rules + approved fallback copy
  three-step-registration.md Back Nine / Beyond the Grass / FS Compete flow
  golf-canada.md             app-first Record & Reward section + compliance
  membership.md              secondary membership pathway
  portal-fields.md           portal field map + FILL B9 PORTAL protocol
  html-builder.md            Tournament Details HTML rules + brand palette
  poster-visuals.md          poster/hero deliverable spec
  connections.md             connection discovery protocol + verified link registry
templates/
  portal-build-pack.md       the 17-item deliverable + standard placeholders
  tournament-details.html    canonical portal-ready HTML skeleton
  poster-brief.md            complete poster brief template
checklists/
  quality-control.md         silent pre-delivery QC gate
memory/
  event-log.md               names/themes used, outcomes, portal quirks
  preferences.md             Vernon's standing preferences
```
