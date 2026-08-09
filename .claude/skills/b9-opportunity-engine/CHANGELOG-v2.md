# V2 In-Place Upgrade — Changelog

Upgraded the existing **B9 Opportunity Engine** in place. Same skill, same
directory, same activation phrase, same history. No parallel engine, no new
activation phrase, no replacement ledger. Acceptance test 14 enforces that.

## 1. Audit — why the engine was weak

| Weakness | Root cause found | Evidence |
|---|---|---|
| Stopped searching too early | "Nothing else found" was an assertion with no coverage record | Run 13 declared Vernon thin; run 14 then found 7-of-7 fresh auto-parts businesses in one sweep |
| Weak / obvious prospects | Fit scoring explicitly "prioritized, did not eliminate" — no floor | Lists padded with businesses that had no audience overlap |
| Repeated businesses | Duplicate matching compared the trading name only | **18 real double-contacts** across runs 2–13 shared a domain, phone or email under a different name |
| Generic partnership ideas | One angle chosen from a fixed menu, with no test for reusability | Angles that would paste unchanged into ten other emails |
| Excuse-driven output | No standard for what may be reported as a limitation | "22 emails is a poor effort"; "search results were limited" |
| Premature geographic expansion | Ring order documented but never recorded or enforced | Runs 10–11 worked Kelowna while Vernon streets were unsearched |

## 2. Preserved (unchanged, verified by acceptance test 13)

- Engine name, skill directory, `SKILL.md` identity, activation phrase
  `RUN B9 OPPORTUNITY ENGINE`, and the gate that keeps it inactive otherwise.
- Companion modes `RUN B9 FOLLOW UP`, `RUN B9 REPLY`, SMS outreach.
- **All 1,856 rows** of `state/outreach-log.md`, every run tag from
  `batch-10` to `run-14`, and every historical duplicate marker.
- Locked email rules 2a (TV wording, Forms A and B) and 2b (nothing is
  free), the website-link footer, no-typed-signature, and drafts-only.
- Email-first discovery, directory-sweep harvesting, the four intelligence
  modules, research rules, and the honest-sizing guidance.

## 3. Repaired

- **`email_of()` accepted format templates.** `{first}{last}@company.com`
  and `firstname.lastname@co.ca` parsed as real addresses — the exact
  pattern-guess the rules forbid. Now rejected.
- **Address matching produced false collisions.** `"27 St"` (a street, not
  an address) matched two unrelated businesses. Civic numbers now require
  three or more digits, and unit prefixes are stripped by spacing rule.
- **Shared institutional domains over-matched.** Tourism Vernon and Greater
  Vernon Recreation would have collapsed on `@vernon.ca`. Carve-out added.
- **`log_run.py` left the ledger stale.** It now refreshes
  `state/ledger.jsonl` after appending.

## 4. Replaced

- **Fit scoring:** 1–10 advisory bands → **0–100 rubric with a hard gate at
  65**, seven weighted criteria, proximity derived from the ring rather than
  judged. `tools/fit_score.py` exits non-zero below the floor.
- **Introduction sentence:** the runs 1–14 inline form
  `Hey [X] team, I'm Neil.` → a greeting line naming the recipient, then the
  exact sentence **`My name is Neil.`** Both requirements are satisfied at
  once; the verifier enforces the new form and fails the old one. The
  supersession is recorded in `website-research-email.md`.

## 5. Added — inside the existing engine

Modules, mapped onto existing files wherever one already owned the
responsibility:

| Spec module | Where it lives | New or strengthened |
|---|---|---|
| A Geo-Ring Scout | `references/geo-ring-scout.md` + `tools/coverage_ledger.py` | new (extends `local-radius-sweep.md`) |
| B Deep Local Discovery | `references/local-directory-discovery.md` | strengthened in place |
| C Audience Holder Finder | `../b9-audience-holder-finder/SKILL.md` | reused, wired into step 7 |
| D Trigger & Timing Monitor | `references/trigger-timing-monitor.md` | new |
| E Partnership Architect | `references/partnership-angle-matcher.md` | strengthened in place |
| F Commercial Fit Scorer | `references/partnership-fit-scorer.md` + `tools/fit_score.py` | rubric replaced |
| G Contact Verifier | `references/storefront-contact-finder.md` | strengthened in place |
| H Universal Duplicate Guard | `references/dedup-status-memory.md` + `b9lib.py` + `tools/dedup_check.py` | rewritten |
| I Research Recovery | `references/research-recovery.md` | new |
| J Opportunity Red Team | `references/opportunity-red-team.md` | new |
| — Persistence standard | `references/persistence-standard.md` | new |
| — Category rotation | `references/category-rotation.md` | new |

