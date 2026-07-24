# B9 Static Ad Intelligence & Creative Command Centre — Skill

A reusable Claude Skill that turns a single command into a research-led, conversion-focused
**static advertising engine** for **Back Nine Indoor Golf Vernon**. It studies current winning
ad patterns, local demand, search behaviour, and visual trends, then designs premium,
photorealistic, high-converting one-page social ads (and optional two- or three-page carousels).
It connects to Higgsfield only *after* Neil approves the selected creative and estimated
production approach.

## What it does
- Researches live ad intelligence, cross-industry patterns, Google demand, and Vernon-local timing.
- Selects the strongest audience, format, emotional trigger, and CTA from research rather than
  asking Neil to decide.
- Runs an internal creative tournament and delivers only the number of finished ads requested.
- Prioritizes real Back Nine photography over generated imagery, and keeps critical text
  (headlines, prices, dates, CTAs, URLs) as a controlled design layer.
- Presents a concise approval card and gates all credit-consuming Higgsfield production behind
  Neil's approval.

## Structure
```
b9-static-ad-intelligence-command-centre/
└── SKILL.md   # entry point: role, activation rules, formats, reusable skills, QC, output format
```

## Activation
The skill activates on direct commands such as:
- `BUILD B9 STATIC AD` (optionally with a constraint, e.g. `— sell summer memberships`)
- `BUILD 3 B9 STATIC ADS`, `BUILD B9 MEMBERSHIP AD`, `BUILD B9 LEAGUE AD`,
  `BUILD B9 TOURNAMENT AD`, `BUILD B9 WOMEN'S GOLF AD`, `BUILD B9 CORPORATE AD`,
  `BUILD B9 2-PAGE AD`, `BUILD B9 3-PAGE AD`, `BUILD B9 CROSS-PROMOTION AD`
- `RESEARCH B9 AD OPPORTUNITIES`, `ANALYZE B9 AD PERFORMANCE`, `UPDATE B9 AD MEMORY`

It does not run in the background, scan continuously, or spend Higgsfield credits automatically.

## Install / use
- **Claude Code (project):** already at
  `.claude/skills/b9-static-ad-intelligence-command-centre/` — available in this repo
  automatically. Run `/b9-static-ad-intelligence-command-centre` or issue any activation command.
- **Claude Code (personal, all projects):** copy the
  `b9-static-ad-intelligence-command-centre/` folder into `~/.claude/skills/`.
- **Claude.ai / Claude Desktop (Capabilities → Skills):** zip the
  `b9-static-ad-intelligence-command-centre/` folder and upload it as a custom Skill.
