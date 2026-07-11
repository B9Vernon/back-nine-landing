# Three-Step Registration

Players may need to register in up to three places. The engine does not manage these
platforms — it explains the process and builds the buttons.

1. **Back Nine Vernon** — event registration
2. **Beyond the Grass** — account/setup
3. **FS Compete** — join the event in Full Swing's competition app

## Required presentation

A clearly numbered, impossible-to-misread section with three large, high-contrast,
thumb-friendly buttons:

- `REGISTER WITH BACK NINE VERNON` → `https://backninegolf.ca/local/vernonbc/tournaments/` (verified default)
- `COMPLETE YOUR BEYOND THE GRASS SETUP` → `{{BEYOND_THE_GRASS_URL}}` (per-event link; defaults to `https://www.beyondthegrass.com/compete`)
- `JOIN THE EVENT ON FS COMPETE` → `https://auth.fullswingapps.com/` (verified default)

Each step gets one short line explaining what it is and why it matters (e.g. step 3 is
how scores connect to the event inside the simulator). If Vernon states an event uses
fewer than three platforms, build only the ones that apply.

## Verified defaults & the event code (permanent — confirmed by Vernon 2026-07-11)

- **Back Nine sign-up** is the tournaments page: `https://backninegolf.ca/local/vernonbc/tournaments/`.
  Same URL powers the final "Claim my spot" CTA.
- **Beyond the Grass** general sign-up is `https://www.beyondthegrass.com/compete`, **but
  every tournament/league gets its own special Beyond the Grass link.** Keep
  `{{BEYOND_THE_GRASS_URL}}`, default it to `/compete`, and ask Vernon for the per-event link.
- **FS Compete** sign-up is `https://auth.fullswingapps.com/`. It requires the **Full
  Swing event code**, which lives in the Back Nine tournament portal description. Surface
  the code in step 3 as a labelled box (`{{FULL_SWING_EVENT_CODE}}`) and also as a row in
  the Event Information table so players can copy it into FS Compete.

## URL rules — absolute

- Use ONLY verified defaults above, links Vernon supplies, or an approved connection.
- NEVER guess, construct, or "probably" a URL.
- A missing per-event URL = keep the placeholder, list it in the Link Replacement List,
  and ask Vernon specifically (grouped with any other missing essentials).

Verified-link registry lives in `connections.md`.
