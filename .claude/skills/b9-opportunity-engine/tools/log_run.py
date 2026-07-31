#!/usr/bin/env python3
"""Append a finished deliverable to the outreach log with a proper run tag.

Doing this by hand produced a real defect: runs 6, 7 and 8 all wrote the
placeholder category "Local business" for every entry (600 lines and
counting), which makes the log useless for answering "who have we already
approached in this category?". This tool requires a real category or infers
one from the email, and refuses to write the placeholder.

Usage:
    python3 tools/log_run.py "#9-B9-Partnerships.txt" --run run-9
    python3 tools/log_run.py FILE --run run-9 --date 2026-08-01 --dry-run
"""

import argparse
import datetime as dt
import os
import subprocess
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import load_entries, normalize, load_log  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')

# Ordered most-specific first; first hit wins. Matched against the business
# NAME and subject line only — see infer_category().
CATEGORY_HINTS = [
    ('Dental/ortho', r'\bdental|dentist|orthodont'),
    ('Veterinary', r'\bveterinar|animal (?:hospital|care)'),
    ('Childcare', r'\bdaycare|day care|child care|childcare|preschool|montessori'),
    ('Tattoo/piercing', r'\btattoo|piercing|adornment'),
    ('Salon/barber', r'\bsalon|barber|hair\b|nails?\b|esthetic|lash|brow'),
    ('Spa/wellness', r'\bspa\b|wellness|laser|skin\b|beauty'),
    ('Physio/chiro/massage', r'\bphysio|chiro|massage|\brmt\b|rehab'),
    ('Counselling', r'\bcounsell|counsel|therapy|psycholog|clinical therapy'),
    ('Medical clinic', r'\bclinic|physician|urgent care|pharmac|optometr|'
                       r'audiolog|hearing|medical|health unit|primary care'),
    ('School/training', r'\bschool|academy|tutor|training|lessons|learning|'
                        r'college|music studio|dance\b'),
    ('Arts/culture', r'\bmuseum|gallery|archives|theatre|performing arts|jazz'),
    ('Home furnishing', r'\bblinds?\b|interiors?\b|window covering|drapery|'
                        r'upholster|furniture|cabinetry|flooring|mattress'),
    ('Bakery/sweets', r'\bbakery|bakehouse|bake house|pastry|cake|donut|doughnut|'
                      r'chocolat|confection|creamery|ice cream'),
    ('Restaurant/cafe', r'\brestaurant|cafe|café|bistro|pizz|sushi|grill|eatery|'
                        r'taverna|kitchen|diner|coffee|roaster|deli\b|food truck|'
                        r'catering|caterer|cuisine|steakhouse|eats\b|dining'),
    ('Pub/bar', r'\bpub\b|\bbar\b|tavern|brewer|brewing|cider|winery|'
                r'distiller|meader|\blounge\b|night club|nightclub'),
    ('Liquor retail', r'liquor|cold beer|wine (?:store|cellar)|spirits'),
    ('Grocery/market', r'\bgrocer|market|superstore|foods\b|superette'),
    ('Hotel/motel/B&B', r'\bhotel|motel|inn\b|lodge|bed (?:and|&) breakfast|b&b|guesthouse'),
    ('Campground/RV', r'\bcampground|rv park|resort|marina'),
    ('Auto sales', r'\bmotors\b|dealership|\bkia\b|toyota|honda|chrysler|hyundai|nissan'),
    ('Auto service', r'\bauto|tire|car wash|detail|towing|muffler|collision|mechanic'),
    ('Trades — electrical', r'\belectric'),
    ('Trades — plumbing/HVAC', r'\bplumb|hvac|air conditioning|heating'),
    ('Trades — roofing', r'\broofing|roofer'),
    ('Trades — building', r'\bcontract|construct|renovat|builder|homes\b|carpent|cabinet'),
    ('Trades — excavation', r'\bexcavat|bobcat|paving|asphalt|gravel|concrete'),
    ('Manufacturing', r'\bindustries|manufactur|fabricat|machin|welding|'
                      r'packaging|equipment\b'),
    ('Landscaping/garden', r'\blandscap|garden|nursery|greenhouse|orchard|farm\b'),
    ('Cleaning/janitorial', r'\bjanitor|cleaning|maid|window cleaning'),
    ('Moving/storage', r'\bmoving|storage|mini storage'),
    ('Real estate', r'\brealt|re/max|century 21|property management|strata'),
    ('Legal', r'\blaw\b|lawyer|llp\b|notary|legal'),
    ('Accounting/finance', r'\baccount|bookkeep|tax\b|mortgage|credit union|insurance|financial'),
    ('Retail', r'\bboutique|clothing|clothier|shop\b|store\b|mercantile|'
               r'gifts?\b|apparel|wear\b|outfitter|consignment|thrift'),
    ('Fitness', r'\bgym\b|fitness|crossfit|yoga|pilates'),
    ('Non-profit/society', r'\bsociety|foundation|association|rotary|legion|'
                           r'club\b|resource centre|friendship centre|chamber of commerce'),
    ('Events/catering', r'\bcatering|caterer|event|rentals\b|party'),
    ('Professional services', r'\bconsult|marketing|design|print|sign|photograph|IT\b|computer'),
]


