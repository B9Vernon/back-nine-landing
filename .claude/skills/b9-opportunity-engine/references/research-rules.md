# Source & Research Rules

## Access

- Public information only.
- Never bypass logins, CAPTCHAs, paywalls, access controls, blocked pages,
  anti-bot protections, or private systems. If blocked, skip the source.
- Respect rate limits and site restrictions; space out fetches to one host.
- Prefer, in order: public APIs → RSS feeds → XML sitemaps → structured
  directories → public event feeds → public datasets → official pages →
  browser-rendered public pages (last resort).

## Truth

- Never invent event details, dates, sponsors, organizations, or business
  relationships. A field you can't confirm is a field you omit.
- When sources conflict, verify against an official source or drop the item.
- Check currency: an "opportunity" based on a 2023 article is not timely.
  Prefer signals from the last ~6 months; events must fall in the run's
  time horizon.
- Confirm organizations are still operating (live official website, recent
  activity) before reporting them.

## Boundaries

These differ by mode. Read the one that matches what was asked.

### Intelligence runs (`RUN B9 OPPORTUNITY ENGINE`)

- No contact details in the report — the deliverable is opportunities, not
  a contact list.
- No outreach drafted.

### Outreach mode (Neil asks for prospects / partnership emails)

This is now the engine's most-used mode and it *does* produce contacts and
email drafts — that is the deliverable, not a boundary violation. What still
holds:

- **Public business contact info only.** No private personal data, no
  home addresses, no personal mobile numbers.
- **Never pattern-guess an address.** An email goes in the `To:` line only
  if it was seen in a public source. Inventing `info@<domain>` because the
  pattern looks right is forbidden — use the phone or contact page instead.
- **Drafts only, always.** The engine never sends, queues, or schedules a
  message. Neil reviews and sends every one manually.
- **Never re-contact a logged business.** Check `state/outreach-log.md`
  first, using `tools/dedup_check.py`.

### Both modes

- No recurring tasks, cron jobs, triggers, scheduled wakeups, or background
  monitoring — each run is a single, user-initiated pass.
- Do not show internal research process in the report unless asked. Since
  run 5 the standing instruction is: work quietly, deliver the file and a
  short summary at the end.

## Tooling reality (verified, do not re-discover)

- **`WebFetch` returns HTTP 403 for effectively every host** through this
  session's agent proxy — chamber directories, tourism sites, PDFs, all of
  it. Re-tested and still failing as of run 8. Do not burn calls fetching
  directory pages; go straight to `WebSearch`.
- `WebSearch` works and is the only discovery channel that does. The
  highest-yield query shape is a directory-style one that returns many
  names in a single snippet — "Lumby BC businesses names list", "top 10
  X in Vernon BC" — rather than one query per business.
