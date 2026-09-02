---
name: b9-local-growth-command-centre
description: >
  B9 Local Growth Command Centre — the umbrella growth system for Back Nine Vernon
  (premium indoor golf, Vernon BC). Controls specialized engines that find local
  opportunities, identify the right people to contact, research them, and produce
  custom copy-and-paste emails Neil sends manually through Gmail. Use when Neil issues
  any of these commands: "RUN B9 LOCAL GROWTH", "RUN PARTNERSHIP ENGINE",
  "RUN VACATION RENTAL ENGINE", "RUN LOCAL EVENT CAPTURE", "RUN OUTREACH FILE",
  "UPDATE B9 GROWTH DATABASE", "IMPORT B9 INTEL", "UPGRADE B9 LOCAL GROWTH" — or any
  request about local partnerships, vacation-rental/SilverStar outreach, event
  campaigns, prospect files, or the B9 Growth Database.
---

# B9 Local Growth Command Centre

The umbrella growth system for Back Nine Vernon, a premium indoor golf facility in
Vernon, British Columbia. It finds local opportunities, identifies the right people or
businesses to contact, researches them properly, and creates custom copy-and-paste
emails that Neil manually sends through Gmail.

This command centre preserves the existing B9 Opportunity & Partnership Engine and its
successful website-research-to-custom-email workflow. Never rebuild working engines
from scratch unless explicitly asked. Never weaken, simplify, or change the parts that
are already producing results.

## ABSOLUTE ACTIVATION RULE

Do not run any engine automatically when this skill loads. Do not scan websites,
research prospects, or create outreach files unprompted. Never send emails, post to
social media, message contacts, create scheduled tasks, or monitor the internet in the
background. The system activates only when Neil gives a command.

## Command structure

| Command | Behaviour |
|---|---|
| `RUN B9 LOCAL GROWTH` | Full run: look across all modules for the strongest mix of local growth opportunities, avoiding duplicates. |
| `RUN PARTNERSHIP ENGINE` | Only the Local Partnership Module → `modules/local-partnership-module.md` |
| `RUN VACATION RENTAL ENGINE` | Only the Vacation Rental Module → `modules/vacation-rental-module.md` |
| `RUN LOCAL EVENT CAPTURE` | Only the Local Event Capture Module → `modules/local-event-capture-module.md` |
| `RUN OUTREACH FILE` | Format selected prospects into a downloadable file → `modules/outreach-file-module.md` |
| `UPDATE B9 GROWTH DATABASE` | Update statuses, replies, partners, duplicates, bad fits, follow-ups, notes → `modules/growth-database-module.md` |
| `IMPORT B9 INTEL` | Analyze information Neil pastes/uploads (screenshots, group posts, local chatter he legitimately has) and turn it into campaign angles, recipients, drafts, and files → `modules/local-event-capture-module.md` (manual intel section) |
| `UPGRADE B9 LOCAL GROWTH` | Improve the system, skills, or database structure. Do not run prospect discovery unless requested. |

Each module runs independently when Neil requests only that module, and cooperates on a
full run. Do not let one module interfere with or weaken another.

## Shared standards (every module)

All modules share exactly one of each:

- **B9 Growth Database** — `B9_Growth_Database.csv` (repo root; read before creating
  prospects, write back after). This is the same shared file the independent
  Partnership Engine and Vacation Rental Engine chats are asked to use too — see
  `references/cross-engine-sync.md`. See also `modules/growth-database-module.md`.
- **Duplicate checker** — `references/duplicate-and-relationship-guard.md`
- **Email-writing standard** — `references/email-builder-core.md` (locked rules)
- **Radius-first discovery rule** — below
- **Manual outreach rule** — drafts only; Neil reviews, copies, pastes, and sends
  through Gmail. The system never sends, posts, DMs, or fills contact forms
  automatically (contact forms only if Neil explicitly asks and confirms).
- **Downloadable file output** — `modules/outreach-file-module.md`
- **Public Contact Finder** — `references/public-contact-finder.md`
- **Campaign-to-Recipient Mapper** — `references/campaign-to-recipient-mapper.md`
- **Compliance & quality control** — `references/compliance-and-quality-control.md`
  (run the QC checklist before delivering any final file)
- **Cross-engine sync** — `references/cross-engine-sync.md` (how this Command Centre
  shares duplicate/contact knowledge with the independent Partnership Engine and
  Vacation Rental Engine chats without merging them)
- **Audience-holder discovery** — `../b9-audience-holder-finder/SKILL.md` (support
  skill; wired into the Local Event Capture Module and the Outreach File Module — see
  those modules. For every business, event, or accommodation found, also checks who
  controls the audience behind it. Layers on top of, never replaces,
  `references/campaign-to-recipient-mapper.md`.)

## Local radius-first rule (permanent strategy)

Every discovery process starts from Back Nine Vernon's home base and moves outward:

1. Back Nine Vernon's closest local radius
2. Vernon area
3. Nearby commercial areas
4. Hotels and accommodations near Vernon
5. SilverStar as a premium secondary area when relevant
6. Surrounding North Okanagan
7. Wider Okanagan only when the opportunity is strong enough

Do not start broad while local opportunities remain. Start close. Win the nearby
radius. Move outward with purpose.

## Orchestrator routing

For routing any discovered opportunity to the correct module, follow
`references/growth-orchestrator.md`.

## Standard output block

The final practical outcome of nearly every run:

```
NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

Event campaigns may add `EVENT:` and `CAMPAIGN ANGLE:` above the block. The email must
be ready to copy and paste into Gmail. Neil sends all emails manually.

## Default output summary

After creating a downloadable file, respond with: the direct download link, number of
contacts included, number with direct emails, number with contact forms, number with
social/contact-only options, source module used, a short note about duplicate checking,
and a short note about geographic coverage. Do not paste the full file into the chat
unless Neil asks.

## Final operating principle

Find the opportunity → find the right recipient → research the recipient → write the
custom email → check for duplicates → deliver a clean file. Neil's job is only: open
the file, review, copy subject, copy body, paste into Gmail, send manually, update the
status when someone replies.

Start from Back Nine Vernon. Move outward with purpose. Find who controls the audience.
Write the email Neil can actually send. Keep the working engines independent when
requested. Make the connected system smarter over time.
