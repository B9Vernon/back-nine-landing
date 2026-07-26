#!/usr/bin/env python3
"""Build batched SMS number lists from the outreach log and prospect files.

Keeps local North Okanagan area codes only and carries each business name
alongside its number, so a reply is traceable to a prospect.

Usage:
    python3 tools/extract_phones.py --out B9-SMS-Invitation-Lists.txt
    python3 tools/extract_phones.py --also "#8-B9-Partnerships.txt" --batch 50
    python3 tools/extract_phones.py --check-message message.txt
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import load_log, load_entries  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'state', 'outreach-log.md')

LOCAL_AREA_CODES = {'250', '778', '236'}
PHONE = re.compile(r'(?:\+?1[-. ]?)?\(?([2-9]\d{2})\)?[-. ]?(\d{3})[-. ](\d{4})\b')


def check_message(path):
    """Fail loudly on any character that would force Unicode SMS encoding."""
    msg = open(path, encoding='utf-8').read().strip()
    bad = sorted({c for c in msg if ord(c) > 127})
    if bad:
        print('NOT GSM-7 SAFE. These characters force Unicode encoding, '
              'cutting segments from 153 chars to 67:', file=sys.stderr)
        for c in bad:
            print(f'  {c!r}  (U+{ord(c):04X})', file=sys.stderr)
        print('\nReplace em dashes with "-" and curly quotes with straight ones.',
              file=sys.stderr)
        return 1
    segs = -(-len(msg) // 153) if len(msg) > 160 else 1
    print(f'GSM-7 safe. {len(msg)} characters, sends as {segs} segment(s).')
    for required, why in (('vernon@backninegolf.ca', 'reply path'),
                          ('STOP', 'opt-out (required by anti-spam law)'),
                          ('Back Nine', 'sender identification')):
        if required not in msg:
            print(f'  WARNING: message is missing {required!r} — {why}',
                  file=sys.stderr)
    return 0


def collect(log_path, extra_files):
    found, order = {}, []

    def take(name, blob):
        for m in PHONE.finditer(blob):
            num = m.group(1) + m.group(2) + m.group(3)
            if m.group(1) in LOCAL_AREA_CODES and num not in found:
                found[num] = name
                order.append(num)

    for row in load_log(log_path):
        take(row['name'], row['contact'])
    for path in extra_files:
        for e in load_entries(path):
            if e.get('num'):
                take(e['name'], e['to'])
    return [(n, found[n]) for n in order]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--log', default=DEFAULT_LOG)
    ap.add_argument('--also', nargs='*', default=[], help='extra prospect TXT files')
    ap.add_argument('--batch', type=int, default=50)
    ap.add_argument('--out')
    ap.add_argument('--check-message', metavar='FILE',
                    help='verify an SMS message is GSM-7 safe, then exit')
    args = ap.parse_args()

    if args.check_message:
        return check_message(args.check_message)

    pairs = collect(args.log, args.also)
    batches = [pairs[i:i + args.batch] for i in range(0, len(pairs), args.batch)]

    lines = [f'{len(pairs)} local numbers (250/778/236) in {len(batches)} lists', '']
    for i, batch in enumerate(batches, 1):
        lines += ['=' * 70, f'LIST {i} - {len(batch)} numbers', '=' * 70, '']
        lines += [f'{j:2}. {n[:3]}-{n[3:6]}-{n[6:]}    {b}'
                  for j, (n, b) in enumerate(batch, 1)]
        lines.append('')

    text = '\n'.join(lines) + '\n'
    if args.out:
        open(args.out, 'w', encoding='utf-8').write(text)
        print(f'Wrote {args.out} — {len(pairs)} numbers, {len(batches)} lists.')
        print('Add the approved message from references/sms-outreach.md at the top.')
    else:
        print(text)
    return 0


if __name__ == '__main__':
    sys.exit(main())
