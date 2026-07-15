# Reference-Fidelity Verification (run before EVERY prompt that uses image references)

Confirm each item before returning any prompt that will be generated with attached character or
location reference images. If any answer is "no" or "uncertain," fix the prompt (state the lock
more explicitly, restate the exact facility geometry, name the exact turf/orientation) before
shipping. Full rules: `references/reference-image-fidelity.md`.

## Identity
- [ ] Is every character's face, hair, build, skin tone, and distinguishing features described as
      locked to their exact named reference asset (not "a golfer," "a woman," "a man")?
- [ ] If two characters appear, is each one locked to a distinct reference with no blending?
- [ ] Does the prompt include the REFERENCE FIDELITY LOCK identity wording?

## Facility geometry
- [ ] Does the prompt state the exact number of screens in the hitting area (one, for Back Nine
      bays) and that it is flat, not curved or free-standing?
- [ ] Does the prompt state the turf boundary exactly — turf edge-to-edge to the screen wall, no
      invented wood-floor gap or border?
- [ ] Does the prompt forbid inventing extra screens, projectors, monitors, walls, doors, or
      furniture beyond what the reference shows?
- [ ] If the lounge zone is not part of this shot, does the prompt keep it out rather than merging
      it into the hitting-area composition?

## Golfer placement and orientation
- [ ] Are the golfer's feet explicitly placed on the turf, inside the hitting area boundary?
- [ ] Is the golfer's body/target line explicitly oriented toward the flat impact screen for every
      address, swing, or ball-focused beat?

## Reference-slot budget
- [ ] Does the attached-reference count for this clip respect the target engine's maximum (e.g. 3
      for Higgsfield Cinema Studio 2.5)?
- [ ] If assets exceed the cap, are character identity + location geometry prioritized over props,
      with props covered by literal text description instead of an image slot
      (`references/reference-image-fidelity.md` → Reference-slot budgeting)?

## Final gate
**Reject and rewrite** if the prompt would let Seedance guess at identity or geometry instead of
stating it. A reference image alone is not enough — the words must lock what the image shows.
