#!/usr/bin/env python3
"""Screen a large batch of harvested candidate names against the ledger at once.

This is the tool that was missing, and its absence is why runs 12-16
collapsed from hundreds of prospects to two or three.

Discovery has two costs. Harvesting a NAME is cheap — one web search names
a dozen businesses on a street. Verifying an EMAIL is expensive — it takes
a dedicated search per business, and since run 12 every deliverable entry
needs one. Runs 12-16 spent that expensive step on candidates that turned
out to already be in the log, so the run ran out of room long before it ran
out of Vernon.

Screening first inverts that. Harvest three hundred names, drop the ones
already contacted for free, and spend the search budget only on businesses
that can actually ship. The engine stops "running out of ideas" at twenty
because it stops paying for the same businesses twice.

Input is one candidate per line, from a file or stdin. Blank lines and
lines starting with # are ignored. Optional pipe-separated fields let a
candidate carry what the harvest already knew:

    Bean Scene Coffee House
    Nature's Fare Markets | 3400 30th Ave | naturesfare.com
    Ratio Coffee + Pastry | | ratiocoffee.ca | info@ratiocoffee.ca

    name | address | website | contact

Usage:
    python3 tools/screen_candidates.py candidates.txt
    python3 tools/screen_candidates.py candidates.txt --new-only > fresh.txt
    cat names.txt | python3 tools/screen_candidates.py -
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import identity, duplicate_reason, load_ledger  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LEDGER = os.path.join(HERE, '..', 'state', 'ledger.jsonl')


def parse_line(line):
    parts = [p.strip() for p in line.split('|')]
    while len(parts) < 4:
        parts.append('')
    return parts[0], parts[1], parts[2], parts[3]


def build_index(ledger_path):
    """Index the ledger once, by every axis, so screening is O(1) per name.

    Every row counts, including the 89 carrying a rejection_reason. The
    ledger is derived from outreach-log.md, which records outreach and
    nothing else, so a rejection marker there reads "duplicate of X — do not
    contact again" on a row whose status is already "email created". Treating
    those rows as available nearly put Cambium Cider Co into run 17 on the
    exact address run 7 had already used.
    """
    prior = list(load_ledger(ledger_path))
    idx = {a: {} for a in ('email', 'domain', 'email_domain', 'phone',
                           'address_key')}
    by_core, by_name = {}, {}
    for rec in prior:
        by_core.setdefault(rec['core_key'], []).append(rec)
        by_name.setdefault(rec['name_key'], []).append(rec)
        for axis in idx:
            if rec.get(axis):
                idx[axis].setdefault(rec[axis], rec)
    return prior, idx, by_core, by_name


def screen(cand, idx, by_core, by_name):
    """Return the duplicate reason for a candidate, or None if it is new."""
    pool = list(by_core.get(cand['core_key'], []))
    pool += by_name.get(cand['name_key'], [])
    for axis in idx:
        if cand.get(axis) and cand[axis] in idx[axis]:
            pool.append(idx[axis][cand[axis]])
    for rec in pool:
        why = duplicate_reason(cand, rec)
        if why:
            return why
    return None


def main():
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file', help='candidate list, or - for stdin')
    ap.add_argument('--ledger', default=DEFAULT_LEDGER)
    ap.add_argument('--new-only', action='store_true',
                    help='print only the fresh names, nothing else — this is '
                         'the list worth spending email searches on')
    args = ap.parse_args()

    fh = sys.stdin if args.file == '-' else open(args.file, encoding='utf-8')
    lines = [ln.strip() for ln in fh
             if ln.strip() and not ln.lstrip().startswith('#')]

    prior, idx, by_core, by_name = build_index(args.ledger)

    new, dupes = [], []
    seen = {}
    for line in lines:
        name, address, website, contact = parse_line(line)
        if not name:
            continue
        cand = identity(name, contact=contact, website=website,
                        address=address)
        # A harvest that sweeps both a street and a category will name the
        # same business twice; that is not a ledger duplicate, so it is
        # collapsed here rather than reported as one.
        if cand['name_key'] in seen:
            continue
        seen[cand['name_key']] = True
        why = screen(cand, idx, by_core, by_name)
        (dupes if why else new).append((name, why, line))

    if args.new_only:
        for name, _why, line in new:
            print(line)
        print(f'# {len(new)} new of {len(lines)} screened against '
              f'{len(prior)} contacted', file=sys.stderr)
        return 0

    print(f'\nScreened {len(lines)} candidates against {len(prior)} '
          f'businesses already contacted\n')
    if new:
        print(f'NEW — worth an email search ({len(new)}):')
        for name, _why, _line in new:
            print(f'  + {name}')
    if dupes:
        print(f'\nALREADY CONTACTED ({len(dupes)}):')
        for name, why, _line in dupes:
            print(f'  - {name}  ({why})')
    print(f'\n{len(new)} new, {len(dupes)} already contacted, '
          f'{len(lines) - len(new) - len(dupes)} collapsed as repeats '
          f'within this batch.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
