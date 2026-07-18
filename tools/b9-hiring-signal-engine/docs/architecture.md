# Architecture

## Design goals

The engine is an isolated TypeScript/Node package with a review-gated pipeline,
local SQLite persistence, modular source policies, deterministic email writing,
and a separate final export step. It does not depend on or modify the landing
site application.

## Pipeline

```text
permitted inputs
  -> normalization and fingerprinting
  -> category/signal classification
  -> distance and exclusion filtering
  -> official-company research
  -> public contact discovery
  -> quiet company deduplication
  -> manual approval/rejection
  -> personalized email generation in SQLite
  -> explicit TXT export
```

Every state-changing stage writes an `audit_log` record. The final TXT reads only
approved `companies` plus `generated_emails`.

## SQLite tables

- `jobs`: normalized hiring signals, source evidence, location decisions, and
  accepted/rejected state.
- `companies`: canonical research, contact, offer, status, and manual-review data.
- `company_jobs`: many-to-many provenance between companies and postings.
- `generated_emails`: generated subject/body, one current record per company.
- `audit_log`: separate source, decision, uncertainty, review, and export events.

Runtime databases and WAL files are gitignored.

## Modules and internal skills

| Skill | Primary modules |
| --- | --- |
| Job signal discovery | `src/discovery.ts`, `src/classify.ts` |
| Source ingestion | `src/ingestion.ts`, `src/adapters.ts`, `src/search.ts` |
| Location/distance | `src/location.ts`, `src/config.ts` |
| Company research | `src/research.ts`, `src/web.ts` |
| Contact discovery | `src/contact.ts` |
| Deduplication | `src/dedupe.ts` |
| Hiring classification | `src/classify.ts` |
| Offer matching | `src/offers.ts` |
| Email generation | `src/email.ts` |
| TXT export | `src/export.ts` |
| Manual review | `src/review.ts` |
| Audit/source logging | `src/audit.ts` |

Each `skills/*/SKILL.md` is a concise operator/agent contract and each `index.ts`
exposes the implementation surface.

## Network boundary

No command performs web access unless `--live` is explicit. `SafeWebClient`
permits HTTP(S) public-network targets only, checks robots rules, rate-limits by
origin, caps redirects/size/time, and stops on CAPTCHAs or access restrictions.
Large job-board adapters default to manual imports when direct automation is not
clearly permitted.
