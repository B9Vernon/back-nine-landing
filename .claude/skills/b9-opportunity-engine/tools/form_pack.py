#!/usr/bin/env python3
"""Build a paste-ready contact-form submission pack from old deliverables.

Runs 2-8 and 11 researched ~1,375 businesses whose only public contact was a
web form or a phone number. Each already has a custom message written for it,
but there was never a way to actually send them — this environment cannot
submit a form (WebFetch is 403 for every host, curl cannot connect, and the
bundled Chromium gets ERR_TUNNEL_CONNECTION_FAILED on every domain including
example.com). So those messages have been sitting unused.

This turns them into something a person can act on: one block per business
with the form URL, the field values to type, and the message body ready to
paste into the form's message box.

Two things are fixed on the way through:

  * the introduction is converted from the superseded runs 1-14 wording
    ("Hey X team, I'm Neil.") to the current locked form ("Hi X team," /
    "My name is Neil.");
  * every message is re-checked against locked rule 2b (nothing reads as
    free). Failures are reported and written to a separate REVIEW file
    rather than into the pack.

Businesses since marked as duplicates, or since reached by email, are
dropped — the ledger is the authority.

Usage:
    python3 tools/form_pack.py FILE [FILE ...] --out DIR
    python3 tools/form_pack.py "#2-B9-Partnerships.txt" --out packs --run run-2
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b9lib import (LINK, load_entries, identity, duplicate_reason,  # noqa: E402
                   load_ledger, email_of)

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LEDGER = os.path.join(HERE, '..', 'state', 'ledger.jsonl')

SENDER = {
    'Name': 'Neil',
    'Business': 'Back Nine Golf Vernon',
    'Email': 'vernon@backninegolf.ca',
    'Website': 'https://backninegolf.ca/local/vernonbc/',
}

# Locked rule 2b — same patterns the verifier uses.
FREEBIE = [
    (r"\bon me\b|\bon us\b", '"on me/on us"'),
    (r"(?:I'd|we'd)\s+(?:also\s+|really\s+)?(?:like|love)\s+to\s+"
     r"(?:host|offer|put|treat|bring)\b", '"I\'d like to host/offer"'),
    (r"\bdeserves?\b[^.]{0,40}\b(?:night|evening|afternoon|out)\b", '"deserves a night"'),
    (r"\bno strings\b|\bmy shout\b|\bon the house\b", '"no strings"'),
    (r"would (?:also )?be welcome", '"would be welcome"'),
    (r"as a thank[- ]you", '"as a thank-you"'),
    (r"no catch|nothing attached to it", '"no catch"'),
    (r"the bays are yours", '"the bays are yours"'),
    (r"\bfor nothing\b", '"for nothing"'),
    # Spot-checking the first pack found "your crew has earned a wind-up
    # night on our simulators" — reads as a gift, matched nothing above.
    (r"\b(?:has|have|had|'ve)\s+earned\b", '"has earned"'),
    (r"\bearned\b[^.]{0,40}\b(?:night|evening|round|session|wind-up)\b", '"earned a night"'),
    (r"\b(?:treat|reward)\s+(?:your|their|the)\s+(?:team|crew|staff)\b", '"treat your crew"'),
    (r"\bcourtesy\b|\bgratis\b|\bcomped?\b|\bwe.{0,6}ll cover\b", '"comped/courtesy"'),
    (r"\bnight (?:out )?on (?:me|us)\b", '"night on us"'),
    (r"\bfree\b(?! (?:to|graze))|complimentary|no charge|our treat", '"free"'),
]

URL_RE = re.compile(r'(?:https?://)?((?:[a-z0-9\-]+\.)+[a-z]{2,}(?:/[^\s,;]*)?)', re.I)


def form_url(to_line):
    """Pull a usable contact URL out of the old free-text To: line."""
    cleaned = re.sub(r'\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b', ' ', to_line)
    m = URL_RE.search(cleaned)
    if not m:
        return None
    url = m.group(1).rstrip('.,);')
    return url if '.' in url else None      # group(1) already excludes scheme


def modernise(body, name):
    """Superseded inline intro -> current greeting line + exact sentence."""
    m = re.match(r"Hey (.+?), I'm Neil\.\s*(.*)$", body, re.S)
    if m:
        who, rest = m.group(1).strip(), m.group(2).strip()
        return f'Hi {who},\n\nMy name is Neil. {rest}'
    if re.match(r'Hi .+?,\n\nMy name is Neil\.', body, re.S):
        return body
    # Unrecognised shape: prepend a correct opener rather than guess.
    return f'Hi {name} team,\n\nMy name is Neil. {body.strip()}'


LOCKED_TV_CLAIM = ('24/7 advertising seen by hundreds of people a week')

# Runs 2-8 predate locked rule 2a and routinely say things like "run Brixx
# on the TVs across our facility" with no paid framing, and "we host your
# team on the simulators" with no booking framing. Neither pattern is in
# FREEBIE, so both need their own check or the pack ships known-bad copy.
UNPAID_TV = re.compile(
    r'\b(?:run|feature|put|showcase|display|promote)\b[^.]{0,60}\b'
    r'(?:on|across|throughout)\b[^.]{0,25}\bTVs?\b|\bTVs?\b[^.]{0,40}'
    r'\b(?:free|no cost|no charge)\b', re.I)
UNPAID_HOST = re.compile(
    r"\bwe(?:'ll| will|)\s+host\b|\bhost (?:your|their) (?:team|staff|crew|"
    r"clients|group)\b|\bbring (?:your|their) (?:team|staff|crew) in\b", re.I)


def freebie_hits(text):
    out = []
    for pat, label in FREEBIE:
        if re.search(pat, text, re.I):
            out.append(label)
    if re.search(r'\bTVs?\b', text) and LOCKED_TV_CLAIM not in text:
        if UNPAID_TV.search(text):
            out.append('rule 2a: TV mention with no paid framing')
        else:
            out.append('rule 2a: TV mention missing the locked claim')
    if UNPAID_HOST.search(text):
        out.append('rule 2b: implies we host them at no cost')
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='+')
    ap.add_argument('--out', default='form-packs')
    ap.add_argument('--ledger', default=DEFAULT_LEDGER)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    ledger = [r for r in load_ledger(args.ledger)]
    marked = {r['name_key'] for r in ledger if r.get('rejection_reason')}
    emailed = {r['name_key'] for r in ledger if r.get('email')}

    grand = {'form': 0, 'phone_only': 0, 'skip_dup': 0, 'skip_email': 0,
             'review': 0, 'written': 0}

    for path in args.files:
        tag = os.path.basename(path).split('-')[0].lstrip('#')
        kept, review, phone_only = [], [], []
        for e in load_entries(path):
            if not e.get('num'):
                continue
            name, to, body = e['name'], e['to'], e['body']
            if email_of(to):
                continue                      # already reachable by email
            grand['form'] += 1
            ident = identity(name)
            if ident['name_key'] in marked:
                grand['skip_dup'] += 1
                continue
            if ident['name_key'] in emailed:
                grand['skip_email'] += 1
                continue
            url = form_url(to)
            msg = modernise(body, name)
            hits = freebie_hits(msg)
            row = (name, to, url, e['subject'], msg, hits)
            if hits:
                review.append(row)
                grand['review'] += 1
            elif url:
                kept.append(row)
            else:
                phone_only.append(row)
                grand['phone_only'] += 1

        if kept:
            out = [f"""B9 CONTACT-FORM SUBMISSION PACK — from run {tag}
{len(kept)} businesses whose only public contact is a web form.

