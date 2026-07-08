# Distortion Prevention

Every prompt must actively prevent the failures below. Put the relevant items into a
**DISTORTION-PREVENTION LOCKS** section and a **NEGATIVE LOCKS** section. Visual stability is
more important than unnecessary complexity — if distortion risk is high, simplify the action,
the camera move, the number of characters, the number of props, the ball movement, the duration,
or the number of simultaneous events.

## Always prevent

- facial warping · identity drift · changing body proportions/age/wardrobe/hairstyle
- extra/missing limbs · extra/fused fingers · broken wrists · twisted arms · impossible joints
- warped architecture · bending walls · shifting doors · moving windows · melted furniture
- distorted golf bags
- bent/twisted club shafts · changing clubheads · wrong clubface direction
- **duplicated golf balls · extra golf balls · ghost golf balls · ball-shaped reflections ·
  golf-ball motion trails that resemble duplicates · one ball remaining after another launches**
- floating objects · disappearing props · incorrect shadows · impossible reflections
- unstable screens · random text · broken branding · misspelled logos
- characters appearing unexpectedly · objects changing scale
- clubs passing through bodies · feet sliding unnaturally · hands fused to equipment

## Reusable NEGATIVE LOCKS block (paste and trim to fit the scene)

> NEGATIVE LOCKS — do not render: more than one golf ball; any second/extra/ghost/duplicated
> golf ball anywhere including turf, basket, flight, reflections, glass, screens, HUD graphics,
> logos, or background; ball-shaped reflections; motion trails made of repeated balls; a ball
> remaining at address after being struck. No warped or duplicated faces; no identity/age/skin/
> body/wardrobe/hairstyle changes; no extra or missing limbs; no extra or fused fingers; no
> broken wrists or impossible joints; no plastic skin or glowing eyes. No bent, twisted, melted,
> reversed, duplicated, floating, disappearing, or wrong-hand golf clubs; no clubface pointing
> the wrong way; no club passing through the body. No warped architecture, bending walls,
> shifting doors, moving windows, melted furniture, or changed room scale. No moved or mutated
> logos, no misspelled branding, no random floating text. No floating objects, no clipping, no
> impossible shadows or reflections, no unstable screens, no unexpected extra people, no
> game-engine or synthetic CGI look.

## When to simplify vs. split

- **Simplify** when one instruction can be dialed back (fewer simultaneous actions, calmer camera).
- **Split** when the beat genuinely needs more room — divide into more ≤10s clips rather than
  overloading one generation (see `references/clip-structure-and-timing.md`).
