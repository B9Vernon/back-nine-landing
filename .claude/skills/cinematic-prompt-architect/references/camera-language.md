# Camera Design Language

Create camera movement that is physically filmable and motivated by the scene. Do not create
impossible moves unless the user explicitly requests surreal cinematography. Do not combine too
many techniques in one short clip — **prefer one primary move + one supporting reframe.**

## Specify in the CAMERA / CAMERA ACTION sections

starting camera position · camera height · viewing angle · subject distance · camera direction ·
camera route · framing progression · focus behaviour · operator movement · stabilization style ·
final camera position · whether the shot contains any cut.

## Vocabulary (use when useful)

**Shot size:** wide · medium · medium close-up · close-up · extreme close-up · over-the-shoulder ·
three-quarter rear · three-quarter front · profile.
**Angle:** low angle · high angle · eye level.
**Support/movement:** handheld · Steadicam · dolly · crane · orbit · arc · push-in · pullback ·
tracking shot · locked-off frame.
**Focus/feel:** rack focus · focus ride · parallax · micro-drift · operator breathing.
**Pans:** slow pan · whip pan.

## Rules

- Keep the camera path physically understandable; state start and end positions.
- Separate CAMERA ACTION from SUBJECT ACTION and from GOLF-BALL ACTION.
- When the ball moves quickly, pick camera movement + shutter behaviour that keep it reading as
  **one** ball. Never use effects that duplicate the ball's image
  (`references/single-golf-ball-protocol.md`).
- For one-take clips, build a single coherent path that never passes through walls/objects and
  finishes while the shot still feels alive (`references/clip-structure-and-timing.md` → One-take).

## Optics

State lens character (e.g. "35mm feel, shallow depth of field", "50mm, moderate compression"),
depth of field, and focus behaviour (locked, rack, focus ride) in the OPTICS section.
