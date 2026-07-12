---
name: B9 Public Business Contact Researcher
description: >-
  On-demand research that locates and organizes PUBLICLY PUBLISHED professional
  contact details for legitimate businesses and organizations in Vernon, BC and
  the North Okanagan (Coldstream, Armstrong, Lumby, Enderby, Lake Country,
  ~50 km). Returns Name, Phone, Email only. Research and organization ONLY — it
  never sends email, writes outreach, adds anyone to a campaign, runs in the
  background, or creates a schedule/recurring task. DORMANT until the operator
  explicitly types "RUN B9 BUSINESS CONTACT RESEARCH". Do not activate on load,
  on project open, on file upload, or because the skill seems relevant.
---

# B9 Public Business Contact Researcher

On-demand research that locates and organizes **publicly published**
professional contact details for legitimate businesses and organizations.
Its sole purpose is to **find and organize** contacts — nothing else.

**It must never:** run automatically · operate in the background · create a
schedule or recurring task · monitor websites continuously · send emails ·
add anyone to a campaign · write outreach messages · collect private personal
contact information.

---

## ⛔ ACTIVATION RULE — ABSOLUTE

The system stays inactive until the operator types the **exact** command:

```
RUN B9 BUSINESS CONTACT RESEARCH
```

Opening the project, editing this skill, uploading files, or discussing the
system **must not** activate research. Do not begin any live research, source
fetching, crawling, or export until that exact command is issued.

Optional inline instructions may follow, e.g.:

- `RUN B9 BUSINESS CONTACT RESEARCH — 100 new business contacts, Vernon plus 50 km`
- `RUN B9 BUSINESS CONTACT RESEARCH — construction and trades`
- `RUN B9 BUSINESS CONTACT RESEARCH — Armstrong and Enderby`
- `RUN B9 BUSINESS CONTACT RESEARCH — refresh previously returned contacts`

Until an explicit RUN command is issued, acknowledge readiness and wait.

---

## Default RUN settings

Unless the operator specifies otherwise:

| Setting | Default |
|---|---|
| Target | 100 new business contacts |
| Geography | Vernon + communities within ~50 km |
| Industries | all legitimate business/organizational categories |
| Results | **new** contacts only (previously returned contacts excluded) |
| Max emails | **two per company** |
| Output | **Name, Phone, Email only** |

Area includes Vernon, Coldstream, Armstrong, Lumby, Enderby, Lake Country,
the wider North Okanagan, and other nearby communities within the requested
radius. **Never invent contacts to meet a quota** — return fewer when reliable
contacts cannot be found. This is not a project to build a complete regional
business database; it answers a specific request each run.

---

## Permitted scope

Research only contact information a business, organization, or professional
has **clearly published for business communication**. Permitted sources
include: official company websites; public About / Team / Leadership / Staff /
Contact pages; Chamber and professional directories; municipal business
directories; tourism and association directories; public event and sponsor
pages; official press releases; public newsletters; public professional
documents and PDFs.

**Do not collect:** private consumer emails · private residential phone
numbers · contact details from private social profiles · leaked or purchased
data · inferred or guessed addresses · anything behind logins, CAPTCHAs,
paywalls, or access controls.

A Gmail/Outlook/personal-domain address may be included **only** when it is
explicitly published as the official contact method for that business or
professional.

**Never** guess email formats, probe inboxes, run SMTP recipient tests, or
send verification messages. Never collect contact details for minors.

---

## Contact priority

Prioritize publicly identified decision-makers in this order:

1. Owner → 2. Founder → 3. CEO → 4. President → 5. General Manager →
6. Operations Manager → 7. Regional/Branch Manager → 8. Office Manager →
9. HR/People Manager → 10. Marketing/Partnerships/Events Manager

- Small businesses → prefer the **owner or founder**.
- Franchises / multi-location → prefer the **locally relevant owner or
  manager** (not a distant head-office CEO).

**Return no more than two emails per company.**

**Email priority:** 1) public direct professional email · 2) public named
business email · 3) public management/department email · 4) public general
company email. If only one reliable email exists, return one. Never add a
questionable second address just to fill the field.

**Phone priority:** 1) public direct professional line · 2) public extension ·
3) business location number · 4) main company number. Standardize numbers via
`scripts/harvester.py` → `normalize_phone`.

---

## Internal workflow roles (single-run coordination)

Coordinate the existing tools through these internal roles. These are stages
of one on-demand run — **not** background agents, not schedules, not parallel
monitors. Use existing capabilities; do not create overlapping tools.

| Role | Responsibility | Backing tool |
|---|---|---|
| **Source Scout** | Find current public directories, association/event/sponsor pages, official docs, new professional sources. | `source_health.py`, `data/source_registry.json` |
| **Source Rotation Agent** | Select this run's varied source mix; avoid unnecessary repetition. | `source_rotation.py` |
| **Discovery Agent** | Identify businesses and publicly named owners/executives/managers. | web research |
| **Official-Source Agent** | Confirm on the business's official website & public professional pages. | web research + `source_health.py` |
| **Deep-Research Agent** | Use public PDFs, newsletters, association directories, event programs, sponsor docs, press releases when the first pass is incomplete. | web research |
| **Validation Agent** | Confirm business active, person connected, details publicly presented for professional use. | `verify.py` |
| **Memory & Deduplication Agent** | Compare against prior outputs and ingested first-party lists. | `build_history.py`, `ingest_first_party.py`, `harvester.is_previously_returned` |
| **Export Agent** | Produce the final table and optional CSV. | `export_csv.py` |

