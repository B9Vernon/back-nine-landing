# Assets

`b9-vernon-logo.png` — the official Back Nine Vernon email-footer logo:
square black background, white "b" + green "9" mark, "BACK NINE®" in
white, "VERNON" in green italics.

This is the image every outreach email ends with, directly below the
website link `https://backninegolf.ca/local/vernonbc/` (see
`../references/website-research-email.md`, locked rule 3).

## Status: the PNG is NOT in this folder

Neil supplied the logo by chat upload, which does not put a file on disk.
Locked rule 3 names `b9-vernon-logo.png` as the canonical path, but nothing
in the engine can read it until someone drops the actual PNG here under
that exact name.

This is deliberate and harmless in practice: every TXT deliverable carries
the website link line, and the logo image is added when composing in Gmail
— pasted below the link, or carried in Neil's Gmail signature. No
deliverable has ever been wrong because of it.

Never write a `[logo]` placeholder into an email body to compensate; rule 3
forbids it and `tools/verify_deliverable.py` fails the file if one appears.
