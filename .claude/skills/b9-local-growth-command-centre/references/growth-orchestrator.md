# B9 Growth Orchestrator (shared skill)

Routes every discovered opportunity to the correct module. Used on full
`RUN B9 LOCAL GROWTH` runs and whenever a module surfaces something outside its lane.

## Routing table

| Found | Route to |
|---|---|
| Local restaurant | Local Partnership Module |
| Physiotherapy clinic (or any local business) | Local Partnership Module |
| SilverStar chalet | Vacation Rental Module |
| Vernon guest suite | Vacation Rental Module |
| Hockey tournament (or any event) | Local Event Capture Module |
| Hotel connected to a tournament | Check Growth Database first, then route through Local Event Capture and/or Vacation Rental Module depending on context |
| Finished prospects ready | Outreach File Module |
| Duplicate detected | Update B9 Growth Database only — no new email |
| Relationship already active | Suggest a warmer relationship-based message instead of a cold email |

## Rules

- Each module stays focused on its own job; the orchestrator hands off, it does not
  merge module behaviours.
- Always run the Duplicate and Relationship Guard
  (`duplicate-and-relationship-guard.md`) before a routed module creates a record.
- On full runs, respect the radius-first rule from SKILL.md when deciding which
  opportunities to pursue first, and aim for the strongest *mix* of local business,
  accommodation, and event opportunities rather than filling the quota from one module.
