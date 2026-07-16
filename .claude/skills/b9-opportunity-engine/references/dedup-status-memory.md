# Partner Deduplication & Status Memory

The engine must never re-pitch the same business unknowingly.
Memory lives in `state/outreach-log.md` (append-only, one line per business).

## Statuses

`discovered` → `researched` → `email created` → `emailed` → `replied` →
`interested` / `not interested` / `active partner` / `follow up later`
plus: `no usable contact found`, `bad fit`

## Line format

```
- [STATUS] Business Name | area | contact used | date | note
```

## Procedure

- BEFORE adding any business to a new list: check this log, prior engine
  outputs, files, and uploaded lists for the same entity.
- Apply entity matching (`entity-matching.md`): legal vs operating names,
  franchises, branches, rebrands (e.g., "Village Green Hotel" = "Divya Sutra
  Plaza"), alternate spellings.
- If uncertain whether it's the same business, include it but flag
  `possible-duplicate` in fit notes.
- AFTER a run: append every new business with its status so future runs
  deduplicate automatically.
