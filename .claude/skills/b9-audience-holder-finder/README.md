# B9 Audience Holder Finder

A reusable **support skill** for the B9 growth systems. It never runs on its own — it
strengthens prospect and recipient discovery inside whichever B9 engine calls it.

## What it adds

When a calling engine finds a business, event, venue, or accommodation, this skill
asks one extra question: does this prospect also control an audience — and who is the
specific person or role who can actually move that audience toward Back Nine Vernon?

See `SKILL.md` for the full rule set: audience-holder types, public-source
boundaries, contact-confidence classification, email-angle guidance, and the
unchanged `NAME:` / `EMAIL:` / `EMAIL SUBJECT:` / `EMAIL BODY:` output format.

## Currently wired into

- **B9 Opportunity & Partnership Engine** — `.claude/skills/b9-opportunity-engine`
  (Outreach mode, as an additive step)
- **B9 Local Growth Command Centre** — `.claude/skills/b9-local-growth-command-centre`
  (Local Event Capture Module and Outreach File Module, plus a shared-standards
  reference in the top-level SKILL.md)

## Not yet wired into

The B9 Vacation Rental Engine — the rule set already covers it (see the "Vacation
Rental Engine" section of `SKILL.md`); add the same one-line reference to that
engine's SKILL.md if Neil wants it added there too.

## What it will never do

Run automatically, replace or rebuild any existing engine, create a new output
format or file type, scrape private/gated sources, or auto-send anything. Neil
reviews and sends every email manually, exactly as before.
