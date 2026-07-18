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

Use this exact description (or a compact restatement of it) in every Bay 1 prompt — phrased
positively, per `references/generation-reliability.md`:

> Bay 1 is a single rectangular hitting bay. Green artificial turf covers the entire floor,
> running continuously from the golfer's hitting position all the way to the base of the back
> wall, meeting the screen wall directly. One flat rectangular impact screen is mounted flush
> and vertical against the centre of the back wall, flanked on both sides by plain charcoal-grey
> wall sections — that flat screen is the only screen in the hitting area. The bay's contents
> are exactly: turf, the flat screen, the two charcoal walls, and whatever the clip's action
> requires.

The separate lounge zone (caramel leather sofa and armchair, black massage chairs, high-top
table with orange stools, small wall-mounted TV) stays out of hitting-area shots unless the
concept explicitly moves the camera there — keep it out by simply not mentioning it, not by
listing it in a negation.

**Strongest lock of all: the start frame.** When the engine supports a start-frame image
(Cinema Studio 2.5 does), load the actual `Bay1Asset1` hitting-area photo (or the previous
clip's final frame) as the start frame — the model rarely contradicts its own first frame's
pixels. Full rules: `references/generation-reliability.md` → Start-frame discipline.

## 3. Golfer placement and orientation (mandatory for every hitting/address/swing shot)

- The golfer's feet must be planted **on the green turf, inside the hitting area** — never on the
  wood floor, never in the lounge, never outside the bay's turf boundary.
- In every address, swing, or ball-focused shot, the golfer's body, hips, and target line must be
  **square and oriented toward the flat impact screen** — the screen is always directly ahead of
  the golfer's intended ball flight, never behind them, beside them, or perpendicular to their
  swing plane.
- State this explicitly rather than assuming the model infers it: name the turf position and name
  the facing direction ("facing the impact screen," "target line pointing at the screen").

## 4. Reference-slot budgeting (engine reference-image limits)

Generation engines cap how many reference images can be attached per generation — e.g. Higgsfield
**Cinema Studio 2.5 allows a maximum of 3 reference images per generation**. When a scene needs
more assets than the cap allows, never silently drop one — choose and state a priority order:

1. **Character identity references first** — one per distinct person, or a single group/couple
   reference (e.g. `N&JAsset1`) if it already covers multiple people together.
2. **Location/facility geometry reference second** — the asset that locks screen count, turf
   boundary, and wall composition (e.g. `Bay1Asset1`).
3. **Prop/club/bag/branding references only if slots remain.** Well-known real-world objects
   (a driver, a stand bag) can usually be locked reliably through literal text description alone
   (exact make, material, colour, geometry) — they don't need an image slot the way faces and
   facility geometry do.

For a couple/group scene, prefer one reference that already contains everyone together plus one
additional close reference for whichever character carries the most detail work (hero hitter's
glove hand, face angle) — this typically resolves 2+ people into 2 slots instead of one each.

State the chosen references on the "Attach" line above each clip so the user knows exactly what to
load and why anything else was left to text. If the user names a different engine, apply its real
reference cap instead of assuming Seedance/Cinema Studio behaviour carries over — ask or infer the
actual limit rather than guessing.

## Lock text to paste into every prompt using image references

> REFERENCE FIDELITY LOCK: [CHARACTER NAME(S)] exactly match the attached character reference
> image(s) — identical face, hair, build, skin tone, and distinguishing features throughout. The
> location exactly matches the attached facility reference and the start frame: one flat impact
> screen flush on the back wall between two charcoal side walls, green turf running continuously
> to the base of the screen wall. The golfer stands on the turf, inside the hitting area, facing
> the impact screen with their target line pointing directly at it.

## Mandatory verification

Before returning any prompt that uses attached image references, run
`checklists/reference-fidelity-verification.md`.
