---
name: audit-b9-source-evidence
description: Record source provenance, outcomes, uncertainty, rejections, merges, review, generation, and export events for the B9 engine. Use throughout every pipeline stage and for separate JSONL audit exports.
---

# Audit source evidence

1. Log the action, entity, public source, outcome, timestamp, and structured detail.
2. Record job source, company website, contact evidence, uncertainty, dedupe, and rejection reasons.
3. Store audit events in SQLite and optionally export separate JSONL.
4. Never include audit fields in the final outreach TXT.
5. Do not log secrets, credentials, cookies, private data, or full scraped page bodies.

Input: a pipeline event and minimal evidence metadata.

Output: append-only SQLite audit record or separate JSONL export.