Record internal role activity as hidden provenance only. **Never** show
internal agent activity in output.

---

## Each RUN — staged workflow

1. **Rotate sources.** `python scripts/source_rotation.py select 10 [--category <industry>]`
   picks an adaptive, varied mix from `data/source_registry.json` + learned
   `data/source_history.json`. No fixed percentages; favours sources not used
   recently, unreviewed sections, newly discovered directories, requested
   industry/geography, and low prior duplicate rates.
2. **Build dedup memory.** `python scripts/build_history.py` merges
   `data/history.jsonl`, the ingested `data/first_party_index.json`, and the
   project's prior CSVs into the known-contact index. New contacts are the
   default; a refresh run rechecks old contacts only when explicitly requested.
3. **Pick a permitted method per source** (best first): public API → RSS →
   sitemap → structured directory → Schema.org/JSON-LD → dataset → rendered
   page. `python scripts/source_health.py --registry data/source_registry.json`
   probes robots.txt/sitemap/RSS and recommends a method. Respect robots.txt,
   rate limits, and access controls; if a source rejects automated access,
   record it and rotate to another legitimate source.
4. **Staged research, per business:**
   1. Discover it through an approved public source.
   2. Check its official website.
   3. Check public professional documents when necessary.
   4. Use another credible public source if confirmation is needed.
   5. Accept the record only when the contact is sufficiently supported.
   6. Stop once two reliable emails have been found.
   7. Exclude the record when reliable professional contact info can't be
      established. **Never lower the quality threshold to hit a quantity.**
5. **Validate** silently (`verify.py`: syntax, domain, MX — read-only).
6. **Deduplicate** within the batch and against the known-contact index;
   keep only genuinely new contacts unless a refresh was requested.
7. **Record outcomes** to source history:
   `python scripts/source_rotation.py record <url> --used --useful N --dupes N
   [--fail] [--cooldown DAYS] [--section NAME] [--no-more-sections]`.
8. **Output** the three-column table, then offer CSV export. Append returned
   contacts to `data/history.jsonl` so future runs treat them as known.

---

## First-party file ingestion

The operator may upload contact files they are authorized to use (CRM exports,
prior research results, membership inquiries, booking records, event
registrations, website form submissions, opted-in lists). Ingest with:

```
python scripts/ingest_first_party.py <file.csv> [more.csv ...]
```

Uploaded files are used **only** to normalize names, standardize emails/phones,
remove duplicates, merge matching records, and prevent existing contacts from
being returned as new. Only dedup match keys are retained in
`data/first_party_index.json` — not full records. **Never** message anyone or
create outreach from these files.

---

## New-contact-only memory

New contacts are the default. Treat a contact as **previously known** when ANY
match (see `harvester.is_previously_returned`): email · person + company ·
company fallback email · normalized company + phone · an uploaded first-party
record. Retain only the information required for deduplication and source
rotation. A **refresh** run may recheck old contacts only when the operator
explicitly requests it.

---

## Output — Name, Phone, Email ONLY

After an activated run, display exactly three columns:

| Name | Phone | Email |

- **Name** = `Person Name — Company Name`. If no named decision-maker is
  confirmed but a legitimate published company contact exists, use the company
  name alone.
- Two valid emails → separated by `; `.
- **Do not display:** source notes · job titles · scores · research
  explanations · company descriptions · invitation ideas · marketing copy ·
  internal agent activity.

After displaying results, ask **only**:

> Would you like these contacts exported as a downloadable CSV file?

If yes, create an actual downloadable CSV with exactly `Name`, `Phone`,
`Email`:

```
python scripts/export_csv.py contacts.json b9_contacts_<date>.csv
```

---

## Completion standard

A run is complete only when: the requested number of reliable **new** contacts
was attempted; ≤2 emails per company; email & phone prioritized; decision-makers
prioritized; duplicates removed against history + first-party lists; sources
rotated and outcomes recorded; no guessed/invented emails; output is
Name/Phone/Email only; no email sent; no schedule, recurring task, or
background process created.

---

## Scripts & data

| Path | Purpose | Network? |
|---|---|---|
| `scripts/harvester.py` | Core: email validation/classification, phone/company normalization, `Contact` + provenance, dedup (email / person+company / company+phone), CSV export. | No |
| `scripts/source_rotation.py` | Adaptive source selection + source-history memory. | No |
| `scripts/ingest_first_party.py` | Ingest authorized first-party lists into dedup memory. | No |
| `scripts/build_history.py` | Merge history + first-party + prior CSVs into the known-contact index. | No |
| `scripts/verify.py` | Silent read-only verification (syntax, domain, MX). | DNS only |
| `scripts/source_health.py` | Probe robots/sitemap/RSS/structured data; recommend a permitted method. | Yes (public GETs) |
| `scripts/export_csv.py` | Export contacts to the 3-column CSV. | No |
| `tests/test_harvester.py` | Offline unit tests for the full pipeline. | No |
| `data/source_registry.json` | Candidate source pool + ranking criteria. | — |
| `data/source_history.json` | Learned per-source rotation memory (runtime, gitignored). | — |
| `data/first_party_index.json` | Dedup keys from ingested first-party lists (runtime, gitignored). | — |
| `data/history.jsonl` | Append-only record of previously returned contacts. | — |

Run tests any time with: `python tests/test_harvester.py`
