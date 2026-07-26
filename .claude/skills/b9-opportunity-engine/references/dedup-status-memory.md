# Partner Deduplication & Status Memory

The engine must never re-pitch the same business unknowingly.
Memory lives in `state/outreach-log.md` (append-only, one line per business).

## Statuses

`discovered` → `researched` → `email created` → `emailed` → `replied` →
`interested` / `not interested` / `active partner` / `follow up later`
plus: `no usable contact found`, `bad fit`

## Line format

```
- [STATUS] Business Name | category | contact used | date | run tag
```

The last field is the run tag (`run-8`, `batch-200`) — it is what lets a
later run answer "which pass did this come from?" and lets
`verify_deliverable.py --logged-as` exclude a file's own rows.

The category field must be a real category. Runs 6–8 wrote the placeholder
`Local business` for 600 straight lines, which destroyed the log's ability
to answer "who have we already approached in this category?".
`tools/log_run.py` infers a real category from the email and refuses to
write the placeholder — use it rather than appending by hand.

## Procedure — use the tools, not memory

1. **BEFORE writing any emails**, check the candidate names:

   ```
   cat candidates.txt | python3 tools/dedup_check.py
   ```

   Do this at candidate stage, not at verification stage. Runs 6, 7 and 8
   each checked too late and had to hand-swap finished entries (1, then 5,
   then 3 of them).

2. Review every `NEAR` result by hand. The strict normalizer collapses
   legal suffixes and town names, so it correctly catches
   "Vernon Roofing" = "Vernon Roofing Inc" but wrongly collapses
   "Kal Tire Lumby" and "Kal Tire Vernon", which are separate branches and
   both legitimate targets.

3. Apply entity matching (`entity-matching.md`) for anything the tool
   cannot see: rebrands (e.g. "Village Green Hotel" = "Divya Sutra Plaza"),
   operating vs legal names, franchise vs branch.

4. **AFTER the run**, append with the tool:

   ```
   python3 tools/log_run.py "#9-B9-Partnerships.txt" --run run-9
   ```

   It refuses to log a business that is already present, so a duplicate
   that survived every earlier check still cannot reach the log.

## Known gap — statuses have never advanced

Every one of the 1,510 logged rows still reads `[email created]`. Nothing
has ever moved to `emailed`, `replied`, or `active partner`, because only
Neil knows what actually left his Gmail.

This blocks both companion tools: `RUN B9 FOLLOW UP` needs to know what was
sent, and `RUN B9 REPLY` needs somewhere to record an outcome. Until Neil
confirms sends, the follow-up engine must ask him which prospects went out
rather than assuming the log knows.

If Neil ever provides a sent list, update those rows to `[emailed]` with
the date — that single change unlocks the highest-value mode the engine
has.
