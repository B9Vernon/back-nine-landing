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
import re
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
    # The run tag is always the leading segment of the note. Everything after
    # it is a hand-appended marker: '| duplicate of "X" — do not contact
    # again' (runs 12-14), '| follow-up DATE' (run 22 on), and from run 25
    # '| replied DATE | interested' / '| declined DATE', read from Gmail.
    # Before run 25 only duplicate rows were split, so a follow-up marker
    # silently became part of the run tag ("batch-200 | follow-up ...").
    rejection = None
    run, _, rest = note.partition('|')
    run, rest = run.strip(), rest.strip()
    if 'duplicate of' in rest:
        rejection = rest or 'duplicate'
    replied = re.search(r'\breplied (\d{4}-\d\d-\d\d)', rest)
    # Run 26: '| sent DATE (Gmail)' records a send confirmed in Neil's Sent
    # folder with no reply yet. The log's status word is "email created" for
    # every row, so this marker is the only proof an email actually went out.
    sent_marker = re.search(r'\bsent (\d{4}-\d\d-\d\d)', rest)
    declined = re.search(r'\bdeclined (\d{4}-\d\d-\d\d)', rest)
    reply_status = None
    if declined:
        reply_status = f'declined {declined.group(1)}'
    elif replied:
        word = re.search(r'\breplied [\d-]+ \| (\w[\w-]*)', rest)
        reply_status = f'{word.group(1) if word else "replied"} {replied.group(1)}'

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
        # A reply on file proves the email went out, whatever the status word.
        'sent_status': ('confirmed' if (status in SENT and status != 'email created')
                        or replied or sent_marker else None),
        'source_urls': [],
        'date_checked': row.get('date') or None,
        'run': run or None,
        'rejection_reason': rejection,
        'reply_status': reply_status,
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
