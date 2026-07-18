---
name: filter-local-distance
description: Apply Back Nine Vernon's geographic rules to job signals. Use for radius filtering from V1T 5B9, city estimates, coordinate distances, and default Kelowna or golf-course exclusions.
---

# Filter local distance

1. Use coordinates when supplied; otherwise use the documented city centroid estimate.
2. Default to a 40 km radius from V1T 5B9.
3. Exclude Kelowna and golf courses unless the operator explicitly overrides them.
4. Reject unknown locations by default and mark city-centroid decisions uncertain.
5. Keep the reason in the audit trail, not in the final TXT.

Input: normalized job plus `LocationSettings`.

Output: `LocationDecision` with acceptance, distance, uncertainty, city, and reason.
