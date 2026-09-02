# Cross-Engine Sync

Back Nine Vernon runs three independent B9 engines, each its own chat/session with its
own commands and workflow: **B9 Opportunity & Partnership Engine**, **B9 Vacation
Rental Outreach Engine**, and this **B9 Local Growth Command Centre**. They stay fully
separate — different jobs, different chats, different people can run each one on its
own. This doc is the one thing that connects them: a shared file all three read and
write so none of them contacts the same business twice or re-pitches someone another
engine already reached.

## The shared file

```
B9_Growth_Database.csv   (repo root, alongside back_nine_vernon_prospect_database.csv and Fable 1 Contacts.csv)
```

Committed at the repo root — not nested inside any one engine's skill folder — so it's
an obvious, equally-accessible file no matter which engine's chat is looking for it.

## What to paste into the other engines' chats (one time)

To bring the Partnership Engine and Vacation Rental Engine into the shared ledger,
paste this into each of those chats once:

> From now on, before researching or emailing any new prospect, also check
> `B9_Growth_Database.csv` in the repo root for an existing record (business name,
> website domain, or email match). If it exists, don't re-pitch — update its status
> instead. After you create a new prospect or send/draft an email, append or update a
> row for it in `B9_Growth_Database.csv` using this header:
> `name,business_name,category,source_module,location_area,distance_radius,website,email,contact_form,social_contact,contact_type,contact_quality,opportunity_type,partnership_angle,campaign_angle,event,last_email_subject,last_email_body,date_added,status,duplicate_status,notes,follow_up_timing,relationship_history`
> Set `source_module` to your engine's name so it's clear who found it. Keep doing
> everything else exactly as you do now — this is the only change.

Each engine keeps its own dedupe files/logic if it already has them (e.g. the
Partnership Engine's `outreach-log.md` / `prospects.md` style tracking) — this is
additive, not a replacement.

## What this Command Centre does automatically

Every module here already reads `B9_Growth_Database.csv` before creating a prospect and
writes to it after (see `duplicate-and-relationship-guard.md` and
`growth-database-module.md`). No extra step needed on this side.

## Why this doesn't merge the engines

Each engine still runs its own commands, in its own chat, with its own tone and logic.
Nothing here changes what any engine does — it only stops them from stepping on each
other's contacts. If `B9_Growth_Database.csv` isn't reachable (e.g. an engine's session
is on a branch that doesn't have it yet), fall back to that engine's own existing
duplicate checks and flag prospects as `POSSIBLE DUPLICATE` rather than skip the check
entirely.
