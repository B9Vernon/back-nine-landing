# Usage

Run all commands from this engine directory. Add `--database` consistently when
maintaining separate campaigns.

## 1. Initialize

```powershell
npm install
npm run init -- --database ./data/cache/vernon-july.sqlite
```

## 2. Import hiring signals

```powershell
npm run import:jobs -- ./data/input/indeed-export.html --database ./data/cache/vernon-july.sqlite
npm run import:jobs -- ./data/input/castanet-copy.txt --database ./data/cache/vernon-july.sqlite
npm run import:jobs -- ./data/input/jobs.csv --database ./data/cache/vernon-july.sqlite
```

A TXT file containing only job URLs requires `--live`; each URL must be publicly
permitted. Saving the page to HTML and importing it is the safer fallback.

## 3. Filter outward from V1T 5B9

```powershell
npm run find:hiring -- --database ./data/cache/vernon-july.sqlite --radius 40 --limit 25 --categories sales,hospitality,customer_service,management,trades,tourism,operations
```

The command prints accepted signals in distance order. It does not produce a TXT
file.

## 4. Add official websites and research

Supply websites in the original import or a map with `company,website` columns:

```powershell
npm run research:companies -- --database ./data/cache/vernon-july.sqlite --website-map ./data/input/company-websites.csv --limit 25
```

The import-only command builds summaries from supplied evidence. To inspect
permitted official public pages:

```powershell
npm run research:companies -- --database ./data/cache/vernon-july.sqlite --limit 25 --live
```

## 5. Discover public contacts

```powershell
npm run find:contacts -- --database ./data/cache/vernon-july.sqlite --limit 25 --live
```

Priority is public owner/GM, HR/careers, sales/marketing, events/partnerships,
general business email, then contact form. Phone-only records are retained for
manual follow-up but excluded from normal TXT export.

## 6. Deduplicate

```powershell
npm run dedupe -- --database ./data/cache/vernon-july.sqlite
```

Deduplication uses name similarity plus exact domain, email, contact form, phone,
and address evidence. Scores are never shown in final output.

## 7. Review

```powershell
npm run review:list -- --database ./data/cache/vernon-july.sqlite --limit 25
npm run review:approve -- 12 --database ./data/cache/vernon-july.sqlite
npm run review:reject -- 13 --database ./data/cache/vernon-july.sqlite --reason "Outside practical customer area"
```

Review is mandatory. `run` always stops here.

## 8. Generate and export

```powershell
npm run generate:emails -- --database ./data/cache/vernon-july.sqlite --limit 25
npm run generate:txt -- --database ./data/cache/vernon-july.sqlite --limit 25
```

Generation stores email content in SQLite; it does not write the outreach TXT.
Only the second, explicit command creates the dated file.

## Approved search-provider discovery

Configure `B9_SEARCH_API_URL` and optionally `B9_SEARCH_API_KEY` from an approved
provider returning a JSON list under `jobs`, `results`, or `items`. Then run:

```powershell
npm run find:hiring -- --query "jobs hiring Vernon BC sales hospitality operations" --live
```

Without an approved API, export search results to HTML/CSV/JSON and import them.
No browser automation or CAPTCHA bypass is provided.

## Summary and audit

```powershell
npm run summary -- --database ./data/cache/vernon-july.sqlite
npm run audit:export -- --database ./data/cache/vernon-july.sqlite --output ./data/cache/vernon-july-audit.jsonl
```
