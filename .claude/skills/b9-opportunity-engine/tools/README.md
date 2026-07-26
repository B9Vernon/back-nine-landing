# Engine Tools

Four small scripts, no dependencies beyond the Python standard library.
They exist because runs 1–8 re-derived this logic by hand every time and
the hand-rolled versions disagreed with each other — which is how
duplicates and rule violations reached delivered files.

Run everything from the engine directory
(`.claude/skills/b9-opportunity-engine/`).

## The run order

```
1. discover candidates          (WebSearch)
2. dedup_check.py               <-- before writing a single email
3. write the emails
4. verify_deliverable.py        <-- before showing Neil anything
5. log_run.py                   <-- after he has the file
```

Steps 2 and 4 are not optional. Skipping step 2 is what caused the late
hand-swaps in runs 6–8; skipping step 4 is how run 4 shipped 56 emails
with forbidden TV wording.

---

## `dedup_check.py`

Checks candidate names against `state/outreach-log.md`.

```bash
cat candidates.txt | python3 tools/dedup_check.py
python3 tools/dedup_check.py candidates.txt --ok-only > clean.txt
```

Verdicts: `ok`, `DUP` (already logged), `REP` (repeated in this input),
`NEAR` (matches once suffixes/town names are stripped — **review by hand**,
because it collapses genuine separate branches).

## `verify_deliverable.py`

Checks a finished TXT against every locked rule.

```bash
python3 tools/verify_deliverable.py "#9-B9-Partnerships.txt" --expect 200
python3 tools/verify_deliverable.py FILE --logged-as run-9   # already logged
```

Exit code 0 only when everything passes. Covers entry counts and numbering,
footer links, personal greetings, locked TV wording, forbidden signatures,
duplicates inside the file and against the log, and the regex-surgery scars
that bulk edits leave behind.

## `log_run.py`

Appends a delivered file to the outreach log.

```bash
python3 tools/log_run.py "#9-B9-Partnerships.txt" --run run-9 --dry-run
python3 tools/log_run.py "#9-B9-Partnerships.txt" --run run-9
```

Infers a real category per business and refuses to log anything already
present.

## `extract_phones.py`

Builds SMS number lists, and validates SMS message text.

```bash
python3 tools/extract_phones.py --out B9-SMS-Invitation-Lists.txt
python3 tools/extract_phones.py --check-message message.txt
```

`--check-message` is the important one: it fails on any character that
would force Unicode SMS encoding, which silently more than doubles the cost
of every message sent. See `../references/sms-outreach.md`.

## `b9lib.py`

Shared helpers. The canonical `normalize()` lives here and nowhere else —
if a duplicate-matching rule needs to change, change it here so every tool
changes with it.
