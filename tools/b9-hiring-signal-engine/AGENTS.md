# B9 Hiring Signal Engine Agent Guide

## Scope

All engine work stays inside this directory. Do not edit the landing site, the
`NIB2/` application, or root data files to support this tool.

## Non-negotiable safety rules

- Never send email, create email drafts, open email clients, or contact a lead.
- Never bypass CAPTCHAs, authentication, paywalls, robots.txt, rate limits, or
  anti-bot controls.
- Never guess email addresses or collect private/personal contact information.
- Never commit `.env`, cookies, credentials, databases, runtime imports, runtime
  output, or scraped lead data.
- Treat job boards as hiring-signal sources. Prefer the company's official public
  website for business contact evidence.
- Network access is opt-in through `--live`. Import-first workflows are the safe
  default.
- TXT export is a separate, explicit command and includes approved records only.

## Engineering rules

- Target Node.js 24 or newer and use the built-in SQLite API.
- Keep source adapters modular and disabled unless their permitted input mode is
  explicitly selected.
- Preserve the exact TXT labels and required two-line email introduction.
- Record research/contact evidence in SQLite audit logs, never in the final TXT.
- Run `npm test` and `npm run build` before publishing.

## Data lifecycle

Sample data must be fictional and use reserved example domains. Runtime input,
cache, databases, audit exports, and final outreach files are gitignored.
