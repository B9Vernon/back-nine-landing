# Prompt Structure — 35-Section Framework

Use these sections whenever they improve the generation. **Include only sections that help;
omit empty filler.** Every technical instruction must influence framing, movement, lighting,
materials, physics, sound, performance, continuity, asset consistency, or distortion prevention.
Start from `templates/clip-prompt-template.md`.

## Priority sections — use the minimum, not all 35

Do not fill every section by default. Use only the sections needed to control this specific clip
reliably. At minimum, prioritize:

- **FIRST FRAME / BLOCKING** — the opening frame.
- **SUBJECT ACTION**, **CAMERA ACTION**, **GOLF-BALL ACTION** — the chronological action.
- **CAMERA**
- **ACTIVE REFERENCES**
- **PHYSICS**
- **LIGHTING**
- **POSITIVE LOCKS** — continuity.
- **SINGLE-GOLF-BALL LOCK**
- **VISIBLE IMPACT LOCK** — hitting scenes only (`references/club-ball-impact.md`).
- **DISTORTION-PREVENTION LOCKS**
- **ENDING CONTINUITY FRAME** / **FINAL VISUAL BEAT** — the final frame.

Add any other section only when it materially improves control of this clip. Never paste an
entire reference document (e.g. all of `references/back-nine-brand.md`) into a generation
prompt — restate only the specific lock or rule needed, in compact wording. Keep Seedance
prompts detailed but not overloaded. This priority set is the token-efficient default
(`references/token-efficient-production-mode.md`); use every section only in Mode N.

1. **SCENE TITLE** — short, descriptive.
2. **CREATIVE INTENT** — the goal, hook, and payoff in one or two lines.
3. **TOTAL VIDEO STRUCTURE** — number of clips + how this clip fits.
4. **CLIP TIMING** — this clip's start–end (e.g. 3–6s), aspect ratio, playback speed.
5. **SCENE CONTEXT** — where we are in the story; what just happened / happens next.
6. **ACTIVE REFERENCES** — every named character/location/prop/logo/ball asset used (exact names).
7. **LOCATION MAP** — room geometry: walls, doors, windows, screen, bay dividers, turf bounds,
   furniture, logo placement, foreground/midground/background landmarks, camera-safe paths.
8. **SINGLE-GOLF-BALL STATUS** — present or intentionally out of frame; if present, where it is.
9. **FIRST FRAME / BLOCKING** — exact opening frame: subject position/pose, prop positions,
   single-ball position, camera position, where the subject looks, background/mid/foreground.
10. **FORMAT MODE** — one-take vs. cut; aspect ratio; social/cinematic pacing.
11. **OPTICS** — lens character (focal length feel), depth of field, focus behaviour.
12. **CAMERA** — start position, height, angle, subject distance, direction, stabilization style.
13. **SUBJECT ACTION** — what the person does, in chronological order (separate from camera).
14. **CAMERA ACTION** — exactly how the camera moves; start point → end point; one primary move
    + at most one supporting reframe. State whether the shot contains any cut.
15. **GOLF-BALL ACTION** — the single ball's motion: start, direction, speed, spin, height,
    trajectory, contact, bounce/roll, final location, and when it exits frame (kept separate
    from golfer action). For hitting scenes, the contact moment must be visible and physically
    correct (`references/club-ball-impact.md`).
16. **PERFORMANCE** — subtle believable behaviour (breathing, grip pressure, micro-expressions,
    weight transfer, controlled reactions). Avoid exaggeration unless requested.
17. **PRODUCTION DESIGN** — set dressing, materials, branding integration, colour discipline.
18. **PROP INTERACTION** — how hands contact clubs, bag, tee, touchscreen; contact points, weight.
19. **GOLF-SWING MECHANICS** — stance, handedness, ball position, grip, shaft/clubface, and the
    swing phases present in this clip (don't overload; split phases across clips if needed).
20. **PHYSICS** — foot/hand contact, weight, inertia, turf compression, shadows, reflections,
    object scale — nothing floats or clips through anything.
21. **LIGHTING** — motivated sources, key direction, fill, edge/backlight, shadow side, contrast,
    colour temperature, screen glow, reflections on club and the single ball.
22. **COLOR GRADE** — premium commercial grade per `references/back-nine-brand.md`.
23. **AUDIO** — separate dialogue / ambience / Foley / mechanical / music; state music permission.
24. **DIALOGUE** — brief, natural, written exactly as spoken; note if speaker stays offscreen.
25. **STYLE** — 4K photoreal, film grain, motion blur, premium commercial; no game-engine/CGI look.
26. **SEEDANCE / HIGGSFIELD EXECUTION NOTES** — generation guidance per `references/seedance-higgsfield.md`.
27. **OUTPUT SETTINGS** — aspect ratio, duration, playback speed, audio permission, resolution intent.
28. **POSITIVE LOCKS** — what MUST stay identical (identity, wardrobe, props, club, location, logos).
29. **SINGLE-GOLF-BALL LOCK** — the lock text from `references/single-golf-ball-protocol.md`. **Always include in golf prompts.**
29a. **VISIBLE IMPACT LOCK** — the lock text from `references/club-ball-impact.md`. **Always
    include whenever a club strikes the ball.**
30. **REFERENCE FIDELITY LOCK** — from `references/reference-image-fidelity.md`, whenever image
    references are attached.
31. **AVOID line** — ONE line, ~25 words max, generic failure categories only
    (`references/distortion-prevention.md`, `references/generation-reliability.md`).
32. **ENDING CONTINUITY FRAME** — exact final pose/hand/club/body direction/camera/framing/
    lighting/prop/ball position/ball speed-or-stopped/screen/expression.
33. **NEXT-CLIP OPENING FRAME** — the matching/complementary start frame for the next clip;
    if the ball is present, its opening position matches the established continuity.
34. **FINAL VISUAL BEAT** — the last strong image the clip lands on.
35. **OPTIONAL END-FRAME TEXT** — on-frame branding/CTA text only if the concept calls for it.

## Prompt-engineering rules (apply to every finished prompt)

- Define the opening frame and the final frame explicitly.
- Define subject, camera, prop, and single-ball positions; background, midground, foreground.
- Define where the subject looks and moves; separate subject action from camera action from
  ball action.
- Define exactly how the camera moves and whether the shot contains cuts.
- Define lens character, framing progression, and focus behaviour.
- Define motivated lighting sources; preserve room geography and left–right screen direction.
- Protect identity, wardrobe, props, clubs, the single ball, logos, location, and screen placement.
- Define realistic contact, weight, ball impact and trajectory; prevent floating, clipping,
  warping, duplication (especially of golf balls), broken anatomy, changed club geometry.
- Define aspect ratio, clip duration, playback speed, audio permission, dialogue rules, and the
  final visual frame + final ball position.
- Remove contradictions. Keep everything achievable within Seedance.
