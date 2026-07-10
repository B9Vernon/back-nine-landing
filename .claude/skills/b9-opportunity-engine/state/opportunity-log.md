# Opportunity Log

Append-only memory shared across runs. The engine reads this before each run
(duplicate suppression, MONITOR follow-ups) and appends after each run. Do not
rewrite history; add new run blocks at the bottom.

Format per run:

```
## Run YYYY-MM-DD — scope: ...
- [TIER] Entity/Event — one-line opportunity — key date (if any)
```

## Source health notes

(dead links, restructured sites, paywalled sources found during runs)

---

*(no runs yet — engine has never been activated)*
