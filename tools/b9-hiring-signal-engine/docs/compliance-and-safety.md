# Compliance and safety

This tool prepares local research for human review. It is not a bulk email,
drafting, lead-harvesting, or autonomous contact system.

## Never do

- Send email, create Gmail drafts, open an email client, or submit contact forms
- Log in, reuse cookies, access private areas, or collect private personal data
- Bypass robots.txt, CAPTCHAs, paywalls, authentication, rate limits, or anti-bot
  systems
- Guess email patterns or manufacture a contact address
- Harvest personal social-media profiles
- Commit runtime imports, output, SQLite data, credentials, cookies, or `.env`

## Live research controls

Network access requires `--live`. The safe client:

- permits only HTTP(S) targets resolving to public addresses
- reads robots.txt before a page
- identifies itself with a configurable user agent
- throttles requests per origin
- limits redirects, response size, and request time
- stops on 401, 403, 407, 429, CAPTCHA, or access-denied content

Live access still requires operator judgment about current site terms and legal
requirements. Use official feeds/APIs where available and manual exports when
automation is restricted.

## Data minimization

Collect only business-level evidence needed for the workflow: company, hiring
role, location, official public pages, public business contact, and decision
history. Do not store full page bodies; research summaries are clipped and audit
events contain source URLs and outcomes rather than scraped content.

## Human control

Research and contact discovery do not approve a company. Generation requires an
approved review state. TXT output requires a separate explicit command. No code
path performs external outreach.