These messages were written during run {tag} and never sent, because this
environment cannot submit a web form. Each block below is paste-ready.

FIELDS TO TYPE, every form:
  Name      {SENDER['Name']}
  Business  {SENDER['Business']}
  Email     {SENDER['Email']}
  Website   {SENDER['Website']}
  Subject   (given per business below, if the form has a subject field)
  Message   (the block under MESSAGE — paste as-is)

THE OPENER IS CURRENT. THE BODY IS NOT — READ BEFORE YOU PASTE.

The introduction has been converted to the current locked form. The rest of
each message was written in run {tag}, before locked rules 2a (paid TV
framing) and 2b (nothing reads as free) existed. The automated checks catch
the known bad phrasings, but spot-checking still finds copy like "plus a
crew night on the simulators" and "a thank-you golf offer" that reads as a
giveaway and that no pattern reliably catches.

So: skim each block before submitting, and delete any clause that implies
Back Nine is giving something away. The business names, form URLs and
duplicate-checking are solid; the persuasion copy needs your eye.

===============================================================================
"""]
            for i, (name, to, url, subj, msg, _h) in enumerate(kept, 1):
                out.append(
                    f"{i}. {name}\n"
                    f"FORM: https://{url}\n"
                    f"SUBJECT: {subj}\n"
                    f"MESSAGE:\n{msg}\n\n{LINK}\n"
                    f"{'-' * 79}")
            p = os.path.join(args.out, f'FORM-PACK-run{tag}.txt')
            open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
            grand['written'] += len(kept)
            print(f'  {os.path.basename(p)}: {len(kept)} form submissions')

        if review:
            p = os.path.join(args.out, f'REVIEW-run{tag}.txt')
            with open(p, 'w', encoding='utf-8') as fh:
                fh.write(f'{len(review)} messages from run {tag} fail locked '
                         f'rule 2b (they read as free) and need a rewrite '
                         f'before submission.\n\n')
                for name, to, url, subj, msg, hits in review:
                    fh.write(f'--- {name}\n    flags: {", ".join(hits)}\n'
                             f'    form: {url}\n{msg}\n\n')
            print(f'  REVIEW-run{tag}.txt: {len(review)} need a 2b rewrite')

    print(f"\n{grand['form']} form/phone-only entries scanned")
    print(f"  {grand['skip_dup']} skipped — since marked duplicate")
    print(f"  {grand['skip_email']} skipped — since reached by email")
    print(f"  {grand['phone_only']} phone-only, no form URL (cannot be submitted)")
    print(f"  {grand['review']} held back for a rule-2b rewrite")
    print(f"  {grand['written']} written into paste-ready packs")
    return 0


if __name__ == '__main__':
    sys.exit(main())
