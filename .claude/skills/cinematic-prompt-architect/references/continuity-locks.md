# Continuity Locks

Treat every named reference as a continuity lock. Each must match its supplied asset exactly
unless the user requests a redesign. Never invent details that conflict with an existing
reference. Do not rename established references. When names are not yet established, describe
the asset clearly and propose a name only when building the asset library (see
`assets/asset-portfolio-registry.md`).

Include the relevant locks below as **POSITIVE LOCKS** and **NEGATIVE LOCKS** sections in prompts.

## Character continuity — preserve

identical face · facial proportions · body proportions · age · skin tone · hair · eye colour ·
wardrobe · footwear · accessories · golf glove (which hand) · dominant golf hand · physical
condition · scale in the environment.

**Prevent:** identity drift · face changes · age changes · skin-tone changes · body-shape changes ·
wardrobe changes · hairstyle changes · missing accessories · facial warping · extra/missing limbs ·
broken joints · extra/fused fingers · unnatural blinking · glowing eyes · plastic skin.

## Location continuity — preserve

identical room dimensions · walls · doors · windows · simulator-screen placement · turf boundaries ·
furniture · lighting fixtures · bay dividers · logo placement · ceiling structure · floor material ·
hallway direction.

**Prevent:** moving walls · shifting doors · disappearing windows · changing bay dimensions ·
altered simulator placement · warped architecture · melted furniture · incorrect room scale ·
changing logos · changing lighting fixtures.

## Prop continuity — preserve

identical shape · scale · dimensions · materials · colour · branding · wear · condition ·
orientation (when required).

**Prevent:** duplication · disappearance · scale/colour/shape changes · floating props · props
passing through bodies · props fused into hands · incorrect reflections · impossible shadows.

## Golf-club continuity — STRICT geometric protection

**Preserve:** straight shaft · correct shaft length · correct grip size · correct clubhead scale ·
correct clubhead attachment · correct clubface orientation · realistic lie angle · realistic loft ·
realistic metallic reflections · natural hand placement · realistic weight · physically correct
motion · correct orientation relative to the golfer · correct contact with the single ball.

**Never allow:** bent/twisted shafts · melted/reversed clubheads · clubface pointing the wrong way ·
grips fused into hands · clubs passing through bodies · duplicated clubs · changing club type ·
disappearing/floating clubs · club on the wrong hand · impossible wrist/arm angles · incorrect ball
contact · oversized/undersized clubs.

## Golf-swing direction (swing scenes)

Describe clearly: golfer stance · handedness · single-ball position · foot position · hand
placement · grip · shaft angle · clubface orientation · takeaway · backswing · top position ·
transition · downswing · impact · follow-through · weight transfer · hip rotation · shoulder
rotation · final balance · eyeline · ball launch direction · ball exit from frame.

Don't overcomplicate swing mechanics if it risks distortion — use shorter clips or separate the
swing phases. At impact, the single ball leaves its original position and continues as the same
object. Never show one ball on the turf after another launches. The clubface-to-ball contact must
be clearly visible and physically correct in every hitting scene — full mandatory rules:
`references/club-ball-impact.md`.

## Golf-ball movement (the single ball)

Define: exact starting position · stationary or moving · direction · speed · spin · height ·
trajectory · club interaction · turf interaction · screen interaction · bounce/roll · final
location · whether it stays visible · when it exits frame. Full rules:
`references/single-golf-ball-protocol.md`. If fast ball movement is hard to generate cleanly,
divide it into shorter clips.

## Branding & logos — preserve

exact proportions · official colours · typography. **Prevent** misspellings, logo mutation,
stretched lettering, floating logos. Place logos naturally on physical surfaces; avoid excessive
repetition; use supplied logo assets whenever possible. The official Back Nine Vernon logo must
never be improvised incorrectly — reference or composite an approved asset rather than asking the
model to generate detailed lettering from scratch. Brand palette and integration:
`references/back-nine-brand.md`.
