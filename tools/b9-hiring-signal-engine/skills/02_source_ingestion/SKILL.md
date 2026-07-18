---
name: ingest-job-sources
description: Normalize permitted job-signal inputs for the B9 engine. Use for CSV, JSON, saved HTML, copied text, job URL lists, company lists, approved feeds, and search-result exports.
---

# Ingest job sources

1. Prefer official APIs/feeds, then permitted public pages, then user exports.
2. Require `--live` for URL fetching and honor the adapter policy.
3. Parse JSON-LD `JobPosting` first; use generic HTML cards only as fallback.
4. Normalize records to `JobSignalInput`, fingerprint them, and preserve source evidence.
5. Never bypass authentication, CAPTCHAs, robots.txt, or anti-bot controls.

Input: a supported file or explicitly permitted URL source.

Output: normalized, fingerprinted job records and import counts.

Use `index.ts`; adapter policies live in `src/adapters.ts`.
