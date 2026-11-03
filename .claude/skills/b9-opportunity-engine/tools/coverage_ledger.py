#!/usr/bin/env python3
"""Coverage ledger — "nothing else found" has to be proven, not asserted.

Run 13 reported Vernon as "getting genuinely thin" on the strength of one
harvest method. Neil's answer was that he drives past hundreds of unlogged
businesses daily, and run 14 proved him right: sweeping directories instead
of category searches returned 7-of-7 fresh in auto parts, 3-of-3 in medical
supply, 4-of-4 in pawnbrokers.

So an underfilled run may no longer end with a sentence. It ends with this
ledger: which rings were completed, which categories and sources were
worked inside them, how many organizations were examined, and what was
rejected and why. `--audit` refuses to pass when a run delivered fewer
prospects than asked without that evidence.

Usage:
    python3 tools/coverage_ledger.py --run run-15 --start
    python3 tools/coverage_ledger.py --run run-15 --ring 0-1km \
        --source members.downtownvernon.com --category "auto parts" \
        --examined 14 --kept 6 --dup 8
    python3 tools/coverage_ledger.py --run run-15 --reject "Kelowna Golf|outside geography"
    python3 tools/coverage_ledger.py --run run-15 --report
    python3 tools/coverage_ledger.py --run run-15 --audit --asked 20 --delivered 14
"""

import argparse
import json
import os
import sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DIR = os.path.join(HERE, '..', 'state', 'coverage')

RINGS = ('0-1km', '1-3km', '3-5km', '5-10km', '10-20km', '20-30km',
         '30-40km', '40-50km')


def path_for(run, directory):
    os.makedirs(directory, exist_ok=True)
    return os.path.join(directory, f'{run}.json')


def load(run, directory):
    p = path_for(run, directory)
    if os.path.exists(p):
        with open(p, encoding='utf-8') as fh:
            return json.load(fh)
    return {'run': run, 'started': str(date.today()), 'passes': [],
            'rejections': []}


def save(data, run, directory):
    with open(path_for(run, directory), 'w', encoding='utf-8') as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write('\n')


def totals(data):
    ex = sum(p['examined'] for p in data['passes'])
    kept = sum(p['kept'] for p in data['passes'])
    dup = sum(p['dup'] for p in data['passes'])
    return ex, kept, dup


def report(data):
    ex, kept, dup = totals(data)
    rings = [r for r in RINGS if any(p['ring'] == r for p in data['passes'])]
    cats = sorted({p['category'] for p in data['passes'] if p['category']})
    srcs = sorted({p['source'] for p in data['passes'] if p['source']})
    print(f"\nCoverage — {data['run']} (opened {data['started']})\n")
    print(f'  rings worked      {", ".join(rings) or "none"}')
    print(f'  sources swept     {len(srcs)} — {", ".join(srcs) or "none"}')
    print(f'  categories        {len(cats)} — {", ".join(cats) or "none"}')
    print(f'  organizations     {ex} examined, {kept} kept, {dup} duplicate')
    if data['rejections']:
        print(f"\n  rejection ledger ({len(data['rejections'])}):")
        by_reason = {}
        for r in data['rejections']:
            by_reason.setdefault(r['reason'], []).append(r['name'])
        for reason, names in sorted(by_reason.items()):
            print(f'    {reason} ({len(names)}): ' + ', '.join(names[:6])
                  + (' …' if len(names) > 6 else ''))
    print()
    return ex, kept, dup, rings, cats, srcs


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--run', required=True)
    ap.add_argument('--dir', default=DEFAULT_DIR)
    ap.add_argument('--start', action='store_true')
    ap.add_argument('--ring', choices=RINGS)
    ap.add_argument('--source', default='')
    ap.add_argument('--category', default='')
    ap.add_argument('--examined', type=int, default=0)
    ap.add_argument('--kept', type=int, default=0)
    ap.add_argument('--dup', type=int, default=0)
    ap.add_argument('--reject', action='append', default=[],
                    metavar='NAME|REASON')
    ap.add_argument('--report', action='store_true')
    ap.add_argument('--audit', action='store_true',
                    help='gate an underfilled run; needs --asked and --delivered')
    ap.add_argument('--asked', type=int)
    ap.add_argument('--delivered', type=int)
    args = ap.parse_args()

    data = load(args.run, args.dir)

    if args.ring:
        data['passes'].append({
            'ring': args.ring, 'source': args.source,
            'category': args.category, 'examined': args.examined,
            'kept': args.kept, 'dup': args.dup, 'date': str(date.today()),
        })
    for spec in args.reject:
        name, _, reason = spec.partition('|')
        data['rejections'].append({'name': name.strip(),
                                   'reason': (reason or 'unspecified').strip()})
    if args.ring or args.reject or args.start:
        save(data, args.run, args.dir)

    if args.report or args.audit:
        ex, kept, dup, rings, cats, srcs = report(data)

    if args.audit:
        if args.asked is None or args.delivered is None:
            ap.error('--audit needs --asked and --delivered')
        if args.delivered >= args.asked:
            print(f'Run is full ({args.delivered}/{args.asked}) — no audit required.')
            return 0
        problems = []
        if not rings:
            problems.append('no ring was recorded')
        elif rings[0] != RINGS[0]:
            problems.append(f'closest ring {RINGS[0]} was never worked '
                            f'(first recorded: {rings[0]})')
        if len(srcs) < 3:
            problems.append(f'only {len(srcs)} source type(s) swept — the ladder '
                            f'needs at least 3 before "nothing else found" holds')
        if len(cats) < 5:
            problems.append(f'only {len(cats)} categor(y/ies) worked — rotate '
                            f'more before reporting the area exhausted')
        if ex < args.asked * 5:
            problems.append(f'only {ex} organizations examined for {args.asked} '
                            f'asked — that is not an exhausted search')
        if not data['rejections']:
            problems.append('rejection ledger is empty — every dropped '
                            'candidate needs a recorded reason')
        if problems:
            print(f'AUDIT FAILED — delivered {args.delivered} of {args.asked} '
                  f'and cannot justify stopping:')
            for p in problems:
                print(f'  - {p}')
            print('\nKeep searching. An underfilled run needs a complete ring, '
                  'source, category and query audit before it can be reported.')
            return 1
        print(f'AUDIT PASSED — delivered {args.delivered} of {args.asked}, '
              f'with evidence for stopping.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
