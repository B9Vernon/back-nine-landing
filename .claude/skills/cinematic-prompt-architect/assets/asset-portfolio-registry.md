# Asset Portfolio Registry & Naming System

The living index of reusable Back Nine cinematic assets. **Reuse before you create.** Before
writing any prompt: (1) identify required assets, (2) reuse existing ones, (3) decide whether any
new asset is truly required, (4) never duplicate an asset, (5) preserve approved names, (6) never
assume unapproved names, (7) flag missing assets that could cause continuity problems, (8) create
new-asset instructions only when necessary, (9) confirm only one golf-ball asset will appear.

## Naming system

Format: `CATEGORY-Descriptor-##` — clear, descriptive, category-prefixed, non-conflicting.

| Category | Prefix | Example |
|----------|--------|---------|
| Character | `CHAR-` | `CHAR-Golfer-Male-01` |
| Wardrobe | `WARD-` | `WARD-Performance-Polo-Navy-01` |
| Location | `LOC-` | `LOC-SimBay-Premium-01` |
| Prop (general) | `PROP-` | `PROP-Touchscreen-Wall-01` |
| Golf club | `CLUB-` | `CLUB-Driver-01` |
| Golf bag | `BAG-` | `BAG-Stand-Black-01` |
| Single golf ball | `BALL-` | `BALL-Hero-01` |
| Tee | `TEE-` | `TEE-White-01` |
| Simulator screen | `SCRN-` | `SCRN-FullSwing-01` |
| Branding / logo | `BRAND-` | `BRAND-BackNine-Primary-01` |
| Lighting reference | `LIGHT-` | `LIGHT-BayKey-01` |
| Camera-angle reference | `CAM-` | `CAM-Eyeline-01` |
| Continuity / clean plate | `PLATE-` | `PLATE-SimBay-Empty-01` |

### Naming procedure for a NEW recurring asset
1. Propose a clear descriptive reference name using the format above.
2. Explain its category.
3. Check this registry to avoid conflicts / duplicates.
4. Ask for approval **only** when the name will become a permanent library reference.
5. Once approved, use the exact name in all future prompts.
6. Never rename an approved asset without explicit instruction.

Until a name is approved, use a clear temporary description (e.g. "the male golfer in the navy
performance polo") — do **not** lock an unapproved name into prompts.

## Portfolio categories to maintain

character sheets · wardrobe sheets · expression sheets · pose sheets · golfer stance sheets ·
golfer swing-position sheets · location sheets · room-layout sheets · bay-layout sheets · prop
sheets · golf-club sheets · golf-bag sheets · single-golf-ball sheets · tee sheets · simulator-
screen sheets · branding sheets · lighting-reference sheets · camera-angle sheets · continuity
sheets · clean plates · environment reference frames.

## Registry (append approved assets here)

> Status values: `PROPOSED` (name suggested, awaiting approval) · `APPROVED` (permanent, reuse
> exact name) · `RETIRED` (do not reuse). Keep one row per asset.

| Ref name | Category | Status | Description | Master sheet | Notes |
|----------|----------|--------|-------------|--------------|-------|
| NeilAsset4 | Character | APPROVED | Neil — black polo w/ lime-green trim, dark grey patterned shorts, white belt, white shoes; black b9 cap OR no-cap (blond textured hair); blue eyes. Left-hand glove variant available. | user-supplied | Male lead. Cap + no-cap variants. |
| NeilAsset6 | Character | APPROVED | Neil — cream cross-stripe polo w/ black collar, dark grey patterned shorts, white belt, white shoes, white-and-lime b9 trucker cap. | user-supplied | Male lead. |
| NeilAsset8 | Character | APPROVED | Neil — navy golf-print polo w/ orange trim, orange shorts, white belt, white shoes; white b9 trucker cap OR no-cap. | user-supplied | Male lead. Cap + no-cap variants. |
| JennaAsset1 | Character | APPROVED | Jenna — teal sleeveless V-neck golf top, white skort, white glove (left hand), white shoes, blonde hair in low bun, left-arm tattoo sleeve. Face front/side detail. | user-supplied | Female lead. Glove present — swing-ready. |
| JennaAsset2 | Character | APPROVED | Jenna — teal sleeveless V-neck top, navy leggings, white/black Back Nine trucker cap, white shoes, blonde braid, arm tattoos. | user-supplied | Female lead. Athletic/practice look. |
| JennaAsset3 | Character | APPROVED | Jenna — navy sleeveless collared golf dress, white shoes, blonde braid, pendant necklace, arm tattoos. Face front/side detail. | user-supplied | Female lead. Elevated dress look. |
| N&JAsset1 | Character (couple) | APPROVED | Neil + Jenna two-shot. Neil: blue/white striped polo, grey shorts, white bGOLF cap. Jenna: teal sleeveless top, white eyelet skort, white glove, white shoes. | user-supplied | Couple reference for two-shots. |
| Bay1Asset1 | Location / bay | APPROVED | Back Nine Vernon Bay 1. **Hitting area (locked geometry):** green turf covers the entire floor edge-to-edge from the hitting position to the base of the back wall — no wood floor or gap between turf and screen; ONE flat rectangular impact screen mounted flush/vertical on the back wall, flanked by two plain charcoal-grey wall sections — never curved, angled, free-standing, or duplicated. **Separate lounge zone** (not the hitting area): light wood floor, caramel leather sofa+armchair, black massage chairs, high-top w/ orange stools, circular white b9 wall logo, wooden BAY 1 letters, glass windows, small wall-mounted TV. Full mandatory geometry lock: `references/reference-image-fidelity.md`. | user-supplied | Primary facility set. Never merge lounge zone into hitting-area shots unless requested. |
| DriverClubAsset1 | Golf club | APPROVED | TaylorMade Qi35 driver — carbon-fibre crown, dark metallic finish, straight silver shaft, black grip. | user-supplied | Hero club. |
| TaylorMadeBagAsset1 | Golf bag | APPROVED | TaylorMade Qi35 stand bag — black/silver/green, "TaylorMade" + "Qi35" branding, stand legs. | user-supplied | Hero bag / set dressing. |

### Single-ball note
There is only ever **one** hero golf-ball asset in play per production (e.g. `BALL-Hero-01`).
Confirm that any scene references exactly one ball asset and that no prompt or sheet renders more
than one golf ball (`references/single-golf-ball-protocol.md`).

### Reference-fidelity note
Every character asset above is a hard identity lock — when it's attached, the generated person's
face, hair, build, and skin tone must exactly match it; never a generic or different-looking
person. Every location asset above is a hard geometry lock — its screen count/shape, turf
boundary, and wall composition must be restated literally in the prompt, never left to the model
to invent. Full protocol: `references/reference-image-fidelity.md`. Mandatory verification:
`checklists/reference-fidelity-verification.md`.
