# Follow-Up Engine (command-gated)

Runs ONLY when Neil types `RUN B9 FOLLOW UP` (optionally with scope, e.g.
"RUN B9 FOLLOW UP — list #2 only" or "— top fits only"). Never runs
automatically, never on a schedule, never suggests itself.

## Job

Generate polite second-touch emails for businesses that were emailed but
never replied. One follow-up per business, maximum — the engine never
produces a third touch unless Neil explicitly asks.

## Procedure

1. Read `state/outreach-log.md`. Candidates = entries with status
   `[email created]` (or `[sent]` if Neil has updated statuses) that are at
   least ~2–3 weeks old and have no reply/status change.
2. Ask Neil to confirm WHICH prospects were actually sent (the log tracks
   drafts; only Neil knows what left his Gmail) — or accept the list he
   provides.
3. For each confirmed business, write ONE short follow-up (2–4 sentences):
   - Opens with the same personal-greeting rule as all engine emails
     (`website-research-email.md`).
   - References the original idea in a fresh way — never "just bumping
     this" or a guilt-trip. Add one new small hook when possible (season,
     upcoming holiday, league start, new offer).
   - Same locked footer: soft close, link, logo. No signature text.
4. Deliver as one TXT file in the standard layout
   (`[#]. Name / To: / Subject: / body`), file name `B9-FollowUps-[date].txt`.
5. Mark each follow-up in `state/outreach-log.md` by appending
   `| follow-up [date]` to the business's line.

## Tone rules

Light, unbothered, generous. The reader should feel remembered, not
chased. Never apologize for following up, never mention being ignored,
never repeat the whole original pitch — one line of context, one fresh
reason, one easy question.
