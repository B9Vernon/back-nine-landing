# Token-Efficient Production Mode (default)

Apply this automatically unless the user explicitly requests maximum detail (Mode N,
`references/output-modes.md`).

## Behaviour

- Create the complete video plan and all independent clip prompts in **one response**.
- Use only sections that materially improve generation
  (`references/prompt-structure.md` → Priority sections).
- Keep every clip fully independent and ready for Seedance through Higgsfield — never combine
  clips and never rely on "continue from the previous clip."
- Use established asset references by name instead of repeatedly describing approved assets in
  full (`assets/asset-portfolio-registry.md`).
- Use compact continuity, distortion, branding, golf-club, and single-golf-ball locks — a short
  restated rule, never the full protocol text.
- Never paste full reference documents or protocols into generation prompts.
- Do not repeat the sequence/header overview inside every clip — state it once at the top of the
  response, then list each clip's prompt.
- Do not include explanations, diagnosis, alternatives, or commentary unless requested.
- Preserve all essential opening-frame, action, camera, lighting, physics, transition,
  final-frame, visible-impact, and single-golf-ball instructions — never cut these for brevity.
- Remove wording that does not affect the rendered result, but never sacrifice generation
  reliability for brevity.

## Opting into maximum detail

When the user explicitly asks for maximum detail, exhaustive prompts, or Mode N
(`references/output-modes.md`), use as many of the 35 sections as help and write them in full.
Token-efficient mode resumes automatically on the next request unless the user says otherwise.
