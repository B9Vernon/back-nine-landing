# Visible Club-to-Ball Impact (MANDATORY for every hitting scene)

Whenever a golf club hits the single golf ball, the clip must clearly show the clubface
physically contacting the ball at the exact impact moment. This applies alongside the
single-golf-ball rule (`references/single-golf-ball-protocol.md`) and golf-club continuity
(`references/continuity-locks.md` → Golf-club continuity) for every swing/hitting scene.

## The ball must never

- launch before contact
- move early
- teleport
- disappear before impact
- remain on the turf after launch
- duplicate
- be missed by the club
- be hidden by excessive blur, a cut, a flash, or an obstructed angle

## At impact, preserve

- correct clubface orientation
- correct hand, wrist, arm, and body position
- one clearly readable clubface-to-ball contact
- realistic compression or immediate launch response
- realistic speed, spin, and trajectory
- correct club continuation through impact (follow-through)
- exactly one golf ball before, during, and after contact

## The club must never

pass beside, above, below, or through the ball.

## Club geometry and swing-phase windows (mandatory)

Clubheads swap ends, shafts bend, and clubs vanish when orientation or swing phase is left
ambiguous (`references/generation-reliability.md` → Club integrity):

- **State the club's orientation positively in every prompt where it appears:** hands on the
  grip end, clubhead at the ground end of the shaft — e.g. "she holds the driver by its black
  grip; the clubhead sits at the bottom of the shaft, soled on the turf behind the ball."
- **Never generate a full swing (address → top → impact → finish) in one clip.** The
  top-of-backswing transition is where clubs morph. Choose ONE phase window per clip:
  address/waggle only · downswing → impact → follow-through · finish/reaction only. Split a
  full swing across clips.
- Keep the club fully in frame or cleanly out of it during motion — a club half-cropped at the
  frame edge tends to disappear mid-swing.

## Camera & readability

For every hitting scene, select a camera angle, framing, and shutter behaviour that make impact
visually readable (`references/camera-language.md`). If reliable contact cannot be shown,
simplify the camera movement or split the swing into shorter clips
(`references/clip-structure-and-timing.md`).

## Lock text to paste into hitting-scene prompts

Put a **VISIBLE IMPACT LOCK** section in every prompt where the club strikes the ball — written
**positively**, per `references/generation-reliability.md`. Recommended wording:

> VISIBLE IMPACT LOCK: The clubface meets the ball in one clearly readable contact — the ball
> stays at rest until that exact moment, then launches immediately off the face with realistic
> compression, leaving the turf empty where it sat. The club continues through impact into the
> follow-through as one rigid object — hands on the grip, clubhead at the ground end of the
> shaft, correct face orientation. Impact stays fully visible, unobscured by blur, cuts, or
> flashes.

## Mandatory verification

Before returning any hitting-scene prompt, run `checklists/club-ball-impact-verification.md`.
