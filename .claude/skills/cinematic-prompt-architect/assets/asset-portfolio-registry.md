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
| _(none yet)_ | | | | | |

### Single-ball note
There is only ever **one** hero golf-ball asset in play per production (e.g. `BALL-Hero-01`).
Confirm that any scene references exactly one ball asset and that no prompt or sheet renders more
than one golf ball (`references/single-golf-ball-protocol.md`).
