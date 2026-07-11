# Connection & Integration Discovery

During activated requests, determine whether connecting a portal, website, file source,
image library, browser tool, or approved account would materially improve: accuracy ·
consistency · event setup · registration links · portal compatibility · visual quality ·
professional-golf research · seasonal relevance · event memory · future improvement.

## How to ask — always specifically, never "connect your accounts"

State: (1) the exact portal/website/service/folder/file needed · (2) why it improves
the system · (3) read-only or editing · (4) the specific information or fields needed ·
(5) required or optional · (6) what can still be completed without it · (7) how to
provide access safely.

Never request a password. Prefer: approved browser session · official OAuth ·
a connector · an API · read-only export · uploaded file · shared limited-access
folder · public URL · temporary browser-control session. Request minimum access. Never
connect, authorize, or modify anything without permission. Never stop a build over an
optional connection — placeholder and continue. Ask only when the value is meaningful.

## Verified link registry (only confirmed entries — never guess additions)

| Resource | URL | Status |
|---|---|---|
| Back Nine main site | https://backninegolf.ca | verified (public) |
| Memberships page | https://backninegolf.ca/local/vernonbc/memberships/ | verified (Vernon-supplied) |
| Tournament admin portal | https://franchise.backninegolf.ca/app/#/tournaments/view/7 | Vernon-supplied; login required — approved browser session only |
| Back Nine event registration URL | — | ASK per event |
| Beyond the Grass URL | — | ASK |
| FS Compete event URL | — | ASK per event |
| Golf Canada app — iOS App Store | — | verify via web at build time or ASK |
| Golf Canada app — Google Play | — | verify via web at build time or ASK |
| Public hosted image library (HTTPS) | — | ASK (needed for portal HTML images) |

Update this table whenever Vernon verifies a link.

## Standing high-value connections to request when relevant

- **Portal browser session** (read-and-type, stop before save) — to verify HTML
  rendering in the real Tournament Details field and enable FILL B9 PORTAL. Optional;
  builds proceed without it.
- **Beyond the Grass + FS Compete + Back Nine registration URLs** — required per event
  for working three-step buttons; placeholders otherwise.
- **Approved image/logo folder at public HTTPS URLs** — required for finished portal
  HTML imagery; labelled placeholders otherwise. (Local repo assets exist in
  `landing-page-files/assets/` but are not publicly hosted.)
- **Previous event HTML / posters / results / feedback** (read-only export or
  screenshots) — optional; materially improves event memory and future builds.
- **Golf Canada facility listing details** — optional; confirms exact facility naming
  and app links.

## In-repo sources already connected (no ask needed)

- Brand palette & visual standard: `.claude/skills/cinematic-prompt-architect/references/back-nine-brand.md`
- Live landing pages & assets: `landing-page-files/`
- Engine memory: `.claude/skills/b9-event-engine/memory/`
