#!/usr/bin/env python3
"""Check candidate business names against the outreach log BEFORE writing emails.

Run this the moment you have a candidate list — not at verification time.
Runs 6, 7 and 8 each caught duplicates only at the final check and had to
hand-swap finished entries (1, then 5, then 3). Checking up front costs
nothing and removes that entire class of rework.

Usage:
    # names on stdin, one per line
    cat candidates.txt | python3 tools/dedup_check.py

    # or from a file
    python3 tools/dedup_check.py candidates.txt

    # only print the usable ones, ready to pipe onward
    python3 tools/dedup_check.py candidates.txt --ok-only

Output columns:
    ok    — not in the log, not repeated earlier in this input; use it
    DUP   — already in the outreach log; do not contact again
    REP   — repeated earlier in this same input
    NEAR  — not an exact duplicate, but collapses onto a logged business
            once legal suffixes and town names are stripped. REVIEW BY HAND:
            "Kal Tire Lumby" vs "Kal Tire Vernon" are different branches and
            both are fair game; "Vernon Roofing" vs "Vernon Roofing Inc" is
            one business.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import normalize, normalize_strict, towns_in, load_log  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('candidates', nargs='?', help='file of names, one per line (default: stdin)')
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--ok-only', action='store_true', help='print only usable names, no labels')
    args = ap.parse_args()

    logged, logged_strict = {}, {}
    for row in load_log(args.log):
        logged.setdefault(normalize(row['name']), row['name'])
        # keep every logged name that shares a stripped core, so town
        # qualifiers can be compared rather than silently collapsed
        logged_strict.setdefault(normalize_strict(row['name']), []).append(row['name'])

    src = open(args.candidates, encoding='utf-8') if args.candidates else sys.stdin
    names = [ln.strip() for ln in src if ln.strip()]

    seen, counts = set(), {'ok': 0, 'DUP': 0, 'REP': 0, 'NEAR': 0}
    for name in names:
        key, skey = normalize(name), normalize_strict(name)
        if key in logged:
            verdict, note = 'DUP', f'logged as "{logged[key]}"'
        elif key in seen:
            verdict, note = 'REP', 'repeated in this input'
        elif skey and skey in logged_strict:
            # Same core name once legal suffixes and towns are stripped.
            # A DUP unless the town qualifiers actually conflict, which
            # would mean two different branches.
            mine = towns_in(name)
            hits = [n for n in logged_strict[skey]
                    if not (mine and towns_in(n) and not (mine & towns_in(n)))]
            if hits:
                verdict, note = 'DUP', f'same business as "{hits[0]}"'
            else:
                verdict = 'NEAR'
                note = (f'shares a name with "{logged_strict[skey][0]}" but a '
                        f'different town — likely a separate branch, confirm')
                seen.add(key)
        else:
            verdict, note = 'ok', ''
            seen.add(key)
        counts[verdict] += 1

        if args.ok_only:
            if verdict == 'ok':
                print(name)
        else:
            print(f'{verdict:5} {name}' + (f'   [{note}]' if note else ''))

    if not args.ok_only:
        print(f'\n{len(names)} checked against {len(logged)} logged businesses — '
              f"{counts['ok']} ok, {counts['DUP']} duplicate, "
              f"{counts['REP']} repeated, {counts['NEAR']} need review",
              file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
