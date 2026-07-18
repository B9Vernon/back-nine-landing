# Cinematic Prompt Architect — Skill

A reusable Claude Skill that turns rough ideas, scene notes, or existing prompts into
production-ready cinematic video prompts optimized for **Seedance through Higgsfield**, tailored
to **Back Nine Golf Vernon**. It decides clip structure automatically, writes one independent open
prompt per clip in a token-efficient default mode, preserves characters/locations/props/branding,
locks generated identity and facility geometry to attached reference images, enforces the
absolute one-golf-ball rule and visible club-to-ball impact rule, manages a reusable asset
portfolio, and only invokes paid Higgsfield generation when explicitly authorized.

## Structure
```
cinematic-prompt-architect/
├── SKILL.md                     # entry point: role, defaults, workflow, output format
├── README.md                    # this file
├── references/                  # deep guidance (loaded as needed)
│   ├── single-golf-ball-protocol.md
│   ├── club-ball-impact.md      # mandatory visible-impact rule for hitting scenes
│   ├── reference-image-fidelity.md  # mandatory identity + facility geometry lock
│   ├── prompt-structure.md      # the 35-section framework + priority-section guidance
│   ├── clip-structure-and-timing.md
│   ├── continuity-locks.md
│   ├── distortion-prevention.md
│   ├── generation-reliability.md  # positive-first prompting, AVOID-line budget, club integrity, start frames
│   ├── seedance-higgsfield.md
│   ├── higgsfield-generation-authority.md  # when generation may be triggered, and how
│   ├── token-efficient-production-mode.md  # default compact-output behaviour
│   ├── camera-language.md
│   ├── back-nine-brand.md
│   └── output-modes.md          # Modes A–N
├── templates/                   # copy-and-fill scaffolds
│   ├── clip-prompt-template.md
│   ├── character-master-sheet.md
│   ├── location-master-sheet.md
│   ├── prop-master-sheet.md
│   └── single-golf-ball-master-sheet.md
├── checklists/
│   ├── pre-output-qc.md
│   ├── single-ball-verification.md
│   ├── club-ball-impact-verification.md  # run before every hitting-scene output
│   ├── reference-fidelity-verification.md  # run whenever image references are attached
│   └── generation-review.md     # run after every Higgsfield generation
└── assets/
    └── asset-portfolio-registry.md
```

## Install / use
- **Claude Code (project):** already at `.claude/skills/cinematic-prompt-architect/` — available in
  this repo automatically. Run `/cinematic-prompt-architect` or just describe a video concept.
- **Claude Code (personal, all projects):** copy the `cinematic-prompt-architect/` folder into
  `~/.claude/skills/`.
- **Claude.ai / Claude Desktop (Capabilities → Skills):** zip the `cinematic-prompt-architect/`
  folder and upload it as a custom Skill.

The skill activates when you give a video concept, an existing prompt to improve, a request for a
Seedance/Higgsfield prompt or a social/reel/ad video, or a request for a character/location/prop/
golf-ball master sheet.
