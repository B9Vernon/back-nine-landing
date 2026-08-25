# Pre-Output Quality Control (run before EVERY output)

Verify internally before returning any prompt. For golf content, also run
`checklists/single-ball-verification.md`.

## Structure & pacing
- [ ] Optimized for Seedance through Higgsfield (or the named platform)?
- [ ] Clip duration appropriate (≤10s)? Should the concept be split into more clips?
- [ ] Only the sections needed to control this clip are included — no full reference document
      pasted verbatim; locks stated in compact wording (`references/prompt-structure.md` →
      Priority sections)?
- [ ] Multiple clips are each in their own independent prompt (never combined)?
- [ ] Opening frame and final frame each clearly defined?
- [ ] Opening strong enough for social media? Hero moment clear? Brand/CTA placed correctly?
- [ ] Each clip's final frame connects to the next clip's opening frame?
- [ ] Each prompt works independently (all references/positions/locks restated)?

## Camera, space & motion
- [ ] Camera movement physically possible (unless surreal explicitly requested)?
- [ ] Room geography stable; left–right screen direction preserved?
- [ ] Subject action, camera action, and golf-ball action separated?
- [ ] One primary camera move + at most one supporting reframe?

## Lighting & look
- [ ] All lighting sources motivated? No unexplained glow / neon overload?
- [ ] Premium Back Nine color grade applied? Skin/turf/club reflections realistic?

## References & continuity
- [ ] Character identity, wardrobe, footwear, accessories locked?
- [ ] Back Nine location geometry, screen placement, and logos locked?
- [ ] Golf clubs geometrically correct; clubface orientation correct?
- [ ] Hands and fingers protected; object scale and weight believable; contact shadows present?
- [ ] Existing assets reused? New assets actually necessary and flagged?

## Reference-image fidelity (whenever image references are attached)
- [ ] `checklists/reference-fidelity-verification.md` fully passed — identity locked to the exact
      attached character reference (never generic); facility geometry stated literally (exact
      screen count/shape, exact turf boundary, no invented elements); golfer's feet on the turf
      and body oriented toward the impact screen for hitting/address/swing shots.

## Physics & realism
- [ ] Realistic contact, weight, inertia; nothing floats or clips through anything?
- [ ] Ball impact and trajectory physically believable?

## Audio & dialogue
- [ ] Audio rules clear (dialogue/ambience/Foley/music permission)?
- [ ] Dialogue brief, natural, written exactly as spoken; offscreen speakers noted?

## Generation reliability (every prompt)
- [ ] Correct state described positively — desired world stated, not failures enumerated
      (`references/generation-reliability.md`)?
- [ ] Exactly ONE `AVOID:` line, ~25 words max, generic failure categories only, hero objects
      (ball/club/screen) named at most once — no stacked negative-lock paragraphs?
- [ ] Prompt under ~250 words; scene/action/camera ≈70%, locks ≈30%?
- [ ] One primary subject action, one camera move, max two people per clip?
- [ ] Club orientation stated positively (hands on grip, clubhead at ground end); only ONE
      swing-phase window in this clip (never address → top → impact → finish in one generation)?
- [ ] START FRAME named for the clip (facility photo for a first clip, previous clip's final
      frame otherwise) when the engine supports start frames?

## Distortion & contradictions
- [ ] Distortion risks addressed through positive description and simplification
      (`references/distortion-prevention.md`)?
- [ ] Contradictions removed?

## Single golf ball
- [ ] `checklists/single-ball-verification.md` fully passed — exactly one ball, never more.

## Visible club-to-ball impact (hitting scenes)
- [ ] `checklists/club-ball-impact-verification.md` fully passed for every hitting scene.

## Token-efficient production mode
- [ ] Unless Mode N (maximum detail) was requested: full plan + all clip prompts delivered in one
      response; header stated once, not per clip; established assets referenced by name, not
      re-described; locks compact, not full protocol text; no unrequested explanations, diagnosis,
      alternatives, or commentary (`references/token-efficient-production-mode.md`)?

## Generation authority
- [ ] No generation triggered unless the user explicitly asked to generate/render/run/create
      (`references/higgsfield-generation-authority.md`)?
- [ ] If generation was requested: model (default Seedance), duration, aspect ratio, and assets
      stated before triggering; one clip generated at a time unless a batch was requested; every
      result inspected with `checklists/generation-review.md` before continuing?

## Delivery
- [ ] Output header present (length, # prompts, timing, pacing, hook, hero, continuity, ball plan,
      assets used, new assets required)?
- [ ] Clean copy-and-paste; no commentary inside prompts; no vague language?
- [ ] Ready to paste directly into Seedance through Higgsfield?
