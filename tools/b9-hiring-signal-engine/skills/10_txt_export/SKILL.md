---
name: export-b9-email-txt
description: Export manually approved, generated B9 outreach into the exact downloadable TXT format. Use only when the operator explicitly requests final TXT generation.
---

# Export TXT

1. Require approved companies and pre-generated email content.
2. Exclude missing-contact records unless `--include-no-email` is explicit.
3. Emit only `COMPANY:`, `EMAIL:`, `EMAIL SUBJECT:`, and `EMAIL BODY:` blocks.
4. Write `b9-hiring-signal-emails-YYYY-MM-DD.txt` under `data/output/`.
5. Never add scores, research notes, Markdown tables, logs, or source URLs.
6. Never send the resulting content anywhere.

Input: approved generated emails and an explicit export command.

Output: one local TXT path and export count.
