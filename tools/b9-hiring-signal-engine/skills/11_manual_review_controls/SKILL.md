---
name: review-b9-leads-manually
description: Gate B9 lead generation behind explicit human review. Use to list accepted companies, approve selected records, reject unsuitable records, and control no-email exceptions.
---

# Review leads manually

1. List the company, hiring signals, location, category, contact, and current review state.
2. Require an explicit company selector or `--all` approval command.
3. Skip companies without email/contact form unless `--include-no-email` is explicit.
4. Record approval/rejection and reason in the audit log.
5. Keep generation, export, and all external communication as separate steps.

Input: operator approval or rejection decision.

Output: persisted review status and counts.