New tools: `migrate_ledger.py`, `fit_score.py`, `coverage_ledger.py`,
`acceptance_tests.py`. New template: `templates/scan-report.md`.

## 6. Data migration

`state/outreach-log.md` is untouched as the source of truth.
`tools/migrate_ledger.py` derives `state/ledger.jsonl` from it — one record
per row, 1:1, idempotent, rebuildable at any time:

```json
{"name": …, "aliases": [], "parent": null, "name_key": …, "core_key": …,
 "towns": [], "domain": …, "email": …, "email_domain": …, "phone": …,
 "address_key": …, "category": …, "community": …, "ring": …,
 "distance_km": …, "score": …, "opportunity_type": …, "status": …,
 "draft_status": …, "sent_status": …, "source_urls": [],
 "date_checked": …, "run": …, "rejection_reason": …}
```

Migrated: **1,856 records** — 479 with an email, 757 with a domain, 258 with
a phone, **89 carrying a preserved historical duplicate marker**.

Running the new guard over the migrated history surfaced 18 double-contacts
that name matching never saw. All 18 are now marked in the log. Six of them
were in **run #13** (VDICSS, The Landing Church, City Dance Studio, Vernon
Cabinet Center, Edge Apparel & Imprints, A-1 Machine & Welding). Run #14 is
clean on every axis.

## 7. Acceptance tests

`python3 tools/acceptance_tests.py` — **14 of 14 pass.** Two genuine
failures were found and fixed during the run (the template-address gap in
test 7, and one test-side bug in test 8).

## 7a. Run 17 — three discovery bugs found and fixed

Runs 12–16 fell to 14, 14, 20, 3, 2 prospects. The cause was never a
shortage of Vernon businesses.

1. **Candidates were screened one at a time, after the expensive step.**
   Since run 12 every entry needs a verified published email, and each costs
   a dedicated search. Candidates were checked against the log only after
   that search was spent, so the budget went on businesses already
   contacted. **`tools/screen_candidates.py`** screens a whole harvest on
   every axis first; verification is then spent only on names that can ship.
   Run 17 screened 196 businesses and paid for 27 verifications.

2. **A civic address stood for every tenant in the building.** KAL Fitness
   (11-100 Kalamalka Lake Rd) was reported as a duplicate of Chemac
   Industries (100 Kalamalka Lake Rd) — unrelated businesses in the Kalamalka
   Business Park. Vernon is full of multi-tenant plazas, so this silently
   hid prospects. `address_unit()` is now compared alongside `address_key()`:
   two known, different units no longer collide, while an address with no
   unit still matches everything at it, so nothing was traded away.
   Acceptance test 15.

3. **Rows carrying a `rejection_reason` were skipped by the duplicate
   guard AND by the deliverable verifier.** But `state/ledger.jsonl` is
   derived from `outreach-log.md`, which records outreach and nothing else:
   all 89 marked rows have status `email created` and read *"duplicate of X
   — do not contact again"*. Both tools treated all 89 as available. Run 17
   drafted an email to Cambium Cider Co before this was caught — run 7 had
   already written to `hello@cambiumcider.com` and flagged it. Both tools now
   count every row. Acceptance test 16.

Also repaired in `tools/log_run.py`: `brow` (unanchored) filed **Brown
Mechanical Services** under Salon/barber, and `mechanic` (unanchored) then
filed it under Auto service — it is an HVAC contractor. Surveying and
freight had no pattern at all, so every land surveyor and trucking company
logged as `Uncategorized`. Both categories added; the four affected run-17
rows were corrected.

Acceptance tests are now **16 of 16**. Tests 15 and 16 were each confirmed to
fail when their fix is reverted, so they discriminate rather than decorate.

## 7b. Run 18 — the address axis, refined again

Run 17 made the address axis unit-aware in one direction: two KNOWN,
different units stop colliding. It left the other direction blunt — when one
side knew its unit and the other did not, the civic number alone still
counted as proof. Run 18 measured what that costs and found four real
prospects killed by it in a single run:

| Candidate | Matched against | Reality |
|---|---|---|
| Village Green Shopping Centre | Chatters Hair Salon (unit 530) | a mall vs a shop inside it |
| North Okanagan Orthodontics (unit 300) | Central Barbers | an orthodontist is not a barber |
| Kal Fitness | Chemac Industries (unit 12) | gym vs industrial firm |
| End Of The Roll Flooring (unit 101) | Bliss Pilates | two tenants, one plaza |

The rule now reads: **both units known → they must be equal; neither known →
the civic address still stands on its own; exactly one known → the civic
number is not evidence and another axis must corroborate.** Every other axis
is tried before this one, so reaching the address check means the civic
number is genuinely all the two share.

