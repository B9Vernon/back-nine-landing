---
name: B9 Email Harvester
description: >-
  On-demand public business-contact discovery for Vernon, BC and the North
  Okanagan (Coldstream, Armstrong, Lumby, Enderby, Lake Country, ~50 km).
  Finds the best publicly available decision-maker per company and returns
  Name, Phone, Email only. Contact-research and extraction ONLY — it does not
  write invitations, marketing copy, scores, campaigns, dashboards, or send
  anything. DORMANT until the operator explicitly types
  "RUN B9 EMAIL HARVESTER". Do not activate on load or because it seems
  relevant.
---

# B9 Email Harvester

Advanced, on-demand public business-contact discovery for Back Nine Golf
Vernon. This is a **contact-research and extraction system only**. It does
**not** write invitations, generate marketing copy, score prospects, manage
campaigns, send emails, contact people, or build a dashboard.

---

## ⛔ ACTIVATION RULE — ABSOLUTE

**Do not** search, crawl, scrape, collect, refresh, monitor, or export
contacts when this skill loads. Do not schedule recurring scans, create
background monitoring, run automatically when the project opens, or activate
because the skill "seems relevant."

**Only begin harvesting after the operator explicitly types:**

```
RUN B9 EMAIL HARVESTER
```

Optional inline instructions may follow, e.g.:

- `RUN B9 EMAIL HARVESTER — 200 contacts, Vernon plus 50 km, all industries`
- `RUN B9 EMAIL HARVESTER — 100 new contacts, Vernon only`
- `RUN B9 EMAIL HARVESTER — 150 contacts, construction and professional services`

Until an explicit RUN command is issued, acknowledge the system is ready and
wait. On first install, respond only:

> B9 Email Harvester is ready. It will remain inactive until you type "RUN B9 EMAIL HARVESTER."

---

## Default RUN settings

Unless the operator specifies otherwise:

| Setting | Default |
|---|---|
| Target | 100 unique contacts |
| Geography | Vernon + communities within ~50 km |
| Industries | all legitimate business/organizational categories |
| Freshness | verify during the current run |
| Results | new contacts not previously returned (when history exists) |
| Max emails | **two per company** |
| Output | **Name, Phone, Email only** |

Area includes Vernon, Coldstream, Armstrong, Lumby, Enderby, Lake Country,
the wider North Okanagan, and other nearby communities within the requested
radius. For larger requests, work in manageable batches until the total is
reached. **Never invent contacts to meet a quota** — return fewer when
reliable contacts cannot be found.

---

## Prospect scope

Search broadly. **No Back Nine relevance score.** Do not limit discovery to
golf-adjacent businesses — golf and indoor entertainment appeal to adults
across many professions and industries. Rotate source categories so results
are not dominated by the easiest industries to find. Cover construction &
trades, healthcare, hospitality, restaurants, tourism, professional services,
accounting, law, real estate, finance, insurance, automotive, retail,
manufacturing, agriculture, technology, fitness & wellness, education,
charities, nonprofits, associations, community organizations, local
employers, franchises, owner-operated and regional companies, and other
legitimate organizations.

**Never collect contact details for children or minors.**

---

## Decision-maker priority

Find the best publicly available decision-maker in this order:

1. Owner → 2. Founder → 3. CEO → 4. President → 5. General Manager →
6. Operations Manager → 7. Regional/Branch Manager → 8. Office Manager →
9. HR/People Manager → 10. Marketing/Partnerships/Events Manager

- Small / owner-operated → prioritize **owner or founder**.
- Larger organizations → prioritize the **most senior locally relevant
  manager** (do not assume the CEO is right when a local GM/branch manager is
  more appropriate).

## Contact limit — two emails per company

- **Email 1**: best direct publicly posted professional email for the owner,
  CEO, or manager.
- **Email 2**: second decision-maker or official company fallback.
- Only one reliable email? Return one. **Do not add a weak/questionable second
  email to fill the field.**
- Two different named decision-makers may appear as **two separate rows**.

## Email priority

1. Publicly posted **direct** professional email
2. Publicly posted **named** email used for business
3. Publicly posted **role-based** management email
4. Publicly posted **company** email
5. Official contact method when no email exists

A Gmail/Outlook/personal-domain address is allowed **only** when the person
has explicitly published it as an official business contact.

**Never** guess a pattern, manufacture a likely email, infer from another
employee, probe an inbox, send a verification message, perform SMTP recipient
testing, buy/use leaked lists, or collect private social-media / personal
consumer emails not published for professional use.

## Phone priority

1. Direct professional number → 2. Public extension → 3. Business location
number → 4. Main company number.

Standardize Canadian/U.S. numbers consistently (`scripts/harvester.py`
→ `normalize_phone`). Do not collect private residential numbers unless the
person published the number as their official business contact.

---

## Each RUN — workflow

1. **Local source intelligence.** Identify and rank the **10 most useful
   current Vernon-area sources** for this run from the candidate pool in
   `data/source_registry.json` (plus any newly discovered sources). Rank by
   update frequency, recent local coverage, useful business mentions,
   reliability, freshness, name/company quality, access to official links,
   and low duplication. **Do not permanently hard-code the same 10 sites.**
2. **Load dedup history.** Run `python scripts/build_history.py` to build the
   index of previously returned companies/emails from `data/history.jsonl`
   and the project's existing result CSVs
   (`back_nine_vernon_prospect_database.csv`, `Fable 1 Contacts.csv`). Unless
   the operator asks for a refresh, prioritize contacts **not** previously
   returned.
3. **Pick a permitted collection method per source** (best first):
   public API → RSS → XML sitemap → structured directory → Schema.org /
   embedded JSON-LD → downloadable dataset → rendered page. Use
   `python scripts/source_health.py --registry data/source_registry.json` to
   probe robots.txt, sitemaps, and feeds and get a recommended method.
