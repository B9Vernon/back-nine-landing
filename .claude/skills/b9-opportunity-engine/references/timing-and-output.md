# Timing Classification & Output Standard

## Tiers

| Tier | Meaning |
|---|---|
| **ACT NOW** | Should be considered within the next 7 days (imminent date, closing deadline, hot signal). |
| **COMING SOON** | Prepare within ~30–90 days. |
| **PARTNERSHIP POTENTIAL** | Suited to an ongoing relationship; timing driven by seasons/planning cycles rather than a single date. |
| **COMMUNITY OPPORTUNITIES** | Events, organizers, sponsors, or activities that create a useful opening. |
| **MONITOR** | Interesting, not yet actionable. Keep this tier short. |

Quality beats quantity. An empty tier is a valid result; a padded tier is not.
Drop weak or speculative items entirely rather than parking them in MONITOR.

## Report structure — use `templates/run-report.md` verbatim

Only show the fields the template lists per tier. No research narration, no
pages of notes, no contact details, no outreach copy.

## Pre-output quality checklist — confirm internally before presenting

- [ ] Information is current; dates verified against official sources
- [ ] Organizations confirmed active; events confirmed legitimate
- [ ] Duplicates merged (entity-matching.md applied; prior-run log checked)
- [ ] Every item cites an official website
- [ ] Search-demand claims appropriately qualified (no invented Vernon volumes)
- [ ] Every suggestion is specific to Vernon / North Okanagan (or has a strong
      Vernon connection)
- [ ] Weak/speculative items excluded
- [ ] No outreach drafted or sent; no contact details included — **within the
      brief itself**. This rule keeps the scan report clean; it does NOT mean
      the run ships without emails. When the brief's items are organizations to
      contact (they usually are), produce the outreach as a SEPARATE companion
      file and verify it with `tools/verify_deliverable.py --second-contact`,
      since calendar-driven targets are nearly always already in the outreach
      log. Runs 21 and 22 both shipped a brief with zero emails against 11/4/10/6
      for runs 17-20; the items were right and unusable.
- [ ] No recurring task, trigger, or monitor was created
- [ ] Run appended to `state/opportunity-log.md`
