# B9 Hiring Signal Engine

Local, CLI-first hiring intelligence for Back Nine Vernon. The engine turns
permitted job-signal inputs into manually reviewed, researched outreach copy. It
never sends email, creates drafts, opens an email client, or contacts anyone.

The engine is isolated from the landing site and stores runtime data in a local
SQLite database. Job boards are treated as hiring-signal sources; official public
company websites are the preferred contact source.

## Requirements

- Node.js 24 or newer (the engine uses Node's built-in SQLite API)
- npm 11 or newer
- User-provided job exports or an explicitly permitted live source
- `--live` only when public web research is intended

## Install and initialize

From `tools/b9-hiring-signal-engine/`:

```powershell
npm install
npm run init
```

The default database is `data/cache/b9-hiring-signals.sqlite`. To use another
database, add `--database ./data/cache/run-name.sqlite` to any command.

## Safest complete workflow

```powershell
npm run import:jobs -- ./data/input/jobs.csv
npm run find:hiring -- --radius 40 --limit 25
npm run research:companies -- --website-map ./data/input/company-websites.csv --limit 25
npm run find:contacts -- --limit 25
npm run dedupe
npm run review:list -- --limit 25
npm run review:approve -- 12
npm run generate:emails -- --limit 25
npm run generate:txt -- --limit 25
npm run summary
```

Use `--live` on `research:companies` and `find:contacts` only when the supplied
company websites may be fetched. Live requests honor robots.txt, throttle by
host, stop at access restrictions/CAPTCHAs, reject private-network targets, and
do not attempt login or bypasses.

`run` performs import, filtering, research, contact discovery, and deduplication,
then stops at the manual review gate:

```powershell
npm run run -- ./data/input/jobs.csv --radius 40 --limit 25 --live
```

It does not approve records, generate emails, or export TXT.

## Demo with fictional data

```powershell
npm run demo
```

The demo uses reserved `.example` domains and fictional companies. Running it is
an explicit request to reset its dedicated `data/cache/demo.sqlite`, exercise the
review, generation, and TXT export stages, and write the dated result to
`data/output/`.

## Inputs

- CSV/TSV with flexible column aliases
- JSON array, `{ "jobs": [...] }`, or a single job object
- Saved HTML with JSON-LD `JobPosting` or recognizable job cards
- Copied TXT blocks using `Company:`, `Job Title:`, `Location:`, and related keys
- TXT company-name lists (treated as manual operations hiring signals)
- TXT job URL lists when `--live` is explicitly supplied
- Approved search-provider JSON via `--query` and environment configuration

Useful optional fields are `website`, `company_description`, `public_email`,
`contact_url`, `phone`, `address`, `latitude`, and `longitude`. A public email is
accepted only as supplied evidence or when found on a permitted official page;
the engine never guesses one.

See [data/samples/fake-jobs.csv](data/samples/fake-jobs.csv),
[data/samples/copied-jobs.txt](data/samples/copied-jobs.txt), and
[data/samples/website-map.csv](data/samples/website-map.csv).

## Filtering controls

Defaults:

- Origin: `V1T 5B9`
- Radius: 40 km
- Kelowna: excluded
- Golf courses: excluded
- Unknown/out-of-radius locations: rejected
- Categories without a clear Back Nine angle: rejected

Overrides are explicit:

```powershell
npm run find:hiring -- --radius 50 --include-kelowna --include-golf
npm run find:hiring -- --categories sales,hospitality,customer_service,management,trades,tourism,operations
npm run find:hiring -- --sources manual-csv,job-bank
```

## Manual review and no-contact leads

Approve a single company by displayed ID or exact name:

```powershell
npm run review:approve -- 12
npm run review:reject -- 13 --reason "No relevant Back Nine angle after review"
```

`--all` is available for an explicitly reviewed batch. Companies without a
public email or contact form are skipped unless `--include-no-email` is supplied
to approval, generation, and export. The default is to exclude them.

## TXT output

The explicit `generate:txt` command creates:

```text
data/output/b9-hiring-signal-emails-YYYY-MM-DD.txt
```

Every block contains only:

```text
COMPANY:
EMAIL:
EMAIL SUBJECT:
EMAIL BODY:
```

No scores, raw logs, research notes, or hidden metadata are included. Audit data
stays in SQLite and can be separately exported with:

```powershell
npm run audit:export -- --output ./data/cache/audit-log.jsonl
```

## Validation

```powershell
npm test
npm run build
npm run validate:txt -- ./data/samples/demo-output.txt
```

Read [docs/usage.md](docs/usage.md) for command details and
[docs/compliance-and-safety.md](docs/compliance-and-safety.md) before enabling
live research.
