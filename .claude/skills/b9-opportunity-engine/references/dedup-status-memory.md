# H. Universal Duplicate Guard & Status Memory

**Governing rule: one business, one initial outreach email.** A different
employee, a second address, a rebrand or an alternate spelling at the same
business does not make it new. Franchises and separately operated locations
may be treated separately only when ownership, decision-making and local
value are genuinely distinct and documented.

If a business has already been contacted, exclude it — unless Neil
explicitly asks for a follow-up campaign.

## Where memory lives

- `state/outreach-log.md` — append-only, one line per business, 1,856 rows
  back to batch-10. **The source of truth. Never reset, never replaced.**
- `state/ledger.jsonl` — derived from it by `tools/migrate_ledger.py`, one
  record per row, carrying the V2 fields the guard needs: identity keys,
  website domain, email, email domain, phone, civic address, category,
  ring, score, opportunity type, draft/sent status, source URLs, run tag,
  rejection reason.

The ledger is a projection, not a second ledger. Rebuild it any time; the
log is what survives.

## The axes the guard compares

trading name · aliases and spelling variations · stripped core name ·
parent company and location names · website root domain · email address ·
email domain · phone number · street address

Name-only matching let **18 real double-contacts** through across runs
2–13 — same domain, same phone, same email, different trading name (Le
Grows Travel = Maritime Travel; Edge Apparel & Imprints = Edge Imprints;
The Landing Church = The Landing Vernon). All are now marked in the log,
and the class is caught.

Two deliberate carve-outs:

- **Shared institutional and franchise domains** (`vernon.ca`, `sd22.bc.ca`,
  `royallepage.ca`, bank domains…) do not trigger a duplicate. Tourism
  Vernon and Greater Vernon Recreation are separate decision-makers on one
  municipal domain.
- **Free mailbox providers** (`@gmail.com`, `@shaw.ca`, `@telus.net`…) are
  never an email-domain match.

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

1. **BEFORE writing any emails**, check the candidates:

   ```
   cat candidates.txt | python3 tools/dedup_check.py
   ```

   Names alone work. When more is known, pass it — the extra axes are what
   catch a rebrand or a second employee:

   ```
   printf 'Edge Apparel|sales@edgeimprints.com||\n' | python3 tools/dedup_check.py
   python3 tools/dedup_check.py --name "Dave in Sales" \
       --email dave@coldstreamtruckparts.ca
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
   python3 tools/log_run.py "#15-B9-Partnerships.txt" --run run-15
   ```

   It refuses to log a business that is already present, so a duplicate
   that survived every earlier check still cannot reach the log, and it
   refreshes `state/ledger.jsonl` automatically so the next scan sees this
   run's prospects as contacted.

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
