# B9 Local Growth Command Centre

The umbrella growth system for Back Nine Vernon. One connected command centre,
separate callable modules — each runs independently on request, all share one database,
one duplicate checker, one email standard, one radius-first rule, one manual-outreach
rule, and one file output system.

## Commands Neil can use

| Command | What runs |
|---|---|
| `RUN B9 LOCAL GROWTH` | Full command centre across all modules |
| `RUN PARTNERSHIP ENGINE` | Local Partnership Module only |
| `RUN VACATION RENTAL ENGINE` | Vacation Rental Module only |
| `RUN LOCAL EVENT CAPTURE` | Local Event Capture Module only |
| `RUN OUTREACH FILE` | Format selected prospects into a TXT file |
| `UPDATE B9 GROWTH DATABASE` | Update statuses, replies, partners, notes |
| `IMPORT B9 INTEL` | Analyze info Neil pastes/uploads |
| `UPGRADE B9 LOCAL GROWTH` | Improve the system itself (no discovery) |

Nothing runs automatically. The system never sends emails — Neil reviews and sends
everything manually through Gmail.

## Layout

```
SKILL.md                    Entry point: activation rule, commands, shared standards
modules/
  local-partnership-module.md    Preserves the proven B9 Opportunity & Partnership Engine
  vacation-rental-module.md      Host/accommodation outreach (Vernon → SilverStar → N. Okanagan)
  local-event-capture-module.md  Event scanning + campaign recipients + IMPORT B9 INTEL
  outreach-file-module.md        TXT file formatting and delivery
  growth-database-module.md      Shared database rules and statuses
references/
  email-builder-core.md          Locked email rules ("Hey, I'm Neil." / no signature)
  duplicate-and-relationship-guard.md
  public-contact-finder.md
  campaign-to-recipient-mapper.md
  growth-orchestrator.md
  compliance-and-quality-control.md
  cross-engine-sync.md           How this connects to the other independent B9 engines
output/                          Generated outreach TXT files
```

## Shared database (repo root, not nested — this is the cross-engine connection point)

```
B9_Growth_Database.csv
```

This Command Centre reads/writes it automatically. The independent B9 Opportunity &
Partnership Engine and B9 Vacation Rental Outreach Engine chats are separate systems by
design — they keep their own commands and workflows — but can be pointed at this same
file so all three engines know who's already been researched/contacted without
merging into one system. See `references/cross-engine-sync.md` for the one-time message
to paste into those other chats.

## Legacy assets (preserved, read-only)

The working Partnership Engine's original databases stay untouched at the repo root and
serve as duplicate-check sources:

- `back_nine_vernon_prospect_database.csv`
- `Fable 1 Contacts.csv`