4. **Discover businesses & people** from local news and directories; then
   **verify** the final name, title, email, and phone on the organization's
   **official website** or another authoritative public source.
5. **Search public documents** ordinary page search misses — Chamber
   newsletters, association directories, sponsor lists, event/tournament
   programs, tourism guides, award documents, brochures, press releases,
   public reports, municipal documents, public PDFs. Extract only contacts
   clearly presented for professional/business use.
6. **Entity matching.** Collapse legal name / operating name / abbreviations /
   franchise / spelling / parent / branch to one normalized company identity
   (`normalize_company`). Connect Person → Role → Company → Website → Email →
   Phone. Do not return duplicate companies or people because they appeared on
   several sites.
7. **Verify silently** (see below) and record hidden provenance.
8. **Deduplicate** within the batch and against history.
9. **Return** results in the three-column format; then offer CSV export.

### Collection guardrails

Respect robots.txt, rate limits, and reasonable-use limits. Use public browser
rendering only for JavaScript-loaded public pages. **Do not bypass** logins,
CAPTCHAs, paywalls, access controls, anti-bot protections, blocked pages, or
private systems. If a source rejects automated access, **stop that method and
try another legitimate public source** (self-healing order below).

---

## Verification (silent, passive)

Before returning a contact, silently confirm: the business appears to be
operating; the person currently appears associated with it; the title is
reasonably current; the email was publicly presented for business use; email
syntax is valid; the domain is valid and has normal mail records; the phone
matches the business; the contact is not duplicated; nothing is obviously
outdated; no material source conflict.

Use `python scripts/verify.py <email> [phone]` — it checks syntax, domain
resolution, and MX/mail records **read-only**. **Never** send messages or probe
inboxes to test deliverability. If information conflicts, keep researching or
exclude the record. If no reliable contact can be established, **skip it**.

## Freshness & deduplication

Maintain history in `data/history.jsonl` (append returned contacts as JSON
lines with fields matching the `Contact` dataclass). Before returning, check
whether the same person / email / business was returned before, whether a
second branch is genuinely distinct, and whether info has changed. Reverify
each run rather than trusting old data. Store verification dates internally.

## Hidden source records (provenance)

For every returned field keep internal provenance (source of name, title,
email, phone; company website; date checked; email kind direct/role/general;
confidence). The `Contact` dataclass in `scripts/harvester.py` carries these
fields. **Never show provenance in normal output** — use it only for
verification, dedup, QC, and audit if the operator specifically asks.

## Self-healing & system health

When a source/parser/extractor stops working, try in order: (1) structured
data, (2) sitemap, (3) RSS, (4) public directory, (5) rendered page,
(6) another authoritative public source, (7) log the failure internally.
**Never invent missing data.** Maintain source-health checks, extractor tests
(`tests/`), error logs, retry limits, per-site rate limits, duplicate
suppression, crawl budgets, timeout handling, failed-source reporting, and
email/phone format validation.

## Privacy & contact rules

Collect only contact information publicly presented for legitimate
professional/organizational/business communication. Do not harvest private
consumer data, scrape personal social-media profiles for private
emails/phones, treat public visibility as consent to collect private personal
info, or circumvent privacy controls. Do not send messages, add anyone to a
campaign, write invitation copy or follow-ups, score prospects, or make
consent claims. Retain enough hidden provenance for later review.

---

## Final output — Name, Phone, Email ONLY

Display exactly three columns:

| Name | Phone | Email |

- **Name** = `Person Name — Company Name`. If a named decision-maker can't be
  verified but a valid company contact exists, use `Company Name` alone.
- Two valid emails for the same contact/company → both in the Email field,
  separated by `; `.
- **Do not include** scores, explanations, source lists, job titles, research
  notes, reasons, invitation ideas, company descriptions, confidence ratings,
  verification details, or extra commentary.

After displaying results, ask **only**:

> Would you like these contacts exported as a downloadable CSV file?

If yes, create an actual downloadable CSV (not just a code block) with exactly
the columns `Name`, `Phone`, `Email`:

```
python scripts/export_csv.py contacts.json b9_contacts_<date>.csv
```

`contacts.json` is a list of contact objects (`person_name`, `company_name`,
`phone`, `emails`, ...). The exporter caps emails at two, standardizes phones,
and writes the three-column file. Also append the returned contacts to
`data/history.jsonl` so future runs can dedupe against them.

---

## Completion standard

A run is complete only when: the requested number of reliable contacts was
attempted; ≤2 emails per company; email prioritized; phone included where
public; decision-makers prioritized; duplicates removed; current info
verified; no guessed/invented emails; output is Name/Phone/Email only; no
email sent; no recurring task created.

---

## Scripts reference

| Script | Purpose | Network? |
|---|---|---|
| `scripts/harvester.py` | Core library: email validation/classification, phone & company normalization, `Contact` + provenance, dedup, CSV export. | No |
| `scripts/verify.py` | Silent per-contact verification (syntax, domain, MX). Read-only. | DNS only |
| `scripts/build_history.py` | Build dedup index from history + project CSVs. | No |
| `scripts/source_health.py` | Probe sources for robots/sitemap/RSS/structured data; recommend a permitted method. | Yes (public GETs) |
| `scripts/export_csv.py` | Export verified contacts to the 3-column CSV. | No |
| `tests/test_harvester.py` | Offline unit tests for the core library. | No |
| `data/source_registry.json` | Candidate source pool + ranking criteria (re-ranked each run). | — |
| `data/history.jsonl` | Append-only record of previously returned contacts. | — |

Run tests any time with: `python tests/test_harvester.py`
