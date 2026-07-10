# RUN Command Parsing

The engine activates only on the exact phrase `RUN B9 OPPORTUNITY ENGINE`.
Anything after the phrase (usually after a dash) scopes the run.

## Scope dimensions

| Dimension | Default | Example modifiers |
|---|---|---|
| Geography | Vernon + North Okanagan, ~50 km | "Vernon and 50 km", "Vernon only", "include Kelowna" |
| Time horizon | Next ~90 days | "next 90 days", "next 30 days", "this winter" |
| Modules | All four | "partnerships only", "corporate events and community opportunities", "Google search demand" |
| Deliverables | Full report template | "10 business suggestions", "ACT NOW only" |

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
