# B9 Growth Database Module

Command: `UPDATE B9 GROWTH DATABASE` (updates statuses, replies, active partners,
duplicates, bad fits, follow-ups, or notes).

## The database — shared across ALL engines, not just this one

One shared ledger file, committed at the **repo root** (not nested inside this skill)
specifically so every independent B9 engine — this Command Centre, the standalone B9
Opportunity & Partnership Engine, the standalone B9 Vacation Rental Outreach Engine,
and any future engine — can find it at the same predictable path and read/write to it:

```
B9_Growth_Database.csv
```

Every module in this Command Centre reads it BEFORE creating new prospects and writes
back to it AFTER creating new prospects, emails, or statuses. All writes go through the
Duplicate and Relationship Guard first.

**This is the cross-engine connection point.** The engines stay fully independent —
separate commands, separate chats, separate workflows — but if every engine checks and
appends to this one root-level file, none of them will duplicate a prospect or
re-cold-pitch someone another engine already contacted. See
`references/cross-engine-sync.md` for exactly what to tell the other engines' sessions
so they participate.

### Legacy sources (read-only)

The proven Partnership Engine's original databases also live at the repo root and must
be preserved untouched:

- `back_nine_vernon_prospect_database.csv`
- `Fable 1 Contacts.csv`

Use them as duplicate-check sources. Never modify, reformat, or delete them.

## Fields (fill what is available)

`name, business_name, category, source_module, location_area, distance_radius,
website, email, contact_form, social_contact, contact_type, contact_quality,
opportunity_type, partnership_angle, campaign_angle, event, last_email_subject,
last_email_body, date_added, status, duplicate_status, notes, follow_up_timing,
relationship_history`

Multi-line values (like email bodies) must be CSV-quoted so the file still opens
cleanly in Excel/Sheets. Dates use `YYYY-MM-DD`.

## Statuses

`discovered, researched, email created, emailed, replied, interested, follow up later,
not interested, active partner, duplicate, bad fit, no usable contact, campaign target,
event-related contact`

## Update rules

- Before adding a contact, check whether it already exists (guard). If it exists,
  update the existing record — never create a duplicate row.
- When a prospect appears in multiple modules, merge into one record and append the
  new opportunity/angle (e.g., a SilverStar lodge later tied to a SilverStar event
  gets the event added to its record).
- When Neil reports a reply (e.g., `UPDATE B9 GROWTH DATABASE — XYZ replied
  interested`), update that contact's status AND append to `relationship_history` so
  the history is preserved, never overwritten.
- Active partners are relationships, not leads: keep their history rich and suggest
  warm messages, never cold pitches.
