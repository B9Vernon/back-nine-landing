# Clip Prompt Template

Copy this scaffold per clip. **Use the minimum sections needed to control the clip reliably** —
priority: opening frame (FIRST FRAME/BLOCKING), chronological action (SUBJECT/CAMERA/GOLF-BALL
ACTION), CAMERA, ACTIVE REFERENCES, PHYSICS, LIGHTING, POSITIVE LOCKS, SINGLE-GOLF-BALL LOCK,
VISIBLE IMPACT LOCK (hitting scenes), REFERENCE FIDELITY LOCK (whenever image references are
attached), DISTORTION-PREVENTION LOCKS, and the final frame (ENDING CONTINUITY FRAME/FINAL VISUAL
BEAT). Delete every other section unless it materially helps. Full guidance:
`references/prompt-structure.md`. Every clip is independent — restate all essential references,
positions, and locks **in compact wording** (never by pasting a full reference document —
Seedance does not remember prior clips). This is the default, token-efficient scaffold; expand it
only in Mode N — maximum detail (`references/token-efficient-production-mode.md`).

**When image references are attached, ACTIVE REFERENCES and LOCATION MAP must be literal, not
generic** — name each character's exact face/hair/build instead of "a golfer," and state the
location's exact screen count/shape and turf boundary instead of "a golf simulator bay." See
`references/reference-image-fidelity.md`.

---

CLIP [N] — [START]–[END] SECONDS · [ROLE: HOOK / EXPERIENCE / HERO+BRAND / …]

SCENE TITLE:
CREATIVE INTENT:
TOTAL VIDEO STRUCTURE: [this is clip N of M; total length …]
CLIP TIMING: [start–end] · aspect ratio [9:16 / 16:9] · playback speed [normal / slow-mo]

SCENE CONTEXT:
ACTIVE REFERENCES: [exact names — character(s) with face/hair/build restated, location, props,
club(s), single ball, logo]
LOCATION MAP: [literal geometry — exact screen count and shape (flat/curved), exact turf
boundary, walls, doors, windows, bay dividers, furniture, logo placement; foreground / midground /
background landmarks; camera-safe path]
SINGLE-GOLF-BALL STATUS: [present at (position) / intentionally out of frame]
GOLFER PLACEMENT: [feet on turf, inside hitting area; body/target line oriented at the impact
screen — hitting/address/swing shots only]

FIRST FRAME / BLOCKING: [exact opening frame — subject pose & position, prop positions, single-ball
position, camera position, subject eyeline, fg/mg/bg]

FORMAT MODE: [one continuous take / contains no cut]
OPTICS: [lens feel, depth of field, focus behaviour]
CAMERA: [start position, height, angle, subject distance, direction, stabilization]
SUBJECT ACTION: [chronological — person only]
CAMERA ACTION: [chronological — one primary move + optional supporting reframe; start → end]
GOLF-BALL ACTION: [the single ball only — start, direction, speed, spin, height, trajectory,
contact, bounce/roll, final position, when it exits frame]
PERFORMANCE: [breathing, grip pressure, micro-expressions, weight transfer, reaction]
PRODUCTION DESIGN: [set dressing, materials, branding integration, colour discipline]
PROP INTERACTION: [hand contact points, weight, how props are handled]
GOLF-SWING MECHANICS: [only the phases in this clip — stance, handedness, ball position, grip,
shaft/clubface, phase(s)]
PHYSICS: [contact, weight, inertia, turf compression, shadows, reflections, scale]
LIGHTING: [motivated sources, key direction, fill, edge/back, shadow side, contrast, colour
temperature, screen glow, reflections on club and the single ball]
COLOR GRADE: [per back-nine-brand.md — navy/charcoal dominant, controlled green accent]
AUDIO: [dialogue / ambience / Foley / mechanical / music permission]
DIALOGUE: [exact words, brief; note if speaker offscreen]
STYLE: [4K photoreal, film grain, natural motion blur, premium commercial; no game-engine/CGI look]
SEEDANCE / HIGGSFIELD EXECUTION NOTES: [chronological, simple strong action, stable ball motion]
OUTPUT SETTINGS: [aspect ratio · duration · playback speed · audio permission · 4K]

POSITIVE LOCKS: [identity, wardrobe, footwear, accessories, glove hand, club type + orientation,
location geometry, screen placement, branding — all identical]
SINGLE-GOLF-BALL LOCK: [compact — paste/restate from references/single-golf-ball-protocol.md]
VISIBLE IMPACT LOCK: [hitting scenes only — compact — from references/club-ball-impact.md]
REFERENCE FIDELITY LOCK: [whenever image references are attached — compact — from
references/reference-image-fidelity.md]
DISTORTION-PREVENTION LOCKS: [from references/distortion-prevention.md]
NEGATIVE LOCKS: [never render — includes any second/extra/ghost golf ball anywhere]

ENDING CONTINUITY FRAME: [exact final pose, hand, club, body direction, camera angle, framing,
lighting, prop position, ball position, ball speed/stopped, screen condition, expression]
NEXT-CLIP OPENING FRAME: [matching/complementary start for clip N+1; ball opening position matches]
FINAL VISUAL BEAT: [the last strong image]
OPTIONAL END-FRAME TEXT: [branding/CTA text, only if the concept calls for it]

---
