# Continuity Locks

Treat every named reference as a continuity lock. Each must match its supplied asset exactly
unless the user requests a redesign. Never invent details that conflict with an existing
reference. Do not rename established references. When names are not yet established, describe
the asset clearly and propose a name only when building the asset library (see
`assets/asset-portfolio-registry.md`).

Include the relevant locks below as **POSITIVE LOCKS** in prompts — phrased as the correct state
to preserve, with residual risks going into the single ~25-word `AVOID:` line
(`references/generation-reliability.md`).

## Character continuity — preserve

identical face · facial proportions · body proportions · age · skin tone · hair · eye colour ·
wardrobe · footwear · accessories · golf glove (which hand) · dominant golf hand · physical
condition · scale in the environment.

**Prevent:** identity drift · face changes · age changes · skin-tone changes · body-shape changes ·
wardrobe changes · hairstyle changes · missing accessories · facial warping · extra/missing limbs ·
broken joints · extra/fused fingers · unnatural blinking · glowing eyes · plastic skin.

**When a character reference image is attached, this is a hard identity lock, not a suggestion.**
Never describe the person generically ("a golfer," "a woman," "a man") — name the exact reference
asset and lock face/hair/build/skin tone in words. A generated face that doesn't match the
attached reference is a failed generation, exactly like a duplicated golf ball: reject and
regenerate with stronger identity wording. Full rules: `references/reference-image-fidelity.md`.

## Location continuity — preserve

identical room dimensions · walls · doors · windows · simulator-screen placement · turf boundaries ·
furniture · lighting fixtures · bay dividers · logo placement · ceiling structure · floor material ·
hallway direction.

**Prevent:** moving walls · shifting doors · disappearing windows · changing bay dimensions ·
altered simulator placement · warped architecture · melted furniture · incorrect room scale ·
changing logos · changing lighting fixtures · **inventing extra screens, projectors, monitors, or
duplicate impact surfaces not present in the reference**.

**When a location reference image is attached, describe its geometry literally in every prompt —
do not summarize it as a generic bay.** State the exact screen count and shape, the exact turf
boundary, and what borders the turf. For Back Nine's Bay 1, use this locked geometry:

> Bay 1 is a single rectangular hitting bay. Green artificial turf covers the entire floor,
> running continuously from the golfer's hitting position all the way to the base of the back
> wall, meeting the screen wall directly. One flat rectangular impact screen is mounted flush and
> vertical against the centre of the back wall, flanked on both sides by plain charcoal-grey wall
> sections — that flat screen is the only screen in the hitting area, and it sits downrange, the
> target the ball is hit into. The separate lounge zone stays out of hitting-area shots by simply
> not being mentioned.

Full rules, the downrange-axis requirement, and the golfer-orientation requirement:
`references/reference-image-fidelity.md`.

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
