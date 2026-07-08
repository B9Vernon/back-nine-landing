# Clip Structure & Timing — Editorial Decision Logic

You are the director **and** the editor. **Decide the clip structure automatically. Never ask
the user how many clips to use.** Prioritize reliable generation and strong pacing over
cramming action into one clip.

## Hard rules

- **Max 10 seconds per clip.** Never place multiple clips inside one generation prompt.
- Every clip is a fully independent open prompt (see SKILL.md → "Every clip is an independent
  open prompt").
- Videos longer than 10s split into sequential ≤10s clips: 0–10, 10–20, 20–30, 30–40 …

## A 10-second video is usually NOT one 10s prompt

For social ads, reels, shorts, and promos, prefer splitting the 10s into 2–3 shorter prompts.
Vary the structure — do not reuse one formula. Common patterns:

- **Three-prompt:** 0–3 / 3–6 / 6–10
- **Two-prompt:** 0–5 / 5–10
- **Alt three-prompt:** 0–4 / 4–7 / 7–10

## Choose SHORTER clips when the concept needs

strong opening hook · rapid visual progression · multiple camera angles · different emotional
beats · several actions · complex ball movement · a golfer entering/preparing/swinging/reacting ·
a location or simulator reveal · a hero shot · a branded ending · a final CTA · higher generation
stability · faster social pacing.

## Choose ONE continuous 10s prompt only when the concept benefits from

one continuous action · one controlled camera move · minimal prop interaction · simple ball
movement · no major scene change · no complex transition · slow premium pacing · a true one-take.

## Default social rhythm (flexible — don't make every video identical)

**Hook → Experience → Hero moment → Brand/CTA.** Example:
- Prompt 1 (0–3s) HOOK: a visually immediate opening that stops the scroll.
- Prompt 2 (3–6s) EXPERIENCE: golfer interacts with bay, club, single ball, simulator, screen.
- Prompt 3 (6–10s) HERO + BRAND: the strongest action, payoff, simulator reveal, ball movement,
  final pose, branding, or CTA.

## What the structure must decide automatically

number of prompts · duration of each clip · where each clip begins and ends · where cuts occur ·
which actions stay together vs. separate · placement of hook / experience / hero / brand / CTA ·
how the single ball moves through the sequence · how to preserve continuity · how to keep each
generation stable.

## Continuity between clips

For each clip define an **ENDING CONTINUITY FRAME** (exact final pose, hand, club, body
direction, camera angle, framing, lighting, prop position, ball position, ball speed/stopped,
screen condition, expression) and a **NEXT-CLIP OPENING FRAME** (the matching/complementary
start). If the ball is present, its opening position must match the established continuity.

Preserve across connected clips: identical character identity, face, proportions, hair,
wardrobe, footwear, accessories, golf equipment, club type + orientation, the single ball +
its markings + size, location geometry (walls/doors/windows/turf/screen/furniture), lighting
direction, time of day, branding, eyelines, left-to-right movement, screen direction, and
emotional progression.

## Transitions (use only when they improve the result)

Available: matched action · matched framing · eyeline match · movement continuation · hard cut ·
whip pan · foreground-object wipe · doorway transition · club passing near the lens · impact-screen
flash · screen-glow transition · single-golf-ball transition · silhouette transition · light-flare
transition.

**Do not use any transition that risks:** identity drift · wardrobe changes · club changes ·
**duplicate golf balls** · reversed movement · altered room layout · inconsistent lighting ·
disappearing props · duplicated characters · mutated logos · distorted hands/clubs/ball motion.

## One-take mode

When a clip is one continuous shot: prohibit edits, hidden cuts, montage, transitions, and time
jumps. Create one physically coherent camera path; preserve room geography; synchronize subject
and camera movement; track the single ball consistently; prevent teleportation and camera passing
through walls/objects; finish while the shot still feels alive. If the action is too complex,
simplify it or split into more clips.
