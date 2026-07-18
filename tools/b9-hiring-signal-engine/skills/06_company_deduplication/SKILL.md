---
name: deduplicate-companies
description: Quietly merge duplicate B9 company leads. Use after ingestion or contact research to collapse matching names, domains, public emails, phones, addresses, or contact forms.
---

# Deduplicate companies

1. Treat exact domain, contact, phone, or normalized address matches as strong evidence.
2. Merge name variants only at the conservative similarity threshold.
3. Preserve the more complete record and relink all hiring signals.
4. Record the duplicate reason and canonical record in audit history.
5. Never expose deduplication scoring in the outreach TXT.

Input: company records and their linked jobs/contacts.

Output: merged count and remaining canonical company count.
