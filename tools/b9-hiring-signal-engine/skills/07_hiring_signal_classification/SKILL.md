---
name: classify-hiring-signals
description: Classify job postings into Back Nine-relevant roles and growth signals. Use to identify sales, hospitality, operations, seasonal, culture, turnover, and multi-posting context.
---

# Classify hiring signals

1. Classify title plus posting text into one supported business category.
2. Detect growth, turnover, seasonal, sales, hospitality, operations, and culture signals.
3. Mark multiple active postings as a growth signal at company aggregation time.
4. Reject `other` by default because it lacks a clear B9 angle.
5. Pass classifications to offer matching; keep them out of final TXT.

Input: job title and public posting text.

Output: `JobCategory` and unique `SignalType[]`.
