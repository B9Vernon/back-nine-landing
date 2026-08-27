# J. Opportunity Red Team

The last gate before anything reaches Neil. Challenge each surviving
prospect; reject and replace failures rather than shipping them with a
caveat.

## The nine questions

1. **Real and active?** Verified from a current source — not a dead listing
   or a business that closed. (Raven Traders was dropped mid-run 14 for
   exactly this: 35 years downtown, now closing.)
2. **New to B9 outreach?** `tools/dedup_check.py` clean on every axis —
   name, alias, core name, domain, email, email domain, phone, address.
3. **Contact verified?** A published address from a named public source.
   Never a pattern guess, never a redacted `[email protected]`.
4. **Opportunity specific?** Could this exact paragraph be pasted into an
   email to ten unrelated businesses? If yes, it is not researched — rewrite
   or reject.
5. **Credible benefit to both parties?** State what B9 gets and what they
   get. If the second half is thin, the prospect is thin.
6. **Timing sensible?** Either a verified trigger, or honestly evergreen.
   No manufactured urgency.
7. **Is a closer or stronger prospect available?** If an unsearched nearer
   ring exists, work it before shipping this one.
8. **Would Neil immediately understand why this deserves attention?** One
   sentence, no explaining.
9. **Does the draft sound individually researched?** One or two verified
   specifics about the recipient, in the recipient's own terms.

## Automatic rejections

- score below 65 on `tools/fit_score.py`
- any duplicate axis hit
- unverified or guessed contact
- Kelowna or beyond, unless asked for in the current message
- wording that implies anything is free (locked rule 2b)
- a partnership concept reused verbatim from another prospect in the same run

## Rejections are recorded, not deleted

Every rejection goes to the coverage ledger with its reason:

```
python3 tools/coverage_ledger.py --run run-15 \
    --reject "Some Cafe|score 48 — no audience overlap" \
    --reject "Kelowna Golf Dome|outside geography"
```

That ledger is what lets an underfilled run pass `--audit`, and what stops
the same weak candidate being rediscovered as new next run.
