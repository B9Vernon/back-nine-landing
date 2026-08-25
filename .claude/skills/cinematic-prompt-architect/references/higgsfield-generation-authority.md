# Higgsfield Generation Authority

## Default behaviour: plan and write only

By default, build the production plan and write the Seedance/Higgsfield prompts **without**
invoking the Higgsfield connector or starting any paid generation. Writing, improving,
diagnosing, or handing over a prompt never by itself authorizes generation.

## What counts as explicit authorization

Use the Higgsfield connector only when the user explicitly asks to **generate, render, run, or
create** the video (or a specific clip) — e.g. "generate this," "render clip 2," "run it,"
"create the video now," "send it to Higgsfield." A request to write, improve, fix, or compact a
prompt is planning, not authorization.

## Generation protocol (once authorized)

- Generate **one clip at a time** by default. Generate a batch only when the user explicitly
  requests a batch.
- Before triggering each generation, state: the **model** (default **Seedance** unless the user
  names another), the **duration**, the **aspect ratio**, and the exact **assets/references**
  being used.
- Do not launch extra variations, alternate takes, or re-rolls without explicit approval.
- Inspect every result before continuing to the next clip or step — never chain generations
  unattended.
- Reject and flag any output containing: distortion, continuity failures (identity, wardrobe,
  location, prop, or club drift), incorrect branding, broken/bent/melted/reversed golf clubs, or
  more than one golf ball anywhere in the result (including reflections, screens, HUD/tracking
  graphics, and motion trails). Run `checklists/generation-review.md` on every result.
- On rejection: diagnose which lock or section failed, tighten that wording (compact, specific —
  don't bloat the prompt), and regenerate only the failed clip. Never continue with a failed
  result.

## Scope

This governs when and how the Higgsfield connector is invoked. It does not change how prompts
are written — see `references/prompt-structure.md` for prompt construction and
`references/seedance-higgsfield.md` for Seedance-specific writing rules.