The protection that mattered survives untouched: Vernon Landscape & Stone
Supply and Vernon Landscape Centre are both `4620 23 St` with no units
recorded, and they still collide — as does Rusty Spur Farm Feed & Pet against
Briteland Holdings, the business it was rebranded from. Acceptance test 15
now asserts all four directions and fails if the change is reverted.

Also repaired in `tools/log_run.py`: `infer_category()` reads the subject
line as well as the name, so the subject *"where your members go after
training"* filed **NOS Brazilian Jiu-Jitsu** under School/training. Added a
`Martial arts` category ahead of it, and an `Engineering` category —
Willerton Engineering had logged as `Uncategorized`.

Run 18 delivered 4 prospects from 129 businesses examined across nine
sweeps. That is thin and it is not a tooling failure: only 9 of the 72
never-contacted businesses published a verifiable email at all. The coverage
audit passed on the evidence rather than on an assertion.

## 7c. Run 19 — the email-only rule withdrawn

The biggest defect the engine has had, and it was a rule, not a bug. Counted
from `state/outreach-log.md`:

| run | total | email | phone | form/other | email % |
|---|---|---|---|---|---|
| run-2 | 250 | 66 | 36 | 148 | 26% |
| run-6 | 200 | 10 | 44 | 146 | 5% |
| run-8 | 200 | **4** | 5 | 191 | **2%** |
| run-11 | 250 | **4** | 0 | 246 | **1%** |
| run-12 | 14 | 14 | 0 | 0 | 100% |
| run-16 | 2 | 2 | 0 | 0 | 100% |
| run-18 | 4 | 4 | 0 | 0 | 100% |

Run 8 shipped 200 businesses with **four** email addresses between them. Run
11 shipped 250 with four. Those runs worked because they delivered the phone
numbers and web forms that most local businesses actually publish.

Run 12 introduced "every `To:` line must be a real email address". Every run
since was 100% email and none broke twenty. The engine never got worse at
finding businesses — it acquired a rule that discards roughly 95% of what it
finds, then honestly reported the remainder.

The rule was answering a real problem: a bare contact-page URL in a `To:`
line is useless when pasting into Gmail. The fix is to **label the channel**,
not discard the business.

- `SKILL.md` step 3: "Email found → keep, no email → drop" withdrawn. Keep
  every business with any verified way to reach it.
- `b9lib.contact_channel()`: a recipient line is valid as a bare email, as
  `FORM <url>`, or as `PHONE <number>`. An unlabelled contact-page URL is
  still refused — that was the genuine defect.
- `verify_deliverable.py`: checks every recipient line declares a usable
  channel and prints the mix. `--email-only` survives as **opt-in**.
- `fit_score.py`: `contact_quality` was scoring the *channel*, so a local
  shop's main phone line scored below a generic `info@` at a national chain.
  It now scores how close the contact gets you to a decision, channel-neutral
  — a business's main line and a role inbox both score 6.

Acceptance test 17 covers all of it and fails if reverted.

Run 19 delivered 10 prospects built **entirely from runs 17 and 18's reject
piles** — businesses already discovered and deduped, discarded only for
publishing a form or a phone number. 47 such businesses were recoverable; 19
had a contact confirmable from a search result, 3 were then caught by the
duplicate guard on the phone and domain axes, 6 fell below the fit gate.

Also repaired in `tools/log_run.py`: `IT\b` matched the ordinary word "it"
(patterns run case-insensitively), so a subject ending "…one room they all
fit in" filed a five-trade contractor under Professional services. Added
`Trades — exteriors`; added `wealth`/`investment` to Accounting/finance.

## 8. Remaining limitations, with the recovery already attempted

1. **`WebFetch` returns HTTP 403 for every host through the agent proxy and
   raw `curl` cannot connect.** Pages cannot be read directly. Recovery in
   use: `WebSearch` surfaces contact-page content inside result snippets,
   which is where every verified address in runs 12–14 came from. Contact
   forms therefore cannot be submitted, which is why a contact page never
   belongs in a `To:` line.
2. **Gmail MCP tools are not connected in this session.** The drafting
   workflow, rules and verifier are implemented and tested, but no Gmail
   draft can be created right now; runs deliver a TXT for manual paste and
   say so. The engine must never claim a draft exists that was not created.
3. **Street addresses are absent from historical rows.** The log's contact
   field held an email or a phone, not an address, so the address axis only
   protects businesses logged from V2 onward. The name, domain, email and
   phone axes cover the history.
4. **Statuses have never advanced past `email created`.** Only Neil knows
   what actually left his Gmail, so `sent_status` stays null until he
   confirms. This still blocks the full value of `RUN B9 FOLLOW UP`.
5. **The Back Nine master brand file is not present in this project.** Brand
   voice is taken from `references/website-research-email.md` and the
   Vernon site. Attach the brand file for final brand-sensitive production.
