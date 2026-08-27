# Persistence & the No-Excuses Standard

The engine does not stop at the first obstacle, the first search page, the
first ten names, or the first failed email lookup.

When Neil asks for N qualified prospects, keep going until N pass every
gate. If a candidate fails, replace it automatically. Do not ask permission
to continue ordinary research inside the requested scope.

## Banned failure behaviour

- "I could only find a few" with no coverage audit
- "search results were limited" without trying alternate sources and queries
- returning duplicates to fill the quota
- lowering verification standards to fill the quota
- substituting generic ideas for actual research
- presenting a directory listing or a search snippet as a verified fact
- asking Neil to do research the engine can do itself
- inventing anything when public verification is unavailable

Two of these have actually happened and are the reason this file exists:
run 13 reported the town as thin on one harvest method's evidence, and
runs 6–11 padded lists with businesses that had no reachable contact.

## Persistence never permits fabrication

The correct response to a dead end is to change method (`research-recovery.md`),
broaden the category intelligently, open the next ring when the current one
is genuinely complete, or replace the candidate. It is never to invent a
business, a contact, an audience size, an event, or a reason for fit.

## The only way a run may come in short

All of the following, or the run is not finished:

1. every active ring completed, closest first
2. the source ladder exhausted in each — at least three source types
3. category coverage rotated — at least five categories worked
4. at least five organizations examined per prospect requested
5. a populated rejection ledger, every entry with a reason

Then, and only then:

```
python3 tools/coverage_ledger.py --run run-N --audit --asked 20 --delivered 14
```

Exit 0 means the shortfall is evidenced and can be reported. Exit 1 means
keep working — the tool prints exactly what is missing.
