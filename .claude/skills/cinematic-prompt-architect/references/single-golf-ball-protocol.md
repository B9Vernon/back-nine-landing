# Single-Golf-Ball Protocol (ABSOLUTE)

**THERE MUST NEVER BE MORE THAN ONE GOLF BALL** in any video, clip, frame, environment,
reflection, transition, simulator visualization, generated image, screen graphic, logo, or
background decoration. This is an absolute continuity rule that overrides every other
consideration.

Every golf scene contains either:
- **exactly one visible golf ball**, or
- **no visible golf ball** (the ball is intentionally outside the frame).

Never show two or more golf balls.

## Never create

- a second ball on the turf
- extra balls inside a basket
- spare balls beside the golfer
- duplicated balls during motion
- multiple balls caused by motion trails
- ghosted or repeated balls across the frame
- multiple balls during impact
- one ball at address and another in flight
- an extra ball appearing after contact
- balls in reflections, glass, or on screens
- balls in logos or background decoration
- a new ball entering before the original ball has clearly left the scene
- a duplicated ball during a transition between clips
- a ball changing into multiple objects
- a cluster or pile of golf balls
- ball-tracking graphics that resemble additional physical balls

## When the single ball moves

Seedance must preserve it as **one continuous physical object**, maintaining identical
size, colour, markings, material, surface texture, and physical identity, with realistic
speed, spin, trajectory, contact, rebound, and motion blur.

- Motion blur must never create the appearance of a second ball.
- If a trailing effect is used, it must be an **abstract light or airflow effect** that
  cannot be mistaken for another golf ball.
- If the ball leaves the frame, do not generate another visible ball until the story clearly
  establishes the original was retrieved, repositioned, or returned.

## Across connected clips

- Track the **same single ball** through the whole sequence.
- The ball's final position in one clip must match its opening position in the next clip
  whenever it remains part of the action.
- Transitions must never spawn a duplicate ball. Avoid any transition that risks it
  (see `references/clip-structure-and-timing.md` → Transitions).

## At impact (swing scenes)

- The single ball must **leave its original position** and continue as the same object.
- Never show one ball remaining on the turf after another launches.
- Never show the ball both at the address position and in flight in the same moment.

## The ball must never

duplicate · split · multiply · teleport · change size · change colour · change markings ·
vanish and reappear without explanation · remain at address after being struck · appear in
multiple locations during motion · transform into another object · leave behind another
physical ball · create a trail made of repeated golf balls.

## Reflections, screens, and audio

- Do not let reflections (glass, metal, screens, the ball's own gloss) create a ball-shaped
  duplicate. Reflections may show light and abstract shapes, never a second discrete ball.
- Simulator ball-tracking graphics, if shown, must read as an abstract line/arc/dot HUD, never
  as a physical ball. Keep them clearly graphical (thin trace line, target rings), not spherical.
- Do not create multiple ball-impact sounds unless the story clearly contains several separate
  shots shown at different times **using the same single ball**.

## Mandatory verification

Before returning ANY golf-related prompt, run `checklists/single-ball-verification.md` and
confirm: **THERE IS ONLY ONE GOLF BALL.** If any risk remains, simplify the action, split the
clip, or move the ball out of frame — never ship a prompt that could render two.

## Lock text to paste into prompts

Put a **SINGLE-GOLF-BALL LOCK** section in every golf prompt. Recommended wording:

> SINGLE-GOLF-BALL LOCK: There is exactly one golf ball in this entire shot. It is the same
> continuous physical object from first to last frame — identical size, colour, dimple pattern,
> and markings throughout. Never render a second golf ball anywhere: not on the turf, in a
> basket, beside the golfer, in flight, in reflections, in glass, on the simulator screen, in
> any HUD/tracking graphic, in the logo, or in the background. Motion blur, spin, and any
> trailing effect must read as one ball plus abstract light/air — never as two balls. If the
> ball exits frame, no other ball appears. Only one golf ball. Never more than one.
