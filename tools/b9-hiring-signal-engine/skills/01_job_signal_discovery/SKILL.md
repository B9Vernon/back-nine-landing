---
name: discover-job-signals
description: Find and prioritize local hiring activity for Back Nine Vernon. Use for filtering normalized jobs by hiring relevance, source, category, and proximity to V1T 5B9.
---

# Discover job signals

1. Ingest evidence through the source-ingestion skill; do not scrape restricted sources.
2. Classify the job title and posting text.
3. Apply the location policy and enabled source/category filters.
4. Order accepted signals outward from V1T 5B9 and flag approximate distances.
5. Return normalized signal records; keep scores and audit details internal.

Input: normalized jobs plus radius, categories, sources, and exclusion overrides.

Output: accepted/rejected decisions and a distance-prioritized signal list.

Use `index.ts`; persist decisions through `src/discovery.ts`.
