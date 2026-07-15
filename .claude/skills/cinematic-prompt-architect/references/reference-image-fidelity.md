# Reference-Image Fidelity (MANDATORY whenever image references are attached)

When a prompt will be generated with attached reference images (character sheets, location
sheets, prop/club sheets), those images are the **definitive, literal ground truth** — not
inspiration, not a style guide. This rule overrides generic scene-building instinct. Two failure
modes are unacceptable and must be actively prevented in every prompt: **identity substitution**
(a different-looking person appears) and **facility invention** (the location gains features that
aren't in the reference, or loses features that are).

## 1. Identity lock (character references)

When a character asset (e.g. `JennaAsset1`, `NeilAsset6`, `N&JAsset1`) is attached:

- The generated person's face, hairstyle and hair colour, body proportions, height, build, skin
  tone, and any distinguishing features (tattoos, etc.) must **exactly match** that reference
  image in every frame.
- Never substitute a generic, AI-invented, or different-looking person — even partially (a
  different nose, a different build, a different hair colour is still a failure).
- If two characters are attached in one scene, keep each one visually distinct and each one
  locked to their own reference — never blend or swap identities between them.
- State the identity lock explicitly in the prompt text (see the lock wording below). Do not rely
  on the reference image alone to "carry" identity — Seedance follows what the words say it should
  preserve.

**This is a hard reject condition.** A generation where the face doesn't match the attached
reference is not a minor imperfection — treat it exactly like a duplicated golf ball: reject,
diagnose, strengthen the identity-lock wording, and regenerate.

## 2. Facility geometry lock (location references)

When a location asset (e.g. `Bay1Asset1`) is attached, describe its geometry **literally and
completely** in every prompt that uses it — do not summarize it as "a golf simulator bay" and let
the model fill in gaps. Gaps get filled with invented walls, extra screens, curved screens, and
wrong floor materials. State, explicitly, in every prompt:

- Exactly how many screens exist in the hitting area (for Back Nine bays: **one**), and that it is
  **flat**, not curved, angled, or free-standing.
- Exactly what the turf boundary is — where it starts and ends, and what surface (if any) borders
  it.
- The wall composition immediately around the screen.
- That nothing outside the reference photos may be added: no second screen, no projector beam, no
  extra monitor, no rearranged furniture, no new doors or windows.

### Back Nine Bay 1 — locked geometry (from `Bay1Asset1`)

Use this exact description (or a compact restatement of it) in every Bay 1 prompt:

> Bay 1 is a single rectangular hitting bay. Green artificial turf covers the entire floor from
> the golfer's hitting position all the way to the base of the back wall — there is no wood floor,
> gap, or border strip between the turf and the screen. One flat rectangular impact screen is
> mounted flush and vertical against the centre of the back wall, flanked by two plain charcoal-
> grey wall sections — the screen is flat, never curved, angled, or free-standing, and it is the
> only large screen in the hitting area. Do not add extra screens, monitors, projector beams, or
> duplicate impact surfaces anywhere in the hitting area. The separate lounge zone (caramel leather
> sofa and armchair, black massage chairs, high-top table with orange stools, a small wall-mounted
> TV) is away from the hitting turf and must not be merged into a hitting-area shot unless the
> concept explicitly moves the camera there.

## 3. Golfer placement and orientation (mandatory for every hitting/address/swing shot)

- The golfer's feet must be planted **on the green turf, inside the hitting area** — never on the
  wood floor, never in the lounge, never outside the bay's turf boundary.
- In every address, swing, or ball-focused shot, the golfer's body, hips, and target line must be
  **square and oriented toward the flat impact screen** — the screen is always directly ahead of
  the golfer's intended ball flight, never behind them, beside them, or perpendicular to their
  swing plane.
- State this explicitly rather than assuming the model infers it: name the turf position and name
  the facing direction ("facing the impact screen," "target line pointing at the screen").

## Lock text to paste into every prompt using image references

> REFERENCE FIDELITY LOCK: [CHARACTER NAME(S)] must exactly match the attached character reference
> image(s) — identical face, hair, build, skin tone, and distinguishing features; never a
> different-looking or generic person. The location must exactly match the attached facility
> reference — one flat impact screen flush on the back wall between two charcoal side walls, turf
> covering the floor edge-to-edge to the screen wall, no invented screens, projectors, walls, or
> furniture. The golfer stands on the turf, inside the hitting area, facing the impact screen with
> their target line pointing directly at it.

## Mandatory verification

Before returning any prompt that uses attached image references, run
`checklists/reference-fidelity-verification.md`.
