# B9 Email Harvester

On-demand **public business-contact discovery** for Vernon, BC and the North
Okanagan. Finds the best publicly available decision-maker per company and
returns **Name, Phone, Email only**.

> **Contact research & extraction only.** It does not write invitations or
> marketing copy, score prospects, run campaigns, send email, contact anyone,
> or build a dashboard.

## Dormant by default

The skill does **nothing** until you type:

```
RUN B9 EMAIL HARVESTER
```

Optionally with inline settings, e.g.
`RUN B9 EMAIL HARVESTER — 150 contacts, Vernon plus 50 km, construction and professional services`.

Defaults: 100 unique contacts, Vernon + ~50 km, all industries, ≤2 emails per
company, verified during the run, new contacts not previously returned.

## Layout

```
b9-email-harvester/
├── SKILL.md                     # operator rules (activation, scope, priorities, workflow)
├── README.md                    # this file
├── scripts/
│   ├── harvester.py             # core library (validation, normalization, dedup, export)
│   ├── verify.py                # silent read-only verification (syntax, domain, MX)
│   ├── build_history.py         # build dedup index from history + project CSVs
│   ├── source_health.py         # probe robots/sitemap/RSS/structured data per source
│   └── export_csv.py            # write the 3-column Name,Phone,Email CSV
├── data/
│   ├── source_registry.json     # candidate source pool (re-ranked each run)
│   └── history.jsonl            # append-only log of previously returned contacts
└── tests/
    └── test_harvester.py        # offline unit tests
```

## Everyday commands

```bash
# Run the offline test suite
python tests/test_harvester.py

# Build the deduplication index from prior results
python scripts/build_history.py

# Verify a single email + phone (read-only; never sends mail)
python scripts/verify.py owner@example.ca "250-555-1234"

# Rank/health-check the candidate sources (public GETs only)
python scripts/source_health.py --registry data/source_registry.json

# Export verified contacts to a downloadable CSV
python scripts/export_csv.py contacts.json b9_contacts_2026-07-10.csv
```

## Principles

- Only collect contacts **publicly presented for business use**.
- Respect robots.txt, rate limits, paywalls, logins, and anti-bot controls —
  never bypass them.
- Never guess, manufacture, or infer an email; never probe an inbox.
- Never collect data for minors or private consumer/residential contacts.
- Keep hidden provenance for audit; show only **Name, Phone, Email**.
