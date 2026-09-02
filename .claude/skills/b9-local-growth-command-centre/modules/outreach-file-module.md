# Outreach File Module

Command: `RUN OUTREACH FILE` (formats selected/approved prospects into a downloadable
file). Also used by every other module for final delivery.

## Format rules

- Default format: plain TXT file.
- No tables. No markdown. No internal notes unless Neil requests them. No long
  analysis. No email signatures. No notes inside the email body.

## Default repeated block

```
PROSPECT 001

NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:

PROSPECT 002

NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

When the run is event-based, prepend the event lines:

```
EVENT:
CAMPAIGN ANGLE:

NAME:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

Contact-path substitutions (from Public Contact Finder): if there is no direct email
but a contact form exists, replace the `EMAIL:` line with `CONTACT FORM: [URL]`; if
only a public social path exists, use `SOCIAL CONTACT: [URL]`.

Prospects sourced via the B9 Audience Holder Finder support skill
(`../../b9-audience-holder-finder/SKILL.md` — e.g. a team manager or property manager
found behind a business/event/accommodation) fold into this same file using this same
block. No separate section, no separate format.

## File names

Clear names such as:

- `B9_Local_Partnership_Prospects.txt`
- `B9_Vacation_Rental_Engine_Prospects.txt`
- `B9_Local_Event_Capture_Emails.txt`
- `B9_Local_Growth_Command_Centre_Output.txt`

Write output files to the `output/` directory inside this skill's folder (or the
location Neil requests) and send/deliver the file to Neil so it is downloadable.

## Before delivery

Run the full quality-control checklist in
`references/compliance-and-quality-control.md`, then give Neil the default output
summary defined in SKILL.md (download link, counts by contact type, source module,
duplicate-check note, geographic coverage note). Do not paste the full file into chat
unless Neil asks.
