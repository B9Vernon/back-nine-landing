# Generation Reliability (MANDATORY — overrides older lock-stacking habits)

This file exists because heavily "locked" prompts were still producing extra balls, morphing
clubs, and turf that stopped short of the screen. The cause was not too few rules — it was how
the rules were written. Video generation engines (Seedance, Cinema Studio 2.5) do not process
negation the way people do: **every noun in the prompt makes that thing more likely to appear,
even inside a sentence that forbids it.** A prompt that says "never render a second golf ball"
five times has said "golf ball" ten times — and is more likely to render one than a prompt that
never mentions it. These rules override any older guidance that encouraged stacking negative
lock paragraphs.

## 1. Positive-first phrasing

- Describe the **correct state of the world**, not the failure to avoid.
  - ✗ "No extra balls, no ghost balls, no ball-shaped reflections, no ball remaining after launch."
  - ✓ "One white golf ball rests on the turf — the only ball in the scene. After the strike the
    turf where it sat is empty."
  - ✗ "There is no wood floor or gap between the turf and the screen."
  - ✓ "The green turf runs continuously from the golfer's feet all the way to the base of the
    impact screen, meeting the screen wall directly."
- Each named lock section (single-ball, impact, fidelity) is written as a compact positive
  description of the correct state, with **at most one short negative clause**.
- **All remaining negatives are consolidated into ONE `AVOID:` line at the end of the prompt,
  maximum ~25 words**, naming only the failures genuinely at risk in *this* clip. Never paste the
  old multi-paragraph NEGATIVE LOCKS block into a generation prompt.

## 2. Prompt weight budget

The engine spreads attention across the whole prompt — every extra lock sentence dilutes the
action instructions. Targets:

- Scene + action + camera + lighting ≈ **70%** of the prompt; all locks together ≈ **30%**.
- Total prompt under **~250 words**. If over, cut lock repetition — never action clarity.
- Repeating a rule does not strengthen it; it weakens everything else. Say each thing **once**,
  in its strongest form, in the right place.

## 3. Action simplicity budget (per ≤10s clip)

Overloaded clips are the top cause of morphing clubs and spawned objects. Per clip:

- **One primary subject action.** A hand-off OR a swing OR a reaction — never two of these.
- Maximum two people on screen; only one of them doing precise prop work at a time.
- One camera move. If the beat needs more, split the clip.

## 4. Club integrity

Clubs flip, morph, and vanish when the prompt leaves their geometry or the swing phase ambiguous.

- **State the club's orientation positively every time it appears:** "she holds the driver by its
  black grip; the clubhead sits at the ground end of the shaft, soled on the turf behind the
  ball." Orientation left implicit is orientation left to chance.
- **Never generate a full swing (address → top → impact → finish) in one clip.** The
  top-of-backswing transition is where clubheads swap ends and shafts bend. Pick ONE phase
  window per clip: address/waggle only · downswing → impact → follow-through · finish/reaction
  only. If the concept needs the full swing, split it across clips.
- Keep the club either fully in frame or cleanly out of it during motion — a club half-cropped
  at the frame edge is a club that disappears mid-swing.
- The club is one rigid continuous object; hands stay on the grip end throughout.

## 5. Start-frame discipline (the strongest geometry lock available)

When the engine supports a start-frame image (Higgsfield Cinema Studio 2.5 does), the start frame
— not the text — is the primary geometry lock. The model rarely contradicts its own first frame.

- **Every clip delivery must include a `START FRAME:` instruction** naming exactly which image to
  load: a real photo of the facility hitting area (e.g. the `Bay1Asset1` photo) for the first
  clip, and **the previous clip's actual final frame** for every subsequent clip.
- The start frame carries the turf boundary, screen count, and wall composition in pixels; the
  prompt text then only has to describe action and preserve what the frame shows.
- Text geometry description stays in the prompt as backup — compact and positive — but never as
  a substitute for the start frame.

## 6. When a generation still fails

Reject → diagnose which of the five levers above was violated → fix that lever → regenerate.
Do not respond to a failure by adding more negative sentences; that is the failure mode this
file exists to prevent.
