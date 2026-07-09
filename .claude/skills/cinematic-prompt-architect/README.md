# Cinematic Prompt Architect — Skill

A reusable Claude Skill that turns rough ideas, scene notes, or existing prompts into
production-ready cinematic video prompts optimized for **Seedance through Higgsfield**, tailored
to **Back Nine Golf Vernon**. It decides clip structure automatically, writes one independent open
prompt per clip, preserves characters/locations/props/branding, enforces the absolute
one-golf-ball rule, manages a reusable asset portfolio, and only invokes paid Higgsfield
generation when explicitly authorized.

## Structure
```
cinematic-prompt-architect/
├── SKILL.md                     # entry point: role, defaults, workflow, output format
├── README.md                    # this file
├── references/                  # deep guidance (loaded as needed)
│   ├── single-golf-ball-protocol.md
│   ├── prompt-structure.md      # the 35-section framework + priority-section guidance
│   ├── clip-structure-and-timing.md
│   ├── continuity-locks.md
│   ├── distortion-prevention.md
│   ├── seedance-higgsfield.md
│   ├── higgsfield-generation-authority.md  # when generation may be triggered, and how
│   ├── camera-language.md
│   ├── back-nine-brand.md
│   └── output-modes.md          # Modes A–M
├── templates/                   # copy-and-fill scaffolds
│   ├── clip-prompt-template.md
│   ├── character-master-sheet.md
│   ├── location-master-sheet.md
│   ├── prop-master-sheet.md
│   └── single-golf-ball-master-sheet.md
├── checklists/
│   ├── pre-output-qc.md
│   ├── single-ball-verification.md
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
