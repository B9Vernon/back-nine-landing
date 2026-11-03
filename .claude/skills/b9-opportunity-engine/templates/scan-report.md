# Scan Report Template (V2 outreach runs)

Use this for every `RUN B9 OPPORTUNITY ENGINE` prospect scan. The older
`run-report.md` template still governs the four-module intelligence report;
this one governs prospect runs.

---

## Scan Summary

| | |
|---|---|
| Verified origin | Back Nine Golf Vernon, [street address], V1T 5B9 — [source, or "unconfirmed this session; V1T 5B9 used as labelled fallback"] |
| Active radius | [e.g. 0–10 km] |
| Rings completed | [1 (0–1 km), 2 (1–3 km), …] |
| Communities | [Vernon, Coldstream, …] |
| Streets / clusters | [45th Ave, 27th St, Village Green, 48th Ave industrial, …] |
| Categories worked | [n] — [list] |
| Source types swept | [n] — [DVA members, Chamber, okanagan-local, shopvernon, GBP, local news, …] |
| Organizations examined | [n] |
| Duplicates rejected | [n] |
| Below-threshold rejected | [n] |
| Unverified contact rejected | [n] |
| **Qualified prospects delivered** | **[n] of [n] asked** |

If delivered < asked, paste the output of
`tools/coverage_ledger.py --run run-N --audit --asked A --delivered D`
here. Without it the run is not finished.

---

## Ranked Opportunity Table

One block per prospect, highest score first.

```
[rank]. [Business / organization]           [score]/100
    Category        [category]
    Community       [community] · [distance] from Back Nine ([road|approx straight-line])
    Website         [url]
    Contact         [name], [role] — [email]
    Source          [url the address came from] · [confirmed|reported]
    Audience held   [who they already reach, and how often]
    Trigger         [verified dated event / seasonal window, or "evergreen"]
    Lead concept    [the one organization-specific structure the email leads with]
    Also possible   [1–4 more, briefly]
    Not a duplicate [which axes were checked and came back clean]
    Next action     [draft written / draft to write / hold until date / needs X verified]
```

---

## Rejection Ledger

Concise, one line each, grouped by reason. Reasons: duplicate, already
contacted, weak fit (with score), inactive, outside geography, Kelowna,
unverified identity, unverified contact.

---

## Draft Status

Only when drafts were requested.

- Gmail connector: [available | **unavailable this session**]
- Drafts created: [n]
- Table: business · recipient · email · subject

**Never claim a draft exists unless it was actually created.** When the
connector is unavailable, say so plainly and deliver the emails as a TXT
file for manual paste.
