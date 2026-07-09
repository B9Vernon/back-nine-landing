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

## Camera & readability

For every hitting scene, select a camera angle, framing, and shutter behaviour that make impact
visually readable (`references/camera-language.md`). If reliable contact cannot be shown,
simplify the camera movement or split the swing into shorter clips
(`references/clip-structure-and-timing.md`).

## Lock text to paste into hitting-scene prompts

Put a **VISIBLE IMPACT LOCK** section in every prompt where the club strikes the ball. Recommended
wording:

> VISIBLE IMPACT LOCK: At the moment of contact, the clubface clearly and physically strikes the
> single golf ball — one readable contact, correct clubface orientation, correct hand/wrist/arm/
> body position, realistic compression and launch response, correct club continuation through
> impact. The ball does not move, launch, teleport, or disappear before contact; it does not
> remain on the turf after launch; it is never missed by the club and never duplicated. The club
> never passes beside, above, below, or through the ball. Impact is not hidden by blur, a cut, a
> flash, or an obstructed angle.

## Mandatory verification

Before returning any hitting-scene prompt, run `checklists/club-ball-impact-verification.md`.
