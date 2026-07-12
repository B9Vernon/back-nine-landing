# B9 Public Business Contact Researcher

On-demand research that locates and organizes **publicly published**
professional contact details for legitimate businesses and organizations in
Vernon, BC and the North Okanagan. Returns **Name, Phone, Email only**.

> **Research & organization only.** It never sends email, writes outreach,
> adds anyone to a campaign, runs in the background, creates a schedule or
> recurring task, or collects private personal contact information.

## Dormant by default

The skill does **nothing** until you type the exact command:

```
RUN B9 BUSINESS CONTACT RESEARCH
```

Optionally with inline settings, e.g.
`RUN B9 BUSINESS CONTACT RESEARCH — 100 new business contacts, Vernon plus 50 km`,
`— construction and trades`, `— Armstrong and Enderby`, or
`— refresh previously returned contacts`.

Opening the project, editing the skill, or uploading files does **not**
activate research. Defaults: 100 new contacts, Vernon + ~50 km, all
industries, ≤2 emails per company, new contacts only (previously returned
excluded unless you ask for a refresh).

## Layout

```
b9-business-contact-researcher/
├── SKILL.md                     # operator rules (activation, scope, roles, staged workflow)
├── README.md                    # this file
├── scripts/
│   ├── harvester.py             # core library (validation, normalization, dedup, export)
│   ├── source_rotation.py       # adaptive source selection + source-history memory
│   ├── ingest_first_party.py    # ingest authorized first-party lists into dedup memory
│   ├── build_history.py         # merge history + first-party + prior CSVs into known-contact index
│   ├── verify.py                # silent read-only verification (syntax, domain, MX)
│   ├── source_health.py         # probe robots/sitemap/RSS/structured data per source
│   └── export_csv.py            # write the 3-column Name,Phone,Email CSV
├── data/
│   ├── source_registry.json     # candidate source pool
│   ├── source_history.json      # learned rotation memory (runtime, gitignored)
│   ├── first_party_index.json   # dedup keys from ingested lists (runtime, gitignored)
│   └── history.jsonl            # append-only log of previously returned contacts
└── tests/
    └── test_harvester.py        # offline unit tests (simulated records only)
```

## Everyday commands

```bash
# Run the offline test suite (12 groups)
python tests/test_harvester.py

# Pick this run's adaptive, varied source mix (optionally by industry)
python scripts/source_rotation.py select 10 --category construction

# Ingest an authorized first-party list (CRM export, bookings, opted-in, etc.)
python scripts/ingest_first_party.py my_crm_export.csv

# Build the deduplication index (history + first-party + prior CSVs)
python scripts/build_history.py

# Record a source's outcome so rotation adapts next run
python scripts/source_rotation.py record https://example.ca --used --useful 6 --dupes 2

# Verify a single email + phone (read-only; never sends mail)
python scripts/verify.py owner@example.ca "250-555-1234"

# Export contacts to a downloadable CSV
python scripts/export_csv.py contacts.json b9_contacts_2026-07-11.csv
```

## Principles

- Only collect contacts **publicly published for business communication**.
- Respect robots.txt, rate limits, paywalls, logins, and anti-bot controls —
  never bypass them.
- Never guess, manufacture, or infer an email; never probe an inbox.
- Never collect data for minors or private consumer/residential contacts.
- New contacts by default; a refresh rechecks old contacts only when asked.
- First-party lists are used only to dedupe/normalize — never for outreach.
