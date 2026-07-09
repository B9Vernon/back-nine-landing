# Generation Review Checklist (run after every Higgsfield generation)

Run this immediately after each clip is generated — before moving to the next clip or telling
the user it's ready. Full authorization rules: `references/higgsfield-generation-authority.md`.

## Reject the result if any of these are present

- [ ] Distortion: facial warping, identity drift, extra/missing/fused limbs or fingers, broken
      joints, warped architecture, melted materials.
- [ ] Continuity failure: character identity/wardrobe/footwear/accessories changed; location
      geometry, screen placement, or logo changed; prop/club shape, scale, colour, or branding
      changed from the reference.
- [ ] Incorrect branding: wrong colours, proportions, or typography vs
      `references/back-nine-brand.md`; logo distorted or misplaced.
- [ ] Broken golf club(s): bent/twisted/melted/reversed clubhead, wrong-way clubface, wrong hand,
      impossible grip.
- [ ] More than one golf ball anywhere in the result — including reflections, screens,
      HUD/tracking graphics, motion trails, or the background. Full protocol:
      `references/single-golf-ball-protocol.md`.

## If rejected

1. Identify which lock or section failed.
2. Tighten that section's wording — strengthen or add the specific lock; don't bloat the prompt
   with unrelated sections.
3. Regenerate only the failed clip.
4. Re-run this checklist on the new result.

## If passed

Confirm the result matches the stated model, duration, aspect ratio, and assets before
proceeding to the next clip or generation.
