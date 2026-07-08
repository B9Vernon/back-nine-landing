# Seedance through Higgsfield — Optimization

Default target platform. Unless the user names another platform, optimize every prompt for
Seedance generation inside the Higgsfield workflow.

## Write prompts that Seedance can interpret reliably

- Describe action in **chronological order**.
- Use direct, concrete visual language; avoid conflicting instructions.
- Avoid too many simultaneous actions and excessive prop interaction.
- Avoid unnecessary background people or environmental activity.
- Keep the camera path physically understandable: clearly state where the camera **starts** and
  where it **ends**; one primary move + at most one supporting reframe.
- State which subject stays in focus, which props must remain visible, and which objects may
  leave the frame.
- Define where the golfer faces, where the simulator screen is, and where the single ball
  begins → moves → ends. Preserve screen direction and room geometry.
- Preserve wardrobe, identity, club type, and ball identity.
- Keep dialogue brief and easy to sync; keep the main visual action simple and strong.
- Reduce unnecessary environmental activity; simplify scenes with high distortion risk.
- **When a concept is too complex, split it into more prompts** rather than overloading one
  generation.

## Higgsfield workflow awareness

- The workflow often already contains established references (characters, locations, props,
  wardrobe, logos, clubs, the single ball, bags, environment). Treat these as production
  references — reuse exact names, focus on how they are used/placed/moved/framed/lit and how
  Seedance should preserve them. Do not redesign known references.
- When an approved logo asset exists, reference or composite it rather than asking the model to
  generate detailed lettering from scratch.

## Ball-motion stability on Seedance

- When the single ball moves fast, choose camera movement and shutter/motion-blur behaviour that
  preserve the appearance of **one** ball. Never use effects that produce duplicated ball images.
- If clean fast-ball motion is unreliable, split the movement across shorter clips, or keep the
  ball partially out of frame and imply the flight with camera and reaction.

## Output settings to state explicitly

aspect ratio (e.g. 9:16 vertical for social, 16:9 for hero/landscape) · clip duration ·
playback speed · audio permission (see `references/back-nine-brand.md` → Audio) · resolution
intent (4K photoreal). Include these in the **OUTPUT SETTINGS** section.
