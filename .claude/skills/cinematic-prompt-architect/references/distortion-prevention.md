# Distortion Prevention

Every prompt must actively prevent the failures below — **but prevention happens through
positive description, simple action, and start frames, not through walls of negations**
(`references/generation-reliability.md`). The list below is a *risk checklist for the writer*,
not text to paste into prompts. In the prompt itself, the correct state is described positively,
and only the failures genuinely at risk in that clip go into **one `AVOID:` line of ~25 words
maximum**. Visual stability is more important than unnecessary complexity — if distortion risk
is high, simplify the action, the camera move, the number of characters, the number of props,
the ball movement, the duration, or the number of simultaneous events.

## Always prevent

- facial warping · identity drift · changing body proportions/age/wardrobe/hairstyle
- **identity substitution — a different-looking or generic person appearing instead of the exact
  face/hair/build shown in an attached character reference** (`references/reference-image-fidelity.md`)
- extra/missing limbs · extra/fused fingers · broken wrists · twisted arms · impossible joints
- warped architecture · bending walls · shifting doors · moving windows · melted furniture
- **invented facility elements — extra screens, curved/angled/free-standing screens, projector
  beams, extra monitors, rearranged walls or furniture not present in the attached location
  reference; a golfer standing outside the turf/hitting-area boundary; a golfer not oriented
  toward the impact screen during address/swing** (`references/reference-image-fidelity.md`)
- distorted golf bags
- bent/twisted club shafts · changing clubheads · wrong clubface direction
- **duplicated golf balls · extra golf balls · ghost golf balls · ball-shaped reflections ·
  golf-ball motion trails that resemble duplicates · one ball remaining after another launches**
- floating objects · disappearing props · incorrect shadows · impossible reflections
- unstable screens · random text · broken branding · misspelled logos
- characters appearing unexpectedly · objects changing scale
- clubs passing through bodies · feet sliding unnaturally · hands fused to equipment

## The AVOID line (replaces the old multi-paragraph NEGATIVE LOCKS block)

**Do not paste a long negative-lock paragraph into a generation prompt.** Every noun in a
negation still injects that concept into the generation — a block that says "golf ball" eight
times makes an extra ball *more* likely, not less (`references/generation-reliability.md`).

Instead, end each prompt with **one `AVOID:` line, ~25 words maximum**, listing only the
failures genuinely at risk in that specific clip. Examples:

> AVOID: extra people, warped faces, fused fingers, bent shaft, duplicated objects, readable
> invented text, CGI look.

> AVOID: warped faces, extra fingers, floating objects, second screen, invented furniture.

Notice these examples name generic failure *categories* — they do not re-name the hero objects
("ball," "club" appears at most once). If a failure needs more than a two-word mention to
prevent, it belongs in the positive description of the correct state, not in the AVOID line.

## When to simplify vs. split

- **Simplify** when one instruction can be dialed back (fewer simultaneous actions, calmer camera).
- **Split** when the beat genuinely needs more room — divide into more ≤10s clips rather than
  overloading one generation (see `references/clip-structure-and-timing.md`).
