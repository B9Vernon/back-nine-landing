#!/usr/bin/env python3
"""Universal Duplicate Guard — check candidates before writing anything.

Governing rule: **one business, one initial outreach email.** A different
employee, a second address, a rebrand or an alternate spelling at the same
business does not make it new.

Every candidate is compared against `state/ledger.jsonl` (derived from
`state/outreach-log.md`, so all 1,856 rows of history apply) on every axis:

    trading name        aliases and spelling variations
    stripped core name  parent company and location names
    website domain      email address
    email domain        phone number
    street address

Name-only matching missed 18 real double-contacts across runs 2-13 — same
domain, same phone, same email, different trading name. Those are now
marked in the log and this tool catches the class.

Usage:
    # names only, one per line (stdin or file) — the common case
    cat candidates.txt | python3 tools/dedup_check.py

    # richer candidate: pipe-delimited name|contact|website|address
    printf 'Edge Apparel|sales@edgeimprints.com||\\n' | python3 tools/dedup_check.py

    # single candidate on the command line
    python3 tools/dedup_check.py --name "Edge Apparel" --email sales@edgeimprints.com

    python3 tools/dedup_check.py candidates.txt --ok-only

Output columns:
    ok      not in the ledger and not repeated in this input; use it
    DUP     already contacted — exclude unless Neil asks for a follow-up
    REP     repeated earlier in this same input
    NEAR    collapses onto a logged business only after town qualifiers are
            stripped. REVIEW BY HAND: "Kal Tire Lumby" vs "Kal Tire Vernon"
            are different branches and both are fair game.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import (identity, duplicate_reason, load_ledger, load_log,  # noqa: E402
                   normalize, normalize_strict, towns_in)

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LEDGER = os.path.join(HERE, '..', 'state', 'ledger.jsonl')
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')


def load_records(ledger, log):
    """Ledger first; fall back to the markdown log if it hasn't been built."""
    recs = list(load_ledger(ledger))
    if recs:
        return recs, 'ledger'
    return [identity(r['name'], contact=r.get('contact', ''))
            for r in load_log(log)], 'log'


def parse_candidate(line):
    """'Name' or 'Name|contact|website|address'."""
    parts = [p.strip() for p in line.split('|')]
    parts += [''] * (4 - len(parts))
    name, contact, website, address = parts[:4]
    return identity(name, contact=contact, website=website, address=address)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('candidates', nargs='?',
                    help='file of candidates, one per line (default: stdin)')
    ap.add_argument('--ledger', default=DEFAULT_LEDGER)
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--name', help='check one candidate given on the command line')
    ap.add_argument('--email', default='')
    ap.add_argument('--website', default='')
    ap.add_argument('--address', default='')
    ap.add_argument('--ok-only', action='store_true',
                    help='print only usable names, no labels')
    args = ap.parse_args()

    recs, source = load_records(args.ledger, args.log)
    live = [r for r in recs if not r.get('rejection_reason')]

    if args.name:
        cands = [identity(args.name, contact=args.email,
                          website=args.website, address=args.address)]
    else:
        src = open(args.candidates, encoding='utf-8') if args.candidates else sys.stdin
        cands = [parse_candidate(ln) for ln in src if ln.strip()]

    # Index by core key so the common name comparison stays O(1); the other
    # axes are cheap dict lookups built once.
    by_axis = {a: {} for a in ('email', 'domain', 'email_domain', 'phone',
                               'address_key')}
    by_core = {}
    by_name = {}
    for r in live:
        by_name.setdefault(r['name_key'], r)
        by_core.setdefault(r['core_key'], []).append(r)
        for axis in by_axis:
            if r.get(axis):
                by_axis[axis].setdefault(r[axis], r)

    seen, counts = {}, {'ok': 0, 'DUP': 0, 'REP': 0, 'NEAR': 0}
    for c in cands:
        name = c['name']
        verdict = note = None

        if c['name_key'] in seen:
            verdict, note = 'REP', 'repeated in this input'
        else:
            # Cheap exact/near name pass, then every other axis.
            hit = by_name.get(c['name_key'])
            pool = list(by_core.get(c['core_key'], []))
            for axis in by_axis:
                if c.get(axis) and c[axis] in by_axis[axis]:
                    pool.append(by_axis[axis][c[axis]])
            if hit:
                pool.insert(0, hit)
            for r in pool:
                why = duplicate_reason(c, r)
                if why:
                    verdict, note = 'DUP', why
                    break
            if verdict is None and c['core_key'] and c['core_key'] in by_core:
                other = by_core[c['core_key']][0]
                verdict = 'NEAR'
                note = (f'shares a name with "{other["name"]}" but a different '
                        f'town — likely a separate branch, confirm')

        if verdict is None:
            verdict, note = 'ok', ''
        if verdict in ('ok', 'NEAR'):
            seen[c['name_key']] = c
        counts[verdict] += 1

        if args.ok_only:
            if verdict == 'ok':
                print(name)
        else:
            print(f'{verdict:5} {name}' + (f'   [{note}]' if note else ''))

    if not args.ok_only:
        print(f'\n{len(cands)} checked against {len(live)} live businesses '
              f'({source}, {len(recs) - len(live)} already marked duplicate) — '
              f"{counts['ok']} ok, {counts['DUP']} duplicate, "
              f"{counts['REP']} repeated, {counts['NEAR']} need review",
              file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
