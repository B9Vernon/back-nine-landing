# RUN Command Parsing

The engine activates only on the exact phrase `RUN B9 OPPORTUNITY ENGINE`.
Anything after the phrase (usually after a dash) scopes the run.

## Scope dimensions

| Dimension | Default | Example modifiers |
|---|---|---|
| Geography | closest-first from V1T 5B9, **Kelowna excluded** | "40 km", "Vernon only", "Vernon and Coldstream", "include Kelowna" |
| Count | **10 qualified prospects** (score ≥ 65) | "20 qualified prospects", "10 new businesses" |
| Time horizon | Next ~90 days | "next 90 days", "next 30 days", "this winter" |
| Modules | All four | "partnerships only", "events and audience holders", "corporate memberships and staff events" |
| Drafts | **none** unless asked | "create Gmail drafts", "no drafts" |
| Deliverables | Scan Summary + Ranked Opportunity Table + Rejection Ledger | "ACT NOW only", "10 business suggestions" |

## V2 phrases with specific meanings

| Phrase | Effect |
|---|---|
| `closest-first` | ring order is enforced and recorded; no ring skipped |
| `N qualified prospects` | N must each clear 65/100 AND the duplicate guard; replace failures automatically |
| `create Gmail drafts` | drafts only, never sent; requires the Gmail connector — if it is unavailable, say so and deliver the TXT instead |
| `audience holders` | prioritize organizations that already control a group (module C) |
| `resume incomplete scan` | reopen the coverage ledger for the named run and fill the gap rather than starting a new run tag |
| `include Kelowna` | the only way ring 8+ and Kelowna open; state the distance trade-off in the summary |

## Interpretation rules

- Map module keywords loosely: "corporate" → Module 1, "partnership(s)" →
  Module 2, "community"/"events"/"calendar" → Module 3, "search demand"/
  "Google"/"trends" → Module 4, "10 business suggestions" → Module 4's
  suggestion output (which requires Module 4's demand analysis first).
- When a run is scoped to a subset of modules, still use cross-module context
  where it is already known (e.g. prior state), but only actively research the
  scoped modules.
- Output only the report sections that the scoped modules produce. A
  "partnerships only" run outputs PARTNERSHIP POTENTIAL and MONITOR;
  a "search demand" run outputs LOCAL SEARCH DEMAND and 10 BUSINESS
  SUGGESTIONS.
- If a modifier is genuinely ambiguous and materially changes the run, ask one
  concise question. Otherwise choose the most useful interpretation and note
  the assumption in one line at the top of the report.