def infer_category(name, subject, body=None):
    """Infer from the business NAME and subject only — never the body.

    The body is mostly Back Nine's own boilerplate ("the 24/7 indoor golf
    lounge here in Vernon", "your clinicians"), which matched Pub/bar and
    Medical clinic for nearly every entry when the body was included.
    """
    blob = f'{name} {subject}'.lower()
    for label, pat in CATEGORY_HINTS:
        if re.search(pat, blob, re.I):
            return label
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--run', required=True, help='run tag, e.g. run-9')
    ap.add_argument('--date', default=dt.date.today().isoformat())
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--status', default='email created')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    entries = [e for e in load_entries(args.file) if e.get('num')]
    if not entries:
        print('No parseable entries found — check the file format.', file=sys.stderr)
        return 1

    logged = {normalize(row['name']) for row in load_log(args.log)} \
        if os.path.exists(args.log) else set()

    rows, uncategorized, already = [], [], []
    for e in entries:
        if normalize(e['name']) in logged:
            already.append(e['name'])
            continue
        cat = infer_category(e['name'], e['subject'], e['body'])
        if cat is None:
            cat = 'Uncategorized'
            uncategorized.append(e['name'])
        rows.append(f"- [{args.status}] {e['name']} | {cat} | {e['to']} | "
                    f"{args.date} | {args.run}")

    if already:
        print(f'REFUSING to log {len(already)} business(es) already in the log:',
              file=sys.stderr)
        for name in already[:8]:
            print(f'  - {name}', file=sys.stderr)
        print('Fix the deliverable first (swap them out), then re-run.',
              file=sys.stderr)
        return 1

    if uncategorized:
        print(f'{len(uncategorized)} entries could not be categorized and will '
              f'be logged as "Uncategorized":', file=sys.stderr)
        for name in uncategorized[:8]:
            print(f'  - {name}', file=sys.stderr)
        print('Add a pattern to CATEGORY_HINTS if a whole category is missing.\n',
              file=sys.stderr)

    if args.dry_run:
        print('\n'.join(rows[:5]))
        print(f'... ({len(rows)} rows, dry run — nothing written)')
        return 0

    with open(args.log, 'a', encoding='utf-8') as fh:
        fh.write('\n'.join(rows) + '\n')
    print(f'Appended {len(rows)} rows to {os.path.relpath(args.log)} as {args.run}.')

    # Keep the derived V2 ledger in step with the log. The duplicate guard
    # reads the ledger, so a stale one would let the next run re-contact
    # everything this run just wrote.
    migrate = os.path.join(HERE, 'migrate_ledger.py')
    if os.path.exists(migrate):
        rc = subprocess.run([sys.executable, migrate, '--log', args.log],
                            capture_output=True, text=True)
        sys.stdout.write(rc.stdout)
        if rc.returncode:
            print('WARNING: ledger refresh failed — run '
                  'tools/migrate_ledger.py by hand before the next scan.',
                  file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
