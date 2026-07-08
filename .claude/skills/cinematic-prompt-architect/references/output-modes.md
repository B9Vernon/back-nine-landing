# Output Modes (A–M)

Detect the mode the user wants from their request. If unstated, default to **Mode A** for a
concept, **Mode B** for an existing prompt they hand you, and **Mode L/M** when they describe a
multi-beat or timed social video. A single request can combine modes (e.g. build a master sheet,
then a sequence).

- **MODE A — FULL CINEMATIC PROMPT.** Return the complete structured prompt(s) optimized for
  Seedance through Higgsfield.
- **MODE B — PROMPT ENHANCEMENT.** Preserve the original concept; improve cinematography, realism,
  pacing, continuity, and technical precision.
- **MODE C — PROMPT DIAGNOSIS.** List weaknesses, contradictions, missing details, and generation
  risks, then provide the corrected prompt.
- **MODE D — MULTIPLE CREATIVE DIRECTIONS.** Up to three distinctly different treatments.
- **MODE E — PLATFORM OPTIMIZATION.** Adapt for Seedance, Higgsfield, or another named platform.
- **MODE F — COMPACT PROMPT.** Shorter prompt without removing critical continuity, camera,
  lighting, physics, single-ball, distortion-prevention, or output instructions.
- **MODE G — JSON PRODUCTION PROMPT.** JSON only when the user requests it or the workflow clearly
  benefits. Mirror the 35-section framework as keys; keep the single-ball and negative locks.
- **MODE H — CHARACTER MASTER SHEET.** Use `templates/character-master-sheet.md`.
- **MODE I — LOCATION MASTER SHEET.** Use `templates/location-master-sheet.md`.
- **MODE J — PROP MASTER SHEET.** Use `templates/prop-master-sheet.md`.
- **MODE K — SINGLE-GOLF-BALL MASTER SHEET.** Use `templates/single-golf-ball-master-sheet.md`.
- **MODE L — MULTI-CLIP CINEMATIC SEQUENCE.** Divide a full concept into multiple independently
  generated prompts with matching transitions and continuity.
- **MODE M — SOCIAL-MEDIA CLIP SYSTEM.** Build a 10s / 15s / 20s / 30s / longer social video using
  the strongest automatic clip structure (`references/clip-structure-and-timing.md`).

## When to ask the user a question (rare)

Only ask when the answer would fundamentally change: the story · the character · the location ·
the brand · the shot format · the platform · the aspect ratio · the total video duration · the
presence of dialogue · whether a true one-take is required · whether a new recurring asset must be
created · whether a proposed asset name should become permanent.

**Never ask:** how many clips are needed · which camera moves to use (unless the concept can't be
resolved without it) · to name every asset before work begins. Use clear temporary descriptions
until permanent names are approved. Don't explain every decision unless asked.
