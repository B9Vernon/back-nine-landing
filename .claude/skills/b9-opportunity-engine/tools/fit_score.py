#!/usr/bin/env python3
"""Commercial Fit Scorer — 0-100, hard gate at 65.

Replaces the old 1-10 "prioritize, don't eliminate" band. That rubric was
advisory, was never written down per prospect, and let weak candidates
through on the reasoning that any business might partner with anyone. V2
scores every prospect on seven weighted criteria and REJECTS below 65.

    audience_overlap      20   whose people are these, and do they fit B9
    revenue_potential     20   realistic bookings/memberships/ad spend
    proximity             15   ring distance from V1T 5B9
    two_way_value         15   what B9 returns, and odds of a reply
    timing                10   a verified reason to write now
    repeatability         10   one-off vs an annual or standing relationship
    contact_quality       10   how close the contact gets you to a decision,
                               NOT which channel it uses:
                                 9-10  named decision-maker, any channel
                                 7-8   direct line or branch-specific inbox
                                 6     main business line, or a role inbox
                                       (info@ and "the shop phone" are equal)
                                 4-5   generic web form, no human attached
                                 2-3   national or chain queue

Usage:
    # score one prospect
    python3 tools/fit_score.py --name "Coldstream Truck Parts" \
        --audience 15 --revenue 14 --proximity 15 --value 12 \
        --timing 5 --repeat 8 --contact 7

    # score a batch from TSV on stdin:
    # name<TAB>audience<TAB>revenue<TAB>proximity<TAB>value<TAB>timing<TAB>repeat<TAB>contact
    python3 tools/fit_score.py --batch scores.tsv

Exit code is 1 if any scored prospect falls below the threshold, so a run
cannot quietly ship one.
"""

import argparse
import sys

CRITERIA = (
    ('audience_overlap', 'audience', 20),
    ('revenue_potential', 'revenue', 20),
    ('proximity', 'proximity', 15),
    ('two_way_value', 'value', 15),
    ('timing', 'timing', 10),
    ('repeatability', 'repeat', 10),
    ('contact_quality', 'contact', 10),
)

THRESHOLD = 65

# Proximity is the one criterion that is mechanical rather than judged, so
# it is derived from the ring to stop it being inflated to hit a total.
RING_POINTS = (
    (1, 15), (3, 14), (5, 12), (10, 10), (20, 7), (30, 5), (40, 3), (50, 1),
)


def proximity_points(km):
    for limit, pts in RING_POINTS:
        if km <= limit:
            return pts
    return 0


def score(values):
    total = 0
    detail = []
    for field, _flag, weight in CRITERIA:
        v = values.get(field, 0)
        if not 0 <= v <= weight:
            raise ValueError(f'{field}={v} out of range 0..{weight}')
        total += v
        detail.append(f'{field} {v}/{weight}')
    return total, detail


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--name')
    ap.add_argument('--batch', help='TSV file, or - for stdin')
    ap.add_argument('--km', type=float,
                    help='road distance in km; derives the proximity score')
    ap.add_argument('--threshold', type=int, default=THRESHOLD)
    for field, flag, weight in CRITERIA:
        ap.add_argument(f'--{flag}', type=int, default=0,
                        help=f'{field}, 0..{weight}')
    args = ap.parse_args()

    rows = []
    if args.batch:
        fh = sys.stdin if args.batch == '-' else open(args.batch, encoding='utf-8')
        for line in fh:
            if not line.strip() or line.startswith('#'):
                continue
            parts = line.rstrip('\n').split('\t')
            name, nums = parts[0], [int(x) for x in parts[1:8]]
            rows.append((name, dict(zip((c[0] for c in CRITERIA), nums))))
    elif args.name:
        vals = {field: getattr(args, flag) for field, flag, _ in CRITERIA}
        if args.km is not None:
            vals['proximity'] = proximity_points(args.km)
        rows.append((args.name, vals))
    else:
        ap.error('give --name or --batch')

    failed = 0
    for name, vals in rows:
        total, detail = score(vals)
        verdict = 'PASS' if total >= args.threshold else 'REJECT'
        if verdict == 'REJECT':
            failed += 1
        print(f'{verdict:6} {total:3}/100  {name}')
        print(f'              {", ".join(detail)}')

    if failed:
        print(f'\n{failed} prospect(s) below {args.threshold} — '
              f'send to the rejection ledger and replace. Do not inflate a '
              f'score to reach a count.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
