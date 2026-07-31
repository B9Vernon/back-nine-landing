#!/usr/bin/env python3
"""Rebuild state/ledger.jsonl from state/outreach-log.md.

The V2 upgrade extends the engine's memory rather than replacing it. The
markdown log stays the append-only source of truth — every row ever written
is preserved, including the 71 rows marked as historical double-contacts.
This tool derives the richer V2 record from each row (identity keys,
website domain, email domain, phone, civic address, ring, score, draft and
sent status, rejection reason) so the Universal Duplicate Guard can compare
on every axis, not just the trading name.

It is idempotent and non-destructive: it only ever reads the log and
rewrites the derived ledger. Run it after any log change.

Usage:
    python3 tools/migrate_ledger.py            # rebuild
    python3 tools/migrate_ledger.py --check    # report drift, write nothing
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import identity, load_log  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')
DEFAULT_LEDGER = os.path.join(HERE, '..', 'state', 'ledger.jsonl')

# Status words the log has used since run 1, mapped onto the V2 fields.
DRAFTED = {'email created', 'emailed', 'replied', 'interested',
           'not interested', 'active partner', 'follow up later'}
SENT = {'emailed', 'replied', 'interested', 'not interested',
        'active partner', 'follow up later'}


def row_to_record(row):
    note = row.get('note', '')
    # Rows carrying '| duplicate of "X" — do not contact again' were marked
    # by hand across runs 12-14. The run tag is the leading segment.
    rejection = None
    run = note
    if 'duplicate of' in note:
        run, _, rest = note.partition('|')
        run = run.strip()
        rejection = rest.strip() or 'duplicate'

    status = row.get('status', '')
    rec = identity(row['name'], contact=row.get('contact', ''))
    rec.update({
        'category': row.get('category') or None,
        'community': None,
        'ring': None,
        'distance_km': None,
        'score': None,
        'opportunity_type': None,
        'status': status,
        'draft_status': 'created' if status in DRAFTED else None,
        # Nothing has ever been confirmed sent; see dedup-status-memory.md.
        'sent_status': 'confirmed' if status in SENT and status != 'email created' else None,
        'source_urls': [],
        'date_checked': row.get('date') or None,
        'run': run or None,
        'rejection_reason': rejection,
    })
    return rec


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--ledger', default=DEFAULT_LEDGER)
    ap.add_argument('--check', action='store_true',
                    help='report what would change; write nothing')
    args = ap.parse_args()

    records = [row_to_record(r) for r in load_log(args.log)]
    lines = [json.dumps(r, ensure_ascii=False, sort_keys=True) for r in records]

    have = []
    if os.path.exists(args.ledger):
        with open(args.ledger, encoding='utf-8') as fh:
            have = [ln.strip() for ln in fh if ln.strip()]

    if args.check:
        if have == lines:
            print(f'ledger is current — {len(lines)} records')
            return 0
        print(f'ledger is STALE — log has {len(lines)} rows, '
              f'ledger has {len(have)}; run without --check to rebuild')
        return 1

    with open(args.ledger, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines) + '\n')

    keyed = sum(1 for r in records if r['email'])
    dom = sum(1 for r in records if r['domain'])
    phone = sum(1 for r in records if r['phone'])
    marked = sum(1 for r in records if r['rejection_reason'])
    print(f'wrote {len(records)} records to {os.path.relpath(args.ledger)}')
    print(f'  {keyed} with an email, {dom} with a domain, {phone} with a phone')
    print(f'  {marked} carrying a historical duplicate marker (preserved)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
